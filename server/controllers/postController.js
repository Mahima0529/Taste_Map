const Post = require("../models/Post");

// CREATE POST
// POST /api/posts
exports.createPost = async (req, res) => {
  try {
    const {
      foodName,
      stallName,
      description,
      category,
      tags,
      locationText,
      latitude,
      longitude,
      imageUrl,
      rating,
      priceRange,
    } = req.body;

    if (!foodName || !locationText || !imageUrl) {
      return res.status(400).json({
        message: "foodName, locationText and imageUrl are required",
      });
    }

    const post = await Post.create({
      user: req.userId,
      foodName,
      stallName,
      description,
      category,
      tags,
      locationText,
      latitude,
      longitude,
      imageUrl,
      rating,
      priceRange,
    });

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ message: "Server error while creating post" });
  }
};

// GET ALL POSTS (PUBLIC)
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Get posts error:", err);
    res.status(500).json({ message: "Server error while fetching posts" });
  }
};

// GET SINGLE POST BY ID (PUBLIC)
// GET /api/posts/:id
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "name email");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.error("Get post by id error:", err);
    res.status(500).json({ message: "Server error while fetching post" });
  }
};

// GET POSTS OF LOGGED-IN USER
// GET /api/posts/user/me
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.userId })
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Get my posts error:", err);
    res.status(500).json({ message: "Server error while fetching my posts" });
  }
};

// SEARCH POSTS
// GET /api/posts/search?query=...
exports.searchPosts = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Query is required" });
    }

    const posts = await Post.find({
      $text: { $search: query },
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Search posts error:", err);
    res.status(500).json({ message: "Server error while searching posts" });
  }
};

// UPDATE POST (ONLY OWNER)
// PUT /api/posts/:id
exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    let post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not allowed to edit this post" });
    }

    const updatedFields = req.body;

    post = await Post.findByIdAndUpdate(postId, updatedFields, {
      new: true,
    });

    res.json({
      message: "Post updated",
      post,
    });
  } catch (err) {
    console.error("Update post error:", err);
    res.status(500).json({ message: "Server error while updating post" });
  }
};

// DELETE POST (ONLY OWNER)
// DELETE /api/posts/:id
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not allowed to delete this post" });
    }

    await Post.findByIdAndDelete(postId);

    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ message: "Server error while deleting post" });
  }
};

// LIKE POST
// POST /api/posts/:id/like
exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.likes.includes(userId)) {
      return res.json({
        message: "Already liked",
        likesCount: post.likes.length,
      });
    }

    post.likes.push(userId);
    await post.save();

    res.json({
      message: "Post liked",
      likesCount: post.likes.length,
    });
  } catch (err) {
    console.error("Like post error:", err);
    res.status(500).json({ message: "Server error while liking post" });
  }
};

// UNLIKE POST
// POST /api/posts/:id/unlike
exports.unlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.likes = post.likes.filter(
      (id) => id.toString() !== userId.toString()
    );
    await post.save();

    res.json({
      message: "Post unliked",
      likesCount: post.likes.length,
    });
  } catch (err) {
    console.error("Unlike post error:", err);
    res.status(500).json({ message: "Server error while unliking post" });
  }
};
