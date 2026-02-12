
const mongoose = require('mongoose');

const quickActionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    label: { type: String, required: true },
    icon: { type: String, required: true }, // Material Icons name
    action: { type: String, required: true }, // route or action type (e.g., '/log-workout', 'log-water')
    order: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
    style: {
        bgColor: { type: String, default: 'bg-primary' },
        textColor: { type: String, default: 'text-background-dark' }
    }
}, { timestamps: true });

module.exports = mongoose.model('QuickAction', quickActionSchema);
