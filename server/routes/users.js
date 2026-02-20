
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
        // Sort workouts by date descending
        const sortedWorkouts = workouts.sort((a, b) => new Date(b.date) - new Date(a.date));

        let streak = 0;
        if (sortedWorkouts.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const lastWorkoutDate = new Date(sortedWorkouts[0].date);
            lastWorkoutDate.setHours(0, 0, 0, 0);

            // Check if last workout was today or yesterday to keep streak alive
            const diffTime = Math.abs(today - lastWorkoutDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 1) {
                streak = 1;
                let currentDate = lastWorkoutDate;

                for (let i = 1; i < sortedWorkouts.length; i++) {
                    const prevDate = new Date(sortedWorkouts[i].date);
                    prevDate.setHours(0, 0, 0, 0);

                    const timeDiff = Math.abs(currentDate - prevDate);
                    const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

                    if (dayDiff === 1) {
                        streak++;
                        currentDate = prevDate;
                    } else if (dayDiff > 1) {
                        break;
                    }
                }
            }
        }

        // Dynamic Badge Calculation
        const dynamicAchievements = [];

        // "Early Bird" - 5 workouts before 7AM
        const earlyBirdCount = workouts.filter(w => {
            const date = new Date(w.date);
            return date.getHours() < 7;
        }).length;

        if (earlyBirdCount >= 5) {
            dynamicAchievements.push({
                id: 'early_bird',
                name: 'Early Bird',
                description: '5 Workouts before 7am',
                icon: 'wb_sunny',
                dateEarned: new Date() // Ideally store when earned
            });
        }

        // "Marathoner" - Total 42km
        if (totalKm >= 42) {
            dynamicAchievements.push({
                id: 'marathoner',
                name: 'Marathoner',
                description: 'Ran 42km in total',
                icon: 'directions_run',
                dateEarned: new Date()
            });
        }

        // "Consistency King" - 7 day streak
        if (streak >= 7) {
            dynamicAchievements.push({
                id: 'consistency',
                name: 'Consistency King',
                description: '7 Day Workout Streak',
                icon: 'local_fire_department',
                dateEarned: new Date()
            });
        }

        const badges = dynamicAchievements.length;
        const level = Math.floor(totalKm / 20) + 1;

        // Weekly Cardio Days (Count all active days in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const uniqueCardioDays = new Set(
            workouts
                .filter(w => new Date(w.date) >= sevenDaysAgo)
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

        // Merge stored achievements with dynamic ones (deduplicating by ID)
        const storedAchievements = userObj.achievements || [];
        const allAchievements = [...dynamicAchievements]; // Prioritize dynamic for now

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

        userObj.achievements = allAchievements;

        // Defaults for preferences if missing
        userObj.preferences = {
            language: 'English (US)',
            connectedDevices: [],
            ...userObj.preferences
        };

        res.json(userObj);
    } catch (err) {
        console.error("Error fetching user profile:", err);
        res.status(500).json({ message: err.message });
    }
});

// UPDATE user profile/goals/preferences
router.put('/:id', async (req, res) => {
    try {
        const { email, password, role, ...updateData } = req.body; // Specifically exclude sensitive fields

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
