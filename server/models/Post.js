const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // who uploaded this post
    },

    // 🥟 FOOD INFO
    foodName: {
      type: String,
      required: true, // e.g. "Veg Momos"
    },

    stallName: {
      type: String,   // e.g. "Sharma Momos"
    },

    description: {
      type: String,   // extra info user wants to share
    },

    category: {
      type: String,   // e.g. "momos", "pizza", "cafe"
    },

    tags: [
      {
        type: String, // e.g. ["spicy", "cheap", "street-food"]
      },
    ],

    // 📍 LOCATION INFO
    locationText: {
      type: String,
      required: true, // e.g. "Outside Gate 2 near ABC Hostel"
    },

    latitude: {
      type: Number,   // optional map coordinate
    },
    longitude: {
      type: Number,   // optional map coordinate
    },

    // 🖼️ IMAGE
    imageUrl: {
      type: String,
      required: true, // URL of the uploaded photo
    },

    // ⭐ RATING + PRICE
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    priceRange: {
      type: String,   // e.g. "₹50–80"
    },

    // 👍 LIKES / UPVOTES
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",  // users who liked this post
      },
    ],
  },
  { timestamps: true } // createdAt, updatedAt
);

// 🔍 SEARCH INDEX: food, stall, category, tags, location
PostSchema.index({
  foodName: "text",
  stallName: "text",
  category: "text",
  tags: "text",
  locationText: "text",
});

module.exports = mongoose.model("Post", PostSchema);
