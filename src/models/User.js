const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    role: {
        type: String,
        enum: ['admin', 'brand', 'investor'],
        required: [true, 'Role is required']
    },
    name: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

UserSchema.set('bufferCommands', false);
UserSchema.set('autoIndex', false);

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
