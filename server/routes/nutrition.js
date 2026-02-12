
const express = require('express');
const router = express.Router();
const Nutrition = require('../models/Nutrition');
const NutritionPlan = require('../models/NutritionPlan');
const Metric = require('../models/Metric');
const auth = require('../middleware/auth');

// GET today's nutrition
router.get('/latest', auth, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const nutrition = await Nutrition.findOne({
            userId: req.user.id,
            date: { $gte: today, $lt: tomorrow }
        }).sort({ date: -1 });

        const activePlan = await NutritionPlan.findOne({ userId: req.user.id, isActive: true });

        if (nutrition) {
            // Update targets from plan if available
            if (activePlan) {
                nutrition.caloriesTarget = activePlan.goals.dailyCalories;
                nutrition.proteinTarget = activePlan.goals.proteinGrams;
                nutrition.carbsTarget = activePlan.goals.carbsGrams;
                nutrition.fatsTarget = activePlan.goals.fatsGrams;
                // We don't save here, just return for display
            }
            res.json(nutrition);
        } else {
            // Return default structure if no nutrition logged today
            res.json({
                userId: req.user.id,
                date: new Date(),
                caloriesConsumed: 0,
                caloriesTarget: activePlan?.goals?.dailyCalories || 2500,
                protein: 0,
                proteinTarget: activePlan?.goals?.proteinGrams || 150,
                carbs: 0,
                carbsTarget: activePlan?.goals?.carbsGrams || 200,
                fats: 0,
                fatsTarget: activePlan?.goals?.fatsGrams || 60,
                waterIntake: 0,
                meals: []
            });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new nutrition entry
router.post('/', auth, async (req, res) => {
    const nutrition = new Nutrition({
        userId: req.user.id,
        caloriesConsumed: req.body.caloriesConsumed,
        caloriesTarget: req.body.caloriesTarget,
        protein: req.body.protein,
        carbs: req.body.carbs,
        fats: req.body.fats,
        waterIntake: req.body.waterIntake,
        meals: req.body.meals
    });

    try {
        const newNutrition = await nutrition.save();
        res.status(201).json(newNutrition);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update nutrition entry
router.put('/:id', auth, async (req, res) => {
    try {
        const nutrition = await Nutrition.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!nutrition) {
            return res.status(404).json({ message: 'Nutrition entry not found' });
        }

        Object.assign(nutrition, req.body);
        const updatedNutrition = await nutrition.save();
        res.json(updatedNutrition);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// POST log water intake
router.post('/water', auth, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // 1. Update Nutrition
        let nutrition = await Nutrition.findOne({
            userId: req.user.id,
            date: { $gte: today, $lt: tomorrow }
        });

        const amount = req.body.amount || 0.25;

        if (!nutrition) {
            nutrition = new Nutrition({
                userId: req.user.id,
                waterIntake: amount
            });
        } else {
            nutrition.waterIntake = (nutrition.waterIntake || 0) + amount;
        }
        await nutrition.save();

        // 2. Sync with Metric model
        let metric = await Metric.findOne({
            userId: req.user.id,
            date: { $gte: today, $lt: tomorrow }
        });

        if (!metric) {
            metric = new Metric({
                userId: req.user.id,
                waterIntake: amount
            });
        } else {
            metric.waterIntake = (metric.waterIntake || 0) + amount;
        }
        await metric.save();

        res.json({ nutrition, metric });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST log a meal with food items
router.post('/log-meal', auth, async (req, res) => {
    try {
        const FoodItem = require('../models/FoodItem');

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find or create today's nutrition entry
        let nutrition = await Nutrition.findOne({
            userId: req.user.id,
            date: { $gte: today, $lt: tomorrow }
        });

        if (!nutrition) {
            const activePlan = await NutritionPlan.findOne({ userId: req.user.id, isActive: true });
            nutrition = new Nutrition({
                userId: req.user.id,
                planId: req.body.planId || activePlan?._id,
                caloriesTarget: activePlan?.goals?.dailyCalories || 2500,
                proteinTarget: activePlan?.goals?.proteinGrams || 150,
                carbsTarget: activePlan?.goals?.carbsGrams || 200,
                fatsTarget: activePlan?.goals?.fatsGrams || 60
            });
        }

        // Calculate meal nutrition from food items
        let mealCalories = 0;
        let mealProtein = 0;
        let mealCarbs = 0;
        let mealFats = 0;
        const processedFoods = [];

        for (const food of req.body.foods || []) {
            const foodItem = await FoodItem.findById(food.foodItemId);
            if (foodItem) {
                const servings = food.servings || 1;
                const foodCalories = foodItem.nutrition.calories * servings;
                const foodProtein = foodItem.nutrition.protein * servings;
                const foodCarbs = foodItem.nutrition.carbs * servings;
                const foodFats = foodItem.nutrition.fats * servings;

                mealCalories += foodCalories;
                mealProtein += foodProtein;
                mealCarbs += foodCarbs;
                mealFats += foodFats;

                processedFoods.push({
                    foodItemId: food.foodItemId,
                    servings,
                    name: foodItem.name,
                    calories: Math.round(foodCalories),
                    protein: Math.round(foodProtein * 10) / 10,
                    carbs: Math.round(foodCarbs * 10) / 10,
                    fats: Math.round(foodFats * 10) / 10
                });
            }
        }

        // Add meal to nutrition entry
        const meal = {
            name: req.body.mealName || 'Meal',
            mealType: req.body.mealType || 'other',
            time: req.body.time || new Date(),
            templateId: req.body.templateId,
            foods: processedFoods,
            calories: Math.round(mealCalories),
            protein: Math.round(mealProtein * 10) / 10,
            carbs: Math.round(mealCarbs * 10) / 10,
            fats: Math.round(mealFats * 10) / 10
        };

        nutrition.meals.push(meal);

        // Update daily totals
        nutrition.caloriesConsumed = (nutrition.caloriesConsumed || 0) + meal.calories;
        nutrition.protein = (nutrition.protein || 0) + meal.protein;
        nutrition.carbs = (nutrition.carbs || 0) + meal.carbs;
        nutrition.fats = (nutrition.fats || 0) + meal.fats;

        await nutrition.save();
        res.status(201).json(nutrition);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update a logged meal
router.put('/meals/:mealId', auth, async (req, res) => {
    try {
        const nutrition = await Nutrition.findOne({
            userId: req.user.id,
            'meals._id': req.params.mealId
        });

        if (!nutrition) {
            return res.status(404).json({ message: 'Meal not found' });
        }

        const meal = nutrition.meals.id(req.params.mealId);
        if (req.body.name) meal.name = req.body.name;
        if (req.body.mealType) meal.mealType = req.body.mealType;
        if (req.body.time) meal.time = req.body.time;

        await nutrition.save();
        res.json(nutrition);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a logged meal
router.delete('/meals/:mealId', auth, async (req, res) => {
    try {
        const nutrition = await Nutrition.findOne({
            userId: req.user.id,
            'meals._id': req.params.mealId
        });

        if (!nutrition) {
            return res.status(404).json({ message: 'Meal not found' });
        }

        const meal = nutrition.meals.id(req.params.mealId);

        // Subtract meal nutrition from daily totals
        nutrition.caloriesConsumed = Math.max(0, (nutrition.caloriesConsumed || 0) - (meal.calories || 0));
        nutrition.protein = Math.max(0, (nutrition.protein || 0) - (meal.protein || 0));
        nutrition.carbs = Math.max(0, (nutrition.carbs || 0) - (meal.carbs || 0));
        nutrition.fats = Math.max(0, (nutrition.fats || 0) - (meal.fats || 0));

        meal.remove();
        await nutrition.save();
        res.json(nutrition);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET nutrition history (last 30 days)
router.get('/history', auth, async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const nutritionHistory = await Nutrition.find({
            userId: req.user.id,
            date: { $gte: thirtyDaysAgo }
        }).sort({ date: 1 });

        res.json(nutritionHistory);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
