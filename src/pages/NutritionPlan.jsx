
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    fetchActivePlan,
    fetchNutrition,
    searchFoodItems,
    logMeal,
    deleteMeal,
    createNutritionPlan,
    activateNutritionPlan,
    fetchUser
} from '../services/api';

const NutritionPlan = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activePlan, setActivePlan] = useState(null);
    const [todayNutrition, setTodayNutrition] = useState(null);
    const [showMealLogger, setShowMealLogger] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState('breakfast');
    const [foodSearch, setFoodSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedFoods, setSelectedFoods] = useState([]);
    const [mealName, setMealName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch user for goals fallback
            let user = null;
            try {
                user = await fetchUser();
            } catch (err) {
                // console.warn('Failed to fetch user profile:', err);
            }

            // Try to fetch active plan
            let plan = null;
            try {
                plan = await fetchActivePlan();
            } catch (err) {
                // No active plan, create default one using user goals
                try {
                    const defaultPlan = await createNutritionPlan({
                        name: 'My Nutrition Plan',
                        isActive: true,
                        goals: {
                            dailyCalories: user?.goals?.dailyCaloriesBurn || 2000,
                            proteinGrams: Math.round((user?.goals?.dailyCaloriesBurn || 2000) * 0.3 / 4), // 30% protein
                            carbsGrams: Math.round((user?.goals?.dailyCaloriesBurn || 2000) * 0.45 / 4), // 45% carbs
                            fatsGrams: Math.round((user?.goals?.dailyCaloriesBurn || 2000) * 0.25 / 9)   // 25% fats
                        },
                        // ... schedule ...
                        mealSchedule: [
                            { name: 'Breakfast', targetTime: '08:00', targetCalories: Math.round((user?.goals?.dailyCaloriesBurn || 2000) * 0.25) },
                            { name: 'Lunch', targetTime: '12:00', targetCalories: Math.round((user?.goals?.dailyCaloriesBurn || 2000) * 0.3) },
                            { name: 'Dinner', targetTime: '18:00', targetCalories: Math.round((user?.goals?.dailyCaloriesBurn || 2000) * 0.35) },
                            { name: 'Snack', targetTime: '15:00', targetCalories: Math.round((user?.goals?.dailyCaloriesBurn || 2000) * 0.1) }
                        ]
                    });
                    plan = defaultPlan;
                } catch (createErr) {
                    throw new Error('Failed to create nutrition plan: ' + createErr.message);
                }
            }

            setActivePlan(plan);

            // Fetch today's nutrition
            const nutrition = await fetchNutrition();
            console.log('Nutrition data fetched:', nutrition);
            setTodayNutrition(nutrition);
        } catch (err) {
            console.error('Load data error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchFood = async (query) => {
        setFoodSearch(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const results = await searchFoodItems(query);
            setSearchResults(results);
        } catch (err) {
            console.error('Food search error:', err);
        }
    };

    const handleAddFood = (food) => {
        setSelectedFoods([...selectedFoods, { ...food, servings: 1 }]);
        setFoodSearch('');
        setSearchResults([]);
    };

    const handleRemoveFood = (index) => {
        setSelectedFoods(selectedFoods.filter((_, i) => i !== index));
    };

    const handleUpdateServings = (index, servings) => {
        const updated = [...selectedFoods];
        updated[index].servings = parseFloat(servings) || 1;
        setSelectedFoods(updated);
    };

    const handleLogMeal = async () => {
        if (selectedFoods.length === 0 || submitting) return;

        try {
            setSubmitting(true);
            const mealData = {
                mealName: mealName || selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1),
                mealType: selectedMealType,
                planId: activePlan?._id,
                foods: selectedFoods.map(f => ({
                    foodItemId: f._id,
                    servings: f.servings
                }))
            };

            await logMeal(mealData);

            // Re-fetch data to sync with backend
            await loadData();

            // Show success feedback
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);

            // Reset form
            setSelectedFoods([]);
            setMealName('');
            setShowMealLogger(false);
        } catch (err) {
            alert('Failed to log meal: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteMeal = async (mealId) => {
        if (!confirm('Delete this meal?')) return;

        try {
            await deleteMeal(mealId);
            await loadData();
        } catch (err) {
            alert('Failed to delete meal: ' + err.message);
        }
    };

    const calculateMacroProgress = (consumed, target) => {
        return Math.min((consumed / target) * 100, 100);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="mt-6 text-slate-500 font-bold uppercase tracking-widest text-xs">Analyzing Nutrition Data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-40 bg-rose-500/5 rounded-[3rem] border border-rose-500/10">
                <span className="material-icons-round text-5xl text-rose-500 mb-4">error_outline</span>
                <h2 className="text-xl font-black mb-2">Sync Failed</h2>
                <p className="text-slate-500 font-bold mb-8">{error}</p>
                <button
                    onClick={loadData}
                    className="bg-rose-500 text-white px-8 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-all"
                >
                    RETRY SYNC
                </button>
            </div>
        );
    }

    const goals = {
        calories: todayNutrition?.caloriesTarget || activePlan?.goals?.dailyCalories || 2000,
        protein: todayNutrition?.proteinTarget || activePlan?.goals?.proteinGrams || 150,
        carbs: todayNutrition?.carbsTarget || activePlan?.goals?.carbsGrams || 200,
        fats: todayNutrition?.fatsTarget || activePlan?.goals?.fatsGrams || 60
    };

    const caloriesRemaining = goals.calories - (todayNutrition?.caloriesConsumed || 0);
    const proteinProgress = calculateMacroProgress(todayNutrition?.protein || 0, goals.protein);
    const carbsProgress = calculateMacroProgress(todayNutrition?.carbs || 0, goals.carbs);
    const fatsProgress = calculateMacroProgress(todayNutrition?.fats || 0, goals.fats);

    return (
        <>
            <div className="w-full flex flex-col space-y-10">

                {/* Page Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Nutrition Plan</h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Fuel your performance</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowMealLogger(!showMealLogger)}
                            className="flex items-center gap-2 bg-primary text-background-dark px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            <span className="material-icons-round">restaurant</span>
                            Log New Meal
                        </button>
                        <div className="w-12 h-12 rounded-2xl border-2 border-primary/20 p-1 bg-white dark:bg-primary/5">
                            <img alt="Profile" className="w-full h-full rounded-xl object-cover" src="https://ui-avatars.com/api/?name=User&background=30e87a&color=0f172a" />
                        </div>
                    </div>
                </header>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Left Side: Summary & Macros (Column 1-4) */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Calories Card */}
                        <div className="bg-primary text-background-dark p-8 rounded-[2.5rem] shadow-xl shadow-primary/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <div className="relative z-10 text-center">
                                <p className="text-sm font-black uppercase tracking-[0.2em] opacity-60 mb-2">Remaining</p>
                                <h3 className="text-6xl font-black tracking-tighter mb-6">{caloriesRemaining}</h3>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest bg-black/5 rounded-2xl p-4">
                                    <div>
                                        <p className="opacity-60">Consumed</p>
                                        <p className="text-base font-black">{todayNutrition?.caloriesConsumed || 0}</p>
                                    </div>
                                    <div className="w-px h-8 bg-black/10"></div>
                                    <div>
                                        <p className="opacity-60">Daily Goal</p>
                                        <p className="text-base font-black">{goals.calories}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Macros Progress */}
                        <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 p-8 rounded-[2.5rem] space-y-8">
                            <h3 className="text-lg font-bold tracking-tight mb-2">Daily Macros</h3>

                            {[
                                { label: 'Protein', value: todayNutrition?.protein || 0, goal: goals.protein, progress: proteinProgress, color: 'bg-rose-500', text: 'text-rose-500' },
                                { label: 'Carbs', value: todayNutrition?.carbs || 0, goal: goals.carbs, progress: carbsProgress, color: 'bg-sky-500', text: 'text-sky-500' },
                                { label: 'Fats', value: todayNutrition?.fats || 0, goal: goals.fats, progress: fatsProgress, color: 'bg-amber-500', text: 'text-amber-500' }
                            ].map((macro, idx) => (
                                <div key={idx} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${macro.text}`}>{macro.label}</span>
                                        <span className="text-xs font-bold">{macro.value}g <span className="text-slate-400">/ {macro.goal}g</span></span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full ${macro.color} rounded-full transition-all duration-1000`} style={{ width: `${macro.progress}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Meal Logger Inline */}
                        {showMealLogger && (
                            <div className="bg-white dark:bg-white/5 border border-primary/30 p-8 rounded-[2.5rem] space-y-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-black tracking-tight">Log Meal</h3>
                                    <button onClick={() => setShowMealLogger(false)} className="text-slate-400 hover:text-white">
                                        <span className="material-icons-round">close</span>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Meal Type</label>
                                        <select
                                            value={selectedMealType}
                                            onChange={(e) => setSelectedMealType(e.target.value)}
                                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 ring-primary/20 outline-none transition-all"
                                        >
                                            <option value="breakfast">Breakfast</option>
                                            <option value="lunch">Lunch</option>
                                            <option value="dinner">Dinner</option>
                                            <option value="snack">Snack</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Meal Name (Optional)</label>
                                        <input
                                            type="text"
                                            value={mealName}
                                            onChange={(e) => setMealName(e.target.value)}
                                            placeholder="E.g., Morning Protein Bowl"
                                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm font-bold placeholder-slate-400 outline-none focus:ring-2 ring-primary/20 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Search Food</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={foodSearch}
                                                onChange={(e) => handleSearchFood(e.target.value)}
                                                placeholder="Type to search..."
                                                className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm font-bold placeholder-slate-400 outline-none focus:ring-2 ring-primary/20 transition-all"
                                            />
                                            {searchResults.length > 0 && (
                                                <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
                                                    {searchResults.map((food) => (
                                                        <button
                                                            key={food._id}
                                                            onClick={() => handleAddFood(food)}
                                                            className="w-full text-left px-5 py-3 hover:bg-primary/10 border-b border-slate-50 dark:border-white/5 last:border-0 transition-colors"
                                                        >
                                                            <p className="font-bold text-sm">{food.name}</p>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                                {food.nutrition.calories} kcal • {food.servingSize}
                                                            </p>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {selectedFoods.length > 0 && (
                                        <div className="space-y-2">
                                            {selectedFoods.map((food, index) => (
                                                <div key={index} className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                                                    <div className="flex-1">
                                                        <p className="text-xs font-bold leading-none mb-1">{food.name}</p>
                                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{Math.round(food.nutrition.calories * food.servings)} kcal</p>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        min="0.1"
                                                        step="0.1"
                                                        value={food.servings}
                                                        onChange={(e) => handleUpdateServings(index, e.target.value)}
                                                        className="w-14 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg py-1 text-center text-xs font-bold"
                                                    />
                                                    <button onClick={() => handleRemoveFood(index)} className="text-rose-500">
                                                        <span className="material-icons-round text-sm">remove_circle</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleLogMeal}
                                        disabled={selectedFoods.length === 0 || submitting}
                                        className="w-full bg-primary text-background-dark font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-background-dark/20 border-t-background-dark rounded-full animate-spin"></div>
                                                LOGGING...
                                            </>
                                        ) : (
                                            'Complete Log'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Meals List */}
                    <div className="lg:col-span-8 order-2 lg:order-2">
                        <div className="space-y-8">
                            <div className="flex justify-between items-end pb-4 border-b border-slate-100 dark:border-white/5">
                                <h2 className="text-2xl font-black tracking-tight">Today's Meals</h2>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 uppercase">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>

                            {todayNutrition?.meals && todayNutrition.meals.length > 0 ? (
                                <div className="space-y-4">
                                    {todayNutrition.meals.map((meal, index) => (
                                        <div key={index} className="group bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 p-6 rounded-[2.5rem] transition-all hover:shadow-xl cursor-pointer">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                        <span className="material-icons-round text-3xl">
                                                            {meal.mealType === 'breakfast' ? 'wb_twilight' :
                                                                meal.mealType === 'lunch' ? 'wb_sunny' :
                                                                    meal.mealType === 'dinner' ? 'nights_stay' : 'local_cafe'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black tracking-tight mb-1">{meal.name}</h3>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-lg">{meal.mealType}</span>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Log time: {new Date(meal.time || meal.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-10">
                                                    <div className="hidden md:grid grid-cols-3 gap-6 text-center">
                                                        <div>
                                                            <p className="text-xs font-black text-rose-500">{meal.protein}g</p>
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Protein</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-sky-500">{meal.carbs}g</p>
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Carbs</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-amber-500">{meal.fats}g</p>
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Fats</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-black tracking-tighter">{meal.calories}</p>
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Total kcal</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteMeal(meal._id)}
                                                        className="p-3 rounded-full bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <span className="material-icons-round text-sm">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10 text-center">
                                    <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                                        <span className="material-icons-round text-4xl text-slate-300 dark:text-slate-700">restaurant_menu</span>
                                    </div>
                                    <h3 className="text-lg font-bold mb-1">Your plate is empty</h3>
                                    <p className="text-sm text-slate-500 max-w-[200px]">Log your first meal to start tracking your daily progress.</p>
                                    <button
                                        onClick={() => setShowMealLogger(true)}
                                        className="mt-8 text-primary font-black uppercase tracking-widest text-[10px] hover:underline"
                                    >
                                        Start Logging Now
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Feedback Overlay */}
            {showSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
                    <div className="bg-primary text-background-dark px-8 py-4 rounded-3xl font-black shadow-2xl shadow-primary/20 animate-in zoom-in duration-300">
                        MEAL LOGGED SUCCESSFULLY!
                    </div>
                </div>
            )}
        </>
    );
};

export default NutritionPlan;
