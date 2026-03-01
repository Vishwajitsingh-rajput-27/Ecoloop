/**
 * Auth Routes — MongoDB/Mongoose
 * POST /api/auth/register
 * POST /api/auth/login
 * GET  /api/auth/me
 */

import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Wallet } from "../models/Wallet.js";
import { generateToken, requireAuth, AuthRequest } from "../middleware/auth.js";

const router = Router();

/** Format user document for API response */
export function formatUser(user: any): object {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
    sellerRating: user.sellerRating,
    totalSales: user.totalSales,
    addresses: (user.addresses || []).map((a: any) => ({
      id: a._id.toString(),
      label: a.label,
      fullName: a.fullName,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      state: a.state,
      pincode: a.pincode,
      isDefault: a.isDefault,
    })),
    wishlist: user.wishlist || [],
    recentlyViewed: user.recentlyViewed || [],
    notifications: (user.notifications || []).map((n: any) => ({
      id: n._id.toString(),
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      timestamp: n.createdAt,
      link: n.link,
    })),
  };
}

/**
 * POST /api/auth/register
 */
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = "buyer" } = req.body;

    // Validation
    if (!name || name.trim().length < 2)
      return res.status(400).json({ success: false, error: "Name must be at least 2 characters." });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ success: false, error: "Invalid email address." });
    if (!password || password.length < 6)
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters." });
    if (!["buyer", "seller"].includes(role))
      return res.status(400).json({ success: false, error: "Invalid role. Must be buyer or seller." });

    // Check duplicate
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return res.status(409).json({ success: false, error: "An account with this email already exists." });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      notifications: [
        {
          type: "system",
          title: "Welcome to EcoLoop! 🎉",
          message: `Hi ${name.trim()}! Your account is ready. Start buying or selling e-waste today.`,
          read: false,
        },
      ],
    });

    // Create wallet with ₹500 welcome bonus
    await Wallet.create({ userId: user._id.toString(), balance: 500 });

    const token = generateToken(user._id.toString(), user.role);

    return res.status(201).json({
      success: true,
      message: "Account created successfully!",
      data: { token, user: formatUser(user) },
    });
  } catch (err: any) {
    console.error("Register error:", err);
    if (err.code === 11000)
      return res.status(409).json({ success: false, error: "An account with this email already exists." });
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/**
 * POST /api/auth/login
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, error: "Email and password are required." });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return res.status(401).json({ success: false, error: "Invalid email or password." });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return res.status(401).json({ success: false, error: "Invalid email or password." });

    const token = generateToken(user._id.toString(), user.role);

    return res.json({
      success: true,
      message: "Logged in successfully!",
      data: { token, user: formatUser(user) },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/**
 * GET /api/auth/me
 */
router.get("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user)
      return res.status(404).json({ success: false, error: "User not found." });

    return res.json({ success: true, data: formatUser(user) });
  } catch (err) {
    console.error("Get me error:", err);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

export default router;
