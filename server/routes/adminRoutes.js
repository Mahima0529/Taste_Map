// routes/adminRoutes.js
const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware'); // <-- add this
const isAdmin = require('../middleware/isAdmin');      // <-- your admin check
const admin = require('../controllers/adminController');

// Protect all admin routes: must be logged in AND admin
router.use(auth);     // ensures req.userId exists
router.use(isAdmin);  // checks role === admin

// admin report actions
router.get('/reports', admin.getReports);
router.patch('/reports/:id/mark-seen', admin.markReportSeen);

// admin delete user / post
router.delete('/users/:id', admin.deleteUser);
router.delete('/posts/:id', admin.deletePost);

// admin comment moderation
router.patch('/posts/:postId/comments/:commentId/hide', admin.hideComment);
router.delete('/posts/:postId/comments/:commentId', admin.deleteComment);

module.exports = router;
