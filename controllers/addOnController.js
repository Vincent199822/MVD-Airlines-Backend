const AddOn = require("../models/AddOn");


// Get all add-ons
async function getAddOns(req, res) {
    try {
        const addOns = await AddOn.find().sort({ name: 1 });

        res.status(200).json({
            addOns
        });

    } catch (error) {
        console.error("Get add-ons error:", error);

        res.status(500).json({
            message: "Failed to get add-ons."
        });
    }
}


// Create add-on - Admin
async function createAddOn(req, res) {
    try {
        const {
            name,
            price,
            description
        } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({
                message: "Add-on name and price are required."
            });
        }

        if (Number(price) < 0) {
            return res.status(400).json({
                message: "Add-on price cannot be negative."
            });
        }

        const existingAddOn = await AddOn.findOne({
            name: name.trim()
        });

        if (existingAddOn) {
            return res.status(409).json({
                message: "Add-on already exists."
            });
        }

        const addOn = await AddOn.create({
            name: name.trim(),
            price: Number(price),
            description: description || ""
        });

        res.status(201).json({
            message: "Add-on created successfully.",
            addOn
        });

    } catch (error) {
        console.error("Create add-on error:", error);

        res.status(500).json({
            message: "Failed to create add-on."
        });
    }
}


// Update add-on - Admin
async function updateAddOn(req, res) {
    try {
        const { id } = req.params;

        const {
            name,
            price,
            description,
            status
        } = req.body;

        const addOn = await AddOn.findById(id);

        if (!addOn) {
            return res.status(404).json({
                message: "Add-on not found."
            });
        }

        if (name !== undefined) {
            addOn.name = name.trim();
        }

        if (price !== undefined) {

            if (Number(price) < 0) {
                return res.status(400).json({
                    message: "Add-on price cannot be negative."
                });
            }

            addOn.price = Number(price);
        }

        if (description !== undefined) {
            addOn.description = description.trim();
        }

        if (status !== undefined) {
            addOn.status = status;
        }

        await addOn.save();

        res.status(200).json({
            message: "Add-on updated successfully.",
            addOn
        });

    } catch (error) {
        console.error("Update add-on error:", error);

        res.status(500).json({
            message: "Failed to update add-on."
        });
    }
}


// Delete add-on - Admin
async function deleteAddOn(req, res) {
    try {
        const { id } = req.params;

        const addOn = await AddOn.findById(id);

        if (!addOn) {
            return res.status(404).json({
                message: "Add-on not found."
            });
        }

        await AddOn.findByIdAndDelete(id);

        res.status(200).json({
            message: "Add-on deleted successfully."
        });

    } catch (error) {
        console.error("Delete add-on error:", error);

        res.status(500).json({
            message: "Failed to delete add-on."
        });
    }
}


module.exports = {
    getAddOns,
    createAddOn,
    updateAddOn,
    deleteAddOn
};