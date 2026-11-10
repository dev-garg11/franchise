const mongoose = require('mongoose');

const InvestorSchema = new mongoose.Schema({
    id: {
        type: String,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Investor name is required'],
        trim: true
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
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    password: {
        type: String
    },
    budgetMin: {
        type: Number,
        default: 0
    },
    budgetMax: {
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
    preferredLocation: {
        type: String,
        trim: true
    },
    industries: {
        type: [String],
        default: []
    },
    propertyAvailable: {
        type: String,
        enum: ['Yes', 'No', 'Renting'],
        default: 'No'
    },
    propertyArea: {
        type: String,
        trim: true,
        default: ''
    },
    experience: {
        type: String,
        enum: ['Yes', 'No', 'Corporate'],
        default: 'No'
    },
    comments: {
        type: String,
        trim: true,
        default: ''
    },
    assignedBrands: {
        type: [String],
        default: []
    },
    investorId: {
        type: String,
        default: null
    },
    brandId: {
        type: String,
        default: null
    },
    brandName: {
        type: String,
        default: null
    },
    category: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    investmentStatus: {
        type: String,
        enum: ['Not Started', 'Interested', 'Invested', 'Closed'],
        default: 'Not Started'
    },
    investmentAmount: {
        type: Number,
        default: 0
    },
    investmentDate: {
        type: Date,
        default: null
    },
    investmentReference: {
        type: String,
        trim: true,
        default: ''
    },
    investmentNotes: {
        type: String,
        trim: true,
        default: ''
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Investor || mongoose.model('Investor', InvestorSchema);
