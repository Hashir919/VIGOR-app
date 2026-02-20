import React, { useState, useEffect } from 'react';

const AdminSettings = () => {
    const [settings, setSettings] = useState({ maintenanceMode: false, registrationsEnabled: true });
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInitialData();
        const interval = setInterval(fetchLogs, 5000); // Poll logs every 5s
        return () => clearInterval(interval);
    }, []);

    const fetchInitialData = async () => {
        try {
            const [settingsRes, logsRes] = await Promise.all([
                fetch('/api/admin/settings', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
                fetch('/api/admin/logs', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
            ]);

            if (settingsRes.ok) setSettings(await settingsRes.json());
            if (logsRes.ok) {
                const logsData = await logsRes.json();
                if (Array.isArray(logsData)) setLogs(logsData);
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/admin/logs', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) setLogs(data);
            }
        } catch (err) {
            console.error('Poll error:', err);
        }
    };

    const toggleSetting = async (key) => {
        const newValue = !settings[key];
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ [key]: newValue })
            });
            const updated = await res.json();
            setSettings(updated);
        } catch (error) {
            console.error('Error updating settings:', error);
        }
    };

    if (loading) return <div className="p-8 text-center text-text-muted">Initializing system controls...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-surface p-8 rounded-[2rem] border border-border shadow-soft h-fit">
                <div className="flex items-center gap-3 mb-8">
                    <span className="material-icons-round text-primary text-3xl">tune</span>
                    <h3 className="text-xl font-bold text-white">System Configuration</h3>
                </div>

                <div className="space-y-4">
                    {/* Maintenance Mode */}
                    <div className={`p-6 rounded-3xl border transition-all ${settings.maintenanceMode ? 'bg-red-500/10 border-red-500/20' : 'bg-bg-main border-border'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${settings.maintenanceMode ? 'bg-red-500 text-white' : 'bg-surface-highlight text-text-muted'}`}>
                                    <span className="material-icons-round text-2xl">construction</span>
                                </div>
                                <div>
                                    <p className="font-bold text-text-main">Maintenance Mode</p>
                                    <p className="text-xs text-text-muted font-medium mt-0.5">Restriction level: Global</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleSetting('maintenanceMode')}
                                className={`w-14 h-8 rounded-full relative transition-colors ${settings.maintenanceMode ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-surface-highlight'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${settings.maintenanceMode ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>
                        <p className="mt-4 text-[11px] text-text-muted font-bold uppercase tracking-tight italic">
                            {settings.maintenanceMode
                                ? '!! Attention: Only administrators can currently access the application !!'
                                : 'System is currently open to all registered users.'}
                        </p>
                    </div>

                    {/* Registrations */}
                    <div className={`p-6 rounded-3xl border transition-all ${!settings.registrationsEnabled ? 'bg-orange-500/10 border-orange-500/20' : 'bg-bg-main border-border'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${settings.registrationsEnabled ? 'bg-primary text-background' : 'bg-surface-highlight text-text-muted'}`}>
                                    <span className="material-icons-round text-2xl">person_add</span>
                                </div>
                                <div>
                                    <p className="font-bold text-text-main">New Registrations</p>
                                    <p className="text-xs text-text-muted font-medium mt-0.5">Status: {settings.registrationsEnabled ? 'Enabled' : 'Locked'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleSetting('registrationsEnabled')}
                                className={`w-14 h-8 rounded-full relative transition-colors ${settings.registrationsEnabled ? 'bg-primary shadow-[0_0_15px_rgba(var(--color-primary),0.4)]' : 'bg-surface-highlight'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${settings.registrationsEnabled ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-surface flex flex-col rounded-[2rem] border border-border shadow-soft overflow-hidden h-[600px]">
                <div className="p-8 pb-4 border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="material-icons-round text-primary text-3xl">terminal</span>
                            <h3 className="text-xl font-bold text-white">Security & System Logs</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                            <span className="text-[10px] font-black text-primary uppercase">Live</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-bg-main font-mono custom-scrollbar">
                    {logs.map((log, i) => (
                        <div key={log._id || i} className="group p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] font-bold text-primary tracking-tighter">[{log.event}]</span>
                                <span className="text-[10px] text-text-muted text-opacity-50 group-hover:text-opacity-100">{new Date(log.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-xs text-text-main break-words font-medium leading-relaxed">{log.description}</p>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-[10px] text-text-muted/60 lowercase italic">Performed by: {log.performedBy?.email || 'System'}</span>
                                {log.ipAddress && <span className="text-[9px] text-text-muted/30 font-bold">{log.ipAddress}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
