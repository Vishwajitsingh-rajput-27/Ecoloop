/**
 * Category Routes — MongoDB/Mongoose
 * GET /api/categories - Get all categories with product counts
 */

import { Router, Response, Request } from "express";
import { Category } from "../models/Category.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();

    return res.json({
      success: true,
      data: categories.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        description: c.description,
        productCount: c.productCount,
      })),
    });
  } catch (err) {
    console.error("Get categories error:", err);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

export default router;
