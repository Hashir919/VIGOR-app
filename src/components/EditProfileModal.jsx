import React, { useState } from 'react';
import { updateUser } from '../services/api';

export default function EditProfileModal({ user, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        profilePicture: user?.profilePicture || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const updated = await updateUser(user._id, formData);
            onUpdate(updated);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-3xl max-w-md w-full p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black tracking-tight">Edit Profile</h2>
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
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full px-4 py-3 bg-surface-highlight border border-border rounded-2xl text-slate-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-500 mt-2">Email cannot be changed for security reasons</p>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                            Profile Picture URL
                        </label>
                        <input
                            type="url"
                            value={formData.profilePicture}
                            onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
                            className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            placeholder="https://example.com/avatar.jpg"
                        />
                        {formData.profilePicture && (
                            <div className="mt-3 flex items-center gap-3">
                                <img
                                    src={formData.profilePicture}
                                    alt="Preview"
                                    className="w-12 h-12 rounded-full object-cover border-2 border-border"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                                <span className="text-xs text-slate-500">Preview</span>
                            </div>
                        )}
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
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
