const Meal = require("../models/Meal");


// Get all meals
async function getMeals(req, res) {

    try {

        const meals = await Meal.find()
            .sort({ name: 1 });

        res.status(200).json({
            meals
        });

    } catch (error) {

        console.error("Get meals error:", error);

        res.status(500).json({
            message: "Failed to get meals."
        });
    }
}


// Create meal - Admin
async function createMeal(req, res) {

    try {

        const {
            name,
            price,
            description
        } = req.body;

        if (!name || price === undefined) {

            return res.status(400).json({
                message: "Meal name and price are required."
            });
        }

        if (Number(price) < 0) {

            return res.status(400).json({
                message: "Meal price cannot be negative."
            });
        }

        const existingMeal = await Meal.findOne({
            name: name.trim()
        });

        if (existingMeal) {

            return res.status(409).json({
                message: "Meal already exists."
            });
        }

        const meal = await Meal.create({
            name: name.trim(),
            price: Number(price),
            description: description || ""
        });

        res.status(201).json({
            message: "Meal created successfully.",
            meal
        });

    } catch (error) {

        console.error("Create meal error:", error);

        res.status(500).json({
            message: "Failed to create meal."
        });
    }
}


// Update meal - Admin
async function updateMeal(req, res) {

    try {

        const { id } = req.params;

        const {
            name,
            price,
            description,
            status
        } = req.body;

        const meal = await Meal.findById(id);

        if (!meal) {

            return res.status(404).json({
                message: "Meal not found."
            });
        }

        if (name !== undefined) {
            meal.name = name.trim();
        }

        if (price !== undefined) {

            if (Number(price) < 0) {

                return res.status(400).json({
                    message: "Meal price cannot be negative."
                });
            }

            meal.price = Number(price);
        }

        if (description !== undefined) {
            meal.description = description.trim();
        }

        if (status !== undefined) {
            meal.status = status;
        }

        await meal.save();

        res.status(200).json({
            message: "Meal updated successfully.",
            meal
        });

    } catch (error) {

        console.error("Update meal error:", error);

        res.status(500).json({
            message: "Failed to update meal."
        });
    }
}


// Delete meal - Admin
async function deleteMeal(req, res) {

    try {

        const { id } = req.params;

        const meal = await Meal.findById(id);

        if (!meal) {

            return res.status(404).json({
                message: "Meal not found."
            });
        }

        await Meal.findByIdAndDelete(id);

        res.status(200).json({
            message: "Meal deleted successfully."
        });

    } catch (error) {

        console.error("Delete meal error:", error);

        res.status(500).json({
            message: "Failed to delete meal."
        });
    }
}


module.exports = {
    getMeals,
    createMeal,
    updateMeal,
    deleteMeal
};