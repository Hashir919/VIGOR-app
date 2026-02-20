import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-12 text-center text-text-muted italic animate-pulse">Scanning system records...</div>;

    const statCards = [
        { label: 'Total Users', value: stats?.users || 0, icon: 'people', color: 'primary' },
        { label: 'Workouts Logged', value: stats?.workouts || 0, icon: 'fitness_center', color: 'blue-500' },
        { label: 'Metrics Saved', value: stats?.metrics || 0, icon: 'analytics', color: 'purple-500' }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((card, idx) => (
                    <div key={idx} className="bg-surface p-6 rounded-3xl border border-border hover:border-primary/30 transition-all group shadow-soft">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-2xl bg-surface-highlight text-primary group-hover:scale-110 transition-transform">
                                <span className="material-icons-round text-3xl">{card.icon}</span>
                            </div>
                            <span className="text-text-muted text-[10px] font-black uppercase tracking-widest bg-bg-main px-2 py-1 rounded-lg">Real-time</span>
                        </div>
                        <h3 className="text-4xl font-black text-white tracking-tighter">{card.value}</h3>
                        <p className="text-text-muted font-bold mt-1 uppercase tracking-widest text-xs">{card.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-surface p-8 rounded-[2rem] border border-border overflow-hidden shadow-soft">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="material-icons-round text-primary font-black">history</span>
                            Recent System Activity
                        </h3>
                        <span className="text-[10px] font-black text-text-muted uppercase bg-surface-highlight px-3 py-1 rounded-full">Feed: Live</span>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {stats?.recentLogs?.length > 0 ? stats.recentLogs.map((log) => (
                            <div key={log._id} className="flex items-start gap-4 p-4 rounded-2xl bg-bg-main border border-border hover:border-border/60 transition-all hover:scale-[1.01]">
                                <div className="p-2.5 rounded-xl bg-surface-highlight flex-shrink-0">
                                    <span className="material-icons-round text-lg text-text-muted">
                                        {log.event.includes('USER') ? 'person' :
                                            log.event.includes('SETTING') ? 'settings' :
                                                log.event.includes('WORKOUT') ? 'fitness_center' : 'info'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-text-main leading-tight line-clamp-2">{log.description}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-[10px] text-primary uppercase font-black tracking-tight">{log.performedBy?.name || 'System'}</span>
                                        <span className="text-[10px] text-text-muted">•</span>
                                        <span className="text-[10px] text-text-muted font-bold tracking-tight">{new Date(log.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-16 opacity-50">
                                <span className="material-icons-round text-5xl text-surface-highlight mb-2">auto_awesome</span>
                                <p className="text-text-muted text-sm font-bold uppercase tracking-widest">No recent system alerts</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-surface p-8 rounded-[2rem] border border-border shadow-soft">
                        <h3 className="text-xl font-bold text-white mb-6">Service Health</h3>
                        <div className="space-y-4">
                            <div className="group flex items-center gap-4 p-5 rounded-2xl bg-bg-main border border-border hover:border-primary/20 transition-colors">
                                <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#30e87a]"></div>
                                <div>
                                    <p className="text-text-main font-bold text-sm">Vigor API Layer</p>
                                    <p className="text-[10px] text-primary uppercase font-black tracking-widest group-hover:tracking-[0.2em] transition-all">Fully Operational</p>
                                </div>
                            </div>
                            <div className="group flex items-center gap-4 p-5 rounded-2xl bg-bg-main border border-border hover:border-primary/20 transition-colors">
                                <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#30e87a]"></div>
                                <div>
                                    <p className="text-text-main font-bold text-sm">MongoDB Instance</p>
                                    <p className="text-[10px] text-primary uppercase font-black tracking-widest group-hover:tracking-[0.2em] transition-all">Stable Connection</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 text-center">System Version</p>
                            <p className="text-center text-white font-bold font-mono">v1.2.0-stable</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
