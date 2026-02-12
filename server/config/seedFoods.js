
const FoodItem = require('../models/FoodItem');

// Seed food database with common items
const seedFoods = async () => {
    try {
        // Check if foods already exist
        const count = await FoodItem.countDocuments();
        if (count > 0) {
            console.log('Food database already seeded');
            return;
        }

        const foods = [
            // Proteins
            {
                name: 'Chicken Breast',
                category: 'protein',
                servingSize: '100g',
                nutrition: { calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0, sugar: 0 },
                isVerified: true
            },
            {
                name: 'Ground Beef (90% lean)',
                category: 'protein',
                servingSize: '100g',
                nutrition: { calories: 176, protein: 20, carbs: 0, fats: 10, fiber: 0, sugar: 0 },
                isVerified: true
            },
            {
                name: 'Salmon',
                category: 'protein',
                servingSize: '100g',
                nutrition: { calories: 208, protein: 20, carbs: 0, fats: 13, fiber: 0, sugar: 0 },
                isVerified: true
            },
            {
                name: 'Eggs',
                category: 'protein',
                servingSize: '1 large',
                nutrition: { calories: 78, protein: 6, carbs: 0.6, fats: 5, fiber: 0, sugar: 0.6 },
                isVerified: true
            },
            {
                name: 'Whey Protein Powder',
                category: 'protein',
                servingSize: '1 scoop (30g)',
                nutrition: { calories: 120, protein: 24, carbs: 3, fats: 1.5, fiber: 0, sugar: 1 },
                isVerified: true
            },
            {
                name: 'Greek Yogurt (non-fat)',
                category: 'dairy',
                servingSize: '100g',
                nutrition: { calories: 59, protein: 10, carbs: 3.6, fats: 0.4, fiber: 0, sugar: 3.2 },
                isVerified: true
            },

            // Carbs
            {
                name: 'White Rice (cooked)',
                category: 'grains',
                servingSize: '100g',
                nutrition: { calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4, sugar: 0.1 },
                isVerified: true
            },
            {
                name: 'Brown Rice (cooked)',
                category: 'grains',
                servingSize: '100g',
                nutrition: { calories: 112, protein: 2.6, carbs: 24, fats: 0.9, fiber: 1.8, sugar: 0.4 },
                isVerified: true
            },
            {
                name: 'Pasta (cooked)',
                category: 'grains',
                servingSize: '100g',
                nutrition: { calories: 131, protein: 5, carbs: 25, fats: 1.1, fiber: 1.8, sugar: 0.6 },
                isVerified: true
            },
            {
                name: 'Whole Wheat Bread',
                category: 'grains',
                servingSize: '1 slice (28g)',
                nutrition: { calories: 69, protein: 3.6, carbs: 12, fats: 0.9, fiber: 1.9, sugar: 1.4 },
                isVerified: true
            },
            {
                name: 'Oats (dry)',
                category: 'grains',
                servingSize: '100g',
                nutrition: { calories: 389, protein: 17, carbs: 66, fats: 7, fiber: 11, sugar: 0.9 },
                isVerified: true
            },
            {
                name: 'Sweet Potato (baked)',
                category: 'carbs',
                servingSize: '100g',
                nutrition: { calories: 90, protein: 2, carbs: 21, fats: 0.2, fiber: 3.3, sugar: 6.5 },
                isVerified: true
            },

            // Fats
            {
                name: 'Olive Oil',
                category: 'fats',
                servingSize: '1 tbsp (14g)',
                nutrition: { calories: 119, protein: 0, carbs: 0, fats: 13.5, fiber: 0, sugar: 0 },
                isVerified: true
            },
            {
                name: 'Avocado',
                category: 'fats',
                servingSize: '100g',
                nutrition: { calories: 160, protein: 2, carbs: 8.5, fats: 15, fiber: 6.7, sugar: 0.7 },
                isVerified: true
            },
            {
                name: 'Almonds',
                category: 'fats',
                servingSize: '28g (1 oz)',
                nutrition: { calories: 164, protein: 6, carbs: 6, fats: 14, fiber: 3.5, sugar: 1.2 },
                isVerified: true
            },
            {
                name: 'Peanut Butter',
                category: 'fats',
                servingSize: '2 tbsp (32g)',
                nutrition: { calories: 188, protein: 8, carbs: 7, fats: 16, fiber: 2, sugar: 3 },
                isVerified: true
            },

            // Vegetables
            {
                name: 'Broccoli',
                category: 'vegetables',
                servingSize: '100g',
                nutrition: { calories: 34, protein: 2.8, carbs: 7, fats: 0.4, fiber: 2.6, sugar: 1.7 },
                isVerified: true
            },
            {
                name: 'Spinach',
                category: 'vegetables',
                servingSize: '100g',
                nutrition: { calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, fiber: 2.2, sugar: 0.4 },
                isVerified: true
            },
            {
                name: 'Carrots',
                category: 'vegetables',
                servingSize: '100g',
                nutrition: { calories: 41, protein: 0.9, carbs: 10, fats: 0.2, fiber: 2.8, sugar: 4.7 },
                isVerified: true
            },
            {
                name: 'Tomatoes',
                category: 'vegetables',
                servingSize: '100g',
                nutrition: { calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, fiber: 1.2, sugar: 2.6 },
                isVerified: true
            },

            // Fruits
            {
                name: 'Banana',
                category: 'fruits',
                servingSize: '1 medium (118g)',
                nutrition: { calories: 105, protein: 1.3, carbs: 27, fats: 0.4, fiber: 3.1, sugar: 14 },
                isVerified: true
            },
            {
                name: 'Apple',
                category: 'fruits',
                servingSize: '1 medium (182g)',
                nutrition: { calories: 95, protein: 0.5, carbs: 25, fats: 0.3, fiber: 4.4, sugar: 19 },
                isVerified: true
            },
            {
                name: 'Blueberries',
                category: 'fruits',
                servingSize: '100g',
                nutrition: { calories: 57, protein: 0.7, carbs: 14, fats: 0.3, fiber: 2.4, sugar: 10 },
                isVerified: true
            },
            {
                name: 'Orange',
                category: 'fruits',
                servingSize: '1 medium (131g)',
                nutrition: { calories: 62, protein: 1.2, carbs: 15, fats: 0.2, fiber: 3.1, sugar: 12 },
                isVerified: true
            }
        ];

        await FoodItem.insertMany(foods);
        console.log(`Seeded ${foods.length} food items successfully`);
    } catch (error) {
        console.error('Error seeding food database:', error);
    }
};

module.exports = seedFoods;
