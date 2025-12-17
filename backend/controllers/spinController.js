const SpinSettings = require('../models/SpinSettings');
const TargetNumber = require('../models/TargetNumber'); // <--- THIS WAS MISSING!



// ⏱️ GLOBAL MASTER CLOCK (In Memory)
// Initialize the first round to end 60 seconds from server start
// ⏱️ GLOBAL MASTER CLOCK (In Memory)
let nextSpinTime = Date.now() + 64000;
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




// 👇 NEW: Helper function to executing the Spin (Generate Result)
// const executeSpinLogic = async () => {
//   try {
//     // 1. Check what the current target is (set by Admin or -1)
//     const latest = await TargetNumber.findOne().sort({ createdAt: -1 });
//     let currentDbValue = latest ? latest.number : -1;
//     let finalResult = 0;

//     if (currentDbValue !== -1) {
//       // CASE A: Admin set a number (e.g., 5)
//       // The number '5' is already in DB, so that is our result.
//       finalResult = currentDbValue;
//       console.log(`[Spin] Admin Target Processed: ${finalResult}`);
//     } else {
//       // CASE B: Random Mode (-1)
//       // We need to generating a random number and SAVE it as history
//       finalResult = Math.floor(Math.random() * 10);
      
//       const randomEntry = new TargetNumber({ number: finalResult });
//       await randomEntry.save();
//       console.log(`[Spin] Random Number Generated: ${finalResult}`);
//     }

//     // 2. IMPORTANT: RESET FOR NEXT ROUND
//     // Always add a -1 on top so the next round starts fresh
//     const resetEntry = new TargetNumber({ number: -1 });
//     await resetEntry.save();

//   } catch (err) {
//     console.error("Execute Spin Error:", err);
//   }
// };




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





// 1. Get Game Status (Called by Admin & Unity)
// exports.getGameStatus = async (req, res) => {
//   try {
//     const currentTime = Date.now();

//     // 👇 THIS IS THE FIX:
//     // If time is up, we don't just reset the timer...
//     // WE ALSO EXECUTE THE SPIN!
//     if (currentTime >= nextSpinTime) {
      
//       // A. Run the spin logic (Save to DB)
//       await executeSpinLogic();

//       // B. Reset Timer for next 60 seconds
//       nextSpinTime = currentTime + 60000;
//     }

//     const timeLeft = Math.floor((nextSpinTime - currentTime) / 1000);

//     res.json({
//       success: true,
//       nextSpinTime: nextSpinTime,
//       timeLeft: timeLeft > 0 ? timeLeft : 0
//     });

//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };




// 1. GAME STATUS (Called by Admin to tick the clock)
exports.getGameStatus = async (req, res) => {
  try {
    const currentTime = Date.now();

    // IF TIME IS UP -> EXECUTE SPIN
    if (currentTime >= nextSpinTime) {
      await executeSpinLogic();
      // Reset Timer for next 60 seconds
      nextSpinTime = currentTime + 64000;
    }

    const timeLeft = Math.floor((nextSpinTime - currentTime) / 1000);
    const settings = await getSettings(); // Get current pending status

    res.json({
      success: true,
      nextSpinTime: nextSpinTime,
     timeLeft: timeLeft > 60 ? 60 : (timeLeft > 0 ? timeLeft : 0),
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

// ============================================
//  NEW FUNCTIONS FOR UNITY TARGET NUMBER
// ============================================

// Set Target Number (Admin Only)
// exports.setTargetNumber = async (req, res) => {
//   const { number } = req.body;
  
//  // 👈 CHANGED: Allow -1
//   if (number === undefined || number < -1 || number > 9) {
//     return res.status(400).json({ success: false, message: 'Number must be between -1 and 9' });
//   }

//   try {
//     // CREATE new document to keep history
//     const newTarget = new TargetNumber({ number });
//     await newTarget.save();

//     res.json({ 
//       success: true, 
//       message: `Target set to ${number}`, 
//       data: { target_number: newTarget.number } 
//     });
//   } catch (err) {
//     console.error("Set Target Error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };



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






// Get Target Number (Public for Unity)
// exports.getTargetNumber = async (req, res) => {
//   try {
//     // Find the most recent one by sorting descending
//     const latest = await TargetNumber.findOne().sort({ createdAt: -1 });
    
//     // Default to Random (-1) if nothing exists
//     let currentDbValue = latest ? latest.number : -1;
//     let numberToSend = 0;

//     // 👈 NEW LOGIC: If set to -1, generate random
//    if (currentDbValue !== -1) {
//       // -----------------------------------------------------
//       // CASE A: Admin set a specific number (e.g., 5)
//       // -----------------------------------------------------
//       numberToSend = currentDbValue;

//       // Create a NEW record for the reset (don't overwrite the 5!)
//       // This ensures '5' stays in your history.
//       const resetEntry = new TargetNumber({ number: -1 });
//       await resetEntry.save();
      
//       console.log(`[Target] Consumed Admin Target: ${numberToSend}. Reset to Random.`);

//     } else {
//       // -----------------------------------------------------
//       // CASE B: Random Mode (Current is -1)
//       // -----------------------------------------------------
//       numberToSend = Math.floor(Math.random() * 10); // Generate 0-9

//       // 1. Save this random number to DB (So it shows in History)
//       const randomHistory = new TargetNumber({ number: numberToSend });
//       await randomHistory.save();

//       // 2. Immediately save a -1 on top of it
//       // This ensures the NEXT spin will generate a new random number
//       const resetEntry = new TargetNumber({ number: -1 });
//       await resetEntry.save();

//       console.log(`[Target] Auto-Generated Random: ${numberToSend}. Saved to History.`);
//     }
    
//    res.json({ 
//   success: true, 
//   target_number: numberToSend  // ✅ CORRECT: Sends the calculated random number
// });
//   } catch (err) {
//     console.error("Get Target Error:", err);
//     res.json({ target_number: Math.floor(Math.random() * 10) });
//   }
// };





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






// 3. NEW: Get History (Last 10 records)
// exports.getTargetHistory = async (req, res) => {
//   try {
//     const history = await TargetNumber.find({ number: { $ne: -1 } })
//       .sort({ createdAt: -1 }) // Newest first
//       .limit(10);              // Only last 10 results
      
//    res.json({ success: true, data: history });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };




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
// setInterval(() => {
//     const currentTime = Date.now();
//     if (currentTime >= nextSpinTime) {
//         console.log("⏰ Server Auto-Tick: Time is up, executing spin...");
//         executeSpinLogic();
//         nextSpinTime = currentTime + 60000;
//     }
// }, 1000);