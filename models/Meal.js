const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        description: {
            type: String,
            default: "",
            trim: true
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Meal", mealSchema);