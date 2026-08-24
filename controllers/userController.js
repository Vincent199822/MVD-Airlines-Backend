const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
const registerUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            password,
            confirmPassword
        } = req.body;

        const normalizedEmail = req.body.email?.trim().toLowerCase();

        // Check required fields
        if (
            !firstName ||
            !lastName ||
            !normalizedEmail ||
            !password ||
            !confirmPassword
        ) {
            return res.status(400).json({
                message: 'Please provide all required fields.'
            });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({
                message: 'Passwords do not match.'
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'Email is already registered.'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email: normalizedEmail,
            password: hashedPassword,
            role: 'user'
        });

        res.status(201).json({
            message: 'User registered successfully.',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Registration error:', error);

        res.status(500).json({
            message: 'Server error.'
        });
    }
};


// Login User
const loginUser = async (req, res) => {
    try {
        const { password } = req.body;

        const normalizedEmail = req.body.email?.trim().toLowerCase();

        // Check required fields
        if (!normalizedEmail || !password) {
            return res.status(400).json({
                message: 'Please provide email and password.'
            });
        }

        // Find user by email
        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        // Compare password
        const isPasswordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordMatch) {
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: '1d'
            }
        );

        res.status(200).json({
            message: 'Login successful.',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);

        res.status(500).json({
            message: 'Server error.'
        });
    }
};


// Get User Profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        res.status(200).json({
            user
        });

    } catch (error) {
        console.error('Get profile error:', error);

        res.status(500).json({
            message: 'Server error.'
        });
    }
};


// Export Controllers
module.exports = {
    registerUser,
    loginUser,
    getProfile

    // makeAdmin
};