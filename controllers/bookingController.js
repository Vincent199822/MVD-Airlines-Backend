const Booking = require('../models/Booking');
const Flight = require('../models/Flight');

// Create Booking
const createBooking = async (req, res) => {
    try {
        const { flightId, passengers } = req.body;

        // Check required fields
        if (!flightId || passengers === undefined) {
            return res.status(400).json({
                message: 'Please provide flight and number of passengers.'
            });
        }

        // Validate passenger count
        if (!Number.isInteger(passengers) || passengers < 1) {
            return res.status(400).json({
                message: 'Passengers must be at least 1.'
            });
        }

        // Find flight
        const flight = await Flight.findById(flightId);

        if (!flight) {
            return res.status(404).json({
                message: 'Flight not found.'
            });
        }

        // Check flight status
        if (
            flight.status !== 'scheduled' &&
            flight.status !== 'boarding'
        ) {
            return res.status(400).json({
                message: 'This flight is not available for booking.'
            });
        }

        // Check available seats
        if (flight.availableSeats < passengers) {
            return res.status(400).json({
                message: 'Not enough available seats.'
            });
        }

        // Calculate total price
        const totalPrice = flight.price * passengers;

        // Create booking
        const booking = await Booking.create({
            user: req.user.id,
            flight: flight._id,
            passengers,
            totalPrice,
            status: 'confirmed'
        });

        // Reduce available seats
        flight.availableSeats -= passengers;

        await flight.save();

        res.status(201).json({
            message: 'Booking created successfully.',
            booking
        });

    } catch (error) {
        console.error('Create booking error:', error);

        res.status(500).json({
            message: 'Server error.'
        });
    }
};

// Get My Bookings
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            user: req.user.id
        })
            .populate('flight')
            .sort({ createdAt: -1 });

        res.status(200).json({
            bookings
        });

    } catch (error) {
        console.error('Get my bookings error:', error);

        res.status(500).json({
            message: 'Server error.'
        });
    }
};

// Get Booking By ID
const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findById(id)
            .populate('flight');

        // Check if booking exists
        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found.'
            });
        }

        // Check if booking belongs to logged-in user
        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'Access denied. You can only view your own booking.'
            });
        }

        res.status(200).json({
            booking
        });

    } catch (error) {
        console.error('Get booking error:', error);

        res.status(500).json({
            message: 'Server error.'
        });
    }
};

// Cancel Booking
const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;

        // Find booking
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found.'
            });
        }

        // Check if booking belongs to logged-in user
        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'Access denied. You can only cancel your own booking.'
            });
        }

        // Check if already cancelled
        if (booking.status === 'cancelled') {
            return res.status(400).json({
                message: 'Booking is already cancelled.'
            });
        }

        // Find the flight
        const flight = await Flight.findById(booking.flight);

        if (!flight) {
            return res.status(404).json({
                message: 'Flight not found.'
            });
        }

        // Return seats to the flight
        flight.availableSeats += booking.passengers;

        await flight.save();

        // Update booking status
        booking.status = 'cancelled';

        await booking.save();

        res.status(200).json({
            message: 'Booking cancelled successfully.',
            booking
        });

    } catch (error) {
        console.error('Cancel booking error:', error);

        res.status(500).json({
            message: 'Server error.'
        });
    }
};

// Get All Bookings - Admin
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'firstName lastName email')
            .populate('flight')
            .sort({ createdAt: -1 });

        res.status(200).json({
            bookings
        });

    } catch (error) {
        console.error('Get all bookings error:', error);

        res.status(500).json({
            message: 'Server error.'
        });
    }
};





module.exports = {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,
    getAllBookings
};