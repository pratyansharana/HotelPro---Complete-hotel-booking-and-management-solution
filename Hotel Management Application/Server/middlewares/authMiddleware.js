const jwt = require("jsonwebtoken");
const { User } = require("../models/schema");

async function authenticate(req, res, next) {
  const authorization = req.get("authorization");
  const [scheme, token] = authorization?.split(" ") || [];

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication is required." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: "Your session is no longer valid." });
    }

    req.authUser = user;
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Your session is invalid or expired." });
    }
    return next(error);
  }
}

module.exports = authenticate;
