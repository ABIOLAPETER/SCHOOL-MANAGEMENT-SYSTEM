const express = require("express");
const router = express.Router();
const { viewDetails, updateDetails } = require("../controllers/teacherController");
const { protect } = require("../middleware/authMiddleware");

// Teacher routes
router.get("/view-details", protect, viewDetails);          // View teacher details
router.put("/update-details", protect, updateDetails);      // Update teacher details

module.exports = router;
