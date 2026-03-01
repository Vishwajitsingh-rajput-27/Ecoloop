/**
 * MongoDB Atlas Seed Script
 *
 * Populates the database with sample data for development/demo.
 *
 * Usage:
 *   npx tsx server/db/seed.ts
 *
 * Requirements:
 *   - MONGODB_URI in .env file pointing to your MongoDB Atlas cluster
 *   - npm dependencies installed (mongoose, bcryptjs, dotenv)
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "./database.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { Category } from "../models/Category.js";
import { Order } from "../models/Order.js";
import { Wallet, WalletTransaction } from "../models/Wallet.js";
import { Review } from "../models/Review.js";

async function seed() {
  console.log("🌱 EcoLoop MongoDB Seed Script");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Connect to MongoDB Atlas
  await connectDB();

  // ─── Clear Existing Data ──────────────────────────────────────────────────
  console.log("🗑️  Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
    Order.deleteMany({}),
    Wallet.deleteMany({}),
    WalletTransaction.deleteMany({}),
    Review.deleteMany({}),
  ]);
  console.log("✅ Database cleared\n");

  // ─── Categories ─────────────────────────────────────────────────────────────
  console.log("📂 Seeding categories...");
  const categories = await Category.insertMany([
    { name: "Smartphones", slug: "smartphones", icon: "📱", description: "Mobile phones and accessories", productCount: 0 },
    { name: "Laptops", slug: "laptops", icon: "💻", description: "Laptops and notebooks", productCount: 0 },
    { name: "Tablets", slug: "tablets", icon: "📟", description: "Tablets and e-readers", productCount: 0 },
    { name: "Components", slug: "components", icon: "🔧", description: "RAM, SSDs, GPUs, CPUs and more", productCount: 0 },
    { name: "Appliances", slug: "appliances", icon: "🏠", description: "Home and kitchen appliances", productCount: 0 },
    { name: "Audio", slug: "audio", icon: "🎧", description: "Headphones, speakers and earphones", productCount: 0 },
    { name: "Cameras", slug: "cameras", icon: "📷", description: "Cameras and accessories", productCount: 0 },
    { name: "Gaming", slug: "gaming", icon: "🎮", description: "Consoles, controllers and peripherals", productCount: 0 },
  ]);

  // Create a map: slug -> _id
  const catMap: Record<string, string> = {};
  categories.forEach((c) => {
    catMap[c.slug] = c._id.toString();
  });
  console.log("✅ 8 categories seeded");

  // ─── Users ───────────────────────────────────────────────────────────────────
  console.log("👤 Seeding users...");
  const passwordHash = await bcrypt.hash("password123", 12);
  const adminHash = await bcrypt.hash("admin@ecoloop", 12);

  const users = await User.insertMany([
    {
      name: "Ananya Kapoor",
      email: "ananya@example.com",
      passwordHash,
      phone: "+91 9876543210",
      role: "buyer",
      avatar: "https://i.pravatar.cc/150?img=47",
      addresses: [
        { label: "Home", fullName: "Ananya Kapoor", phone: "+91 9876543210", line1: "Flat 4B, Green Heights", line2: "MG Road", city: "Bengaluru", state: "Karnataka", pincode: "560001", isDefault: true },
        { label: "Office", fullName: "Ananya Kapoor", phone: "+91 9876543211", line1: "Level 5, TechPark Tower", line2: "", city: "Bengaluru", state: "Karnataka", pincode: "560037", isDefault: false },
      ],
      wishlist: [],
      recentlyViewed: [],
      notifications: [
        { type: "order", title: "Order Shipped!", message: "Your order has been shipped via BlueDart.", read: false, link: "/orders" },
        { type: "promo", title: "Weekend Sale!", message: "Get up to 30% off on refurbished laptops this weekend.", read: false },
        { type: "system", title: "Welcome to EcoLoop!", message: "Start buying or selling e-waste today and make a difference.", read: true },
      ],
    },
    {
      name: "Rahul Sharma",
      email: "rahul@example.com",
      passwordHash,
      phone: "+91 9123456789",
      role: "seller",
      avatar: "https://i.pravatar.cc/150?img=12",
      sellerRating: 4.7,
      totalSales: 45,
      notifications: [
        { type: "system", title: "Welcome to EcoLoop!", message: "Your seller account is ready. Start listing your products.", read: true },
      ],
    },
    {
      name: "TechRefurb Store",
      email: "techrefurb@example.com",
      passwordHash,
      phone: "+91 9988776655",
      role: "seller",
      avatar: "https://i.pravatar.cc/150?img=33",
      sellerRating: 4.9,
      totalSales: 289,
      notifications: [
        { type: "system", title: "Welcome to EcoLoop!", message: "Your seller account is ready. Start listing your products.", read: true },
      ],
    },
    {
      name: "Priya Components",
      email: "priya@example.com",
      passwordHash,
      phone: "+91 9876501234",
      role: "seller",
      avatar: "https://i.pravatar.cc/150?img=25",
      sellerRating: 4.6,
      totalSales: 112,
      notifications: [
        { type: "system", title: "Welcome to EcoLoop!", message: "Your seller account is ready.", read: true },
      ],
    },
    {
      name: "Admin User",
      email: "admin@ecoloop.in",
      passwordHash: adminHash,
      phone: "+91 9000000001",
      role: "admin",
      avatar: "https://i.pravatar.cc/150?img=70",
      notifications: [
        { type: "system", title: "Admin Access Granted", message: "You have full admin privileges.", read: true },
      ],
    },
  ]);

  // User ID map
  const userMap: Record<string, string> = {};
  users.forEach((u) => {
    userMap[u.email.split("@")[0]] = u._id.toString();
  });
  console.log("✅ 5 users seeded");

  // ─── Wallets ─────────────────────────────────────────────────────────────────
  console.log("💰 Seeding wallets...");
  await Wallet.insertMany([
    { userId: userMap["ananya"], balance: 8450 },
    { userId: userMap["rahul"], balance: 12000 },
    { userId: userMap["techrefurb"], balance: 55000 },
    { userId: userMap["priya"], balance: 18000 },
    { userId: userMap["admin"], balance: 0 },
  ]);

  // Wallet transactions for Ananya
  await WalletTransaction.insertMany([
    { userId: userMap["ananya"], type: "topup", amount: 20000, description: "Added via UPI", status: "success", createdAt: new Date("2024-11-15T10:00:00Z") },
    { userId: userMap["ananya"], type: "debit", amount: 19100, description: "Order payment", status: "success", createdAt: new Date("2024-11-20T10:00:00Z") },
    { userId: userMap["ananya"], type: "topup", amount: 10000, description: "Added via Debit Card", status: "success", createdAt: new Date("2024-11-22T09:00:00Z") },
    { userId: userMap["ananya"], type: "debit", amount: 11700, description: "Order payment", status: "success", createdAt: new Date("2024-11-01T11:00:00Z") },
    { userId: userMap["ananya"], type: "refund", amount: 9250, description: "Refund for cancelled order", status: "success", createdAt: new Date("2024-10-25T16:00:00Z") },
  ]);
  console.log("✅ Wallets & transactions seeded");

  // ─── Products ────────────────────────────────────────────────────────────────
  console.log("📦 Seeding products...");
  const productsData = [
    {
      title: "iPhone 12 Pro Max – 256GB Pacific Blue",
      description: "Excellent condition iPhone 12 Pro Max. Minor scratches on the back, screen is perfect. Comes with original box, charger, and cable. Battery health 89%. All features working perfectly.",
      brand: "Apple", categoryId: catMap["smartphones"], categoryName: "Smartphones",
      condition: "Like New" as const, age: 3, purchaseYear: 2021,
      price: 42000, originalPrice: 119900, quantity: 1,
      location: { city: "Bengaluru", state: "Karnataka" },
      sellerId: userMap["rahul"], sellerName: "Rahul Sharma", sellerRating: 4.7,
      rating: 4.5, reviewCount: 2, views: 342,
      ecoImpact: { kgDiverted: 0.17, co2Saved: 70 },
      tags: ["iphone", "apple", "5g", "256gb"],
      specs: [{ key: "Storage", value: "256GB" }, { key: "RAM", value: "6GB" }, { key: "Battery Health", value: "89%" }, { key: "Color", value: "Pacific Blue" }, { key: "Network", value: "5G" }],
      images: ["https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=600&q=80", "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&q=80"],
    },
    {
      title: "Dell XPS 15 Laptop – Core i7, 16GB RAM, 512GB SSD",
      description: "Dell XPS 15 in refurbished condition. Professionally cleaned and tested. New thermal paste applied. Battery replaced. Perfect for developers and designers. Runs like new.",
      brand: "Dell", categoryId: catMap["laptops"], categoryName: "Laptops",
      condition: "Refurbished" as const, age: 4, purchaseYear: 2020,
      price: 55000, originalPrice: 145000, quantity: 2,
      location: { city: "Mumbai", state: "Maharashtra" },
      sellerId: userMap["techrefurb"], sellerName: "TechRefurb Store", sellerRating: 4.9,
      rating: 4.8, reviewCount: 1, views: 891,
      ecoImpact: { kgDiverted: 2.1, co2Saved: 300 },
      tags: ["dell", "xps", "laptop", "i7", "gaming"],
      specs: [{ key: "Processor", value: "Intel Core i7-10750H" }, { key: "RAM", value: "16GB DDR4" }, { key: "Storage", value: "512GB NVMe SSD" }, { key: "Display", value: "15.6\" 4K OLED" }, { key: "GPU", value: "NVIDIA GTX 1650 Ti" }],
      images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80"],
    },
    {
      title: "Samsung Galaxy S21 – 128GB Phantom Gray",
      description: "Used Samsung Galaxy S21 in good condition. Screen has minor micro-scratches not visible during use. Back is perfect. Battery health 82%. Includes charger.",
      brand: "Samsung", categoryId: catMap["smartphones"], categoryName: "Smartphones",
      condition: "Refurbished" as const, age: 3, purchaseYear: 2021,
      price: 22000, originalPrice: 69999, quantity: 3,
      location: { city: "Hyderabad", state: "Telangana" },
      sellerId: userMap["rahul"], sellerName: "Rahul Sharma", sellerRating: 4.7,
      rating: 4.2, reviewCount: 0, views: 214,
      ecoImpact: { kgDiverted: 0.17, co2Saved: 58 },
      tags: ["samsung", "galaxy", "s21", "5g"],
      specs: [{ key: "Storage", value: "128GB" }, { key: "RAM", value: "8GB" }, { key: "Battery Health", value: "82%" }, { key: "Color", value: "Phantom Gray" }],
      images: ["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80", "https://images.unsplash.com/photo-1542239893-4f07c24df72d?w=600&q=80"],
    },
    {
      title: "Sony WH-1000XM4 Wireless Headphones",
      description: "Industry-leading noise cancelling headphones. Used for 1 year, in excellent condition. All features work perfectly. Comes with original case, cable, and adapter.",
      brand: "Sony", categoryId: catMap["audio"], categoryName: "Audio",
      condition: "Like New" as const, age: 1, purchaseYear: 2023,
      price: 18000, originalPrice: 29990, quantity: 1,
      location: { city: "Pune", state: "Maharashtra" },
      sellerId: userMap["techrefurb"], sellerName: "TechRefurb Store", sellerRating: 4.9,
      rating: 4.9, reviewCount: 1, views: 567,
      ecoImpact: { kgDiverted: 0.25, co2Saved: 20 },
      tags: ["sony", "headphones", "noise-cancelling", "wireless"],
      specs: [{ key: "Type", value: "Over-ear" }, { key: "Connectivity", value: "Bluetooth 5.0" }, { key: "Battery Life", value: "30 hours" }, { key: "Noise Cancelling", value: "Yes" }],
      images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80"],
    },
    {
      title: "NVIDIA RTX 3070 Graphics Card – 8GB GDDR6",
      description: "Used for gaming only, never mined. Runs cool with good thermal paste. Benchmarks available on request. Perfect for 1440p gaming or ML workloads.",
      brand: "NVIDIA", categoryId: catMap["components"], categoryName: "Components",
      condition: "Like New" as const, age: 2, purchaseYear: 2022,
      price: 32000, originalPrice: 52000, quantity: 1,
      location: { city: "Chennai", state: "Tamil Nadu" },
      sellerId: userMap["priya"], sellerName: "Priya Components", sellerRating: 4.6,
      rating: 4.7, reviewCount: 0, views: 789,
      ecoImpact: { kgDiverted: 0.9, co2Saved: 85 },
      tags: ["nvidia", "rtx3070", "gpu", "gaming", "8gb"],
      specs: [{ key: "VRAM", value: "8GB GDDR6" }, { key: "TDP", value: "220W" }, { key: "Ports", value: "3x DP, 1x HDMI 2.1" }],
      images: ["https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&q=80", "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&q=80"],
    },
    {
      title: "iPad Air 4th Gen – 64GB Space Gray",
      description: "iPad Air 4th Gen in great condition. Small nick on one corner of aluminum body, screen is flawless. Works perfectly with Apple Pencil 2 (not included).",
      brand: "Apple", categoryId: catMap["tablets"], categoryName: "Tablets",
      condition: "Refurbished" as const, age: 3, purchaseYear: 2021,
      price: 28000, originalPrice: 54900, quantity: 1,
      location: { city: "Delhi", state: "Delhi" },
      sellerId: userMap["rahul"], sellerName: "Rahul Sharma", sellerRating: 4.7,
      rating: 4.4, reviewCount: 0, views: 198,
      ecoImpact: { kgDiverted: 0.45, co2Saved: 80 },
      tags: ["ipad", "apple", "tablet", "air"],
      specs: [{ key: "Storage", value: "64GB" }, { key: "Chip", value: "Apple A14 Bionic" }, { key: "Display", value: "10.9\" Liquid Retina" }, { key: "Battery Health", value: "91%" }],
      images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80", "https://images.unsplash.com/photo-1623126908029-58cb08a2b272?w=600&q=80"],
    },
    {
      title: "Canon EOS 800D DSLR Camera Body",
      description: "Canon EOS 800D body only, shutter count ~15,000. Sensor is clean. All dials and buttons work. Perfect for enthusiast photographers.",
      brand: "Canon", categoryId: catMap["cameras"], categoryName: "Cameras",
      condition: "Refurbished" as const, age: 5, purchaseYear: 2019,
      price: 25000, originalPrice: 65000, quantity: 1,
      location: { city: "Kolkata", state: "West Bengal" },
      sellerId: userMap["priya"], sellerName: "Priya Components", sellerRating: 4.6,
      rating: 4.6, reviewCount: 0, views: 312,
      ecoImpact: { kgDiverted: 0.55, co2Saved: 95 },
      tags: ["canon", "dslr", "camera", "eos"],
      specs: [{ key: "Sensor", value: "24.2MP APS-C CMOS" }, { key: "Shutter Count", value: "~15,000" }, { key: "Video", value: "Full HD 60fps" }],
      images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80"],
    },
    {
      title: "PlayStation 5 Console – Disc Edition",
      description: "PS5 Disc Edition, barely used. Less than 50 hours of gameplay. All original accessories included. Works perfectly.",
      brand: "Sony", categoryId: catMap["gaming"], categoryName: "Gaming",
      condition: "Like New" as const, age: 2, purchaseYear: 2022,
      price: 42000, originalPrice: 54990, quantity: 1,
      location: { city: "Bengaluru", state: "Karnataka" },
      sellerId: userMap["techrefurb"], sellerName: "TechRefurb Store", sellerRating: 4.9,
      rating: 4.8, reviewCount: 0, views: 1024,
      ecoImpact: { kgDiverted: 3.8, co2Saved: 120 },
      tags: ["ps5", "playstation", "gaming", "console"],
      specs: [{ key: "Edition", value: "Disc Edition" }, { key: "Storage", value: "825GB SSD" }, { key: "Resolution", value: "Up to 8K" }],
      images: ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&q=80", "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600&q=80"],
    },
    {
      title: "Motorola Moto G73 5G – 128GB Midnight Blue",
      description: "Moto G73 5G in excellent condition. Used for 6 months. Screen protector applied from day 1. No scratches. Battery health 96%.",
      brand: "Motorola", categoryId: catMap["smartphones"], categoryName: "Smartphones",
      condition: "Like New" as const, age: 1, purchaseYear: 2023,
      price: 12500, originalPrice: 22999, quantity: 2,
      location: { city: "Ahmedabad", state: "Gujarat" },
      sellerId: userMap["priya"], sellerName: "Priya Components", sellerRating: 4.6,
      rating: 4.3, reviewCount: 0, views: 145,
      ecoImpact: { kgDiverted: 0.17, co2Saved: 40 },
      tags: ["motorola", "moto", "5g", "128gb"],
      specs: [{ key: "Storage", value: "128GB" }, { key: "RAM", value: "8GB" }, { key: "Battery", value: "5000mAh, 68W" }, { key: "Display", value: "6.5\" 144Hz" }],
      images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80", "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&q=80"],
    },
    {
      title: "Kingston 32GB DDR4 3200MHz RAM Kit",
      description: "2x16GB DDR4 3200MHz RAM kit by Kingston. Pulled from a working system. Tested and verified. Great for upgrades.",
      brand: "Kingston", categoryId: catMap["components"], categoryName: "Components",
      condition: "Like New" as const, age: 2, purchaseYear: 2022,
      price: 5500, originalPrice: 9500, quantity: 5,
      location: { city: "Jaipur", state: "Rajasthan" },
      sellerId: userMap["techrefurb"], sellerName: "TechRefurb Store", sellerRating: 4.9,
      rating: 4.6, reviewCount: 0, views: 423,
      ecoImpact: { kgDiverted: 0.07, co2Saved: 12 },
      tags: ["ram", "ddr4", "kingston", "memory"],
      specs: [{ key: "Capacity", value: "32GB (2x16GB)" }, { key: "Speed", value: "DDR4 3200MHz" }, { key: "Type", value: "DIMM" }],
      images: ["https://images.unsplash.com/photo-1562976540-1502c2145851?w=600&q=80", "https://images.unsplash.com/photo-1591799265444-d66432b91588?w=600&q=80"],
    },
    {
      title: "MacBook Air M1 – 8GB RAM, 256GB SSD",
      description: "MacBook Air M1 in near-mint condition. Battery cycle count is 180. Comes with original MagSafe charger.",
      brand: "Apple", categoryId: catMap["laptops"], categoryName: "Laptops",
      condition: "Like New" as const, age: 3, purchaseYear: 2021,
      price: 62000, originalPrice: 99900, quantity: 1,
      location: { city: "Bengaluru", state: "Karnataka" },
      sellerId: userMap["techrefurb"], sellerName: "TechRefurb Store", sellerRating: 4.9,
      rating: 4.9, reviewCount: 1, views: 1102,
      ecoImpact: { kgDiverted: 1.5, co2Saved: 220 },
      tags: ["macbook", "apple", "m1", "laptop"],
      specs: [{ key: "Chip", value: "Apple M1" }, { key: "RAM", value: "8GB Unified Memory" }, { key: "Storage", value: "256GB SSD" }, { key: "Battery Cycles", value: "180" }],
      images: ["https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&q=80", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80"],
    },
    {
      title: "OnePlus 10 Pro 5G – 256GB Volcanic Black",
      description: "OnePlus 10 Pro in good condition. Minor scuff on the Hasselblad camera ring. Screen is perfect with no scratches.",
      brand: "OnePlus", categoryId: catMap["smartphones"], categoryName: "Smartphones",
      condition: "Refurbished" as const, age: 2, purchaseYear: 2022,
      price: 28000, originalPrice: 66999, quantity: 1,
      location: { city: "Noida", state: "Uttar Pradesh" },
      sellerId: userMap["rahul"], sellerName: "Rahul Sharma", sellerRating: 4.7,
      rating: 4.3, reviewCount: 0, views: 276,
      ecoImpact: { kgDiverted: 0.17, co2Saved: 55 },
      tags: ["oneplus", "5g", "256gb", "hasselblad"],
      specs: [{ key: "Storage", value: "256GB" }, { key: "RAM", value: "12GB" }, { key: "Battery Health", value: "87%" }, { key: "Charging", value: "80W SuperVOOC" }],
      images: ["https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&q=80", "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80"],
    },
  ];

  const products = await Product.insertMany(productsData);
  console.log(`✅ ${products.length} products seeded`);

  // Update category product counts
  const catCounts: Record<string, number> = {};
  productsData.forEach((p) => {
    catCounts[p.categoryId] = (catCounts[p.categoryId] || 0) + 1;
  });
  for (const [catId, count] of Object.entries(catCounts)) {
    await Category.findByIdAndUpdate(catId, { productCount: count });
  }

  // Update Ananya's wishlist with product IDs
  const wishlistProducts = products.filter((p) =>
    ["Dell XPS 15 Laptop", "PlayStation 5 Console", "MacBook Air M1"].some((t) => p.title.includes(t.split(" ")[0]))
  );
  await User.findByIdAndUpdate(userMap["ananya"], {
    wishlist: wishlistProducts.map((p) => p._id.toString()),
  });

  // ─── Reviews ─────────────────────────────────────────────────────────────────
  console.log("⭐ Seeding reviews...");
  const iPhone = products.find((p) => p.title.includes("iPhone 12"))!;
  const dellXps = products.find((p) => p.title.includes("Dell XPS"))!;
  const sonyXm4 = products.find((p) => p.title.includes("Sony WH"))!;
  const macbook = products.find((p) => p.title.includes("MacBook Air"))!;

  await Review.insertMany([
    {
      productId: iPhone._id.toString(), userId: userMap["ananya"], userName: "Ananya Kapoor", userAvatar: "https://i.pravatar.cc/150?img=47",
      rating: 5, title: "Exactly as described!", body: "Phone was in perfect condition, battery health was as mentioned. Seller was very responsive. Would buy again!", helpful: 12, verified: true,
    },
    {
      productId: iPhone._id.toString(), userId: userMap["admin"], userName: "Admin User", userAvatar: "https://i.pravatar.cc/150?img=70",
      rating: 4, title: "Good deal, minor scratches", body: "The phone is great value. There are some micro-scratches on the back that weren't mentioned. Overall good experience.", helpful: 5, verified: true,
    },
    {
      productId: dellXps._id.toString(), userId: userMap["ananya"], userName: "Ananya Kapoor", userAvatar: "https://i.pravatar.cc/150?img=47",
      rating: 5, title: "Best laptop purchase!", body: "Runs like new. TechRefurb Store did an amazing job. The thermal paste replacement made a huge difference. Highly recommended!", helpful: 21, verified: true,
    },
    {
      productId: sonyXm4._id.toString(), userId: userMap["ananya"], userName: "Ananya Kapoor", userAvatar: "https://i.pravatar.cc/150?img=47",
      rating: 5, title: "Incredible noise cancelling", body: "These headphones are amazing. The ANC works perfectly and the sound quality is top notch. Great condition as described.", helpful: 8, verified: false,
    },
    {
      productId: macbook._id.toString(), userId: userMap["ananya"], userName: "Ananya Kapoor", userAvatar: "https://i.pravatar.cc/150?img=47",
      rating: 5, title: "Perfect M1 MacBook", body: "Battery life is incredible even after 180 cycles. Screen is flawless and the M1 chip handles everything I throw at it.", helpful: 15, verified: true,
    },
  ]);
  console.log("✅ 5 reviews seeded");

  // ─── Orders ──────────────────────────────────────────────────────────────────
  console.log("🛒 Seeding orders...");
  const addr1Snapshot = {
    label: "Home", fullName: "Ananya Kapoor", phone: "+91 9876543210",
    line1: "Flat 4B, Green Heights", line2: "MG Road", city: "Bengaluru",
    state: "Karnataka", pincode: "560001",
  };

  await Order.insertMany([
    {
      userId: userMap["ananya"],
      status: "Shipped",
      address: addr1Snapshot,
      paymentMethod: "wallet",
      subtotal: 18000, tax: 900, platformFee: 99, total: 19099,
      trackingId: "BD12345678",
      statusHistory: [
        { status: "Placed", timestamp: new Date("2024-11-20T10:00:00Z") },
        { status: "Confirmed", timestamp: new Date("2024-11-20T12:30:00Z"), note: "Seller confirmed the order" },
        { status: "Shipped", timestamp: new Date("2024-11-22T09:00:00Z"), note: "Shipped via BlueDart. AWB: BD12345678" },
      ],
      items: [{
        productId: sonyXm4._id.toString(),
        product: { title: sonyXm4.title, images: sonyXm4.images, brand: sonyXm4.brand },
        quantity: 1, priceAtOrder: 18000, sellerId: userMap["techrefurb"], sellerName: "TechRefurb Store",
      }],
    },
    {
      userId: userMap["ananya"],
      status: "Delivered",
      address: addr1Snapshot,
      paymentMethod: "upi",
      subtotal: 11000, tax: 550, platformFee: 99, total: 11649,
      trackingId: "DH98765432",
      statusHistory: [
        { status: "Placed", timestamp: new Date("2024-11-01T11:00:00Z") },
        { status: "Confirmed", timestamp: new Date("2024-11-01T13:00:00Z") },
        { status: "Shipped", timestamp: new Date("2024-11-03T08:00:00Z") },
        { status: "Delivered", timestamp: new Date("2024-11-05T14:00:00Z"), note: "Delivered successfully" },
      ],
      items: [{
        productId: products.find((p) => p.title.includes("Kingston"))!._id.toString(),
        product: { title: "Kingston 32GB DDR4 3200MHz RAM Kit", images: ["https://images.unsplash.com/photo-1562976540-1502c2145851?w=600&q=80"], brand: "Kingston" },
        quantity: 2, priceAtOrder: 5500, sellerId: userMap["techrefurb"], sellerName: "TechRefurb Store",
      }],
    },
  ]);
  console.log("✅ 2 orders seeded");

  // ─── Done ────────────────────────────────────────────────────────────────────
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Database seeded successfully!\n");
  console.log("📋 Demo accounts:");
  console.log("  🛒 Buyer:  ananya@example.com / password123");
  console.log("  🏪 Seller: rahul@example.com / password123");
  console.log("  🏪 Seller: techrefurb@example.com / password123");
  console.log("  👑 Admin:  admin@ecoloop.in / admin@ecoloop");
  console.log("\n💰 Wallet balances:");
  console.log("  Ananya:      ₹8,450");
  console.log("  Rahul:       ₹12,000");
  console.log("  TechRefurb:  ₹55,000");
  console.log("  Priya:       ₹18,000");
  console.log("");

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
