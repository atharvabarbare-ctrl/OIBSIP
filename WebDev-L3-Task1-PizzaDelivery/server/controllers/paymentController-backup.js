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
// CHECK CUSTOM PIZZA
// =====================================================

const isCustomPizza = (item) => {

    return (
        item?.isCustom === true
        ||
        String(
            item?.pizza || ""
        ).startsWith("custom-")
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
        normalizeName(name);


    const key =
        Object.keys(priceMap)
            .find(
                item =>
                    normalizeName(item) ===
                    cleanName
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
        getName(name);


    if (
        !cleanName
    ) {

        throw new Error(
            `Invalid ${category.toLowerCase()} selection.`
        );

    }


    const inventoryItems =
        await Inventory.find({
            category: category,
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
        Array.isArray(pizza.sizes)
            ? pizza.sizes.find(
                size =>
                    normalizeName(size.name) ===
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
        !Number.isInteger(quantity) ||
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
            ) * quantity

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
    // READ VALUES
    // =================================================

    const baseName =
    getName(
        customizations.base?.name ||
        customizations.base
    );


    const sauceName =
        getName(
            customizations.sauce
        );


    const cheeseName =
        getName(
            customizations.cheese
        );


    const sizeName =
        getName(
            item?.size?.name
        );


    const vegetables =
        Array.isArray(
            customizations.vegetables
        )
            ? customizations.vegetables
            : [];


    // =================================================
    // SIZE
    // =================================================

    const sizeConfig =
        getConfiguredPrice(
            CUSTOM_PIZZA_PRICES.sizes,
            sizeName
        );


    if (
        !sizeConfig
    ) {

        throw new Error(
            `Invalid custom pizza size: ${sizeName || "missing"}`
        );

    }


    // =================================================
    // QUANTITY
    // =================================================

    const quantity =
        Number(
            item?.quantity
        );


    if (
        !Number.isInteger(quantity) ||
        quantity < 1
    ) {

        throw new Error(
            "Invalid quantity."
        );

    }


    // =================================================
    // BASE
    // =================================================

    if (
        !baseName
    ) {

        throw new Error(
            "Invalid custom pizza base."
        );

    }


    const baseConfig =
    getConfiguredPrice(
        CUSTOM_PIZZA_PRICES.bases,
        baseName
    ) || {
        name: baseName,
        price: Number(
            customizations.base?.price
        ) || 0
    };


    if (
        !baseConfig
    ) {

        throw new Error(
            `Invalid custom pizza base: ${baseName}`
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
            `Invalid custom pizza sauce: ${sauceName}`
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
            `Invalid custom pizza cheese: ${cheeseName}`
        );

    }


    // =================================================
    // CHEESE INVENTORY
    // =================================================

    const cheeseInventory = [];


    if (
        normalizeName(
            cheeseConfig.name
        ) ===
        normalizeName(
            "Mozzarella + Cheddar"
        )
    ) {

        const mozzarella =
            await findInventoryItem(
                "Mozzarella",
                "Cheese"
            );


        const cheddar =
            await findInventoryItem(
                "Cheddar",
                "Cheese"
            );


        cheeseInventory.push(
            mozzarella,
            cheddar
        );

    } else {

        const cheese =
            await findInventoryItem(
                cheeseConfig.name,
                "Cheese"
            );


        cheeseInventory.push(
            cheese
        );

    }


    // =================================================
    // VEGETABLES
    // =================================================

    const validatedVegetables = [];

    const selectedVegetables =
        new Set();

    let vegetablesTotal = 0;


    for (
        const vegetable
        of vegetables
    ) {

        const vegetableName =
            getName(
                vegetable
            );


        if (
            !vegetableName
        ) {

            throw new Error(
                "Invalid custom pizza vegetable."
            );

        }


        const duplicateKey =
            normalizeName(
                vegetableName
            );


        if (
            selectedVegetables.has(
                duplicateKey
            )
        ) {

            throw new Error(
                `Duplicate vegetable: ${vegetableName}`
            );

        }


        selectedVegetables.add(
            duplicateKey
        );


        const vegetableConfig =
            getConfiguredPrice(
                CUSTOM_PIZZA_PRICES.vegetables,
                vegetableName
            );


        if (
            !vegetableConfig
        ) {

            throw new Error(
                `Invalid custom pizza vegetable: ${vegetableName}`
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
    // FINAL PRICE
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
    // RETURN CLEAN DATA
    // =================================================

    return {

        pizza:
            null,

        isCustom:
            true,

        name:
            "Custom Pizza",

        image:
            item?.image || "",

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
                    cheeseConfig.name,

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


        const validatedPizza =
            await validateNormalPizza(
                item
            );


        validatedItems.push(
            validatedPizza
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
// NORMALIZE DELIVERY ADDRESS
// =====================================================

const validateDeliveryAddress = (
    deliveryAddress
) => {

    if (
        !deliveryAddress
    ) {

        throw new Error(
            "Delivery address is required."
        );

    }


    const requiredFields = [
        "fullName",
        "phone",
        "address",
        "city",
        "pincode"
    ];


    for (
        const field
        of requiredFields
    ) {

        if (
            !deliveryAddress[field] ||
            !String(
                deliveryAddress[field]
            ).trim()
        ) {

            throw new Error(
                `${field} is required.`
            );

        }

    }


    return {

        fullName:
            String(
                deliveryAddress.fullName
            ).trim(),

        phone:
            String(
                deliveryAddress.phone
            ).trim(),

        address:
            String(
                deliveryAddress.address
            ).trim(),

        city:
            String(
                deliveryAddress.city
            ).trim(),

        pincode:
            String(
                deliveryAddress.pincode
            ).trim()

    };

};


// =====================================================
// DECREASE CUSTOM PIZZA INVENTORY
// =====================================================

const decreaseCustomPizzaInventory = async (
    validatedItems,
    session
) => {

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
                item.quantity || 1
            );


        const inventorySelections = [];


        // BASE
        if (
            item.customizations?.base?.name
        ) {

            inventorySelections.push({

                name:
                    item.customizations.base.name,

                category:
                    "Base"

            });

        }


        // SAUCE
        if (
            item.customizations?.sauce?.name
        ) {

            inventorySelections.push({

                name:
                    item.customizations.sauce.name,

                category:
                    "Sauce"

            });

        }


        // CHEESE
        const cheeseName =
            item.customizations?.cheese?.name;


        if (
            cheeseName
        ) {

            if (
                normalizeName(
                    cheeseName
                ) ===
                normalizeName(
                    "Mozzarella + Cheddar"
                )
            ) {

                inventorySelections.push({

                    name:
                        "Mozzarella",

                    category:
                        "Cheese"

                });


                inventorySelections.push({

                    name:
                        "Cheddar",

                    category:
                        "Cheese"

              });
            } else {

                inventorySelections.push({

                    name:
                        cheeseName,

                    category:
                        "Cheese"

                });

            }

        }


        // VEGETABLES
        const vegetables =
            Array.isArray(
                item.customizations?.vegetables
            )
                ? item.customizations.vegetables
                : [];


        for (
            const vegetable
            of vegetables
        ) {

            if (
                vegetable?.name
            ) {

                inventorySelections.push({

                    name:
                        vegetable.name,

                    category:
                        "Vegetable"

                });

            }

        }


        // UPDATE STOCK
        for (
            const selection
            of inventorySelections
        ) {

            const inventoryItems =
                await Inventory.find({
                    category:
                        selection.category,

                    isAvailable:
                        true
                }).session(
                    session
                );


            const inventoryItem =
                inventoryItems.find(
                    inv =>
                        normalizeName(
                            inv.name
                        ) ===
                        normalizeName(
                            selection.name
                        )
                );


            if (
                !inventoryItem
            ) {

                throw new Error(
                    `${selection.category} "${selection.name}" not found in inventory.`
                );

            }


            const currentStock =
                Number(
                    inventoryItem.stock
                );


            const requiredStock =
                quantity;


            if (
                currentStock <
                requiredStock
            ) {

                throw new Error(
                    `${selection.category} "${inventoryItem.name}" does not have enough stock.`
                );

            }


            inventoryItem.stock =
                currentStock -
                requiredStock;


            if (
                Number(
                    inventoryItem.stock
                ) <= 0
            ) {

                inventoryItem.stock = 0;

            }


            await inventoryItem.save({
                session
            });

        }

    }

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


        // ADDRESS
        const cleanAddress =
            validateDeliveryAddress(
                deliveryAddress
            );


        // ITEMS
        const validatedItems =
            await validateOrderItems(
                items
            );


        // SUBTOTAL
        const subtotal =
            calculateSubtotal(
                validatedItems
            );


        // DELIVERY
        const deliveryFee =
            subtotal >= 500
                ? 0
                : DELIVERY_FEE;


        // TOTAL
        const totalAmount =
            subtotal +
            deliveryFee;


        if (
            totalAmount <= 0
        ) {

            throw new Error(
                "Invalid order amount."
            );

        }


        // =================================================
        // CREATE RAZORPAY ORDER
        // =================================================

        const razorpayOrder =
            await razorpay.orders.create({

                amount:
                    Math.round(
                        totalAmount * 100
                    ),

                currency:
                    "INR",

                receipt:
                    `receipt_${Date.now()}`,

                notes: {

                    userId:
                        String(
                            req.user._id
                        )

                }

            });


        // =================================================
        // CREATE PENDING PIZZAHUB ORDER
        // =================================================

        const order =
            await Order.create({

                user:
                    req.user._id,

                items:
                    validatedItems,

                deliveryAddress:
                    cleanAddress,

                paymentMethod:
                    "ONLINE",

                paymentStatus:
                    "Pending",

                razorpayOrderId:
                    razorpayOrder.id,

                subtotal,

                deliveryFee,

                totalAmount,

                status:
                    "Pending"

            });


        // =================================================
        // RESPONSE
        // =================================================

        return res.status(201).json({

            success:
                true,

            message:
                "Payment order created successfully.",

            orderId:
                order._id,

            razorpayOrderId:
                razorpayOrder.id,

            amount:
                razorpayOrder.amount,

            currency:
                razorpayOrder.currency

        });


    } catch (error) {

        console.error(
            "Create Razorpay order error:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                error.message ||
                "Unable to create payment order."

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

    let session = null;


    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            items,
            deliveryAddress
        } = req.body;


        // =================================================
        // PAYMENT DATA
        // =================================================

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Payment verification data is incomplete."

            });

        }


        // =================================================
        // SIGNATURE
        // =================================================

        if (
            !process.env.RAZORPAY_KEY_SECRET
        ) {

            throw new Error(
                "RAZORPAY_KEY_SECRET is not configured."
            );

        }


        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    `${razorpay_order_id}|${razorpay_payment_id}`
                )
                .digest("hex");


        const receivedBuffer =
            Buffer.from(
                razorpay_signature,
                "utf8"
            );


        const generatedBuffer =
            Buffer.from(
                generatedSignature,
                "utf8"
            );


        if (
            receivedBuffer.length !==
            generatedBuffer.length
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Invalid payment signature."

            });

        }


        const signatureValid =
            crypto.timingSafeEqual(
                receivedBuffer,
                generatedBuffer
            );


        if (
            !signatureValid
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Payment verification failed."

            });

        }


        // =================================================
        // FIND PENDING ORDER
        // =================================================

        const pendingOrder =
            await Order.findOne({

                razorpayOrderId:
                    razorpay_order_id,

                user:
                    req.user._id

            });


        if (
            !pendingOrder
        ) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Pending order not found."

            });

        }


        // =================================================
        // ALREADY PAID
        // =================================================

        if (
            pendingOrder.paymentStatus ===
            "Paid"
        ) {

            return res.status(200).json({

                success:
                    true,

                message:
                    "Payment already verified.",

                order:
                    pendingOrder

            });

        }


        // =================================================
        // VALIDATE REQUEST AGAIN
        // =================================================

        const cleanAddress =
            validateDeliveryAddress(
                deliveryAddress
            );


        const validatedItems =
            await validateOrderItems(
                items
            );


        const subtotal =
            calculateSubtotal(
                validatedItems
            );


        const deliveryFee =
            subtotal >= 500
                ? 0
                : DELIVERY_FEE;


        const totalAmount =
            subtotal +
            deliveryFee;


        // =================================================
        // VERIFY AMOUNT AGAINST PENDING ORDER
        // =================================================

        const storedTotal =
            Number(
                pendingOrder.totalAmount
            );


        if (
            Math.round(
                storedTotal * 100
            ) !==
            Math.round(
                totalAmount * 100
            )
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Order amount mismatch."

            });

        }


        // =================================================
        // TRANSACTION
        // =================================================

        session =
            await mongoose.startSession();


        let updatedOrder;


        await session.withTransaction(
            async () => {

                // =========================================
                // DECREASE CUSTOM INVENTORY
                // =========================================

                await decreaseCustomPizzaInventory(
                    validatedItems,
                    session
                );


                // =========================================
                // UPDATE EXISTING ORDER
                // =========================================

                updatedOrder =
                    await Order.findOneAndUpdate(

                        {
                            _id:
                                pendingOrder._id,

                            user:
                                req.user._id,

                            paymentStatus:
                                "Pending"

                        },

                        {

                            $set: {

                                items:
                                    validatedItems,

                                deliveryAddress:
                                    cleanAddress,

                                paymentMethod:
                                    "ONLINE",

                                paymentStatus:
                                    "Paid",

                                razorpayPaymentId:
                                    razorpay_payment_id,

                                razorpaySignature:
                                    razorpay_signature,

                                subtotal,

                                deliveryFee,

                                totalAmount,

                                status:
                                    "Pending"

                            }

                        },

                        {

                            new:
                                true,

                            session

                        }

                    );


                if (
                    !updatedOrder
                ) {

                    throw new Error(
                        "Order was already processed."
                    );

                }

            }
        );


        // =================================================
        // SUCCESS
        // =================================================

        return res.status(200).json({

            success:
                true,

            message:
                "Payment verified and order confirmed successfully.",

            order:
                updatedOrder

        });


    } catch (error) {

        console.error(
            "Verify Razorpay payment error:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                error.message ||
                "Unable to verify payment."

        });


    } finally {

        if (
            session
        ) {

            await session.endSession();

        }

    }

};


// =====================================================
// FINAL EXPORTS
// =====================================================

module.exports = {

    createRazorpayOrder,

    verifyRazorpayPayment,

    validateOrderItems,

    validateCustomPizza

};