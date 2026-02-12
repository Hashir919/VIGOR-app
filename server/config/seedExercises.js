
const Exercise = require('../models/Exercise');

const exercises = [
    { name: 'Bench Press', category: 'Chest', type: 'Strength', icon: 'fitness_center', popularity: 100, muscleGroup: ['Pectorals', 'Triceps', 'Shoulders'] },
    { name: 'Incline Bench Press', category: 'Chest', type: 'Strength', icon: 'fitness_center', popularity: 80, muscleGroup: ['Upper Pectorals', 'Triceps', 'Shoulders'] },
    { name: 'Deadlift', category: 'Full Body', type: 'Strength', icon: 'fitness_center', popularity: 95, muscleGroup: ['Back', 'Glutes', 'Hamstrings'] },
    { name: 'Squat', category: 'Legs', type: 'Strength', icon: 'fitness_center', popularity: 98, muscleGroup: ['Quads', 'Glutes', 'Hamstrings'] },
    { name: 'Overhead Press', category: 'Shoulders', type: 'Strength', icon: 'fitness_center', popularity: 85, muscleGroup: ['Shoulders', 'Triceps'] },
    { name: 'Pull-Ups', category: 'Back', type: 'Strength', icon: 'fitness_center', popularity: 90, muscleGroup: ['Lats', 'Biceps'] },
    { name: 'Barbell Row', category: 'Back', type: 'Strength', icon: 'fitness_center', popularity: 82, muscleGroup: ['Back', 'Biceps'] },
    { name: 'Bicep Curls', category: 'Arms', type: 'Strength', icon: 'fitness_center', popularity: 88, muscleGroup: ['Bicep'] },
    { name: 'Tricep Extensions', category: 'Arms', type: 'Strength', icon: 'fitness_center', popularity: 84, muscleGroup: ['Tricep'] },
    { name: 'Plank', category: 'Core', type: 'Strength', icon: 'timer', popularity: 75, muscleGroup: ['Abs'] },
    { name: 'Running', category: 'Cardio', type: 'Cardio', icon: 'directions_run', popularity: 92, muscleGroup: ['Legs', 'Heart'] },
    { name: 'Cycling', category: 'Cardio', type: 'Cardio', icon: 'directions_bike', popularity: 80, muscleGroup: ['Legs', 'Heart'] },
    { name: 'Leg Press', category: 'Legs', type: 'Strength', icon: 'fitness_center', popularity: 78, muscleGroup: ['Quads', 'Glutes'] },
    { name: 'Lat Pulldown', category: 'Back', type: 'Strength', icon: 'fitness_center', popularity: 86, muscleGroup: ['Lats', 'Biceps'] },
    { name: 'Push-Ups', category: 'Chest', type: 'Strength', icon: 'fitness_center', popularity: 88, muscleGroup: ['Chest', 'Triceps', 'Shoulders'] }
];

const seedExercises = async () => {
    try {
        const count = await Exercise.countDocuments();
        if (count === 0) {
            await Exercise.insertMany(exercises);
            console.log('Exercises seeded successfully');
        }
    } catch (err) {
        console.error('Error seeding exercises:', err);
    }
};

module.exports = seedExercises;
