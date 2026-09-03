const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const paymentRoutes = require("./routes/paymentRoutes");
const authRoutes = require("./routes/authRoutes");
const pizzaRoutes = require("./routes/pizzaRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");

const {
    startLowStockMonitor
} = require("./services/lowStockMonitor");


const app = express();


const PORT =
    process.env.PORT || 5000;


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(
    express.json()
);


// =====================================================
// BASIC ROUTES
// =====================================================

app.get("/", (req, res) => {

    res.json({

        success: true,

        message:
            "PizzaHub API is running 🍕"

    });

});


app.get("/api/health", (req, res) => {

    res.json({

        success: true,

        service:
            "PizzaHub Backend",

        status:
            "healthy"

    });

});


// =====================================================
// API ROUTES
// =====================================================

app.use(
    "/api/auth",
    authRoutes
);


app.use(
    "/api/pizzas",
    pizzaRoutes
);


app.use(
    "/api/orders",
    orderRoutes
);


app.use(
    "/api/admin",
    adminRoutes
);


app.use(
    "/api/payments",
    paymentRoutes
);


// =====================================================
// INVENTORY ROUTES
// =====================================================

app.use(
    "/api/inventory",
    inventoryRoutes
);


// =====================================================
// START SERVER
// =====================================================

const startServer = async () => {

    try {

        // -------------------------------------------------
        // CONNECT MONGODB
        // -------------------------------------------------

        await connectDB();


        // -------------------------------------------------
        // START LOW STOCK MONITOR
        // -------------------------------------------------

        startLowStockMonitor();


        // -------------------------------------------------
        // START EXPRESS SERVER
        // -------------------------------------------------

        app.listen(
            PORT,
            () => {

                console.log(
                    `🍕 PizzaHub API running on http://localhost:${PORT}`
                );

                console.log(
                    `📦 Inventory API running on http://localhost:${PORT}/api/inventory`
                );

            }
        );

    } catch (error) {

        console.error(
            "❌ Server startup failed:",
            error.message
        );

        process.exit(1);

    }

};


// =====================================================
// RUN SERVER
// =====================================================

startServer();