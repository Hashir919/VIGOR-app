
const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');
const auth = require('../middleware/auth');

// GET all exercises or search
router.get('/', auth, async (req, res) => {
    try {
        const { query, category, type } = req.query;
        let filter = {};

        if (query) {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } },
                { muscleGroup: { $regex: query, $options: 'i' } }
            ];
        }
        if (category) {
            filter.category = category;
        }
        if (type) {
            filter.type = type;
        }

        const exercises = await Exercise.find(filter).sort({ popularity: -1, name: 1 }).limit(20);
        res.json(exercises);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET popular exercises
router.get('/popular', auth, async (req, res) => {
    try {
        const exercises = await Exercise.find().sort({ popularity: -1 }).limit(10);
        res.json(exercises);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
