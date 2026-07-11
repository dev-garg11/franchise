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
  email: {
    type: String,
    required: [true, 'Email is required'],
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
    required: [true, 'Minimum budget is required']
  },
  budgetMax: {
    type: Number,
    required: [true, 'Maximum budget is required']
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
    enum: ['Yes', 'No'],
    default: 'No'
  },
  propertyArea: {
    type: String,
    trim: true,
    default: ''
  },
  experience: {
    type: String,
    enum: ['Yes', 'No'],
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Investor || mongoose.model('Investor', InvestorSchema);
