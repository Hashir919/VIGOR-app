import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMetricHistory, createMetric, fetchUser } from '../services/api';

export default function HealthMetrics() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [range, setRange] = useState('1M');
    const [showLogModal, setShowLogModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [userGoals, setUserGoals] = useState({ dailyWaterLiters: 2.5, dailySleepHours: 8 });
    const [logForm, setLogForm] = useState({
        weight: '',
        heartRateAvg: '',
        sleepHours: '',
        waterIntake: ''
    });

    const loadHistory = async (selectedRange) => {
        setLoading(true);
        setError(null);
        try {
            const [historyData, userData] = await Promise.all([
                fetchMetricHistory(selectedRange),
                fetchUser()
            ]);

            setHistory(historyData);
            if (userData?.goals) {
                setUserGoals(userData.goals);
            }

            if (historyData.length > 0) {
                const latest = historyData[historyData.length - 1];
                setLogForm({
                    weight: latest.weight || '',
                    heartRateAvg: latest.heartRateAvg || '',
                    sleepHours: latest.sleepHours || '',
                    waterIntake: latest.waterIntake || ''
                });
            }
        } catch (err) {
            console.error("Failed to load history", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createMetric(logForm);
            await loadHistory(range);
            setShowLogModal(false);
        } catch (error) {
            console.error("Failed to log metric", error);
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        loadHistory(range);
    }, [range]);

    // Get latest metrics
    const latest = history.length > 0 ? history[history.length - 1] : {
        weight: 0,
        heartRateAvg: 0,
        sleepHours: 0,
        waterIntake: 0
    };

    // Weight difference
    const weightDiff = history.length > 1 ? (latest.weight - history[0].weight).toFixed(1) : 0;

    // Generate simplified chart path
    const getPath = () => {
        if (!history.length || history.length < 2) return "M0,150 L400,150";

        const minWeight = Math.min(...history.map(h => h.weight)) - 5;
        const maxWeight = Math.max(...history.map(h => h.weight)) + 5;
        const rangeWeight = maxWeight - minWeight || 1;

        const points = history.map((h, i) => {
            const x = (i / (history.length - 1)) * 400;
            const y = 150 - (((h.weight - minWeight) / rangeWeight) * 120); // Scale to 120px height
            return `${x},${y}`;
        });
        return `M0,150 L${points.join(' L')} L400,150 Z`; // Simplified area
    };

    const formatDateRange = (d) => {
        const date = new Date(d);
        return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    };

    if (loading && history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="mt-6 text-text-muted font-bold uppercase tracking-widest text-xs">Syncing Biometrics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-40 bg-rose-500/5 rounded-[3rem] border border-rose-500/10">
                <span className="material-icons-round text-5xl text-rose-500 mb-4">cloud_off</span>
                <h2 className="text-xl font-black mb-2">Sync Failed</h2>
                <p className="text-text-muted font-bold mb-8">{error}</p>
                <button
                    onClick={() => loadHistory(range)}
                    className="bg-rose-500 text-white px-8 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-lg shadow-rose-500/20"
                >
                    RETRY SYNC
                </button>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col space-y-10">

            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Health Metrics</h1>
                    <p className="text-text-muted font-bold uppercase tracking-widest text-xs mt-2">Track your long-term progress</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowLogModal(true)}
                        className="flex items-center gap-2 bg-primary text-background-dark px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <span className="material-icons-round">add</span>
                        Log Metric
                    </button>
                    <div className="w-12 h-12 rounded-2xl border-2 border-primary/20 p-1 bg-surface-highlight">
                        <img alt="Profile" className="w-full h-full rounded-xl object-cover" src="https://ui-avatars.com/api/?name=User&background=30e87a&color=0f172a" />
                    </div>
                </div>
            </header>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                {/* Weight Trend - Primary Chart (Column 1-8) */}
                <section className="lg:col-span-8 bg-surface border border-border rounded-[2.5rem] p-8 lg:p-10 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 relative z-10">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight mb-2">Weight Journey</h2>
                            <div className="flex items-baseline gap-3">
                                <span className="text-5xl font-black tracking-tighter">{latest.weight || '--'}<span className="text-lg font-bold text-slate-400 ml-1">kg</span></span>
                                {history.length > 1 && (
                                    <div className={`flex items-center gap-1 ${weightDiff <= 0 ? 'bg-primary/10 text-primary' : 'bg-rose-500/10 text-rose-500'} px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest`}>
                                        <span className="material-icons-round text-sm">{weightDiff <= 0 ? 'trending_down' : 'trending_up'}</span>
                                        {Math.abs(weightDiff)} kg
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2 bg-surface-highlight p-1.5 rounded-2xl self-start sm:self-auto">
                            {['1W', '1M', '3M', '6M', '1Y'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRange(r)}
                                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${range === r ? 'bg-primary text-background-dark shadow-lg' : 'text-text-muted hover:text-white'}`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SVG Chart Area */}
                    <div className="relative h-64 w-full group">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 400 150" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#30e87a" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#30e87a" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path d={getPath()} fill="url(#chartGradient)" />
                            <path d={getPath().split(' L400,150 Z')[0]} fill="none" stroke="#30e87a" strokeWidth="3" strokeLinecap="round" />
                            {history.length > 0 && (
                                <>
                                    <circle
                                        cx="400"
                                        cy={150 - (((latest.weight - (Math.min(...history.map(h => h.weight)) - 5)) / ((Math.max(...history.map(h => h.weight)) + 5) - (Math.min(...history.map(h => h.weight)) - 5) || 1)) * 120)}
                                        r="4"
                                        className="fill-primary shadow-xl"
                                    />
                                    <circle
                                        cx="400"
                                        cy={150 - (((latest.weight - (Math.min(...history.map(h => h.weight)) - 5)) / ((Math.max(...history.map(h => h.weight)) + 5) - (Math.min(...history.map(h => h.weight)) - 5) || 1)) * 120)}
                                        r="8"
                                        className="fill-primary/20 animate-ping"
                                    />
                                </>
                            )}
                        </svg>
                        <div className="flex justify-between mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-t border-border pt-4">
                            <span>{history.length > 0 ? formatDateRange(history[0].date) : '-'}</span>
                            <span>{history.length > 2 ? formatDateRange(history[Math.floor(history.length / 2)].date) : '-'}</span>
                            <span>Today</span>
                        </div>
                    </div>
                </section>

                {/* Sidebar Dashboards (Column 9-12) */}
                <div className="lg:col-span-4 space-y-8">

                    {/* Compact Daily Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
                        {/* Heart Rate */}
                        <div className="group bg-surface border border-border rounded-3xl p-6 transition-all hover:bg-primary/5 hover:border-primary/20">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-red-500/10 p-2 rounded-xl text-red-500 group-hover:scale-110 transition-transform">
                                    <span className="material-icons-round">favorite</span>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Heart Rate</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black tracking-tight">{latest.heartRateAvg || '--'}</span>
                                <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">BPM</span>
                            </div>
                        </div>

                        {/* Sleep */}
                        <div className="group bg-surface border border-border rounded-3xl p-6 transition-all hover:bg-indigo-500/5 hover:border-indigo-500/20">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-indigo-500/10 p-2 rounded-xl text-indigo-500 group-hover:scale-110 transition-transform">
                                    <span className="material-icons-round">bedtime</span>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sleep Time</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black tracking-tight">{latest.sleepHours || '--'}</span>
                                <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">HRS</span>
                            </div>
                        </div>
                    </div>

                    {/* Water Intake - Decorative & Functional */}
                    <div className="bg-gradient-to-br from-blue-600/10 to-blue-400/5 border border-blue-500/20 rounded-[2.5rem] p-8 relative overflow-hidden group">
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl opacity-50 group-hover:bg-surface-highlight transition-all"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/20">
                                    <span className="material-icons-round">water_drop</span>
                                </div>
                                <h3 className="font-black text-xl tracking-tight">Hydration</h3>
                            </div>
                            <div className="flex items-baseline gap-3 mb-4">
                                <span className="text-5xl font-black tracking-tighter">{latest.waterIntake || 0}</span>
                                <span className="text-sm font-bold text-blue-400 uppercase tracking-widest">Liters</span>
                            </div>
                            <div className="w-full h-4 bg-blue-500/10 rounded-full overflow-hidden border border-blue-500/10 backdrop-blur-sm">
                                <div
                                    className="h-full bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all duration-1000 ease-out relative"
                                    style={{ width: `${Math.min((latest.waterIntake / userGoals.dailyWaterLiters) * 100, 100)}%` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </div>
                            <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mt-4">
                                {latest.waterIntake >= userGoals.dailyWaterLiters ? 'Goal Reached!' : `${(userGoals.dailyWaterLiters - latest.waterIntake).toFixed(1)}L more to goal`}
                            </p>
                        </div>
                    </div>

                    {/* Recent Logs List - Now truly dynamic */}
                    <div className="bg-surface border border-border rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold tracking-tight">Recent Logs</h2>
                        </div>
                        <div className="space-y-4">
                            {history.slice(-3).reverse().map((log, i) => (
                                <div key={i} className="flex items-center gap-4 group cursor-pointer p-2 -m-2 rounded-2xl hover:bg-surface-highlight transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-surface-highlight flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                        <span className="material-icons-round text-lg">history</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold leading-none mb-1">{new Date(log.date).toLocaleDateString()}</p>
                                        <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">{log.weight}kg · {log.heartRateAvg}bpm</p>
                                    </div>
                                    <span className="material-icons-round text-slate-600 text-sm">chevron_right</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Log Metric Modal */}
            {showLogModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setShowLogModal(false)}></div>
                    <div className="bg-surface w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden">
                        <div className="p-8 sm:p-10">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black tracking-tight">Log Health Data</h3>
                                <button onClick={() => setShowLogModal(false)} className="w-10 h-10 rounded-full bg-surface-highlight flex items-center justify-center">
                                    <span className="material-icons-round">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleLogSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Weight (kg)</label>
                                        <input
                                            type="number" step="0.1" required
                                            className="w-full bg-surface-highlight border border-border rounded-2xl px-5 py-4 font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={logForm.weight}
                                            onChange={(e) => setLogForm({ ...logForm, weight: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Heart Rate (bpm)</label>
                                        <input
                                            type="number" required
                                            className="w-full bg-surface-highlight border border-border rounded-2xl px-5 py-4 font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={logForm.heartRateAvg}
                                            onChange={(e) => setLogForm({ ...logForm, heartRateAvg: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Sleep (hrs)</label>
                                        <input
                                            type="number" step="0.5" required
                                            className="w-full bg-surface-highlight border border-border rounded-2xl px-5 py-4 font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={logForm.sleepHours}
                                            onChange={(e) => setLogForm({ ...logForm, sleepHours: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Water (liters)</label>
                                        <input
                                            type="number" step="0.1" required
                                            className="w-full bg-surface-highlight border border-border rounded-2xl px-5 py-4 font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={logForm.waterIntake}
                                            onChange={(e) => setLogForm({ ...logForm, waterIntake: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-primary text-background-dark font-black py-5 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {submitting ? 'SYNCING...' : 'SYNC METRICS'}
                                    {!submitting && <span className="material-icons-round">cloud_upload</span>}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
