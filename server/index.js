const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

/* middleware */
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/* db + seed */
const seedFoods = require('./config/seedFoods');
const seedExercises = require('./config/seedExercises');

(async () => {
  await connectDB();
  if (mongoose.connection.readyState === 1) {
    await seedFoods();
    await seedExercises();
  }
})();

/* api routes */
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

/* api 404 */
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

/* seed admin */
const User = require('./models/User');
const bcrypt = require('bcryptjs');

(async () => {
  const email = 'hashir20aug@gmail.com';
  const password = 'Invade_919';
  const hash = await bcrypt.hash(password, 10);

  await User.findOneAndUpdate(
    { email },
    { email, name: 'Hashir (Admin)', password: hash, role: 'ADMIN', isActive: true },
    { upsert: true }
  );
})();

/* frontend */
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

/* start */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});