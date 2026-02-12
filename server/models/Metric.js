
const mongoose = require('mongoose');

const metricSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: { type: Date, default: Date.now },
    weight: Number,
    steps: { type: Number, default: 0 },
    calories: { type: Number, default: 0 }, // Actual calories burned
    activeMinutes: { type: Number, default: 0 }, // Actual active minutes
    waterIntake: Number, // in liters
    sleepHours: Number,
    sleepQuality: {
        type: String,
        enum: ['Poor', 'Fair', 'Good', 'Excellent'],
        default: 'Good'
    },
    heartRateAvg: Number,
    heartRateHistory: [{ // For chart visualization
        time: Date,
        value: Number
    }]
}, { timestamps: true });

module.exports = mongoose.model('Metric', metricSchema);
