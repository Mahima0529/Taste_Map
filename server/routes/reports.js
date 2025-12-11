// routes/report.js
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");
const {
  createReport,
  getAllReports,
  resolveReport,
  markReportSeen, // new
} = require("../controllers/reportController");

// user reports a post
router.post("/", auth, createReport);

// admin gets all reports
router.get("/", auth, isAdmin, getAllReports);

// admin mark as seen (new)
router.patch("/:id/mark-seen", auth, isAdmin, markReportSeen);

// admin resolves
router.put("/:id/resolve", auth, isAdmin, resolveReport);

module.exports = router;
