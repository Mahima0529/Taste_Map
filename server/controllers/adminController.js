// controllers/adminController.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Report = require('../models/Report');
const Comment = require('../models/Comment');

/**
 * GET /admin/reports
 * Return list of reports for admin (newest first) - used as notifications feed
 * Query params:
 *   ?unread=true  -> only unread reports
 */
exports.getReports = async (req, res) => {
  try {
    const { unread } = req.query;
    const filter = {};
    if (unread === 'true') filter.seenByAdmin = { $ne: true };

    const reports = await Report.find(filter)
      .populate('reportedBy', 'name email')   // adjust fields as per your User model
      .populate('post', 'foodName stallName locationText') // use 'post' (matches report schema)
      .sort({ createdAt: -1 })
      .lean();

    // optional: count unread
    const unreadCount = await Report.countDocuments({ seenByAdmin: { $ne: true } });
    return res.json({ ok: true, unreadCount, reports });
  } catch (err) {
    console.error('getReports', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
};

/**
 * PATCH /admin/reports/:id/mark-seen
 * Mark a report as seen (admin dismissed/checked it)
 */
exports.markReportSeen = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findByIdAndUpdate(id, { seenByAdmin: true }, { new: true });
    if (!report) return res.status(404).json({ ok: false, message: 'Report not found' });
    return res.json({ ok: true, report });
  } catch (err) {
    console.error('markReportSeen', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
};

/**
 * DELETE /admin/users/:id
 * Delete a user account (admin)
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // delete user
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ ok: false, message: 'User not found' });

    // optional cleanup examples (choose what your app needs):
    // 1) delete user's posts:
    await Post.deleteMany({ author: id });
    // 2) delete user's comments:
    await Comment.deleteMany({ author: id });
    // 3) remove reports made by user:
    await Report.deleteMany({ reportedBy: id });

    return res.json({ ok: true, message: 'User and related content deleted' });
  } catch (err) {
    console.error('deleteUser', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
};

/**
 * DELETE /admin/posts/:id
 * Delete a post (admin)
 */
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndDelete(id);
    if (!post) return res.status(404).json({ ok: false, message: 'Post not found' });

    // remove comments belonging to that post:
    await Comment.deleteMany({ post: id });

    // remove reports targeting this post:
    await Report.deleteMany({ post: id });

    return res.json({ ok: true, message: 'Post and its comments/reports deleted' });
  } catch (err) {
    console.error('deletePost', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
};

/**
 * PATCH /admin/posts/:postId/comments/:commentId/hide
 * Hide a comment on a specific post (set visible=false)
 */
exports.hideComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const comment = await Comment.findOneAndUpdate(
      { _id: commentId, post: postId },
      { visible: false },
      { new: true }
    );
    if (!comment) return res.status(404).json({ ok: false, message: 'Comment not found for the given post' });
    return res.json({ ok: true, comment });
  } catch (err) {
    console.error('hideComment', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
};

/**
 * DELETE /admin/posts/:postId/comments/:commentId
 * Permanently delete a comment from a specific post
 */
exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const comment = await Comment.findOneAndDelete({ _id: commentId, post: postId });
    if (!comment) return res.status(404).json({ ok: false, message: 'Comment not found for the given post' });
    return res.json({ ok: true, message: 'Comment deleted' });
  } catch (err) {
    console.error('deleteComment', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
};
