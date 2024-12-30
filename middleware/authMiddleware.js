const HttpError = require("../models/errorModel.js")
const jwt = require("jsonwebtoken")
const asyncHandler = require("express-async-handler")

const protect = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    console.log(token)
    if (!token) {
        return next(new HttpError("Not authorized, no token", 401));
    }
    try {
        jwt.verify(token, process.env.JWT_SECRET, (err, info)=>{
            if(err){
                return next(new HttpError('Unauthorized. invalid Token', 403))
            }
        req.user = info
    next()})
    } catch (error) {
        return next(new HttpError("Not authorized, token failed", 401));
    }
});

const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        return next(new HttpError("Not authorized as admin", 403));
    }
};

module.exports = {protect, admin}
