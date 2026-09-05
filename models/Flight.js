const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema(
    {
    flightNumber: {
    type: String,
    required: true,
    unique: true
    },

    origin: {
        type: String,
        required: true
    },

    destination: {
        type: String,
        required: true
    },

    departureDate: {
        type: Date,
        required: true
    },

    arrivalDate: {
        type: Date,
        required: true
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    // Total number of seats currently available
    availableSeats: {
        type: Number,
        required: true,
        min: 0
    },

    // All seats on the aircraft
    seats: {
        type: [String],
        required: true
    },

    // Seats that have already been booked
    reservedSeats: {
        type: [String],
        default: []
    },

    status: {
    type: String,
    enum: [
        'scheduled',
        'boarding',
        'departed',
        'arrived',
        'cancelled'
    ],
    default: 'scheduled'
    },

    cancellationReason: {
        type: String,
        default: '',
        trim: true
    }

    
},
{
    timestamps: true
}


);

module.exports = mongoose.model('Flight', flightSchema);
