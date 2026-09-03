require("dotenv").config();

const connectDB = require("./config/db");
const Order = require("./models/Order");

const checkRevenue = async () => {
    try {

        await connectDB();

        const orders = await Order.find()
            .select("totalAmount status");

        let revenue = 0;

        for (const order of orders) {

            if (order.status !== "Cancelled") {
                revenue += Number(order.totalAmount) || 0;
            }

        }

        console.log("================================");
        console.log("ORDERS:", orders.length);
        console.log("REVENUE:", revenue);
        console.log("================================");

        process.exit(0);

    } catch (error) {

        console.error("ERROR:", error.message);

        process.exit(1);
    }
};

checkRevenue();
