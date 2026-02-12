
const express = require('express');
const router = express.Router();
const NutritionPlan = require('../models/NutritionPlan');
const auth = require('../middleware/auth');

// GET all user's nutrition plans
router.get('/', auth, async (req, res) => {
    try {
        const plans = await NutritionPlan.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(plans);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET active nutrition plan
router.get('/active', auth, async (req, res) => {
    try {
        const plan = await NutritionPlan.findOne({ userId: req.user.id, isActive: true });
        if (!plan) {
            return res.status(404).json({ message: 'No active nutrition plan found' });
        }
        res.json(plan);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET specific nutrition plan
router.get('/:id', auth, async (req, res) => {
    try {
        const plan = await NutritionPlan.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!plan) {
            return res.status(404).json({ message: 'Nutrition plan not found' });
        }

        res.json(plan);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create new nutrition plan
router.post('/', auth, async (req, res) => {
    console.log('Creating nutrition plan for user:', req.user.id);
    console.log('Request body:', req.body);
    const plan = new NutritionPlan({
        userId: req.user.id,
        name: req.body.name || 'My Nutrition Plan',
        isActive: req.body.isActive || false,
        goals: {
            dailyCalories: req.body.goals?.dailyCalories || 2000,
            proteinGrams: req.body.goals?.proteinGrams || 150,
            carbsGrams: req.body.goals?.carbsGrams || 200,
            fatsGrams: req.body.goals?.fatsGrams || 60
        },
        mealSchedule: req.body.mealSchedule || [
            { name: 'Breakfast', targetTime: '08:00', targetCalories: 500 },
            { name: 'Lunch', targetTime: '12:00', targetCalories: 600 },
            { name: 'Dinner', targetTime: '18:00', targetCalories: 700 },
            { name: 'Snack', targetTime: '15:00', targetCalories: 200 }
        ]
    });

    try {
        const newPlan = await plan.save();
        res.status(201).json(newPlan);
    } catch (err) {
        console.error('Error creating nutrition plan:', err);
        res.status(400).json({ message: err.message });
    }
});

// PUT update nutrition plan
router.put('/:id', auth, async (req, res) => {
    try {
        const plan = await NutritionPlan.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!plan) {
            return res.status(404).json({ message: 'Nutrition plan not found' });
        }

        // Update fields
        if (req.body.name) plan.name = req.body.name;
        if (req.body.goals) plan.goals = { ...plan.goals, ...req.body.goals };
        if (req.body.mealSchedule) plan.mealSchedule = req.body.mealSchedule;

        const updatedPlan = await plan.save();
        res.json(updatedPlan);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT activate nutrition plan
router.put('/:id/activate', auth, async (req, res) => {
    try {
        const plan = await NutritionPlan.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!plan) {
            return res.status(404).json({ message: 'Nutrition plan not found' });
        }

        plan.isActive = true;
        const updatedPlan = await plan.save();
        res.json(updatedPlan);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE nutrition plan
router.delete('/:id', auth, async (req, res) => {
    try {
        const plan = await NutritionPlan.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!plan) {
            return res.status(404).json({ message: 'Nutrition plan not found' });
        }

        res.json({ message: 'Nutrition plan deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
