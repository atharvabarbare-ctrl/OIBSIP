const express = require("express");

const {
    createRazorpayOrder,
    verifyRazorpayPayment
} = require("../controllers/paymentController");

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();


// Create Razorpay order
router.post(
    "/create-order",
    protect,
    createRazorpayOrder
);


// Verify Razorpay payment
router.post(
    "/verify",
    protect,
    verifyRazorpayPayment
);


module.exports = router;