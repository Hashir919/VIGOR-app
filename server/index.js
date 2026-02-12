
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Seed food database
const seedFoods = require('./config/seedFoods');
const seedExercises = require('./config/seedExercises');
seedFoods();
seedExercises();

// Routes
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Import Routes
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/metrics', require('./routes/metrics'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/nutrition', require('./routes/nutrition'));
app.use('/api/nutrition-plans', require('./routes/nutritionPlans'));
app.use('/api/meal-templates', require('./routes/mealTemplates'));
app.use('/api/food-items', require('./routes/foodItems'));
app.use('/api/exercises', require('./routes/exercises'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
