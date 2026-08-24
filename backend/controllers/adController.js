const Advertisement = require('../models/Advertisement');

// @desc    Get all advertisements
// @route   GET /api/advertisements
// @access  Public
exports.getAdvertisements = async (req, res) => {
    try {
        const ads = await Advertisement.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: ads.length, data: ads });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get single advertisement by ID
// @route   GET /api/advertisements/:id
// @access  Public
exports.getAdvertisementById = async (req, res) => {
    try {
        const ad = await Advertisement.findById(req.params.id);
        if (!ad) {
            return res.status(404).json({ success: false, error: 'Advertisement not found' });
        }
        res.status(200).json({ success: true, data: ad });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Create new advertisement
// @route   POST /api/advertisements
// @access  Private (Admin)
exports.createAdvertisement = async (req, res) => {
    try {
        const ad = await Advertisement.create(req.body);
        res.status(201).json({ success: true, data: ad });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Update an advertisement
// @route   PUT /api/advertisements/:id
// @access  Private (Admin)
exports.updateAdvertisement = async (req, res) => {
    try {
        const ad = await Advertisement.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!ad) {
            return res.status(404).json({ success: false, error: 'Advertisement not found' });
        }

        res.status(200).json({ success: true, data: ad });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Delete an advertisement
// @route   DELETE /api/advertisements/:id
// @access  Private (Admin)
exports.deleteAdvertisement = async (req, res) => {
    try {
        const ad = await Advertisement.findByIdAndDelete(req.params.id);
        if (!ad) {
            return res.status(404).json({ success: false, error: 'Advertisement not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
