const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Service title is required'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Service content is required']
    },
    image: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

ServiceSchema.set('bufferCommands', false);
ServiceSchema.set('autoIndex', false);

module.exports = mongoose.models.Service || mongoose.model('Service', ServiceSchema);
