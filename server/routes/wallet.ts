/**
 * Wallet Routes — MongoDB/Mongoose
 * GET  /api/wallet                    - Balance + transaction history
 * POST /api/wallet/topup/initiate     - Initiate payment (Razorpay)
 * POST /api/wallet/topup/complete     - Complete payment + credit wallet
 */

import { Router, Response } from "express";
import { Wallet, WalletTransaction, PaymentOrder } from "../models/Wallet.js";
import { User } from "../models/User.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";

const router = Router();

/**
 * GET /api/wallet
 */
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    // Upsert wallet (create if not exists)
    let wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId: req.userId, balance: 0 });
    }

    const transactions = await WalletTransaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json({
      success: true,
      data: {
        userId: wallet.userId,
        balance: wallet.balance,
        transactions: transactions.map((t) => ({
          id: t._id.toString(),
          type: t.type,
          amount: t.amount,
          description: t.description,
          orderId: t.orderId,
          timestamp: t.createdAt,
          status: t.status,
        })),
      },
    });
  } catch (err) {
    console.error("Get wallet error:", err);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/**
 * POST /api/wallet/topup/initiate
 *
 * MOCK MODE: Returns a fake paymentOrderId for testing.
 *
 * ── PRODUCTION (Razorpay) ──────────────────────────────────────────────────
 * TODO: Replace mock block with:
 *
 *   import Razorpay from 'razorpay';
 *   const razorpay = new Razorpay({
 *     key_id: process.env.RAZORPAY_KEY_ID!,
 *     key_secret: process.env.RAZORPAY_KEY_SECRET!,
 *   });
 *
 *   const rzpOrder = await razorpay.orders.create({
 *     amount: amount * 100,          // Razorpay uses paise
 *     currency: 'INR',
 *     receipt: `wallet_${userId}_${Date.now()}`,
 *     notes: { userId, method },
 *   });
 *
 *   return res.json({
 *     success: true,
 *     data: {
 *       paymentOrderId: rzpOrder.id,   // pass to Razorpay checkout widget
 *       amount,
 *       method,
 *       key: process.env.RAZORPAY_KEY_ID,
 *       currency: 'INR',
 *       mock: false,
 *     },
 *   });
 * ──────────────────────────────────────────────────────────────────────────
 */
router.post("/topup/initiate", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, method } = req.body;

    if (!amount || amount < 100)
      return res.status(400).json({ success: false, error: "Minimum top-up is ₹100." });
    if (amount > 100000)
      return res.status(400).json({ success: false, error: "Maximum top-up is ₹1,00,000." });
    if (!["upi", "card", "netbanking"].includes(method))
      return res.status(400).json({ success: false, error: "Invalid payment method." });

    // Create pending payment order in MongoDB
    const paymentOrder = await PaymentOrder.create({
      userId: req.userId,
      amount,
      method,
      status: "pending",
      gatewayOrderId: `pay_mock_${Date.now()}`,
    });

    return res.json({
      success: true,
      data: {
        paymentOrderId: paymentOrder._id.toString(),
        amount,
        method,
        mock: true, // ← Remove in production after wiring real Razorpay
        // key: process.env.RAZORPAY_KEY_ID,   // ← Uncomment in production
        // currency: 'INR',                     // ← Uncomment in production
      },
    });
  } catch (err) {
    console.error("Initiate topup error:", err);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

/**
 * POST /api/wallet/topup/complete
 *
 * MOCK MODE: Trusts the paymentOrderId and credits the wallet.
 *
 * ── PRODUCTION (Razorpay) ──────────────────────────────────────────────────
 * TODO: Before crediting wallet, verify Razorpay signature:
 *
 *   import crypto from 'crypto';
 *   const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
 *
 *   const expectedSig = crypto
 *     .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
 *     .update(`${razorpayOrderId}|${razorpayPaymentId}`)
 *     .digest('hex');
 *
 *   if (expectedSig !== razorpaySignature) {
 *     return res.status(400).json({ success: false, error: 'Payment verification failed.' });
 *   }
 *
 *   // Then proceed to credit wallet below...
 * ──────────────────────────────────────────────────────────────────────────
 */
router.post("/topup/complete", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { paymentOrderId, amount, method } = req.body;

    if (!paymentOrderId || !amount || !method)
      return res.status(400).json({ success: false, error: "Missing required fields." });

    // Verify payment order belongs to user and is pending
    const paymentOrder = await PaymentOrder.findOne({
      _id: paymentOrderId,
      userId: req.userId,
      status: "pending",
    });

    if (!paymentOrder)
      return res.status(404).json({
        success: false,
        error: "Payment order not found or already processed.",
      });

    // Mark as completed
    paymentOrder.status = "completed";
    paymentOrder.completedAt = new Date();
    await paymentOrder.save();

    // Credit wallet
    let wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId: req.userId, balance: 0 });
    }
    wallet.balance += Number(amount);
    await wallet.save();

    // Record transaction
    await WalletTransaction.create({
      userId: req.userId,
      type: "topup",
      amount: Number(amount),
      description: `Added via ${method.toUpperCase()}`,
      paymentOrderId: paymentOrder._id.toString(),
      status: "success",
    });

    // Push notification to user
    await User.findByIdAndUpdate(req.userId, {
      $push: {
        notifications: {
          $each: [
            {
              type: "system",
              title: "Wallet Topped Up ✅",
              message: `₹${Number(amount).toLocaleString("en-IN")} added via ${method.toUpperCase()}.`,
              read: false,
              link: "/wallet",
            },
          ],
          $position: 0,
          $slice: 50,
        },
      },
    });

    // Return updated wallet
    const transactions = await WalletTransaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json({
      success: true,
      message: `₹${Number(amount).toLocaleString("en-IN")} added to wallet!`,
      data: {
        userId: wallet.userId,
        balance: wallet.balance,
        transactions: transactions.map((t) => ({
          id: t._id.toString(),
          type: t.type,
          amount: t.amount,
          description: t.description,
          orderId: t.orderId,
          timestamp: t.createdAt,
          status: t.status,
        })),
      },
    });
  } catch (err) {
    console.error("Complete topup error:", err);
    return res.status(500).json({ success: false, error: "Internal server error." });
  }
});

export default router;
