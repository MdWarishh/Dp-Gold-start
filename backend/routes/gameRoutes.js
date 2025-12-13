const express = require('express');
const router = express.Router();
const { loginPlayer } = require('../controllers/playerController'); // Import the function

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 👇 This is your Player Login Route
router.post('/login', asyncHandler(loginPlayer));

module.exports = router;