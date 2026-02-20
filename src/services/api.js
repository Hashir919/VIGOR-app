
const BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = `${BASE_URL}/api`;


const getHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const fetchWorkouts = async () => {
    const res = await fetch(`${API_URL}/workouts`, {
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch workouts');
    return res.json();
};

export const createWorkout = async (data) => {
    const res = await fetch(`${API_URL}/workouts`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create workout');
    return res.json();
};

export const fetchLatestMetrics = async () => {
    const res = await fetch(`${API_URL}/metrics/latest`, {
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return res.json();
};

export const createMetric = async (data) => {
    const res = await fetch(`${API_URL}/metrics`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create metric');
    return res.json();
};

export const fetchUser = async (id = 'default') => {
    // In a real app we'd pass ID, but here we just get the first user
    const res = await fetch(`${API_URL}/users/${id}`, {
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
};

export const fetchMetricHistory = async (range = '1M') => {
    const res = await fetch(`${API_URL}/metrics/history?range=${range}`, {
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch metric history');
    return res.json();
};

export const fetchPosts = async () => {
    const res = await fetch(`${API_URL}/posts`, {
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
};

export const updateUser = async (id, data) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
};

// Helper to handle responses safely
const handleResponse = async (res) => {
    const contentType = res.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
        data = await res.json();
    } else {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response (${res.status}): ${text.slice(0, 100)}...`);
    }

    if (!res.ok) {
        throw new Error(data.message || data.error || `Request failed with status ${res.status}`);
    }

    return data;
};

// Security & Auth API
export const changePassword = async (currentPassword, newPassword) => {
    const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
    });
    return handleResponse(res);
};

export const forgotPassword = async (email) => {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email })
    });
    return handleResponse(res);
};

export const verifyResetCode = async (email, code) => {
    const res = await fetch(`${API_URL}/auth/verify-reset-code`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, code })
    });
    return handleResponse(res);
};

export const resetPassword = async (email, code, newPassword) => {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, code, newPassword })
    });
    return handleResponse(res);
};

// Dashboard API
export const fetchDashboardData = async () => {
    const res = await fetch(`${API_URL}/dashboard`, {
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    return res.json();
};

// Nutrition API
export const fetchNutrition = async () => {
    const res = await fetch(`${API_URL}/nutrition/latest`, {
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch nutrition');
    return res.json();
};

export const createNutrition = async (data) => {
    const res = await fetch(`${API_URL}/nutrition`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create nutrition entry');
    return res.json();
};

export const logWater = async (amount = 0.25) => {
    const res = await fetch(`${API_URL}/nutrition/water`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ amount })
    });
    if (!res.ok) throw new Error('Failed to log water');
    return res.json();
};

// Nutrition Plans
export const fetchNutritionPlans = async () => {
    const res = await fetch(`${API_URL}/nutrition-plans`, {
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch nutrition plans');
    return res.json();
};

export const fetchActivePlan = async () => {
    const res = await fetch(`${API_URL}/nutrition-plans/active`, {
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch active plan');
    return res.json();
};

export const createNutritionPlan = async (data) => {
    const res = await fetch(`${API_URL}/nutrition-plans`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create nutrition plan');
    }
    return res.json();
};

export const updateNutritionPlan = async (id, data) => {
    const res = await fetch(`${API_URL}/nutrition-plans/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update nutrition plan');
    return res.json();
};

export const activateNutritionPlan = async (id) => {
    const res = await fetch(`${API_URL}/nutrition-plans/${id}/activate`, {
        method: 'PUT',
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to activate nutrition plan');
    return res.json();
};

export const deleteNutritionPlan = async (id) => {
    const res = await fetch(`${API_URL}/nutrition-plans/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete nutrition plan');
    return res.json();
};

// Meal Templates
export const fetchMealTemplates = async () => {
    const res = await fetch(`${API_URL}/meal-templates`, {
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch meal templates');
    return res.json();
};

export const fetchMealTemplate = async (id) => {
    const res = await fetch(`${API_URL}/meal-templates/${id}`, {
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch meal template');
    return res.json();
};

export const createMealTemplate = async (data) => {
    const res = await fetch(`${API_URL}/meal-templates`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create meal template');
    return res.json();
};

export const updateMealTemplate = async (id, data) => {
    const res = await fetch(`${API_URL}/meal-templates/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update meal template');
    return res.json();
};

export const deleteMealTemplate = async (id) => {
    const res = await fetch(`${API_URL}/meal-templates/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete meal template');
    return res.json();
};

// Food Items
export const searchFoodItems = async (query) => {
    const res = await fetch(`${API_URL}/food-items/search?q=${encodeURIComponent(query)}`, {
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to search food items');
    return res.json();
};

export const fetchFoodItem = async (id) => {
    const res = await fetch(`${API_URL}/food-items/${id}`, {
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch food item');
    return res.json();
};

export const createFoodItem = async (data) => {
    const res = await fetch(`${API_URL}/food-items`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create food item');
    return res.json();
};

export const fetchFoodCategories = async () => {
    const res = await fetch(`${API_URL}/food-items/categories`, {
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch food categories');
    return res.json();
};

// Meal Logging
export const logMeal = async (data) => {
    const res = await fetch(`${API_URL}/nutrition/log-meal`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to log meal');
    return res.json();
};

export const updateMeal = async (mealId, data) => {
    const res = await fetch(`${API_URL}/nutrition/meals/${mealId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update meal');
    return res.json();
};

export const deleteMeal = async (mealId) => {
    const res = await fetch(`${API_URL}/nutrition/meals/${mealId}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete meal');
    return res.json();
};

// Exercise API
export const searchExercises = async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/exercises?${queryParams}`, {
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to search exercises');
    return res.json();
};

export const fetchPopularExercises = async () => {
    const res = await fetch(`${API_URL}/exercises/popular`, {
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch popular exercises');
    return res.json();
};
