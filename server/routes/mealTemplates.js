
const express = require('express');
const router = express.Router();
const MealTemplate = require('../models/MealTemplate');
const FoodItem = require('../models/FoodItem');
const auth = require('../middleware/auth');

// GET all meal templates (user's + public)
router.get('/', auth, async (req, res) => {
    try {
        const templates = await MealTemplate.find({
            $or: [
                { userId: req.user.id },
                { isPublic: true }
            ]
        })
            .populate('foods.foodItemId')
            .sort({ createdAt: -1 });

        res.json(templates);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET specific meal template
router.get('/:id', auth, async (req, res) => {
    try {
        const template = await MealTemplate.findById(req.params.id)
            .populate('foods.foodItemId');

        if (!template) {
            return res.status(404).json({ message: 'Meal template not found' });
        }

        // Check access (owner or public)
        if (template.userId && template.userId.toString() !== req.user.id && !template.isPublic) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(template);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create meal template
router.post('/', auth, async (req, res) => {
    try {
        // Calculate total nutrition from foods
        let totalNutrition = { calories: 0, protein: 0, carbs: 0, fats: 0 };

        if (req.body.foods && req.body.foods.length > 0) {
            for (const food of req.body.foods) {
                const foodItem = await FoodItem.findById(food.foodItemId);
                if (foodItem) {
                    const servings = food.servings || 1;
                    totalNutrition.calories += foodItem.nutrition.calories * servings;
                    totalNutrition.protein += foodItem.nutrition.protein * servings;
                    totalNutrition.carbs += foodItem.nutrition.carbs * servings;
                    totalNutrition.fats += foodItem.nutrition.fats * servings;
                }
            }
        }

        const template = new MealTemplate({
            userId: req.user.id,
            name: req.body.name,
            category: req.body.category || 'other',
            isPublic: req.body.isPublic || false,
            foods: req.body.foods || [],
            totalNutrition,
            instructions: req.body.instructions
        });

        const newTemplate = await template.save();
        await newTemplate.populate('foods.foodItemId');
        res.status(201).json(newTemplate);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update meal template
router.put('/:id', auth, async (req, res) => {
    try {
        const template = await MealTemplate.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!template) {
            return res.status(404).json({ message: 'Meal template not found or access denied' });
        }

        // Recalculate nutrition if foods changed
        if (req.body.foods) {
            let totalNutrition = { calories: 0, protein: 0, carbs: 0, fats: 0 };

            for (const food of req.body.foods) {
                const foodItem = await FoodItem.findById(food.foodItemId);
                if (foodItem) {
                    const servings = food.servings || 1;
                    totalNutrition.calories += foodItem.nutrition.calories * servings;
                    totalNutrition.protein += foodItem.nutrition.protein * servings;
                    totalNutrition.carbs += foodItem.nutrition.carbs * servings;
                    totalNutrition.fats += foodItem.nutrition.fats * servings;
                }
            }

            template.totalNutrition = totalNutrition;
            template.foods = req.body.foods;
        }

        if (req.body.name) template.name = req.body.name;
        if (req.body.category) template.category = req.body.category;
        if (req.body.isPublic !== undefined) template.isPublic = req.body.isPublic;
        if (req.body.instructions) template.instructions = req.body.instructions;

        const updatedTemplate = await template.save();
        await updatedTemplate.populate('foods.foodItemId');
        res.json(updatedTemplate);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE meal template
router.delete('/:id', auth, async (req, res) => {
    try {
        const template = await MealTemplate.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!template) {
            return res.status(404).json({ message: 'Meal template not found or access denied' });
        }

        res.json({ message: 'Meal template deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
