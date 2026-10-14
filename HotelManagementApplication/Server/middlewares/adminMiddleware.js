function requireAdmin(req, res, next) {
  if (req.authUser?.userType !== "admin") {
    return res.status(403).json({ message: "Admin access is required." });
  }

  return next();
}

module.exports = requireAdmin;
