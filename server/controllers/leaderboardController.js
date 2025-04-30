const User = require('../models/User');
const Portfolio = require('../models/Portfolio');

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const portfolios = await Portfolio.find()
            .populate('userId', 'username badges')
            .select('userId stats holdings');

        // Calculate total portfolio value for each user
        const leaderboardData = await Promise.all(portfolios.map(async portfolio => {
            const user = await User.findById(portfolio.userId);
            if (!user) return null;

            // Calculate total holdings value using the latest price in the holding (if available)
            const holdingsValue = portfolio.holdings.reduce((total, holding) => {
                // Use holding.price if available, otherwise fallback to 0
                const price = typeof holding.price === 'number' ? holding.price : 0;
                return total + (holding.quantity * price);
            }, 0);

            const totalValue = holdingsValue + user.balance;

            return {
                username: user.username,
                totalValue,
                balance: user.balance,
                holdingsValue,
                holdings: portfolio.holdings,
                totalTrades: portfolio.stats.totalTrades,
                badges: user.badges
            };
        }));

        // Remove null entries and sort by total value
        const sortedLeaderboard = leaderboardData
            .filter(entry => entry !== null)
            .sort((a, b) => b.totalValue - a.totalValue);

        res.json(sortedLeaderboard);
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ message: 'Server error while fetching leaderboard' });
    }
};

// Get user ranking
exports.getUserRanking = async (req, res) => {
    try {
        const userId = req.user.userId;
        const portfolios = await Portfolio.find().populate('userId', 'username');
        
        // Calculate and sort all portfolio values
        const rankings = await Promise.all(portfolios.map(async portfolio => {
            const user = await User.findById(portfolio.userId);
            if (!user) return null;

            const holdingsValue = portfolio.holdings.reduce((total, holding) => {
                return total + (holding.quantity * 100); // placeholder calculation
            }, 0);

            return {
                userId: portfolio.userId.toString(),
                totalValue: holdingsValue + user.balance
            };
        }));

        // Sort rankings and find user's position
        const sortedRankings = rankings
            .filter(rank => rank !== null)
            .sort((a, b) => b.totalValue - a.totalValue);
        
        const userRank = sortedRankings.findIndex(rank => rank.userId === userId) + 1;
        const totalUsers = sortedRankings.length;

        res.json({
            rank: userRank,
            totalUsers,
            percentile: Math.round((1 - (userRank / totalUsers)) * 100)
        });
    } catch (error) {
        console.error('User ranking error:', error);
        res.status(500).json({ message: 'Server error while fetching user ranking' });
    }
}; 