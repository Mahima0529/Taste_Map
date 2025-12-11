const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // minimal profile
    avatarUrl: { type: String },

    // who/which location (college / city) the user is connected to
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: false, // can require true if you force selection
    },
    savedPosts: [
  { type: mongoose.Schema.Types.ObjectId, ref: "Post" }
],

    // keep role if you still want admin functionality
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
