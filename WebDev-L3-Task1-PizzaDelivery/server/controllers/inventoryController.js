const Inventory = require("../models/Inventory");


// =====================================================
// GET ALL INVENTORY
// =====================================================

const getInventory = async (req, res) => {
    try {

        const inventory = await Inventory.find()
            .sort({
                category: 1,
                name: 1
            });

        res.status(200).json({
            success: true,
            inventory
        });

    } catch (error) {

        console.error(
            "Get inventory error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch inventory."
        });

    }
};


// =====================================================
// CREATE INVENTORY ITEM
// =====================================================

const createInventoryItem = async (req, res) => {
    try {

        const {
            name,
            category,
            stock,
            lowStockThreshold,
            unit,
            isAvailable
        } = req.body;


        if (!name || !category) {

            return res.status(400).json({
                success: false,
                message:
                    "Name and category are required."
            });

        }


        const existingItem =
            await Inventory.findOne({
                name: name.trim()
            });


        if (existingItem) {

            return res.status(409).json({
                success: false,
                message:
                    "Inventory item already exists."
            });

        }


        const item =
            await Inventory.create({

                name: name.trim(),

                category,

                stock:
                    Number(stock) || 0,

                lowStockThreshold:
                    Number(lowStockThreshold) || 5,

                unit:
                    unit || "units",

                isAvailable:
                    isAvailable !== undefined
                        ? Boolean(isAvailable)
                        : true

            });


        res.status(201).json({
            success: true,
            message:
                "Inventory item created successfully.",
            item
        });

    } catch (error) {

        console.error(
            "Create inventory item error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to create inventory item."
        });

    }
};


// =====================================================
// UPDATE INVENTORY ITEM
// =====================================================

const updateInventoryItem = async (req, res) => {
    try {

        const {
            name,
            category,
            stock,
            lowStockThreshold,
            unit,
            isAvailable
        } = req.body;


        const item =
            await Inventory.findById(
                req.params.id
            );


        if (!item) {

            return res.status(404).json({
                success: false,
                message:
                    "Inventory item not found."
            });

        }


        if (name !== undefined) {
            item.name =
                name.trim();
        }


        if (category !== undefined) {
            item.category =
                category;
        }


        if (stock !== undefined) {

            const newStock =
                Number(stock);

            if (
                Number.isNaN(newStock) ||
                newStock < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Stock must be a valid non-negative number."
                });

            }

            item.stock =
                newStock;
        }


        if (
            lowStockThreshold !== undefined
        ) {

            const threshold =
                Number(
                    lowStockThreshold
                );

            if (
                Number.isNaN(threshold) ||
                threshold < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Low-stock threshold must be valid."
                });

            }

            item.lowStockThreshold =
                threshold;
        }


        if (unit !== undefined) {
            item.unit =
                unit;
        }


        if (
            isAvailable !== undefined
        ) {

            item.isAvailable =
                Boolean(isAvailable);

        }


        await item.save();


        res.status(200).json({
            success: true,
            message:
                "Inventory updated successfully.",
            item
        });

    } catch (error) {

        console.error(
            "Update inventory error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to update inventory."
        });

    }
};


// =====================================================
// DELETE INVENTORY ITEM
// =====================================================

const deleteInventoryItem = async (req, res) => {
    try {

        const item =
            await Inventory.findByIdAndDelete(
                req.params.id
            );


        if (!item) {

            return res.status(404).json({
                success: false,
                message:
                    "Inventory item not found."
            });

        }


        res.status(200).json({
            success: true,
            message:
                "Inventory item deleted successfully."
        });

    } catch (error) {

        console.error(
            "Delete inventory error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to delete inventory item."
        });

    }
};


module.exports = {
    getInventory,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
};