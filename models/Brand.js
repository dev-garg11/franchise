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
  minInvestment: {
    type: Number,
    required: [true, 'Minimum investment is required']
  },
  maxInvestment: {
    type: Number,
    required: [true, 'Maximum investment is required']
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
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  phone: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
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
