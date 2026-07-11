const Investor = require('../models/Investor');

// @desc    Get all investors
// @route   GET /api/investors
// @access  Public
exports.getInvestors = async (req, res) => {
  try {
    const investors = await Investor.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: investors.length, data: investors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create new investor enquiry
// @route   POST /api/investors
// @access  Public
exports.createInvestor = async (req, res) => {
  try {
    const investor = await Investor.create(req.body);
    res.status(201).json({ success: true, data: investor });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
