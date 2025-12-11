const User = require("../models/User");

module.exports = async function (req, res, next) {
  try {
    // authMiddleware should already have set req.userId
    if (!req.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    // you can also store role on request if needed
    req.userRole = user.role;

    next();
  } catch (err) {
    console.error("isAdmin middleware error:", err);
    return res.status(500).json({ message: "Server error checking admin" });
  }
};
