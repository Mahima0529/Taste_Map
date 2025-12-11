const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

// GET my profile (private)
router.get("/me", authMiddleware, userController.getMyProfile);


// UPDATE my profile (private)
router.put("/me", authMiddleware, userController.updateMyProfile);
// set or change user's location (private)
router.put("/location", authMiddleware, userController.setLocation);


// GET public user profile by id (public)
router.get("/:id", userController.getUserProfileById);


module.exports = router;
