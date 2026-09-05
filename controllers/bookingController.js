const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const Meal = require('../models/Meal');
const AddOn = require('../models/AddOn');

// ================================
// CREATE BOOKING
// ================================
const createBooking = async (req, res) => {
    try {
        const {
            flightId,
            passengers,
            seat,
            meals,
            addOns
        } = req.body;

        // ================================
        // BASIC VALIDATION
        // ================================
        if (!flightId || !passengers || !seat) {
            return res.status(400).json({
                message: 'Flight, passengers, and seat are required.'
            });
        }

        if (
            !Number.isInteger(passengers) ||
            passengers < 1
        ) {
            return res.status(400).json({
                message: 'Passengers must be a valid number.'
            });
        }

        // At least one meal must be selected
        if (!Array.isArray(meals) || meals.length === 0) {
            return res.status(400).json({
                message: 'Please select at least one meal.'
            });
        }

        // Add-ons are optional
        const selectedAddOns = Array.isArray(addOns)
            ? addOns
            : [];

        // ================================
        // VALIDATE MEALS FROM DATABASE
        // ================================
        const mealDetails = [];

        for (const meal of meals) {

            if (typeof meal !== 'string') {
                return res.status(400).json({
                    message: 'Invalid meal selected.'
                });
            }

            const mealData = await Meal.findOne({
                name: meal,
                status: 'active'
            });

            if (!mealData) {
                return res.status(400).json({
                    message: `Invalid or unavailable meal selected: ${meal}`
                });
            }

            mealDetails.push({
                name: mealData.name,
                price: mealData.price
            });
        }

        // ================================
        // VALIDATE ADD-ONS FROM DATABASE
        // ================================
        const addOnDetails = [];

        for (const addOn of selectedAddOns) {

            if (typeof addOn !== 'string') {
                return res.status(400).json({
                    message: 'Invalid add-on selected.'
                });
            }

            const addOnData = await AddOn.findOne({
                name: addOn,
                status: 'active'
            });

            if (!addOnData) {
                return res.status(400).json({
                    message: `Invalid or unavailable add-on selected: ${addOn}`
                });
            }

            addOnDetails.push({
                name: addOnData.name,
                price: addOnData.price
            });
        }

        // ================================
        // FIND FLIGHT
        // ================================
        const flight = await Flight.findById(flightId);

        if (!flight) {
            return res.status(404).json({
                message: 'Flight not found.'
            });
        }

        // ================================
        // CHECK FLIGHT STATUS
        // ================================
        if (
            flight.status === 'cancelled' ||
            flight.status === 'departed' ||
            flight.status === 'arrived'
        ) {
            return res.status(400).json({
                message: 'This flight is no longer available for booking.'
            });
        }

        // ================================
        // CHECK AVAILABLE SEATS
        // ================================
        if (flight.availableSeats < passengers) {
            return res.status(400).json({
                message: 'Not enough available seats.'
            });
        }

        // ================================
        // CHECK IF SEAT EXISTS
        // ================================
        if (!flight.seats.includes(seat)) {
            return res.status(400).json({
                message: 'Selected seat does not exist.'
            });
        }

        // ================================
        // CHECK IF SEAT IS ALREADY RESERVED
        // ================================
        if (flight.reservedSeats.includes(seat)) {
            return res.status(400).json({
                message: 'Selected seat is already reserved.'
            });
        }

        // ================================
        // CALCULATE MEALS
        // ================================
        const mealsTotal = mealDetails.reduce(
            (total, meal) => total + meal.price,
            0
        );

        // ================================
        // CALCULATE ADD-ONS
        // ================================
        const addOnsTotal = addOnDetails.reduce(
            (total, addOn) => total + addOn.price,
            0
        );

        // ================================
        // TAX
        // ================================
        const tax = 750;

        // ================================
        // CALCULATE FINAL TOTAL
        // ================================
        const totalPrice =
            (flight.price * passengers) +
            (mealsTotal * passengers) +
            (addOnsTotal * passengers) +
            tax;

        // ================================
        // CREATE BOOKING
        // ================================
        const booking = await Booking.create({
            user: req.user.id,
            flight: flightId,
            passengers,
            seat,
            meals: mealDetails,
            addOns: addOnDetails,
            totalPrice,
            status: 'confirmed'
        });

        // ================================
        // RESERVE SEAT
        // ================================
        flight.reservedSeats.push(seat);
        flight.availableSeats -= passengers;

        await flight.save();

        // ================================
        // RESPONSE
        // ================================
        res.status(201).json({
            message: 'Booking created successfully.',
            booking
        });

    } catch (error) {
        console.error('Create booking error:', error);

        res.status(500).json({
            message: 'Failed to create booking.',
            error: error.message
        });
    }
};


// ================================
// GET MY BOOKINGS
// ================================
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
        console.error('Get bookings error:', error);

        res.status(500).json({
            message: 'Failed to get bookings.',
            error: error.message
        });
    }
};


// ================================
// GET BOOKING BY ID
// ================================
const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('flight');

        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found.'
            });
        }

        // Make sure user owns the booking
        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'You are not authorized to view this booking.'
            });
        }

        res.status(200).json({
            booking
        });

    } catch (error) {
        console.error('Get booking by ID error:', error);

        res.status(500).json({
            message: 'Failed to get booking.',
            error: error.message
        });
    }
};


// ================================
// CANCEL BOOKING
// ================================
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found.'
            });
        }

        // Make sure user owns the booking
        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'You are not authorized to cancel this booking.'
            });
        }

        // Already cancelled
        if (booking.status === 'cancelled') {
            return res.status(400).json({
                message: 'Booking is already cancelled.'
            });
        }

        // Find flight
        const flight = await Flight.findById(booking.flight);

        if (!flight) {
            return res.status(404).json({
                message: 'Flight not found.'
            });
        }

        // ================================
        // RETURN SEAT
        // ================================
        flight.reservedSeats =
            flight.reservedSeats.filter(
                reservedSeat => reservedSeat !== booking.seat
            );

        // Return available seat count
        flight.availableSeats += booking.passengers;

        await flight.save();

        // ================================
        // UPDATE BOOKING STATUS
        // ================================
        booking.status = 'cancelled';

        await booking.save();

        res.status(200).json({
            message: 'Booking cancelled successfully.',
            booking
        });

    } catch (error) {
        console.error('Cancel booking error:', error);

        res.status(500).json({
            message: 'Failed to cancel booking.',
            error: error.message
        });
    }
};


// ================================
// DELETE CANCELLED BOOKING
// ================================
const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found.'
            });
        }

        // Make sure user owns the booking
        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'You are not authorized to delete this booking.'
            });
        }

        // Only cancelled bookings can be deleted
        if (booking.status !== 'cancelled') {
            return res.status(400).json({
                message: 'Only cancelled bookings can be deleted.'
            });
        }

        await Booking.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: 'Booking deleted successfully.'
        });

    } catch (error) {
        console.error('Delete booking error:', error);

        res.status(500).json({
            message: 'Failed to delete booking.',
            error: error.message
        });
    }
};


// ================================
// GET ALL BOOKINGS - ADMIN
// ================================
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
            message: 'Failed to get all bookings.',
            error: error.message
        });
    }
};

// CANCEL BOOKING - ADMIN
const adminCancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found.'
            });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({
                message: 'Booking is already cancelled.'
            });
        }

        const flight = await Flight.findById(booking.flight);

        if (!flight) {
            return res.status(404).json({
                message: 'Flight not found.'
            });
        }

        flight.reservedSeats =
            flight.reservedSeats.filter(
                reservedSeat => reservedSeat !== booking.seat
            );

        flight.availableSeats += booking.passengers;

        await flight.save();

        booking.status = 'cancelled';

        await booking.save();

        res.status(200).json({
            message: 'Booking cancelled successfully.',
            booking
        });

    } catch (error) {
        console.error('Admin cancel booking error:', error);

        res.status(500).json({
            message: 'Failed to cancel booking.',
            error: error.message
        });
    }
};


// ================================
// EXPORTS
// ================================
module.exports = {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,
    deleteBooking,
    getAllBookings,
    adminCancelBooking
};