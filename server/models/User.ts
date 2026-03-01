/**
 * User Model — MongoDB/Mongoose
 *
 * Stores user accounts, addresses, wishlist, recently viewed, notifications.
 * Roles: buyer | seller | admin
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IAddress {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface INotification {
  _id: string;
  type: "order" | "system" | "promo";
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  avatar?: string;
  role: "buyer" | "seller" | "admin";
  addresses: IAddress[];
  wishlist: string[];            // product IDs
  recentlyViewed: string[];      // product IDs (max 10)
  notifications: INotification[];
  sellerRating: number;
  totalSales: number;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    label: { type: String, default: "Home" },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const NotificationSchema = new Schema<INotification>(
  {
    type: { type: String, enum: ["order", "system", "promo"], default: "system" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    link: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    passwordHash: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String },
    role: { type: String, enum: ["buyer", "seller", "admin"], default: "buyer" },
    addresses: { type: [AddressSchema], default: [] },
    wishlist: { type: [String], default: [] },
    recentlyViewed: { type: [String], default: [] },
    notifications: { type: [NotificationSchema], default: [] },
    sellerRating: { type: Number, default: 0, min: 0, max: 5 },
    totalSales: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for fast email lookups
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

export const User = mongoose.model<IUser>("User", UserSchema);
export default User;
