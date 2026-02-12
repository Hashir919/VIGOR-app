
const express = require('express');
const router = express.Router();
const Metric = require('../models/Metric');
const auth = require('../middleware/auth');

// GET latest metrics (for dashboard)
router.get('/latest', auth, async (req, res) => {
    try {
        // Find the most recent metric entry for authenticated user
        const metric = await Metric.findOne({ userId: req.user.id }).sort({ date: -1 });
        if (metric) {
            res.json(metric);
        } else {
            res.json({}); // Return empty object if no metrics yet
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET metric history with range
router.get('/history', auth, async (req, res) => {
    try {
        const { range } = req.query;
        const startDate = new Date();

        switch (range) {
            case '1W': startDate.setDate(startDate.getDate() - 7); break;
            case '1M': startDate.setMonth(startDate.getMonth() - 1); break;
            case '3M': startDate.setMonth(startDate.getMonth() - 3); break;
            case '6M': startDate.setMonth(startDate.getMonth() - 6); break;
            case '1Y': startDate.setFullYear(startDate.getFullYear() - 1); break;
            default: startDate.setDate(startDate.getDate() - 30);
        }

        const metrics = await Metric.find({
            userId: req.user.id,
            date: { $gte: startDate }
        }).sort({ date: 1 });

        res.json(metrics);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new metric entry or update today's
router.post('/', auth, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let metric = await Metric.findOne({
            userId: req.user.id,
            date: { $gte: today, $lt: tomorrow }
        });

        if (metric) {
            // Update existing
            const fields = ['weight', 'steps', 'calories', 'activeMinutes', 'waterIntake', 'sleepHours', 'sleepQuality', 'heartRateAvg'];
            fields.forEach(field => {
                if (req.body[field] !== undefined) metric[field] = req.body[field];
            });
            if (req.body.heartRateHistory) {
                metric.heartRateHistory = [...metric.heartRateHistory, ...req.body.heartRateHistory];
            }
            await metric.save();
        } else {
            // Create new
            metric = new Metric({
                userId: req.user.id,
                ...req.body
            });
            await metric.save();
        }

        res.status(201).json(metric);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
