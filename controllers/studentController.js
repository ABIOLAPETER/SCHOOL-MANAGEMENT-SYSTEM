const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Level = require("../models/levelModel");
const Student = require("../models/studentModel");
const Course = require("../models/courseModel");
const HttpError = require("../models/errorModel.js");

// Register courses for a student
const registerCourse = asyncHandler(async (req, res, next) => {
    try {
        const { courses } = req.body;

        if (!courses || courses.length === 0) {
            return next(new HttpError("Provide courses you want to register for", 422));
        }

        const student = await Student.findOne({ user: req.user.id }).populate('courses');
        if (!student) {
            return next(new HttpError('Student not found', 404));
        }

        const coursesToRegister = await Course.find({ _id: { $in: courses } });
        if (coursesToRegister.length !== courses.length) {
            return next(new HttpError('One or more courses not found', 404));
        }

        const alreadyRegistered = student.courses.filter(course =>
            coursesToRegister.some(c => c._id.toString() === course._id.toString())
        );

        if (alreadyRegistered.length > 0) {
            return next(new HttpError("One or more of these courses have already been registered", 400));
        }

        student.courses.push(...coursesToRegister.map(course => course._id));
        await student.save();

        return res.status(200).json({
            message: "Courses registered successfully",
            registeredCourses: coursesToRegister
        });

    } catch (error) {
        return next(new HttpError(error.message || "An unexpected error occurred", 500));
    }
});

// View student details
const viewDetails = asyncHandler(async (req, res, next) => {
    try {
        const student = await Student.findOne({ user: req.user.id })
            .populate('courses', 'courseName')
            .populate('level', 'level');

        if (!student) {
            return next(new HttpError('User is not a student', 404));
        }

        return res.status(200).json({
            student
        });

    } catch (error) {
        return next(new HttpError(error.message || "An unexpected error occurred", 500));
    }
});

// Update student details
const updateDetails = asyncHandler(async (req, res, next) => {
    try {
        const { name, parent } = req.body;

        if (!name && !parent) {
            return next(new HttpError("Provide at least one field to update", 422));
        }

        const student = await Student.findOne({ user: req.user.id });
        if (!student) {
            return next(new HttpError('User is not a student', 404));
        }

        const updatedFields = {};
        if (name) updatedFields.name = name;
        if (parent) updatedFields.parent = parent;

        const updatedStudent = await Student.findByIdAndUpdate(student._id, updatedFields, { new: true });

        return res.status(200).json({
            message: "Student details updated successfully",
            student: updatedStudent
        });

    } catch (error) {
        return next(new HttpError(error.message || "An unexpected error occurred", 500));
    }
});

// Drop a registered course
const dropCourse = asyncHandler(async (req, res, next) => {
    try {
        const { courseId } = req.body;

        if (!courseId) {
            return next(new HttpError("Provide the course you want to drop", 422));
        }

        const student = await Student.findOne({ user: req.user.id }).populate('courses');
        if (!student) {
            return next(new HttpError('Student not found', 404));
        }

        if (!student.courses.some(course => course._id.toString() === courseId)) {
            return next(new HttpError("The course is not registered by the student", 400));
        }

        student.courses = student.courses.filter(course => course._id.toString() !== courseId);
        await student.save();

        return res.status(200).json({
            message: "Course dropped successfully",
            remainingCourses: student.courses
        });

    } catch (error) {
        return next(new HttpError(error.message || "An unexpected error occurred", 500));
    }
});

// Fetch class details for a student
const fetchClassDetails = asyncHandler(async (req, res, next) => {
    try {
        const student = await Student.findOne({ user: req.user.id }).populate('level');
        if (!student) {
            return next(new HttpError('Student not found', 404));
        }

        const level = await Level.findById(student.level)
            .populate('courses', 'courseName')
            .populate('students', 'name status');

        if (!level) {
            return next(new HttpError('Class details not found', 404));
        }

        return res.status(200).json({
            level
        });

    } catch (error) {
        return next(new HttpError(error.message || "An unexpected error occurred", 500));
    }
});

module.exports = {
    registerCourse,
    viewDetails,
    updateDetails,
    dropCourse,
    fetchClassDetails
};
