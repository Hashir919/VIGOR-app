import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword, verifyResetCode, resetPassword } from '../services/api';

export default function ForgotPassword() {
    const [step, setStep] = useState('email'); // 'email', 'code', 'reset', 'success'
    const [email, setEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '' });

    const validatePasswordStrength = (password) => {
        if (!password) return { score: 0, message: '' };

        let score = 0;
        let message = '';

        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;

        if (score <= 2) {
            message = 'Weak';
        } else if (score <= 4) {
            message = 'Medium';
        } else {
            message = 'Strong';
        }

        return { score, message };
    };

    const handleSendCode = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await forgotPassword(email);
            setStep('code');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await verifyResetCode(email, resetCode);
            setStep('reset');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (passwordStrength.score < 3) {
            setError('Please choose a stronger password');
            return;
        }

        setLoading(true);

        try {
            await resetPassword(email, resetCode, newPassword);
            setStep('success');
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
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="w-full max-w-md">
                <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex p-4 bg-primary/10 rounded-2xl mb-4">
                            <span className="material-icons-round text-4xl text-primary">
                                {step === 'success' ? 'check_circle' : 'lock_reset'}
                            </span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight mb-2">
                            {step === 'email' && 'Forgot Password?'}
                            {step === 'code' && 'Check Your Email'}
                            {step === 'reset' && 'Reset Password'}
                            {step === 'success' && 'All Set!'}
                        </h1>
                        <p className="text-slate-500 text-sm">
                            {step === 'email' && "Enter your email and we'll send you a reset code"}
                            {step === 'code' && `We sent a 6-digit code to ${email}`}
                            {step === 'reset' && 'Choose a strong new password'}
                            {step === 'success' && 'Your password has been reset successfully'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm flex items-start gap-2">
                            <span className="material-icons-round text-sm mt-0.5">error</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Step 1: Email */}
                    {step === 'email' && (
                        <form onSubmit={handleSendCode} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="you@example.com"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-6 py-4 bg-primary text-background-dark rounded-2xl font-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending...' : 'Send Reset Code'}
                            </button>

                            <div className="text-center">
                                <Link
                                    to="/login"
                                    className="text-sm text-primary hover:underline font-bold"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    )}

                    {/* Step 2: Verification Code */}
                    {step === 'code' && (
                        <form onSubmit={handleVerifyCode} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    value={resetCode}
                                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-center text-2xl font-black tracking-widest"
                                    placeholder="000000"
                                    required
                                    disabled={loading}
                                    maxLength={6}
                                />
                                <p className="text-xs text-slate-500 mt-2 text-center">
                                    Enter the 6-digit code sent to your email
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || resetCode.length !== 6}
                                className="w-full px-6 py-4 bg-primary text-background-dark rounded-2xl font-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </button>

                            <div className="text-center space-y-2">
                                <button
                                    type="button"
                                    onClick={handleSendCode}
                                    className="text-sm text-primary hover:underline font-bold"
                                    disabled={loading}
                                >
                                    Resend Code
                                </button>
                                <br />
                                <button
                                    type="button"
                                    onClick={() => setStep('email')}
                                    className="text-sm text-slate-500 hover:underline"
                                >
                                    Change Email
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: Reset Password */}
                    {step === 'reset' && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value);
                                        setPasswordStrength(validatePasswordStrength(e.target.value));
                                    }}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    required
                                    disabled={loading}
                                    minLength={8}
                                />
                                {newPassword && (
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
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    required
                                    disabled={loading}
                                />
                                {confirmPassword && newPassword !== confirmPassword && (
                                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                        <span className="material-icons-round text-xs">error</span>
                                        Passwords do not match
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-6 py-4 bg-primary text-background-dark rounded-2xl font-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    {/* Step 4: Success */}
                    {step === 'success' && (
                        <div className="text-center space-y-6">
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-500">
                                <p className="font-bold">Password reset successful!</p>
                                <p className="text-sm mt-1">You can now log in with your new password</p>
                            </div>

                            <Link
                                to="/login"
                                className="block w-full px-6 py-4 bg-primary text-background-dark rounded-2xl font-black hover:scale-105 active:scale-95 transition-all text-center"
                            >
                                Go to Login
                            </Link>
                        </div>
                    )}
                </div>

                {step !== 'success' && (
                    <p className="text-center text-xs text-slate-500 mt-6">
                        Remember your password?{' '}
                        <Link to="/login" className="text-primary hover:underline font-bold">
                            Sign In
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
}
