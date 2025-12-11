const User = require("../models/User");
const Post = require("../models/Post");

// GET /api/users/me
// returns profile of logged-in user (private)
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // optionally include user's posts
    const posts = await Post.find({ user: req.userId }).sort({ createdAt: -1 });

    res.json({ user, posts });
  } catch (err) {
    console.error("Get my profile error:", err);
    res.status(500).json({ message: "Server error while fetching profile" });
  }
};

// PUT /api/users/me
// update profile (private)
// PUT /api/users/me
// update profile (private) — now accepts locationId to set user.location
// PUT /api/users/me
exports.updateMyProfile = async (req, res) => {
  try {
    const allowedUpdates = ["name", "avatarUrl", "locationId"];
    const updates = {};

    allowedUpdates.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    if (updates.locationId) {
      const Location = require("../models/Location");
      const loc = await Location.findById(updates.locationId);
      if (!loc) return res.status(400).json({ message: "Invalid locationId" });
      updates.location = loc._id;
      delete updates.locationId;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select("-password");
    res.json({ message: "Profile updated", user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};


// GET /api/users/:id
// public view of another user's profile (without private fields)
exports.getUserProfileById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password -email -role");
    if (!user) return res.status(404).json({ message: "User not found" });

    // optionally include public posts by that user
    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });

    res.json({ user, posts });
  } catch (err) {
    console.error("Get user profile error:", err);
    res.status(500).json({ message: "Server error while fetching user profile" });
  }
};
// PUT /api/users/location
// body: { locationId }
// auth required
exports.setLocation = async (req, res) => {
  try {
    const { locationId } = req.body;
    if (!locationId) {
      return res.status(400).json({ message: "locationId is required" });
    }

    const Location = require("../models/Location");
    const loc = await Location.findById(locationId);
    if (!loc) {
      return res.status(400).json({ message: "Invalid locationId" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { location: loc._id },
      { new: true }
    ).select("-password");

    res.json({ message: "Location set", user });
  } catch (err) {
    console.error("Set location error:", err);
    res.status(500).json({ message: "Server error while setting location" });
  }
};
