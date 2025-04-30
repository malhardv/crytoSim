const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Register route - POST /api/auth/register
router.post(
    '/register',
    [
        check('username')
            .trim()
            .isLength({ min: 3 })
            .withMessage('Username must be at least 3 characters long'),
        check('email')
            .isEmail()
            .withMessage('Please provide a valid email'),
        check('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long')
    ],
    authController.register
);

// Login route - POST /api/auth/login
router.post(
    '/login',
    [
        check('email')
            .isEmail()
            .withMessage('Please provide a valid email'),
        check('password')
            .exists()
            .withMessage('Password is required')
    ],
    authController.login
);

// Get current user route - GET /api/auth/me
router.get('/me', auth, authController.getCurrentUser);

module.exports = router; 