const mongoose = require('mongoose');

const spinSettingsSchema = new mongoose.Schema({
  // 👇 CHANGED: Removed 'required: true', added defaults
  multiplier: { type: Number, default: 2 },
  probability: { type: Number, default: 50 },
  rewardType: { type: String, default: 'coins' },
  winningNumber: { type: Number, default: 0 },
  
  // Your existing field
  nextTarget: { type: Number, default: -1 }
});

module.exports = mongoose.model('SpinSettings', spinSettingsSchema);