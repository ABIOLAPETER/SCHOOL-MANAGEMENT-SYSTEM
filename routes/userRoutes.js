const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// Register a new user (admin can assign roles)
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

module.exports = router;
