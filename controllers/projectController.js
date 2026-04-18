const Project = require('../models/Project');

const parseJSONSafe = (data) => {
    if (!data) return undefined;
    if (typeof data !== 'string') return data;
    try {
        return JSON.parse(data);
    } catch (error) {
        return data;
    }
};

const getProjects = async (req, res, next) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.status(200).json(projects);
    } catch (error) {
        next(error);
    }
};

const getProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            res.status(404);
            throw new Error('Project not found');
        }
        res.status(200).json(project);
    } catch (error) {
        next(error);
    }
};

const createProject = async (req, res, next) => {
    try {
        const { title, description, liveLink } = req.body;

        let image = req.body.image;
        if (req.file) {
            image = req.file.path;
        }

        if (!title || !description || !image || !liveLink) {
            res.status(400);
            throw new Error('Please add title, description, image, and liveLink');
        }

        const project = await Project.create({
            title,
            description,
            image,
            liveLink,
            tags: parseJSONSafe(req.body.tags),
            clientInfo: parseJSONSafe(req.body.clientInfo),
            caseStudy: parseJSONSafe(req.body.caseStudy)
        });

        res.status(201).json(project);
    } catch (error) {
        next(error);
    }
};

const updateProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            res.status(404);
            throw new Error('Project not found');
        }

        let updateData = { ...req.body };
        
        // Parse nested fields if they come as stringified JSON
        if (req.body.tags) updateData.tags = parseJSONSafe(req.body.tags);
        if (req.body.clientInfo) updateData.clientInfo = parseJSONSafe(req.body.clientInfo);
        if (req.body.caseStudy) updateData.caseStudy = parseJSONSafe(req.body.caseStudy);

        if (req.file) {
            updateData.image = req.file.path;
        }

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedProject);
    } catch (error) {
        next(error);
    }
};

const deleteProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            res.status(404);
            throw new Error('Project not found');
        }

        await project.deleteOne();
        res.status(200).json({ id: req.params.id, message: 'Project deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject
};
