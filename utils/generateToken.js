const jwt = require("jsonwebtoken")

const generateToken = async(payload)=>{
    const token = await jwt.sign(payload, process.env.JWT_SECRET)
    return token
}

module.exports = generateToken
