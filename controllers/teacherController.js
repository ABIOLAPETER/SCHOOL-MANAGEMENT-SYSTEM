const asyncHandler = require("express-async-handler");
const Teacher = require("../models/teacherModel"); // Ensure you have a Teacher model
const HttpError = require("../models/errorModel.js");

// View teacher details
const viewDetails = asyncHandler(async (req, res, next) => {
    try {
        const id = req.user.id; // Assuming the logged-in teacher's ID is available in `req.user.id`
        const teacher = await Teacher.findOne({ user: id }).populate('courses', 'courseName'); // Populating courses if needed

        if (!teacher) {
            return next(new HttpError('User is not a teacher', 422));
        }

        return res.status(200).json({
            teacher
        });

    } catch (error) {
        return next(new HttpError(error.message || "An unexpected error occurred", 500));
    }
});


const updateDetails = asyncHandler(async (req, res, next) => {
    try {
        const { name, level, courses, status } = req.body; // Extract fields relevant to the Teacher model
        const id = req.user.id;

        // Find the teacher by the linked user ID
        const teacher = await Teacher.findOne({ user: id });
        if (!teacher) {
            return next(new HttpError('User is not a teacher', 422));
        }

        // Prepare updated fields
        const updatedFields = {};
        if (name) updatedFields.name = name;
        if (level) updatedFields.level = level;
        if (courses) updatedFields.courses = courses;
        if (status) updatedFields.status = status;

        // Validate courses and level if being updated
        if (courses) {
            const validCourses = await Course.find({ _id: { $in: courses } });
            if (validCourses.length !== courses.length) {
                return next(new HttpError("One or more courses not found", 404));
            }
        }
        if (level) {
            const validLevel = await Level.findById(level);
            if (!validLevel) {
                return next(new HttpError("Level not found", 404));
            }
        }

        // Update the teacher's details
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacher._id,
            updatedFields,
            { new: true } // Return the updated document
        ).populate('courses level'); // Optionally populate related fields

        return res.status(200).json({
            message: "Teacher details updated successfully",
            updatedTeacher,
        });
    } catch (error) {
        return next(new HttpError(error.message || "An unexpected error occurred", 500));
    }
});



module.exports = {
    viewDetails,
    updateDetails
};
