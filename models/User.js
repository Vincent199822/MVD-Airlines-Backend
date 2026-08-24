const mongoose = require('mongoose');

/*
    "email": "guest@mail.com",
    "password": "guest1234",

    "email": "admin@mail.com",
    "password": "admin1234",
*/

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true
        },

        lastName: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', userSchema);