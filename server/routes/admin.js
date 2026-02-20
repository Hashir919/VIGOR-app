const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const {
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
} = require('../controllers/adminController');

router.use((req, res, next) => {
    console.log(`Admin Router: ${req.method} ${req.url}`);
    next();
});

router.use(auth);
router.use(adminOnly);

router.get('/users', getAllUsers);
router.put('/users/:id', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/reset-password', resetPassword);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

router.get('/workouts', getAllWorkouts);
router.delete('/workouts/:id', deleteWorkoutGlobal);

router.get('/metrics', getAllMetrics);
router.delete('/metrics/:id', deleteMetricGlobal);

router.get('/logs', getActivityLogs);

router.get('/stats', getStats);

module.exports = router;
