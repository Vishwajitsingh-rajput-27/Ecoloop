/**
 * Review Routes — MongoDB/Mongoose
 * GET  /api/reviews/:productId   - Get product reviews
 * POST /api/reviews              - Add review
 * PUT  /api/reviews/:id/helpful  - Increment helpful count
 */

import { Router, Response } from "express";
import { Review } from "../models/Review.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { User } from "../models/User.js";
import { requireAuth, optionalAuth, AuthRequest } from "../middleware/auth.js";

const router = Router();

/**
 * GET /api/reviews/:productId
 */
router.get("/:productId", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: reviews.map((r) => ({
        id: r._id.toString(),
        productId: r.productId,
        userId: r.userId,
        userName: r.userName,
        userAvatar: r.userAvatar,
        rating: r.rating,
        title: r.title,
        body: r.body,
        helpful: r.helpful,
        verified: r.verified,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/**
 * POST /api/reviews
 */
router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { productId, rating, title, body } = req.body;

    if (!productId) return res.status(400).json({ success: false, error: "Product ID is required." });
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ success: false, error: "Rating must be 1–5." });
    if (!title?.trim()) return res.status(400).json({ success: false, error: "Review title is required." });
    if (!body?.trim() || body.trim().length < 10)
      return res.status(400).json({ success: false, error: "Review must be at least 10 characters." });

    // Check duplicate
    const existing = await Review.findOne({ productId, userId: req.userId });
    if (existing)
      return res.status(409).json({ success: false, error: "You've already reviewed this product." });

    // Check if verified buyer (has delivered order with this product)
    const verifiedOrder = await Order.findOne({
      userId: req.userId,
      status: "Delivered",
      "items.productId": productId,
    });

    // Get user info
    const user = await User.findById(req.userId).select("name avatar").lean();

    const review = await Review.create({
      productId,
      userId: req.userId,
      userName: user?.name || "Anonymous",
      userAvatar: user?.avatar,
      rating,
      title: title.trim(),
      body: body.trim(),
      verified: !!verifiedOrder,
    });

    // Recalculate product average rating
    const stats = await Review.aggregate([
      { $match: { productId } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: parseFloat(stats[0].avg.toFixed(1)),
        reviewCount: stats[0].count,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Review submitted!",
      data: {
        id: review._id.toString(),
        productId: review.productId,
        userId: review.userId,
        userName: review.userName,
        userAvatar: review.userAvatar,
        rating: review.rating,
        title: review.title,
        body: review.body,
        helpful: review.helpful,
        verified: review.verified,
        createdAt: review.createdAt,
      },
    });
  } catch (err: any) {
    console.error("Add review error:", err);
    if (err.code === 11000)
      return res.status(409).json({ success: false, error: "You've already reviewed this product." });
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/**
 * PUT /api/reviews/:id/helpful
 */
router.put("/:id/helpful", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await Review.findByIdAndUpdate(req.params.id, { $inc: { helpful: 1 } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

export default router;
