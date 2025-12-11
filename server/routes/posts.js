const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const postController = require("../controllers/postController");

// TEST
router.get("/test", (req, res) => {
  res.json({ message: "Posts route working!" });
});

/* ------------------------
   IMPORTANT: SPECIFIC ROUTES FIRST
-------------------------*/

// FEED route must be BEFORE "/:id"
router.get("/feed", authMiddleware, postController.getFeed);

// Search must also be before "/:id"
router.get("/search", postController.searchPosts);

// GET all posts (public)
router.get("/", postController.getAllPosts);
router.post("/:id/save", authMiddleware, postController.savePost);
router.post("/:id/unsave", authMiddleware, postController.unsavePost);
router.get("/saved/me", authMiddleware, postController.getSavedPosts);


/* ------------------------
   ROUTES THAT USE :id 
-------------------------*/

// Get single post by id
router.get("/:id", postController.getPostById);

// Logged-in user routes
router.get("/user/me", authMiddleware, postController.getMyPosts);
router.post("/", authMiddleware, postController.createPost);
router.put("/:id", authMiddleware, postController.updatePost);
router.delete("/:id", authMiddleware, postController.deletePost);
router.post("/:id/like", authMiddleware, postController.likePost);
router.post("/:id/unlike", authMiddleware, postController.unlikePost);

module.exports = router;
