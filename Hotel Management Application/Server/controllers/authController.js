const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/schema");

function createToken(user) {
  return jwt.sign(
    { userType: user.userType },
    process.env.JWT_SECRET,
    { subject: user.id, expiresIn: "7d" },
  );
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    userType: user.userType,
  };
}

function currentUser(req, res) {
  return res.json({ user: publicUser(req.authUser) });
}

async function register(req, res) {
  const { name, email, password, phone } = req.body || {};

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof phone !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !phone.trim()
  ) {
    return res.status(400).json({
      message: "Name, email, password, and phone are required.",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters long.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({ message: "Email is already registered." });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    phone: phone.trim(),
    userType: "customer",
  });

  return res.status(201).json({
    message: "User registered successfully.",
    token: createToken(user),
    user: publicUser(user),
  });
}

async function login(req, res) {
  const { email, password } = req.body || {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() })
    .select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  return res.json({
    message: "Login successful.",
    token: createToken(user),
    user: publicUser(user),
  });
}

module.exports = { currentUser, login, register };
