const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
    coinId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    acquisitionDate: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String
    }
});

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['buy', 'sell'],
        required: true
    },
    coinId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const portfolioSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    holdings: [holdingSchema],
    transactions: [transactionSchema],
    stats: {
        totalTrades: {
            type: Number,
            default: 0
        },
        profitLoss: {
            type: Number,
            default: 0
        },
        lowestValue: {
            type: Number,
            default: 100000 // Initial portfolio value
        }
    }
}, {
    timestamps: true
});

// Index for efficient queries
portfolioSchema.index({ userId: 1 });

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
module.exports = Portfolio; 