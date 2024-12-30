const express = require("express");
const router = express.Router();
const {
    createLevel,
    addCourseToLevel,
    addStudentToLevel,
    getLevelDetails,
    deleteLevel
} = require("../controllers/levelController");
const { protect, admin } = require("../middleware/authMiddleware");

// Level management routes
router.post("/create", protect, admin, createLevel);               // Create a new level
router.put("/add-course", protect, admin, addCourseToLevel);       // Add course to a level
router.put("/add-student", protect, admin, addStudentToLevel);     // Add student to a level
router.get("/:levelId", protect, getLevelDetails);                 // Get details of a specific level
router.delete("/:levelId", protect, admin, deleteLevel);           // Delete a level

module.exports = router;
