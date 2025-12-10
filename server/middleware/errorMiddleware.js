// 404 handler
exports.notFound = (req, res, next) => {
  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`,
  });
};

// generic error handler
exports.errorHandler = (err, req, res, next) => {
  console.error("Error middleware:", err);

  const status = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(status).json({
    message: err.message || "Server error",
  });
};
