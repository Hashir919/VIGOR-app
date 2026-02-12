import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchWorkouts } from '../services/api';

export default function ActivityHistory() {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadWorkouts = async () => {
            try {
                const data = await fetchWorkouts();
                setWorkouts(data);
            } catch (error) {
                console.error("Failed to load workouts", error);
            } finally {
                setLoading(false);
            }
        };
        loadWorkouts();
    }, []);

    // Helper to group by date
    const groupedWorkouts = workouts.reduce((acc, workout) => {
        const date = new Date(workout.startTime || workout.date).toDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(workout);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="mt-6 text-slate-500 font-bold uppercase tracking-widest text-xs">Retrieving History...</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col space-y-10">

            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Activity History</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Relive your past workouts</p>
                </div>
                <div className="flex gap-2 bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl overflow-x-auto hide-scrollbar">
                    {['All', 'Running', 'Cycling', 'Yoga', 'Swim'].map((cat, idx) => (
                        <button key={idx} className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${idx === 0 ? 'bg-primary text-background-dark shadow-lg' : 'text-slate-500 hover:text-white'}`}>{cat}</button>
                    ))}
                </div>
            </header>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                {/* Timeline Container (Column 1-8) */}
                <div className="lg:col-span-8 order-2 lg:order-1">
                    <div className="space-y-10 relative">
                        {/* Vertical Timeline Line (Desktop only) */}
                        <div className="absolute left-[1.25rem] top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-white/5 hidden md:block"></div>

                        {Object.keys(groupedWorkouts).length === 0 && !loading && (
                            <div className="flex flex-col items-center py-20 bg-white dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 text-center">
                                <span className="material-icons-round text-5xl text-slate-300 dark:text-slate-700 mb-4">history_toggle_off</span>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No activity found yet</p>
                            </div>
                        )}

                        {Object.entries(groupedWorkouts).map(([date, dayWorkouts]) => (
                            <section key={date} className="relative">
                                <div className="flex items-center gap-4 mb-6 relative z-10">
                                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center border-4 border-background-light dark:border-background-dark shadow-lg shadow-primary/20">
                                        <span className="material-icons-round text-xs text-background-dark font-black">event</span>
                                    </div>
                                    <h2 className="text-xl font-black tracking-tight">
                                        {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                    </h2>
                                </div>

                                <div className="md:ml-12 space-y-4">
                                    {dayWorkouts.map((workout) => (
                                        <div key={workout._id} className="group bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 p-6 rounded-[2rem] transition-all hover:shadow-2xl hover:shadow-primary/5 cursor-pointer">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                        <span className="material-icons-round text-3xl">fitness_center</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-lg leading-tight mb-1">{workout.title || workout.type}</h3>
                                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">
                                                            {new Date(workout.startTime || workout.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Gym Session
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8">
                                                    <div className="hidden sm:flex flex-col items-end">
                                                        <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Duration</span>
                                                        <span className="text-xl font-black">{workout.duration} <span className="text-xs font-bold text-slate-400">min</span></span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Burn</span>
                                                        <span className="text-xl font-black text-primary">{workout.calories} <span className="text-xs font-bold text-primary/60">kcal</span></span>
                                                    </div>
                                                    <span className="material-icons-round text-slate-300 dark:text-slate-700 group-hover:translate-x-1 transition-transform">chevron_right</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>

                {/* Monthly Summary Sidebar (Column 9-12) */}
                <div className="lg:col-span-4 order-1 lg:order-2">
                    <div className="lg:sticky lg:top-8 space-y-8">

                        {/* Summary Card */}
                        <div className="bg-primary text-background-dark p-8 rounded-[2.5rem] shadow-xl shadow-primary/20 relative overflow-hidden group">
                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
                            <div className="relative z-10">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-6">Jan 2024 Summary</h3>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-4xl font-black tracking-tighter">24h 12m</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest">Total Active Time</p>
                                    </div>
                                    <div className="pt-6 border-t border-black/10">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-3xl font-black tracking-tighter">18,402</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest">Total kcal</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black tracking-tighter">82%</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest">Goal Status</p>
                                            </div>
                                        </div>
                                        <div className="w-full h-2 bg-black/10 rounded-full mt-4 overflow-hidden">
                                            <div className="h-full bg-background-dark rounded-full" style={{ width: '82%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Analysis Card */}
                        <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 p-8 rounded-[2.5rem]">
                            <h3 className="text-sm font-black tracking-tight mb-6 uppercase tracking-widest text-slate-400">Activity Split</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Running', value: '45%', color: 'bg-primary' },
                                    { label: 'Strength', value: '30%', color: 'bg-orange-500' },
                                    { label: 'Other', value: '25%', color: 'bg-slate-400' }
                                ].map((item, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                                            <span>{item.label}</span>
                                            <span>{item.value}</span>
                                        </div>
                                        <div className="w-full h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div className={`h-full ${item.color} rounded-full`} style={{ width: item.value }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
