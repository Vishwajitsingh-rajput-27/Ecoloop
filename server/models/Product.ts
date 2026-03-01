/**
 * Product Model — MongoDB/Mongoose
 *
 * E-waste product listing with full details, eco-impact, specs, and images.
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  condition: "New" | "Like New" | "Refurbished" | "For Parts Only";
  age: number;
  purchaseYear: number;
  price: number;
  originalPrice?: number;
  quantity: number;
  location: { city: string; state: string };
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  rating: number;
  reviewCount: number;
  views: number;
  ecoImpact: { kgDiverted: number; co2Saved: number };
  tags: string[];
  specs: { key: string; value: string }[];
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true, minlength: 5 },
    description: { type: String, required: true, trim: true, minlength: 20 },
    brand: { type: String, default: "", trim: true },
    categoryId: { type: String, required: true },
    categoryName: { type: String, default: "" },
    condition: {
      type: String,
      required: true,
      enum: ["New", "Like New", "Refurbished", "For Parts Only"],
    },
    age: { type: Number, default: 0, min: 0 },
    purchaseYear: { type: Number, default: () => new Date().getFullYear() },
    price: { type: Number, required: true, min: 1 },
    originalPrice: { type: Number },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    location: {
      city: { type: String, default: "" },
      state: { type: String, default: "" },
    },
    sellerId: { type: String, required: true },
    sellerName: { type: String, default: "" },
    sellerRating: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    ecoImpact: {
      kgDiverted: { type: Number, default: 0 },
      co2Saved: { type: Number, default: 0 },
    },
    tags: { type: [String], default: [] },
    specs: {
      type: [{ key: String, value: String }],
      default: [],
    },
    images: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Full-text search index
ProductSchema.index({ title: "text", description: "text", brand: "text", tags: "text" });
// Filter indexes
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ sellerId: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ views: -1 });

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
export default Product;
