
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Exercise = require('../models/Exercise');

const checkExercises = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await Exercise.countDocuments();
        console.log(`Current Exercise Count: ${count}`);

        if (count === 0) {
            console.log('Seeding exercises...');
            const seedExercises = require('./seedExercises');
            await seedExercises();
            const newCount = await Exercise.countDocuments();
            console.log(`New Exercise Count: ${newCount}`);
        } else {
            const sample = await Exercise.find().limit(5);
            console.log('Sample Exercises:', JSON.stringify(sample, null, 2));
        }

    } catch (err) {
        console.error('Error checking exercises:', err);
    } finally {
        await mongoose.connection.close();
    }
};

checkExercises();
