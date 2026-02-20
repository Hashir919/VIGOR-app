import React, { useState } from 'react';
import { changePassword } from '../services/api';

export default function ChangePasswordModal({ onClose }) {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '' });

    const validatePasswordStrength = (password) => {
        if (!password) return { score: 0, message: '' };

        let score = 0;
        let message = '';

        // Length check
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;

        // Character variety checks
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;

        // Determine message and final score
        if (score <= 2) {
            message = 'Weak';
        } else if (score <= 4) {
            message = 'Medium';
        } else {
            message = 'Strong';
        }

        return { score, message };
    };

    const handleNewPasswordChange = (value) => {
        setFormData({ ...formData, newPassword: value });
        setPasswordStrength(validatePasswordStrength(value));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        // Validation
        if (formData.newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (formData.currentPassword === formData.newPassword) {
            setError('New password must be different from current password');
            return;
        }

        if (passwordStrength.score < 3) {
            setError('Please choose a stronger password');
            return;
        }

        setLoading(true);

        try {
            await changePassword(formData.currentPassword, formData.newPassword);

            setSuccess(true);
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });

            // Auto-close after success
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStrengthColor = () => {
        if (passwordStrength.score <= 2) return 'bg-red-500';
        if (passwordStrength.score <= 4) return 'bg-orange-500';
        return 'bg-green-500';
    };

    const getStrengthWidth = () => {
        return `${(passwordStrength.score / 6) * 100}%`;
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-3xl max-w-md w-full p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <span className="material-icons-round">lock</span>
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">Change Password</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-surface-highlight rounded-xl transition-colors"
                    >
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm flex items-start gap-2">
                        <span className="material-icons-round text-sm mt-0.5">error</span>
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-500 text-sm flex items-start gap-2">
                        <span className="material-icons-round text-sm mt-0.5">check_circle</span>
                        <span>Password changed successfully!</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                            Current Password
                        </label>
                        <input
                            type="password"
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                            className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            required
                            disabled={loading || success}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => handleNewPasswordChange(e.target.value)}
                            className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            required
                            disabled={loading || success}
                            minLength={8}
                        />
                        {formData.newPassword && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-slate-500">Password Strength</span>
                                    <span className={`text-xs font-bold ${passwordStrength.score <= 2 ? 'text-red-500' :
                                        passwordStrength.score <= 4 ? 'text-orange-500' : 'text-green-500'
                                        }`}>
                                        {passwordStrength.message}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                                        style={{ width: getStrengthWidth() }}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    Use 8+ characters with uppercase, lowercase, numbers, and symbols
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            required
                            disabled={loading || success}
                        />
                        {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                <span className="material-icons-round text-xs">error</span>
                                Passwords do not match
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-surface-highlight rounded-2xl font-bold hover:bg-surface-highlight/80 transition-all"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || success}
                            className="flex-1 px-6 py-3 bg-primary text-background-dark rounded-2xl font-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Changing...' : success ? 'Changed!' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
