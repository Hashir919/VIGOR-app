
const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');
const auth = require('../middleware/auth');

const Metric = require('../models/Metric');

// GET all workouts
router.get('/', auth, async (req, res) => {
    try {
        const workouts = await Workout.find({ userId: req.user.id }).sort({ startTime: -1 });
        res.json(workouts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new workout session
router.post('/', auth, async (req, res) => {
    try {
        const workoutData = {
            userId: req.user.id,
            title: req.body.title,
            type: req.body.type,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            duration: req.body.duration,
            calories: req.body.calories,
            intensity: req.body.intensity,
            totalVolume: req.body.totalVolume,
            notes: req.body.notes,
            exercises: req.body.exercises
        };

        const workout = new Workout(workoutData);
        const newWorkout = await workout.save();

        // Update daily metrics
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let metric = await Metric.findOne({
            userId: req.user.id,
            date: { $gte: today, $lt: tomorrow }
        });

        if (!metric) {
            metric = new Metric({
                userId: req.user.id,
                date: new Date(),
                steps: 0,
                calories: 0,
                activeMinutes: 0
            });
        }

        metric.activeMinutes += req.body.duration || 0;
        metric.calories += req.body.calories || 0;
        await metric.save();

        res.status(201).json(newWorkout);
    } catch (err) {
        console.error('Workout log error:', err);
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
