const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const playerSchema = new mongoose.Schema({
  sNo: { type: Number, unique: true }, // Ensure this is not 'required' as we generate it
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
});

// 1. Password Hashing (FIXED: Removed 'next')
playerSchema.pre('save', async function () {
  // If password is not modified, simply return (promise resolves)
  if (!this.isModified('password')) return;
  
  // Await the hash and set it
  this.password = await bcrypt.hash(this.password, 10);
});

// 2. Auto-increment sNo (FIXED: Removed 'next')
playerSchema.pre('save', async function () {
  // If not new, return immediately
  if (!this.isNew) return;

  // Find highest sNo and add 1
  const lastPlayer = await this.constructor.findOne({}, { sNo: 1 }, { sort: { sNo: -1 } });
  this.sNo = lastPlayer && lastPlayer.sNo ? lastPlayer.sNo + 1 : 1;
});

module.exports = mongoose.model('Player', playerSchema);