const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get user's portfolio
exports.getPortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({ userId: req.user.userId });
        const user = await User.findById(req.user.userId);
        if (!portfolio || !user) {
            return res.status(404).json({ message: 'Portfolio or user not found' });
        }
        res.json({
            balance: user.balance,
            holdings: portfolio.holdings,
            transactions: portfolio.transactions
        });
    } catch (error) {
        console.error('Get portfolio error:', error);
        res.status(500).json({ message: 'Server error while fetching portfolio' });
    }
};

// Buy cryptocurrency
exports.buyCrypto = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { coinId, name, symbol, image, price, quantity } = req.body;
        const totalCost = price * quantity;

        try {
            // Update user's balance
            const user = await User.findById(req.user.userId);
            if (totalCost > user.balance) {
                throw new Error('Insufficient funds');
            }
            user.balance -= totalCost;
            await user.save();

            // Update portfolio
            const portfolio = await Portfolio.findOne({ userId: req.user.userId });

            // Update holdings
            const holdingIndex = portfolio.holdings.findIndex(h => h.coinId === coinId);
            if (holdingIndex !== -1) {
                portfolio.holdings[holdingIndex].quantity += quantity;
                // Update image in case it changed
                portfolio.holdings[holdingIndex].image = image;
            } else {
                portfolio.holdings.push({
                    coinId,
                    name,
                    symbol,
                    image,
                    quantity,
                    acquisitionDate: new Date()
                });
            }

            // Add transaction
            portfolio.transactions.push({
                type: 'buy',
                coinId,
                name,
                symbol,
                price,
                quantity,
                timestamp: new Date()
            });

            // Update stats
            portfolio.stats.totalTrades += 1;

            await portfolio.save();

            res.json({
                message: 'Purchase successful',
                balance: user.balance,
                portfolio
            });
        } catch (error) {
            throw error;
        }
    } catch (error) {
        console.error('Buy crypto error:', error);
        res.status(400).json({ message: error.message || 'Error processing purchase' });
    }
};

// Sell cryptocurrency
exports.sellCrypto = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { coinId, name, symbol, price, quantity } = req.body;
        const totalGain = price * quantity;

        try {
            // Update portfolio
            const portfolio = await Portfolio.findOne({ userId: req.user.userId });
            const holding = portfolio.holdings.find(h => h.coinId === coinId);

            if (!holding || holding.quantity < quantity) {
                throw new Error('Insufficient crypto balance');
            }

            // Update holdings
            holding.quantity -= quantity;
            portfolio.holdings = portfolio.holdings.filter(h => h.quantity > 0);

            // Add transaction
            portfolio.transactions.push({
                type: 'sell',
                coinId,
                name,
                symbol,
                price,
                quantity,
                timestamp: new Date()
            });

            // Update stats
            portfolio.stats.totalTrades += 1;

            await portfolio.save();

            // Update user's balance
            const user = await User.findById(req.user.userId);
            user.balance += totalGain;
            await user.save();

            res.json({
                message: 'Sale successful',
                balance: user.balance,
                portfolio
            });
        } catch (error) {
            throw error;
        }
    } catch (error) {
        console.error('Sell crypto error:', error);
        res.status(400).json({ message: error.message || 'Error processing sale' });
    }
};

// Get transaction history
exports.getTransactions = async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({ userId: req.user.userId });
        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }
        res.json(portfolio.transactions);
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ message: 'Server error while fetching transactions' });
    }
}; 