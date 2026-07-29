const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Blog title is required'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Blog content is required']
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

module.exports = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
