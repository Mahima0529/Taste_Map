const express = require("express");
const router = express.Router();
const Location = require("../models/Location");

// GET /api/locations  (public) - list all locations (sorted)
router.get("/", async (req, res) => {
  try {
    const locations = await Location.find().sort({ name: 1 });
    res.json(locations);
  } catch (err) {
    console.error("Get locations error:", err);
    res.status(500).json({ message: "Server error while fetching locations" });
  }
});

module.exports = router;
