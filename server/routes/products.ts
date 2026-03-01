/**
 * Product Routes — MongoDB/Mongoose
 * GET    /api/products              - List/search products
 * GET    /api/products/suggestions  - Autocomplete
 * GET    /api/products/:id          - Single product
 * POST   /api/products              - Create (seller/admin)
 * PUT    /api/products/:id          - Update (owner/admin)
 * DELETE /api/products/:id          - Soft delete (owner/admin)
 */

import { Router, Response } from "express";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { User } from "../models/User.js";
import { requireAuth, optionalAuth, AuthRequest } from "../middleware/auth.js";

const router = Router();

/** Format a product document for API response */
export function formatProduct(p: any): object {
  return {
    id: p._id.toString(),
    title: p.title,
    description: p.description,
    brand: p.brand,
    categoryId: p.categoryId,
    categoryName: p.categoryName,
    condition: p.condition,
    age: p.age,
    purchaseYear: p.purchaseYear,
    price: p.price,
    originalPrice: p.originalPrice,
    quantity: p.quantity,
    location: p.location,
    sellerId: p.sellerId,
    sellerName: p.sellerName,
    sellerRating: p.sellerRating,
    rating: p.rating,
    reviewCount: p.reviewCount,
    views: p.views,
    ecoImpact: p.ecoImpact,
    tags: p.tags,
    specs: p.specs,
    images: p.images,
    isActive: p.isActive,
    createdAt: p.createdAt,
  };
}

/**
 * GET /api/products
 * Search with filters and pagination
 */
router.get("/", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      query = "",
      categoryId = "",
      condition = "",
      minPrice = "0",
      maxPrice = "999999",
      location = "",
      sortBy = "newest",
      page = "1",
      pageSize = "12",
      sellerId = "",
    } = req.query as Record<string, string>;

    // Build MongoDB filter
    const filter: any = { isActive: true };

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
      ];
    }

    if (categoryId) filter.categoryId = categoryId;
    if (condition) filter.condition = condition;
    if (sellerId) filter.sellerId = sellerId;

    filter.price = {
      $gte: Number(minPrice),
      $lte: Number(maxPrice),
    };

    if (location) {
      filter.$or = [
        ...(filter.$or || []),
        { "location.city": { $regex: location, $options: "i" } },
        { "location.state": { $regex: location, $options: "i" } },
      ];
    }

    // Sort
    let sort: any = { createdAt: -1 };
    if (sortBy === "price_asc") sort = { price: 1 };
    else if (sortBy === "price_desc") sort = { price: -1 };
    else if (sortBy === "rating") sort = { rating: -1 };
    else if (sortBy === "popular") sort = { views: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const pageSizeNum = Math.min(50, parseInt(pageSize) || 12);
    const skip = (pageNum - 1) * pageSizeNum;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(pageSizeNum).lean(),
      Product.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: products.map(formatProduct),
      meta: {
        total,
        page: pageNum,
        pageSize: pageSizeNum,
        totalPages: Math.ceil(total / pageSizeNum),
      },
    });
  } catch (err) {
    console.error("Get products error:", err);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/**
 * GET /api/products/suggestions
 */
router.get("/suggestions", async (req: AuthRequest, res: Response) => {
  try {
    const { q = "" } = req.query as { q: string };
    if (!q || q.length < 2) return res.json({ success: true, data: [] });

    const products = await Product.find(
      { isActive: true, title: { $regex: q, $options: "i" } },
      { title: 1 }
    )
      .limit(8)
      .lean();

    const suggestions = [...new Set(products.map((p) => p.title))];
    return res.json({ success: true, data: suggestions });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/**
 * GET /api/products/:id
 */
router.get("/:id", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product)
      return res.status(404).json({ success: false, error: "Product not found." });

    // Increment views
    await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // Track recently viewed
    if (req.userId) {
      await User.findByIdAndUpdate(req.userId, {
        $pull: { recentlyViewed: req.params.id },
      });
      await User.findByIdAndUpdate(req.userId, {
        $push: {
          recentlyViewed: {
            $each: [req.params.id],
            $position: 0,
            $slice: 10,
          },
        },
      });
    }

    return res.json({ success: true, data: formatProduct({ ...product, views: product.views + 1 }) });
  } catch (err) {
    console.error("Get product error:", err);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/**
 * POST /api/products
 */
router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.userRole !== "seller" && req.userRole !== "admin")
      return res.status(403).json({ success: false, error: "Only sellers can create listings." });

    const {
      title, description, brand, categoryId, condition, age, purchaseYear,
      price, originalPrice, quantity, locationCity, locationState,
      tags = [], specs = [], images = [],
      ecoImpact = { kgDiverted: 0, co2Saved: 0 },
    } = req.body;

    // Validation
    if (!title || title.trim().length < 5)
      return res.status(400).json({ success: false, error: "Title must be at least 5 characters." });
    if (!description || description.trim().length < 20)
      return res.status(400).json({ success: false, error: "Description must be at least 20 characters." });
    if (!price || price <= 0)
      return res.status(400).json({ success: false, error: "Price must be greater than 0." });
    if (!quantity || quantity < 1)
      return res.status(400).json({ success: false, error: "Quantity must be at least 1." });
    if (!categoryId)
      return res.status(400).json({ success: false, error: "Category is required." });
    if (!["New", "Like New", "Refurbished", "For Parts Only"].includes(condition))
      return res.status(400).json({ success: false, error: "Invalid condition." });

    // Validate category
    const category = await Category.findById(categoryId).lean();
    if (!category)
      return res.status(400).json({ success: false, error: "Invalid category." });

    // Get seller info
    const seller = await User.findById(req.userId).select("name sellerRating").lean();

    const product = await Product.create({
      title: title.trim(),
      description: description.trim(),
      brand: brand || "",
      categoryId,
      categoryName: category.name,
      condition,
      age: age || 0,
      purchaseYear: purchaseYear || new Date().getFullYear(),
      price,
      originalPrice: originalPrice || undefined,
      quantity,
      location: { city: locationCity || "", state: locationState || "" },
      sellerId: req.userId,
      sellerName: seller?.name || "",
      sellerRating: seller?.sellerRating || 0,
      ecoImpact: { kgDiverted: ecoImpact.kgDiverted || 0, co2Saved: ecoImpact.co2Saved || 0 },
      tags,
      specs,
      images,
    });

    // Update category product count
    await Category.findByIdAndUpdate(categoryId, { $inc: { productCount: 1 } });

    return res.status(201).json({
      success: true,
      message: "Product listed successfully!",
      data: formatProduct(product),
    });
  } catch (err) {
    console.error("Create product error:", err);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/**
 * PUT /api/products/:id
 */
router.put("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, error: "Product not found." });

    if (product.sellerId !== req.userId && req.userRole !== "admin")
      return res.status(403).json({ success: false, error: "You can only edit your own listings." });

    const {
      title, description, brand, price, originalPrice, quantity,
      locationCity, locationState, tags, specs, images, isActive, condition, age,
    } = req.body;

    if (title !== undefined) product.title = title.trim();
    if (description !== undefined) product.description = description.trim();
    if (brand !== undefined) product.brand = brand;
    if (price !== undefined) product.price = price;
    if (originalPrice !== undefined) product.originalPrice = originalPrice;
    if (quantity !== undefined) product.quantity = quantity;
    if (locationCity !== undefined) product.location.city = locationCity;
    if (locationState !== undefined) product.location.state = locationState;
    if (tags !== undefined) product.tags = tags;
    if (specs !== undefined) product.specs = specs;
    if (images !== undefined) product.images = images;
    if (isActive !== undefined) product.isActive = isActive;
    if (condition !== undefined) product.condition = condition;
    if (age !== undefined) product.age = age;

    await product.save();

    return res.json({ success: true, message: "Product updated.", data: formatProduct(product) });
  } catch (err) {
    console.error("Update product error:", err);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/**
 * DELETE /api/products/:id (soft delete)
 */
router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, error: "Product not found." });

    if (product.sellerId !== req.userId && req.userRole !== "admin")
      return res.status(403).json({ success: false, error: "You can only delete your own listings." });

    product.isActive = false;
    await product.save();

    return res.json({ success: true, message: "Product deleted successfully." });
  } catch (err) {
    console.error("Delete product error:", err);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

export default router;
