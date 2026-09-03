import { useEffect, useState } from "react";
import {
    Package,
    MapPin,
    CreditCard,
    Clock,
    XCircle,
    RefreshCw,
    CheckCircle2,
    ChefHat,
    Truck
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const STATUS_STEPS = [
    {
        key: "Pending",
        label: "Order Placed",
        icon: Package
    },
    {
        key: "Confirmed",
        label: "Confirmed",
        icon: CheckCircle2
    },
    {
        key: "Preparing",
        label: "Preparing",
        icon: ChefHat
    },
    {
        key: "Out for Delivery",
        label: "Out for Delivery",
        icon: Truck
    },
    {
        key: "Delivered",
        label: "Delivered",
        icon: CheckCircle2
    }
];


function MyOrders() {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);


    // =========================
    // TOKEN
    // =========================

    const getToken = () => {
        return (
            localStorage.getItem("token") ||
            localStorage.getItem("authToken")
        );
    };


    // =========================
    // FETCH ORDERS
    // =========================

    const fetchOrders = async (showLoading = false) => {

        try {

            if (showLoading) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");

            const token = getToken();

            if (!token) {
                setError("Please login to view your orders.");
                return;
            }


            const response = await fetch(
                `${API_URL}/orders/my-orders`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            const data = await response.json();


            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to fetch orders."
                );
            }


            setOrders(data.orders || []);


        } catch (err) {

            console.error(
                "Fetch orders error:",
                err
            );

            /*
             * Don't destroy the existing
             * order list because of a temporary
             * background refresh error.
             */

            if (showLoading) {
                setError(err.message);
            }


        } finally {

            if (showLoading) {
                setLoading(false);
            }

            setRefreshing(false);

        }

    };


    // =========================
    // INITIAL FETCH + POLLING
    // =========================

    useEffect(() => {

        // Initial page load
        fetchOrders(true);


        // Background refresh every 5 seconds
        const interval = setInterval(() => {

            fetchOrders(false);

        }, 5000);


        return () => {

            clearInterval(interval);

        };

    }, []);


    // =========================
    // CANCEL ORDER
    // =========================

    const cancelOrder = async (orderId) => {

        const confirmed = window.confirm(
            "Are you sure you want to cancel this order?"
        );


        if (!confirmed) {
            return;
        }


        try {

            const token = getToken();


            const response = await fetch(
                `${API_URL}/orders/${orderId}/cancel`,
                {
                    method: "PUT",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to cancel order."
                );

            }


            alert(
                "Order cancelled successfully!"
            );


            // Immediately refresh
            await fetchOrders(false);


        } catch (err) {

            console.error(
                "Cancel order error:",
                err
            );

            alert(err.message);

        }

    };


    // =========================
    // STATUS HELPERS
    // =========================

    const getCurrentStep = (status) => {

        if (status === "Cancelled") {
            return -1;
        }


        return STATUS_STEPS.findIndex(
            (step) =>
                step.key === status
        );

    };


    const getStatusClass = (status) => {

        return status
            .toLowerCase()
            .replaceAll(" ", "-");

    };


    // =========================
    // ITEM PRICE
    // =========================

    const getItemUnitPrice = (item) => {

        /*
         * Start with pizza size price
         */

        let price =
            Number(
                item.size?.price || 0
            );


        /*
         * Custom Pizza
         */

        if (item.isCustom) {

            price += Number(
                item.customizations?.base?.price ||
                0
            );

            price += Number(
                item.customizations?.sauce?.price ||
                0
            );

            price += Number(
                item.customizations?.cheese?.price ||
                0
            );


            const vegetables =
                Array.isArray(
                    item.customizations?.vegetables
                )
                    ? item.customizations.vegetables
                    : [];


            vegetables.forEach(
                (vegetable) => {

                    price += Number(
                        vegetable?.price || 0
                    );

                }
            );

        }


        /*
         * Fallback for old order data
         */

        if (
            price === 0 &&
            item.price != null
        ) {

            price =
                Number(item.price);

        }


        if (
            price === 0 &&
            item.unitPrice != null
        ) {

            price =
                Number(item.unitPrice);

        }


        return price;

    };


    const getItemTotal = (item) => {

        const quantity =
            Number(
                item.quantity ||
                item.qty ||
                1
            );


        const unitPrice =
            getItemUnitPrice(item);


        return (
            unitPrice *
            quantity
        );

    };


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (

            <main className="orders-page">

                <div className="orders-loading">

                    <RefreshCw
                        size={30}
                        className="loading-icon"
                    />

                    <p>
                        Loading your orders...
                    </p>

                </div>

            </main>

        );

    }


    // =========================
    // ERROR
    // =========================

    if (error) {

        return (

            <main className="orders-page">

                <div className="orders-empty">

                    <Package size={55} />

                    <h2>
                        {error}
                    </h2>


                    <button
                        className="orders-retry"
                        onClick={() =>
                            fetchOrders(true)
                        }
                    >

                        <RefreshCw
                            size={16}
                        />

                        Try Again

                    </button>

                </div>

            </main>

        );

    }


    // =========================
    // PAGE
    // =========================

    return (

        <main className="orders-page">

            <div className="orders-container">


                {/* =========================
                    HEADER
                ========================= */}

                <div className="orders-heading">

                    <p>
                        ORDER HISTORY
                    </p>


                    <h1>
                        Your <span>orders.</span>
                    </h1>


                    <div className="orders-heading-bottom">

                        <span>

                            {orders.length}

                            {" "}

                            {orders.length === 1
                                ? "order"
                                : "orders"}

                            {" "}placed

                        </span>


                        <button
                            onClick={() =>
                                fetchOrders(false)
                            }
                            className="refresh-orders"
                            disabled={refreshing}
                        >

                            <RefreshCw
                                size={15}
                                className={
                                    refreshing
                                        ? "refresh-spinning"
                                        : ""
                                }
                            />

                            {refreshing
                                ? "Refreshing..."
                                : "Refresh"}

                        </button>

                    </div>

                </div>


                {/* =========================
                    EMPTY
                ========================= */}

                {orders.length === 0 ? (

                    <div className="orders-empty">

                        <Package size={60} />

                        <h2>
                            No orders yet.
                        </h2>


                        <p>
                            Your delicious pizza journey
                            starts here.
                        </p>


                        <a
                            href="/menu"
                            className="orders-menu-btn"
                        >
                            Explore Menu
                        </a>

                    </div>

                ) : (


                    <div className="orders-list">


                        {orders.map((order) => {


                            const currentStep =
                                getCurrentStep(
                                    order.status
                                );


                            return (

                                <article
                                    className="order-card"
                                    key={order._id}
                                >


                                    {/* =========================
                                        ORDER HEADER
                                    ========================= */}

                                    <div className="order-card-header">

                                        <div>

                                            <span className="order-label">
                                                ORDER ID
                                            </span>


                                            <strong>

                                                #
                                                {order._id
                                                    .slice(-8)
                                                    .toUpperCase()}

                                            </strong>

                                        </div>


                                        <div
                                            className={
                                                `order-status ${
                                                    getStatusClass(
                                                        order.status
                                                    )
                                                }`
                                            }
                                        >

                                            <Clock
                                                size={14}
                                            />

                                            {order.status}

                                        </div>

                                    </div>


                                    {/* DATE */}

                                    <div className="order-date">

                                        Ordered on{" "}

                                        {new Date(
                                            order.createdAt
                                        ).toLocaleDateString(
                                            "en-IN",
                                            {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric"
                                            }
                                        )}

                                    </div>


                                    {/* =========================
                                        TRACKING
                                    ========================= */}

                                    {order.status ===
                                    "Cancelled" ? (

                                        <div className="cancelled-tracking">

                                            <XCircle
                                                size={24}
                                            />

                                            <div>

                                                <strong>
                                                    Order Cancelled
                                                </strong>

                                                <p>
                                                    This order has been
                                                    cancelled.
                                                </p>

                                            </div>

                                        </div>

                                    ) : (

                                        <div className="order-tracking">

                                            {STATUS_STEPS.map(
                                                (
                                                    step,
                                                    index
                                                ) => {

                                                    const Icon =
                                                        step.icon;


                                                    const completed =
                                                        index <=
                                                        currentStep;


                                                    const active =
                                                        index ===
                                                        currentStep;


                                                    return (

                                                        <div
                                                            className={
                                                                `tracking-step ${
                                                                    completed
                                                                        ? "completed"
                                                                        : ""
                                                                } ${
                                                                    active
                                                                        ? "active"
                                                                        : ""
                                                                }`
                                                            }
                                                            key={
                                                                step.key
                                                            }
                                                        >

                                                            <div className="tracking-icon">

                                                                <Icon
                                                                    size={17}
                                                                />

                                                            </div>


                                                            <span>

                                                                {
                                                                    step.label
                                                                }

                                                            </span>


                                                            {index <
                                                                STATUS_STEPS.length -
                                                                1 && (

                                                                <div
                                                                    className={
                                                                        `tracking-line ${
                                                                            index <
                                                                            currentStep
                                                                                ? "filled"
                                                                                : ""
                                                                        }`
                                                                    }
                                                                />

                                                            )}

                                                        </div>

                                                    );

                                                }
                                            )}

                                        </div>

                                    )}


                                    {/* =========================
                                        ITEMS
                                    ========================= */}

                                    <div className="order-items">


                                        {order.items.map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <div
                                                    className="order-item"
                                                    key={
                                                        `${order._id}-${index}`
                                                    }
                                                >


                                                    <img
                                                        src={
                                                            item.image ||
                                                            item.pizza?.image
                                                        }
                                                        alt={
                                                            item.name ||
                                                            "Pizza"
                                                        }
                                                    />


                                                    <div className="order-item-info">

                                                        <h3>
                                                            {
                                                                item.name ||
                                                                item.pizza?.name ||
                                                                "Pizza"
                                                            }
                                                        </h3>


                                                        <p>

                                                            {
                                                                item.size?.name ||
                                                                item.size ||
                                                                "Regular"
                                                            }

                                                            {" × "}

                                                            {
                                                                item.quantity ||
                                                                1
                                                            }

                                                        </p>


                                                        {/* CUSTOMIZATION INFO */}

                                                        {item.isCustom &&
                                                            item.customizations && (

                                                            <small>

                                                                {item.customizations.base?.name &&
                                                                    `Base: ${item.customizations.base.name}`}

                                                                {item.customizations.sauce?.name &&
                                                                    ` • Sauce: ${item.customizations.sauce.name}`}

                                                                {item.customizations.cheese?.name &&
                                                                    ` • Cheese: ${item.customizations.cheese.name}`}

                                                            </small>

                                                        )}

                                                    </div>


                                                    <strong>

                                                        ₹
                                                        {getItemTotal(
                                                            item
                                                        ).toFixed(0)}

                                                    </strong>

                                                </div>

                                            )
                                        )}

                                    </div>


                                    {/* =========================
                                        DETAILS
                                    ========================= */}

                                    <div className="order-details">


                                        <div>

                                            <MapPin
                                                size={16}
                                            />

                                            <div>

                                                <span>
                                                    Delivery
                                                </span>

                                                <p>

                                                    {
                                                        order
                                                            .deliveryAddress
                                                            ?.city
                                                    }

                                                    {" · "}

                                                    {
                                                        order
                                                            .deliveryAddress
                                                            ?.pincode
                                                    }

                                                </p>

                                            </div>

                                        </div>


                                        <div>

                                            <CreditCard
                                                size={16}
                                            />

                                            <div>

                                                <span>
                                                    Payment
                                                </span>

                                                <p>

                                                    {
                                                        order.paymentMethod ===
                                                        "COD"
                                                            ? "Cash on Delivery"
                                                            : "Online Payment"
                                                    }

                                                </p>

                                            </div>

                                        </div>

                                    </div>


                                    {/* =========================
                                        FOOTER
                                    ========================= */}

                                    <div className="order-card-footer">


                                        <div>

                                            <span>
                                                Total
                                            </span>

                                            <strong>

                                                ₹
                                                {Number(
                                                    order.totalAmount ||
                                                    0
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}

                                            </strong>

                                        </div>


                                        {(order.status ===
                                            "Pending" ||
                                            order.status ===
                                            "Confirmed") && (

                                            <button
                                                className="cancel-order-btn"
                                                onClick={() =>
                                                    cancelOrder(
                                                        order._id
                                                    )
                                                }
                                            >

                                                <XCircle
                                                    size={16}
                                                />

                                                Cancel Order

                                            </button>

                                        )}

                                    </div>


                                </article>

                            );

                        })}

                    </div>

                )}

            </div>

        </main>

    );

}


export default MyOrders;