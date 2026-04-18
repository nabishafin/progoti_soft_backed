const Testimonial = require('../models/Testimonial');

const getTestimonials = async (req, res, next) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        res.status(200).json(testimonials);
    } catch (error) {
        next(error);
    }
};

const getTestimonial = async (req, res, next) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            res.status(404);
            throw new Error('Testimonial not found');
        }
        res.status(200).json(testimonial);
    } catch (error) {
        next(error);
    }
};

const createTestimonial = async (req, res, next) => {
    try {
        const { clientName, designation, review, rating } = req.body;
        
        let image = req.body.image || '';
        if (req.file) {
            image = req.file.path;
        }

        if (!clientName || !designation || !review) {
            res.status(400);
            throw new Error('Please add client name, designation, and review');
        }

        const testimonial = await Testimonial.create({
            clientName,
            designation,
            review,
            image,
            rating: rating ? Number(rating) : 5
        });

        res.status(201).json(testimonial);
    } catch (error) {
        next(error);
    }
};

const updateTestimonial = async (req, res, next) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);

        if (!testimonial) {
            res.status(404);
            throw new Error('Testimonial not found');
        }

        let updateData = { ...req.body };
        if (req.file) {
            updateData.image = req.file.path;
        }

        const updatedTestimonial = await Testimonial.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedTestimonial);
    } catch (error) {
        next(error);
    }
};

const deleteTestimonial = async (req, res, next) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);

        if (!testimonial) {
            res.status(404);
            throw new Error('Testimonial not found');
        }

        await testimonial.deleteOne();
        res.status(200).json({ id: req.params.id, message: 'Testimonial deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTestimonials,
    getTestimonial,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial
};
