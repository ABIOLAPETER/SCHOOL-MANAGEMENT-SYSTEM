const mongoose = require("mongoose");

const levelSchema = new mongoose.Schema({
    level: { type: Number, required: true, unique: true }, // Ensure levels are unique
    courses: {
        type: [{ type: mongoose.Types.ObjectId, ref: 'Course' }],
        // validate: [array => array.length > 0, 'Each level must have at least one course.']
    },
    students: {
        type: [{ type: mongoose.Types.ObjectId, ref: 'Student' }],
        // validate: [array => array.length > 0, 'Each level must have at least one student.']
    }
}, { timestamps: true });

const Level = mongoose.model('Level', levelSchema);

module.exports = Level;
