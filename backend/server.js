const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables from .env file
dotenv.config();

const app = express();

// 1. Enable CORS middleware
app.use(cors());

// 2. Enable JSON middleware (parse incoming request bodies)
app.use(express.json());

// 3. Mount Routers
const brandRoutes = require('./routes/brandRoutes');
const investorRoutes = require('./routes/investorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const adRoutes = require('./routes/adRoutes');

app.use('/api/brands', brandRoutes);
app.use('/api/investors', investorRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/advertisements', adRoutes);
app.use('/api', authRoutes);

// 4. Default API Root Route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the Franchise Roots MongoDB Backend API'
    });
});

// 5. Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// 6. Connect to database before starting the Express server
const startServer = async () => {
    try {
        // Attempt to connect to MongoDB Atlas
        await connectDB();

        // Start listening on port
        app.listen(PORT, () => {
            console.log(`Server started successfully on port ${PORT}`);
        });
    } catch (error) {
        console.error(`Failed to start Express server: ${error.message}`);
        process.exit(1);
    }
};

startServer();
