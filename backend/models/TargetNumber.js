// // models/TargetNumber.js
// const mongoose = require('mongoose');

// const targetSchema = new mongoose.Schema({
//   number: {
//     type: Number,
//     required: true,
//     min: 0,
//     max: 9
//   }
// }, { timestamps: true });

// // Always keep only one record
// targetSchema.statics.getCurrent = async function() {
//   let doc = await this.findOne();
//   if (!doc) {
//     doc = new this({ number: 0 });
//     await doc.save();
//   }
//   return doc;
// };

// module.exports = mongoose.model('TargetNumber', targetSchema);


// models/TargetNumber.js
const mongoose = require('mongoose');

const targetSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    min: -1, // 👈 CHANGED: Allow -1 for "Random Mode"
    max: 9
  }
}, { timestamps: true });

// Always keep only one record logic (unchanged)
targetSchema.statics.getCurrent = async function() {
  let doc = await this.findOne();
  if (!doc) {
    doc = new this({ number: 0 }); // Default to 0 if empty
    await doc.save();
  }
  return doc;
};

module.exports = mongoose.model('TargetNumber', targetSchema);