import React, { useState } from 'react';
import { updateUser } from '../services/api';

export default function ConnectedDevicesModal({ user, onClose, onUpdate }) {
    const [devices, setDevices] = useState(user?.preferences?.connectedDevices || []);
    const [newDevice, setNewDevice] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const availableDevices = [
        { name: 'Apple Watch', icon: 'watch' },
        { name: 'Fitbit', icon: 'watch' },
        { name: 'Garmin', icon: 'watch' },
        { name: 'Samsung Health', icon: 'smartphone' },
        { name: 'Google Fit', icon: 'smartphone' },
        { name: 'Strava', icon: 'directions_run' }
    ];

    const handleAddDevice = (deviceName) => {
        if (!devices.includes(deviceName)) {
            setDevices([...devices, deviceName]);
        }
    };

    const handleRemoveDevice = (deviceName) => {
        setDevices(devices.filter(d => d !== deviceName));
    };

    const handleSave = async () => {
        setError('');
        setLoading(true);

        try {
            const updated = await updateUser(user._id, {
                preferences: {
                    ...user.preferences,
                    connectedDevices: devices
                }
            });
            onUpdate(updated);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to update devices');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-3xl max-w-md w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black tracking-tight">Connected Devices</h2>
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

                <div className="space-y-6">
                    {/* Currently Connected */}
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
                            Currently Connected
                        </h3>
                        {devices.length > 0 ? (
                            <div className="space-y-2">
                                {devices.map(device => (
                                    <div
                                        key={device}
                                        className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-2xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="material-icons-round text-primary">check_circle</span>
                                            <span className="font-bold">{device}</span>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveDevice(device)}
                                            className="p-2 hover:bg-red-500/10 rounded-xl text-red-500 transition-colors"
                                        >
                                            <span className="material-icons-round text-sm">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-4">No devices connected</p>
                        )}
                    </div>

                    {/* Available Devices */}
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
                            Available Devices
                        </h3>
                        <div className="space-y-2">
                            {availableDevices
                                .filter(d => !devices.includes(d.name))
                                .map(device => (
                                    <button
                                        key={device.name}
                                        onClick={() => handleAddDevice(device.name)}
                                        className="w-full flex items-center justify-between p-4 bg-surface-highlight hover:bg-surface-highlight/80 rounded-2xl transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="material-icons-round text-slate-400 group-hover:text-primary transition-colors">
                                                {device.icon}
                                            </span>
                                            <span className="font-bold">{device.name}</span>
                                        </div>
                                        <span className="material-icons-round text-slate-400 group-hover:text-primary transition-colors">
                                            add_circle
                                        </span>
                                    </button>
                                ))}
                        </div>
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
                            onClick={handleSave}
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-primary text-background-dark rounded-2xl font-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
