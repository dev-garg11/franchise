const Investor = require('../models/Investor');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

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
        const emailLower = (req.body.email || '').toLowerCase();
        let userObj = await User.findOne({ email: emailLower });
        if (!userObj) {
            const rawPassword = req.body.password || 'password123';
            const hashedPassword = await bcrypt.hash(rawPassword, 10);

            // Save to User collection
            userObj = await User.create({
                email: emailLower,
                password: hashedPassword,
                role: 'investor',
                name: req.body.name,
                phone: req.body.phone
            });
        }

        const payload = {
            pincode: req.body.pincode || "000000",
            investment_range: req.body.investment_range || "Not Specified",
            max_investment_limit: req.body.max_investment_limit || "Not Specified",
            ...req.body,
            user: userObj._id
        };

        const investor = await Investor.create(payload);
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

// @desc    Update investor lead status
// @route   PATCH /api/investors/:id
// @access  Public
exports.updateInvestor = async (req, res) => {
    try {
        const investor = await Investor.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!investor) {
            return res.status(404).json({ success: false, error: 'Investor lead not found' });
        }
        res.status(200).json({ success: true, data: investor });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Delete investor lead
// @route   DELETE /api/investors/:id
// @access  Public
exports.deleteInvestor = async (req, res) => {
    try {
        const investor = await Investor.findByIdAndDelete(req.params.id);
        if (!investor) {
            return res.status(404).json({ success: false, error: 'Investor lead not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
