const path = require("node:path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const databaseUrl = process.env.MONGODB_URI || process.env.MONGO_URI;

async function connectDB() {
  if (!databaseUrl) {
    throw new Error("Set MONGODB_URI in the Server/.env file before starting.");
  }

  try {
    await mongoose.connect(databaseUrl);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

module.exports = connectDB;
