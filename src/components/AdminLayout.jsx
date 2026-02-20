import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div className="p-8 text-center text-text-muted">Loading...</div>;

    if (!user || user.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    const adminNav = [
        { path: '/admin', label: 'Dashboard', icon: 'dashboard' },
        { path: '/admin/users', label: 'Users', icon: 'people' },
        { path: '/admin/data', label: 'Data', icon: 'storage' },
        { path: '/admin/settings', label: 'Settings', icon: 'settings' }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Admin Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <span className="material-icons-round text-primary text-4xl">admin_panel_settings</span>
                        Admin Control Panel
                    </h1>
                    <p className="text-text-muted mt-1">System-wide management and monitoring</p>
                </div>

                <div className="flex bg-surface p-1 rounded-2xl border border-border">
                    {adminNav.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isActive
                                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(var(--color-primary),0.05)]'
                                        : 'text-text-muted hover:text-text-main'
                                    }`}
                            >
                                <span className="material-icons-round text-xl">{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className="min-h-[600px]">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
