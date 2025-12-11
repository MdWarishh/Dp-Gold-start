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
  
  // Validation: Must be 0-9
  if (number === undefined || number < 0 || number > 9) {
    return res.status(400).json({ success: false, message: 'Number must be between 0 and 9' });
  }

  try {
    // Use the helper we defined in the Model
    let target = await TargetNumber.findOne();
    if (!target) target = new TargetNumber({ number: 0 });
    
    target.number = number;
    await target.save();

    res.json({ 
      success: true, 
      message: `Target number set to ${number}`, 
      data: { target_number: target.number } 
    });
  } catch (err) {
    console.error("Set Target Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Target Number (Public for Unity)
exports.getTargetNumber = async (req, res) => {
  try {
    // We use the static method to ensure only one record exists
    const target = await TargetNumber.getCurrent(); 
    
    // IMPORTANT: Return exact JSON format Unity expects: {"target_number": 5}
    res.json({ 
      success: true, 
      target_number: target.number 
    });
  } catch (err) {
    console.error("Get Target Error:", err);
    // Fallback for Unity so game doesn't crash
    res.json({ target_number: 0 }); 
  }
};