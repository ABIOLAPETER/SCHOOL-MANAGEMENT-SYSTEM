const mongoose = require("mongoose");

const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,  // Correct option name
            useUnifiedTopology: true  // You may also want to add this option to avoid deprecation warnings
        });
        console.log(`Database connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Could not connect to the database:", error.message);
        process.exit(1);  // Exit the process if the connection fails
    }
};

module.exports = dbConnect;
