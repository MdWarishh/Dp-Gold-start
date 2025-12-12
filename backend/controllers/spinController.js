const SpinSettings = require('../models/SpinSettings');
const TargetNumber = require('../models/TargetNumber'); // <--- THIS WAS MISSING!

// Set Spin Settings (update or create general settings)
exports.setSpinSettings = async (req, res) => {
  const { multiplier, probability, rewardType, winningNumber } = req.body;
  try {
    let settings = await SpinSettings.findOne();
    if (!settings) settings = new SpinSettings();

    settings.multiplier = multiplier;
    settings.probability = probability;
    settings.rewardType = rewardType;
    settings.winningNumber = winningNumber;
    await settings.save();

    res.json({ success: true, message: 'Spin settings updated successfully', data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Spin Settings (general)
exports.getSpinSettings = async (req, res) => {
  try {
    const settings = await SpinSettings.findOne();
    if (!settings) return res.status(404).json({ success: false, message: 'No settings found' });

    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================
//  NEW FUNCTIONS FOR UNITY TARGET NUMBER
// ============================================

// Set Target Number (Admin Only)
exports.setTargetNumber = async (req, res) => {
  const { number } = req.body;
  
 // 👈 CHANGED: Allow -1
  if (number === undefined || number < -1 || number > 9) {
    return res.status(400).json({ success: false, message: 'Number must be between -1 and 9' });
  }

  try {
    // CREATE new document to keep history
    const newTarget = new TargetNumber({ number });
    await newTarget.save();

    res.json({ 
      success: true, 
      message: `Target set to ${number}`, 
      data: { target_number: newTarget.number } 
    });
  } catch (err) {
    console.error("Set Target Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Target Number (Public for Unity)
exports.getTargetNumber = async (req, res) => {
  try {
    // Find the most recent one by sorting descending
    const latest = await TargetNumber.findOne().sort({ createdAt: -1 });

    let finalNumber = 0;

    // 👈 NEW LOGIC: If set to -1, generate random
    if (latest && latest.number === -1) {
      finalNumber = Math.floor(Math.random() * 10); // Random 0-9
      // Optional: Log that a random number was generated? 
      // For now, just return it so Unity spins freely.
    } else {
      finalNumber = latest ? latest.number : 0;
    }
    
    res.json({ 
      success: true, 
      target_number: latest ? latest.number : 0 
    });
  } catch (err) {
    console.error("Get Target Error:", err);
    res.json({ target_number: 0 }); 
  }
};


// 3. NEW: Get History (Last 10 records)
exports.getTargetHistory = async (req, res) => {
  try {
    const history = await TargetNumber.find()
      .sort({ createdAt: -1 }) // Newest first
      .limit(10);              // Only last 10
      
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};