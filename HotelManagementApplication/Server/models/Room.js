const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
      unique: true,
    },
    roomType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    status: {
      type: String,
      enum: ["available", "booked", "maintenance"],
      default: "available",
      required: true,
    },
  },
  { timestamps: true },
);

const Room = mongoose.model("Room", roomSchema);

module.exports = { Room };
