const crypto = require("crypto");
const nodemailer = require("nodemailer");

const User = require("../models/User");


const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }

});


const resendVerification = async (req, res) => {

    try {

        const { email } = req.body;


        // ========================================
        // VALIDATION
        // ========================================

        if (!email) {

            return res.status(400).json({
                success: false,
                message: "Email is required."
            });

        }


        const normalizedEmail =
            email.toLowerCase().trim();


        // ========================================
        // FIND USER
        // ========================================

        const user =
            await User.findOne({
                email: normalizedEmail
            });


        // Don't reveal whether account exists
        if (!user) {

            return res.status(200).json({

                success: true,

                message:
                    "If an unverified account exists with this email, a verification link has been sent."

            });

        }


        // ========================================
        // ALREADY VERIFIED
        // ========================================

        if (user.emailVerified) {

            return res.status(400).json({

                success: false,

                message:
                    "This email is already verified. You can login."

            });

        }


        // ========================================
        // GENERATE NEW TOKEN
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
        // SAVE TOKEN
        // ========================================

        user.verificationToken =
            verificationToken;

        user.verificationTokenExpires =
            verificationTokenExpires;


        await user.save();


        // ========================================
        // VERIFICATION URL
        // ========================================

        const verificationUrl =
            `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;


        console.log(
            "================================="
        );

        console.log(
            "RESEND VERIFICATION EMAIL"
        );

        console.log(
            "Email:",
            user.email
        );

        console.log(
            "Verification URL:",
            verificationUrl
        );

        console.log(
            "================================="
        );


        // ========================================
        // SEND EMAIL
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
                        Verify your email
                    </h2>


                    <p style="
                        color: #ccc;
                    ">
                        You requested a new
                        verification link for your
                        PizzaHub account.
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
                        This verification link
                        expires in 24 hours.
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
                "Verification email sent successfully. Please check your inbox."

        });


    } catch (error) {

        console.error(
            "Resend verification error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to resend verification email."

        });

    }

};


module.exports = {
    resendVerification
};