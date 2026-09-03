require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const newPassword = "PizzaHub@123";

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const user = await User.findOneAndUpdate(
            { email: "atharva@pizzahub.com" },
            { password: hashedPassword, role: "admin" },
            { returnDocument: "after" }
        );

        if (!user) {
            console.log("❌ User not found.");
        } else {
            console.log("✅ Password reset successfully!");
            console.log("Email:", user.email);
            console.log("Password:", newPassword);
            console.log("Role:", user.role);
        }

        await mongoose.connection.close();

    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
};

resetPassword();
