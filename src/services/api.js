export const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://vigor-app.onrender.com');
export const API_URL = `${BASE_URL}/api`;

const handleResponse = async (res) => {
    const contentType = res.headers.get('content-type');
    let data = null;

    if (contentType && contentType.includes('application/json')) {
        try {
            data = await res.json();
        } catch (e) {
            throw new Error(`Invalid JSON response: ${e.message}`);
        }
    } else {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response (${res.status}): ${text.slice(0, 100)}...`);
    }

    if (!res.ok) {
        throw new Error((data && (data.message || data.error)) || `Request failed with status ${res.status}`);
    }

    return data;
};

export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });
    return handleResponse(res);
};

export const fetchWorkouts = () => apiFetch('/workouts');
export const createWorkout = (data) => apiFetch('/workouts', { method: 'POST', body: JSON.stringify(data) });

export const fetchLatestMetrics = () => apiFetch('/metrics/latest');
export const createMetric = (data) => apiFetch('/metrics', { method: 'POST', body: JSON.stringify(data) });
export const fetchMetricHistory = (range = '1M') => apiFetch(`/metrics/history?range=${range}`);

export const fetchUser = (id = 'default') => apiFetch(`/users/${id}`);
export const updateUser = (id, data) => apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const fetchPosts = () => apiFetch('/posts');

export const changePassword = (currentPassword, newPassword) => apiFetch('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) });
export const forgotPassword = (email) => apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
export const verifyResetCode = (email, code) => apiFetch('/auth/verify-reset-code', { method: 'POST', body: JSON.stringify({ email, code }) });
export const resetPassword = (email, code, newPassword) => apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, code, newPassword }) });

export const fetchDashboardData = () => apiFetch('/dashboard');

export const fetchNutrition = () => apiFetch('/nutrition/latest');
export const createNutrition = (data) => apiFetch('/nutrition', { method: 'POST', body: JSON.stringify(data) });
export const logWater = (amount = 0.25) => apiFetch('/nutrition/water', { method: 'POST', body: JSON.stringify({ amount }) });
export const logMeal = (data) => apiFetch('/nutrition/log-meal', { method: 'POST', body: JSON.stringify(data) });
export const updateMeal = (mealId, data) => apiFetch(`/nutrition/meals/${mealId}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteMeal = (mealId) => apiFetch(`/nutrition/meals/${mealId}`, { method: 'DELETE' });

export const fetchNutritionPlans = () => apiFetch('/nutrition-plans');
export const fetchActivePlan = () => apiFetch('/nutrition-plans/active');
export const createNutritionPlan = (data) => apiFetch('/nutrition-plans', { method: 'POST', body: JSON.stringify(data) });
export const updateNutritionPlan = (id, data) => apiFetch(`/nutrition-plans/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const activateNutritionPlan = (id) => apiFetch(`/nutrition-plans/${id}/activate`, { method: 'PUT' });
export const deleteNutritionPlan = (id) => apiFetch(`/nutrition-plans/${id}`, { method: 'DELETE' });

export const fetchMealTemplates = () => apiFetch('/meal-templates');
export const fetchMealTemplate = (id) => apiFetch(`/meal-templates/${id}`);
export const createMealTemplate = (data) => apiFetch('/meal-templates', { method: 'POST', body: JSON.stringify(data) });
export const updateMealTemplate = (id, data) => apiFetch(`/meal-templates/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteMealTemplate = (id) => apiFetch(`/meal-templates/${id}`, { method: 'DELETE' });

export const searchFoodItems = (query) => apiFetch(`/food-items/search?q=${encodeURIComponent(query)}`);
export const fetchFoodItem = (id) => apiFetch(`/food-items/${id}`);
export const createFoodItem = (data) => apiFetch('/food-items', { method: 'POST', body: JSON.stringify(data) });
export const fetchFoodCategories = () => apiFetch('/food-items/categories');

export const searchExercises = (params = {}) => apiFetch(`/exercises?${new URLSearchParams(params).toString()}`);
export const fetchPopularExercises = () => apiFetch('/exercises/popular');
