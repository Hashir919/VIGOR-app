import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeSettings from './ThemeSettings';

const SidebarItem = ({ path, icon, label, isExpanded, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === path;

    return (
        <NavLink
            to={path}
            onClick={onClick}
            className={({ isActive }) => `flex items-center p-3 rounded-2xl transition-all duration-300 relative group overflow-hidden ${isActive
                ? 'bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--color-primary),0.1)]'
                : 'text-text-muted hover:bg-surface-highlight hover:text-text-main'
                }`}
        >
            {/* The SAME container wrapper to strictly align icon and text */}
            <div className="flex items-center w-full">
                <span className={`material-icons-round text-2xl transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'mr-4' : 'mx-auto'} ${isActive ? 'scale-110' : 'scale-100 group-hover:scale-110'}`}>
                    {/* Fixed: Use standard icon consistently (solves invalid text ligature causing massive layout shift) */}
                    {icon}
                </span>

                {isExpanded && (
                    <span className="font-bold text-sm tracking-wide whitespace-nowrap">
                        {label}
                    </span>
                )}
            </div>

            {/* Active Indication Bar */}
            {isActive && (
                <div className="absolute left-0 w-1.5 h-6 bg-primary rounded-r-full shadow-[0_0_15px_#30e87a]"></div>
            )}
        </NavLink>
    );
};

const ActionButton = ({ onClick, icon, label, isExpanded, isPrimary }) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-center transition-all duration-300 rounded-2xl ${isPrimary
            ? 'bg-primary text-background-dark shadow-[0_8px_20px_rgba(var(--color-primary),0.3)] hover:shadow-primary/40 active:scale-95'
            : 'hover:bg-surface-highlight text-text-muted hover:text-primary'} 
            ${isExpanded ? 'w-full h-14 space-x-3 px-4' : 'h-14 w-12 mx-auto'}`}
    >
        <span className="material-icons-round text-2xl flex-shrink-0">{icon}</span>
        {isExpanded && <span className={`font-bold uppercase tracking-widest ${isPrimary ? 'text-xs' : 'text-sm'}`}>{label}</span>}
    </button>
);

const Sidebar = () => {
    const location = useLocation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showThemeSettings, setShowThemeSettings] = useState(false);
    const { user } = useAuth();

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    if (isAuthPage) return null;

    const navItems = [
        { path: '/', icon: 'grid_view', label: 'Today' },
        { path: '/metrics', icon: 'monitor_heart', label: 'Health' },
        { path: '/community', icon: 'forum', label: 'Feed' },
        { path: '/nutrition', icon: 'restaurant', label: 'Nutrition' },
        { path: '/profile', icon: 'person', label: 'Me' }
    ];

    if (user?.role === 'ADMIN') {
        navItems.push({ path: '/admin', icon: 'admin_panel_settings', label: 'Admin' });
    }

    return (
        <>
            {/* Desktop Sidebar (Hover-based Expansion) */}
            <aside
                className={`max-md:hidden fixed left-0 top-0 h-screen bg-surface border-r border-border transition-all duration-300 z-[110] flex-col flex ${isExpanded ? 'w-64' : 'w-20'}`}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
            >
                {/* Logo Section */}
                <div className="h-24 flex items-center justify-center relative">
                    <div className={`w-10 h-10 bg-primary rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'rotate-0' : 'rotate-45'}`}>
                        <span className="material-icons-round text-background-dark font-bold text-2xl">fitness_center</span>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <div className="flex-1 px-3 space-y-2 mt-4 overflow-y-auto hide-scrollbar">
                    {navItems.map((item, index) => (
                        <SidebarItem
                            key={index}
                            {...item}
                            isExpanded={isExpanded}
                        />
                    ))}
                </div>

                {/* Desktop Actions */}
                <div className="p-4 space-y-4 mb-4">
                    <NavLink to="/log-workout" className="block w-full">
                        <ActionButton
                            icon="add"
                            label="Log Workout"
                            isExpanded={isExpanded}
                            isPrimary={true}
                        />
                    </NavLink>
                    <ActionButton
                        onClick={() => setShowThemeSettings(true)}
                        icon="palette"
                        label="Theme"
                        isExpanded={isExpanded}
                    />
                </div>
            </aside>

            {/* Mobile Header (Fixed Top) */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-surface/95 backdrop-blur-xl border-b border-border z-[100] flex items-center justify-between px-6 md:hidden">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="material-icons-round text-background-dark text-xl">fitness_center</span>
                    </div>
                    <span className="font-bold text-lg tracking-tight">Vigor</span>
                </div>
                <button onClick={() => setIsExpanded(true)} className="text-primary p-2">
                    <span className="material-icons-round text-3xl">menu</span>
                </button>
            </div>

            {/* Mobile Drawer Overlay */}
            {isExpanded && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[115] md:hidden animate-in fade-in duration-300"
                    onClick={() => setIsExpanded(false)}
                />
            )}

            {/* Mobile Drawer (Transform-based Expansion) */}
            <aside
                className={`fixed top-0 left-0 h-full w-72 bg-surface shadow-2xl z-[120] transition-transform duration-300 md:hidden flex flex-col ${isExpanded ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-8 h-full flex flex-col overflow-y-auto hide-scrollbar">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                <span className="material-icons-round text-background-dark text-2xl">fitness_center</span>
                            </div>
                            <span className="font-bold text-2xl">Vigor</span>
                        </div>
                        <button onClick={() => setIsExpanded(false)} className="text-text-muted">
                            <span className="material-icons-round text-3xl">close</span>
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="flex-1 space-y-4">
                        {navItems.map((item, index) => (
                            <SidebarItem
                                key={index}
                                {...item}
                                isExpanded={true}
                                onClick={() => setIsExpanded(false)}
                            />
                        ))}
                    </div>

                    {/* Mobile Actions */}
                    <div className="mt-8 space-y-4">
                        <NavLink to="/log-workout" onClick={() => setIsExpanded(false)} className="block w-full">
                            <button className="w-full bg-primary text-background-dark h-16 rounded-2xl flex items-center justify-center space-x-3 shadow-xl shadow-primary/20 active:scale-95 transition-transform">
                                <span className="material-icons-round text-2xl">add</span>
                                <span className="font-bold uppercase tracking-widest text-sm">New Workout</span>
                            </button>
                        </NavLink>
                        <button
                            onClick={() => {
                                setIsExpanded(false);
                                setShowThemeSettings(true);
                            }}
                            className="w-full h-16 rounded-2xl flex items-center justify-center space-x-3 text-text-muted hover:bg-surface-highlight hover:text-primary transition-colors"
                        >
                            <span className="material-icons-round text-2xl">palette</span>
                            <span className="font-bold text-lg">Change Theme</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Shared Modal Layer */}
            {showThemeSettings && <ThemeSettings onClose={() => setShowThemeSettings(false)} />}
        </>
    );
};

export default Sidebar;
