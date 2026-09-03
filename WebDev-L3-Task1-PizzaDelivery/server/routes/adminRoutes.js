const express = require("express");

const {
    getDashboardStats,
    getAllOrders,
    getOrderById,
    updateOrderStatus
} = require("../controllers/adminController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();


// Dashboard statistics
router.get(
    "/stats",
    protect,
    adminOnly,
    getDashboardStats
);


// All orders
router.get(
    "/orders",
    protect,
    adminOnly,
    getAllOrders
);


// Single order
router.get(
    "/orders/:id",
    protect,
    adminOnly,
    getOrderById
);


// Update order status
router.put(
    "/orders/:id/status",
    protect,
    adminOnly,
    updateOrderStatus
);


module.exports = router;