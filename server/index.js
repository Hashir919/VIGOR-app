const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

/* =====================
   Middleware
===================== */
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/* =====================
   Database + Seeding
===================== */
const seedFoods = require('./config/seedFoods');
const seedExercises = require('./config/seedExercises');

const startApp = async () => {
  await connectDB();

  if (mongoose.connection.readyState === 1) {
    await seedFoods();
    await seedExercises();
  } else {
    console.warn('DB not connected, skipping seeding');
  }
};

startApp();

/* =====================
   API Routes
===================== */
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

/* =====================
   API 404 Fallback
===================== */
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

/* =====================
   Seed Admin User
===================== */
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
        isActive: true,
      },
      { upsert: true, new: true }
    );

    console.log('Admin user seeded/updated');
  } catch (err) {
    console.error('Error seeding admin:', err);
  }
};

seedAdmin();

/* =====================
   Serve Frontend (SPA)
===================== */
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// SPA fallback (Express v5 SAFE)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

/* =====================
   Start Server
===================== */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});