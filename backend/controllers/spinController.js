// spinController.js (Fixed Version)
const SpinSettings = require('../models/SpinSettings');
const TargetNumber = require('../models/TargetNumber');

// ⏱️ GLOBAL MASTER CLOCK (In Memory)
// Initialize the first round to end 60 seconds from server start
let nextSpinTime = Date.now() + 60000;
let isSpinning = false; // Prevents double-execution


// Helper: Ensure settings exist
const getSettings = async () => {
  let settings = await SpinSettings.findOne();
  if (!settings) {
    settings = new SpinSettings({ nextTarget: -1 });
    await settings.save();
  }
  return settings;
};

// 👇 THE CORE LOGIC: DETERMINES THE RESULT
const executeSpinLogic = async () => {
  if (isSpinning) return; // Safety lock
  isSpinning = true;

  try {
    const settings = await getSettings();
    let finalResult;

    // 1. Determine Result based on "Pending Target"
    if (settings.nextTarget !== -1) {
      // Admin set a specific number
      finalResult = settings.nextTarget;
      console.log(`[Spin] Admin Target Used: ${finalResult}`);
    } else {
      // Random Mode
      finalResult = Math.floor(Math.random() * 10);
      console.log(`[Spin] Random Generated: ${finalResult}`);
    }

    // 2. Save Result to History (This is what Unity/Admin sees as "Result")
    const newHistory = new TargetNumber({ number: finalResult });
    await newHistory.save();

    // 3. Reset Pending Target to -1 (Random) for next round
    settings.nextTarget = -1;
    await settings.save();

  } catch (err) {
    console.error("Execute Spin Error:", err);
  } finally {
    isSpinning = false;
  }
};

// 1. GAME STATUS (Called by Admin to tick the clock)
exports.getGameStatus = async (req, res) => {
  try {
    const currentTime = Date.now();

    // IF TIME IS UP -> EXECUTE SPIN
    if (currentTime >= nextSpinTime) {
      await executeSpinLogic();
      // Reset Timer for next 60 seconds (fixed interval)
      nextSpinTime += 60000;
    }

    const timeLeft = Math.max(0, Math.floor((nextSpinTime - currentTime) / 1000));
    const settings = await getSettings(); // Get current pending status

    res.json({
      success: true,
      nextSpinTime: nextSpinTime,
      timeLeft: timeLeft,
      // Tell Admin if a target is currently locked in or if it's auto
      currentStatus: settings.nextTarget,
      serverTime: currentTime
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

// 2. SET TARGET (Admin Only)
exports.setTargetNumber = async (req, res) => {
  const { number } = req.body;
  
  if (number === undefined || number < -1 || number > 9) {
    return res.status(400).json({ success: false, message: 'Number must be between -1 and 9' });
  }

  try {
    // 👇 FIX: Update Settings, DO NOT write to History yet
    let settings = await getSettings();
    settings.nextTarget = number;
    await settings.save();

    res.json({ 
      success: true, 
      message: number === -1 ? "Set to Random Mode" : `Target locked: ${number}`, 
      data: { nextTarget: number } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. GET TARGET FOR UNITY (Read-Only)
exports.getTargetNumber = async (req, res) => {
  try {
    // 👇 FIX: Unity just reads the latest HISTORY. No logic here.
    const latest = await TargetNumber.findOne().sort({ createdAt: -1 });
    
    // If no history exists, default to 0
    const result = latest ? latest.number : 0;

    res.json({ 
      success: true, 
      target_number: result 
    });
  } catch (err) {
    res.json({ target_number: 0 });
  }
};

// 4. GET HISTORY
exports.getTargetHistory = async (req, res) => {
  try {
    // Only show real numbers (0-9), exclude any glitch -1s if they exist
    const history = await TargetNumber.find({ number: { $gte: 0 } })
      .sort({ createdAt: -1 }) 
      .limit(10);
      
   res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add this at the very bottom of spinController.js
// This ensures the timer checks every 1 second, even if no one is logged in.
setInterval(() => {
    const currentTime = Date.now();
    if (currentTime >= nextSpinTime) {
        console.log("⏰ Server Auto-Tick: Time is up, executing spin...");
        executeSpinLogic();
        nextSpinTime += 60000;
    }
}, 1000);