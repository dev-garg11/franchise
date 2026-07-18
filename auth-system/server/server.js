const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const User = require('./models/User');

require('dotenv').config();

const app = express();

// Security Headers (XSS protection, etc.)
app.use(helmet());

// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsers (JSON & urlencoded)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting (Prevent Brute-Force & DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { success: false, error: 'Too many requests from this IP. Please try again later.' }
});
app.use('/api/', limiter);

// Mount Auth Router
app.use('/api/auth', authRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

// Connect DB, Sync Tables, Seed Admin, and Start Server
sequelize.sync()
  .then(async () => {
    console.log('Database connected and synchronized.');

    // Seed default admin if none exists
    const adminCount = await User.count({ where: { role: 'admin' } });
    if (adminCount === 0) {
      await User.create({
        name: 'System Admin',
        email: 'admin@authsystem.com',
        mobile: '9999999999',
        password: 'adminpassword123', // Will be hashed by model hook
        role: 'admin',
        status: 'active'
      });
      console.log('==================================================');
      console.log('Seeded Default Admin Credentials:');
      console.log('Email/Mobile: admin@authsystem.com or 9999999999');
      console.log('Password:     adminpassword123');
      console.log('==================================================');
    }

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });
