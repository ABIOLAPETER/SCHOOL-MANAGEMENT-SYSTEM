const asyncHandler = require("express-async-handler");
const User = require("../models/userModel.js");
const Level = require("../models/levelModel.js");
const Student = require("../models/studentModel.js");
const Teacher = require("../models/teacherModel.js");
const Course = require("../models/courseModel.js");
const HttpError = require("../models/errorModel.js");


const createLevel = asyncHandler(async (req, res, next) => {
    const { level, students, courses } = req.body;

    try {
        if (!level ) {
            return next(new HttpError("Level, courses, and students are required", 422));
        }

        // // Check for existing level
        // const existingLevel = await Level.findOne({ level });
        // if (existingLevel) {
        //     return next(new HttpError("Level already exists", 400));
        // }

        // // Validate courses and students
        // const courseCount = await Course.countDocuments({ _id: { $in: courses } });
        // const studentCount = await Student.countDocuments({ _id: { $in: students } });

        // if (courseCount !== courses.length) {
        //     return next(new HttpError("One or more courses do not exist", 404));
        // }
        // if (studentCount !== students.length) {
        //     return next(new HttpError("One or more students do not exist", 404));
        // }

        // Create the level
        const newLevel = await Level.create({ level, courses, students });

        res.status(201).json({ msg: "Level created successfully", level: newLevel });
    } catch (error) {
        console.log(error)
        return next(new HttpError(error.message, 500));
    }
});


const addCourseToLevel = asyncHandler(async (req, res, next) => {
    const { levelId, courseId } = req.body;

    try {
        const level = await Level.findById(levelId);
        const course = await Course.findById(courseId);

        if (!level) return next(new HttpError("Level not found", 404));
        if (!course) return next(new HttpError("Course not found", 404));

        if (level.courses.includes(courseId)) {
            return next(new HttpError("Course is already added to this level", 400));
        }

        level.courses.push(courseId);
        await level.save();

        res.status(200).json({ msg: "Course added to level successfully", level });
    } catch (error) {
        console.log(error)
        return next(new HttpError(error.message, 500));
    }
});




const addStudentToLevel = asyncHandler(async (req, res, next) => {
    const { levelId, studentId } = req.body;

    try {
        const level = await Level.findById(levelId);
        const student = await Student.findById(studentId);

        if (!level) return next(new HttpError("Level not found", 404));
        if (!student) return next(new HttpError("Student not found", 404));

        if (level.students.includes(studentId)) {
            return next(new HttpError("Student is already added to this level", 400));
        }

        level.students.push(studentId);
        await level.save();

        res.status(200).json({ msg: "Student added to level successfully", level });
    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
});




const getLevelDetails = asyncHandler(async (req, res, next) => {
    const { levelId } = req.params;

    try {
        const level = await Level.findById(levelId)
            .populate("courses", "courseName")
            .populate("students", "name status");

        if (!level) return next(new HttpError("Level not found", 404));

        res.status(200).json({ level });
    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
});




const deleteLevel = asyncHandler(async (req, res, next) => {
    const { levelId } = req.params;

    try {
        const level = await Level.findById(levelId);

        if (!level) return next(new HttpError("Level not found", 404));

        // Optionally, handle cascading effects (e.g., removing courses from students or vice versa)
        await level.remove();

        res.status(200).json({ msg: "Level deleted successfully" });
    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
});

module.exports = {
    deleteLevel,
    addCourseToLevel,
    getLevelDetails,
    addStudentToLevel,
    createLevel
}
