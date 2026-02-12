const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: { type: String, default: 'New Session' },
    type: { type: String, default: 'Weightlifting' },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    duration: { type: Number }, // in minutes
    calories: { type: Number, default: 0 },
    intensity: { type: String, enum: ['Low', 'Moderate', 'High', 'Extreme'], default: 'Moderate' },
    totalVolume: { type: Number, default: 0 },
    notes: String,
    exercises: [{
        exerciseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exercise'
        },
        name: String,
        sets: [{
            reps: Number,
            weight: Number,
            distance: Number,
            time: Number, // seconds
            isCompleted: { type: Boolean, default: true }
        }],
        notes: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);
