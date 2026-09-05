const express = require("express");

const {
    getMeals,
    createMeal,
    updateMeal,
    deleteMeal
} = require("../controllers/mealController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();


// Get all meals - Public
router.get("/", getMeals);


// Create meal - Admin only
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    createMeal
);


// Update meal - Admin only
router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    updateMeal
);


// Delete meal - Admin only
router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    deleteMeal
);


module.exports = router;