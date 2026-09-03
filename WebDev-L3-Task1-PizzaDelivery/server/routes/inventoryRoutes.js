const express = require("express");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

const {
    getInventory,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
} = require("../controllers/inventoryController");

const router = express.Router();


// =====================================================
// PUBLIC
// Customers need this for Pizza Builder
// =====================================================

router.get(
    "/",
    getInventory
);


// =====================================================
// ADMIN ONLY
// Inventory management
// =====================================================

router.post(
    "/",
    protect,
    adminOnly,
    createInventoryItem
);


router.put(
    "/:id",
    protect,
    adminOnly,
    updateInventoryItem
);


router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteInventoryItem
);


module.exports = router;