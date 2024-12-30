// ADMIN SHOULD BE ABLE TO
// allow admin access to a user by changing role to web-manager
// change the role of newly registered user from default student to teacher     DONE
// add courses                              DONE
// assign a course to a teacher             DONE
// create levels
// remove courses                           DONE
// update the courses                       DONE
// get all the courses of a level           DONE
// get all the teacher details (courses, levels, status)    DONE
// get all the student details  (courses, level, status)    DONE
// delete student from database by updating his status to expelled   DONE
// suspending student                                               DONE
// suspending lecturer                                              DONE
// delete a teacher by updating his status to sacked                   DONE
//

// ADMIN CONTROLLERS
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel.js");
const Level = require("../models/levelModel.js");
const Student = require("../models/studentModel.js");
const Teacher = require("../models/teacherModel.js");
const Course = require("../models/courseModel.js");
const HttpError = require("../models/errorModel.js");

const addCourse = asyncHandler(async (req, res, next) => {
    try {
        const { courseName, level } = req.body;

        if (!courseName) {
            return next(new HttpError("All fields are required", 422));
        }

        const courseExists = await Course.findOne({ courseName });
        if (courseExists) {
            return next(new HttpError("Course already exists! Cannot add", 422));
        }

        const newCourse = await Course.create({ courseName, level });
        return res.status(201).json({
            msg: "Course created successfully",
            course: newCourse,
        });
    } catch (error) {
        console.log(error)
        return next(new HttpError(error, 500));
    }
});

const removeCourse = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params; // the id of the course to be deleted
        if (!req.user.isAdmin) {
            return next(new HttpError("Only Admin can delete courses", 403));
        }

        const course = await Course.findById(id);
        if (!course) {
            return next(new HttpError("Course not found", 404));
        }

        await Course.findByIdAndDelete(id);
        return res.status(200).json({
            msg: "Course removed successfully",
        });
    } catch (error) {
        return next(new HttpError(error.message || "An error occurred", 500));
    }
});

const updateCourse = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;
        const { level, courseName } = req.body;
        if (!req.user.isAdmin) {
            return next(new HttpError("Only Admin can update courses", 403));
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            { level, courseName },
            { new: true }
        );
        return res.status(200).json({
            msg: "Course updated successfully",
            course: updatedCourse,
        });
    } catch (error) {
        return next(new HttpError(error.message || "An error occurred", 500));
    }
});

const getCoursesInALevel = asyncHandler(async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            return next(new HttpError("Only Admin can view courses", 403));
        }

        const { level } = req.body;
        const courses = await Level.findOne({ level }).populate("courses");

        if (!courses || courses.courses.length === 0) {
            return next(new HttpError("Level contains no courses", 422));
        }

        res.status(200).json({
            courses: courses.courses,
        });
    } catch (error) {
        return next(new HttpError(error.message || "An error occurred", 500));
    }
});

const getTeacherDetails = asyncHandler(async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            return next(new HttpError("Only Admin is authorized", 403));
        }

        const { id } = req.body; // teacher id
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return next(new HttpError("Invalid teacher ID format", 400));
        }

        const details = await Teacher.findById(id).select("name courses level status");
        if (!details) {
            return next(new HttpError("Teacher details not found", 404));
        }

        res.status(200).json({ details });
    } catch (error) {
        return next(new HttpError(error.message || "An error occurred", 500));
    }
});

const getStudentDetails = asyncHandler(async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            return next(new HttpError("Only Admin is authorized", 403));
        }

        const { id } = req.body; // student id
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return next(new HttpError("Invalid student ID format", 400));
        }

        const details = await Student.findById(id).select("name courses level status");
        if (!details) {
            return next(new HttpError("Student details not found", 404));
        }

        res.status(200).json({ details });
    } catch (error) {
        return next(new HttpError(error.message || "An error occurred", 500));
    }
});

const assignCourseToTeacher = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params; // teacher ID
        const { courseId } = req.body; // course ID

        if (!id.match(/^[0-9a-fA-F]{24}$/) || !courseId.match(/^[0-9a-fA-F]{24}$/)) {
            return next(new HttpError("Invalid teacher or course ID format", 400));
        }

        const teacher = await Teacher.findById(id);
        const course = await Course.findById(courseId);

        if (!teacher) {
            return next(new HttpError("Teacher not found", 404));
        }
        if (!course) {
            return next(new HttpError("Course not found", 404));
        }

        teacher.courses.push(courseId); // Add the course to teacher's list
        course.teacher = id; // Assign the teacher to the course
        await teacher.save();
        await course.save();

        return res.status(200).json({
            msg: "Assigned course to teacher successfully",
            courseDetails: course,
        });
    } catch (error) {
        return next(new HttpError(error.message || "An error occurred", 500));
    }
});

const createTeacher = asyncHandler(async (req, res, next) => {
    try {
        const { userId, courseId } = req.body; // user id of user

        const user = await User.findById(userId);
        if (!user) {
            return next(new HttpError("User not found", 404));
        }

        if (user.role !== "student") {
            return next(new HttpError("Only students can be promoted to teachers", 400));
        }

        user.role = "teacher";
        await user.save();

        const newTeacher = await Teacher.create({
            name: user.name,
            courses: Array.isArray(courseId) ? courseId : [courseId],
        });

        res.status(201).json({
            msg: "Teacher created successfully",
            teacher: newTeacher,
        });
    } catch (error) {
        return next(new HttpError(error.message || "An error occurred", 500));
    }
});

const suspend = asyncHandler(async (req, res, next) => {
    const { id } = req.body;
    try {
        const user = await User.findById(id);

        if (!user) {
            return next(new HttpError("User not found", 404));
        }

        if (user.role === "student") {
            const student = await Student.findOne({ user: id });

            if (!student) {
                return next(new HttpError("User is not a student", 400));
            }

            student.status = "suspended";
            await student.save();
        } else if (user.role === "teacher") {
            const teacher = await Teacher.findOne({ user: id });

            if (!teacher) {
                return next(new HttpError("User is not a teacher", 400));
            }

            teacher.status = "suspended";
            await teacher.save();
        } else {
            return next(new HttpError("User role cannot be suspended", 400))
        }
    }catch(error){
        return next(new HttpError(error))
    }
})



const deleteStudent = asyncHandler(async (req, res, next) => {
    const { id } = req.body;

    try {
        const user = await User.findById(id);

        if (!user) {
            return next(new HttpError("User not found", 404));
        }

        if (user.role === "student") {
            const student = await Student.findOne({ user: id });

            if (!student) {
                return next(new HttpError("User is not a student", 400));
            }

            student.status = "expelled";
            await student.save();
        } else {
            return next(new HttpError("User is not a student and cannot be expelled", 400));
        }

        await User.findByIdAndDelete(id);

        res.status(200).json({ msg: "Student deleted and marked as expelled successfully" });
    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
});



const deleteTeacher = asyncHandler(async (req, res, next) => {
    const { id } = req.body;

    try {
        const user = await User.findById(id);

        if (!user) {
            return next(new HttpError("User not found", 404));
        }

        if (user.role === "teacher") {
            const teacher = await Teacher.findOne({ user: id });

            if (!teacher) {
                return next(new HttpError("User is not a teacher", 400));
            }

            teacher.status = "sacked";
            await teacher.save();
        } else {
            return next(new HttpError("User is not a teacher and cannot be sacked", 400));
        }

        await User.findByIdAndDelete(id);

        res.status(200).json({ msg: "Teacher deleted and marked as sacked successfully" });
    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
});



const adminAccess = asyncHandler(async (req, res, next) => {
    const { id } = req.body;

    try {
        const user = await User.findById(id);

        if (!user) {
            return next(new HttpError("User not found", 404));
        }

        if (user.role === "teacher") {
            return next(new HttpError("Cannot make a teacher an admin", 422));
        }

        const student = await Student.findOne({ user: id });

        if (student && student.courses.length > 0) {
            return next(new HttpError("Cannot make a registered student an admin", 422));
        }

        user.isAdmin = true;
        await user.save();

        res.status(201).json({ msg: "Admin access granted successfully", user });
    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
});


module.exports = {
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
}
