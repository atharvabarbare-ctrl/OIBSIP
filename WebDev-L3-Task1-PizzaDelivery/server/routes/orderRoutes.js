const express = require("express");

const {
    createOrder,
    getMyOrders,
    getOrder,
    cancelOrder
} = require("../controllers/orderController");

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();


// Place order
router.post(
    "/",
    protect,
    createOrder
);


// Get logged-in user's orders
router.get(
    "/my-orders",
    protect,
    getMyOrders
);


// Get single order
router.get(
    "/:id",
    protect,
    getOrder
);


// Cancel order
router.put(
    "/:id/cancel",
    protect,
    cancelOrder
);


module.exports = router;
