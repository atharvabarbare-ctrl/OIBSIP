const express = require("express");


const {
    register,
    login,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getMe
} = require("../controllers/authController");


const {
    resendVerification
} = require("../controllers/verificationController");


const {
    protect
} = require("../middleware/authMiddleware");


const router = express.Router();


// ========================================
// REGISTER
// ========================================

router.post(
    "/register",
    register
);


// ========================================
// LOGIN
// ========================================

router.post(
    "/login",
    login
);


// ========================================
// VERIFY EMAIL
// ========================================

router.get(
    "/verify-email",
    verifyEmail
);


// ========================================
// RESEND VERIFICATION
// ========================================

router.post(
    "/resend-verification",
    resendVerification
);


// ========================================
// FORGOT PASSWORD
// ========================================

router.post(
    "/forgot-password",
    forgotPassword
);


// ========================================
// RESET PASSWORD
// ========================================

router.post(
    "/reset-password",
    resetPassword
);


// ========================================
// CURRENT USER
// ========================================

router.get(
    "/me",
    protect,
    getMe
);


module.exports = router;