const Flight = require('../models/Flight');
const Booking = require('../models/Booking');

// Create Flight
const createFlight = async (req, res) => {
    try {
        let {
            flightNumber,
            origin,
            destination,
            departureDate,
            arrivalDate,
            price,
            availableSeats
        } = req.body;

        // Normalize text values
        flightNumber = flightNumber?.trim().toUpperCase();
        origin = origin?.trim();
        destination = destination?.trim();

        // Check required fields
        if (
            !flightNumber ||
            !origin ||
            !destination ||
            !departureDate ||
            !arrivalDate ||
            price === undefined ||
            availableSeats === undefined
        ) {
            return res.status(400).json({
                message: 'Please provide all required flight information.'
            });
        }

        // Validate price
        if (typeof price !== 'number' || price < 0) {
            return res.status(400).json({
                message: 'Price must be a number greater than or equal to 0.'
            });
        }

        // Validate available seats
        if (
            !Number.isInteger(availableSeats) ||
            availableSeats < 0
        ) {
            return res.status(400).json({
                message: 'Available seats must be a whole number greater than or equal to 0.'
            });
        }

        // Validate flight dates
        if (new Date(arrivalDate) <= new Date(departureDate)) {
            return res.status(400).json({
                message: 'Arrival date must be after departure date.'
            });
        }

        // Check if flight number already exists
        const existingFlight = await Flight.findOne({
            flightNumber
        });

        if (existingFlight) {
            return res.status(400).json({
                message: 'Flight number already exists.'
            });
        }

        // Create flight
        const flight = await Flight.create({
            flightNumber,
            origin,
            destination,
            departureDate,
            arrivalDate,
            price,
            availableSeats
        });

        res.status(201).json({
            message: 'Flight created successfully.',
            flight
        });

    } catch (error) {
        console.error('Create flight error:', error);

        res.status(500).json({
            message: 'Server error.'
        });
    }
};


// Get All Flights
const getFlights = async (req, res) => {
    try {
        const flights = await Flight.find()
            .sort({ departureDate: 1 });

        res.status(200).json({
            flights
        });

    } catch (error) {
        console.error('Get flights error:', error);

        res.status(500).json({
            message: 'Server error.'
        });
    }
};


// Get Flight By ID
const getFlightById = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if ID is valid
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: 'Invalid flight ID.'
            });
        }

        const flight = await Flight.findById(id);

        if (!flight) {
            return res.status(404).json({
                message: 'Flight not found.'
            });
        }

        res.status(200).json({
            flight
        });

    } catch (error) {
        console.error('Get flight error:', error);

        res.status(500).json({
            message: 'Server error.'
        });
    }
};


// Update Flight
const updateFlight = async (req, res) => {
    try {
        const { id } = req.params;

        let {
            flightNumber,
            origin,
            destination,
            departureDate,
            arrivalDate,
            price,
            availableSeats,
            status
        } = req.body;

        // Check if ID is valid
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: 'Invalid flight ID.'
            });
        }

        // Check if flight exists
        const flight = await Flight.findById(id);

        if (!flight) {
            return res.status(404).json({
                message: 'Flight not found.'
            });
        }

        // Normalize text values if provided
        if (flightNumber !== undefined) {
            flightNumber = flightNumber.trim().toUpperCase();
        }

        if (origin !== undefined) {
            origin = origin.trim();
        }

        if (destination !== undefined) {
            destination = destination.trim();
        }

        // Check duplicate flight number
        if (
            flightNumber !== undefined &&
            flightNumber !== flight.flightNumber
        ) {
            const existingFlight = await Flight.findOne({
                flightNumber
            });

            if (existingFlight) {
                return res.status(400).json({
                    message: 'Flight number already exists.'
                });
            }
        }

        // Validate price
        if (
            price !== undefined &&
            (typeof price !== 'number' || price < 0)
        ) {
            return res.status(400).json({
                message: 'Price must be a number greater than or equal to 0.'
            });
        }

        // Validate available seats
        if (
            availableSeats !== undefined &&
            (!Number.isInteger(availableSeats) || availableSeats < 0)
        ) {
            return res.status(400).json({
                message: 'Available seats must be a whole number greater than or equal to 0.'
            });
        }

        // Determine final dates
        const finalDepartureDate =
            departureDate ?? flight.departureDate;

        const finalArrivalDate =
            arrivalDate ?? flight.arrivalDate;

        // Validate flight dates
        if (
            new Date(finalArrivalDate) <=
            new Date(finalDepartureDate)
        ) {
            return res.status(400).json({
                message: 'Arrival date must be after departure date.'
            });
        }

        // Update fields
        flight.flightNumber =
            flightNumber ?? flight.flightNumber;

        flight.origin =
            origin ?? flight.origin;

        flight.destination =
            destination ?? flight.destination;

        flight.departureDate =
            departureDate ?? flight.departureDate;

        flight.arrivalDate =
            arrivalDate ?? flight.arrivalDate;

        flight.price =
            price ?? flight.price;

        flight.availableSeats =
            availableSeats ?? flight.availableSeats;

        flight.status =
            status ?? flight.status;

        // Save changes
        await flight.save();

        res.status(200).json({
            message: 'Flight updated successfully.',
            flight
        });

    } catch (error) {
        console.error('Update flight error:', error);

        res.status(500).json({
            message: 'Server error.'
        });
    }
};


// Delete Flight
const deleteFlight = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if ID is valid
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: 'Invalid flight ID.'
            });
        }

        // Check if flight exists
        const flight = await Flight.findById(id);

        if (!flight) {
            return res.status(404).json({
                message: 'Flight not found.'
            });
        }

        // Check if flight has bookings
        const existingBooking = await Booking.findOne({
            flight: id
        });

        if (existingBooking) {
            return res.status(400).json({
                message: 'This flight cannot be deleted because it has existing bookings.'
            });
        }

        // Delete flight
        await Flight.findByIdAndDelete(id);

        res.status(200).json({
            message: 'Flight deleted successfully.'
        });

    } catch (error) {
        console.error('Delete flight error:', error);

        res.status(500).json({
            message: 'Server error.'
        });
    }
};


// Export Controllers
module.exports = {
    createFlight,
    getFlights,
    getFlightById,
    updateFlight,
    deleteFlight
};