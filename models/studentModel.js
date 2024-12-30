const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    user: {type: mongoose.Types.ObjectId, ref: 'User'},
    level: { type: mongoose.Types.ObjectId, ref: 'Level' },
    courses: {
        type: [{ type: mongoose.Types.ObjectId, ref: 'Course' }],
        // validate: [array => array.length > 0, 'A student must be enrolled in at least one course.']
    },
    parent: {
        type: "string"
    },
    status:{type: String, enum: ['student', 'expelled', 'suspended'], default: 'student'}
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
