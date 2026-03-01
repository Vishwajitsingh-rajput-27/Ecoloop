/**
 * User Routes — MongoDB/Mongoose
 */

import { Router, Response } from "express";
import { User } from "../models/User.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { formatUser } from "./auth.js";
import { formatProduct } from "./products.js";

const router = Router();

/** GET /api/users/me */
router.get("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found." });
    return res.json({ success: true, data: formatUser(user) });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/** PUT /api/users/me */
router.put("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, avatar } = req.body;
    if (name && name.trim().length < 2)
      return res.status(400).json({ success: false, error: "Name must be at least 2 characters." });

    const update: any = {};
    if (name) update.name = name.trim();
    if (phone !== undefined) update.phone = phone;
    if (avatar !== undefined) update.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.userId, update, { new: true });
    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    return res.json({ success: true, message: "Profile updated.", data: formatUser(user) });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/** POST /api/users/me/addresses */
router.post("/me/addresses", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { label, fullName, phone, line1, line2, city, state, pincode, isDefault } = req.body;

    if (!fullName || !phone || !line1 || !city || !state || !pincode)
      return res.status(400).json({ success: false, error: "All address fields are required." });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    // Clear other defaults if needed
    if (isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    user.addresses.push({
      _id: new Date().getTime().toString(),
      label: label || "Home",
      fullName,
      phone,
      line1,
      line2,
      city,
      state,
      pincode,
      isDefault: !!isDefault,
    });

    await user.save();
    return res.status(201).json({ success: true, message: "Address added.", data: formatUser(user) });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/** DELETE /api/users/me/addresses/:id */
router.delete("/me/addresses/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    const idx = user.addresses.findIndex((a) => a._id.toString() === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, error: "Address not found." });

    user.addresses.splice(idx, 1);
    await user.save();

    return res.json({ success: true, message: "Address deleted.", data: formatUser(user) });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/** POST /api/users/me/wishlist/:productId — Toggle */
router.post("/me/wishlist/:productId", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    const inWishlist = user.wishlist.includes(productId);
    if (inWishlist) {
      user.wishlist = user.wishlist.filter((id) => id !== productId);
    } else {
      user.wishlist.push(productId);
    }
    await user.save();

    return res.json({ success: true, data: { wishlist: user.wishlist, added: !inWishlist } });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/** GET /api/users/me/wishlist */
router.get("/me/wishlist", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select("wishlist").lean();
    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    const products = await Product.find({
      _id: { $in: user.wishlist },
      isActive: true,
    }).lean();

    return res.json({ success: true, data: products.map(formatProduct) });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/** PUT /api/users/me/notifications/:id/read */
router.put("/me/notifications/:id/read", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await User.findOneAndUpdate(
      { _id: req.userId, "notifications._id": req.params.id },
      { $set: { "notifications.$.read": true } }
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/** PUT /api/users/me/notifications/read-all */
router.put("/me/notifications/read-all", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await User.findByIdAndUpdate(req.userId, {
      $set: { "notifications.$[].read": true },
    });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/** GET /api/users/:id/stats — Seller stats */
router.get("/:id/stats", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [totalListings, activeListings, totalViewsResult, avgRatingResult] = await Promise.all([
      Product.countDocuments({ sellerId: id }),
      Product.countDocuments({ sellerId: id, isActive: true }),
      Product.aggregate([
        { $match: { sellerId: id } },
        { $group: { _id: null, total: { $sum: "$views" } } },
      ]),
      Product.aggregate([
        { $match: { sellerId: id } },
        { $group: { _id: null, avg: { $avg: "$rating" } } },
      ]),
    ]);

    const totalViews = totalViewsResult[0]?.total || 0;
    const averageRating = parseFloat((avgRatingResult[0]?.avg || 0).toFixed(1));

    // Orders for this seller
    const sellerOrders = await Order.find({ "items.sellerId": id }).lean();
    const totalOrders = sellerOrders.length;
    const pendingOrders = sellerOrders.filter((o) =>
      ["Placed", "Confirmed"].includes(o.status)
    ).length;
    const totalRevenue = sellerOrders
      .filter((o) => !["Cancelled", "Refunded"].includes(o.status))
      .reduce((sum, o) => sum + o.total, 0);

    return res.json({
      success: true,
      data: {
        totalListings,
        activeListings,
        totalOrders,
        pendingOrders,
        totalRevenue,
        monthlyRevenue: Math.round(totalRevenue * 0.3),
        totalViews,
        averageRating,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

export default router;
