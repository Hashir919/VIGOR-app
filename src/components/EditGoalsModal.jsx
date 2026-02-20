import React, { useState } from 'react';
import { updateUser } from '../services/api';

export default function EditGoalsModal({ user, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        dailySteps: user?.goals?.dailySteps || 10000,
        weeklyCardioDays: user?.goals?.weeklyCardioDays || 3,
        dailyCaloriesBurn: user?.goals?.dailyCaloriesBurn || 2500,
        dailyWaterLiters: user?.goals?.dailyWaterLiters || 2.5,
        dailySleepHours: user?.goals?.dailySleepHours || 8
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const updated = await updateUser(user._id, { goals: formData });
            onUpdate(updated);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to update goals');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-3xl max-w-lg w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black tracking-tight">Edit Goals</h2>
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
                            Daily Steps Goal
                        </label>
                        <input
                            type="number"
                            value={formData.dailySteps}
                            onChange={(e) => setFormData({ ...formData, dailySteps: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            min="0"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                            Weekly Cardio Days
                        </label>
                        <input
                            type="number"
                            value={formData.weeklyCardioDays}
                            onChange={(e) => setFormData({ ...formData, weeklyCardioDays: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            min="0"
                            max="7"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                            Daily Calorie Burn Goal
                        </label>
                        <input
                            type="number"
                            value={formData.dailyCaloriesBurn}
                            onChange={(e) => setFormData({ ...formData, dailyCaloriesBurn: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            min="0"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                            Daily Water Goal (Liters)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.dailyWaterLiters}
                            onChange={(e) => setFormData({ ...formData, dailyWaterLiters: parseFloat(e.target.value) })}
                            className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            min="0"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                            Daily Sleep Goal (Hours)
                        </label>
                        <input
                            type="number"
                            step="0.5"
                            value={formData.dailySleepHours}
                            onChange={(e) => setFormData({ ...formData, dailySleepHours: parseFloat(e.target.value) })}
                            className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            min="0"
                            max="24"
                            required
                        />
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
                            {loading ? 'Saving...' : 'Save Goals'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
