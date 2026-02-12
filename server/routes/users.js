
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Workout = require('../models/Workout');
const Metric = require('../models/Metric');

// Helper to check same day
const isSameDay = (d1, d2) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
};

// GET user profile with dynamic stats
router.get('/:id', async (req, res) => {
    try {
        let user;
        if (req.params.id === 'default') {
            user = await User.findOne();
        } else {
            user = await User.findById(req.params.id);
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch user data
        const workouts = await Workout.find({ userId: user._id }).sort({ date: -1 });
        const metrics = await Metric.find({ userId: user._id }).sort({ date: -1 });

        // Calculate Total KM
        const totalKm = workouts.reduce((sum, w) => sum + (w.distance || 0), 0);

        // Calculate Streak (Consecutive days with workouts)
        let streak = 0;
        if (workouts.length > 0) {
            streak = 1;
            let currentDate = new Date(workouts[0].date);
            for (let i = 1; i < workouts.length; i++) {
                const prevDate = new Date(workouts[i].date);
                const diffTime = Math.abs(currentDate - prevDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    streak++;
                    currentDate = prevDate;
                } else if (diffDays > 1) {
                    break;
                }
            }
        }

        // Calculate Badges (Simple logic: 1 badge per 5 workouts)
        const badges = Math.floor(workouts.length / 5);

        // Level (1 level per 20km)
        const level = Math.floor(totalKm / 20) + 1;

        // Weekly Cardio Days (Count all active days in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const uniqueCardioDays = new Set(
            workouts
                .filter(w => new Date(w.date) >= sevenDaysAgo) // Count any workout
                .map(w => new Date(w.date).toDateString())
        );
        const weeklyCardioDays = uniqueCardioDays.size;

        // Daily Steps & Calories (from today's metrics/workouts)
        const today = new Date();
        const todayMetric = metrics.find(m => isSameDay(m.date, today));
        const todaySteps = todayMetric?.steps || 0;
        const todayCalories = (todayMetric?.steps || 0) * 0.04 + workouts.filter(w => isSameDay(w.date, today)).reduce((acc, w) => acc + (w.calories || 0), 0);

        // Prepare response
        const userObj = user.toObject();
        userObj.stats = {
            ...userObj.stats,
            totalKm: Math.round(totalKm * 10) / 10,
            streak,
            badges,
            level
        };
        userObj.goals = {
            ...userObj.goals, // targets
            currentDailySteps: todaySteps,
            currentWeeklyCardio: weeklyCardioDays,
            currentDailyCalories: Math.round(todayCalories)
        };

        res.json(userObj);
    } catch (err) {
        console.error("Error fetching user profile:", err);
        res.status(500).json({ message: err.message });
    }
});

// UPDATE user goals
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
