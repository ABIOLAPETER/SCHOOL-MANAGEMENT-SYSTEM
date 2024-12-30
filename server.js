const dotenv = require("dotenv");
dotenv.config();

const express = require('express');
const morgan = require('morgan');
const dbConnect = require('./config/db.js');
const app = express();
const adminRoutes = require("./routes/adminRoutes.js");
const studentRoutes = require('./routes/studentRoutes.js');
const teacherRoutes = require('./routes/teacherRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const levelRoutes = require('./routes/levelRoutes.js');
const { errorHandler, notFound } = require('./middleware/errorMiddleware.js');

const port = process.env.PORT || 3000; 

app.use(morgan('dev'));
app.use(express.json());

// Define routes with proper path
app.use('/api/v1/school-management-system/users', userRoutes);
app.use('/api/v1/school-management-system/admin', adminRoutes);
app.use('/api/v1/school-management-system/teachers', teacherRoutes);
app.use('/api/v1/school-management-system/students', studentRoutes);
app.use('/api/v1/school-management-system/level', levelRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port, async () => {
    await dbConnect();
    console.log(`Server listening at http://localhost:${port}`);
});
