import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [resettingPassword, setResettingPassword] = useState(null);
    const [newPass, setNewPass] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await apiFetch('/admin/users');
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (userId, currentStatus) => {
        try {
            await apiFetch(`/admin/users/${userId}`, {
                method: 'PUT',
                body: JSON.stringify({ isActive: !currentStatus })
            });
            fetchUsers();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm('WARNING: Deleting a user will permanently remove all their workouts and metrics. Proceed?')) return;
        try {
            await apiFetch(`/admin/users/${userId}`, {
                method: 'DELETE'
            });
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleResetPassword = async () => {
        if (!newPass) return;
        try {
            await apiFetch(`/admin/users/${resettingPassword._id}/reset-password`, {
                method: 'PUT',
                body: JSON.stringify({ newPassword: newPass })
            });
            alert(`Password reset for ${resettingPassword.name}`);
            setResettingPassword(null);
            setNewPass('');
        } catch (error) {
            console.error('Error resetting password:', error);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-text-muted p-8 text-center italic">Retrieving user records...</div>;

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface p-4 rounded-3xl border border-border shadow-soft">
                <div className="relative w-full sm:w-80 group">
                    <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">search</span>
                    <input
                        type="text"
                        placeholder="Search name or email..."
                        className="w-full bg-bg-main border border-border rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-primary transition-all text-sm font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 text-text-muted text-xs font-black uppercase">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    {users.length} Total Accounts
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-soft">
                <div className="overflow-x-auto overflow-y-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-bg-main border-b border-border">
                                <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Profile Info</th>
                                <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Email Address</th>
                                <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Acess Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Role</th>
                                <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {filteredUsers.map(u => (
                                <tr key={u._id} className="hover:bg-primary/[0.02] transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-surface-highlight border border-border flex items-center justify-center font-black text-primary overflow-hidden">
                                                {u.profilePicture ? (
                                                    <img src={u.profilePicture} alt="" className="w-full h-full object-cover" />
                                                ) : u.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">{u.name}</p>
                                                <p className="text-[10px] text-text-muted uppercase tracking-tighter">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-medium text-text-muted">{u.email}</td>
                                    <td className="px-6 py-5">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${u.isActive ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-primary animate-pulse' : 'bg-red-500'}`}></span>
                                            {u.isActive ? 'Active' : 'Suspended'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${u.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'text-text-muted bg-surface-highlight'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleStatus(u._id, u.isActive)}
                                                className={`p-2 rounded-xl transition-all ${u.isActive ? 'hover:bg-red-500/10 hover:text-red-500' : 'hover:bg-primary/10 hover:text-primary'} text-text-muted`}
                                                title={u.isActive ? 'Suspend User' : 'Reactivate User'}
                                            >
                                                <span className="material-icons-round text-lg">{u.isActive ? 'block' : 'undo'}</span>
                                            </button>
                                            <button
                                                onClick={() => setResettingPassword(u)}
                                                className="p-2 rounded-xl hover:bg-primary/10 hover:text-primary text-text-muted transition-all"
                                                title="Reset Password"
                                            >
                                                <span className="material-icons-round text-lg">key</span>
                                            </button>
                                            <button
                                                onClick={() => deleteUser(u._id)}
                                                className="p-2 rounded-xl hover:bg-red-500 hover:text-white text-text-muted transition-all"
                                                title="Delete Permanent"
                                            >
                                                <span className="material-icons-round text-lg">delete_forever</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reset Password Modal */}
            {resettingPassword && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-surface w-full max-w-md rounded-3xl border border-border p-8 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-white mb-2">Reset User Password</h3>
                        <p className="text-text-muted text-sm mb-6 uppercase tracking-tight font-bold">Target: {resettingPassword.email}</p>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">New Password</label>
                                <input
                                    type="password"
                                    className="w-full bg-bg-main border border-border rounded-2xl py-3 px-4 outline-none focus:border-primary font-bold"
                                    placeholder="••••••••"
                                    value={newPass}
                                    onChange={(e) => setNewPass(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setResettingPassword(null)}
                                    className="flex-1 bg-surface-highlight text-text-main py-4 rounded-2xl font-bold hover:bg-border transition-colors uppercase tracking-widest text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleResetPassword}
                                    className="flex-1 bg-primary text-background py-4 rounded-2xl font-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest text-xs"
                                >
                                    Confirm Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
