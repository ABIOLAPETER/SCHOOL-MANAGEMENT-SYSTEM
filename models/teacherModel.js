const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    user: {type: mongoose.Types.ObjectId, ref: 'User'},
    courses: {
        type: [{ type: mongoose.Types.ObjectId, ref: 'Course' }],
        // validate: [array => array.length > 0, 'A teacher must be assigned to at least one course']
    },
    status:{type: String, enum: ['staff', 'leave', 'sacked'], default: 'staff'}
    }, { timestamps: true }
);


const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;
