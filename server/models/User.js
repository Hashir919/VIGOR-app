
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    goals: {
        dailySteps: { type: Number, default: 10000 },
        weeklyCardioDays: { type: Number, default: 3 },
        dailyCaloriesBurn: { type: Number, default: 2500 },
        dailyWaterLiters: { type: Number, default: 2.5 },
        dailySleepHours: { type: Number, default: 8 }
    },
    stats: {
        level: { type: Number, default: 1 },
        badges: { type: Number, default: 0 },
        streak: { type: Number, default: 0 },
        totalKm: { type: Number, default: 0 }
    },
    password: { type: String, required: true },
    profilePicture: String
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
