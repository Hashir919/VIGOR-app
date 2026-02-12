
const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body']
    },
    muscleGroup: [String],
    type: {
        type: String,
        required: true,
        enum: ['Strength', 'Cardio', 'Flexibility']
    },
    popularity: {
        type: Number,
        default: 0
    },
    icon: String
}, { timestamps: true });

module.exports = mongoose.model('Exercise', exerciseSchema);
