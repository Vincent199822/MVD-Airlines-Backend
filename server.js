const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const adminMiddleware = require('./middleware/adminMiddleware');
const flightRoutes = require('./routes/flightRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const mealRoutes = require("./routes/mealRoutes");
const addOnRoutes = require("./routes/addOnRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/users', userRoutes);
app.use('/flights', flightRoutes);
app.use('/bookings', bookingRoutes);
app.use("/meals", mealRoutes);
app.use("/addons", addOnRoutes);


// Protected test route
app.get('/protected', authMiddleware, (req, res) => {
    res.json({
        message: 'You have access to this protected route.',
        user: req.user
    });
});

app.get(
    '/admin-test',
    authMiddleware,
    adminMiddleware,
    (req, res) => {
        res.json({
            message: 'Welcome to the MVD Airlines Admin Area!',
            user: req.user
        });
    }
);


// Test route
app.get('/', (req, res) => {
    res.send('MVD Airlines API is running!');
});

// Port
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.MONGO_STRING)
    .then(() => {
        console.log('Connected to MongoDB');

        app.listen(PORT, () => {
            console.log(`MVD Airlines server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });