const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const auth = require('../middleware/auth');

// Get leaderboard - GET /api/leaderboard
router.get('/', leaderboardController.getLeaderboard);

// Get user ranking - GET /api/leaderboard/ranking
router.get('/ranking', auth, leaderboardController.getUserRanking);

module.exports = router; 