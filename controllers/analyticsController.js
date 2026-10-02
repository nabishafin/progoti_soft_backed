const Visit = require('../models/Visit');
const Message = require('../models/Message');
const Project = require('../models/Project');
const Blog = require('../models/Blog');
const User = require('../models/User');

const detectDevice = (ua = '') => {
    if (/ipad|tablet/i.test(ua)) return 'tablet';
    if (/mobi|android|iphone/i.test(ua)) return 'mobile';
    return 'desktop';
};

// @route POST /api/analytics/track  (public, rate limited)
const trackVisit = async (req, res, next) => {
    try {
        const path = String(req.body.path || '').slice(0, 300);
        const visitorId = String(req.body.visitorId || '').slice(0, 64);

        // Only real public pages, never admin routes
        if (!path.startsWith('/') || path.startsWith('/admin') || !visitorId) {
            return res.status(204).end();
        }

        await Visit.create({
            path,
            visitorId,
            referrer: String(req.body.referrer || '').slice(0, 300),
            device: detectDevice(req.headers['user-agent'])
        });
        res.status(204).end();
    } catch (error) {
        next(error);
    }
};

// @route GET /api/analytics/summary?days=14  (admin)
const getSummary = async (req, res, next) => {
    try {
        const days = Math.min(Math.max(parseInt(req.query.days, 10) || 14, 1), 90);
        const since = new Date();
        since.setHours(0, 0, 0, 0);
        since.setDate(since.getDate() - (days - 1));

        const [perDay, topPages, devices, uniqueAgg, totalViews, counts] = await Promise.all([
            Visit.aggregate([
                { $match: { createdAt: { $gte: since } } },
                { $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    views: { $sum: 1 },
                    visitors: { $addToSet: '$visitorId' }
                } },
                { $project: { views: 1, visitors: { $size: '$visitors' } } }
            ]),
            Visit.aggregate([
                { $match: { createdAt: { $gte: since } } },
                { $group: { _id: '$path', views: { $sum: 1 } } },
                { $sort: { views: -1 } },
                { $limit: 8 }
            ]),
            Visit.aggregate([
                { $match: { createdAt: { $gte: since } } },
                { $group: { _id: '$device', views: { $sum: 1 } } }
            ]),
            Visit.aggregate([
                { $match: { createdAt: { $gte: since } } },
                { $group: { _id: '$visitorId' } },
                { $count: 'n' }
            ]),
            Visit.countDocuments({ createdAt: { $gte: since } }),
            Promise.all([
                User.countDocuments(), Project.countDocuments(), Blog.countDocuments(),
                Message.countDocuments({ status: 'unread' })
            ])
        ]);

        // Fill days with no traffic so the chart has no gaps
        const byDate = new Map(perDay.map((d) => [d._id, d]));
        const series = [];
        for (let i = 0; i < days; i++) {
            const d = new Date(since);
            d.setDate(since.getDate() + i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const row = byDate.get(key);
            series.push({ date: key, views: row?.views || 0, visitors: row?.visitors || 0 });
        }

        res.json({
            days,
            totalViews,
            uniqueVisitors: uniqueAgg[0]?.n || 0,
            series,
            topPages: topPages.map((p) => ({ path: p._id, views: p.views })),
            devices: devices.map((d) => ({ device: d._id, views: d.views })),
            counts: { users: counts[0], projects: counts[1], blogs: counts[2], unreadMessages: counts[3] }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { trackVisit, getSummary };
