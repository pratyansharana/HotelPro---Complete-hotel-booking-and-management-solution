const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const { currentUser, login, register } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, currentUser);

module.exports = router;
