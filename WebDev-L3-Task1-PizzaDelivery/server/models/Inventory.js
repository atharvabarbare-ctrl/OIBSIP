const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },

        category: {
            type: String,
            enum: [
                "Base",
                "Sauce",
                "Cheese",
                "Vegetable"
            ],
            required: true
        },

        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },

        lowStockThreshold: {
            type: Number,
            min: 0,
            default: 5
        },

        lowStockAlertSent: {
            type: Boolean,
            default: false
        },

        unit: {
            type: String,
            default: "units",
            trim: true
        },

        isAvailable: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Inventory",
    inventoryItemSchema
);