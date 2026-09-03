const cron = require("node-cron");
const nodemailer = require("nodemailer");

const Inventory = require("../models/Inventory");


/* =====================================================
   EMAIL TRANSPORTER
===================================================== */

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


/* =====================================================
   CHECK LOW STOCK
===================================================== */

const checkLowStock = async () => {

    try {

        const inventory = await Inventory.find();


        if (!inventory || inventory.length === 0) {

            console.log(
                "📦 Low-stock check: inventory is empty."
            );

            return;
        }


        for (const item of inventory) {

            const stock =
                Number(item.stock) || 0;

            const threshold =
                Number(item.lowStockThreshold) || 0;


            /* =========================================
               LOW STOCK
            ========================================= */

            if (
                stock < threshold &&
                !item.lowStockAlertSent
            ) {

                const adminEmail =
                    process.env.ADMIN_EMAIL ||
                    process.env.EMAIL_USER;


                if (!adminEmail) {

                    console.error(
                        "❌ ADMIN_EMAIL / EMAIL_USER missing in .env"
                    );

                    continue;
                }


                const mailOptions = {

                    from:
                        `"PizzaHub Inventory" <${process.env.EMAIL_USER}>`,

                    to:
                        adminEmail,

                    subject:
                        `⚠️ PizzaHub Low Stock Alert: ${item.name}`,

                    text: `
PizzaHub Inventory Alert

Ingredient: ${item.name}
Category: ${item.category}
Current Stock: ${stock} ${item.unit}
Low Stock Threshold: ${threshold} ${item.unit}

Please restock this inventory item.

PizzaHub Admin Panel
                    `.trim(),

                    html: `
                        <div style="
                            font-family: Arial, sans-serif;
                            max-width: 600px;
                            margin: auto;
                            padding: 24px;
                            background: #111;
                            color: #fff;
                            border-radius: 12px;
                        ">

                            <h2>
                                ⚠️ PizzaHub Low Stock Alert
                            </h2>

                            <p>
                                An inventory item has fallen
                                below its configured threshold.
                            </p>

                            <div style="
                                background: #1d1d1d;
                                padding: 18px;
                                border-radius: 10px;
                                margin: 20px 0;
                            ">

                                <p>
                                    <strong>Ingredient:</strong>
                                    ${item.name}
                                </p>

                                <p>
                                    <strong>Category:</strong>
                                    ${item.category}
                                </p>

                                <p>
                                    <strong>Current Stock:</strong>
                                    ${stock} ${item.unit}
                                </p>

                                <p>
                                    <strong>Threshold:</strong>
                                    ${threshold} ${item.unit}
                                </p>

                            </div>

                            <p>
                                Please restock this item from
                                the PizzaHub Admin Panel.
                            </p>

                        </div>
                    `
                };


                try {

                    await transporter.sendMail(
                        mailOptions
                    );


                    item.lowStockAlertSent =
                        true;

                    await item.save();


                    console.log(
                        `⚠️ Low-stock email sent: ${item.name}`
                    );

                } catch (emailError) {

                    console.error(
                        `❌ Failed to send low-stock email for ${item.name}:`,
                        emailError.message
                    );

                }

            }


            /* =========================================
               RESET ALERT AFTER RESTOCK
            ========================================= */

            if (
                stock >= threshold &&
                item.lowStockAlertSent
            ) {

                item.lowStockAlertSent =
                    false;

                await item.save();


                console.log(
                    `✅ Low-stock alert reset: ${item.name}`
                );
            }

        }

    } catch (error) {

        console.error(
            "❌ Low-stock monitor error:",
            error
        );

    }

};


/* =====================================================
   START LOW-STOCK MONITOR
===================================================== */

const startLowStockMonitor = () => {

    console.log(
        "📦 Low-stock monitor started."
    );


    /*
     * Check immediately when server starts.
     */

    checkLowStock();


    /*
     * Check every 5 minutes.
     */

    cron.schedule(
        "*/5 * * * *",
        async () => {

            console.log(
                "🔎 Running scheduled low-stock check..."
            );

            await checkLowStock();

        }
    );

};


module.exports = {
    checkLowStock,
    startLowStockMonitor
};