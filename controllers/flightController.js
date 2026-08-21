const Flight = require('../models/Flight');

// Create Flight
const createFlight = async (req, res) => {
    try {
        const {
            flightNumber,
            origin,
            destination,
            departureDate,
            arrivalDate,
            price,
            availableSeats
        } = req.body;

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

        // Check if flight number already exists
        const existingFlight = await Flight.findOne({ flightNumber });

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
        const flights = await Flight.find();

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

        const {
            flightNumber,
            origin,
            destination,
            departureDate,
            arrivalDate,
            price,
            availableSeats,
            status
        } = req.body;

        // Check if flight exists
        const flight = await Flight.findById(id);

        if (!flight) {
            return res.status(404).json({
                message: 'Flight not found.'
            });
        }

        // Update fields
        flight.flightNumber = flightNumber ?? flight.flightNumber;
        flight.origin = origin ?? flight.origin;
        flight.destination = destination ?? flight.destination;
        flight.departureDate = departureDate ?? flight.departureDate;
        flight.arrivalDate = arrivalDate ?? flight.arrivalDate;
        flight.price = price ?? flight.price;
        flight.availableSeats = availableSeats ?? flight.availableSeats;
        flight.status = status ?? flight.status;

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

        // Check if flight exists
        const flight = await Flight.findById(id);

        if (!flight) {
            return res.status(404).json({
                message: 'Flight not found.'
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



module.exports = {
    createFlight,
    getFlights,
    getFlightById,
    updateFlight,
    deleteFlight
};