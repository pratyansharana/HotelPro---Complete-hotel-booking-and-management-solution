const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./config");
const authRoutes = require("./Routes/authRoutes");
const adminRoutes = require("./Routes/adminRoutes");

const app = express();
const allowedOrigins = process.env.CLIENT_URL
  ?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins?.length ? allowedOrigins : true,
  }),
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", async (_req, res, next) => {
  try {
    if (
      !process.env.JWT_SECRET ||
      process.env.JWT_SECRET.length < 32 ||
      process.env.JWT_SECRET.startsWith("replace-with-")
    ) {
      return res.status(500).json({
        message: "The API is missing a valid JWT_SECRET configuration.",
      });
    }

    await connectDB();
    return next();
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return res.status(503).json({
      message: "Database is unavailable. Please try again later.",
    });
  }
});

app.get("/api/health", (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "unavailable",
    database: connected ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.use((error, _req, res, _next) => {
  if (error.code === 11000) {
    const message = error.keyPattern?.roomNumber
      ? "That room number is already in use."
      : error.keyPattern?.email
        ? "Email is already registered."
        : "A record with that value already exists.";
    return res.status(409).json({ message });
  }

  if (error.name === "ValidationError" || error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "The request data is invalid." });
  }

  console.error("Unhandled request error:", error);
  return res.status(500).json({ message: "An unexpected server error occurred." });
});

module.exports = app;
