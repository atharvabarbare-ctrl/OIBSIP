const mongoose = require("mongoose");


/* =====================================================
   CUSTOMIZATION ITEM
===================================================== */

const customizationItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        _id: false
    }
);


/* =====================================================
   ORDER ITEM
===================================================== */

const orderItemSchema = new mongoose.Schema(
    {
        pizza: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pizza",
            default: null
        },

        isCustom: {
            type: Boolean,
            default: false
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        image: {
            type: String,
            default: ""
        },

        size: {
            name: {
                type: String,
                required: true
            },

            price: {
                type: Number,
                required: true,
                min: 0
            }
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        customizations: {
            base: {
                name: {
                    type: String,
                    default: ""
                },

                price: {
                    type: Number,
                    default: 0,
                    min: 0
                }
            },

            sauce: {
                name: {
                    type: String,
                    default: ""
                },

                price: {
                    type: Number,
                    default: 0,
                    min: 0
                }
            },

            cheese: {
                name: {
                    type: String,
                    default: ""
                },

                price: {
                    type: Number,
                    default: 0,
                    min: 0
                }
            },

            vegetables: [
                {
                    name: {
                        type: String,
                        trim: true
                    },

                    price: {
                        type: Number,
                        default: 0,
                        min: 0
                    }
                }
            ]
        }
    },

    { _id: false }
);


/* =====================================================
   ORDER
===================================================== */

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },


        items: {
            type: [orderItemSchema],
            required: true,

            validate: {
                validator: function (items) {
                    return (
                        items &&
                        items.length > 0
                    );
                },

                message:
                    "Order must contain at least one item."
            }
        },


        /* =========================
           DELIVERY ADDRESS
        ========================= */

        deliveryAddress: {

            fullName: {
                type: String,
                required: true,
                trim: true
            },

            phone: {
                type: String,
                required: true,
                trim: true
            },

            address: {
                type: String,
                required: true,
                trim: true
            },

            city: {
                type: String,
                required: true,
                trim: true
            },

            pincode: {
                type: String,
                required: true,
                trim: true
            }

        },


        /* =========================
           PAYMENT
        ========================= */

        paymentMethod: {
            type: String,

            enum: [
                "COD",
                "ONLINE"
            ],

            default: "COD"
        },


        paymentStatus: {
            type: String,

            enum: [
                "Pending",
                "Paid",
                "Failed",
                "Refunded"
            ],

            default: "Pending"
        },


        razorpayOrderId: {
            type: String,
            default: null
        },


        razorpayPaymentId: {
            type: String,
            default: null
        },


        razorpaySignature: {
            type: String,
            default: null
        },


        /* =========================
           AMOUNTS
        ========================= */

        subtotal: {
            type: Number,
            required: true,
            min: 0
        },


        deliveryFee: {
            type: Number,
            default: 40,
            min: 0
        },


        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },


        /* =========================
           STATUS
        ========================= */

        status: {
            type: String,

            enum: [
                "Pending",
                "Confirmed",
                "Preparing",
                "Out for Delivery",
                "Delivered",
                "Cancelled"
            ],

            default: "Pending"
        }

    },
    {
        timestamps: true
    }
);


/* =====================================================
   NORMAL / CUSTOM VALIDATION
===================================================== */

orderSchema.path("items").validate(
    function (items) {

        return items.every((item) => {

            /*
             * Custom Pizza
             */

            if (item.isCustom) {

                return (
                    !item.pizza &&
                    item.customizations &&
                    item.customizations.base &&
                    item.customizations.sauce &&
                    item.customizations.cheese
                );

            }


            /*
             * Normal Pizza
             */

            return !!item.pizza;

        });

    },

    "Invalid order item configuration."
);


module.exports = mongoose.model(
    "Order",
    orderSchema
);