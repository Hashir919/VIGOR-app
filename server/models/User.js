
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
    preferences: {
        language: { type: String, default: 'English (US)' },
        connectedDevices: { type: [String], default: [] },
        notifications: { type: Boolean, default: true },
        security2FA: { type: Boolean, default: false }
    },
    achievements: [{
        id: String,
        name: String,
        description: String,
        icon: String,
        dateEarned: Date
    }],
    password: { type: String, required: true },
    profilePicture: String,
    role: { type: String, default: 'USER', enum: ['USER', 'ADMIN'] },
    isActive: { type: Boolean, default: true },
    resetPasswordCode: String,
    resetPasswordExpires: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
