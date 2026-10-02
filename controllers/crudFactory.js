/**
 * Small CRUD helper for simple content collections (skills, team).
 * `fields` is the whitelist of body fields that may be written, which also
 * stops clients from setting arbitrary properties.
 * `parse` can transform the picked body (e.g. JSON strings from multipart forms).
 */
const makeCrud = (Model, { fields, parse = (b) => b, label = 'Item' }) => {
    const pick = (body) => {
        const out = {};
        fields.forEach((f) => {
            if (body[f] !== undefined) out[f] = body[f];
        });
        return parse(out);
    };

    const list = async (req, res, next) => {
        try {
            res.json(await Model.find().sort({ order: 1, createdAt: 1 }));
        } catch (error) {
            next(error);
        }
    };

    const create = async (req, res, next) => {
        try {
            const data = pick(req.body);
            if (req.file) data.image = req.file.path;
            res.status(201).json(await Model.create(data));
        } catch (error) {
            next(error);
        }
    };

    const update = async (req, res, next) => {
        try {
            const data = pick(req.body);
            if (req.file) data.image = req.file.path;
            const doc = await Model.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
            if (!doc) {
                res.status(404);
                throw new Error(`${label} not found`);
            }
            res.json(doc);
        } catch (error) {
            next(error);
        }
    };

    const remove = async (req, res, next) => {
        try {
            const doc = await Model.findById(req.params.id);
            if (!doc) {
                res.status(404);
                throw new Error(`${label} not found`);
            }
            await doc.deleteOne();
            res.json({ id: req.params.id, message: `${label} deleted` });
        } catch (error) {
            next(error);
        }
    };

    return { list, create, update, remove };
};

module.exports = makeCrud;
