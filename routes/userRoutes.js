const express = require('express');

const {
    registerUser,
    loginUser,
    getProfile
} = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');

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


module.exports = router;