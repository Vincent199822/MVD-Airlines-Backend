const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
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
        required: true
    },

    availableSeats: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ['scheduled', 'boarding', 'departed', 'arrived', 'cancelled'],
        default: 'scheduled'
    }
});

module.exports = mongoose.model('Flight', flightSchema);