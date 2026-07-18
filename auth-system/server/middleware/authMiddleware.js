const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT Token
exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, error: 'Access denied. Token missing.' });
    }

    // Decode and verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_98765');
    const user = await User.findByPk(decoded.id);

    if (!user || user.status !== 'active') {
      return res.status(401).json({ success: false, error: 'User unauthorized or account suspended.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Token expired or invalid.' });
  }
};

// Role Authorization middleware (RBAC)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role (${req.user.role}) is unauthorized to access this resource.`
      });
    }
    next();
  };
};
