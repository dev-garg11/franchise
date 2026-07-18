const User = require('../models/User');
const Brand = require('../models/Brand');
const Investor = require('../models/Investor');
const bcrypt = require('bcryptjs');

// @desc    Authenticate user & get token (simplified)
// @route   POST /api/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email/username and password' });
    }

    const query = {
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() }
      ]
    };
    
    const user = await User.findOne(query);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    let profileId = user._id.toString();
    if (user.role === 'brand') {
      const brand = await Brand.findOne({ email: user.email.toLowerCase() });
      if (brand) profileId = brand.id || brand._id.toString();
    } else if (user.role === 'investor') {
      const investor = await Investor.findOne({ email: user.email.toLowerCase() });
      if (investor) profileId = investor.id || investor._id.toString();
    }

    res.status(200).json({
      success: true,
      user: {
        id: profileId,
        email: user.email,
        username: user.username,
        role: user.role,
        name: user.name,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
