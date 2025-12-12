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
    
    // Default to Random (-1) if nothing exists
    let currentDbValue = latest ? latest.number : -1;
    let numberToSend = 0;

    // 👈 NEW LOGIC: If set to -1, generate random
   if (currentDbValue !== -1) {
      // -----------------------------------------------------
      // CASE A: Admin set a specific number (e.g., 5)
      // -----------------------------------------------------
      numberToSend = currentDbValue;

      // Create a NEW record for the reset (don't overwrite the 5!)
      // This ensures '5' stays in your history.
      const resetEntry = new TargetNumber({ number: -1 });
      await resetEntry.save();
      
      console.log(`[Target] Consumed Admin Target: ${numberToSend}. Reset to Random.`);

    } else {
      // -----------------------------------------------------
      // CASE B: Random Mode (Current is -1)
      // -----------------------------------------------------
      numberToSend = Math.floor(Math.random() * 10); // Generate 0-9

      // 1. Save this random number to DB (So it shows in History)
      const randomHistory = new TargetNumber({ number: numberToSend });
      await randomHistory.save();

      // 2. Immediately save a -1 on top of it
      // This ensures the NEXT spin will generate a new random number
      const resetEntry = new TargetNumber({ number: -1 });
      await resetEntry.save();

      console.log(`[Target] Auto-Generated Random: ${numberToSend}. Saved to History.`);
    }
    
   res.json({ 
  success: true, 
  target_number: numberToSend  // ✅ CORRECT: Sends the calculated random number
});
  } catch (err) {
    console.error("Get Target Error:", err);
    res.json({ target_number: Math.floor(Math.random() * 10) });
  }
};


// 3. NEW: Get History (Last 10 records)
exports.getTargetHistory = async (req, res) => {
  try {
    const history = await TargetNumber.find({ number: { $ne: -1 } })
      .sort({ createdAt: -1 }) // Newest first
      .limit(10);              // Only last 10 results
      
   res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};