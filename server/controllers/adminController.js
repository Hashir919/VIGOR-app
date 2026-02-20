const User = require('../models/User');
const Workout = require('../models/Workout');
const Metric = require('../models/Metric');
const AppSettings = require('../models/AppSettings');
const ActivityLog = require('../models/ActivityLog');
const bcrypt = require('bcryptjs');

// Helper for logging admin actions
const logAction = async (req, event, description, targetId = null, targetType = null, metadata = {}) => {
    try {
        await ActivityLog.create({
            event,
            description,
            performedBy: req.user.id,
            targetId,
            targetType,
            ipAddress: req.ip,
            metadata
        });
    } catch (err) {
        console.error('Failed to log admin action:', err);
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

const updateUserStatus = async (req, res) => {
    const { id } = req.params;
    const { isActive, role } = req.body;
    try {
        const user = await User.findByIdAndUpdate(id, { isActive, role }, { new: true }).select('-password');
        await logAction(req, 'USER_UPDATE', `Updated user status/role for ${user.email}`, id, 'USER', { isActive, role });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await logAction(req, 'USER_DELETE', `Deleted user ${user.email}`, req.params.id, 'USER');
            await User.findByIdAndDelete(req.params.id);
            // Also cleanup their data
            await Workout.deleteMany({ userId: req.params.id });
            await Metric.deleteMany({ userId: req.params.id });
        }
        res.json({ message: 'User and associated data deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
};

const getStats = async (req, res) => {
    try {
        const usersCount = await User.countDocuments();
        const workoutsCount = await Workout.countDocuments();
        const metricsCount = await Metric.countDocuments();
        const recentLogs = await ActivityLog.find().sort({ createdAt: -1 }).limit(10).populate('performedBy', 'name');

        res.json({
            users: usersCount,
            workouts: workoutsCount,
            metrics: metricsCount,
            recentLogs
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

const resetPassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    try {
        const user = await User.findById(id);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await User.findByIdAndUpdate(id, { password: hashedPassword });
        await logAction(req, 'PASSWORD_RESET', `Force reset password for ${user.email}`, id, 'USER');
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password' });
    }
};

// --- Settings Management ---
const getSettings = async (req, res) => {
    try {
        let settings = await AppSettings.findOne();
        if (!settings) {
            settings = await AppSettings.create({ maintenanceMode: false, registrationsEnabled: true });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching settings' });
    }
};

const updateSettings = async (req, res) => {
    try {
        let settings = await AppSettings.findOne();
        if (!settings) {
            settings = new AppSettings();
        }
        const oldSettings = { ...settings.toObject() };
        Object.assign(settings, req.body);
        settings.lastUpdatedBy = req.user.id;
        await settings.save();

        await logAction(req, 'SETTINGS_CHANGE', 'Updated system settings', settings._id, 'SETTING', {
            old: oldSettings,
            new: req.body
        });

        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error updating settings' });
    }
};

// --- Global Data Management ---
const getAllWorkouts = async (req, res) => {
    try {
        const workouts = await Workout.find().populate('userId', 'name email').sort({ createdAt: -1 });
        res.json(workouts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all workouts' });
    }
};

const deleteWorkoutGlobal = async (req, res) => {
    try {
        const workout = await Workout.findById(req.params.id);
        if (workout) {
            await logAction(req, 'WORKOUT_DELETE', `Deleted workout log ${req.params.id}`, req.params.id, 'WORKOUT');
            await Workout.findByIdAndDelete(req.params.id);
        }
        res.json({ message: 'Workout deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting workout' });
    }
};

const getAllMetrics = async (req, res) => {
    try {
        const metrics = await Metric.find().populate('userId', 'name email').sort({ date: -1 });
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all metrics' });
    }
};

const deleteMetricGlobal = async (req, res) => {
    try {
        await logAction(req, 'METRIC_DELETE', `Deleted health metric log ${req.params.id}`, req.params.id, 'METRIC');
        await Metric.findByIdAndDelete(req.params.id);
        res.json({ message: 'Metric deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting metric' });
    }
};

const getActivityLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find().populate('performedBy', 'name email').sort({ createdAt: -1 }).limit(100);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching security logs' });
    }
};

module.exports = {
    getAllUsers,
    updateUserStatus,
    deleteUser,
    getStats,
    resetPassword,
    getSettings,
    updateSettings,
    getAllWorkouts,
    deleteWorkoutGlobal,
    getAllMetrics,
    deleteMetricGlobal,
    getActivityLogs
};
