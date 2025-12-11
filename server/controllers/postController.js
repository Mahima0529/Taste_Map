
const Post = require("../models/Post");
const User = require("../models/User");
const Location = require("../models/Location"); // optional, used for validation/populate

// Create a new post
// POST /api/posts
// Auth required (req.userId set by authMiddleware)
// Create a new post (Option A - auto-attach user's location but REQUIRE location)
exports.createPost = async (req, res) => {
  try {
    const {
      foodName,
      stallName,
      description,
      category,
      tags,
      imageUrl,
      rating,
      priceRange,
      locationText,
      latitude,
      longitude,
    } = req.body;

    // minimal validation
    if (!foodName || !imageUrl) {
      return res.status(400).json({ message: "foodName and imageUrl are required" });
    }

    // fetch user to attach user id and user's location automatically
    const user = await User.findById(req.userId).select("location");
    if (!user) return res.status(401).json({ message: "User not found" });

    // ENFORCEMENT: user must have a selected location
    if (!user.location) {
      return res.status(400).json({
        message: "Please select a location (college/city) on your profile before creating posts",
      });
    }

    const postData = {
      foodName,
      stallName: stallName || "",
      description: description || "",
      category: category || "",
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      imageUrl,
      rating: rating || null,
      priceRange: priceRange || null,
      user: req.userId,
      locationText: locationText || "",
      latitude: latitude || null,
      longitude: longitude || null,
      // auto-attach user's location (required)
      location: user.location,
    };

    const post = await Post.create(postData);

    // return populated post for convenience
    const populated = await Post.findById(post._id)
      .populate("user", "name avatarUrl")
      .populate("location", "name slug");

    res.status(201).json({ message: "Post created", post: populated });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ message: "Server error while creating post" });
  }
};

// Get all posts (with optional filters: location, category, search)
// GET /api/posts
exports.getAllPosts = async (req, res) => {
  try {
    const { location, category, q } = req.query;
    const filter = {};

    if (location) filter.location = location; // expects location id
    if (category) filter.category = category;

    // simple search across foodName, stallName, locationText, tags
    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [
        { foodName: regex },
        { stallName: regex },
        { locationText: regex },
        { tags: regex },
      ];
    }

    const posts = await Post.find(filter)
      .populate("user", "name avatarUrl")
      .populate("location", "name slug")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Get posts error:", err);
    res.status(500).json({ message: "Server error while fetching posts" });
  }
};

// Get single post by id
// GET /api/posts/:id
exports.getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId)
      .populate("user", "name avatarUrl")
      .populate("location", "name slug");

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (err) {
    console.error("Get post error:", err);
    res.status(500).json({ message: "Server error while fetching post" });
  }
};

// Update a post (owner only)
// PUT /api/posts/:id
exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const updates = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // only owner can update
    if (post.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Not allowed to update this post" });
    }

    // disallow manual override of location (Option A) unless you intentionally allow it:
    if (updates.location && updates.location !== post.location?.toString()) {
      // optional: prevent change
      delete updates.location;
    }

    // apply allowed updates
    const allowed = [
      "foodName",
      "stallName",
      "description",
      "category",
      "tags",
      "imageUrl",
      "rating",
      "priceRange",
      "locationText",
      "latitude",
      "longitude",
    ];

    allowed.forEach((key) => {
      if (updates[key] !== undefined) post[key] = updates[key];
    });

    await post.save();

    const populated = await Post.findById(post._id)
      .populate("user", "name avatarUrl")
      .populate("location", "name slug");

    res.json({ message: "Post updated", post: populated });
  } catch (err) {
    console.error("Update post error:", err);
    res.status(500).json({ message: "Server error while updating post" });
  }
};

// Delete a post (owner or admin allowed)
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // owner or admin can delete (if you use roles)
    const user = await User.findById(req.userId);
    const isOwner = post.user.toString() === req.userId.toString();
    const isAdmin = user && user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not allowed to delete this post" });
    }

    await Post.findByIdAndDelete(postId);
    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ message: "Server error while deleting post" });
  }
};

// Like a post
// POST /api/posts/:id/like
exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // if user already liked, ignore
    if (post.likes && post.likes.includes(userId)) {
      return res.status(400).json({ message: "You already liked this post" });
    }

    post.likes = post.likes ? [...post.likes, userId] : [userId];
    await post.save();

    res.json({ message: "Post liked", likesCount: post.likes.length });
  } catch (err) {
    console.error("Like post error:", err);
    res.status(500).json({ message: "Server error while liking post" });
  }
};

// Unlike a post
// POST /api/posts/:id/unlike
exports.unlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.likes = (post.likes || []).filter((id) => id.toString() !== userId.toString());
    await post.save();

    res.json({ message: "Post unliked", likesCount: post.likes.length });
  } catch (err) {
    console.error("Unlike post error:", err);
    res.status(500).json({ message: "Server error while unliking post" });
  }
};


// Get posts by logged-in user
// GET /api/posts/user/me
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.userId })
      .populate("location", "name slug")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Get my posts error:", err);
    res.status(500).json({ message: "Server error while fetching user's posts" });
  }
};

// Search posts (helper endpoint) - alternative to q param in getAllPosts
// GET /api/posts/search?q=term
exports.searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "q query param required" });

    const regex = new RegExp(q, "i");
    const posts = await Post.find({
      $or: [{ foodName: regex }, { stallName: regex }, { locationText: regex }, { tags: regex }],
    })
      .populate("user", "name avatarUrl")
      .populate("location", "name slug")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Search posts error:", err);
    res.status(500).json({ message: "Server error while searching posts" });
  }
};

// GET /api/posts/feed
// Returns posts for the logged-in user's location (auth required)
exports.getFeed = async (req, res) => {
  try {
    // find the user's location
    const user = await User.findById(req.userId).select("location");
    if (!user) return res.status(401).json({ message: "User not found" });

    if (!user.location) {
      return res.status(400).json({ message: "No location selected on your profile" });
    }

    // optional: support pagination via query params page & limit
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ location: user.location })
      .populate("user", "name avatarUrl")
      .populate("location", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ page, limit, count: posts.length, posts });
  } catch (err) {
    console.error("Get feed error:", err);
    res.status(500).json({ message: "Server error while fetching feed" });
  }
};
exports.savePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.savedPosts.includes(postId)) {
      return res.status(400).json({ message: "Already saved" });
    }

    user.savedPosts.push(postId);
    await user.save();

    res.json({ message: "Post saved" });
  } catch (err) {
    console.error("Save post error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.unsavePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.savedPosts = user.savedPosts.filter(
      (id) => id.toString() !== postId.toString()
    );

    await user.save();

    res.json({ message: "Post unsaved" });
  } catch (err) {
    console.error("Unsave post error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: "savedPosts",
      populate: [
        { path: "user", select: "name avatarUrl" },
        { path: "location", select: "name" }
      ]
    });

    res.json(user.savedPosts);
  } catch (err) {
    console.error("Get saved posts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
