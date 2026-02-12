
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboardData, logWater } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function FitnessDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null); // Renamed from dashboardData
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [liveHeartRate, setLiveHeartRate] = useState(null);

    const loadData = async () => {
        try {
            const dashboardData = await fetchDashboardData();
            setData(dashboardData);
            setLiveHeartRate(dashboardData.metrics.heartRateAvg);
            setError(null);
        } catch (err) {
            console.error("Error loading dashboard:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();

        // Update time every minute
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timeInterval);
    }, []);

    // Simulate live heart rate fluctuation
    useEffect(() => {
        if (!liveHeartRate) return;
        const interval = setInterval(() => {
            const fluctuation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
            setLiveHeartRate(prev => Math.max(40, Math.min(220, prev + fluctuation)));
        }, 3000);
        return () => clearInterval(interval);
    }, [liveHeartRate]);

    const handleLogWater = async () => {
        try {
            await logWater(0.25); // Log 250ml
            // Refresh dashboard data
            await loadData();
        } catch (error) {
            console.error("Error logging water:", error);
        }
    };

    const formatCurrentTime = () => {
        let hours = currentTime.getHours();
        const minutes = currentTime.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} `;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="mt-6 text-slate-500 font-bold uppercase tracking-widest text-xs">Synchronizing Dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-40 bg-rose-500/5 rounded-[3rem] border border-rose-500/10">
                <span className="material-icons-round text-5xl text-rose-500 mb-4">cloud_off</span>
                <h2 className="text-xl font-black mb-2">Connection Problem</h2>
                <p className="text-slate-500 font-bold mb-8">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-rose-500 text-white px-8 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-lg shadow-rose-500/20"
                >
                    RETRY CONNECTION
                </button>
            </div>
        );
    }

    const { metrics, nutrition, progress, quickActions, goals } = data;
    const greeting = currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening';

    return (
        <div className="w-full min-h-[calc(100vh-5rem)] flex flex-col">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                {/* Left Column: Greeting & Activity Rings */}
                <div className="lg:col-span-5 flex flex-col items-center lg:items-start">
                    <header className="mb-8 text-center lg:text-left w-full flex justify-between items-start">
                        <div>
                            <p className="text-primary font-bold text-sm uppercase tracking-[0.2em]">{data.currentDate}</p>
                            <h1 className="text-4xl md:text-5xl font-black mt-2 tracking-tighter text-slate-800 dark:text-white">
                                {greeting},<br className="hidden lg:block" /> {data.user.firstName}
                            </h1>
                        </div>
                        <div className="hidden sm:block w-16 h-16 rounded-2xl border-2 border-primary/20 p-1 bg-white dark:bg-primary/5 shadow-xl rotate-3">
                            <img
                                alt="Profile"
                                className="w-full h-full object-cover rounded-xl"
                                src={data.user.profilePicture || "https://ui-avatars.com/api/?name=User&background=30e87a&color=0f172a"}
                            />
                        </div>
                    </header>

                    {/* Activity Rings Area */}
                    <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center my-4">
                        <svg className="absolute inset-0 w-full h-full -rotate-90 filter drop-shadow-[0_0_15px_rgba(48,232,122,0.1)]">
                            <circle cx="50%" cy="50%" r="130" fill="none" stroke="currentColor" className="text-slate-200 dark:text-white/5" strokeWidth="16" />
                            <circle
                                cx="50%" cy="50%" r="130" fill="none" stroke="rgb(48, 232, 122)" strokeWidth="16"
                                strokeDasharray={`${2 * Math.PI * 130}`}
                                strokeDashoffset={`${2 * Math.PI * 130 * (1 - progress.steps / 100)}`}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <svg className="absolute inset-8 w-[calc(100%-4rem)] h-[calc(100%-4rem)] -rotate-90">
                            <circle cx="50%" cy="50%" r="95" fill="none" stroke="currentColor" className="text-slate-200 dark:text-white/5" strokeWidth="16" />
                            <circle
                                cx="50%" cy="50%" r="95" fill="none" stroke="currentColor" strokeWidth="16"
                                strokeDasharray={`${2 * Math.PI * 95}`}
                                strokeDashoffset={`${2 * Math.PI * 95 * (1 - progress.calories / 100)}`}
                                strokeLinecap="round"
                                className="text-primary/70 transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <svg className="absolute inset-16 w-[calc(100%-8rem)] h-[calc(100%-8rem)] -rotate-90">
                            <circle cx="50%" cy="50%" r="60" fill="none" stroke="currentColor" className="text-slate-200 dark:text-white/5" strokeWidth="16" />
                            <circle
                                cx="50%" cy="50%" r="60" fill="none" stroke="currentColor" strokeWidth="16"
                                strokeDasharray={`${2 * Math.PI * 60}`}
                                strokeDashoffset={`${2 * Math.PI * 60 * (1 - progress.activeMinutes / 100)}`}
                                strokeLinecap="round"
                                className="text-primary/40 transition-all duration-1000 ease-out"
                            />
                        </svg>

                        <div className="z-10 text-center scale-110">
                            <span className="material-icons-round text-primary text-4xl mb-1 animate-pulse">directions_run</span>
                            <p className="text-5xl font-black tracking-tighter">{metrics.steps.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Steps Today</p>
                        </div>
                    </div>

                    {/* Ring Labels */}
                    <div className="flex justify-center lg:justify-start gap-8 mt-8 w-full">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_#30e87a]"></div>
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Steps</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary/70"></div>
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Kcal</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary/40"></div>
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Mins</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats & Actions */}
                <div className="lg:col-span-7 space-y-8">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Heart Rate */}
                        <Link to="/metrics" className="group bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-3xl p-6 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-6">
                                <div className="bg-red-500/10 p-3 rounded-2xl text-red-500 group-hover:scale-110 transition-transform">
                                    <span className="material-icons-round">favorite</span>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Heart Rate</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-4xl font-black tracking-tighter">{liveHeartRate || '--'}</p>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">BPM Avg</p>
                                </div>
                                <div className="h-12 flex items-end gap-1 px-2">
                                    {[20, 60, 40, 80, 50, 70, 45].map((v, i) => (
                                        <div key={i} className="w-1.5 bg-red-400/30 rounded-full group-hover:bg-red-500 transition-colors" style={{ height: `${v}%` }}></div>
                                    ))}
                                </div>
                            </div>
                        </Link>

                        {/* Sleep */}
                        <div className="group bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-3xl p-6 transition-all hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-6">
                                <div className="bg-indigo-500/10 p-3 rounded-2xl text-indigo-500 group-hover:scale-110 transition-transform">
                                    <span className="material-icons-round">nights_stay</span>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sleep Cycle</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-4xl font-black tracking-tighter">{metrics.sleepHours || '--'}</p>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hours Total</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">{metrics.sleepQuality || 'Optimal'}</p>
                                    <div className="w-20 bg-indigo-500/10 h-1.5 rounded-full mt-2 overflow-hidden">
                                        <div className="bg-indigo-400 h-full rounded-full" style={{ width: '85%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {quickActions.map((action, index) => {
                            const isWater = action.action === 'log-water';
                            const Content = () => (
                                <>
                                    <div className={`w-12 h-12 rounded-2xl ${action.style.bgColor} ${action.style.textColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                                        <span className="material-icons-round">{action.icon}</span>
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{action.label}</span>
                                </>
                            );

                            const commonClass = "group flex flex-col items-center justify-center p-6 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-3xl transition-all hover:bg-primary/5 hover:border-primary/20 hover:-translate-y-1 shadow-sm";

                            return isWater ? (
                                <button key={action.id} onClick={handleLogWater} className={commonClass}>
                                    <Content />
                                </button>
                            ) : (
                                <Link key={action.id} to={action.action} className={commonClass}>
                                    <Content />
                                </Link>
                            );
                        })}
                    </div>

                    {/* Recent Activities Section */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Activity History</h4>
                            <Link to="/history" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View All</Link>
                        </div>

                        {data.recentWorkouts && data.recentWorkouts.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {data.recentWorkouts.map((workout, idx) => (
                                    <div key={workout._id || idx} className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between group hover:border-primary/50 transition-all">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-[1.25rem] bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white flex items-center justify-center group-hover:bg-primary group-hover:text-background-dark transition-all">
                                                <span className="material-icons-round text-2xl">
                                                    {workout.type === 'Running' ? 'directions_run' : workout.type === 'Cycling' ? 'directions_bike' : 'fitness_center'}
                                                </span>
                                            </div>
                                            <div>
                                                <h5 className="font-black text-lg tracking-tight">{workout.title || 'Workout Session'}</h5>
                                                <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
                                                    {new Date(workout.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {workout.duration || 0} mins • {workout.exercises?.length || 0} Exercises
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black tracking-tighter text-primary">+{workout.calories || 0}</p>
                                            <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Kcal Burned</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-slate-50/50 dark:bg-white/5 rounded-[2.5rem] p-10 text-center border border-dashed border-slate-200 dark:border-white/10">
                                <p className="text-sm text-slate-500 font-bold mb-4">No recent workouts found.</p>
                                <Link to="/log-workout" className="inline-flex items-center gap-2 bg-primary text-background-dark px-6 py-2 rounded-xl font-black text-xs">
                                    <span className="material-icons-round text-sm">add</span>
                                    LOG FIRST SESSION
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Nutrition Plan Broad Card */}
                    <Link to="/nutrition" className="group block bg-gradient-to-r from-primary to-primary-dark p-[1px] rounded-3xl shadow-xl shadow-primary/10 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20">
                        <div className="bg-white dark:bg-[#0f172a] rounded-[23px] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:rotate-12 transition-transform">
                                    <span className="material-icons-round text-3xl">restaurant</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-tight mb-1">Fuel Your Body</h3>
                                    <div className="flex flex-col">
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1">
                                            {nutrition.caloriesRemaining.toLocaleString()} Kcal Remaining
                                        </p>
                                        <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                                            {nutrition.mealsLoggedToday > 0 ? `${nutrition.mealsLoggedToday} Meals Logged` : 'No Meals Logged Yet'}
                                        </p>
                                        {nutrition.mealsLoggedToday > 0 && (
                                            <div className="flex gap-1 mt-2">
                                                {Array.from(new Set(nutrition.meals.map(m => m.mealType))).map((type, idx) => (
                                                    <span key={idx} className="bg-primary/10 text-primary text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">
                                                        {type}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Daily Progress</p>
                                    <div className="w-32 bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((nutrition.caloriesConsumed / nutrition.caloriesTarget) * 100, 100)}%` }}></div>
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background-dark transition-all">
                                    <span className="material-icons-round">chevron_right</span>
                                </div>
                            </div>
                        </div>
                        {/* Macro Summary Strip */}
                        <div className="bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 px-8 py-3 flex justify-between rounded-b-[23px]">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{nutrition.protein || 0}g Protein</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{nutrition.carbs || 0}g Carbs</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{nutrition.fats || 0}g Fats</span>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
