const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        flight: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Flight',
            required: true
        },

        // Number of passengers
        passengers: {
            type: Number,
            required: true,
            min: 1
        },

        // Selected seat
        seat: {
            type: String,
            required: true
        },

        // Meals - multiple meals can be selected
        meals: [
            {
                name: {
                    type: String,
                    enum: [
                        'Standard Meal',
                        'Vegetarian Meal',
                        'Halal Meal',
                        'Pasta Meal',
                        'Kids Meal'
                    ],
                    required: true
                },

                price: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ],

        // Optional add-ons - multiple can be selected
        addOns: [
            {
                name: {
                    type: String,
                    enum: [
                        'Extra Rice',
                        'Extra Beverage',
                        'Extra Dessert',
                        'Chicken Burger',
                        'Chicken Sandwich'
                    ],
                    required: true
                },

                price: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ],

        // Final booking price
        totalPrice: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: ['confirmed', 'cancelled'],
            default: 'confirmed'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Booking', bookingSchema);