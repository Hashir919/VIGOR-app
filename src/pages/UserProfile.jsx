import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchUser, updateUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function UserProfile() {
    const { user: authUser, logout } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (!authUser) return;
            try {
                // Fetch specific user using ID from auth context
                const data = await fetchUser(authUser.id);
                setUser(data);
            } catch (error) {
                console.error("Failed to load user", error);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, [authUser]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleEditGoals = async () => {
        const newSteps = prompt("Enter new Daily Steps Goal:", user?.goals?.dailySteps || 10000);
        if (newSteps === null) return; // Cancelled

        const newCardio = prompt("Enter new Weekly Cardio Days Goal:", user?.goals?.weeklyCardioDays || 3);
        if (newCardio === null) return;

        const newCalories = prompt("Enter new Daily Calories Goal:", user?.goals?.dailyCaloriesBurn || 2500);
        if (newCalories === null) return;

        try {
            const updatedDoc = await updateUser(user._id, {
                goals: {
                    dailySteps: parseInt(newSteps) || 10000,
                    weeklyCardioDays: parseInt(newCardio) || 3,
                    dailyCaloriesBurn: parseInt(newCalories) || 2500
                }
            });

            // Merge updates into local state while preserving computed values
            setUser(prev => ({
                ...prev,
                goals: {
                    ...prev.goals,
                    dailySteps: updatedDoc.goals.dailySteps,
                    weeklyCardioDays: updatedDoc.goals.weeklyCardioDays,
                    dailyCaloriesBurn: updatedDoc.goals.dailyCaloriesBurn
                }
            }));

        } catch (error) {
            console.error("Failed to update goals", error);
            alert("Failed to update goals. Please try again.");
        }
    };

    if (loading) {
        return <div className="text-center p-10 text-slate-500">Loading user profile...</div>;
    }

    if (!user) {
        return <div className="text-center p-10 text-slate-500">User not found</div>;
    }

    return (
        <div className="w-full flex flex-col space-y-10">

            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter">My Profile</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Manage your account and goals</p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-primary/10 hover:text-primary transition-all">
                        <span className="material-icons-round text-lg">edit</span>
                        Edit Profile
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-red-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <span className="material-icons-round">logout</span>
                        Sign Out
                    </button>
                </div>
            </header>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                {/* Left Side: Identity & Quick Stats (Column 1-4) */}
                <div className="lg:col-span-4 space-y-8">

                    {/* Identity Card */}
                    <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary/20 to-transparent -z-10"></div>
                        <div className="relative mx-auto w-32 h-32 mb-6">
                            <div className="w-full h-full rounded-full border-4 border-primary/30 p-1 bg-background-light dark:bg-background-dark">
                                <img
                                    alt="User Profile"
                                    className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
                                    src={authUser?.profilePicture || user?.profilePicture || "https://ui-avatars.com/api/?name=User&background=30e87a&color=0f172a"}
                                />
                            </div>
                            <div className="absolute bottom-1 right-1 bg-primary text-background-dark font-black text-[10px] px-3 py-1 rounded-full border-2 border-background-light dark:border-slate-800 shadow-lg">
                                LVL {user?.stats?.level || 1}
                            </div>
                        </div>
                        <h2 className="text-2xl font-black tracking-tight mb-1">{authUser?.name || user?.name || 'User'}</h2>
                        <p className="text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-4">
                            {(user?.stats?.level || 1) > 5 ? 'Elite Runner' : 'Pathfinder'}
                        </p>
                        <p className="text-slate-500 text-xs font-medium">
                            Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'March 2023'}
                        </p>

                        <div className="grid grid-cols-3 gap-2 mt-8">
                            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl">
                                <span className="block text-primary font-black text-lg leading-none mb-1">{user.stats?.totalKm || 0}</span>
                                <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">km</span>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl">
                                <span className="block text-primary font-black text-lg leading-none mb-1">{user.stats?.badges || 0}</span>
                                <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Badges</span>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl">
                                <span className="block text-primary font-black text-lg leading-none mb-1">{user.stats?.streak || 0}</span>
                                <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Streak</span>
                            </div>
                        </div>
                    </div>

                    {/* Achievements Summary */}
                    <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8">
                        <h3 className="text-lg font-bold tracking-tight mb-6 flex items-center gap-2">
                            <span className="material-icons-round text-primary">workspace_premium</span>
                            Recent Achievements
                        </h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <span className="material-icons-round">military_tech</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold leading-none mb-1">Early Bird</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">5 Workouts before 7am</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Goals & Settings (Column 5-12) */}
                <div className="lg:col-span-8 space-y-10">

                    {/* Personal Goals Section */}
                    <section>
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">Personal Goals</h2>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Focus on what matters</p>
                            </div>
                            <button onClick={handleEditGoals} className="group flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] hover:underline">
                                Modify Targets
                                <span className="material-icons-round text-sm group-hover:translate-x-1 transition-transform">east</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Daily Steps */}
                            <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-3xl p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="bg-orange-500/10 p-2 rounded-xl text-orange-500">
                                        <span className="material-icons-round">directions_walk</span>
                                    </div>
                                </div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Daily Steps</p>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-3xl font-black tracking-tighter">{user?.goals?.currentDailySteps?.toLocaleString() || 0}</span>
                                    <span className="text-xs font-bold text-slate-400">/ {user?.goals?.dailySteps?.toLocaleString() || '10k'}</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-orange-500 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(((user?.goals?.currentDailySteps || 0) / (user?.goals?.dailySteps || 10000)) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Weekly Activity */}
                            <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-3xl p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="bg-primary/10 p-2 rounded-xl text-primary">
                                        <span className="material-icons-round">favorite</span>
                                    </div>
                                </div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Weekly Activity</p>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-3xl font-black tracking-tighter">{user?.goals?.currentWeeklyCardio || 0}</span>
                                    <span className="text-xs font-bold text-slate-400">/ {user?.goals?.weeklyCardioDays || 3} Days</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-primary h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(((user?.goals?.currentWeeklyCardio || 0) / (user?.goals?.weeklyCardioDays || 3)) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Calorie Burn */}
                            <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-3xl p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="bg-rose-500/10 p-2 rounded-xl text-rose-500">
                                        <span className="material-icons-round">local_fire_department</span>
                                    </div>
                                </div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Daily Burn</p>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-3xl font-black tracking-tighter">{user?.goals?.currentDailyCalories?.toLocaleString() || 0}</span>
                                    <span className="text-xs font-bold text-slate-400">/ {user?.goals?.dailyCaloriesBurn?.toLocaleString() || '2.5k'}</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-rose-500 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(((user?.goals?.currentDailyCalories || 0) / (user?.goals?.dailyCaloriesBurn || 2500)) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Settings & Preferences */}
                    <section>
                        <h2 className="text-2xl font-black tracking-tight mb-8">Settings & Preferences</h2>
                        <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[2.5rem] overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
                            {[
                                { title: 'Account Security', icon: 'shield', color: 'text-primary' },
                                { title: 'Notification Preferences', icon: 'notifications', color: 'text-primary' },
                                { title: 'Connected Devices', icon: 'watch', color: 'text-primary', value: 'Apple Watch' },
                                { title: 'Language', icon: 'language', color: 'text-primary', value: 'English (US)' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl bg-primary/10 ${item.color}`}>
                                            <span className="material-icons-round text-xl">{item.icon}</span>
                                        </div>
                                        <span className="font-bold tracking-tight">{item.title}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {item.value && <span className="text-xs font-black uppercase tracking-widest text-slate-500">{item.value}</span>}
                                        <span className="material-icons-round text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
