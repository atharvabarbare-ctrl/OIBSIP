const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50
        },


        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },


        password: {
            type: String,
            required: true,
            minlength: 6
        },


        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer"
        },


        // ========================================
        // EMAIL VERIFICATION
        // ========================================

        emailVerified: {
            type: Boolean,
            default: false
        },


        verificationToken: {
            type: String,
            default: null
        },


        verificationTokenExpires: {
            type: Date,
            default: null
        },


        // ========================================
        // PASSWORD RESET
        // ========================================

        resetPasswordToken: {
            type: String,
            default: null
        },


        resetPasswordExpires: {
            type: Date,
            default: null
        }

    },


    {
        timestamps: true
    }

);


module.exports =
    mongoose.model(
        "User",
        userSchema
    );