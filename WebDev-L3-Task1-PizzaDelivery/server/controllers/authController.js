const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const User = require("../models/User");


// ========================================
// JWT TOKEN
// ========================================

const createToken = (user) => {

    return jwt.sign(
        {
            id: user._id,
            role: user.role
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "7d"
        }
    );
};


// ========================================
// EMAIL TRANSPORTER
// ========================================

const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }

});


// ========================================
// REGISTER
// ========================================

const register = async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        // ========================================
        // VALIDATION
        // ========================================

        if (!name || !email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Name, email and password are required."

            });

        }


        if (password.length < 6) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must contain at least 6 characters."

            });

        }


        const normalizedEmail =
            email.toLowerCase().trim();


        // ========================================
        // CHECK EXISTING USER
        // ========================================

        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });


        if (existingUser) {

            if (!existingUser.emailVerified) {

                return res.status(409).json({

                    success: false,

                    message:
                        "Account already exists. Please verify your email."

                });

            }


            return res.status(409).json({

                success: false,

                message:
                    "An account with this email already exists."

            });

        }


        // ========================================
        // HASH PASSWORD
        // ========================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                12
            );


        // ========================================
        // EMAIL VERIFICATION TOKEN
        // ========================================

        const verificationToken =
            crypto
                .randomBytes(32)
                .toString("hex");


        const verificationTokenExpires =
            new Date(
                Date.now() +
                24 * 60 * 60 * 1000
            );


        // ========================================
        // CREATE USER
        // ========================================

        const user =
            await User.create({

                name:
                    name.trim(),

                email:
                    normalizedEmail,

                password:
                    hashedPassword,

                role:
                    "customer",

                emailVerified:
                    false,

                verificationToken,

                verificationTokenExpires

            });


        // ========================================
        // VERIFICATION URL
        // ========================================

        const verificationUrl =
            `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;


        console.log(
            "Verification URL:",
            verificationUrl
        );


        // ========================================
        // SEND VERIFICATION EMAIL
        // ========================================

        await transporter.sendMail({

            from:
                `"PizzaHub 🍕" <${process.env.EMAIL_USER}>`,

            to:
                user.email,

            subject:
                "🍕 Verify your PizzaHub account",

            html: `

                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    padding: 30px;
                    background: #111;
                    color: white;
                    border-radius: 12px;
                ">

                    <h1 style="
                        color: #ff5a3c;
                    ">
                        PizzaHub 🍕
                    </h1>

                    <h2>
                        Welcome, ${user.name}!
                    </h2>

                    <p style="
                        color: #ccc;
                    ">
                        Thanks for creating your PizzaHub account.
                    </p>

                    <p style="
                        color: #ccc;
                    ">
                        Please verify your email address
                        to activate your account.
                    </p>

                    <a
                        href="${verificationUrl}"
                        style="
                            display: inline-block;
                            padding: 14px 24px;
                            background: #ff5a3c;
                            color: white;
                            text-decoration: none;
                            border-radius: 8px;
                            font-weight: bold;
                            margin-top: 15px;
                        "
                    >
                        Verify Email
                    </a>

                    <p style="
                        margin-top: 25px;
                        color: #888;
                        font-size: 13px;
                    ">
                        This verification link expires
                        in 24 hours.
                    </p>

                </div>

            `

        });


        // ========================================
        // SUCCESS
        // ========================================

        return res.status(201).json({

            success: true,

            message:
                "Account created! Please check your email and verify your account."

        });


    } catch (error) {

        console.error(
            "Register error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to create account. Please try again."

        });

    }

};


// ========================================
// VERIFY EMAIL
// ========================================

const verifyEmail = async (req, res) => {

    try {

        const token = req.query.token;


        console.log(
            "================================="
        );

        console.log(
            "EMAIL VERIFICATION REQUEST"
        );

        console.log(
            "Token received:",
            token
        );

        console.log(
            "================================="
        );


        // ========================================
        // TOKEN REQUIRED
        // ========================================

        if (!token) {

            return res.status(400).json({

                success: false,

                message:
                    "Verification token is missing."

            });

        }


        // ========================================
        // FIND USER BY TOKEN
        // ========================================

        const user =
            await User.findOne({
                verificationToken: token
            });


        console.log(
            "User found:",
            user
                ? user.email
                : "NO USER"
        );


        // ========================================
        // USER NOT FOUND
        // ========================================

        if (!user) {

            return res.status(400).json({

                success: false,

                message:
                    "Verification link is invalid or expired."

            });

        }


        // ========================================
        // ALREADY VERIFIED
        // ========================================

        if (user.emailVerified) {

            console.log(
                "ℹ️ EMAIL ALREADY VERIFIED:",
                user.email
            );


            return res.status(200).json({

                success: true,

                alreadyVerified: true,

                message:
                    "Email is already verified. You can login."

            });

        }


        // ========================================
        // CHECK TOKEN EXPIRY
        // ========================================

        if (
            !user.verificationTokenExpires ||
            user.verificationTokenExpires <= new Date()
        ) {

            console.log(
                "❌ VERIFICATION TOKEN EXPIRED"
            );


            return res.status(400).json({

                success: false,

                message:
                    "Verification link is invalid or expired."

            });

        }


        // ========================================
        // VERIFY ACCOUNT
        // ========================================

        user.emailVerified = true;


        /*
         * IMPORTANT
         *
         * DO NOT CLEAR verificationToken here.
         *
         * React/browser can sometimes make the
         * verification request twice.
         *
         * Keeping the token allows the second request
         * to safely receive "already verified".
         *
         * The account is already protected by
         * emailVerified = true.
         */


        await user.save();


        console.log(
            "✅ EMAIL VERIFIED:",
            user.email
        );


        // ========================================
        // SUCCESS
        // ========================================

        return res.status(200).json({

            success: true,

            alreadyVerified: false,

            message:
                "Email verified successfully! You can now login."

        });


    } catch (error) {

        console.error(
            "❌ EMAIL VERIFICATION ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to verify email.",

            error:
                error.message

        });

    }

};

// ========================================
// LOGIN
// ========================================

const login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required."

            });

        }


        const normalizedEmail =
            email.toLowerCase().trim();


        const user =
            await User.findOne({

                email:
                    normalizedEmail

            });


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        // ========================================
        // EMAIL VERIFICATION CHECK
        // ========================================

        if (
            user.role !== "admin" &&
            !user.emailVerified
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Please verify your email before logging in."

            });

        }


        const token =
            createToken(user);


        return res.json({

            success: true,

            message:
                "Login successful.",

            token,

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    user.role

            }

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error while logging in."

        });

    }

};


// ========================================
// FORGOT PASSWORD
// ========================================

const forgotPassword = async (req, res) => {

    try {

        const {
            email
        } = req.body;


        // ========================================
        // VALIDATION
        // ========================================

        if (!email) {

            return res.status(400).json({

                success: false,

                message:
                    "Email is required."

            });

        }


        const normalizedEmail =
            email.toLowerCase().trim();


        // ========================================
        // FIND USER
        // ========================================

        const user =
            await User.findOne({

                email:
                    normalizedEmail

            });


        /*
         IMPORTANT:

         We return the same message whether
         the email exists or not.

         This prevents revealing which emails
         have PizzaHub accounts.
        */

        if (!user) {

            return res.status(200).json({

                success: true,

                message:
                    "If an account exists with this email, a password reset link has been sent."

            });

        }


        // ========================================
        // CREATE RESET TOKEN
        // ========================================

        const resetToken =
            crypto
                .randomBytes(32)
                .toString("hex");


        const resetTokenExpires =
            new Date(
                Date.now() +
                15 * 60 * 1000
            );


        // ========================================
        // SAVE RESET TOKEN
        // ========================================

        user.resetPasswordToken =
            resetToken;

        user.resetPasswordExpires =
            resetTokenExpires;


        await user.save();


        // ========================================
        // RESET URL
        // ========================================

        const resetUrl =
            `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;


        console.log(
            "Password Reset URL:",
            resetUrl
        );


        // ========================================
        // SEND RESET EMAIL
        // ========================================

        await transporter.sendMail({

            from:
                `"PizzaHub 🍕" <${process.env.EMAIL_USER}>`,

            to:
                user.email,

            subject:
                "🔐 Reset your PizzaHub password",

            html: `

                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    padding: 30px;
                    background: #111;
                    color: white;
                    border-radius: 12px;
                ">

                    <h1 style="
                        color: #ff5a3c;
                    ">
                        PizzaHub 🍕
                    </h1>

                    <h2>
                        Password Reset
                    </h2>

                    <p style="
                        color: #ccc;
                    ">
                        Hi ${user.name},
                    </p>

                    <p style="
                        color: #ccc;
                    ">
                        We received a request to reset
                        your PizzaHub password.
                    </p>

                    <a
                        href="${resetUrl}"
                        style="
                            display: inline-block;
                            padding: 14px 24px;
                            background: #ff5a3c;
                            color: white;
                            text-decoration: none;
                            border-radius: 8px;
                            font-weight: bold;
                            margin-top: 15px;
                        "
                    >
                        Reset Password
                    </a>

                    <p style="
                        margin-top: 25px;
                        color: #888;
                        font-size: 13px;
                    ">
                        This reset link expires in 15 minutes.
                    </p>

                    <p style="
                        color: #888;
                        font-size: 13px;
                    ">
                        If you did not request a password reset,
                        you can safely ignore this email.
                    </p>

                </div>

            `

        });


        // ========================================
        // SUCCESS
        // ========================================

        return res.status(200).json({

            success: true,

            message:
                "If an account exists with this email, a password reset link has been sent."

        });


    } catch (error) {

        console.error(
            "Forgot password error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to process password reset request."

        });

    }

};


// ========================================
// RESET PASSWORD
// ========================================

const resetPassword = async (req, res) => {

    try {

        const {
            token,
            password
        } = req.body;


        // ========================================
        // VALIDATION
        // ========================================

        if (!token || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Reset token and new password are required."

            });

        }


        if (password.length < 6) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must contain at least 6 characters."

            });

        }


        // ========================================
        // FIND USER WITH VALID TOKEN
        // ========================================

        const user =
            await User.findOne({

                resetPasswordToken:
                    token,

                resetPasswordExpires: {
                    $gt: new Date()
                }

            });


        if (!user) {

            return res.status(400).json({

                success: false,

                message:
                    "Password reset link is invalid or expired."

            });

        }


        // ========================================
        // HASH NEW PASSWORD
        // ========================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                12
            );


        // ========================================
        // UPDATE PASSWORD
        // ========================================

        user.password =
            hashedPassword;


        // ========================================
        // INVALIDATE RESET TOKEN
        // ========================================

        user.resetPasswordToken =
            null;

        user.resetPasswordExpires =
            null;


        await user.save();


        // ========================================
        // SUCCESS
        // ========================================

        return res.status(200).json({

            success: true,

            message:
                "Password reset successfully. You can now login."

        });


    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to reset password."

        });

    }

};


// ========================================
// CURRENT USER
// ========================================

const getMe = async (req, res) => {

    try {

        const user =
            await User.findById(
                req.user.id
            ).select("-password");


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found."

            });

        }


        return res.json({

            success: true,

            user

        });


    } catch (error) {

        console.error(
            "Get me error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to fetch user profile."

        });

    }

};


// ========================================
// EXPORT
// ========================================

module.exports = {

    register,

    login,

    verifyEmail,

    forgotPassword,

    resetPassword,

    getMe

};