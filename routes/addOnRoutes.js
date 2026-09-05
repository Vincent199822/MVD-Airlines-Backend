const express = require("express");

const {
    getAddOns,
    createAddOn,
    updateAddOn,
    deleteAddOn
} = require("../controllers/addOnController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();


// Get all add-ons - Public
router.get("/", getAddOns);


// Create add-on - Admin only
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    createAddOn
);


// Update add-on - Admin only
router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    updateAddOn
);


// Delete add-on - Admin only
router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    deleteAddOn
);


module.exports = router;