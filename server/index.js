
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

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Database Connection handled in startApp below

// Seed food database
const seedFoods = require('./config/seedFoods');
const seedExercises = require('./config/seedExercises');

// Wait for DB connection before seeding
const startApp = async () => {
    await connectDB();
    // Only seed if we have a connection
    if (require('mongoose').connection.readyState === 1) {
        await seedFoods();
        await seedExercises();
    } else {
        console.warn('DB not connected, skipping seeding');
    }
};

startApp();

// Routes
// Root route removed to allow serving frontend static files
// app.get('/', (req, res) => {
//     res.send('API is running...');
// });

// Routes
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
app.use('/api/admin', require('./routes/admin'));
app.use('/api/exercises', require('./routes/exercises'));

// Seed admin user
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const seedAdmin = async () => {
    try {
        const adminEmail = 'hashir20aug@gmail.com';
        const adminPassword = 'Invade_919';
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(adminPassword, salt);
        await User.findOneAndUpdate(
            { email: adminEmail },
            {
                email: adminEmail,
                name: 'Hashir (Admin)',
                password: passwordHash,
                role: 'ADMIN',
                isActive: true
            },
            { upsert: true, new: true }
        );
        console.log('Admin user seeded/updated');
    } catch (err) {
        console.error('Error seeding admin:', err);
    }
};
seedAdmin();

// Specific catch-all for /api routes to ensure they always return JSON
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found' })
})

// Serve static assets in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Catch-all route to serve index.html for SPA routing (only for non-API routes)
app.get('/:path*', (req, res) => {
    // If it's a GET request and not for an API, serve the app
    if (!req.path.startsWith('/api') && req.accepts('html')) {
        res.sendFile(path.join(distPath, 'index.html'));
    } else {
        res.status(404).json({ message: 'Not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
