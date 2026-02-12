
const mongoose = require('mongoose');

const nutritionPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        default: 'My Nutrition Plan'
    },
    isActive: {
        type: Boolean,
        default: false
    },
    goals: {
        dailyCalories: { type: Number, default: 2000 },
        proteinGrams: { type: Number, default: 150 },
        carbsGrams: { type: Number, default: 200 },
        fatsGrams: { type: Number, default: 60 }
    },
    mealSchedule: [{
        name: { type: String, required: true }, // e.g., "Breakfast", "Lunch"
        targetTime: String, // e.g., "08:00"
        targetCalories: Number
    }]
}, { timestamps: true });

// Ensure only one active plan per user
nutritionPlanSchema.pre('save', async function () {
    if (this.isActive) {
        await this.constructor.updateMany(
            { userId: this.userId, _id: { $ne: this._id } },
            { isActive: false }
        );
    }
});

module.exports = mongoose.model('NutritionPlan', nutritionPlanSchema);
