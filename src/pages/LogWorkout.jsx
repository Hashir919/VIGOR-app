import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createWorkout, searchExercises, fetchPopularExercises } from '../services/api';

export default function LogWorkout() {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    // Session State
    const [sessionTitle, setSessionTitle] = useState('Afternoon Session');
    const [startTime] = useState(new Date());
    const [seconds, setSeconds] = useState(0);
    const [exercisesInSession, setExercisesInSession] = useState([]);
    const [status, setStatus] = useState('active'); // active, paused, finished

    // Active Exercise Form State
    const [activeExercise, setActiveExercise] = useState(null);
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [sets, setSets] = useState(1);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [popularExercises, setPopularExercises] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const timerRef = useRef(null);

    useEffect(() => {
        loadData();
        startTimer();
        return () => stopTimer();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const popular = await fetchPopularExercises();
            setPopularExercises(popular);
        } catch (err) {
            console.error('Failed to load exercises:', err);
        } finally {
            setLoading(false);
        }
    };

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const formatDuration = (sec) => {
        const mins = Math.floor(sec / 60);
        const s = sec % 60;
        return `${mins}:${s.toString().padStart(2, '0')}`;
    };

    const searchTimeout = useRef(null);

    const handleSearch = (query) => {
        setSearchQuery(query);

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (query.length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        searchTimeout.current = setTimeout(async () => {
            try {
                const results = await searchExercises({ query });
                setSearchResults(results);
            } catch (err) {
                console.error('Search failed:', err);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 500); // 500ms debounce
    };

    const selectExercise = (exercise) => {
        setActiveExercise(exercise);
        setSearchQuery('');
        setSearchResults([]);
        // Default values for new exercise
        setWeight('');
        setReps('');
        setSets(1);
    };

    const addExerciseToSession = () => {
        if (!activeExercise || !weight || !reps) return;

        const newExercise = {
            exerciseId: activeExercise._id,
            name: activeExercise.name,
            type: activeExercise.type,
            icon: activeExercise.icon || 'fitness_center',
            sets: Array(sets).fill().map(() => ({
                reps: parseInt(reps),
                weight: parseFloat(weight),
                isCompleted: true
            }))
        };

        setExercisesInSession([...exercisesInSession, newExercise]);
        setActiveExercise(null);
        setWeight('');
        setReps('');
        setSets(1);
    };

    const removeExerciseFromSession = (index) => {
        const updated = [...exercisesInSession];
        updated.splice(index, 1);
        setExercisesInSession(updated);
    };

    const calculateVolume = () => {
        return exercisesInSession.reduce((total, ex) => {
            const exVolume = ex.sets.reduce((sum, set) => sum + (set.reps * set.weight), 0);
            return total + exVolume;
        }, 0);
    };

    const calculateIntensity = () => {
        const volume = calculateVolume();
        if (volume > 5000) return 'Extreme';
        if (volume > 2500) return 'High';
        if (volume > 1000) return 'Moderate';
        return 'Low';
    };

    const handleFinishSession = async () => {
        if (exercisesInSession.length === 0) return;

        setSubmitting(true);
        try {
            const sessionData = {
                title: sessionTitle,
                type: exercisesInSession.some(e => e.type === 'Cardio') ? 'Mixed' : 'Weightlifting',
                startTime,
                endTime: new Date(),
                duration: Math.floor(seconds / 60),
                calories: Math.round(calculateVolume() * 0.05 + (seconds / 60) * 5), // Rough estimate
                intensity: calculateIntensity(),
                totalVolume: calculateVolume(),
                exercises: exercisesInSession.map(ex => ({
                    exerciseId: ex.exerciseId,
                    name: ex.name,
                    sets: ex.sets
                }))
            };

            await createWorkout(sessionData);
            navigate('/');
        } catch (error) {
            console.error("Failed to save workout", error);
            alert('Failed to save workout: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full flex flex-col space-y-10">

            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <input
                        className="text-4xl md:text-5xl font-black tracking-tighter bg-transparent border-none outline-none focus:ring-2 ring-primary/20 rounded-xl px-2 -ml-2 w-full max-w-2xl"
                        value={sessionTitle}
                        onChange={(e) => setSessionTitle(e.target.value)}
                    />
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Document your strength</p>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                        <p className="text-primary font-black uppercase tracking-widest text-xs flex items-center gap-1">
                            <span className="material-icons-round text-sm">timer</span>
                            {formatDuration(seconds)}
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleFinishSession}
                        disabled={submitting || exercisesInSession.length === 0}
                        className="flex items-center gap-2 bg-primary text-background-dark px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                    >
                        <span className="material-icons-round">{submitting ? 'sync' : 'save'}</span>
                        {submitting ? 'Saving...' : 'Finish Session'}
                    </button>
                </div>
            </header>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                {/* Left Side: Exercise Selection & Session List (Column 1-7) */}
                <div className="lg:col-span-7 space-y-8">

                    {/* Search Exercises */}
                    <div className="relative group">
                        <span className="material-icons-round absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                        <input
                            className="w-full bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[2rem] py-5 pl-16 pr-6 focus:ring-2 focus:ring-primary/20 outline-none text-lg font-bold placeholder-slate-400"
                            placeholder="Search exercises (e.g. Bench Press, Squats...)"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        {/* Search Results Dropdown */}
                        {(isSearching || searchResults.length > 0 || (searchQuery.length >= 2 && !isSearching && searchResults.length === 0)) && (
                            <div className="absolute top-full left-0 w-full mt-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-2xl z-50">
                                {isSearching ? (
                                    <div className="p-10 flex flex-col items-center justify-center space-y-4">
                                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Scanning Library...</p>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((ex) => (
                                        <button
                                            key={ex._id}
                                            onClick={() => selectExercise(ex)}
                                            className="w-full text-left px-8 py-5 hover:bg-primary/10 border-b border-slate-50 dark:border-white/5 last:border-0 transition-colors flex items-center justify-between group"
                                        >
                                            <div>
                                                <p className="font-black text-lg">{ex.name}</p>
                                                <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">{ex.category}</p>
                                            </div>
                                            <span className="material-icons-round text-primary opacity-0 group-hover:opacity-100 transition-opacity">add_circle</span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-10 text-center">
                                        <span className="material-icons-round text-4xl text-slate-300 dark:text-slate-700 mb-4">search_off</span>
                                        <p className="text-sm font-bold text-slate-500">No exercises found for "{searchQuery}"</p>
                                        <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mt-2">Try searching by body part or another name</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Session Exercise List */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Exercises in this session</h2>
                            <span className="text-xs font-bold text-slate-400">{exercisesInSession.length} added</span>
                        </div>

                        {exercisesInSession.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-white/5 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-white/10 text-center">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                                    <span className="material-icons-round text-4xl text-slate-300 dark:text-slate-700">fitness_center</span>
                                </div>
                                <h3 className="text-lg font-bold mb-1">Your session is empty</h3>
                                <p className="text-sm text-slate-500 max-w-[240px]">Search for an exercise to start documenting your progress.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {exercisesInSession.map((ex, idx) => (
                                    <div key={idx} className="group bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 p-6 rounded-[2rem] transition-all hover:shadow-xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <span className="material-icons-round text-2xl">{ex.icon}</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black tracking-tight">{ex.name}</h3>
                                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                                        {ex.sets.length} Set{ex.sets.length > 1 ? 's' : ''} • {ex.sets.reduce((sum, s) => sum + (s.reps * s.weight), 0)}kg Total Volume
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeExerciseFromSession(idx)}
                                                className="p-3 rounded-full bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <span className="material-icons-round text-sm">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {!activeExercise && (
                        <div className="space-y-4 pt-4">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Popular Exercises</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {popularExercises.slice(0, 4).map((ex) => (
                                    <button
                                        key={ex._id}
                                        onClick={() => selectExercise(ex)}
                                        className="flex items-center p-5 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-3xl hover:border-primary/50 transition-all group hover:shadow-xl"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <span className="material-icons-round text-2xl">{ex.icon || 'fitness_center'}</span>
                                        </div>
                                        <div className="flex-1 text-left ml-4">
                                            <span className="font-black block leading-tight">{ex.name}</span>
                                            <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-widest">{ex.category}</span>
                                        </div>
                                        <span className="material-icons-round text-slate-300 group-hover:translate-x-1 transition-transform">add</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Log Form or Summary (Column 8-12) */}
                <div className="lg:col-span-5 space-y-8">

                    {/* Active Exercise Input */}
                    {activeExercise ? (
                        <div className="bg-white dark:bg-white/5 border-2 border-primary rounded-[2.5rem] p-8 space-y-8 shadow-2xl shadow-primary/5 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-background-dark mr-5">
                                        <span className="material-icons-round text-3xl">{activeExercise.icon || 'fitness_center'}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight">{activeExercise.name}</h3>
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Selected Exercise</p>
                                    </div>
                                </div>
                                <button onClick={() => setActiveExercise(null)} className="text-slate-400 hover:text-white">
                                    <span className="material-icons-round">close</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Sets</label>
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setSets(Math.max(1, sets - 1))} className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-primary hover:text-background-dark transition-all">
                                            <span className="material-icons-round">remove</span>
                                        </button>
                                        <input
                                            className="flex-1 bg-slate-50 dark:bg-white/10 border-none rounded-2xl py-4 text-center font-black text-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                                            type="number"
                                            value={sets}
                                            onChange={(e) => setSets(parseInt(e.target.value) || 1)}
                                        />
                                        <button onClick={() => setSets(sets + 1)} className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center hover:bg-primary hover:text-background-dark transition-all">
                                            <span className="material-icons-round">add</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Reps</label>
                                        <input
                                            className="w-full bg-slate-100 dark:bg-white/10 border-none rounded-2xl py-5 text-center font-black text-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                                            placeholder="12"
                                            type="number"
                                            value={reps}
                                            onChange={(e) => setReps(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Weight (kg)</label>
                                        <input
                                            className="w-full bg-slate-100 dark:bg-white/10 border-none rounded-2xl py-5 text-center font-black text-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                                            placeholder="60"
                                            type="number"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-sm font-bold opacity-60">Vol. for this Exercise</span>
                                    <span className="text-sm font-black text-primary">{(parseInt(reps) || 0) * (parseFloat(weight) || 0) * sets} kg</span>
                                </div>
                                <button
                                    onClick={addExerciseToSession}
                                    disabled={!weight || !reps}
                                    className="w-full bg-primary text-background-dark font-black py-5 rounded-[1.5rem] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
                                >
                                    Add to Session
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 space-y-8">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Summary</h4>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Volume</p>
                                    <p className="text-3xl font-black text-white tracking-tighter">{calculateVolume()} <span className="text-xs text-slate-500">kg</span></p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Intensity</p>
                                    <p className="text-3xl font-black text-primary tracking-tighter">{calculateIntensity()}</p>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Coach Guidance</p>
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <span className="material-icons-round text-xl">tips_and_updates</span>
                                    </div>
                                    <p className="text-sm text-slate-300 font-bold leading-relaxed">
                                        {exercisesInSession.length === 0
                                            ? "Add your first exercise to see tailored form tips and session analysis."
                                            : "Great work! Maintain your tempo and focus on progressive overload for maximum gains."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
