const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");

const { notFound, errorHandler } = require("./middleware/errorMiddleware"); // ⭐ ADD THIS HERE
const commentRoutes = require("./routes/comments");
const reportRoutes = require("./routes/reports");
const userRoutes = require("./routes/users");
const locationRoutes = require("./routes/locations");
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { dbName: "taste_map" })
  .then(() =>{ console.log("✅ MongoDB Connected");
    
  })
  
  .catch((err) => console.log("❌ MongoDB Error:", err));

// test route
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend is running and MongoDB connected! 🎉",
  });
});

// ⭐ ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// const commentRoutes = require("./routes/comments");
app.use("/api/comments", commentRoutes);

// const reportRoutes = require("./routes/reports");
app.use("/api/reports", reportRoutes);

app.use("/api/users", userRoutes);
app.use("/api/locations", locationRoutes);
app.use('/admin', adminRoutes);


// ⭐ ADD ERROR HANDLER MIDDLEWARE *AFTER ROUTES*
app.use(notFound);
app.use(errorHandler);

// start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
