const mongoose = require('mongoose');

const appSettingsSchema = new mongoose.Schema({
    maintenanceMode: { type: Boolean, default: false },
    registrationsEnabled: { type: Boolean, default: true },
    systemNotice: { type: String, default: '' },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('AppSettings', appSettingsSchema);
