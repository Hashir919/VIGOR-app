
const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: { type: Date, default: Date.now },
    caloriesConsumed: { type: Number, default: 0 },
    caloriesTarget: { type: Number, default: 2500 },
    protein: { type: Number, default: 0 }, // in grams
    proteinTarget: { type: Number, default: 150 },
    carbs: { type: Number, default: 0 }, // in grams
    carbsTarget: { type: Number, default: 200 },
    fats: { type: Number, default: 0 }, // in grams
    fatsTarget: { type: Number, default: 60 },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NutritionPlan',
        required: false
    },
    waterIntake: { type: Number, default: 0 }, // in liters
    meals: [{
        name: String,
        mealType: {
            type: String,
            enum: ['breakfast', 'lunch', 'dinner', 'snack', 'other'],
            default: 'other'
        },
        time: Date,
        templateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MealTemplate',
            required: false
        },
        foods: [{
            foodItemId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'FoodItem',
                required: true
            },
            servings: {
                type: Number,
                default: 1
            },
            name: String, // Cached for display
            calories: Number, // Cached calculated value
            protein: Number,
            carbs: Number,
            fats: Number
        }],
        calories: Number, // Total for this meal
        protein: Number,
        carbs: Number,
        fats: Number
    }]
}, { timestamps: true });

module.exports = mongoose.model('Nutrition', nutritionSchema);
