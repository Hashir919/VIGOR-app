
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userAvatar: String,
    content: String,
    image: String,
    type: { type: String, enum: ['achievement', 'activity', 'challenge'], default: 'activity' },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    metadata: {
        distance: String,
        duration: String,
        pace: String,
        bpm: Number,
        steps: Number,
        badge: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
