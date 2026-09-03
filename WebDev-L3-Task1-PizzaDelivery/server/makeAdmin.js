require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

const makeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const user = await User.findOneAndUpdate(
            { email: "atharva@pizzahub.com" },
            { role: "admin" },
            { new: true }
        );

        if (!user) {
            console.log("❌ User not found.");
        } else {
            console.log("👑 Admin access granted!");
            console.log("Email:", user.email);
            console.log("Role:", user.role);
        }

        await mongoose.connection.close();

    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
};

makeAdmin();
