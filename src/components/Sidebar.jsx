import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    const [isExpanded, setIsExpanded] = useState(false);

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    if (isAuthPage) return null;

    const navItems = [
        { path: '/', icon: 'grid_view', label: 'Today' },
        { path: '/metrics', icon: 'monitor_heart', label: 'Health' },
        { path: '/community', icon: 'forum', label: 'Feed' },
        { path: '/nutrition', icon: 'restaurant', label: 'Nutrition' },
        { path: '/profile', icon: 'person', label: 'Me' }
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-screen bg-[#0f172a] border-r border-white/10 transition-all duration-300 z-[110] hidden md:flex flex-col ${isExpanded ? 'w-64' : 'w-20'}`}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
            >
                {/* Logo Section */}
                <div className="h-24 flex items-center justify-center relative">
                    <div className={`w-10 h-10 bg-primary rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'rotate-0' : 'rotate-45'}`}>
                        <span className="material-icons-round text-background-dark font-bold text-2xl">fitness_center</span>
                    </div>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 px-3 space-y-2 mt-4">
                    {navItems.map((item, index) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={index}
                                to={item.path}
                                className={`flex items-center space-x-4 p-3 rounded-2xl transition-all duration-300 relative group truncate ${isActive
                                    ? 'bg-primary/10 text-primary shadow-[0_0_20px_rgba(48,232,122,0.1)]'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                    }`}
                            >
                                <span className={`material-icons-round text-2xl transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100 group-hover:scale-110'}`}>
                                    {isActive ? item.icon : `${item.icon}_outline` || item.icon}
                                </span>
                                <span className={`font-bold text-sm tracking-wide transition-opacity duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <div className="absolute left-0 w-1.5 h-6 bg-primary rounded-r-full shadow-[0_0_15px_#30e87a]"></div>
                                )}
                            </NavLink>
                        );
                    })}
                </div>

                {/* Primary Action Button (Bottom) */}
                <div className="p-4 mb-4">
                    <NavLink
                        to="/log-workout"
                        className={`bg-primary text-background-dark flex items-center justify-center transition-all duration-300 rounded-2xl shadow-[0_8px_20px_rgba(48,232,122,0.3)] hover:shadow-primary/40 active:scale-95 ${isExpanded ? 'h-14 space-x-3 px-4' : 'h-14 w-12 mx-auto'}`}
                    >
                        <span className="material-icons-round text-2xl">add</span>
                        {isExpanded && <span className="font-bold uppercase tracking-widest text-xs">Log Workout</span>}
                    </NavLink>
                </div>
            </aside>

            {/* Mobile Bottom Bar (Transitioned to Mobile Drawer style for consistency) */}
            <div className="md:hidden">
                {/* We can implement a slide-in drawer for mobile or keep a footer bar if the user allows, 
                    but the prompt says "FULLY REMOVE FOOTER". 
                    So let's implement a Mobile Header + Side Drawer for mobile. */}

                {/* Mobile Header with Menu Button */}
                <div className="fixed top-0 left-0 right-0 h-16 bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/10 z-[100] flex items-center justify-between px-6 md:hidden">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="material-icons-round text-background-dark text-xl">fitness_center</span>
                        </div>
                        <span className="font-bold text-lg tracking-tight">Vigor</span>
                    </div>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-primary p-2">
                        <span className="material-icons-round text-3xl">{isExpanded ? 'close' : 'menu'}</span>
                    </button>
                </div>

                {/* Mobile Drawer Overlay */}
                {isExpanded && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
                        onClick={() => setIsExpanded(false)}
                    />
                )}

                {/* Mobile Side Drawer */}
                <aside
                    className={`fixed top-0 left-0 h-full w-72 bg-[#0f172a] shadow-2xl z-[120] transition-transform duration-300 md:hidden ${isExpanded ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    <div className="p-8">
                        <div className="flex items-center space-x-3 mb-10">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                <span className="material-icons-round text-background-dark text-2xl">fitness_center</span>
                            </div>
                            <span className="font-bold text-2xl">Vigor</span>
                        </div>

                        <div className="space-y-4">
                            {navItems.map((item, index) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <NavLink
                                        key={index}
                                        to={item.path}
                                        onClick={() => setIsExpanded(false)}
                                        className={`flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 ${isActive
                                            ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(48,232,122,0.1)]'
                                            : 'text-slate-400'
                                            }`}
                                    >
                                        <span className="material-icons-round text-2xl">
                                            {isActive ? item.icon : `${item.icon}_outline` || item.icon}
                                        </span>
                                        <span className="font-bold text-lg">{item.label}</span>
                                    </NavLink>
                                );
                            })}
                        </div>

                        <div className="mt-12">
                            <NavLink
                                to="/log-workout"
                                onClick={() => setIsExpanded(false)}
                                id="mobile-log-workout-button"
                                className="bg-primary text-background-dark h-16 rounded-2xl flex items-center justify-center space-x-3 shadow-xl shadow-primary/20 active:scale-95 transition-transform"
                            >
                                <span className="material-icons-round text-2xl">add</span>
                                <span className="font-bold uppercase tracking-widest text-sm">New Workout</span>
                            </NavLink>
                        </div>
                    </div>
                </aside>
            </div>
        </>
    );
};

export default Sidebar;
