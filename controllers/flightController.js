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

        // Validate dates
        const departure = new Date(departureDate);
        const arrival = new Date(arrivalDate);

        if (
            isNaN(departure.getTime()) ||
            isNaN(arrival.getTime())
        ) {
            return res.status(400).json({
                message: 'Please provide valid departure and arrival dates.'
            });
        }

        if (arrival <= departure) {
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

// Generate seat numbers
const seats = [];

for (let row = 1; row <= Math.ceil(availableSeats / 6); row++) {
    for (const letter of ['A', 'B', 'C', 'D', 'E', 'F']) {

        if (seats.length < availableSeats) {
            seats.push(`${row}${letter}`);
        }

    }
}

// Create flight
const flight = await Flight.create({
    flightNumber,
    origin,
    destination,
    departureDate: departure,
    arrivalDate: arrival,
    price,
    availableSeats,
    seats
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

            if (!flightNumber) {
                return res.status(400).json({
                    message: 'Flight number cannot be empty.'
                });
            }
        }

        if (origin !== undefined) {
            origin = origin.trim();

            if (!origin) {
                return res.status(400).json({
                    message: 'Origin cannot be empty.'
                });
            }
        }

        if (destination !== undefined) {
            destination = destination.trim();

            if (!destination) {
                return res.status(400).json({
                    message: 'Destination cannot be empty.'
                });
            }
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
            departureDate !== undefined
                ? new Date(departureDate)
                : flight.departureDate;

        const finalArrivalDate =
            arrivalDate !== undefined
                ? new Date(arrivalDate)
                : flight.arrivalDate;

        // Validate dates
        if (
            isNaN(finalDepartureDate.getTime()) ||
            isNaN(finalArrivalDate.getTime())
        ) {
            return res.status(400).json({
                message: 'Please provide valid departure and arrival dates.'
            });
        }

        if (finalArrivalDate <= finalDepartureDate) {
            return res.status(400).json({
                message: 'Arrival date must be after departure date.'
            });
        }

        // Validate status
        const validStatuses = [
            'scheduled',
            'boarding',
            'departed',
            'arrived',
            'cancelled'
        ];

        if (
            status !== undefined &&
            !validStatuses.includes(status)
        ) {
            return res.status(400).json({
                message: 'Invalid flight status.'
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
            finalDepartureDate;

        flight.arrivalDate =
            finalArrivalDate;

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

// CANCEL FLIGHT - ADMIN
const cancelFlight = async (req, res) => {
    try {
        const { id } = req.params;
        const { cancellationReason } = req.body;

        if (!cancellationReason || !cancellationReason.trim()) {
            return res.status(400).json({
                message: 'Cancellation reason is required.'
            });
        }

        const flight = await Flight.findById(id);

        if (!flight) {
            return res.status(404).json({
                message: 'Flight not found.'
            });
        }

        if (flight.status === 'cancelled') {
            return res.status(400).json({
                message: 'Flight is already cancelled.'
            });
        }

        if (
            flight.status === 'departed' ||
            flight.status === 'arrived'
        ) {
            return res.status(400).json({
                message: 'This flight can no longer be cancelled.'
            });
        }

        const bookings = await Booking.find({
            flight: flight._id,
            status: 'confirmed'
        });

        let totalRestoredSeats = 0;

        for (const booking of bookings) {
            booking.status = 'cancelled';
            totalRestoredSeats += booking.passengers;
            await booking.save();
        }

        flight.status = 'cancelled';
        flight.cancellationReason = cancellationReason.trim();

        flight.reservedSeats = [];

        flight.availableSeats += totalRestoredSeats;

        await flight.save();

        res.status(200).json({
            message: 'Flight cancelled successfully.',
            flight,
            cancelledBookings: bookings.length
        });

    } catch (error) {
        console.error('Cancel flight error:', error);

        res.status(500).json({
            message: 'Failed to cancel flight.',
            error: error.message
        });
    }
};



// Export Controllers
module.exports = {
    createFlight,
    getFlights,
    getFlightById,
    updateFlight,
    deleteFlight,
    cancelFlight
};