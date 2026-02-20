import React, { useState } from 'react';
import { updateUser } from '../services/api';

export default function SettingsModal({ user, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        language: user?.preferences?.language || 'English (US)',
        notifications: user?.preferences?.notifications ?? true,
        security2FA: user?.preferences?.security2FA ?? false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const updated = await updateUser(user._id, {
                preferences: {
                    ...user.preferences,
                    ...formData
                }
            });
            onUpdate(updated);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const languages = [
        'English (US)',
        'English (UK)',
        'Spanish',
        'French',
        'German',
        'Italian',
        'Portuguese',
        'Chinese',
        'Japanese',
        'Korean'
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-3xl max-w-md w-full p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black tracking-tight">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-surface-highlight rounded-xl transition-colors"
                    >
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                            Language
                        </label>
                        <select
                            value={formData.language}
                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                            className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        >
                            {languages.map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-surface-highlight rounded-2xl">
                        <div>
                            <p className="font-bold">Notifications</p>
                            <p className="text-xs text-slate-500">Receive push notifications</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, notifications: !formData.notifications })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${formData.notifications ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                        >
                            <span
                                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.notifications ? 'translate-x-6' : ''
                                    }`}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-surface-highlight rounded-2xl">
                        <div>
                            <p className="font-bold">Two-Factor Authentication</p>
                            <p className="text-xs text-slate-500">Extra security for your account</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, security2FA: !formData.security2FA })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${formData.security2FA ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                        >
                            <span
                                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.security2FA ? 'translate-x-6' : ''
                                    }`}
                            />
                        </button>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-surface-highlight rounded-2xl font-bold hover:bg-surface-highlight/80 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-primary text-background-dark rounded-2xl font-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
