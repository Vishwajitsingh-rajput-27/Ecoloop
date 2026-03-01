/**
 * Order Routes — MongoDB/Mongoose
 * POST /api/orders               - Create order
 * GET  /api/orders               - Get user's orders
 * GET  /api/orders/:id           - Get single order
 * PUT  /api/orders/:id/status    - Update status (seller/admin)
 * POST /api/orders/:id/cancel    - Cancel + refund
 */

import { Router, Response } from "express";
import mongoose from "mongoose";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Wallet, WalletTransaction } from "../models/Wallet.js";
import { User } from "../models/User.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { formatProduct } from "./products.js";

const router = Router();

function formatOrder(order: any): object {
  return {
    id: order._id.toString(),
    userId: order.userId,
    status: order.status,
    address: order.address,
    paymentMethod: order.paymentMethod,
    subtotal: order.subtotal,
    tax: order.tax,
    platformFee: order.platformFee,
    total: order.total,
    trackingId: order.trackingId,
    statusHistory: order.statusHistory,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items,
  };
}

/**
 * POST /api/orders
 * Creates order, deducts wallet balance if paymentMethod = wallet
 */
router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, address, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ success: false, error: "Cart is empty." });
    if (!address)
      return res.status(400).json({ success: false, error: "Delivery address is required." });
    if (!["wallet", "upi", "card", "netbanking"].includes(paymentMethod))
      return res.status(400).json({ success: false, error: "Invalid payment method." });

    // Validate and build order items
    const orderItems: any[] = [];
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session).lean();
      if (!product)
        throw new Error(`Product ${item.productId} not found.`);
      if (!product.isActive)
        throw new Error(`"${product.title}" is no longer available.`);
      if (product.quantity < item.quantity)
        throw new Error(`Insufficient stock for "${product.title}".`);

      orderItems.push({ product, quantity: item.quantity });
    }

    // Calculate totals
    const subtotal = orderItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const tax = Math.round(subtotal * 0.05);
    const platformFee = subtotal > 10000 ? 99 : 49;
    const total = subtotal + tax + platformFee;

    // Check wallet balance
    if (paymentMethod === "wallet") {
      const wallet = await Wallet.findOne({ userId: req.userId }).session(session);
      if (!wallet || wallet.balance < total) {
        throw new Error(
          `Insufficient wallet balance. Need ₹${total.toLocaleString("en-IN")}, have ₹${(wallet?.balance || 0).toLocaleString("en-IN")}.`
        );
      }
    }

    // Build embedded order items
    const embeddedItems = orderItems.map((i) => ({
      productId: i.product._id.toString(),
      product: formatProduct(i.product),
      quantity: i.quantity,
      priceAtOrder: i.product.price,
      sellerId: i.product.sellerId,
      sellerName: i.product.sellerName,
    }));

    // Create order
    const [order] = await Order.create(
      [
        {
          userId: req.userId,
          status: "Placed",
          address,
          paymentMethod,
          subtotal,
          tax,
          platformFee,
          total,
          statusHistory: [{ status: "Placed", timestamp: new Date() }],
          items: embeddedItems,
        },
      ],
      { session }
    );

    // Reduce stock for each product
    for (const item of orderItems) {
      const newQty = item.product.quantity - item.quantity;
      await Product.findByIdAndUpdate(
        item.product._id,
        { quantity: newQty, isActive: newQty > 0 },
        { session }
      );
    }

    // Deduct wallet if needed
    if (paymentMethod === "wallet") {
      await Wallet.findOneAndUpdate(
        { userId: req.userId },
        { $inc: { balance: -total } },
        { session }
      );

      await WalletTransaction.create(
        [
          {
            userId: req.userId,
            type: "debit",
            amount: total,
            description: `Order payment #${order._id.toString().slice(-8)}`,
            orderId: order._id.toString(),
            status: "success",
          },
        ],
        { session }
      );
    }

    // Add notification to user
    await User.findByIdAndUpdate(
      req.userId,
      {
        $push: {
          notifications: {
            $each: [
              {
                type: "order",
                title: "Order Placed Successfully! 🎉",
                message: `Your order for ₹${total.toLocaleString("en-IN")} has been placed.`,
                read: false,
                link: `/orders/${order._id.toString()}`,
              },
            ],
            $position: 0,
            $slice: 50,
          },
        },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      data: formatOrder(order),
    });
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();
    console.error("Create order error:", err);
    return res.status(400).json({ success: false, error: err.message || "Failed to create order." });
  }
});

/**
 * GET /api/orders
 */
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const filter = req.userRole === "admin" ? {} : { userId: req.userId };
    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: orders.map(formatOrder) });
  } catch (err) {
    console.error("Get orders error:", err);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/**
 * GET /api/orders/:id
 */
router.get("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order)
      return res.status(404).json({ success: false, error: "Order not found." });
    if (order.userId !== req.userId && req.userRole !== "admin")
      return res.status(403).json({ success: false, error: "Access denied." });

    return res.json({ success: true, data: formatOrder(order) });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/**
 * PUT /api/orders/:id/status
 */
router.put("/:id/status", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled", "Refunded"];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, error: "Invalid status." });

    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, error: "Order not found." });

    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date(), note: note || undefined });
    await order.save();

    return res.json({ success: true, message: `Status updated to ${status}.`, data: formatOrder(order) });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/**
 * POST /api/orders/:id/cancel
 * Cancel order + refund to wallet
 */
router.post("/:id/cancel", requireAuth, async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id).session(session);
    if (!order)
      return res.status(404).json({ success: false, error: "Order not found." });
    if (order.userId !== req.userId)
      return res.status(403).json({ success: false, error: "Access denied." });
    if (!["Placed", "Confirmed"].includes(order.status))
      return res.status(400).json({ success: false, error: "Order cannot be cancelled at this stage." });

    // Update order status
    order.status = "Cancelled";
    order.statusHistory.push({
      status: "Cancelled",
      timestamp: new Date(),
      note: "Cancelled by customer",
    });
    await order.save({ session });

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { quantity: item.quantity }, isActive: true },
        { session }
      );
    }

    // Refund to wallet
    await Wallet.findOneAndUpdate(
      { userId: order.userId },
      { $inc: { balance: order.total } },
      { upsert: true, session }
    );

    await WalletTransaction.create(
      [
        {
          userId: order.userId,
          type: "refund",
          amount: order.total,
          description: `Refund for Order #${order._id.toString().slice(-8)}`,
          orderId: order._id.toString(),
          status: "success",
        },
      ],
      { session }
    );

    // Notification
    await User.findByIdAndUpdate(
      order.userId,
      {
        $push: {
          notifications: {
            $each: [
              {
                type: "order",
                title: "Order Cancelled",
                message: `₹${order.total.toLocaleString("en-IN")} refunded to your EcoLoop wallet.`,
                read: false,
                link: "/wallet",
              },
            ],
            $position: 0,
            $slice: 50,
          },
        },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.json({
      success: true,
      message: "Order cancelled and refund processed.",
      data: formatOrder(order),
    });
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();
    console.error("Cancel order error:", err);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

export default router;
