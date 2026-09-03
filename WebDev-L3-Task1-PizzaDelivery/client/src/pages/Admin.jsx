import { useEffect, useState } from "react";

import {
    RefreshCw,
    ShoppingBag,
    Pizza,
    IndianRupee,
    Clock,
    XCircle,
    Plus,
    User,
    MapPin,
    Package,
    CreditCard,
    Pencil,
    Trash2,
    X,
    Save
} from "lucide-react";

import InventoryManagement from "../components/InventoryManagement";

const API_URL = "http://localhost:5000";


/* =====================================================
   EMPTY PIZZA
===================================================== */

const emptyPizza = {
    name: "",
    description: "",
    category: "Classic",
    image: "",
    basePrice: "",
    isVeg: true,
    isAvailable: true,
    stock: 0,
    toppings: "",
    sizes: [
        {
            name: "Small",
            price: ""
        },
        {
            name: "Medium",
            price: ""
        },
        {
            name: "Large",
            price: ""
        }
    ]
};


/* =====================================================
   ADMIN
===================================================== */

function Admin() {

    const [stats, setStats] = useState(null);

    const [orders, setOrders] = useState([]);

    const [pizzas, setPizzas] = useState([]);

    const [loading, setLoading] = useState(true);

    const [pizzaLoading, setPizzaLoading] = useState(false);

    const [error, setError] = useState("");

    const [pizzaError, setPizzaError] = useState("");

    const [showPizzaForm, setShowPizzaForm] = useState(false);

    const [editingPizza, setEditingPizza] = useState(null);

    const [pizzaForm, setPizzaForm] =
        useState(emptyPizza);

    const [selectedOrder, setSelectedOrder] =
        useState(null);

    const [toast, setToast] =
        useState(null);

    const [updatingOrderId, setUpdatingOrderId] =
        useState(null);


    /* =====================================================
       TOKEN
    ===================================================== */

    const token =
        localStorage.getItem("token");


    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    };


    /* =====================================================
       ADMIN DATA
    ===================================================== */

    const fetchAdminData = async () => {

        try {

            setLoading(true);

            setError("");

            const [
                statsResponse,
                ordersResponse
            ] = await Promise.all([

                fetch(
                    `${API_URL}/api/admin/stats`,
                    {
                        headers
                    }
                ),

                fetch(
                    `${API_URL}/api/admin/orders`,
                    {
                        headers
                    }
                )

            ]);


            const statsData =
                await statsResponse.json();

            const ordersData =
                await ordersResponse.json();


            if (!statsResponse.ok) {

                throw new Error(
                    statsData.message ||
                    "Unable to load dashboard."
                );

            }


            if (!ordersResponse.ok) {

                throw new Error(
                    ordersData.message ||
                    "Unable to load orders."
                );

            }


            setStats(
                statsData.stats
            );

            setOrders(
                ordersData.orders || []
            );


        } catch (err) {

            console.error(
                "Admin dashboard error:",
                err
            );

            setError(
                err.message ||
                "Unable to load admin dashboard."
            );


        } finally {

            setLoading(false);

        }

    };


    /* =====================================================
       FETCH PIZZAS
    ===================================================== */

    const fetchPizzas = async () => {

        try {

            setPizzaLoading(true);

            setPizzaError("");


            const response =
                await fetch(
                    `${API_URL}/api/pizzas`,
                    {
                        headers
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load pizzas."
                );

            }


            setPizzas(
                data.pizzas || []
            );


        } catch (err) {

            console.error(
                "Pizza fetch error:",
                err
            );

            setPizzaError(
                err.message ||
                "Unable to load pizzas."
            );


        } finally {

            setPizzaLoading(false);

        }

    };


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {

        fetchAdminData();

        fetchPizzas();

    }, []);


    /* =====================================================
       ORDER DETAILS
    ===================================================== */

    const openOrderDetails = (order) => {

        setSelectedOrder(order);

    };


    const closeOrderDetails = () => {

        setSelectedOrder(null);

    };


    /* =====================================================
       TOAST
    ===================================================== */

    const showToast = (
        message,
        type = "success"
    ) => {

        setToast({
            message,
            type
        });

        window.setTimeout(() => {

            setToast(null);

        }, 3000);

    };


    /* =====================================================
       STATUS OPTIONS
    ===================================================== */

    const getStatusOptions = (status) => {

        const nextStatus = {

            Pending: "Confirmed",

            Confirmed: "Preparing",

            Preparing: "Out for Delivery",

            "Out for Delivery": "Delivered",

            Delivered: null,

            Cancelled: null

        };


        const options = [status];


        if (nextStatus[status]) {

            options.push(
                nextStatus[status]
            );

        }


        if (status !== "Cancelled") {

            options.push("Cancelled");

        }


        return [
            ...new Set(options)
        ];

    };


    /* =====================================================
       UPDATE ORDER STATUS
    ===================================================== */

    const updateStatus = async (
        orderId,
        status
    ) => {

        const currentOrder =
            orders.find(
                order =>
                    order._id === orderId
            );


        if (
            currentOrder &&
            currentOrder.status === status
        ) {

            return;

        }


        if (status === "Cancelled") {

            const confirmed =
                window.confirm(
                    "Are you sure you want to cancel this order?"
                );


            if (!confirmed) {

                return;

            }

        }


        try {

            setUpdatingOrderId(
                orderId
            );


            const response =
                await fetch(

                    `${API_URL}/api/admin/orders/${orderId}/status`,

                    {
                        method: "PUT",

                        headers,

                        body:
                            JSON.stringify({
                                status
                            })
                    }

                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to update status."
                );

            }


            setOrders(
                currentOrders =>

                    currentOrders.map(
                        order =>

                            order._id === orderId

                                ? data.order

                                : order
                    )
            );


            const statsResponse =
                await fetch(
                    `${API_URL}/api/admin/stats`,
                    {
                        headers
                    }
                );


            const statsData =
                await statsResponse.json();


            if (statsResponse.ok) {

                setStats(
                    statsData.stats
                );

            }


            if (
                selectedOrder &&
                selectedOrder._id === orderId
            ) {

                setSelectedOrder(
                    data.order
                );

            }


            showToast(
                `Order status changed to ${status}.`
            );


        } catch (err) {

            console.error(
                "Update status error:",
                err
            );

            showToast(
                err.message ||
                "Unable to update order status.",
                "error"
            );


        } finally {

            setUpdatingOrderId(null);

        }

    };


    /* =====================================================
       ADD PIZZA
    ===================================================== */

    const openAddPizza = () => {

        setEditingPizza(null);

        setPizzaForm({

            ...emptyPizza,

            sizes: [

                {
                    name: "Small",
                    price: ""
                },

                {
                    name: "Medium",
                    price: ""
                },

                {
                    name: "Large",
                    price: ""
                }

            ]

        });

        setPizzaError("");

        setShowPizzaForm(true);

    };


    /* =====================================================
       EDIT PIZZA
    ===================================================== */

    const openEditPizza = (pizza) => {

        setEditingPizza(pizza);

        setPizzaForm({

            name:
                pizza.name || "",

            description:
                pizza.description || "",

            category:
                pizza.category || "Classic",

            image:
                pizza.image || "",

            basePrice:
                pizza.basePrice ?? "",

            isVeg:
                pizza.isVeg ?? true,

            isAvailable:
                pizza.isAvailable ?? true,

            stock:
                pizza.stock ?? 0,

            toppings:
                Array.isArray(
                    pizza.toppings
                )
                    ? pizza.toppings.join(", ")
                    : "",

            sizes:
                pizza.sizes?.length

                    ? pizza.sizes.map(
                        size => ({
                            name: size.name,
                            price: size.price
                        })
                    )

                    : [

                        {
                            name: "Small",
                            price: ""
                        },

                        {
                            name: "Medium",
                            price: ""
                        },

                        {
                            name: "Large",
                            price: ""
                        }

                    ]

        });


        setPizzaError("");

        setShowPizzaForm(true);

    };


    /* =====================================================
       CLOSE PIZZA FORM
    ===================================================== */

    const closePizzaForm = () => {

        setShowPizzaForm(false);

        setEditingPizza(null);

        setPizzaError("");

    };


    /* =====================================================
       PIZZA CHANGE
    ===================================================== */

    const handlePizzaChange = (event) => {

        const {
            name,
            value,
            type,
            checked
        } = event.target;


        setPizzaForm(
            current => ({

                ...current,

                [name]:

                    type === "checkbox"

                        ? checked

                        : value

            })
        );

    };


    /* =====================================================
       SIZE CHANGE
    ===================================================== */

    const handleSizeChange = (
        index,
        value
    ) => {

        setPizzaForm(
            current => ({

                ...current,

                sizes:

                    current.sizes.map(
                        (size, sizeIndex) =>

                            sizeIndex === index

                                ? {
                                    ...size,
                                    price: value
                                }

                                : size
                    )

            })
        );

    };


    /* =====================================================
       SAVE PIZZA
    ===================================================== */

    const savePizza = async (event) => {

        event.preventDefault();


        try {

            setPizzaError("");

            setPizzaLoading(true);


            if (
                !pizzaForm.name.trim()
            ) {

                throw new Error(
                    "Pizza name is required."
                );

            }


            if (
                !pizzaForm.description.trim()
            ) {

                throw new Error(
                    "Description is required."
                );

            }


            if (

                pizzaForm.basePrice === ""

                ||

                Number(
                    pizzaForm.basePrice
                ) < 0

            ) {

                throw new Error(
                    "Enter a valid base price."
                );

            }


            const sizes =
                pizzaForm.sizes.map(
                    size => ({

                        name:
                            size.name,

                        price:
                            Number(
                                size.price
                            )

                    })
                );


            const hasInvalidSize =
                sizes.some(
                    size =>

                        !Number.isFinite(
                            size.price
                        )

                        ||

                        size.price < 0

                );


            if (hasInvalidSize) {

                throw new Error(
                    "Enter valid prices for all sizes."
                );

            }


            const payload = {

                name:
                    pizzaForm.name.trim(),

                description:
                    pizzaForm.description.trim(),

                category:
                    pizzaForm.category,

                image:
                    pizzaForm.image.trim(),

                basePrice:
                    Number(
                        pizzaForm.basePrice
                    ),

                isVeg:
                    Boolean(
                        pizzaForm.isVeg
                    ),

                isAvailable:
                    Boolean(
                        pizzaForm.isAvailable
                    ),

                stock:
                    Number(
                        pizzaForm.stock
                    ) || 0,

                toppings:
                    pizzaForm.toppings

                        .split(",")

                        .map(
                            item =>
                                item.trim()
                        )

                        .filter(Boolean),

                sizes

            };


            const url =

                editingPizza

                    ? `${API_URL}/api/pizzas/${editingPizza._id}`

                    : `${API_URL}/api/pizzas`;


            const response =
                await fetch(

                    url,

                    {

                        method:

                            editingPizza

                                ? "PUT"

                                : "POST",

                        headers,

                        body:
                            JSON.stringify(
                                payload
                            )

                    }

                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to save pizza."
                );

            }


            await fetchPizzas();

            await fetchAdminData();

            closePizzaForm();


            showToast(
                editingPizza
                    ? "Pizza updated successfully."
                    : "Pizza created successfully."
            );


        } catch (err) {

            console.error(
                "Save pizza error:",
                err
            );

            setPizzaError(
                err.message ||
                "Unable to save pizza."
            );


        } finally {

            setPizzaLoading(false);

        }

    };


    /* =====================================================
       DELETE PIZZA
    ===================================================== */

    const deletePizza = async (
        pizzaId
    ) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this pizza?"
            );


        if (!confirmed) {

            return;

        }


        try {

            setPizzaLoading(true);

            setPizzaError("");


            const response =
                await fetch(

                    `${API_URL}/api/pizzas/${pizzaId}`,

                    {

                        method: "DELETE",

                        headers

                    }

                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to delete pizza."
                );

            }


            setPizzas(
                current =>

                    current.filter(
                        pizza =>
                            pizza._id !== pizzaId
                    )
            );


            await fetchAdminData();


            showToast(
                "Pizza deleted successfully."
            );


        } catch (err) {

            console.error(
                "Delete pizza error:",
                err
            );

            setPizzaError(
                err.message ||
                "Unable to delete pizza."
            );


        } finally {

            setPizzaLoading(false);

        }

    };


    /* =====================================================
       TOGGLE AVAILABILITY
    ===================================================== */

    const toggleAvailability =
        async (pizza) => {

            try {

                setPizzaLoading(true);

                setPizzaError("");


                const response =
                    await fetch(

                        `${API_URL}/api/pizzas/${pizza._id}`,

                        {

                            method: "PUT",

                            headers,

                            body:
                                JSON.stringify({

                                    isAvailable:
                                        !pizza.isAvailable

                                })

                        }

                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to update availability."
                    );

                }


                setPizzas(

                    current =>

                        current.map(

                            item =>

                                item._id === pizza._id

                                    ? data.pizza

                                    : item

                        )

                );


                showToast(
                    data.pizza?.isAvailable
                        ? "Pizza enabled."
                        : "Pizza disabled."
                );


            } catch (err) {

                console.error(
                    "Availability update error:",
                    err
                );

                setPizzaError(
                    err.message ||
                    "Unable to update availability."
                );


            } finally {

                setPizzaLoading(false);

            }

        };


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="admin-loading">

                <RefreshCw
                    className="spin"
                    size={30}
                />

                <p>
                    Loading admin dashboard...
                </p>

            </div>

        );

    }


    /* =====================================================
       ERROR
    ===================================================== */

    if (error) {

        return (

            <div className="admin-error">

                <XCircle size={40} />

                <h2>
                    Unable to load dashboard
                </h2>

                <p>
                    {error}
                </p>

                <button
                    onClick={fetchAdminData}
                >

                    <RefreshCw size={16} />

                    Try Again

                </button>

            </div>

        );

    }


    /* =====================================================
       MAIN UI
    ===================================================== */

    return (

        <main className="admin-page">

            <div className="admin-container">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="admin-header">

                    <div>

                        <p className="admin-eyebrow">
                            ADMIN PANEL
                        </p>

                        <h1>
                            Dashboard<span>.</span>
                        </h1>

                        <p className="admin-subtitle">
                            Manage your PizzaHub orders
                            and business.
                        </p>

                    </div>


                    <button
                        className="admin-refresh"

                        onClick={() => {

                            fetchAdminData();

                            fetchPizzas();

                        }}

                    >

                        <RefreshCw size={17} />

                        Refresh

                    </button>

                </div>


                {/* =================================================
                    STATS
                ================================================= */}

                <section className="admin-stats">


                    <div className="admin-stat-card">

                        <div className="stat-icon">

                            <ShoppingBag
                                size={21}
                            />

                        </div>

                        <div>

                            <span>
                                Total Orders
                            </span>

                            <strong>
                                {stats?.totalOrders || 0}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="stat-icon">

                            <Pizza
                                size={21}
                            />

                        </div>

                        <div>

                            <span>
                                Total Pizzas
                            </span>

                            <strong>
                                {
                                    stats?.totalPizzas ||
                                    pizzas.length ||
                                    0
                                }
                            </strong>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="stat-icon">

                            <IndianRupee
                                size={21}
                            />

                        </div>

                        <div>

                            <span>
                                Total Revenue
                            </span>

                            <strong>

                                ₹

                                {Number(
                                    stats?.revenue || 0
                                ).toLocaleString(
                                    "en-IN"
                                )}

                            </strong>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="stat-icon">

                            <Clock
                                size={21}
                            />

                        </div>

                        <div>

                            <span>
                                Pending Orders
                            </span>

                            <strong>
                                {stats?.pendingOrders || 0}
                            </strong>

                        </div>

                    </div>


                </section>


                {/* =================================================
                    ORDER MANAGEMENT
                ================================================= */}

                <section className="admin-orders">

                    <div className="admin-section-header">

                        <div>

                            <p>
                                ORDER MANAGEMENT
                            </p>

                            <h2>
                                Recent Orders
                            </h2>

                        </div>

                    </div>


                    {orders.length === 0 ? (

                        <div className="no-orders">

                            <ShoppingBag
                                size={35}
                            />

                            <h3>
                                No orders yet
                            </h3>

                            <p>
                                Customer orders will
                                appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="orders-table">

                            <div className="order-table-head">

                                <span>
                                    ORDER
                                </span>

                                <span>
                                    CUSTOMER
                                </span>

                                <span>
                                    TOTAL
                                </span>

                                <span>
                                    PAYMENT
                                </span>

                                <span>
                                    STATUS
                                </span>

                            </div>


                            {orders.map(
                                order => (

                                    <div
                                        className="order-table-row"
                                        key={order._id}
                                    >

                                        <div>

                                            <strong>
                                                #
                                                {order._id
                                                    .slice(-7)
                                                    .toUpperCase()}
                                            </strong>

                                            <small>

                                                {new Date(
                                                    order.createdAt
                                                ).toLocaleDateString(
                                                    "en-IN",
                                                    {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric"
                                                    }
                                                )}

                                            </small>

                                        </div>


                                        <div>

                                            <strong>
                                                {
                                                    order.user?.name ||
                                                    "Customer"
                                                }
                                            </strong>

                                            <small>
                                                {
                                                    order.user?.email ||
                                                    ""
                                                }
                                            </small>

                                        </div>


                                        <strong>

                                            ₹

                                            {Number(
                                                order.totalAmount || 0
                                            ).toLocaleString(
                                                "en-IN"
                                            )}

                                        </strong>


                                        <span>
                                            {
                                                order.paymentMethod ||
                                                "COD"
                                            }
                                        </span>


                                        <button
                                            type="button"
                                            className="order-view-details"
                                            onClick={() =>
                                                openOrderDetails(
                                                    order
                                                )
                                            }
                                        >
                                            View Details
                                        </button>


                                        <select

                                            value={
                                                order.status
                                            }

                                            disabled={
                                                updatingOrderId ===
                                                order._id
                                            }

                                            onChange={
                                                event =>
                                                    updateStatus(
                                                        order._id,
                                                        event.target.value
                                                    )
                                            }

                                        >

                                            {
                                                getStatusOptions(
                                                    order.status
                                                ).map(
                                                    status => (

                                                        <option
                                                            key={status}
                                                            value={status}
                                                        >
                                                            {status}
                                                        </option>

                                                    )
                                                )
                                            }

                                        </select>


                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* =================================================
                    PIZZA MANAGEMENT
                ================================================= */}

                <section className="admin-orders admin-pizzas">

                    <div className="admin-section-header">

                        <div>

                            <p>
                                PIZZA MANAGEMENT
                            </p>

                            <h2>
                                Your Pizzas
                            </h2>

                        </div>


                        <button
                            className="admin-refresh"
                            onClick={openAddPizza}
                        >

                            <Plus size={17} />

                            Add Pizza

                        </button>

                    </div>


                    {pizzaError && (

                        <div className="auth-error">
                            {pizzaError}
                        </div>

                    )}


                    {pizzaLoading &&
                        pizzas.length === 0 ? (

                        <div className="no-orders">

                            <RefreshCw
                                className="spin"
                                size={30}
                            />

                            <p>
                                Loading pizzas...
                            </p>

                        </div>

                    ) : pizzas.length === 0 ? (

                        <div className="no-orders">

                            <Pizza
                                size={35}
                            />

                            <h3>
                                No pizzas yet
                            </h3>

                            <p>
                                Add your first pizza
                                to the menu.
                            </p>

                        </div>

                    ) : (

                        <div className="pizza-admin-grid">

                            {pizzas.map(
                                pizza => (

                                    <article
                                        className="pizza-admin-card"
                                        key={pizza._id}
                                    >

                                        <div className="pizza-admin-image">

                                            {pizza.image ? (

                                                <img
                                                    src={pizza.image}
                                                    alt={pizza.name}
                                                />

                                            ) : (

                                                <Pizza
                                                    size={40}
                                                />

                                            )}

                                        </div>


                                        <div className="pizza-admin-content">

                                            <div className="pizza-admin-top">

                                                <div>

                                                    <h3>
                                                        {pizza.name}
                                                    </h3>

                                                    <span>
                                                        {pizza.category}
                                                    </span>

                                                </div>


                                                <strong>

                                                    ₹

                                                    {Number(
                                                        pizza.basePrice || 0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}

                                                </strong>

                                            </div>


                                            <p>
                                                {pizza.description}
                                            </p>


                                            <div className="pizza-admin-meta">

                                                <span>
                                                    {
                                                        pizza.isVeg
                                                            ? "Veg"
                                                            : "Non-Veg"
                                                    }
                                                </span>

                                                <span>
                                                    Stock: {pizza.stock}
                                                </span>

                                                <span
                                                    className={
                                                        pizza.isAvailable
                                                            ? "available"
                                                            : "unavailable"
                                                    }
                                                >
                                                    {
                                                        pizza.isAvailable
                                                            ? "Available"
                                                            : "Unavailable"
                                                    }
                                                </span>

                                            </div>


                                            <div className="pizza-admin-actions">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleAvailability(
                                                            pizza
                                                        )
                                                    }
                                                    disabled={
                                                        pizzaLoading
                                                    }
                                                >

                                                    {
                                                        pizza.isAvailable
                                                            ? "Disable"
                                                            : "Enable"
                                                    }

                                                </button>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditPizza(
                                                            pizza
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
                                                        deletePizza(
                                                            pizza._id
                                                        )
                                                    }
                                                    disabled={
                                                        pizzaLoading
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

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* =================================================
                    INVENTORY MANAGEMENT
                ================================================= */}

                <InventoryManagement />


            </div>


            {/* =====================================================
                ORDER DETAILS MODAL
            ===================================================== */}

            {selectedOrder && (

                <div
                    className="pizza-modal-overlay order-details-overlay"

                    onMouseDown={event => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            closeOrderDetails();

                        }

                    }}

                >

                    <div className="pizza-modal order-details-modal">


                        <div className="pizza-modal-header">

                            <div>

                                <p>
                                    ORDER MANAGEMENT
                                </p>

                                <h2>

                                    Order #

                                    {
                                        selectedOrder._id
                                            ?.slice(-7)
                                            .toUpperCase()
                                    }

                                </h2>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    closeOrderDetails
                                }
                            >

                                <X size={20} />

                            </button>

                        </div>


                        <div className="order-details-content">


                            <div className="order-details-grid">


                                <div className="order-detail-card">

                                    <div className="order-detail-icon">

                                        <User size={18} />

                                    </div>

                                    <div>

                                        <span>
                                            Customer
                                        </span>

                                        <strong>

                                            {
                                                selectedOrder.user?.name ||
                                                selectedOrder.customer?.name ||
                                                "Customer"
                                            }

                                        </strong>

                                        <small>

                                            {
                                                selectedOrder.user?.email ||
                                                selectedOrder.customer?.email ||
                                                "No email available"
                                            }

                                        </small>

                                    </div>

                                </div>


                                <div className="order-detail-card">

                                    <div className="order-detail-icon">

                                        <CreditCard size={18} />

                                    </div>

                                    <div>

                                        <span>
                                            Payment
                                        </span>

                                        <strong>

                                            {
                                                selectedOrder.paymentMethod ||
                                                "COD"
                                            }

                                        </strong>

                                        <small>

                                            {
                                                selectedOrder.paymentStatus ||
                                                selectedOrder.payment?.status ||
                                                "Payment status unavailable"
                                            }

                                        </small>

                                    </div>

                                </div>


                                <div className="order-detail-card order-detail-full">

                                    <div className="order-detail-icon">

                                        <MapPin size={18} />

                                    </div>

                                    <div>

                                        <span>
                                            Delivery Address
                                        </span>

                                        <strong>

                                            {
                                                typeof selectedOrder.deliveryAddress ===
                                                    "string"

                                                    ? selectedOrder.deliveryAddress

                                                    : selectedOrder.address?.address ||
                                                    selectedOrder.deliveryAddress?.address ||
                                                    selectedOrder.shippingAddress?.address ||
                                                    "Address not available"
                                            }

                                        </strong>


                                        {
                                            (
                                                selectedOrder.address?.city ||
                                                selectedOrder.deliveryAddress?.city ||
                                                selectedOrder.shippingAddress?.city
                                            ) && (

                                                <small>

                                                    {

                                                        [

                                                            selectedOrder.address?.city ||
                                                            selectedOrder.deliveryAddress?.city ||
                                                            selectedOrder.shippingAddress?.city,

                                                            selectedOrder.address?.state ||
                                                            selectedOrder.deliveryAddress?.state ||
                                                            selectedOrder.shippingAddress?.state,

                                                            selectedOrder.address?.pincode ||
                                                            selectedOrder.deliveryAddress?.pincode ||
                                                            selectedOrder.shippingAddress?.pincode

                                                        ]

                                                            .filter(Boolean)

                                                            .join(", ")

                                                    }

                                                </small>

                                            )
                                        }

                                    </div>

                                </div>

                            </div>


                            {/* ORDER ITEMS */}

                            <div className="order-details-section">

                                <div className="order-details-section-title">

                                    <div>

                                        <Package size={18} />

                                        <h3>
                                            Order Items
                                        </h3>

                                    </div>

                                    <span>
                                        {
                                            selectedOrder.items?.length ||
                                            0
                                        } item(s)
                                    </span>

                                </div>


                                {
                                    Array.isArray(
                                        selectedOrder.items
                                    ) &&
                                        selectedOrder.items.length > 0

                                        ? (

                                            <div className="order-detail-items">

                                                {
                                                    selectedOrder.items.map(
                                                        (item, index) => {

                                                            const quantity =
                                                                Number(
                                                                    item.quantity ||
                                                                    item.qty ||
                                                                    1
                                                                );


                                                            const unitPrice =
                                                                Number(

                                                                    item.price ??

                                                                    item.unitPrice ??

                                                                    item.size?.price ??

                                                                    item.pizza?.price ??

                                                                    item.pizza?.basePrice ??

                                                                    0

                                                                );


                                                            const lineTotal =
                                                                Number(

                                                                    item.total ??

                                                                    item.subtotal ??

                                                                    unitPrice *
                                                                    quantity

                                                                );


                                                            return (

                                                                <div
                                                                    className="order-detail-item"
                                                                    key={
                                                                        item._id ||
                                                                        item.pizza?._id ||
                                                                        index
                                                                    }
                                                                >

                                                                    <div>

                                                                        <strong>

                                                                            {
                                                                                item.name ||
                                                                                item.pizza?.name ||
                                                                                "Pizza"
                                                                            }

                                                                        </strong>

                                                                        <small>

                                                                            {
                                                                                item.size?.name ||
                                                                                item.size ||
                                                                                "Regular"
                                                                            }

                                                                            {
                                                                                item.variant
                                                                                    ? ` • ${item.variant}`
                                                                                    : ""
                                                                            }

                                                                        </small>
                                                                        {item.isCustom && item.customizations && (
                                                                            <div className="custom-order-details">

                                                                                {item.customizations.base?.name && (
                                                                                    <div className="custom-order-detail-row">
                                                                                        <span>Base</span>
                                                                                        <strong>
                                                                                            {item.customizations.base.name}
                                                                                        </strong>
                                                                                    </div>
                                                                                )}

                                                                                {item.customizations.sauce?.name && (
                                                                                    <div className="custom-order-detail-row">
                                                                                        <span>Sauce</span>
                                                                                        <strong>
                                                                                            {item.customizations.sauce.name}
                                                                                        </strong>
                                                                                    </div>
                                                                                )}

                                                                                {item.customizations.cheese?.name && (
                                                                                    <div className="custom-order-detail-row">
                                                                                        <span>Cheese</span>
                                                                                        <strong>
                                                                                            {item.customizations.cheese.name}
                                                                                        </strong>
                                                                                    </div>
                                                                                )}

                                                                                {Array.isArray(item.customizations.vegetables) &&
                                                                                    item.customizations.vegetables.length > 0 && (
                                                                                        <div className="custom-order-detail-row">
                                                                                            <span>Vegetables</span>
                                                                                            <strong>
                                                                                                {item.customizations.vegetables
                                                                                                    .map(
                                                                                                        (vegetable) =>
                                                                                                            vegetable.name
                                                                                                    )
                                                                                                    .join(", ")}
                                                                                            </strong>
                                                                                        </div>
                                                                                    )}

                                                                            </div>
                                                                        )}
                                                                    </div>


                                                                    <span>
                                                                        × {quantity}
                                                                    </span>


                                                                    <strong>

                                                                        ₹

                                                                        {
                                                                            lineTotal.toLocaleString(
                                                                                "en-IN"
                                                                            )
                                                                        }

                                                                    </strong>

                                                                </div>

                                                            );

                                                        }

                                                    )
                                                }

                                            </div>

                                        )

                                        : (

                                            <div className="order-detail-empty">

                                                No item details available for this order.

                                            </div>

                                        )
                                }

                            </div>


                            {/* SUMMARY */}

                            <div className="order-details-summary">

                                <div>

                                    <span>
                                        Subtotal
                                    </span>

                                    <strong>

                                        ₹

                                        {

                                            Number(

                                                selectedOrder.subtotal ??

                                                selectedOrder.subTotal ??

                                                selectedOrder.items?.reduce(

                                                    (sum, item) =>

                                                        sum +

                                                        Number(

                                                            item.total ??

                                                            item.subtotal ??

                                                            (item.price || 0) *
                                                            (item.quantity || 1)

                                                        ),

                                                    0

                                                ) ??

                                                0

                                            ).toLocaleString(
                                                "en-IN"
                                            )

                                        }

                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Delivery Fee
                                    </span>

                                    <strong>

                                        ₹

                                        {

                                            Number(

                                                selectedOrder.deliveryFee ??

                                                selectedOrder.deliveryCharge ??

                                                0

                                            ).toLocaleString(
                                                "en-IN"
                                            )

                                        }

                                    </strong>

                                </div>


                                <div className="order-detail-total">

                                    <span>
                                        Total
                                    </span>

                                    <strong>

                                        ₹

                                        {

                                            Number(

                                                selectedOrder.totalAmount ||

                                                selectedOrder.total ||

                                                0

                                            ).toLocaleString(
                                                "en-IN"
                                            )

                                        }

                                    </strong>

                                </div>

                            </div>


                            {/* FOOTER */}

                            <div className="order-details-footer">

                                <div>

                                    <span>
                                        Status
                                    </span>

                                    <strong>
                                        {
                                            selectedOrder.status ||
                                            "Pending"
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Placed
                                    </span>

                                    <strong>

                                        {

                                            selectedOrder.createdAt

                                                ? new Date(
                                                    selectedOrder.createdAt
                                                ).toLocaleString(
                                                    "en-IN"
                                                )

                                                : "Date unavailable"

                                        }

                                    </strong>

                                </div>

                            </div>


                        </div>


                        <div className="pizza-modal-actions">

                            <button
                                type="button"
                                onClick={
                                    closeOrderDetails
                                }
                            >
                                Close
                            </button>

                        </div>


                    </div>

                </div>

            )}


            {/* =====================================================
                PIZZA FORM MODAL
            ===================================================== */}

            {showPizzaForm && (

                <div
                    className="pizza-modal-overlay"

                    onMouseDown={event => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            closePizzaForm();

                        }

                    }}

                >

                    <div className="pizza-modal">


                        <div className="pizza-modal-header">

                            <div>

                                <p>
                                    PIZZA MANAGEMENT
                                </p>

                                <h2>

                                    {
                                        editingPizza
                                            ? "Edit Pizza"
                                            : "Add Pizza"
                                    }

                                </h2>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    closePizzaForm
                                }
                            >

                                <X size={20} />

                            </button>

                        </div>


                        <form
                            className="pizza-form"
                            onSubmit={
                                savePizza
                            }
                        >

                            <div className="pizza-form-grid">


                                <div className="form-field">

                                    <label>
                                        Pizza Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            pizzaForm.name
                                        }
                                        onChange={
                                            handlePizzaChange
                                        }
                                        placeholder="Paneer Tikka Fire"
                                        required
                                    />

                                </div>


                                <div className="form-field">

                                    <label>
                                        Category
                                    </label>

                                    <select
                                        name="category"
                                        value={
                                            pizzaForm.category
                                        }
                                        onChange={
                                            handlePizzaChange
                                        }
                                    >

                                        <option value="Classic">
                                            Classic
                                        </option>

                                        <option value="Premium">
                                            Premium
                                        </option>

                                        <option value="Veg">
                                            Veg
                                        </option>

                                        <option value="Non-Veg">
                                            Non-Veg
                                        </option>

                                        <option value="Special">
                                            Special
                                        </option>

                                    </select>

                                </div>


                                <div className="form-field pizza-form-full">

                                    <label>
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={
                                            pizzaForm.description
                                        }
                                        onChange={
                                            handlePizzaChange
                                        }
                                        placeholder="Describe the pizza..."
                                        rows="3"
                                        required
                                    />

                                </div>


                                <div className="form-field pizza-form-full">

                                    <label>
                                        Image URL
                                    </label>

                                    <input
                                        type="url"
                                        name="image"
                                        value={
                                            pizzaForm.image
                                        }
                                        onChange={
                                            handlePizzaChange
                                        }
                                        placeholder="https://..."
                                    />

                                </div>


                                <div className="form-field">

                                    <label>
                                        Base Price
                                    </label>

                                    <input
                                        type="number"
                                        name="basePrice"
                                        value={
                                            pizzaForm.basePrice
                                        }
                                        onChange={
                                            handlePizzaChange
                                        }
                                        min="0"
                                        step="1"
                                        placeholder="199"
                                        required
                                    />

                                </div>


                                <div className="form-field">

                                    <label>
                                        Stock
                                    </label>

                                    <input
                                        type="number"
                                        name="stock"
                                        value={
                                            pizzaForm.stock
                                        }
                                        onChange={
                                            handlePizzaChange
                                        }
                                        min="0"
                                        step="1"
                                    />

                                </div>


                                <div className="form-field pizza-form-full">

                                    <label>
                                        Toppings
                                    </label>

                                    <input
                                        type="text"
                                        name="toppings"
                                        value={
                                            pizzaForm.toppings
                                        }
                                        onChange={
                                            handlePizzaChange
                                        }
                                        placeholder="Paneer, Onion, Capsicum"
                                    />

                                    <small>
                                        Separate toppings with commas.
                                    </small>

                                </div>


                                <div className="form-field pizza-form-full">

                                    <label>
                                        Size Prices
                                    </label>


                                    <div className="pizza-size-fields">

                                        {
                                            pizzaForm.sizes.map(
                                                (size, index) => (

                                                    <div
                                                        key={
                                                            size.name
                                                        }
                                                    >

                                                        <span>
                                                            {
                                                                size.name
                                                            }
                                                        </span>

                                                        <input
                                                            type="number"
                                                            value={
                                                                size.price
                                                            }
                                                            onChange={
                                                                event =>
                                                                    handleSizeChange(
                                                                        index,
                                                                        event.target.value
                                                                    )
                                                            }
                                                            min="0"
                                                            step="1"
                                                            placeholder="199"
                                                            required
                                                        />

                                                    </div>

                                                )
                                            )
                                        }

                                    </div>

                                </div>


                                <div className="pizza-form-options">


                                    <label>

                                        <input
                                            type="checkbox"
                                            name="isVeg"
                                            checked={
                                                pizzaForm.isVeg
                                            }
                                            onChange={
                                                handlePizzaChange
                                            }
                                        />

                                        Veg Pizza

                                    </label>


                                    <label>

                                        <input
                                            type="checkbox"
                                            name="isAvailable"
                                            checked={
                                                pizzaForm.isAvailable
                                            }
                                            onChange={
                                                handlePizzaChange
                                            }
                                        />

                                        Available

                                    </label>


                                </div>


                            </div>


                            {pizzaError && (

                                <div className="auth-error">
                                    {pizzaError}
                                </div>

                            )}


                            <div className="pizza-modal-actions">

                                <button
                                    type="button"
                                    onClick={
                                        closePizzaForm
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={
                                        pizzaLoading
                                    }
                                >

                                    {
                                        pizzaLoading

                                            ? (

                                                <>

                                                    <RefreshCw
                                                        size={16}
                                                        className="spin"
                                                    />

                                                    Saving...

                                                </>

                                            )

                                            : (

                                                <>

                                                    <Save
                                                        size={16}
                                                    />

                                                    {
                                                        editingPizza
                                                            ? "Update Pizza"
                                                            : "Create Pizza"
                                                    }

                                                </>

                                            )
                                    }

                                </button>

                            </div>


                        </form>


                    </div>

                </div>

            )}


            {/* =====================================================
                TOAST
            ===================================================== */}

            {toast && (

                <div
                    role="status"
                    aria-live="polite"

                    style={{
                        position: "fixed",
                        right: "24px",
                        bottom: "24px",
                        zIndex: 11000,
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        minWidth: "280px",
                        maxWidth: "420px",
                        padding: "14px 16px",
                        border:
                            `1px solid ${toast.type === "error"
                                ? "rgba(255, 82, 61, 0.35)"
                                : "rgba(50, 205, 120, 0.35)"
                            }`,
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
                            "0 18px 50px rgba(0, 0, 0, 0.45)",
                        fontSize: "12px",
                        fontWeight: 700
                    }}
                >

                    <span
                        style={{
                            width: "8px",
                            height: "8px",
                            flexShrink: 0,
                            borderRadius: "50%",
                            background:
                                toast.type === "error"
                                    ? "#ff583d"
                                    : "#35d77b"
                        }}
                    />

                    <span>
                        {toast.message}
                    </span>


                    <button
                        type="button"
                        onClick={() =>
                            setToast(null)
                        }
                        style={{
                            marginLeft: "auto",
                            border: "none",
                            background: "transparent",
                            color: "inherit",
                            cursor: "pointer",
                            fontSize: "18px",
                            lineHeight: 1
                        }}
                    >
                        ×
                    </button>

                </div>

            )}


        </main>

    );

}


export default Admin;