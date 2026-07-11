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

// @desc    Assign brand to multiple investors
// @route   POST /api/investors/assign-brand
// @access  Public
exports.assignBrand = async (req, res) => {
  const mongoose = require('mongoose');
  try {
    const { brandId, investorIds } = req.body;
    if (!brandId) {
      return res.status(400).json({ success: false, error: 'Brand ID is required' });
    }

    // 1. Remove brandId from all investors first
    await Investor.updateMany(
      { assignedBrands: brandId },
      { $pull: { assignedBrands: brandId } }
    );

    // 2. Add brandId to selected investors
    if (investorIds && investorIds.length > 0) {
      await Investor.updateMany(
        {
          $or: [
            { _id: { $in: investorIds.filter(id => mongoose.Types.ObjectId.isValid(id)) } },
            { id: { $in: investorIds } }
          ]
        },
        { $addToSet: { assignedBrands: brandId } }
      );
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
