const express = require('express');
const Skill = require('../models/Skill');
const TeamMember = require('../models/TeamMember');
const makeCrud = require('../controllers/crudFactory');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

const buildRouter = (crud, { withImage = false } = {}) => {
    const router = express.Router();
    const files = withImage ? [upload.single('image')] : [];

    router.route('/')
        .get(crud.list)
        .post(protect, admin, ...files, crud.create);

    router.route('/:id')
        .put(protect, admin, ...files, crud.update)
        .delete(protect, admin, crud.remove);

    return router;
};

const parseJSON = (v) => {
    if (typeof v !== 'string') return v;
    try { return JSON.parse(v); } catch { return v; }
};

const skills = makeCrud(Skill, {
    label: 'Skill',
    fields: ['name', 'level', 'category', 'order'],
});

const team = makeCrud(TeamMember, {
    label: 'Team member',
    fields: ['name', 'role', 'title', 'socials', 'order'],
    parse: (b) => ({ ...b, ...(b.socials !== undefined && { socials: parseJSON(b.socials) }) }),
});

module.exports = {
    skillsRouter: buildRouter(skills),
    teamRouter: buildRouter(team, { withImage: true }),
};
