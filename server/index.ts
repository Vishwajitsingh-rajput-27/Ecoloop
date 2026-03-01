/**
 * EcoLoop Express Server — MongoDB Atlas Backend
 *
 * Production-ready Node.js + Express + Mongoose backend.
 *
 * Architecture:
 *   - Express.js REST API
 *   - MongoDB Atlas via Mongoose ODM
 *   - bcryptjs for password hashing
 *   - jsonwebtoken for JWT auth
 *   - helmet for security headers
 *   - compression for gzip
 *   - express-rate-limit for basic DDoS protection
 *   - CORS configured for frontend dev server
 *
 * Environment variables (see .env.example):
 *   PORT          - HTTP port (default 3001)
 *   JWT_SECRET    - Secret key for JWT signing (CHANGE IN PRODUCTION)
 *   MONGODB_URI   - MongoDB Atlas connection string
 *   FRONTEND_URL  - Frontend URL for CORS (default http://localhost:5173)
 *   NODE_ENV      - 'development' or 'production'
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import database connection + routes
import { connectDB } from "./db/database.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import walletRoutes from "./routes/wallet.js";
import reviewRoutes from "./routes/reviews.js";
import categoryRoutes from "./routes/categories.js";
import adminRoutes from "./routes/admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── App Setup ────────────────────────────────────────────────────────────────

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ─── Security & Performance Middleware ───────────────────────────────────────

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(compression());

// CORS: Allow frontend
app.use(cors({
  origin: [FRONTEND_URL, "http://localhost:5173", "http://localhost:4173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Stricter limit on auth routes to prevent brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: "Too many login attempts. Please wait 15 minutes." },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    service: "EcoLoop API",
    version: "1.0.0",
    database: "MongoDB Atlas",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ─── Serve Frontend in Production ─────────────────────────────────────────────

if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "..", "dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// ─── Global Error Handler ─────────────────────────────────────────────────────

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Internal server error." : err.message,
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Endpoint not found." });
});

// ─── Connect to MongoDB Atlas & Start Server ──────────────────────────────────

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n🌿 EcoLoop API Server`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🚀 Server running at: http://localhost:${PORT}`);
      console.log(`🌐 Frontend URL:      ${FRONTEND_URL}`);
      console.log(`🏥 Health check:      http://localhost:${PORT}/api/health`);
      console.log(`🗄️  Database:          MongoDB Atlas`);
      console.log(`📦 Environment:       ${process.env.NODE_ENV || "development"}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();

export default app;
