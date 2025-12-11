const Player = require('../models/Player');
const Wallet = require('../models/Wallet');

// Update Coins
exports.updateCoins = async (req, res) => {
  const { playerId, coins } = req.body; // coins can be positive (add) or negative (remove)
  try {
    const player = await Player.findById(playerId);
    if (!player) return res.status(404).json({ success: false, message: 'Player not found' });

    let wallet = await Wallet.findOne({ playerId });
    if (!wallet) return res.status(404).json({ success: false, message: 'Wallet not found' });

    wallet.coins += coins;
    if (wallet.coins < 0) wallet.coins = 0; // Prevent negative
    await wallet.save();

    res.json({
      success: true,
      message: 'Coins updated successfully',
      data: {
        playerName: player.fullName,
        username: player.username,
        currentCoins: wallet.coins,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Player Details for Coin Distributor (optional helper)
exports.getPlayer = async (req, res) => {
  const { playerId } = req.params;
  try {
    const player = await Player.findById(playerId);
    if (!player) return res.status(404).json({ success: false, message: 'Player not found' });

    const wallet = await Wallet.findOne({ playerId });
    res.json({
      success: true,
      data: {
        playerName: player.fullName,
        username: player.username,
        currentCoins: wallet ? wallet.coins : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};