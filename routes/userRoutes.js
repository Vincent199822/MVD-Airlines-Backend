const express = require('express');

const {
    registerUser,
    loginUser,
    getProfile
} = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();


// Register User
router.post(
    '/register',
    registerUser
);


// Login User
router.post(
    '/login',
    loginUser
);


// Make User Admin
// router.patch('/make-admin', makeAdmin);


// Get User Profile - Logged-in users
router.get(
    '/profile',
    authMiddleware,
    getProfile
);


// Admin Test Route
router.get(
    '/admin-test',
    authMiddleware,
    adminMiddleware,
    (req, res) => {

        res.status(200).json({
            message: 'Admin access granted.',
            user: req.user
        });

    }
);


module.exports = router;