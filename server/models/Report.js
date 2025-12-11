const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
    seenByAdmin: { type: Boolean, default: false },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", ReportSchema);
