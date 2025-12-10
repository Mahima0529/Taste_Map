const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const commentController = require("../controllers/commentController");

// CREATE COMMENT (requires login)
// POST /api/comments
router.post("/", authMiddleware, commentController.createComment);

// GET COMMENTS FOR A POST (public)
// GET /api/posts/:postId/comments
router.get("/post/:postId", commentController.getCommentsForPost);

// DELETE COMMENT (requires login + must be owner)
// DELETE /api/comments/:id
router.delete("/:id", authMiddleware, commentController.deleteComment);

module.exports = router;
