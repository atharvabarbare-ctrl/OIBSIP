const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// =====================================================
// PIZZAS
// =====================================================

export const getPizzas = async (params = "") => {
    const response = await fetch(
        `${API_URL}/api/pizzas${params}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch pizzas");
    }

    return response.json();
};


// =====================================================
// AUTH
// =====================================================

export const loginUser = async (data) => {
    const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        }
    );

    return response.json();
};


export const registerUser = async (data) => {
    const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        }
    );

    return response.json();
};


// =====================================================
// ORDERS
// =====================================================

export const createOrder = async (
    orderData,
    token
) => {
    const response = await fetch(
        `${API_URL}/api/orders`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",

                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify(orderData)
        }
    );

    return response.json();
};


export const getMyOrders = async (token) => {
    const response = await fetch(
        `${API_URL}/api/orders/my-orders`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.json();
};


// =====================================================
// INVENTORY
// ADMIN ONLY
// =====================================================

export const getInventory = async (token) => {
    const response = await fetch(
        `${API_URL}/api/inventory`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch inventory."
        );
    }

    return data;
};


// =====================================================
// CREATE INVENTORY ITEM
// =====================================================

export const createInventoryItem = async (
    inventoryData,
    token
) => {
    const response = await fetch(
        `${API_URL}/api/inventory`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",

                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify(inventoryData)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to create inventory item."
        );
    }

    return data;
};


// =====================================================
// UPDATE INVENTORY ITEM
// =====================================================

export const updateInventoryItem = async (
    id,
    inventoryData,
    token
) => {
    const response = await fetch(
        `${API_URL}/api/inventory/${id}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",

                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify(inventoryData)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to update inventory item."
        );
    }

    return data;
};


// =====================================================
// DELETE INVENTORY ITEM
// =====================================================

export const deleteInventoryItem = async (
    id,
    token
) => {
    const response = await fetch(
        `${API_URL}/api/inventory/${id}`,
        {
            method: "DELETE",

            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to delete inventory item."
        );
    }

    return data;
};