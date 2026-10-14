const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const requireAdmin = require("../middlewares/adminMiddleware");
const {
  createRoom,
  deleteRoom,
  listRooms,
  updateRoomStatus,
} = require("../controllers/adminController");

const router = express.Router();

router.use(authenticate, requireAdmin);
router.get("/rooms", listRooms);
router.post("/rooms", createRoom);
router.patch("/rooms/:roomId/status", updateRoomStatus);
router.delete("/rooms/:roomId", deleteRoom);

module.exports = router;
