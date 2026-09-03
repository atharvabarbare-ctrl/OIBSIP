import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    MapPin,
    Phone,
    User,
    CreditCard,
    ArrowLeft,
    CheckCircle
} from "lucide-react";

import { useCart } from "../context/CartContext";
import { createOrder } from "../services/api";


// =====================================================
// API
// =====================================================

const API_URL =
    "http://localhost:5000/api";


// =====================================================
// CHECKOUT
// =====================================================

function Checkout() {

    const {
        cart,
        cartTotal,
        clearCart
    } = useCart();

    const navigate =
        useNavigate();


    // =================================================
    // FORM
    // =================================================

    const [form, setForm] =
        useState({

            fullName: "",
            phone: "",
            address: "",
            city: "",
            pincode: ""

        });


    // =================================================
    // PAYMENT
    // =================================================

    const [paymentMethod, setPaymentMethod] =
        useState("COD");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    // =================================================
    // AUTH TOKEN
    // =================================================

    const token =
        localStorage.getItem("token");


    // =================================================
    // TOTAL
    // =================================================

    const subtotal =
        Number(cartTotal) || 0;

    const deliveryFee =
        subtotal >= 500
            ? 0
            : 40;

    const total =
        subtotal +
        deliveryFee;


    // =====================================================
    // LOAD RAZORPAY SCRIPT
    // =====================================================

    useEffect(() => {

        if (window.Razorpay) {
            return;
        }


        const existingScript =
            document.querySelector(
                'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
            );


        if (existingScript) {
            return;
        }


        const script =
            document.createElement("script");


        script.src =
            "https://checkout.razorpay.com/v1/checkout.js";

        script.async =
            true;


        script.onload = () => {

            console.log(
                "Razorpay SDK loaded successfully."
            );

        };


        script.onerror = () => {

            console.error(
                "Failed to load Razorpay SDK."
            );

        };


        document.body.appendChild(
            script
        );

    }, []);


    // =====================================================
    // HANDLE INPUT
    // =====================================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setForm(
            previous => ({

                ...previous,

                [name]:
                    value

            })
        );


        if (error) {
            setError("");
        }

    };


    // =====================================================
    // FORM VALIDATION
    // =====================================================

    const validateForm = () => {

        if (
            !form.fullName.trim()
        ) {

            return (
                "Please enter your full name."
            );

        }


        if (
            !/^\d{10}$/.test(
                form.phone.trim()
            )
        ) {

            return (
                "Please enter a valid 10-digit phone number."
            );

        }


        if (
            !form.address.trim()
        ) {

            return (
                "Please enter your address."
            );

        }


        if (
            !form.city.trim()
        ) {

            return (
                "Please enter your city."
            );

        }


        if (
            !/^\d{6}$/.test(
                form.pincode.trim()
            )
        ) {

            return (
                "Please enter a valid 6-digit pincode."
            );

        }


        if (
            !Array.isArray(cart) ||
            cart.length === 0
        ) {

            return (
                "Your cart is empty."
            );

        }


        return "";

    };


    // =====================================================
    // GET NAME FROM STRING / OBJECT
    // =====================================================

    const getSelectionName = (
        value
    ) => {

        if (
            typeof value ===
            "string"
        ) {

            return value.trim();

        }


        if (
            value &&
            typeof value ===
            "object"
        ) {

            const names = [

                value.name,
                value.label,
                value.value,
                value.title

            ];


            for (
                const name of names
            ) {

                if (
                    typeof name ===
                        "string" &&
                    name.trim()
                ) {

                    return name.trim();

                }

            }

        }


        return "";

    };


    // =====================================================
    // GET PRICE
    // =====================================================

    const getSelectionPrice = (
        value
    ) => {

        if (
            value &&
            typeof value ===
            "object"
        ) {

            return (
                Number(
                    value.price
                ) || 0
            );

        }


        return 0;

    };


    // =====================================================
    // NORMALIZE VEGETABLE
    // =====================================================

    const normalizeVegetable = (
        vegetable
    ) => {

        const name =
            getSelectionName(
                vegetable
            );


        if (!name) {

            throw new Error(
                "Invalid custom pizza vegetable."
            );

        }


        return {

            name,

            price:
                getSelectionPrice(
                    vegetable
                )

        };

    };


    // =====================================================
    // PREPARE ORDER ITEMS
    // =====================================================

    const prepareOrderItems = () => {

        if (
            !Array.isArray(cart) ||
            cart.length === 0
        ) {

            throw new Error(
                "Your cart is empty."
            );

        }


        return cart.map(
            (item, index) => {

                if (!item) {

                    throw new Error(
                        `Invalid cart item at position ${index + 1}.`
                    );

                }


                // =================================================
                // CUSTOM PIZZA
                // =================================================

                if (
                    item.isCustom === true
                ) {

                    const customizations =
                        item.customizations ||
                        {};


                    // ---------------------------------------------
                    // BASE
                    // ---------------------------------------------

                    const rawBase =
                        customizations.base ??
                        item.base ??
                        item.baseName;


                    const baseName =
                        getSelectionName(
                            rawBase
                        );


                    if (!baseName) {

                        throw new Error(
                            "Custom pizza base is missing. Please create the custom pizza again."
                        );

                    }


                    // ---------------------------------------------
                    // SAUCE
                    // ---------------------------------------------

                    const rawSauce =
                        customizations.sauce ??
                        item.sauce ??
                        item.sauceName;


                    const sauceName =
                        getSelectionName(
                            rawSauce
                        );


                    if (!sauceName) {

                        throw new Error(
                            "Custom pizza sauce is missing. Please create the custom pizza again."
                        );

                    }


                    // ---------------------------------------------
                    // CHEESE
                    // ---------------------------------------------

                    const rawCheese =
                        customizations.cheese ??
                        item.cheese ??
                        item.cheeseName;


                    const cheeseName =
                        getSelectionName(
                            rawCheese
                        );


                    if (!cheeseName) {

                        throw new Error(
                            "Custom pizza cheese is missing. Please create the custom pizza again."
                        );

                    }


                    // ---------------------------------------------
                    // SIZE
                    // ---------------------------------------------

                    const rawSize =
                        item.selectedSize ??
                        item.size;


                    const sizeName =
                        getSelectionName(
                            rawSize
                        );


                    if (!sizeName) {

                        throw new Error(
                            "Custom pizza size is missing."
                        );

                    }


                    // ---------------------------------------------
                    // QUANTITY
                    // ---------------------------------------------

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
                            "Invalid custom pizza quantity."
                        );

                    }


                    // ---------------------------------------------
                    // VEGETABLES
                    // ---------------------------------------------

                    const rawVegetables =
                        customizations.vegetables ??
                        item.vegetables ??
                        [];


                    const vegetables =
                        Array.isArray(
                            rawVegetables
                        )

                            ? rawVegetables.map(
                                normalizeVegetable
                            )

                            : [];


                    // ---------------------------------------------
                    // FINAL CUSTOM PIZZA
                    // ---------------------------------------------

                    return {

                        pizza:
                            null,

                        isCustom:
                            true,

                        name:
                            item.name ||
                            "Custom Pizza",

                        image:
                            item.image ||
                            "",


                        size: {

                            name:
                                sizeName,

                            price:
                                getSelectionPrice(
                                    rawSize
                                )

                        },


                        quantity,


                        customizations: {

                            base: {

                                name:
                                    baseName,

                                price:
                                    getSelectionPrice(
                                        rawBase
                                    )

                            },


                            sauce: {

                                name:
                                    sauceName,

                                price:
                                    getSelectionPrice(
                                        rawSauce
                                    )

                            },


                            cheese: {

                                name:
                                    cheeseName,

                                price:
                                    getSelectionPrice(
                                        rawCheese
                                    )

                            },


                            vegetables

                        }

                    };

                }


                // =================================================
                // NORMAL PIZZA
                // =================================================

                const pizzaId =
                    item._id ||
                    item.pizza;


                if (!pizzaId) {

                    throw new Error(
                        `Pizza ID is missing for "${item.name || "Pizza"}".`
                    );

                }


                const rawSize =
                    item.selectedSize ??
                    item.size;


                const sizeName =
                    getSelectionName(
                        rawSize
                    );


                if (!sizeName) {

                    throw new Error(
                        `Pizza size is missing for "${item.name || "Pizza"}".`
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
                        `Invalid quantity for "${item.name || "Pizza"}".`
                    );

                }


                return {

                    pizza:
                        pizzaId,

                    isCustom:
                        false,

                    name:
                        item.name ||
                        "Pizza",

                    image:
                        item.image ||
                        "",


                    size: {

                        name:
                            sizeName,

                        price:
                            getSelectionPrice(
                                rawSize
                            )

                    },


                    quantity

                };

            }
        );

    };
    // =====================================================
    // CREATE RAZORPAY ORDER
    // =====================================================

    const createPaymentOrder = async () => {

        const items =
            prepareOrderItems();


        const response =
            await fetch(
                `${API_URL}/payments/create-order`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({

                        items,

                        deliveryAddress:
                            form

                    })
                }
            );


        let data;

        try {

            data =
                await response.json();

        } catch {

            throw new Error(
                "Server returned an invalid response."
            );

        }


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to create Razorpay order."
            );

        }


        if (
            !data.razorpayOrderId
        ) {

            throw new Error(
                "Razorpay order ID was not received from server."
            );

        }


        return {

            ...data,

            items

        };

    };


    // =====================================================
    // VERIFY RAZORPAY PAYMENT
    // =====================================================

    const verifyPayment = async (
        paymentResponse,
        paymentOrderData
    ) => {

        // ---------------------------------------------
        // CHECK RAZORPAY RESPONSE
        // ---------------------------------------------

        if (
            !paymentResponse?.razorpay_order_id ||
            !paymentResponse?.razorpay_payment_id ||
            !paymentResponse?.razorpay_signature
        ) {

            throw new Error(
                "Razorpay payment response is incomplete. Please try again."
            );

        }


        const response =
            await fetch(
                `${API_URL}/payments/verify`,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body: JSON.stringify({

                        razorpay_order_id:
                            paymentResponse.razorpay_order_id,

                        razorpay_payment_id:
                            paymentResponse.razorpay_payment_id,

                        razorpay_signature:
                            paymentResponse.razorpay_signature,

                        items:
                            paymentOrderData.items,

                        deliveryAddress:
                            form

                    })

                }
            );


        let data;

        try {

            data =
                await response.json();

        } catch {

            throw new Error(
                "Server returned an invalid payment verification response."
            );

        }


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Payment verification failed."
            );

        }


        if (
            !data.order ||
            !data.order._id
        ) {

            throw new Error(
                "Payment was successful but order details were not received."
            );

        }


        return data;

    };


    // =====================================================
    // ONLINE PAYMENT
    // =====================================================

    const handleOnlinePayment = async () => {

        try {

            setLoading(true);
            setError("");


            // ---------------------------------------------
            // AUTH
            // ---------------------------------------------

            if (!token) {

                navigate("/login");

                return;

            }


            // ---------------------------------------------
            // RAZORPAY SDK
            // ---------------------------------------------

            if (
                !window.Razorpay
            ) {

                throw new Error(
                    "Razorpay is still loading. Please try again."
                );

            }


            // ---------------------------------------------
            // CREATE SERVER ORDER
            // ---------------------------------------------
            
            const paymentOrderData =
                await createPaymentOrder();


            // ---------------------------------------------
            // RAZORPAY KEY
            // ---------------------------------------------

            const razorpayKey =
                import.meta.env
                    .VITE_RAZORPAY_KEY_ID;


            if (!razorpayKey) {

                throw new Error(
                    "Razorpay Key ID is missing. Check client .env file."
                );

            }


            // ---------------------------------------------
            // RAZORPAY OPTIONS
            // ---------------------------------------------

            const options = {

                key:
                    razorpayKey,

                amount:
                    Number(
                        paymentOrderData.amount
                    ),

                currency:
                    paymentOrderData.currency ||
                    "INR",

                name:
                    "PizzaHub",

                description:
                    "PizzaHub Pizza Order",

                order_id:
                    paymentOrderData.razorpayOrderId,


                // -----------------------------------------
                // CUSTOMER DETAILS
                // -----------------------------------------

                prefill: {

                    name:
                        form.fullName,

                    contact:
                        form.phone

                },


                // -----------------------------------------
                // NOTES
                // -----------------------------------------

                notes: {

                    address:
                        `${form.address}, ${form.city} - ${form.pincode}`

                },


                // -----------------------------------------
                // THEME
                // -----------------------------------------

                theme: {

                    color:
                        "#ff573f"

                },


                // -----------------------------------------
                // SUCCESS
                // -----------------------------------------

                handler:
                    async (response) => {

                        try {

                            setLoading(true);
                            setError("");


                            console.log(
                                "Razorpay success response:",
                                response
                            );


                            const result =
                                await verifyPayment(
                                    response,
                                    paymentOrderData
                                );


                            clearCart();


                            navigate(
                                `/order-success/${result.order._id}`
                            );


                        } catch (err) {

                            console.error(
                                "Payment verification error:",
                                err
                            );


                            setError(
                                err.message ||
                                "Payment verification failed."
                            );


                            setLoading(false);

                        }

                    },


                // -----------------------------------------
                // MODAL DISMISSED
                // -----------------------------------------

                modal: {

                    ondismiss:
                        () => {

                            setLoading(false);

                        }

                }

            };


            // ---------------------------------------------
            // CREATE RAZORPAY INSTANCE
            // ---------------------------------------------

            const razorpay =
                new window.Razorpay(
                    options
                );


            // ---------------------------------------------
            // PAYMENT FAILED
            // ---------------------------------------------

            razorpay.on(
                "payment.failed",
                (response) => {

                    console.error(
                        "Razorpay payment failed:",
                        response?.error
                    );


                    setError(
                        response?.error?.description ||
                        "Payment failed. Please try again."
                    );


                    setLoading(false);

                }
            );


            // ---------------------------------------------
            // OPEN RAZORPAY
            // ---------------------------------------------

            razorpay.open();

        } catch (err) {

            console.error(
                "Online payment error:",
                err
            );


            setError(
                err.message ||
                "Unable to start online payment."
            );


            setLoading(false);

        }

    };


    // =====================================================
    // COD ORDER
    // =====================================================

    const handleCODOrder = async () => {

        try {

            setLoading(true);
            setError("");


            if (!token) {

                navigate("/login");

                return;

            }


            const items =
                prepareOrderItems();


            const orderData = {

                items,

                deliveryAddress:
                    form,

                paymentMethod:
                    "COD"

            };


            const data =
                await createOrder(
                    orderData,
                    token
                );


            if (
                !data ||
                !data.success
            ) {

                throw new Error(
                    data?.message ||
                    "Unable to place COD order."
                );

            }


            if (
                !data.order ||
                !data.order._id
            ) {

                throw new Error(
                    "Order was created but order ID was not received."
                );

            }


            clearCart();


            navigate(
                `/order-success/${data.order._id}`
            );


        } catch (err) {

            console.error(
                "COD order error:",
                err
            );


            setError(
                err.message ||
                "Unable to place order."
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // SUBMIT CHECKOUT
    // =====================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();


        setError("");


        // ---------------------------------------------
        // LOGIN
        // ---------------------------------------------

        if (!token) {

            navigate("/login");

            return;

        }


        // ---------------------------------------------
        // FORM VALIDATION
        // ---------------------------------------------

        const validationError =
            validateForm();


        if (validationError) {

            setError(
                validationError
            );

            return;

        }


        // ---------------------------------------------
        // PAYMENT METHOD
        // ---------------------------------------------

        if (
            paymentMethod ===
            "ONLINE"
        ) {

            await handleOnlinePayment();

        } else {

            await handleCODOrder();

        }

    };


    // =====================================================
    // EMPTY CART
    // =====================================================

    if (
        !Array.isArray(cart) ||
        cart.length === 0
    ) {

        return (

            <main
                style={{
                    minHeight:
                        "70vh",

                    display:
                        "flex",

                    flexDirection:
                        "column",

                    alignItems:
                        "center",

                    justifyContent:
                        "center",

                    gap:
                        "15px",

                    padding:
                        "40px"

                }}
            >

                <CheckCircle
                    size={55}
                />

                <h1>
                    Your cart is empty
                </h1>

                <p>
                    Add some delicious pizzas
                    before checking out.
                </p>


                <Link
                    to="/menu"
                    style={{
                        textDecoration:
                            "none",

                        padding:
                            "12px 24px",

                        borderRadius:
                            "8px",

                        background:
                            "#ff573f",

                        color:
                            "#fff",

                        fontWeight:
                            "600"

                    }}
                >

                    Browse Pizzas

                </Link>

            </main>

        );

    }
    // =====================================================
    // CHECKOUT UI
    // =====================================================

        // =====================================================
    // CHECKOUT UI
    // =====================================================

    return (
        <div className="checkout-page">

            <div className="checkout-container">

                {/* BACK */}
                <Link
                    to="/cart"
                    className="back-menu"
                >
                    <ArrowLeft size={17} />
                    Back to Cart
                </Link>


                {/* HEADING */}
                <div className="checkout-heading">

                    <p>YOUR ORDER</p>

                    <h1>
                        Check<span>out.</span>
                    </h1>

                </div>


                {/* ERROR */}
                {error && (
                    <div className="checkout-error">
                        {error}
                    </div>
                )}


                {/* MAIN */}
                <form
                    onSubmit={handleSubmit}
                    className="checkout-layout"
                >

                    {/* =================================================
                        LEFT SIDE
                    ================================================= */}

                    <div className="checkout-form">


                        {/* =================================================
                            DELIVERY
                        ================================================= */}

                        <section className="checkout-section">

                            <div className="section-title">

                                <MapPin size={20} />

                                <div>

                                    <h2>
                                        Delivery Details
                                    </h2>

                                    <p>
                                        Enter your delivery information.
                                    </p>

                                </div>

                            </div>


                            <div className="form-grid">


                                {/* NAME */}

                                <div className="form-field">

                                    <label>
                                        Full Name
                                    </label>

                                    <div className="input-wrap">

                                        <User size={17} />

                                        <input
                                            type="text"
                                            name="fullName"
                                            value={form.fullName}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            autoComplete="name"
                                        />

                                    </div>

                                </div>


                                {/* PHONE */}

                                <div className="form-field">

                                    <label>
                                        Phone Number
                                    </label>

                                    <div className="input-wrap">

                                        <Phone size={17} />

                                        <input
                                            type="tel"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            maxLength={10}
                                            inputMode="numeric"
                                            autoComplete="tel"
                                            placeholder="10-digit mobile number"
                                        />

                                    </div>

                                </div>


                                {/* ADDRESS */}

                                <div className="form-field full">

                                    <label>
                                        Address
                                    </label>

                                    <div className="input-wrap">

                                        <MapPin size={17} />

                                        <input
                                            type="text"
                                            name="address"
                                            value={form.address}
                                            onChange={handleChange}
                                            placeholder="House no, street, area"
                                            autoComplete="street-address"
                                        />

                                    </div>

                                </div>


                                {/* CITY */}

                                <div className="form-field">

                                    <label>
                                        City
                                    </label>

                                    <input
                                        type="text"
                                        name="city"
                                        value={form.city}
                                        onChange={handleChange}
                                        placeholder="Enter your city"
                                        autoComplete="address-level2"
                                    />

                                </div>


                                {/* PINCODE */}

                                <div className="form-field">

                                    <label>
                                        Pincode
                                    </label>

                                    <input
                                        type="text"
                                        name="pincode"
                                        value={form.pincode}
                                        onChange={handleChange}
                                        maxLength={6}
                                        inputMode="numeric"
                                        autoComplete="postal-code"
                                        placeholder="6-digit pincode"
                                    />

                                </div>

                            </div>

                        </section>


                        {/* =================================================
                            PAYMENT
                        ================================================= */}

                        <section className="checkout-section">

                            <div className="section-title">

                                <CreditCard size={20} />

                                <div>

                                    <h2>
                                        Payment Method
                                    </h2>

                                    <p>
                                        Choose how you want to pay.
                                    </p>

                                </div>

                            </div>


                            <div className="payment-options">


                                {/* COD */}

                                <label
                                    className={`payment-option ${
                                        paymentMethod === "COD"
                                            ? "active"
                                            : ""
                                    }`}
                                >

                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="COD"
                                        checked={
                                            paymentMethod === "COD"
                                        }
                                        onChange={(event) => {

                                            setPaymentMethod(
                                                event.target.value
                                            );

                                            setError("");

                                        }}
                                    />

                                    <span>
                                        💵
                                    </span>

                                    <div>

                                        <strong>
                                            Cash on Delivery
                                        </strong>

                                        <small>
                                            Pay when your order arrives
                                        </small>

                                    </div>

                                </label>


                                {/* ONLINE */}

                                <label
                                    className={`payment-option ${
                                        paymentMethod === "ONLINE"
                                            ? "active"
                                            : ""
                                    }`}
                                >

                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="ONLINE"
                                        checked={
                                            paymentMethod === "ONLINE"
                                        }
                                        onChange={(event) => {

                                            setPaymentMethod(
                                                event.target.value
                                            );

                                            setError("");

                                        }}
                                    />

                                    <span>
                                        💳
                                    </span>

                                    <div>

                                        <strong>
                                            Online Payment
                                        </strong>

                                        <small>
                                            Pay securely with Razorpay
                                        </small>

                                    </div>

                                </label>

                            </div>

                        </section>


                        {/* =================================================
                            ITEMS
                        ================================================= */}

                        <section className="checkout-section">

                            <div className="section-title">

                                <span>
                                    🍕
                                </span>

                                <div>

                                    <h2>
                                        Your Items
                                    </h2>

                                    <p>
                                        Review your order before placing it.
                                    </p>

                                </div>

                            </div>


                            <div className="summary-items">

                                {cart.map(
                                    (item, index) => {

                                        const itemPrice =
                                            Number(
                                                item.selectedSize?.price ??
                                                item.size?.price
                                            ) || 0;


                                        const quantity =
                                            Number(
                                                item.quantity
                                            ) || 0;


                                        return (

                                            <div
                                                className="summary-item"
                                                key={
                                                    item._id ||
                                                    item.id ||
                                                    `item-${index}`
                                                }
                                            >

                                                {item.image ? (

                                                    <img
                                                        src={item.image}
                                                        alt={
                                                            item.name ||
                                                            "Pizza"
                                                        }
                                                    />

                                                ) : (

                                                    <div
                                                        className="summary-image-placeholder"
                                                    >
                                                        🍕
                                                    </div>

                                                )}


                                                <div>

                                                    <strong>
                                                        {
                                                            item.name ||
                                                            "Pizza"
                                                        }
                                                    </strong>

                                                    <small>

                                                        Qty {quantity}

                                                        {(item.selectedSize?.name ||
                                                            item.size?.name) && (
                                                            <>
                                                                {" • "}
                                                                {
                                                                    item.selectedSize?.name ||
                                                                    item.size?.name
                                                                }
                                                            </>
                                                        )}

                                                        {item.isCustom === true && (
                                                            <>
                                                                {" • Custom"}
                                                            </>
                                                        )}

                                                    </small>

                                                </div>


                                                <b>
                                                    ₹
                                                    {(
                                                        itemPrice *
                                                        quantity
                                                    ).toFixed(2)}
                                                </b>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        </section>


                        {/* =================================================
                            SUBMIT BUTTON
                        ================================================= */}

                        <button
                            type="submit"
                            className="place-order-btn"
                            disabled={loading}
                        >

                            {loading ? (

                                <>
                                    <span>
                                        ⏳
                                    </span>

                                    Processing...
                                </>

                            ) : (

                                <>
                                    <CheckCircle
                                        size={18}
                                    />

                                    {paymentMethod === "ONLINE"
                                        ? "Pay Now"
                                        : "Place Order"}

                                </>

                            )}

                        </button>

                    </div>


                    {/* =================================================
                        RIGHT — ORDER SUMMARY
                    ================================================= */}

                    <aside className="order-summary">

                        <p className="summary-label">
                            ORDER SUMMARY
                        </p>


                        <h2>
                            Your Order
                        </h2>


                        {/* ITEMS */}

                        <div className="summary-items">

                            {cart.map(
                                (item, index) => {

                                    const price =
                                        Number(
                                            item.selectedSize?.price ??
                                            item.size?.price
                                        ) || 0;


                                    const quantity =
                                        Number(
                                            item.quantity
                                        ) || 0;


                                    return (

                                        <div
                                            className="summary-item"
                                            key={
                                                `summary-${item._id || index}`
                                            }
                                        >

                                            {item.image ? (

                                                <img
                                                    src={item.image}
                                                    alt={
                                                        item.name ||
                                                        "Pizza"
                                                    }
                                                />

                                            ) : (

                                                <div
                                                    className="summary-image-placeholder"
                                                >
                                                    🍕
                                                </div>

                                            )}


                                            <div>

                                                <strong>
                                                    {
                                                        item.name ||
                                                        "Pizza"
                                                    }
                                                </strong>

                                                <small>

                                                    {item.selectedSize?.name ||
                                                        item.size?.name ||
                                                        "Regular"}

                                                    {" × "}

                                                    {quantity}

                                                </small>

                                            </div>


                                            <b>
                                                ₹
                                                {(
                                                    price *
                                                    quantity
                                                ).toFixed(2)}
                                            </b>

                                        </div>

                                    );

                                }
                            )}

                        </div>


                        {/* TOTALS */}

                        <div className="summary-total">


                            <div>

                                <span>
                                    Subtotal
                                </span>

                                <strong>
                                    ₹
                                    {subtotal.toFixed(2)}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Delivery Fee
                                </span>

                                <strong>

                                    {deliveryFee === 0
                                        ? "FREE"
                                        : `₹${deliveryFee.toFixed(2)}`}

                                </strong>

                            </div>


                            <hr />


                            <div className="grand-total">

                                <span>
                                    Total
                                </span>

                                <strong>
                                    ₹
                                    {total.toFixed(2)}
                                </strong>

                            </div>

                        </div>


                        <button
                            type="submit"
                            className="place-order-btn"
                            disabled={loading}
                        >

                            {loading ? (
                                "Processing..."
                            ) : (
                                paymentMethod === "ONLINE"
                                    ? "Pay Now"
                                    : "Place Order"
                            )}

                        </button>


                        <p className="checkout-security">
                            🔒 Your payment details are securely processed.
                        </p>

                    </aside>

                </form>

            </div>

        </div>
    );
}
// =====================================================
// EXPORT
// =====================================================

export default Checkout;