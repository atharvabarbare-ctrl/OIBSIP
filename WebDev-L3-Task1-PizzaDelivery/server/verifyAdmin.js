require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

const verifyAdmin = async () => {

    try {

        await mongoose.connect(
            process.env.MONGO_URI
        );

        const user =
            await User.findOneAndUpdate(

                {
                    email: "atharva@pizzahub.com"
                },

                {
                    role: "admin",
                    emailVerified: true
                },

                {
                    returnDocument: "after"
                }

            );

        if (!user) {

            console.log("❌ Admin user not found.");

        } else {

            console.log("✅ Admin verified successfully!");
            console.log("Email:", user.email);
            console.log("Role:", user.role);
            console.log(
                "Email Verified:",
                user.emailVerified
            );

        }

        await mongoose.connection.close();

    } catch (error) {

        console.error(
            "❌ Error:",
            error.message
        );

        process.exit(1);

    }

};

verifyAdmin();
