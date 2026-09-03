const mongoose = require("mongoose");

const sizeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            enum: ["Small", "Medium", "Large"],
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    },
    { _id: false }
);

const pizzaSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            enum: ["Classic", "Premium", "Veg", "Non-Veg", "Special"],
            required: true
        },

        image: {
            type: String,
            default: ""
        },

        sizes: {
            type: [sizeSchema],
            required: true
        },

        toppings: {
            type: [String],
            default: []
        },

        basePrice: {
            type: Number,
            required: true,
            min: 0
        },

        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },

        isVeg: {
            type: Boolean,
            default: true
        },

        isAvailable: {
            type: Boolean,
            default: true
        },

        stock: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Pizza", pizzaSchema);
