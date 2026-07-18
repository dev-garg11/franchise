const Admin = require('../models/Admin');

// @desc    Get all admins
// @route   GET /api/admins
// @access  Public
exports.getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: admins.length, data: admins });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
