const Inventory = require("../models/Inventory");
const Pizza = require("../models/Pizza");


// =====================================================
// NORMALIZE NAME
// =====================================================

const normalizeName = (value) => {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
};


// =====================================================
// DECREASE NORMAL PIZZA STOCK
// =====================================================

const decreaseNormalPizzaStock = async (
    item,
    session
) => {

    if (
        !item ||
        item.isCustom === true
    ) {
        return;
    }


    if (!item.pizza) {
        throw new Error(
            `Pizza ID missing for "${item.name || "pizza"}".`
        );
    }


    const quantity =
        Number(item.quantity);


    if (
        !Number.isInteger(quantity) ||
        quantity < 1
    ) {
        throw new Error(
            `Invalid quantity for "${item.name || "pizza"}".`
        );
    }


    const pizza =
        await Pizza.findById(
            item.pizza
        ).session(session);


    if (!pizza) {
        throw new Error(
            `Pizza not found: ${item.name || ""}`
        );
    }


    const currentStock =
        Number(pizza.stock || 0);


    if (
        currentStock < quantity
    ) {
        throw new Error(
            `${pizza.name} does not have enough stock. Available: ${currentStock}`
        );
    }


    pizza.stock =
        currentStock - quantity;


    if (
        pizza.stock <= 0
    ) {
        pizza.stock = 0;
        pizza.isAvailable = false;
    }


    await pizza.save({
        session
    });
};


// =====================================================
// DECREASE INVENTORY ITEM
// =====================================================

const decreaseInventoryItem = async (
    name,
    category,
    quantity,
    session
) => {

    if (!name) {
        throw new Error(
            `${category} name is missing.`
        );
    }


    const cleanName =
        normalizeName(name);


    const inventoryItems =
        await Inventory.find({
            category,
            isAvailable: true
        }).session(session);


    const inventoryItem =
        inventoryItems.find(
            item =>
                normalizeName(item.name) ===
                cleanName
        );


    if (!inventoryItem) {
        throw new Error(
            `${category} "${name}" not found in inventory.`
        );
    }


    const currentStock =
        Number(
            inventoryItem.stock || 0
        );


    if (
        currentStock < quantity
    ) {
        throw new Error(
            `${category} "${inventoryItem.name}" does not have enough stock. Available: ${currentStock}`
        );
    }


    inventoryItem.stock =
        currentStock - quantity;


    if (
        inventoryItem.stock <= 0
    ) {
        inventoryItem.stock = 0;
        inventoryItem.isAvailable = false;
    }


    await inventoryItem.save({
        session
    });
};


// =====================================================
// DECREASE CUSTOM PIZZA INVENTORY
// =====================================================

const decreaseCustomPizzaInventory = async (
    item,
    session
) => {

    if (
        !item ||
        item.isCustom !== true
    ) {
        return;
    }


    const quantity =
        Number(item.quantity || 1);


    if (
        !Number.isInteger(quantity) ||
        quantity < 1
    ) {
        throw new Error(
            "Invalid custom pizza quantity."
        );
    }


    const customizations =
        item.customizations || {};


    // =================================================
    // BASE
    // =================================================

    const baseName =
        customizations
            ?.base
            ?.name;


    if (!baseName) {
        throw new Error(
            "Custom pizza base is missing."
        );
    }


    await decreaseInventoryItem(
        baseName,
        "Base",
        quantity,
        session
    );


    // =================================================
    // SAUCE
    // =================================================

    const sauceName =
        customizations
            ?.sauce
            ?.name;


    if (!sauceName) {
        throw new Error(
            "Custom pizza sauce is missing."
        );
    }


    await decreaseInventoryItem(
        sauceName,
        "Sauce",
        quantity,
        session
    );


    // =================================================
    // CHEESE
    // =================================================

    const cheeseName =
        customizations
            ?.cheese
            ?.name;


    if (!cheeseName) {
        throw new Error(
            "Custom pizza cheese is missing."
        );
    }


    // Combined cheese uses TWO inventory items

    if (
        normalizeName(cheeseName) ===
        normalizeName("Mozzarella + Cheddar")
    ) {

        await decreaseInventoryItem(
            "Mozzarella",
            "Cheese",
            quantity,
            session
        );


        await decreaseInventoryItem(
            "Cheddar",
            "Cheese",
            quantity,
            session
        );

    } else {

        await decreaseInventoryItem(
            cheeseName,
            "Cheese",
            quantity,
            session
        );

    }


    // =================================================
    // VEGETABLES
    // =================================================

    const vegetables =
        Array.isArray(
            customizations?.vegetables
        )
            ? customizations.vegetables
            : [];


    for (
        const vegetable
        of vegetables
    ) {

        const vegetableName =
            vegetable?.name;


        if (!vegetableName) {
            continue;
        }


        await decreaseInventoryItem(
            vegetableName,
            "Vegetable",
            quantity,
            session
        );
    }
};


// =====================================================
// DECREASE COMPLETE ORDER INVENTORY
// =====================================================

const decreaseOrderInventory = async (
    items,
    session
) => {

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {
        throw new Error(
            "Order items are required."
        );
    }


    for (
        const item
        of items
    ) {

        // Custom Pizza
        if (
            item.isCustom === true
        ) {

            await decreaseCustomPizzaInventory(
                item,
                session
            );

            continue;
        }


        // Normal Pizza
        await decreaseNormalPizzaStock(
            item,
            session
        );
    }
};


module.exports = {
    decreaseOrderInventory,
    decreaseCustomPizzaInventory,
    decreaseNormalPizzaStock,
    decreaseInventoryItem
};