const Comment = require("../models/Comment");
const Post = require("../models/Post");

// POST /api/comments
// body: { postId, text }
// logged-in users only
exports.createComment = async (req, res) => {
  try {
    const { postId, text } = req.body;

    if (!postId || !text || text.trim() === "") {
      return res.status(400).json({ message: "postId and text are required" });
    }

    // ensure post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = await Comment.create({
      post: postId,
      user: req.userId, // from authMiddleware
      text,
    });

    // populate user data for better frontend
    const populatedComment = await comment.populate("user", "name email");

    res.status(201).json({
      message: "Comment added",
      comment: populatedComment,
    });
  } catch (err) {
    console.error("Create comment error:", err);
    res.status(500).json({ message: "Server error while adding comment" });
  }
};

// GET /api/posts/:postId/comments
// public - anyone can see comments
exports.getCommentsForPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .populate("user", "name email")
      .sort({ createdAt: 1 }); // oldest first

    res.json(comments);
  } catch (err) {
    console.error("Get comments error:", err);
    res.status(500).json({ message: "Server error while fetching comments" });
  }
};

// DELETE /api/comments/:id
// only comment owner can delete
exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.userId;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not allowed to delete this comment" });
    }

    await Comment.findByIdAndDelete(commentId);

    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ message: "Server error while deleting comment" });
  }
};
