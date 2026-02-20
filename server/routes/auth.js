const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if registrations are enabled
        const AppSettings = require('../models/AppSettings');
        const settings = await AppSettings.findOne();
        if (settings && !settings.registrationsEnabled) {
            return res.status(403).json({ message: 'New registrations are currently disabled by the administrator.' });
        }

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = new User({
            name,
            email,
            password: hashedPassword,
            profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=30e87a&color=0f172a`
        });

        await user.save();

        // Create token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret', // Fallback for dev
            { expiresIn: '30d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, profilePicture: user.profilePicture, role: user.role } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Create token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '30d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, profilePicture: user.profilePicture, role: user.role } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Change Password (for logged-in users)
router.post('/change-password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get user from token
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User.findById(decoded.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Forgot Password - Send Reset Code
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No account found with that email' });
        }

        // Generate 6-digit code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Store code and expiry (10 minutes)
        user.resetPasswordCode = resetCode;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // In production, send email here
        console.log(`Password reset code for ${email}: ${resetCode}`);

        // For development, return code in response (REMOVE IN PRODUCTION)
        res.json({
            message: 'Reset code sent to email',
            // Remove this in production:
            devCode: resetCode
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Verify Reset Code
router.post('/verify-reset-code', async (req, res) => {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if code matches and hasn't expired
        if (user.resetPasswordCode !== code) {
            return res.status(400).json({ message: 'Invalid reset code' });
        }

        if (Date.now() > user.resetPasswordExpires) {
            return res.status(400).json({ message: 'Reset code has expired' });
        }

        res.json({ message: 'Code verified successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify code again
        if (user.resetPasswordCode !== code) {
            return res.status(400).json({ message: 'Invalid reset code' });
        }

        if (Date.now() > user.resetPasswordExpires) {
            return res.status(400).json({ message: 'Reset code has expired' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear reset fields
        user.password = hashedPassword;
        user.resetPasswordCode = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
