const express = require("express");
const router = express.Router();
const {
    registerCourse,
    viewDetails,
    updateDetails,
    dropCourse,
    fetchClassDetails
} = require("../controllers/studentController");
const { protect } = require("../middleware/authMiddleware");

// Student routes
router.post("/register-course", protect, registerCourse);  // Register for courses
router.get("/view-details", protect, viewDetails);          // View student details
router.put("/update-details", protect, updateDetails);      // Update student details
router.delete("/drop-course", protect, dropCourse);         // Drop a registered course
router.get("/fetch-class-details", protect, fetchClassDetails); // Fetch class details

module.exports = router;
