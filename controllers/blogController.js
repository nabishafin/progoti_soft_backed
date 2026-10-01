const Blog = require('../models/Blog');

const getBlogs = async (req, res, next) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.status(200).json(blogs);
    } catch (error) {
        next(error);
    }
};

const getBlog = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            res.status(404);
            throw new Error('Blog not found');
        }
        res.status(200).json(blog);
    } catch (error) {
        next(error);
    }
};

// tags arrive as a JSON string from multipart forms, or as an array
const parseTags = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    try {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
        return String(tags).split(',').map((t) => t.trim()).filter(Boolean);
    }
};

const createBlog = async (req, res, next) => {
    try {
        const { title, description, content, category, author, date, subtitle, conclusion } = req.body;

        let image = req.body.image;
        if (req.file) {
            image = req.file.path;
        }

        if (!title || !description || !content || !category || !date) {
            res.status(400);
            throw new Error('Please add all required fields: title, description, content, category, and date');
        }

        const blog = await Blog.create({
            title,
            description,
            content,
            category,
            author: author || 'Nostrix Team',
            date,
            image,
            subtitle,
            conclusion,
            tags: parseTags(req.body.tags)
        });

        res.status(201).json(blog);
    } catch (error) {
        next(error);
    }
};

const updateBlog = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            res.status(404);
            throw new Error('Blog not found');
        }

        let updateData = { ...req.body };
        if (req.body.tags !== undefined) updateData.tags = parseTags(req.body.tags);
        if (req.file) {
            updateData.image = req.file.path;
        }

        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedBlog);
    } catch (error) {
        next(error);
    }
};

const deleteBlog = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            res.status(404);
            throw new Error('Blog not found');
        }

        await blog.deleteOne();
        res.status(200).json({ id: req.params.id, message: 'Blog deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getBlogs,
    getBlog,
    createBlog,
    updateBlog,
    deleteBlog
};
