require("dotenv").config();

const mongoose = require("mongoose");
const Pizza = require("./models/Pizza");

async function fixPaneerImage() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        await Pizza.updateOne(
            { name: "Paneer Tikka Fire" },
            {
                $set: {
                    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85"
                }
            }
        );

        console.log("✅ Paneer Tikka Fire image updated.");

        await mongoose.connection.close();
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

fixPaneerImage();
