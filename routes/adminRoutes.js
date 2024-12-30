const express = require("express");
const router = express.Router();
const {
    addCourse,
    removeCourse,
    updateCourse,
    getCoursesInALevel,
    getStudentDetails,
    getTeacherDetails,
    adminAccess,
    deleteTeacher,
    deleteStudent,
    suspend,
    createTeacher,
    assignCourseToTeacher
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

// Admin only routes
router.post("/add-course", protect, admin, addCourse);
router.delete("/remove-course/:id", protect, admin, removeCourse);
router.put("/update-course/:id", protect, admin, updateCourse);
router.get("/get-courses-in-level", protect, admin, getCoursesInALevel);
router.get("/get-teacher-details", protect, admin, getTeacherDetails);
router.get("/get-student-details", protect, admin, getStudentDetails);
router.put("/admin-access", protect, admin, adminAccess);
router.delete("/delete-teacher", protect, admin, deleteTeacher);
router.delete("/delete-student", protect, admin, deleteStudent);
router.put("/suspend", protect, admin, suspend);
router.post("/create-teacher", protect, admin, createTeacher);
router.put("/assign-course-to-teacher/:id", protect, admin, assignCourseToTeacher);



module.exports = router;
