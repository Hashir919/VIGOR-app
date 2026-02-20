
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded.user;

        // Find user to check for role and isActive status
        const User = require('../models/User');
        const user = await User.findById(req.user.id);

        if (!user || (!user.isActive && user.role !== 'ADMIN')) {
            return res.status(401).json({ message: 'User account is inactive or not found' });
        }

        // Maintenance Mode Check
        const AppSettings = require('../models/AppSettings');
        const settings = await AppSettings.findOne();
        if (settings?.maintenanceMode && user.role !== 'ADMIN') {
            return res.status(503).json({ message: 'System is currently under maintenance. Please try again later.' });
        }

        req.userObj = user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.userObj && req.userObj.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Admin only' });
    }
};

module.exports = auth;
module.exports.auth = auth;
module.exports.adminOnly = adminOnly;
