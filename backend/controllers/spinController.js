// spinController.js (Fixed Version)
const SpinSettings = require('../models/SpinSettings');
const TargetNumber = require('../models/TargetNumber');

// ⏱️ GLOBAL MASTER CLOCK
let nextSpinTime = Date.now() + 60000;  // First spin in 60s
let isSpinning = false;

// Helper
const getSettings = async () => {
  let settings = await SpinSettings.findOne();
  if (!settings) {
    settings = new SpinSettings({ nextTarget: -1 });
    await settings.save();
  }
  return settings;
};

// Generate and save result
// Generate and save result (ONLY CALLED BY SERVER LOOP)
const executeSpinLogic = async () => {
  if (isSpinning) return;
  isSpinning = true;

  try {
    const settings = await getSettings();
    // If nextTarget is -1, generate random 0-9. Otherwise use the locked target.
    let finalResult = settings.nextTarget !== -1 ? settings.nextTarget : Math.floor(Math.random() * 10);

    console.log(`[Spin] Result: ${finalResult} (${settings.nextTarget !== -1 ? 'Admin Target' : 'Random'})`);

    // Save the result to history
    const newHistory = new TargetNumber({ number: finalResult });
    await newHistory.save();

    // Reset Admin Target back to -1 (Auto Mode)
    settings.nextTarget = -1;
    await settings.save();

  } catch (err) {
    console.error("Spin Error:", err);
  } finally {
    isSpinning = false;
  }
};



// 1. GAME STATUS (Read-Only)
// ❌ REMOVED: Logic to trigger spin from here. 
// ✅ ADDED: Purely checks time and returns status.
exports.getGameStatus = async (req, res) => {
  try {
    const currentTime = Date.now();
    
    // Simple math: Time left is NextSpin - Current
    const timeLeft = Math.max(0, Math.floor((nextSpinTime - currentTime) / 1000));
    
    const settings = await getSettings();

    res.json({
      success: true,
      nextSpinTime,
      timeLeft,
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
    // 1. Force a 2-second delay (Sleep)
    // This allows the "Server Loop" to finish writing the new number to DB
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. NOW fetch the latest number
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


// ⏱️ SERVER INTERVAL (The Only Boss)
setInterval(async () => {
  const currentTime = Date.now();

  // If we passed the target time...
  if (currentTime >= nextSpinTime) {
    // 1. Move the goal post FIRST to prevent double-execution
    nextSpinTime += 60000; 

    // 2. Run the logic
    await executeSpinLogic();
    
    console.log(`⏰ Auto-spin executed at ${new Date(currentTime).toISOString()}. Next: ${new Date(nextSpinTime).toISOString()}`);
  }
}, 1000);