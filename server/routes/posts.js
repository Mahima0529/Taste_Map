const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const postController = require("../controllers/postController");

// TEST
router.get("/test", (req, res) => {
  res.json({ message: "Posts route working!" });
});

// PUBLIC
router.get("/", postController.getAllPosts);
router.get("/search", postController.searchPosts);
router.get("/:id", postController.getPostById);

// LOGGED-IN USER ROUTES
router.get("/user/me", authMiddleware, postController.getMyPosts);
router.post("/", authMiddleware, postController.createPost);
router.put("/:id", authMiddleware, postController.updatePost);
router.delete("/:id", authMiddleware, postController.deletePost);
router.post("/:id/like", authMiddleware, postController.likePost);
router.post("/:id/unlike", authMiddleware, postController.unlikePost);

module.exports = router;
