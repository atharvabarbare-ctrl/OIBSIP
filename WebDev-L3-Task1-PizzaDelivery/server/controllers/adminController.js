const User = require("../models/User");
const Pizza = require("../models/Pizza");
const Order = require("../models/Order");


// DASHBOARD STATS
const getDashboardStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalPizzas,
            totalOrders,
            revenueResult,
            pendingOrders
        ] = await Promise.all([
            User.countDocuments(),

            Pizza.countDocuments(),

            Order.countDocuments(),

            Order.aggregate([
                {
                    $match: {
                        status: {
                            $ne: "Cancelled"
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: {
                                $ifNull: [
                                    "$totalAmount",
                                    0
                                ]
                            }
                        }
                    }
                }
            ]),

            Order.countDocuments({
                status: "Pending"
            })
        ]);

        const revenue =
            revenueResult.length > 0
                ? revenueResult[0].total
                : 0;

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalPizzas,
                totalOrders,
                revenue,
                pendingOrders
            }
        });

    } catch (error) {
        console.error(
            "Dashboard stats error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to fetch dashboard statistics."
        });
    }
};


// GET ALL ORDERS
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate(
                "user",
                "name email"
            )
            .populate(
                "items.pizza",
                "name image category"
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
            "Get all orders error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to fetch orders."
        });
    }
};


// GET SINGLE ORDER
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(
            req.params.id
        )
            .populate(
                "user",
                "name email"
            )
            .populate(
                "items.pizza",
                "name image category"
            );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        res.json({
            success: true,
            order
        });

    } catch (error) {
        console.error(
            "Get order error:",
            error
        );

        res.status(400).json({
            success: false,
            message:
                "Invalid order ID."
        });
    }
};


// UPDATE ORDER STATUS
const updateOrderStatus = async (req, res) => {
    try {
        const {
            status
        } = req.body;

        const allowedStatuses = [
            "Pending",
            "Confirmed",
            "Preparing",
            "Out for Delivery",
            "Delivered",
            "Cancelled"
        ];

        if (
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid order status."
            });
        }

        const order =
            await Order.findByIdAndUpdate(
                req.params.id,
                {
                    status
                },
                {
                    new: true,
                    runValidators: true
                }
            )
                .populate(
                    "user",
                    "name email"
                )
                .populate(
                    "items.pizza",
                    "name image category"
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
            message:
                "Order status updated successfully.",
            order
        });

    } catch (error) {
        console.error(
            "Update order status error:",
            error
        );

        res.status(400).json({
            success: false,
            message:
                "Unable to update order status."
        });
    }
};


module.exports = {
    getDashboardStats,
    getAllOrders,
    getOrderById,
    updateOrderStatus
};