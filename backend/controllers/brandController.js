const Brand = require('../models/Brand');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
exports.getBrands = async (req, res) => {
    try {
        const { status, category, featured } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (category) filter.category = category;
        if (featured) filter.featured = featured === 'true';

        const brands = await Brand.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: brands.length, data: brands });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get single brand by ID
// @route   GET /api/brands/:id
// @access  Public
exports.getBrandById = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ success: false, error: 'Brand not found' });
        }
        res.status(200).json({ success: true, data: brand });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Create new brand
// @route   POST /api/brands
// @access  Public
exports.createBrand = async (req, res) => {
    try {
        const emailLower = (req.body.email || "").toLowerCase().trim();
        if (!emailLower) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }

        let user = await User.findOne({ email: emailLower });
        if (!user) {
            const rawPassword = req.body.password || 'password123';
            const hashedPassword = await bcrypt.hash(rawPassword, 10);
            user = await User.create({
                email: emailLower,
                password: hashedPassword,
                role: 'brand',
                name: req.body.name,
                phone: req.body.phone
            });
        }

        req.body.user = user._id;
        req.body.email = emailLower;
        req.body.id = req.body.id || `brand-${Date.now()}`;
        req.body.pincode = req.body.pincode || '110001';
        req.body.investment_range = req.body.investment_range || 'Rs. 10 Lakh - 20 Lakh';
        req.body.max_investment_limit = req.body.max_investment_limit || req.body.investment_range || 'Rs. 10 Lakh - 20 Lakh';
        req.body.status = req.body.status || 'Pending';
        delete req.body.password;

        const brand = await Brand.create(req.body);
        res.status(201).json({ success: true, data: brand });
    } catch (error) {
        console.error("Error creating brand in Express backend:", error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, error: 'Brand or Email already exists' });
        }
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Update a brand
// @route   PUT /api/brands/:id
// @access  Public
exports.updateBrand = async (req, res) => {
    try {
        const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!brand) {
            return res.status(404).json({ success: false, error: 'Brand not found' });
        }

        res.status(200).json({ success: true, data: brand });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Delete a brand
// @route   DELETE /api/brands/:id
// @access  Public
exports.deleteBrand = async (req, res) => {
    try {
        const brand = await Brand.findByIdAndDelete(req.params.id);
        if (!brand) {
            return res.status(404).json({ success: false, error: 'Brand not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
