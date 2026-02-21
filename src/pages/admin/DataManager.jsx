import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';

const DataManager = () => {
    const [workouts, setWorkouts] = useState([]);
    const [metrics, setMetrics] = useState([]);
    const [activeTab, setActiveTab] = useState('workouts');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'workouts' ? '/admin/workouts' : '/admin/metrics';
            const data = await apiFetch(endpoint);

            if (Array.isArray(data)) {
                if (activeTab === 'workouts') setWorkouts(data);
                else setMetrics(data);
            } else {
                console.error('Expected array but received:', data);
                if (activeTab === 'workouts') setWorkouts([]);
                else setMetrics([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            if (activeTab === 'workouts') setWorkouts([]);
            else setMetrics([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`Are you sure you want to delete this ${activeTab === 'workouts' ? 'workout' : 'metric'}?`)) return;
        try {
            const endpoint = activeTab === 'workouts' ? `/admin/workouts/${id}` : `/admin/metrics/${id}`;
            await apiFetch(endpoint, {
                method: 'DELETE'
            });
            fetchData();
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex bg-surface p-1 rounded-2xl border border-border w-fit shadow-soft">
                <button
                    onClick={() => setActiveTab('workouts')}
                    className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'workouts' ? 'bg-primary text-background' : 'text-text-muted hover:text-text-main'}`}
                >
                    Workout Logs
                </button>
                <button
                    onClick={() => setActiveTab('metrics')}
                    className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'metrics' ? 'bg-primary text-background' : 'text-text-muted hover:text-text-main'}`}
                >
                    Health Metrics
                </button>
            </div>

            <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-soft min-h-[400px]">
                {loading ? (
                    <div className="p-12 text-center text-text-muted italic">Scanning global database...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-bg-main border-b border-border">
                                    <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Owner</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Content</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Timestamp</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40 text-sm">
                                {activeTab === 'workouts' ? (
                                    workouts.map(w => (
                                        <tr key={w._id} className="hover:bg-primary/[0.01] transition-colors">
                                            <td className="px-6 py-5">
                                                <p className="font-bold text-white">{w.userId?.name || 'Unknown'}</p>
                                                <p className="text-[10px] text-text-muted truncate max-w-[150px]">{w.userId?.email}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="font-medium text-text-main">{w.title}</p>
                                                <p className="text-[10px] text-primary font-black uppercase tracking-tighter">{w.type} • {w.duration}MIN • {w.calories} KCAL</p>
                                            </td>
                                            <td className="px-6 py-5 text-text-muted font-bold text-xs">
                                                {new Date(w.startTime).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-5">
                                                <button
                                                    onClick={() => handleDelete(w._id)}
                                                    className="p-3 rounded-xl hover:bg-red-500 hover:text-white text-text-muted transition-all"
                                                >
                                                    <span className="material-icons-round text-xl">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    metrics.map(m => (
                                        <tr key={m._id} className="hover:bg-primary/[0.01] transition-colors">
                                            <td className="px-6 py-5 text-white font-bold">{m.userId?.name || 'Unknown'}</td>
                                            <td className="px-6 py-5">
                                                <div className="flex gap-4">
                                                    <div>
                                                        <p className="text-primary font-black text-xs uppercase tracking-tighter">Steps</p>
                                                        <p className="font-bold text-white">{m.steps}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-secondary font-black text-xs uppercase tracking-tighter">Calories</p>
                                                        <p className="font-bold text-white">{m.calories}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-text-muted font-bold text-xs uppercase tracking-tighter">
                                                {new Date(m.date).toDateString()}
                                            </td>
                                            <td className="px-6 py-5">
                                                <button
                                                    onClick={() => handleDelete(m._id)}
                                                    className="p-3 rounded-xl hover:bg-red-500 hover:text-white text-text-muted transition-all"
                                                >
                                                    <span className="material-icons-round text-xl">delete_outline</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        {((activeTab === 'workouts' && workouts.length === 0) || (activeTab === 'metrics' && metrics.length === 0)) && (
                            <div className="p-12 text-center text-text-muted">No records found.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataManager;
