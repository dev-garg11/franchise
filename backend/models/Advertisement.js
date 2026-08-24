const mongoose = require('mongoose');

const AdvertisementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Ad title is required'],
        trim: true
    },
    subtitle: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        required: [true, 'Ad banner image is required']
    },
    link: {
        type: String,
        default: '/brand-registration'
    },
    badge: {
        type: String,
        default: 'SPONSORED'
    },
    position: {
        type: String,
        default: 'homepage_banner'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Advertisement || mongoose.model('Advertisement', AdvertisementSchema);
