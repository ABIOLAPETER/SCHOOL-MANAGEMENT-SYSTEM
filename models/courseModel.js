const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    courseName: { type: String, required: true, unique: true },
    level: { type: mongoose.Types.ObjectId, ref: 'Level' },
    teacher: {
        type: [{ type: mongoose.Types.ObjectId, ref: 'Teacher' }],
        // validate: [array => array.length > 0, 'Each course must have at least one teacher.']
    },
    students: {
        type: [{ type: mongoose.Types.ObjectId, ref: "Student" }],
        // validate: [array => array.length > 0, 'A course must have at least one student enrolled.']
    }
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
