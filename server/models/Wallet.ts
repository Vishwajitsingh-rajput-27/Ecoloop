/**
 * Wallet & WalletTransaction Models — MongoDB/Mongoose
 *
 * Each user has one wallet document.
 * Transactions are separate documents for scalability.
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IWallet extends Document {
  userId: string;
  balance: number;
  updatedAt: Date;
}

export interface IWalletTransaction extends Document {
  userId: string;
  type: "topup" | "debit" | "refund" | "credit";
  amount: number;
  description: string;
  orderId?: string;
  paymentOrderId?: string;
  status: "pending" | "success" | "failed";
  createdAt: Date;
}

export interface IPaymentOrder extends Document {
  userId: string;
  amount: number;
  method: "upi" | "card" | "netbanking";
  status: "pending" | "completed" | "failed";
  gatewayOrderId?: string;
  completedAt?: Date;
  createdAt: Date;
}

// ── Wallet ────────────────────────────────────────────────────────────────────

const WalletSchema = new Schema<IWallet>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    balance: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// ── Wallet Transaction ────────────────────────────────────────────────────────

const WalletTransactionSchema = new Schema<IWalletTransaction>(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["topup", "debit", "refund", "credit"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    orderId: { type: String },
    paymentOrderId: { type: String },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "success",
    },
  },
  { timestamps: true }
);

WalletTransactionSchema.index({ userId: 1, createdAt: -1 });

// ── Payment Order ─────────────────────────────────────────────────────────────

const PaymentOrderSchema = new Schema<IPaymentOrder>(
  {
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 100 },
    method: { type: String, enum: ["upi", "card", "netbanking"], required: true },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    gatewayOrderId: { type: String },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export const Wallet = mongoose.model<IWallet>("Wallet", WalletSchema);
export const WalletTransaction = mongoose.model<IWalletTransaction>("WalletTransaction", WalletTransactionSchema);
export const PaymentOrder = mongoose.model<IPaymentOrder>("PaymentOrder", PaymentOrderSchema);
