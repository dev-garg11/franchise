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
        required: false
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
    },
    // ADVANCED SEO, GEO, AEO, FAQS, AND SCHEMA
    seoData: {
        seoTitle: { type: String, trim: true, default: '' },
        metaDescription: { type: String, trim: true, default: '' },
        focusKeyword: { type: String, trim: true, default: '' },
        secondaryKeywords: { type: String, trim: true, default: '' },
        canonicalUrl: { type: String, trim: true, default: '' },
        ogTitle: { type: String, trim: true, default: '' },
        ogDescription: { type: String, trim: true, default: '' },
        ogImage: { type: String, trim: true, default: '' },
        geoTitle: { type: String, trim: true, default: '' },
        geoDescription: { type: String, trim: true, default: '' },
        aeoContent: { type: String, trim: true, default: '' },
        pillarContent: { type: String, default: '' },
        toc: { type: Array, default: [] },
        keywords: { type: [String], default: [] },
        rankMathScore: { type: Number, default: 0 },
        lastGeneratedAt: { type: Date, default: null }
    },
    faqs: [{
        question: { type: String, trim: true },
        answer: { type: String, trim: true }
    }],
    schemaData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    seoStatus: {
        type: String,
        enum: ['Pending Review', 'Approved', 'Rejected'],
        default: 'Pending Review'
    }
});

BrandSchema.set('bufferCommands', false);
BrandSchema.set('autoIndex', false);

module.exports = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);
