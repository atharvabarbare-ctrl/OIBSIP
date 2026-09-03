import { useEffect, useMemo, useState } from "react";

import {
    Plus,
    Pencil,
    Trash2,
    Package,
    RefreshCw,
    X
} from "lucide-react";

import {
    getInventory,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
} from "../services/api";


const EMPTY_FORM = {
    name: "",
    category: "Base",
    stock: 0,
    lowStockThreshold: 5,
    unit: "units",
    isAvailable: true
};


function InventoryManagement() {

    const [inventory, setInventory] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [toast, setToast] =
        useState(null);

    const [showForm, setShowForm] =
        useState(false);

    const [editingItem, setEditingItem] =
        useState(null);

    const [form, setForm] =
        useState(EMPTY_FORM);


    const token =
        localStorage.getItem("token");


    // =====================================================
    // LOAD INVENTORY
    // =====================================================

    const loadInventory = async () => {

        try {

            setLoading(true);
            setError("");

            const data =
                await getInventory(token);

            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Unable to load inventory."
                );

            }

            setInventory(
                Array.isArray(data.inventory)
                    ? data.inventory
                    : []
            );

        } catch (err) {

            console.error(
                "Inventory loading error:",
                err
            );

            setError(
                err.message ||
                "Unable to load inventory."
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadInventory();

    }, []);


    // =====================================================
    // GROUP INVENTORY
    // =====================================================

    const groupedInventory =
        useMemo(() => {

            const groups = {
                Base: [],
                Sauce: [],
                Cheese: [],
                Vegetable: []
            };

            inventory.forEach(item => {

                if (
                    groups[item.category]
                ) {
                    groups[item.category].push(
                        item
                    );
                }

            });

            return groups;

        }, [inventory]);


    // =====================================================
    // FORM
    // =====================================================

    const openAddForm = () => {

        setEditingItem(null);

        setForm({
            ...EMPTY_FORM
        });

        setError("");

        setShowForm(true);

    };


    const openEditForm = (item) => {

        setEditingItem(item);

        setForm({

            name:
                item.name || "",

            category:
                item.category || "Base",

            stock:
                item.stock ?? 0,

            lowStockThreshold:
                item.lowStockThreshold ?? 5,

            unit:
                item.unit || "units",

            isAvailable:
                item.isAvailable !== false

        });

        setError("");

        setShowForm(true);

    };


    const closeForm = () => {

        if (saving) {
            return;
        }

        setShowForm(false);

        setEditingItem(null);

        setForm({
            ...EMPTY_FORM
        });

        setError("");

    };


    const handleChange = (event) => {

        const {
            name,
            value,
            type,
            checked
        } = event.target;

        setForm(prev => ({

            ...prev,

            [name]:
                type === "checkbox"
                    ? checked
                    : value

        }));

    };


    // =====================================================
    // SAVE
    // =====================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        try {

            setSaving(true);
            setError("");


            const payload = {

                name:
                    form.name.trim(),

                category:
                    form.category,

                stock:
                    Number(form.stock),

                lowStockThreshold:
                    Number(
                        form.lowStockThreshold
                    ),

                unit:
                    form.unit.trim() ||
                    "units",

                isAvailable:
                    form.isAvailable

            };


            if (!payload.name) {

                throw new Error(
                    "Please enter ingredient name."
                );

            }


            if (
                payload.stock < 0 ||
                Number.isNaN(payload.stock)
            ) {

                throw new Error(
                    "Stock must be 0 or greater."
                );

            }


            if (
                payload.lowStockThreshold < 0 ||
                Number.isNaN(
                    payload.lowStockThreshold
                )
            ) {

                throw new Error(
                    "Low-stock threshold is invalid."
                );

            }


            let data;


            if (editingItem) {

                data =
                    await updateInventoryItem(
                        editingItem._id,
                        payload,
                        token
                    );

            } else {

                data =
                    await createInventoryItem(
                        payload,
                        token
                    );

            }


            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Unable to save inventory."
                );

            }


            setToast({

                type: "success",

                message:
                    editingItem
                        ? "Inventory updated successfully."
                        : "Inventory item added successfully."

            });


            closeForm();

            await loadInventory();

        } catch (err) {

            console.error(
                "Inventory save error:",
                err
            );

            setError(
                err.message ||
                "Unable to save inventory."
            );

        } finally {

            setSaving(false);

        }

    };


    // =====================================================
    // DELETE
    // =====================================================

    const handleDelete = async (item) => {

        const confirmed =
            window.confirm(
                `Delete "${item.name}" from inventory?`
            );


        if (!confirmed) {
            return;
        }


        try {

            setError("");

            const data =
                await deleteInventoryItem(
                    item._id,
                    token
                );


            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Unable to delete item."
                );

            }


            setToast({

                type: "success",

                message:
                    `${item.name} deleted successfully.`

            });


            await loadInventory();

        } catch (err) {

            console.error(
                "Inventory delete error:",
                err
            );

            setError(
                err.message ||
                "Unable to delete inventory item."
            );

        }

    };


    // =====================================================
    // QUICK STOCK UPDATE
    // =====================================================

    const updateStock = async (
        item,
        amount
    ) => {

        const newStock =
            Math.max(
                0,
                Number(item.stock || 0) +
                amount
            );


        try {

            setError("");


            const data =
                await updateInventoryItem(
                    item._id,
                    {
                        stock: newStock
                    },
                    token
                );


            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Unable to update stock."
                );

            }


            setInventory(current =>
                current.map(existing =>
                    existing._id === item._id
                        ? {
                            ...existing,
                            stock: newStock
                        }
                        : existing
                )
            );


            setToast({

                type: "success",

                message:
                    `${item.name} stock updated to ${newStock}.`

            });

        } catch (err) {

            console.error(
                "Quick stock update error:",
                err
            );

            setError(
                err.message ||
                "Unable to update stock."
            );

        }

    };


    // =====================================================
    // TOGGLE AVAILABILITY
    // =====================================================

    const toggleAvailability = async (
        item
    ) => {

        try {

            const data =
                await updateInventoryItem(
                    item._id,
                    {
                        isAvailable:
                            !item.isAvailable
                    },
                    token
                );


            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Unable to update availability."
                );

            }


            setInventory(current =>
                current.map(existing =>
                    existing._id === item._id
                        ? {
                            ...existing,
                            isAvailable:
                                !item.isAvailable
                        }
                        : existing
                )
            );


        } catch (err) {

            console.error(
                "Availability update error:",
                err
            );

            setError(
                err.message ||
                "Unable to update availability."
            );

        }

    };


    // =====================================================
    // STATUS
    // =====================================================

    const getStockStatus = (item) => {

        const stock =
            Number(item.stock || 0);

        const threshold =
            Number(
                item.lowStockThreshold ?? 5
            );


        if (!item.isAvailable) {

            return {
                label: "Unavailable",
                className: "inventory-unavailable"
            };

        }


        if (stock === 0) {

            return {
                label: "Out of Stock",
                className: "inventory-out"
            };

        }


        if (stock <= threshold) {

            return {
                label: "Low Stock",
                className: "inventory-low"
            };

        }


        return {
            label: "In Stock",
            className: "inventory-good"
        };

    };


    // =====================================================
    // CATEGORY ICON
    // =====================================================

    const getCategoryIcon = (
        category
    ) => {

        if (category === "Base") {
            return "🍞";
        }

        if (category === "Sauce") {
            return "🥫";
        }

        if (category === "Cheese") {
            return "🧀";
        }

        return "🥬";

    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <section
            className="admin-orders admin-pizzas"
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <div
                className="admin-section-header"
            >

                <div>

                    <p>
                        INVENTORY MANAGEMENT
                    </p>

                    <h2>
                        Ingredients
                    </h2>

                </div>


                <div
                    style={{
                        display: "flex",
                        gap: "10px"
                    }}
                >

                    <button
                        type="button"
                        className="admin-refresh"
                        onClick={loadInventory}
                        disabled={loading}
                    >

                        <RefreshCw
                            size={16}
                            className={
                                loading
                                    ? "spin"
                                    : ""
                            }
                        />

                        Refresh

                    </button>


                    <button
                        type="button"
                        className="admin-refresh"
                        onClick={openAddForm}
                    >

                        <Plus size={17} />

                        Add Ingredient

                    </button>

                </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="auth-error">
                    {error}
                </div>

            )}


            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (

                <div className="no-orders">

                    <RefreshCw
                        size={30}
                        className="spin"
                    />

                    <p>
                        Loading inventory...
                    </p>

                </div>

            ) : (

                <>

                    {/* =================================================
                        CATEGORY SECTIONS
                    ================================================= */}

                    {Object.entries(
                        groupedInventory
                    ).map(
                        ([category, items]) => (

                            <div
                                key={category}
                                style={{
                                    marginBottom: "28px"
                                }}
                            >

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        marginBottom: "14px"
                                    }}
                                >

                                    <span
                                        style={{
                                            fontSize: "24px"
                                        }}
                                    >
                                        {
                                            getCategoryIcon(
                                                category
                                            )
                                        }
                                    </span>

                                    <div>

                                        <h3
                                            style={{
                                                margin: 0
                                            }}
                                        >
                                            {category}s
                                        </h3>

                                        <small>
                                            {items.length} item
                                            {items.length !== 1
                                                ? "s"
                                                : ""}
                                        </small>

                                    </div>

                                </div>


                                {items.length === 0 ? (

                                    <div
                                        className="no-orders"
                                        style={{
                                            minHeight: "120px"
                                        }}
                                    >

                                        <Package
                                            size={28}
                                        />

                                        <p>
                                            No {category.toLowerCase()}
                                            items yet.
                                        </p>

                                    </div>

                                ) : (

                                    <div
                                        className="pizza-admin-grid"
                                    >

                                        {items.map(
                                            item => {

                                                const status =
                                                    getStockStatus(
                                                        item
                                                    );


                                                return (

                                                    <article
                                                        className="pizza-admin-card"
                                                        key={
                                                            item._id
                                                        }
                                                    >

                                                        <div
                                                            className="pizza-admin-image"
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                fontSize: "48px"
                                                            }}
                                                        >

                                                            {
                                                                getCategoryIcon(
                                                                    category
                                                                )
                                                            }

                                                        </div>


                                                        <div
                                                            className="pizza-admin-content"
                                                        >

                                                            <div
                                                                className="pizza-admin-top"
                                                            >

                                                                <div>

                                                                    <h3>
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </h3>

                                                                    <span>
                                                                        {
                                                                            item.unit ||
                                                                            "units"
                                                                        }
                                                                    </span>

                                                                </div>


                                                                <strong>
                                                                    {
                                                                        Number(
                                                                            item.stock ||
                                                                            0
                                                                        )
                                                                    }
                                                                </strong>

                                                            </div>


                                                            <div
                                                                className="pizza-admin-meta"
                                                            >

                                                                <span>
                                                                    Threshold:{" "}
                                                                    {
                                                                        item.lowStockThreshold ??
                                                                        5
                                                                    }
                                                                </span>


                                                                <span
                                                                    className={
                                                                        status.className
                                                                    }
                                                                >
                                                                    {
                                                                        status.label
                                                                    }
                                                                </span>

                                                            </div>


                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "8px",
                                                                    margin: "12px 0"
                                                                }}
                                                            >

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        updateStock(
                                                                            item,
                                                                            -1
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        Number(
                                                                            item.stock
                                                                        ) <= 0
                                                                    }
                                                                >
                                                                    −
                                                                </button>


                                                                <strong>
                                                                    Stock:{" "}
                                                                    {
                                                                        item.stock
                                                                    }
                                                                </strong>


                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        updateStock(
                                                                            item,
                                                                            1
                                                                        )
                                                                    }
                                                                >
                                                                    +
                                                                </button>

                                                            </div>


                                                            <div
                                                                className="pizza-admin-actions"
                                                            >

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        toggleAvailability(
                                                                            item
                                                                        )
                                                                    }
                                                                >
                                                                    {
                                                                        item.isAvailable
                                                                            ? "Disable"
                                                                            : "Enable"
                                                                    }
                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openEditForm(
                                                                            item
                                                                        )
                                                                    }
                                                                >

                                                                    <Pencil
                                                                        size={15}
                                                                    />

                                                                    Edit

                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            item
                                                                        )
                                                                    }
                                                                >

                                                                    <Trash2
                                                                        size={15}
                                                                    />

                                                                    Delete

                                                                </button>

                                                            </div>

                                                        </div>

                                                    </article>

                                                );

                                            }
                                        )}

                                    </div>

                                )}

                            </div>

                        )
                    )}

                </>

            )}


            {/* =================================================
                ADD / EDIT MODAL
            ================================================= */}

            {showForm && (

                <div
                    className="pizza-modal-overlay"
                    onMouseDown={event => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeForm();
                        }

                    }}
                >

                    <div
                        className="pizza-modal"
                    >

                        <div
                            className="pizza-modal-header"
                        >

                            <div>

                                <p>
                                    INVENTORY MANAGEMENT
                                </p>

                                <h2>
                                    {
                                        editingItem
                                            ? "Edit Ingredient"
                                            : "Add Ingredient"
                                    }
                                </h2>

                            </div>


                            <button
                                type="button"
                                onClick={closeForm}
                                disabled={saving}
                            >

                                <X size={20} />

                            </button>

                        </div>


                        <form
                            className="pizza-form"
                            onSubmit={handleSubmit}
                        >

                            <div
                                className="pizza-form-grid"
                            >

                                {/* NAME */}

                                <div
                                    className="form-field pizza-form-full"
                                >

                                    <label>
                                        Ingredient Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Classic Hand Tossed"
                                        required
                                    />

                                </div>


                                {/* CATEGORY */}

                                <div
                                    className="form-field"
                                >

                                    <label>
                                        Category
                                    </label>

                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                    >

                                        <option value="Base">
                                            Base
                                        </option>

                                        <option value="Sauce">
                                            Sauce
                                        </option>

                                        <option value="Cheese">
                                            Cheese
                                        </option>

                                        <option value="Vegetable">
                                            Vegetable
                                        </option>

                                    </select>

                                </div>


                                {/* STOCK */}

                                <div
                                    className="form-field"
                                >

                                    <label>
                                        Stock
                                    </label>

                                    <input
                                        type="number"
                                        name="stock"
                                        value={form.stock}
                                        onChange={handleChange}
                                        min="0"
                                        step="1"
                                        required
                                    />

                                </div>


                                {/* THRESHOLD */}

                                <div
                                    className="form-field"
                                >

                                    <label>
                                        Low Stock Threshold
                                    </label>

                                    <input
                                        type="number"
                                        name="lowStockThreshold"
                                        value={
                                            form.lowStockThreshold
                                        }
                                        onChange={handleChange}
                                        min="0"
                                        step="1"
                                        required
                                    />

                                </div>


                                {/* UNIT */}

                                <div
                                    className="form-field"
                                >

                                    <label>
                                        Unit
                                    </label>

                                    <input
                                        type="text"
                                        name="unit"
                                        value={form.unit}
                                        onChange={handleChange}
                                        placeholder="units"
                                    />

                                </div>


                                {/* AVAILABLE */}

                                <div
                                    className="pizza-form-options pizza-form-full"
                                >

                                    <label>

                                        <input
                                            type="checkbox"
                                            name="isAvailable"
                                            checked={
                                                form.isAvailable
                                            }
                                            onChange={handleChange}
                                        />

                                        Available

                                    </label>

                                </div>

                            </div>


                            {error && (

                                <div className="auth-error">
                                    {error}
                                </div>

                            )}


                            <div
                                className="pizza-modal-actions"
                            >

                                <button
                                    type="button"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={saving}
                                >

                                    {saving ? (

                                        <>
                                            <RefreshCw
                                                size={16}
                                                className="spin"
                                            />

                                            Saving...

                                        </>

                                    ) : (

                                        <>
                                            <Package
                                                size={16}
                                            />

                                            {
                                                editingItem
                                                    ? "Update Ingredient"
                                                    : "Add Ingredient"
                                            }
                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =================================================
                TOAST
            ================================================= */}

            {toast && (

                <div
                    role="status"
                    aria-live="polite"
                    style={{
                        position: "fixed",
                        right: "24px",
                        bottom: "24px",
                        zIndex: 11000,
                        padding: "14px 16px",
                        borderRadius: "12px",
                        background:
                            toast.type === "error"
                                ? "#241514"
                                : "#122018",
                        color:
                            toast.type === "error"
                                ? "#ff8f80"
                                : "#69e59b",
                        boxShadow:
                            "0 18px 50px rgba(0,0,0,.45)",
                        fontSize: "12px",
                        fontWeight: 700
                    }}
                >

                    {toast.message}


                    <button
                        type="button"
                        onClick={() =>
                            setToast(null)
                        }
                        style={{
                            marginLeft: "14px",
                            border: "none",
                            background: "transparent",
                            color: "inherit",
                            cursor: "pointer"
                        }}
                    >
                        ×
                    </button>

                </div>

            )}

        </section>

    );

}


export default InventoryManagement;