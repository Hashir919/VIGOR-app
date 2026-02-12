
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri || uri.includes('<username>')) {
            console.error('Error: MONGO_URI is not set or still contains placeholder values in .env file');
            console.error('Please update server/.env with your actual MongoDB connection string');
            return; // Don't crash, just log error
        }
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        // Retry connection after 5 seconds
        setTimeout(connectDB, 5000);
    }
};

module.exports = connectDB;
