// controllers/reportController.js
const Report = require("../models/Report");
const Post = require("../models/Post");

// POST /api/reports
// body: { postId, reason }
// logged-in users can report
exports.createReport = async (req, res) => {
  try {
    const { postId, reason } = req.body;

    if (!postId || !reason || reason.trim() === "") {
      return res.status(400).json({ message: "postId and reason are required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // ensure seenByAdmin defaults to false (also default in schema)
    const report = await Report.create({
      post: postId,
      reportedBy: req.userId,
      reason,
      seenByAdmin: false, // explicit for safety
      status: 'open',     // optional
    });

    res.status(201).json({
      message: "Report submitted",
      report,
    });
  } catch (err) {
    console.error("Create report error:", err);
    res.status(500).json({ message: "Server error while creating report" });
  }
};

// GET /api/reports
// admin only - get all reports
// supports ?unread=true to return only unseen reports
exports.getAllReports = async (req, res) => {
  try {
    const { unread } = req.query;
    const filter = {};
    if (unread === 'true') filter.seenByAdmin = { $ne: true };

    const reports = await Report.find(filter)
      .populate("post", "foodName stallName locationText")
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    // helpful: unread count for admin badge
    const unreadCount = await Report.countDocuments({ seenByAdmin: { $ne: true } });

    res.json({ reports, unreadCount });
  } catch (err) {
    console.error("Get reports error:", err);
    res.status(500).json({ message: "Server error while fetching reports" });
  }
};

// PATCH /api/reports/:id/mark-seen
// admin only - mark a report as seen by admin (does not resolve it)
exports.markReportSeen = async (req, res) => {
  try {
    const reportId = req.params.id;
    const report = await Report.findByIdAndUpdate(
      reportId,
      { seenByAdmin: true },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: "Report not found" });

    return res.json({ message: "Report marked seen by admin", report });
  } catch (err) {
    console.error("Mark report seen error:", err);
    res.status(500).json({ message: "Server error while marking report seen" });
  }
};

// PUT /api/reports/:id/resolve
// admin only - mark a report as resolved
exports.resolveReport = async (req, res) => {
  try {
    const reportId = req.params.id;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.status = "resolved";
    report.seenByAdmin = true; // mark seen when resolving (helpful)
    await report.save();

    res.json({
      message: "Report marked as resolved",
      report,
    });
  } catch (err) {
    console.error("Resolve report error:", err);
    res.status(500).json({ message: "Server error while resolving report" });
  }
};
