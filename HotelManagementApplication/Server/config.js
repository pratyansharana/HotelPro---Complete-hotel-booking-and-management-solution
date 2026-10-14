const path = require("node:path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const databaseUrl = process.env.MONGODB_URI || process.env.MONGO_URI;
let connectionPromise;

async function connectDB() {
  if (!databaseUrl) {
    throw new Error("Set MONGODB_URI in the Server/.env file before starting.");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(databaseUrl)
      .then(() => {
        console.log("Connected to MongoDB");
        return mongoose.connection;
      })
      .finally(() => {
        connectionPromise = undefined;
      });
  }

  return connectionPromise;
}

module.exports = connectDB;
