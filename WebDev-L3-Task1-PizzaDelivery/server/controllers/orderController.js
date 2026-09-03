const mongoose = require("mongoose");
const Order = require("../models/Order");

const {
    decreaseOrderInventory
} = require("../services/orderInventoryService");


// =====================================================
// CREATE ORDER
// =====================================================

const createOrder = async (req, res) => {
    let session;

    try {

        const {
            items,
            deliveryAddress,
            paymentMethod
        } = req.body;


        // =================================================
        // VALIDATE ITEMS
        // =================================================

        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Order must contain at least one item."
            });
        }


        // =================================================
        // VALIDATE ADDRESS
        // =================================================

        if (!deliveryAddress) {
            return res.status(400).json({
                success: false,
                message:
                    "Delivery address is required."
            });
        }


        // =================================================
        // PAYMENT METHOD
        // =================================================

        const finalPaymentMethod =
            paymentMethod || "COD";


        // =================================================
        // CALCULATE SUBTOTAL
        // =================================================

        const subtotal =
            items.reduce(
                (total, item) => {

                    const price =
                        Number(
                            item.size?.price || 0
                        );

                    const quantity =
                        Number(
                            item.quantity || 0
                        );

                    return (
                        total +
                        price * quantity
                    );
                },
                0
            );


        // =================================================
        // DELIVERY FEE
        // =================================================

        const deliveryFee =
            subtotal >= 500
                ? 0
                : 40;


        // =================================================
        // TOTAL
        // =================================================

        const totalAmount =
            subtotal +
            deliveryFee;


        // =================================================
        // START TRANSACTION
        // =================================================

        session =
            await mongoose.startSession();


        let createdOrder;


        await session.withTransaction(
            async () => {

                // =========================================
                // DECREASE STOCK
                // =========================================

                await decreaseOrderInventory(
                    items,
                    session
                );


                // =========================================
                // CREATE ORDER
                // =========================================

                const orders =
                    await Order.create(
                        [
                            {
                                user:
                                    req.user.id,

                                items,

                                deliveryAddress,

                                paymentMethod:
                                    finalPaymentMethod,

                                subtotal,

                                deliveryFee,

                                totalAmount
                            }
                        ],
                        {
                            session
                        }
                    );


                createdOrder =
                    orders[0];
            }
        );


        // =================================================
        // SUCCESS
        // =================================================

        return res.status(201).json({
            success: true,
            message:
                "Order placed successfully.",
            order:
                createdOrder
        });


    } catch (error) {

        console.error(
            "Create order error:",
            error
        );


        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Unable to place order."
        });


    } finally {

        if (session) {
            await session.endSession();
        }

    }
};


// =====================================================
// GET MY ORDERS
// =====================================================

const getMyOrders = async (req, res) => {
    try {

        const orders =
            await Order.find({
                user: req.user.id
            })
                .populate(
                    "items.pizza",
                    "name image"
                )
                .sort({
                    createdAt: -1
                });


        res.json({
            success: true,
            count: orders.length,
            orders
        });


    } catch (error) {

        console.error(
            "Get orders error:",
            error.message
        );


        res.status(500).json({
            success: false,
            message:
                "Unable to fetch orders."
        });

    }
};


// =====================================================
// GET SINGLE ORDER
// =====================================================

const getOrder = async (req, res) => {
    try {

        const order =
            await Order.findOne({
                _id: req.params.id,
                user: req.user.id
            })
                .populate(
                    "items.pizza",
                    "name image"
                );


        if (!order) {

            return res.status(404).json({
                success: false,
                message:
                    "Order not found."
            });

        }


        res.json({
            success: true,
            order
        });


    } catch (error) {

        res.status(400).json({
            success: false,
            message:
                "Invalid order ID."
        });

    }
};


// =====================================================
// CANCEL ORDER
// =====================================================

const cancelOrder = async (req, res) => {
    try {

        const order =
            await Order.findOne({
                _id: req.params.id,
                user: req.user.id
            });


        if (!order) {

            return res.status(404).json({
                success: false,
                message:
                    "Order not found."
            });

        }


        if (
            order.status !== "Pending" &&
            order.status !== "Confirmed"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "This order cannot be cancelled."
            });

        }


        order.status =
            "Cancelled";


        await order.save();


        res.json({
            success: true,
            message:
                "Order cancelled successfully.",
            order
        });


    } catch (error) {

        res.status(400).json({
            success: false,
            message:
                "Invalid order ID."
        });

    }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    createOrder,
    getMyOrders,
    getOrder,
    cancelOrder
};