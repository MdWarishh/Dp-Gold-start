const mongoose = require('mongoose');

const spinSettingsSchema = new mongoose.Schema({
  multiplier: { type: Number, required: true },
  probability: { type: Number, required: true },
  rewardType: { type: String, required: true },
  winningNumber: { type: Number, required: true },
});

module.exports = mongoose.model('SpinSettings', spinSettingsSchema);