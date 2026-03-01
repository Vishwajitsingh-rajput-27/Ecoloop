/**
 * EcoLoop — MongoDB Atlas Connection
 *
 * Connects to MongoDB Atlas using Mongoose ODM.
 * Database: ecoloop on Cluster0
 *
 * Connection string is configured via MONGODB_URI environment variable.
 * Falls back to the hardcoded Atlas URI for development.
 */

import mongoose from "mongoose";

// MongoDB Atlas connection string
// In production, always use environment variable
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://vishvajitrajput1238_db_user:A3x6Z9cT3YDaNY2S@cluster0.nq8iitq.mongodb.net/ecoloop?retryWrites=true&w=majority&appName=Cluster0";

/**
 * Connect to MongoDB Atlas
 */
export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState >= 1) {
    console.log("✅ MongoDB already connected.");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    const { host, name } = mongoose.connection;
    console.log(`✅ MongoDB Atlas connected: ${host} / db: ${name}`);

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected. Attempting reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected.");
    });
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB Atlas:", error);
    console.error("   Check your MONGODB_URI in .env file.");
    console.error("   Ensure your IP is whitelisted in Atlas Network Access.");
    process.exit(1);
  }
}

/**
 * Gracefully close connection
 */
export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
  console.log("🔌 MongoDB connection closed.");
}

export default connectDB;
