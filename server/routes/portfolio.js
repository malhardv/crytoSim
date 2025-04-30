const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const portfolioController = require('../controllers/portfolioController');
const auth = require('../middleware/auth');

// Get portfolio - GET /api/portfolio
router.get('/', auth, portfolioController.getPortfolio);

// Buy crypto - POST /api/portfolio/buy
router.post(
    '/buy',
    [
        auth,
        [
            check('coinId').notEmpty().withMessage('Coin ID is required'),
            check('name').notEmpty().withMessage('Coin name is required'),
            check('symbol').notEmpty().withMessage('Coin symbol is required'),
            check('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
            check('quantity').isFloat({ min: 0 }).withMessage('Valid quantity is required')
        ]
    ],
    portfolioController.buyCrypto
);

// Sell crypto - POST /api/portfolio/sell
router.post(
    '/sell',
    [
        auth,
        [
            check('coinId').notEmpty().withMessage('Coin ID is required'),
            check('name').notEmpty().withMessage('Coin name is required'),
            check('symbol').notEmpty().withMessage('Coin symbol is required'),
            check('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
            check('quantity').isFloat({ min: 0 }).withMessage('Valid quantity is required')
        ]
    ],
    portfolioController.sellCrypto
);

// Get transactions - GET /api/portfolio/transactions
router.get('/transactions', auth, portfolioController.getTransactions);

module.exports = router; 