/**
 * Admin Routes — MongoDB/Mongoose
 * GET  /api/admin/stats        - Dashboard stats
 * GET  /api/admin/users        - All users
 * PUT  /api/admin/users/:id    - Update user role
 * GET  /api/admin/products     - All products
 * GET  /api/admin/orders       - All orders
 */

import { Router, Response } from "express";
import { User } from "../models/User.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { Wallet, WalletTransaction } from "../models/Wallet.js";
import { Category } from "../models/Category.js";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth.js";
import { formatProduct } from "./products.js";
import { formatUser } from "./auth.js";

const router = Router();

// All admin routes require admin role
router.use(requireAuth, requireRole("admin"));

/**
 * GET /api/admin/stats
 * Platform-wide metrics for admin dashboard
 */
router.get("/stats", async (_req: AuthRequest, res: Response) => {
  try {
    // User stats
    const [totalUsers, buyers, sellers, admins] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "buyer" }),
      User.countDocuments({ role: "seller" }),
      User.countDocuments({ role: "admin" }),
    ]);

    // Product stats
    const [totalProducts, activeProducts] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
    ]);

    // Category breakdown
    const categoryStats = await Category.find().lean();
    const byCategory = categoryStats.map((c) => ({
      name: c.name,
      count: c.productCount,
    }));

    // Order stats
    const [
      totalOrders,
      placedOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "Placed" }),
      Order.countDocuments({ status: "Confirmed" }),
      Order.countDocuments({ status: "Shipped" }),
      Order.countDocuments({ status: "Delivered" }),
      Order.countDocuments({ status: "Cancelled" }),
    ]);

    // Total revenue (exclude cancelled/refunded)
    const revenueResult = await Order.aggregate([
      { $match: { status: { $nin: ["Cancelled", "Refunded"] } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Wallet stats
    const walletStats = await Wallet.aggregate([
      { $group: { _id: null, totalBalance: { $sum: "$balance" }, count: { $sum: 1 } } },
    ]);
    const totalBalance = walletStats[0]?.totalBalance || 0;
    const activeWallets = walletStats[0]?.count || 0;
    const totalTransactions = await WalletTransaction.countDocuments();

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email role avatar createdAt")
      .lean();

    return res.json({
      success: true,
      data: {
        users: { total: totalUsers, buyers, sellers, admins },
        products: {
          total: totalProducts,
          active: activeProducts,
          byCategory,
        },
        orders: {
          total: totalOrders,
          placed: placedOrders,
          confirmed: confirmedOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
          totalRevenue,
        },
        wallet: {
          totalBalance,
          totalTransactions,
          activeWallets,
        },
        recentOrders: recentOrders.map((o) => ({
          id: o._id.toString(),
          userId: o.userId,
          status: o.status,
          total: o.total,
          paymentMethod: o.paymentMethod,
          createdAt: o.createdAt,
          itemCount: o.items.length,
        })),
        recentUsers: recentUsers.map((u) => ({
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          role: u.role,
          avatar: u.avatar,
          createdAt: u.createdAt,
        })),
      },
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/**
 * GET /api/admin/users
 */
router.get("/users", async (_req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: users.map(formatUser) });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/**
 * PUT /api/admin/users/:id/role
 */
router.put("/users/:id/role", async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;
    if (!["buyer", "seller", "admin"].includes(role))
      return res.status(400).json({ success: false, error: "Invalid role." });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user)
      return res.status(404).json({ success: false, error: "User not found." });

    return res.json({
      success: true,
      message: `Role updated to ${role}.`,
      data: formatUser(user),
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/**
 * GET /api/admin/products
 */
router.get("/products", async (_req: AuthRequest, res: Response) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, data: products.map(formatProduct) });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/**
 * GET /api/admin/orders
 */
router.get("/orders", async (_req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: orders.map((o) => ({
        id: o._id.toString(),
        userId: o.userId,
        status: o.status,
        total: o.total,
        paymentMethod: o.paymentMethod,
        createdAt: o.createdAt,
        itemCount: o.items.length,
      })),
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

export default router;
