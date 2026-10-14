const mongoose = require("mongoose");
const { Room } = require("../models/Room");

const roomStatuses = ["available", "booked", "maintenance"];

async function listRooms(_req, res) {
  const rooms = await Room.find().sort({ roomNumber: 1 });
  return res.json({ rooms });
}

async function createRoom(req, res) {
  const {
    roomNumber,
    roomType,
    pricePerNight,
    capacity,
    description = "",
  } = req.body || {};

  if (
    typeof roomNumber !== "string" ||
    !roomNumber.trim() ||
    typeof roomType !== "string" ||
    !roomType.trim() ||
    !Number.isFinite(Number(pricePerNight)) ||
    Number(pricePerNight) < 0 ||
    !Number.isInteger(Number(capacity)) ||
    Number(capacity) < 1 ||
    Number(capacity) > 20 ||
    typeof description !== "string"
  ) {
    return res.status(400).json({
      message: "Enter a room number, room type, valid nightly price, and capacity from 1 to 20.",
    });
  }

  const room = await Room.create({
    roomNumber: roomNumber.trim(),
    roomType: roomType.trim(),
    pricePerNight: Number(pricePerNight),
    capacity: Number(capacity),
    description: description.trim(),
  });

  return res.status(201).json({ message: "Room added.", room });
}

async function updateRoomStatus(req, res) {
  const { status } = req.body || {};
  if (!roomStatuses.includes(status)) {
    return res.status(400).json({
      message: `Status must be one of: ${roomStatuses.join(", ")}.`,
    });
  }

  if (!mongoose.isValidObjectId(req.params.roomId)) {
    return res.status(400).json({ message: "Invalid room ID." });
  }

  const room = await Room.findByIdAndUpdate(
    req.params.roomId,
    { status },
    { new: true, runValidators: true },
  );
  if (!room) {
    return res.status(404).json({ message: "Room not found." });
  }

  return res.json({ message: "Room status updated.", room });
}

async function deleteRoom(req, res) {
  if (!mongoose.isValidObjectId(req.params.roomId)) {
    return res.status(400).json({ message: "Invalid room ID." });
  }

  const room = await Room.findByIdAndDelete(req.params.roomId);
  if (!room) {
    return res.status(404).json({ message: "Room not found." });
  }

  return res.json({ message: "Room removed." });
}

module.exports = { createRoom, deleteRoom, listRooms, updateRoomStatus };
