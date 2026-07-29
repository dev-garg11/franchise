const Blog = require('../models/Blog');

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
exports.getBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: blogs.length, data: blogs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get single blog by ID
// @route   GET /api/blogs/:id
// @access  Public
exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }
        res.status(200).json({ success: true, data: blog });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private (Admin)
exports.createBlog = async (req, res) => {
    try {
        const blog = await Blog.create(req.body);
        res.status(201).json({ success: true, data: blog });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Update a blog
// @route   PUT /api/blogs/:id
// @access  Private (Admin)
exports.updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }

        res.status(200).json({ success: true, data: blog });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Private (Admin)
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
