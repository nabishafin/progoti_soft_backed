const express = require('express');
const router = express.Router();
const { 
    getProjects, 
    getProject, 
    createProject, 
    updateProject, 
    deleteProject 
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getProjects)
    .post(protect, admin, upload.single('image'), createProject);

router.route('/:id')
    .get(getProject)
    .put(protect, admin, upload.single('image'), updateProject)
    .delete(protect, admin, deleteProject);

module.exports = router;
