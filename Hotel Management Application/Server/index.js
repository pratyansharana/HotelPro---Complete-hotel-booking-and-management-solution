const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./config");
const authRoutes = require("./Routes/authRoutes");
const adminRoutes = require("./Routes/adminRoutes");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "unavailable",
    database: connected ? "connected" : "disconnected",
  });
});

app.use("/api", (_req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database is unavailable. Please try again later.",
    });
  }

  return next();
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

async function startServer() {
  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32 ||
    process.env.JWT_SECRET.startsWith("replace-with-")
  ) {
    throw new Error(
      "Set JWT_SECRET in Server/.env to a random value at least 32 characters long.",
    );
  }

  await connectDB();

  const port = Number(process.env.PORT) || 5000;
  const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  server.on("error", (error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
