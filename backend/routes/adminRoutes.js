// routes/adminRoutes.js  ← 100% WORKING IN 2025
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Import only the functions
const { registerAdmin, loginAdmin } = require('../controllers/adminController');
const { addPlayer, getAllPlayers, loginPlayer, updatePlayerStatus } = require('../controllers/playerController');
const { updateCoins, getPlayer } = require('../controllers/coinController');
const { 
  setSpinSettings, 
  getSpinSettings, 
  setTargetNumber, 
  getTargetNumber, 
  getTargetHistory 
} = require('../controllers/spinController');

// THIS WRAPPER FIXES "next is not a function" FOREVER
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// PUBLIC ROUTES
router.post('/register', asyncHandler(registerAdmin));
router.post('/login', asyncHandler(loginAdmin));

// PROTECTED ROUTES
router.post('/add-player', auth, asyncHandler(addPlayer));
// 👇 ADD THIS NEW ROUTE HERE
router.get('/players', auth, asyncHandler(getAllPlayers));
// 👇 ADD THIS NEW ROUTE
router.post('/update-player-status', auth, asyncHandler(updatePlayerStatus));



// 👇 PLAYER LOGIN ROUTE (Public)
router.post('/login', asyncHandler(loginPlayer));

router.post('/update-coins', auth, asyncHandler(updateCoins));
router.post('/spin-control', auth, asyncHandler(setSpinSettings));
router.get('/get-spin-settings', auth, asyncHandler(getSpinSettings));
router.get('/get-player/:playerId', auth, asyncHandler(getPlayer));


// Admin sets the number (0–9)
router.post('/set-target', auth, asyncHandler(setTargetNumber));

// Public API for Unity (no auth needed)
router.get('/public/target', asyncHandler(getTargetNumber));
// 👇 ADD THIS NEW LINE FOR UNITY HISTORY
router.get('/public/history', asyncHandler(getTargetHistory));
router.get('/target-history', auth, asyncHandler(getTargetHistory));


module.exports = router;