
const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true // For search performance
    },
    brand: String,
    category: {
        type: String,
        enum: ['protein', 'carbs', 'fats', 'vegetables', 'fruits', 'dairy', 'grains', 'other'],
        default: 'other'
    },
    servingSize: {
        type: String,
        required: true,
        default: '100g'
    },
    nutrition: {
        calories: { type: Number, required: true },
        protein: { type: Number, required: true }, // grams
        carbs: { type: Number, required: true }, // grams
        fats: { type: Number, required: true }, // grams
        fiber: { type: Number, default: 0 }, // grams
        sugar: { type: Number, default: 0 } // grams
    },
    isVerified: {
        type: Boolean,
        default: false // true for admin-verified foods
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // null for system foods
    }
}, { timestamps: true });

// Text index for search
foodItemSchema.index({ name: 'text', brand: 'text' });

module.exports = mongoose.model('FoodItem', foodItemSchema);
