
const mongoose = require('mongoose');

const mealTemplateSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // null for global/system templates
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack', 'other'],
        default: 'other'
    },
    isPublic: {
        type: Boolean,
        default: false
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
        }
    }],
    totalNutrition: {
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fats: { type: Number, default: 0 }
    },
    instructions: String
}, { timestamps: true });

module.exports = mongoose.model('MealTemplate', mealTemplateSchema);
