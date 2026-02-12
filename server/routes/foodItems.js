
const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem');
const auth = require('../middleware/auth');

// GET search food items
router.get('/search', auth, async (req, res) => {
    try {
        const query = req.query.q;

        if (!query) {
            return res.status(400).json({ message: 'Search query required' });
        }

        // Text search on name and brand
        const foods = await FoodItem.find({
            $text: { $search: query }
        })
            .limit(20)
            .sort({ isVerified: -1, name: 1 }); // Verified foods first

        res.json(foods);
    } catch (err) {
        // Fallback to regex search if text index not ready
        try {
            const foods = await FoodItem.find({
                name: { $regex: req.query.q, $options: 'i' }
            })
                .limit(20)
                .sort({ isVerified: -1, name: 1 });

            res.json(foods);
        } catch (fallbackErr) {
            res.status(500).json({ message: fallbackErr.message });
        }
    }
});

// GET food categories
router.get('/categories', auth, async (req, res) => {
    try {
        const categories = await FoodItem.distinct('category');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET specific food item
router.get('/:id', auth, async (req, res) => {
    try {
        const food = await FoodItem.findById(req.params.id);

        if (!food) {
            return res.status(404).json({ message: 'Food item not found' });
        }

        res.json(food);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create custom food item
router.post('/', auth, async (req, res) => {
    const food = new FoodItem({
        name: req.body.name,
        brand: req.body.brand,
        category: req.body.category || 'other',
        servingSize: req.body.servingSize,
        nutrition: {
            calories: req.body.nutrition.calories,
            protein: req.body.nutrition.protein,
            carbs: req.body.nutrition.carbs,
            fats: req.body.nutrition.fats,
            fiber: req.body.nutrition.fiber || 0,
            sugar: req.body.nutrition.sugar || 0
        },
        isVerified: false, // User-created foods are not verified
        createdBy: req.user.id
    });

    try {
        const newFood = await food.save();
        res.status(201).json(newFood);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
