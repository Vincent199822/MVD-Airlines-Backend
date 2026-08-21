const express = require('express');
const { registerUser,
		loginUser,
		makeAdmin 
	} = require('../controllers/userController');

const router = express.Router();

// Register User
router.post('/register', registerUser);
// Login User
router.post('/login', loginUser);
// makeAdmin User
// router.patch('/make-admin', makeAdmin);

module.exports = router;