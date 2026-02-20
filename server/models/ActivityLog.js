const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    event: { type: String, required: true }, // e.g., 'ADMIN_LOGIN', 'USER_DELETE', 'SETTINGS_CHANGE'
    description: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    targetType: { type: String }, // 'USER', 'WORKOUT', 'SETTING'
    ipAddress: String,
    metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
