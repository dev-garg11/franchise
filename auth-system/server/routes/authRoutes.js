const express = require('express');
const router = express.Router();
const { register, login, getMe, createAdmin, forgotPassword, logout } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/logout', logout);
router.get('/me', protect, getMe);

// Admin-only route to create another Admin (RBAC)
router.post('/create-admin', protect, authorize('admin'), createAdmin);

module.exports = router;
