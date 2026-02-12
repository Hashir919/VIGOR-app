
const express = require('express');
const router = express.Router();
const Metric = require('../models/Metric');
const Nutrition = require('../models/Nutrition');
const NutritionPlan = require('../models/NutritionPlan');
const QuickAction = require('../models/QuickAction');
const User = require('../models/User');
const Workout = require('../models/Workout');
const auth = require('../middleware/auth');

// Helper to check if date is today
const isToday = (date) => {
    const today = new Date();
    const checkDate = new Date(date);
    return checkDate.getDate() === today.getDate() &&
        checkDate.getMonth() === today.getMonth() &&
        checkDate.getFullYear() === today.getFullYear();
};

// Helper to format date
const formatDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
};

// Helper to format time
const formatTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes}`;
};

// GET aggregated dashboard data
router.get('/', auth, async (req, res) => {
    try {
        // Get authenticated user ID from JWT middleware
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Fetch user data
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Fetch today's metrics
        const todayMetric = await Metric.findOne({
            userId: userId,
            date: { $gte: today, $lt: tomorrow }
        }).sort({ date: -1 });

        // Fetch today's nutrition
        const todayNutrition = await Nutrition.findOne({
            userId: userId,
            date: { $gte: today, $lt: tomorrow }
        }).sort({ date: -1 });

        // Fetch user's quick actions
        let quickActions = await QuickAction.find({
            userId: userId,
            enabled: true
        }).sort({ order: 1 });

        // If no quick actions exist, create defaults
        if (quickActions.length === 0) {
            const defaultActions = [
                {
                    userId: userId,
                    label: 'Start Workout',
                    icon: 'play_arrow',
                    action: '/log-workout',
                    order: 1,
                    enabled: true,
                    style: {
                        bgColor: 'bg-primary',
                        textColor: 'text-background-dark'
                    }
                },
                {
                    userId: userId,
                    label: 'LOG WATER',
                    icon: 'local_drink',
                    action: 'log-water',
                    order: 2,
                    enabled: true,
                    style: {
                        bgColor: 'bg-primary/10',
                        textColor: 'text-primary'
                    }
                }
            ];

            quickActions = await QuickAction.insertMany(defaultActions);
        }

        // Fetch active nutrition plan
        const activePlan = await NutritionPlan.findOne({ userId: req.user.id, isActive: true });

        // Calculate nutrition remaining
        const caloriesConsumed = todayNutrition?.caloriesConsumed || 0;
        const caloriesTarget = todayNutrition?.caloriesTarget || activePlan?.goals?.dailyCalories || user.goals?.dailyCaloriesBurn || 2500;
        const caloriesRemaining = Math.max(0, caloriesTarget - caloriesConsumed);

        // Calculate activity ring progress percentages
        const stepsProgress = user.goals?.dailySteps
            ? Math.min(100, ((todayMetric?.steps || 0) / user.goals.dailySteps) * 100)
            : 0;

        const caloriesProgress = caloriesTarget
            ? Math.min(100, ((todayMetric?.calories || 0) / caloriesTarget) * 100)
            : 0;

        const activeMinutesGoal = 30; // Default goal
        const activeMinutesProgress = Math.min(100, ((todayMetric?.activeMinutes || 0) / activeMinutesGoal) * 100);

        // Prepare response
        const dashboardData = {
            // Date and time
            currentDate: formatDate(),
            currentTime: formatTime(),

            // User info
            user: {
                name: user.name,
                firstName: user.name?.split(' ')[0] || 'Member',
                profilePicture: user.profilePicture
            },

            // Today's metrics
            metrics: {
                steps: todayMetric?.steps || 0,
                calories: todayMetric?.calories || 0,
                activeMinutes: todayMetric?.activeMinutes || 0,
                heartRateAvg: todayMetric?.heartRateAvg || null,
                heartRateHistory: todayMetric?.heartRateHistory || [],
                sleepHours: todayMetric?.sleepHours || null,
                sleepQuality: todayMetric?.sleepQuality || null,
                waterIntake: todayMetric?.waterIntake || 0
            },

            // Activity ring progress
            progress: {
                steps: Math.round(stepsProgress),
                calories: Math.round(caloriesProgress),
                activeMinutes: Math.round(activeMinutesProgress)
            },

            // Nutrition
            nutrition: {
                caloriesConsumed,
                caloriesTarget,
                caloriesRemaining,
                protein: todayNutrition?.protein || 0,
                carbs: todayNutrition?.carbs || 0,
                fats: todayNutrition?.fats || 0,
                waterIntake: todayNutrition?.waterIntake || 0,
                mealsLoggedToday: todayNutrition?.meals?.length || 0,
                meals: todayNutrition?.meals?.map(m => ({
                    name: m.name,
                    mealType: m.mealType,
                    calories: m.calories
                })) || []
            },

            // Quick actions
            quickActions: quickActions.map(action => ({
                id: action._id,
                label: action.label,
                icon: action.icon,
                action: action.action,
                style: action.style
            })),

            // Recent Workouts
            recentWorkouts: await Workout.find({ userId: userId }).sort({ startTime: -1 }).limit(3).lean(),

            // Goals
            goals: {
                dailySteps: user.goals?.dailySteps || 10000,
                dailyCaloriesBurn: user.goals?.dailyCaloriesBurn || 2500,
                weeklyCardioDays: user.goals?.weeklyCardioDays || 3,
                dailyWaterLiters: user.goals?.dailyWaterLiters || 2.5,
                dailySleepHours: user.goals?.dailySleepHours || 8
            }
        };

        res.json(dashboardData);
    } catch (err) {
        console.error('Dashboard API Error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
