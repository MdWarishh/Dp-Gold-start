const SpinSettings = require('../models/SpinSettings');
const TargetNumber = require('../models/TargetNumber'); // <--- THIS WAS MISSING!



// ⏱️ GLOBAL MASTER CLOCK (In Memory)
// Initialize the first round to end 60 seconds from server start
let nextSpinTime = Date.now() + 60000;

// 👇 NEW: Helper function to executing the Spin (Generate Result)
const executeSpinLogic = async () => {
  try {
    // 1. Check what the current target is (set by Admin or -1)
    const latest = await TargetNumber.findOne().sort({ createdAt: -1 });
    let currentDbValue = latest ? latest.number : -1;
    let finalResult = 0;

    if (currentDbValue !== -1) {
      // CASE A: Admin set a number (e.g., 5)
      // The number '5' is already in DB, so that is our result.
      finalResult = currentDbValue;
      console.log(`[Spin] Admin Target Processed: ${finalResult}`);
    } else {
      // CASE B: Random Mode (-1)
      // We need to generating a random number and SAVE it as history
      finalResult = Math.floor(Math.random() * 10);
      
      const randomEntry = new TargetNumber({ number: finalResult });
      await randomEntry.save();
      console.log(`[Spin] Random Number Generated: ${finalResult}`);
    }

    // 2. IMPORTANT: RESET FOR NEXT ROUND
    // Always add a -1 on top so the next round starts fresh
    const resetEntry = new TargetNumber({ number: -1 });
    await resetEntry.save();

  } catch (err) {
    console.error("Execute Spin Error:", err);
  }
};

// 1. Get Game Status (Called by Admin & Unity)
// controllers/spinController.js

// ... (keep previous code)

// 1. Get Game Status (Called by Admin & Unity)
exports.getGameStatus = async (req, res) => {
  try {
    const currentTime = Date.now();

    // 👇 THE FIX: Check time
    if (currentTime >= nextSpinTime) {
      
      // 1. IMMEDIATELY update the timer first! 
      // This prevents Unity and Admin from triggering it at the same time.
      nextSpinTime = currentTime + 60000;

      // 2. THEN run the logic in the background
      // (We don't await this because we want to return the response fast)
      executeSpinLogic(); 
    }

    const timeLeft = Math.floor((nextSpinTime - currentTime) / 1000);

    res.json({
      success: true,
      nextSpinTime: nextSpinTime,
      timeLeft: timeLeft > 0 ? timeLeft : 0
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



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