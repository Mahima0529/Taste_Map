// server/models/Post.js
const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    foodName: { type: String, required: true },
    stallName: { type: String, default: "" },
    description: { type: String, default: "" },
    category: { type: String, default: "" },
    tags: [{ type: String }],

    imageUrl: { type: String, required: true },

    // optional fields
    rating: { type: Number, default: null },
    priceRange: { type: String, default: "" },

    // location info: reference to Location and free-text & coords
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      default: null,
    },
    locationText: { type: String, default: "" },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },

    // who posted
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // likes stored as array of user ids
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Optional: text index to support search across fields
PostSchema.index({
  foodName: "text",
  stallName: "text",
  category: "text",
  tags: "text",
  locationText: "text",
});

module.exports = mongoose.model("Post", PostSchema);
