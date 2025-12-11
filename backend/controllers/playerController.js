// controllers/playerController.js
const Player = require('../models/Player');
const Wallet = require('../models/Wallet');

exports.addPlayer = async (req, res) => {
  const { fullName, username, password, status } = req.body;

  try {
    // Check if player exists
    const existingPlayer = await Player.findOne({ username });
    if (existingPlayer) {
      return res.status(400).json({ success: false, message: 'Player already exists' });
    }

    // Create player
    const player = new Player({ fullName, username, password, status });
    await player.save(); // ← This now works perfectly


    // Create wallet
    const wallet = new Wallet({ playerId: player._id });
    await wallet.save();

    res.json({
      success: true,
      message: 'Player added successfully!',
      data: {
        id: player._id,
        sNo: player.sNo,
        fullName: player.fullName,
        username: player.username,
        status: player.status
      }
    });

  } catch (err) {
    console.error("Add Player Error:", err); // ← You will see this in terminal
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};



exports.getAllPlayers = async (req, res) => {
  try {
    // Fetch all players, sorted by newest first
  const players = await Player.aggregate([
      {
        $lookup: {
          from: 'wallets',         // The collection name in MongoDB (usually lowercase + s)
          localField: '_id',       // The field in Player
          foreignField: 'playerId',// The matching field in Wallet
          as: 'walletData'         // Store result in this temporary field
        }
      },
      {
        $unwind: {
          path: '$walletData',
          preserveNullAndEmptyArrays: true // Keep player even if no wallet exists
        }
      },
      {
        $project: {
          _id: 1,
          sNo: 1,
          fullName: 1,
          username: 1,
          status: 1,
          // Extract coins from walletData, default to 0 if missing
          coins: { $ifNull: ['$walletData.coins', 0] }
        }
      },
      { $sort: { sNo: -1 } } // Sort by newest (S.No descending)
    ]);

    res.json({
      success: true,
      count: players.length,
      data: players
    });

  } catch (err) {
    console.error("Get Players Error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};