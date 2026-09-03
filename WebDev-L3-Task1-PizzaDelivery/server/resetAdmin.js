const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("./config/db");
const User = require("./models/User");

const resetAdmin = async () => {
    try {
        await connectDB();

        const admin = await User.findOne({
            role: "admin"
        });

        if (!admin) {
            console.log("ADMIN NOT FOUND");
            process.exit(1);
        }

        const passwordHash = await bcrypt.hash(
            "pizza@123",
            12
        );

        admin.email =
            "atharvabarbare@gmail.com";

        admin.password =
            passwordHash;

        admin.role =
            "admin";

        admin.emailVerified =
            true;

        admin.verificationToken =
            null;

        admin.verificationTokenExpires =
            null;

        await admin.save();

        const updatedAdmin =
            await User.findById(admin._id);

        const passwordWorks =
            await bcrypt.compare(
                "pizza@123",
                updatedAdmin.password
            );

        console.log(
            "================================"
        );

        console.log(
            "ADMIN UPDATED"
        );

        console.log(
            "Email:",
            updatedAdmin.email
        );

        console.log(
            "Role:",
            updatedAdmin.role
        );

        console.log(
            "Email Verified:",
            updatedAdmin.emailVerified
        );

        console.log(
            "Password Works:",
            passwordWorks
        );

        console.log(
            "================================"
        );

        await mongoose.connection.close();

        process.exit(0);

    } catch (error) {

        console.error(
            "ERROR:",
            error.message
        );

        process.exit(1);
    }
};

resetAdmin();