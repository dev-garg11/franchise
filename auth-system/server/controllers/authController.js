const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_98765', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Register User (Only Brand Owners & Investors)
exports.register = async (req, res) => {
  try {
    const { name, email, mobile, password, role } = req.body;

    // Prevent public registration of admin accounts
    if (role === 'admin') {
      return res.status(403).json({ success: false, error: 'Admin accounts cannot be registered publicly.' });
    }

    // Input validations
    if (!name || !email || !mobile || !password || !role) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
    }

    // Check if user already exists
    const userExists = await User.findOne({
      where: {
        [Op.or]: [
          { email: email.toLowerCase() },
          { mobile }
        ]
      }
    });

    if (userExists) {
      return res.status(400).json({ success: false, error: 'User with this email or mobile number already exists.' });
    }

    // Create User
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      mobile,
      password,
      role
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Unified Login (Automatic role detection)
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Please enter email/mobile and password.' });
    }

    // Find user by Email or Mobile Number
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: identifier.toLowerCase() },
          { mobile: identifier }
        ]
      }
    });

    if (!user || user.status !== 'active') {
      return res.status(401).json({ success: false, error: 'Invalid login credentials or inactive account.' });
    }

    // Compare encrypted password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid login credentials.' });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Current Logged-in User
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Admin creating another Admin (RBAC protected)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
    }

    const userExists = await User.findOne({
      where: {
        [Op.or]: [
          { email: email.toLowerCase() },
          { mobile }
        ]
      }
    });

    if (userExists) {
      return res.status(400).json({ success: false, error: 'User with this email or mobile number already exists.' });
    }

    const adminUser = await User.create({
      name,
      email: email.toLowerCase(),
      mobile,
      password,
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'New admin account created successfully.',
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Forgot Password API Structure Placeholder
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Please provide email.' });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      // Security best practice: Don't reveal user existence
      return res.status(200).json({ success: true, message: 'If the email exists, a reset link has been sent.' });
    }

    // Token creation and email dispatch logic goes here
    res.status(200).json({ success: true, message: 'Password reset link sent to registered email address.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Logout User
exports.logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};
