const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Admin username is required'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Admin password is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
