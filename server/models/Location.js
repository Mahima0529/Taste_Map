const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },  // e.g. "IIT Delhi"
    type: { type: String, default: "college" },             // college, city, area
    slug: { type: String },                                 // optional
  },
  { timestamps: true }
);

module.exports = mongoose.model("Location", LocationSchema);
