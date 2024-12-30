const asyncHandler = require("express-async-handler");
const User = require("../models/userModel.js");
const Level = require("../models/levelModel.js");
const Student = require("../models/studentModel.js");
const Teacher = require("../models/teacherModel.js");
const Course = require("../models/courseModel.js");
const HttpError = require("../models/errorModel.js");
const generateToken = require('../utils/generateToken.js')

// Register a new user
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    // Input validation
    if (!name || !email || !password) {
        res.status(400);
        throw new Error('All fields are required');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create new user
    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password, // Password will be hashed in userModel pre-save hook
        role
    });

    // Create Teacher or Student based on role
    if (user.role === 'teacher') {
        const teacher = await Teacher.create({
            name,
            user: user._id // Link teacher to the user document
        });
    } else if(user.role === undefined || user.role === "") {

        const student = await Student.create({
            name,
            user: user._id, // Link student to the user document
        });
    }

    // Assign admin role if email matches
    if (user.email === process.env.ADMIN_EMAIL) {
        user.role = "web-manager";
        user.isAdmin = true;
        await user.save(); // Save changes to the user
    }

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            role: user.role
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});


// Login user
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    const token = await generateToken({id: user._id, isAdmin: user.isAdmin})

    if (user && (await user.matchPassword(password))) { // Use matchPassword from userModel
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            role: user.role,
            token
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});


module.exports = {
    loginUser, registerUser
}
