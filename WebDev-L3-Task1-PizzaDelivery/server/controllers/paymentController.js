const crypto = require("crypto");
const mongoose = require("mongoose");

const razorpay = require("../services/razorpayService");
const Pizza = require("../models/Pizza");
const Order = require("../models/Order");
const Inventory = require("../models/Inventory");


// =====================================================
// CUSTOM PIZZA CONFIGURATION
// =====================================================

const CUSTOM_PIZZA_PRICES = {

    sizes: {
        Small: 149,
        Medium: 199,
        Large: 249
    },

    bases: {
        "Classic Hand Tossed": 40,
        "Thin Crust": 50,
        "Cheese Burst": 80
    },

    sauces: {
        "Classic Tomato": 20,
        "Spicy Peri Peri": 30,
        "Creamy Garlic": 35
    },

    cheeses: {
        "Mozzarella": 40,
        "Cheddar": 50,
        "Mozzarella + Cheddar": 70
    },

    vegetables: {
        Onion: 15,
        Capsicum: 15,
        "Sweet Corn": 20,
        Mushroom: 25,
        Jalapeno: 20,
        Olives: 25
    }

};


// =====================================================
// DELIVERY FEE
// =====================================================

const DELIVERY_FEE = 40;


// =====================================================
// NORMALIZE NAME
// =====================================================

const normalizeName = (value) => {

    if (
        typeof value !== "string"
    ) {
        return "";
    }

    return value
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();

};


// =====================================================
// GET NAME
// =====================================================

const getName = (value) => {

    if (
        typeof value === "string"
    ) {

        return value
            .trim()
            .replace(/\s+/g, " ");

    }


    if (
        value &&
        typeof value === "object"
    ) {

        if (
            typeof value.name === "string"
        ) {

            return value.name
                .trim()
                .replace(/\s+/g, " ");

        }

    }


    return "";

};


// =====================================================
// GET SELECTION NAME
// =====================================================
// Accepts:
// "Classic Hand Tossed"
// { name: "Classic Hand Tossed" }
// { label: "Classic Hand Tossed" }
// { value: "Classic Hand Tossed" }
// { title: "Classic Hand Tossed" }

const getSelectionName = (value) => {

    if (
        typeof value === "string"
    ) {

        return value.trim();

    }


    if (
        value &&
        typeof value === "object"
    ) {

        const candidates = [

            value.name,

            value.label,

            value.value,

            value.title

        ];


        for (
            const candidate
            of candidates
        ) {

            if (
                typeof candidate === "string" &&
                candidate.trim()
            ) {

                return candidate.trim();

            }

        }

    }


    return "";

};


// =====================================================
// CHECK CUSTOM PIZZA
// =====================================================

const isCustomPizza = (
    item
) => {

    return (

        item?.isCustom === true

        ||

        String(
            item?.pizza || ""
        )
            .toLowerCase()
            .startsWith("custom-")

    );

};


// =====================================================
// GET CONFIGURED PRICE
// =====================================================

const getConfiguredPrice = (
    priceMap,
    name
) => {

    if (
        !priceMap ||
        !name
    ) {

        return undefined;

    }


    const cleanName =
        normalizeName(
            name
        );


    const key =
        Object.keys(
            priceMap
        )
            .find(
                item =>
                    normalizeName(
                        item
                    ) === cleanName
            );


    if (
        key === undefined
    ) {

        return undefined;

    }


    return {

        name: key,

        price:
            Number(
                priceMap[key]
            )

    };

};


// =====================================================
// FIND INVENTORY ITEM
// =====================================================

const findInventoryItem = async (
    name,
    category
) => {

    const cleanName =
        getName(
            name
        );


    if (
        !cleanName
    ) {

        throw new Error(
            `Invalid ${category.toLowerCase()} selection.`
        );

    }


    const inventoryItems =
        await Inventory.find({

            category,

            isAvailable: true

        });


    const inventoryItem =
        inventoryItems.find(
            item =>
                normalizeName(
                    item.name
                ) ===
                normalizeName(
                    cleanName
                )
        );


    if (
        !inventoryItem
    ) {

        throw new Error(
            `${category} "${cleanName}" is not configured in inventory.`
        );

    }


    if (
        Number(
            inventoryItem.stock
        ) <= 0
    ) {

        throw new Error(
            `${category} "${inventoryItem.name}" is out of stock.`
        );

    }


    return inventoryItem;

};


// =====================================================
// VALIDATE NORMAL PIZZA
// =====================================================

const validateNormalPizza = async (
    item
) => {

    if (
        !item ||
        !item.pizza
    ) {

        throw new Error(
            "Invalid pizza."
        );

    }


    const pizza =
        await Pizza.findById(
            item.pizza
        );


    if (
        !pizza
    ) {

        throw new Error(
            `Pizza not found: ${item.name || ""}`
        );

    }


    if (
        pizza.isAvailable === false
    ) {

        throw new Error(
            `${pizza.name} is currently unavailable.`
        );

    }


    const selectedSize =
        Array.isArray(
            pizza.sizes
        )
            ? pizza.sizes.find(
                size =>
                    normalizeName(
                        size.name
                    ) ===
                    normalizeName(
                        item.size?.name
                    )
            )
            : null;


    if (
        !selectedSize
    ) {

        throw new Error(
            `Invalid size for ${pizza.name}.`
        );

    }


    const quantity =
        Number(
            item.quantity
        );


    if (
        !Number.isInteger(
            quantity
        ) ||
        quantity < 1
    ) {

        throw new Error(
            "Invalid quantity."
        );

    }


    return {

        pizza:
            pizza._id,

        isCustom:
            false,

        name:
            pizza.name,

        image:
            pizza.image || "",

        size: {

            name:
                selectedSize.name,

            price:
                Number(
                    selectedSize.price
                )

        },

        quantity,

        itemTotal:
            Number(
                selectedSize.price
            ) *
            quantity

    };

};


// =====================================================
// VALIDATE CUSTOM PIZZA
// =====================================================

const validateCustomPizza = async (
    item
) => {

    const customizations =
        item?.customizations || {};


    // =================================================
    // BASE
    // =================================================

    const baseValue =
        customizations?.base ??
        item?.base ??
        item?.baseName ??
        "";


    const baseName =
        getSelectionName(
            baseValue
        );


    if (
        !baseName
    ) {

        throw new Error(
            "Invalid custom pizza base: base name missing."
        );

    }


    const baseConfig =
        getConfiguredPrice(
            CUSTOM_PIZZA_PRICES.bases,
            baseName
        );


    if (
        !baseConfig
    ) {

        throw new Error(
            `Invalid custom pizza base: "${baseName}".`
        );

    }


    const baseInventory =
        await findInventoryItem(
            baseConfig.name,
            "Base"
        );


    // =================================================
    // SAUCE
    // =================================================

    const sauceValue =
        customizations?.sauce ??
        item?.sauce ??
        item?.sauceName ??
        "";


    const sauceName =
        getSelectionName(
            sauceValue
        );


    if (
        !sauceName
    ) {

        throw new Error(
            "Invalid custom pizza sauce."
        );

    }


    const sauceConfig =
        getConfiguredPrice(
            CUSTOM_PIZZA_PRICES.sauces,
            sauceName
        );


    if (
        !sauceConfig
    ) {

        throw new Error(
            `Invalid custom pizza sauce: "${sauceName}".`
        );

    }


    const sauceInventory =
        await findInventoryItem(
            sauceConfig.name,
            "Sauce"
        );


    // =================================================
    // CHEESE
    // =================================================

    const cheeseValue =
        customizations?.cheese ??
        item?.cheese ??
        item?.cheeseName ??
        "";


    const cheeseName =
        getSelectionName(
            cheeseValue
        );


    if (
        !cheeseName
    ) {

        throw new Error(
            "Invalid custom pizza cheese."
        );

    }


    const cheeseConfig =
        getConfiguredPrice(
            CUSTOM_PIZZA_PRICES.cheeses,
            cheeseName
        );


    if (
        !cheeseConfig
    ) {

        throw new Error(
            `Invalid custom pizza cheese: "${cheeseName}".`
        );

    }


    const cheeseInventory =
        await findInventoryItem(
            cheeseConfig.name,
            "Cheese"
        );


    // =================================================
    // SIZE
    // =================================================

    const sizeValue =
        item?.size ??
        item?.selectedSize ??
        customizations?.size ??
        "";


    const sizeName =
        getSelectionName(
            sizeValue
        );


    if (
        !sizeName
    ) {

        throw new Error(
            "Invalid custom pizza size."
        );

    }


    const sizeConfig =
        getConfiguredPrice(
            CUSTOM_PIZZA_PRICES.sizes,
            sizeName
        );


    if (
        !sizeConfig
    ) {

        throw new Error(
            `Invalid custom pizza size: "${sizeName}".`
        );

    }


    // =================================================
    // QUANTITY
    // =================================================

    const quantity =
        Number(
            item.quantity
        );


    if (
        !Number.isInteger(
            quantity
        ) ||
        quantity < 1
    ) {

        throw new Error(
            "Invalid quantity."
        );

    }


    // =================================================
    // VEGETABLES
    // =================================================

    const vegetableValues =
        Array.isArray(
            customizations?.vegetables
        )
            ? customizations.vegetables
            : [];


    const validatedVegetables = [];


    let vegetablesTotal = 0;


    for (
        const vegetable
        of vegetableValues
    ) {

        const vegetableName =
            getSelectionName(
                vegetable
            );


        if (
            !vegetableName
        ) {

            continue;

        }


        const vegetableConfig =
            getConfiguredPrice(
                CUSTOM_PIZZA_PRICES.vegetables,
                vegetableName
            );


        if (
            !vegetableConfig
        ) {

            throw new Error(
                `Invalid custom pizza vegetable: "${vegetableName}".`
            );

        }


        const vegetableInventory =
            await findInventoryItem(
                vegetableConfig.name,
                "Vegetable"
            );


        vegetablesTotal +=
            vegetableConfig.price;


        validatedVegetables.push({

            name:
                vegetableInventory.name,

            price:
                vegetableConfig.price

        });

    }


    // =================================================
    // FINAL CUSTOM PIZZA PRICE
    // =================================================

    const customPizzaPrice =

        sizeConfig.price

        +

        baseConfig.price

        +

        sauceConfig.price

        +

        cheeseConfig.price

        +

        vegetablesTotal;


    // =================================================
    // RETURN VALIDATED ITEM
    // =================================================

    return {

        pizza:
            null,

        isCustom:
            true,

        name:
            "Custom Pizza",

        image:
            item.image || "",

        size: {

            name:
                sizeConfig.name,

            price:
                sizeConfig.price

        },

        quantity,

        customizations: {

            base: {

                name:
                    baseInventory.name,

                price:
                    baseConfig.price

            },

            sauce: {

                name:
                    sauceInventory.name,

                price:
                    sauceConfig.price

            },

            cheese: {

                name:
                    cheeseInventory.name,

                price:
                    cheeseConfig.price

            },

            vegetables:
                validatedVegetables

        },

        itemTotal:
            customPizzaPrice *
            quantity

    };

};
// =====================================================
// VALIDATE ALL ORDER ITEMS
// =====================================================

const validateOrderItems = async (
    items
) => {

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        throw new Error(
            "Order must contain at least one item."
        );

    }


    const validatedItems = [];


    for (
        const item
        of items
    ) {

        if (
            !item
        ) {

            throw new Error(
                "Invalid order item."
            );

        }


        // =============================================
        // CUSTOM PIZZA
        // =============================================

        if (
            isCustomPizza(item)
        ) {

            const validatedCustomPizza =
                await validateCustomPizza(
                    item
                );


            validatedItems.push(
                validatedCustomPizza
            );


            continue;

        }


        // =============================================
        // NORMAL PIZZA
        // =============================================

        const validatedNormalPizza =
            await validateNormalPizza(
                item
            );


        validatedItems.push(
            validatedNormalPizza
        );

    }


    return validatedItems;

};


// =====================================================
// CALCULATE SUBTOTAL
// =====================================================

const calculateSubtotal = (
    items
) => {

    return items.reduce(
        (
            total,
            item
        ) => {

            return (
                total +
                Number(
                    item.itemTotal || 0
                )
            );

        },
        0
    );

};


// =====================================================
// CALCULATE TOTAL
// =====================================================

const calculateTotal = (
    subtotal
) => {

    return (
        Number(subtotal || 0) +
        DELIVERY_FEE
    );

};


// =====================================================
// CREATE RAZORPAY ORDER
// =====================================================

const createRazorpayOrder = async (
    req,
    res
) => {

    try {

        const {
            items,
            deliveryAddress
        } = req.body;


        // =============================================
        // VALIDATE ITEMS
        // =============================================

        const validatedItems =
            await validateOrderItems(
                items
            );


        // =============================================
        // CALCULATE SUBTOTAL
        // =============================================

        const subtotal =
            calculateSubtotal(
                validatedItems
            );


        // =============================================
        // CALCULATE TOTAL
        // =============================================

        const total =
            calculateTotal(
                subtotal
            );


        // =============================================
        // VALIDATE TOTAL
        // =============================================

        if (
            !Number.isFinite(total) ||
            total <= 0
        ) {

            throw new Error(
                "Invalid order total."
            );

        }


        // =============================================
        // CREATE RAZORPAY ORDER
        // =============================================

        const razorpayOrder =
            await razorpay.orders.create({

                amount:
                    Math.round(
                        total * 100
                    ),

                currency:
                    "INR",

                receipt:
                    `pizzahub_${Date.now()}`,

                notes: {

                    userId:
                        String(
                            req.user?._id ||
                            req.user?.id ||
                            ""
                        )

                }

            });


        // =============================================
        // RESPONSE
        // =============================================

        return res.status(200).json({
            success: true,

            razorpayOrderId: razorpayOrder.id,

            amount: razorpayOrder.amount,

            currency: razorpayOrder.currency,

            subtotal,

            deliveryFee: DELIVERY_FEE,

            totalAmount: total,

            items: validatedItems,

            deliveryAddress: deliveryAddress || null
        });

    } catch (
    error
    ) {

        console.error(
            "Create Razorpay order error:",
            error
        );


        return res.status(
            400
        ).json({

            success:
                false,

            message:
                error.message ||
                "Unable to create Razorpay order."

        });

    }

};


// =====================================================
// VERIFY RAZORPAY PAYMENT
// =====================================================

const verifyRazorpayPayment = async (
    req,
    res
) => {

    try {

        const {

            razorpay_order_id,

            razorpay_payment_id,

            razorpay_signature,

            items,

            deliveryAddress

        } = req.body;


        // =============================================
        // REQUIRED PAYMENT DATA
        // =============================================

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {

            return res.status(
                400
            ).json({

                success:
                    false,

                message:
                    "Payment verification data is incomplete."

            });

        }


        // =============================================
        // VERIFY SIGNATURE
        // =============================================

        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    `${razorpay_order_id}|${razorpay_payment_id}`
                )
                .digest(
                    "hex"
                );


        const isSignatureValid =
            crypto.timingSafeEqual(

                Buffer.from(
                    generatedSignature
                ),

                Buffer.from(
                    razorpay_signature
                )

            );


        if (
            !isSignatureValid
        ) {

            return res.status(
                400
            ).json({

                success:
                    false,

                message:
                    "Invalid Razorpay payment signature."

            });

        }


        // =============================================
        // VALIDATE ITEMS AGAIN
        // =============================================

        const validatedItems =
            await validateOrderItems(
                items
            );


        // =============================================
        // CALCULATE TOTAL
        // =============================================

        const subtotal =
            calculateSubtotal(
                validatedItems
            );


        const total =
            calculateTotal(
                subtotal
            );


        // =============================================
        // CREATE ORDER
        // =============================================

        const order = await Order.create({

            user: req.user._id,

            items: validatedItems,

            deliveryAddress:
                deliveryAddress || null,

            subtotal,

            deliveryFee:
                DELIVERY_FEE,

            totalAmount:
                total,

            paymentMethod:
                "ONLINE",

            paymentStatus:
                "Paid",

            status:
                "Confirmed",

            razorpayOrderId:
                razorpay_order_id,

            razorpayPaymentId:
                razorpay_payment_id

        });

        // =============================================
        // REDUCE INVENTORY
        // =============================================

        for (
            const item
            of validatedItems
        ) {

            if (
                !item.isCustom
            ) {

                continue;

            }


            const quantity =
                Number(
                    item.quantity
                ) || 1;


            const ingredients = [

                {
                    name:
                        item.customizations
                            ?.base
                            ?.name,

                    category:
                        "Base"
                },

                {
                    name:
                        item.customizations
                            ?.sauce
                            ?.name,

                    category:
                        "Sauce"
                },

                {
                    name:
                        item.customizations
                            ?.cheese
                            ?.name,

                    category:
                        "Cheese"
                }

            ];


            const vegetables =
                Array.isArray(
                    item.customizations
                        ?.vegetables
                )
                    ? item.customizations
                        .vegetables
                    : [];


            for (
                const vegetable
                of vegetables
            ) {

                ingredients.push({

                    name:
                        vegetable.name,

                    category:
                        "Vegetable"

                });

            }


            for (
                const ingredient
                of ingredients
            ) {

                if (
                    !ingredient.name
                ) {

                    continue;

                }


                await Inventory.findOneAndUpdate(

                    {

                        name:
                            ingredient.name,

                        category:
                            ingredient.category,

                        isAvailable:
                            true,

                        stock: {
                            $gte:
                                quantity
                        }

                    },

                    {

                        $inc: {
                            stock:
                                -quantity
                        }

                    }

                );

            }

        }


        // =============================================
        // SUCCESS RESPONSE
        // =============================================

        return res.status(
            200
        ).json({

            success:
                true,

            message:
                "Payment verified and order created successfully.",

            order

        });

    } catch (
    error
    ) {

        console.error(
            "Verify Razorpay payment error:",
            error
        );


        return res.status(
            500
        ).json({

            success:
                false,

            message:
                error.message ||
                "Payment verification failed."

        });

    }

};
// =====================================================
// GET RAZORPAY ORDER
// =====================================================

const getRazorpayOrder = async (
    req,
    res
) => {

    try {

        const {
            orderId
        } = req.params;


        if (
            !orderId
        ) {

            return res.status(
                400
            ).json({

                success:
                    false,

                message:
                    "Razorpay order ID is required."

            });

        }


        const razorpayOrder =
            await razorpay.orders.fetch(
                orderId
            );


        return res.status(
            200
        ).json({

            success:
                true,

            order:
                razorpayOrder

        });

    } catch (
    error
    ) {

        console.error(
            "Get Razorpay order error:",
            error
        );


        return res.status(
            500
        ).json({

            success:
                false,

            message:
                error.message ||
                "Unable to fetch Razorpay order."

        });

    }

};


// =====================================================
// GET USER ORDERS
// =====================================================

const getUserOrders = async (
    req,
    res
) => {

    try {

        const userId =
            req.user?._id;


        if (
            !userId
        ) {

            return res.status(
                401
            ).json({

                success:
                    false,

                message:
                    "User authentication required."

            });

        }


        const orders =
            await Order.find({

                user:
                    userId

            })
                .sort({
                    createdAt:
                        -1
                });


        return res.status(
            200
        ).json({

            success:
                true,

            orders

        });

    } catch (
    error
    ) {

        console.error(
            "Get user orders error:",
            error
        );


        return res.status(
            500
        ).json({

            success:
                false,

            message:
                "Unable to fetch orders."

        });

    }

};


// =====================================================
// GET SINGLE USER ORDER
// =====================================================

const getUserOrderById = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;


        if (
            !id
        ) {

            return res.status(
                400
            ).json({

                success:
                    false,

                message:
                    "Order ID is required."

            });

        }


        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {

            return res.status(
                400
            ).json({

                success:
                    false,

                message:
                    "Invalid order ID."

            });

        }


        const order =
            await Order.findOne({

                _id:
                    id,

                user:
                    req.user._id

            });


        if (
            !order
        ) {

            return res.status(
                404
            ).json({

                success:
                    false,

                message:
                    "Order not found."

            });

        }


        return res.status(
            200
        ).json({

            success:
                true,

            order

        });

    } catch (
    error
    ) {

        console.error(
            "Get user order error:",
            error
        );


        return res.status(
            500
        ).json({

            success:
                false,

            message:
                "Unable to fetch order."

        });

    }

};


// =====================================================
// CANCEL USER ORDER
// =====================================================

const cancelUserOrder = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;


        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {

            return res.status(
                400
            ).json({

                success:
                    false,

                message:
                    "Invalid order ID."

            });

        }


        const order =
            await Order.findOne({

                _id:
                    id,

                user:
                    req.user._id

            });


        if (
            !order
        ) {

            return res.status(
                404
            ).json({

                success:
                    false,

                message:
                    "Order not found."

            });

        }


        if (
            [
                "Delivered",
                "Cancelled"
            ].includes(
                order.orderStatus
            )
        ) {

            return res.status(
                400
            ).json({

                success:
                    false,

                message:
                    `Order cannot be cancelled because it is already ${order.orderStatus}.`

            });

        }


        order.orderStatus =
            "Cancelled";


        await order.save();


        return res.status(
            200
        ).json({

            success:
                true,

            message:
                "Order cancelled successfully.",

            order

        });

    } catch (
    error
    ) {

        console.error(
            "Cancel order error:",
            error
        );


        return res.status(
            500
        ).json({

            success:
                false,

            message:
                "Unable to cancel order."

        });

    }

};


// =====================================================
// ADMIN - GET ALL ORDERS
// =====================================================

const getAllOrders = async (
    req,
    res
) => {

    try {

        const orders =
            await Order.find({})
                .populate(
                    "user",
                    "name email"
                )
                .sort({
                    createdAt:
                        -1
                });


        return res.status(
            200
        ).json({

            success:
                true,

            orders

        });

    } catch (
    error
    ) {

        console.error(
            "Get all orders error:",
            error
        );


        return res.status(
            500
        ).json({

            success:
                false,

            message:
                "Unable to fetch orders."

        });

    }

};


// =====================================================
// ADMIN - UPDATE ORDER STATUS
// =====================================================

const updateOrderStatus = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;


        const {
            orderStatus
        } = req.body;


        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {

            return res.status(
                400
            ).json({

                success:
                    false,

                message:
                    "Invalid order ID."

            });

        }


        const allowedStatuses = [

            "Pending",

            "Confirmed",

            "Preparing",

            "Out for Delivery",

            "Delivered",

            "Cancelled"

        ];


        if (
            !allowedStatuses.includes(
                orderStatus
            )
        ) {

            return res.status(
                400
            ).json({

                success:
                    false,

                message:
                    "Invalid order status."

            });

        }


        const order =
            await Order.findById(
                id
            );


        if (
            !order
        ) {

            return res.status(
                404
            ).json({

                success:
                    false,

                message:
                    "Order not found."

            });

        }


        order.orderStatus =
            orderStatus;


        await order.save();


        return res.status(
            200
        ).json({

            success:
                true,

            message:
                "Order status updated successfully.",

            order

        });

    } catch (
    error
    ) {

        console.error(
            "Update order status error:",
            error
        );


        return res.status(
            500
        ).json({

            success:
                false,

            message:
                "Unable to update order status."

        });

    }

};
// =====================================================
// ADMIN - DELETE ORDER
// =====================================================

const deleteOrder = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;


        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {

            return res.status(
                400
            ).json({

                success:
                    false,

                message:
                    "Invalid order ID."

            });

        }


        const order =
            await Order.findById(
                id
            );


        if (
            !order
        ) {

            return res.status(
                404
            ).json({

                success:
                    false,

                message:
                    "Order not found."

            });

        }


        await Order.findByIdAndDelete(
            id
        );


        return res.status(
            200
        ).json({

            success:
                true,

            message:
                "Order deleted successfully."

        });

    } catch (
    error
    ) {

        console.error(
            "Delete order error:",
            error
        );


        return res.status(
            500
        ).json({

            success:
                false,

            message:
                "Unable to delete order."

        });

    }

};


// =====================================================
// PAYMENT HEALTH CHECK
// =====================================================

const paymentHealthCheck = async (
    req,
    res
) => {

    return res.status(
        200
    ).json({

        success:
            true,

        message:
            "Payment API is working.",

        razorpayConfigured:
            Boolean(
                process.env.RAZORPAY_KEY_ID &&
                process.env.RAZORPAY_KEY_SECRET
            )

    });

};


// =====================================================
// NORMALIZE ORDER ADDRESS
// =====================================================

const normalizeDeliveryAddress = (
    address
) => {

    if (
        !address ||
        typeof address !== "object"
    ) {

        return null;

    }


    return {

        name:
            String(
                address.name || ""
            ).trim(),

        phone:
            String(
                address.phone || ""
            ).trim(),

        address:
            String(
                address.address ||
                address.street ||
                ""
            ).trim(),

        city:
            String(
                address.city || ""
            ).trim(),

        state:
            String(
                address.state || ""
            ).trim(),

        pincode:
            String(
                address.pincode ||
                address.zipCode ||
                ""
            ).trim()

    };

};


// =====================================================
// VALIDATE DELIVERY ADDRESS
// =====================================================

const validateDeliveryAddress = (
    address
) => {

    const normalized =
        normalizeDeliveryAddress(
            address
        );


    if (
        !normalized
    ) {

        throw new Error(
            "Delivery address is required."
        );

    }


    if (
        !normalized.name
    ) {

        throw new Error(
            "Delivery name is required."
        );

    }


    if (
        !normalized.phone
    ) {

        throw new Error(
            "Delivery phone number is required."
        );

    }


    if (
        !normalized.address
    ) {

        throw new Error(
            "Delivery address is required."
        );

    }


    if (
        !normalized.city
    ) {

        throw new Error(
            "Delivery city is required."
        );

    }


    if (
        !normalized.pincode
    ) {

        throw new Error(
            "Delivery pincode is required."
        );

    }


    return normalized;

};


// =====================================================
// CALCULATE ORDER SUMMARY
// =====================================================

const calculateOrderSummary = (
    items
) => {

    const subtotal =
        calculateSubtotal(
            items
        );


    const deliveryFee =
        DELIVERY_FEE;


    const total =
        subtotal +
        deliveryFee;


    return {

        subtotal,

        deliveryFee,

        total

    };

};


// =====================================================
// CREATE PAYMENT ORDER DATA
// =====================================================

const buildPaymentOrderData = (
    razorpayOrder,
    summary
) => {

    return {

        orderId:
            razorpayOrder.id,

        amount:
            razorpayOrder.amount,

        currency:
            razorpayOrder.currency,

        subtotal:
            summary.subtotal,

        deliveryFee:
            summary.deliveryFee,

        total:
            summary.total

    };

};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    createRazorpayOrder,

    verifyRazorpayPayment,

    validateOrderItems,

    validateCustomPizza,

    validateNormalPizza,

    getRazorpayOrder,

    getUserOrders,

    getUserOrderById,

    cancelUserOrder,

    getAllOrders,

    updateOrderStatus,

    deleteOrder,

    paymentHealthCheck

};