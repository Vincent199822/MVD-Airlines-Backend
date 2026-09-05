const express = require('express');

const {
    createFlight,
    getFlights,
    getFlightById,
    updateFlight,
    deleteFlight,
    cancelFlight
} = require('../controllers/flightController');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Get All Flights - Public
router.get(
    '/', 
    getFlights
);

router.patch(
    '/:id/cancel',
    authMiddleware,
    adminMiddleware,
    cancelFlight
);

// Get Flight By ID - Public
router.get(
    '/:id',
     getFlightById
);

// Create Flight - Admin only
router.post(
    '/',
    authMiddleware,
    adminMiddleware,
    createFlight
);

// Update Flight - Admin only
router.put(
    '/:id',
    authMiddleware,
    adminMiddleware,
    updateFlight
);

// Delete Flight - Admin only
router.delete(
    '/:id',
    authMiddleware,
    adminMiddleware,
    deleteFlight
);


module.exports = router;