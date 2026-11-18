const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Please sign in to continue." });
  }

  try {
    const token = header.slice("Bearer ".length);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Your account is no longer available. Please sign in again." });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: "Your session has expired. Please sign in again." });
  }
}

module.exports = { protect };
