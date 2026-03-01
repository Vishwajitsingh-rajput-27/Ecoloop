/**
 * Order Model — MongoDB/Mongoose
 *
 * Stores orders with embedded items, address snapshot, status history.
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  productId: string;
  product: Record<string, any>; // snapshot of product at time of order
  quantity: number;
  priceAtOrder: number;
  sellerId: string;
  sellerName: string;
}

export interface IStatusHistory {
  status: string;
  timestamp: Date;
  note?: string;
}

export interface IOrder extends Document {
  userId: string;
  status: "Placed" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled" | "Refunded";
  address: Record<string, any>;
  paymentMethod: "wallet" | "upi" | "card" | "netbanking";
  subtotal: number;
  tax: number;
  platformFee: number;
  total: number;
  trackingId?: string;
  statusHistory: IStatusHistory[];
  items: IOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    product: { type: Schema.Types.Mixed, default: {} },
    quantity: { type: Number, required: true, min: 1 },
    priceAtOrder: { type: Number, required: true },
    sellerId: { type: String, required: true },
    sellerName: { type: String, default: "" },
  },
  { _id: false }
);

const StatusHistorySchema = new Schema<IStatusHistory>(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled", "Refunded"],
      default: "Placed",
    },
    address: { type: Schema.Types.Mixed, required: true },
    paymentMethod: {
      type: String,
      enum: ["wallet", "upi", "card", "netbanking"],
      required: true,
    },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    total: { type: Number, required: true },
    trackingId: { type: String },
    statusHistory: { type: [StatusHistorySchema], default: [] },
    items: { type: [OrderItemSchema], required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ "items.sellerId": 1 });

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
