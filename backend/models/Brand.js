const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
    id: {
        type: String,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Brand name is required'],
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    sector: {
        type: String,
        trim: true,
        default: ''
    },
    location: {
        type: String,
        trim: true,
        default: ''
    },
    masterFranchiseAvailable: {
        type: Boolean,
        default: false
    },
    masterInvestmentRange: {
        type: String,
        trim: true,
        default: ''
    },
    territoryOffered: {
        type: String,
        trim: true,
        default: 'State Level Exclusivity'
    },
    minInvestment: {
        type: Number,
        default: 0
    },
    maxInvestment: {
        type: Number,
        default: 0
    },
    pincode: {
        type: String,
        required: [true, 'Pincode is required'],
        trim: true
    },
    investment_range: {
        type: String,
        required: [true, 'Investment range is required'],
        trim: true
    },
    max_investment_limit: {
        type: String,
        required: [true, 'Max investment limit is required'],
        trim: true
    },
    franchiseFee: {
        type: Number
    },
    royaltyFee: {
        type: String,
        default: '0%'
    },
    areaRequired: {
        type: String,
        trim: true
    },
    hq: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        default: ''
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    password: {
        type: String
    },
    phone: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Declined'],
        default: 'Pending'
    },
    featured: {
        type: Boolean,
        default: false
    },
    trainingSupport: {
        type: String,
        default: 'No'
    },
    agreement: {
        type: String,
        default: 'No'
    },
    website: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);
