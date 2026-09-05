const express = require('express');

const {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,
    deleteBooking,
    getAllBookings,
    adminCancelBooking
} = require('../controllers/bookingController');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();


// Create Booking - Logged-in users
router.post(
    '/',
    authMiddleware,
    createBooking
);


// Get My Bookings - Logged-in users
router.get(
    '/my-bookings',
    authMiddleware,
    getMyBookings
);


// Get All Bookings - Admin only
router.get(
    '/',
    authMiddleware,
    adminMiddleware,
    getAllBookings
);


// Get Booking By ID - Owner only
router.get(
    '/:id',
    authMiddleware,
    getBookingById
);


// Cancel Booking - Owner only
router.patch(
    '/:id/cancel',
    authMiddleware,
    cancelBooking
);

router.delete(
    '/:id', 
    authMiddleware, 
    deleteBooking
);
// Cancel Booking - Admin only
router.patch(
    '/:id/admin-cancel',
    authMiddleware,
    adminMiddleware,
    adminCancelBooking
);



module.exports = router;