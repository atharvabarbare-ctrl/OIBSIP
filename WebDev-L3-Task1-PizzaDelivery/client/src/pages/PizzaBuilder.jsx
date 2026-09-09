import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    ArrowLeft,
    ShoppingBag,
    Check,
    RefreshCw,
    AlertCircle
} from "lucide-react";

import { useCart } from "../context/CartContext";


/* =====================================================
   CUSTOM PIZZA PRICES
   Inventory controls availability/stock.
   These prices remain server-compatible.
===================================================== */

const BASE_PRICES = {

    "Classic Hand Tossed": 40,

    "Thin Crust": 50,

    "Cheese Burst": 80

};


const SAUCE_PRICES = {

    "Classic Tomato": 20,

    "Spicy Peri Peri": 30,

    "Creamy Garlic": 35

};


const CHEESE_PRICES = {

    "Mozzarella": 40,

    "Cheddar": 50,

    "Mozzarella + Cheddar": 70

};


const VEGETABLE_PRICES = {

    Onion: 15,

    Capsicum: 15,

    "Sweet Corn": 20,

    Mushroom: 25,

    Jalapeno: 20,

    Olives: 25

};


/* =====================================================
   SIZES
===================================================== */

const SIZES = [

    {
        name: "Small",
        price: 149
    },

    {
        name: "Medium",
        price: 199
    },

    {
        name: "Large",
        price: 249
    }

];


/* =====================================================
   INVENTORY API
===================================================== */

const INVENTORY_API =
    `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/inventory`;


/* =====================================================
   HELPER
===================================================== */

const makeOption = (
    item,
    price
) => ({

    name:
        item.name,

    price,

    stock:
        Number(item.stock || 0),

    isAvailable:
        item.isAvailable !== false,

    inventoryId:
        item._id

});


/* =====================================================
   COMPONENT
===================================================== */

function PizzaBuilder() {

    const navigate =
        useNavigate();


    const { addToCart } =
        useCart();


    /* =================================================
       INVENTORY STATE
    ================================================= */

    const [
        inventory,
        setInventory
    ] = useState({

        Base: [],

        Sauce: [],

        Cheese: [],

        Vegetable: []

    });


    const [
        inventoryLoading,
        setInventoryLoading
    ] = useState(true);


    const [
        inventoryError,
        setInventoryError
    ] = useState("");


    /* =================================================
       SELECTED OPTIONS
    ================================================= */

    const [
        selectedBase,
        setSelectedBase
    ] = useState(null);


    const [
        selectedSauce,
        setSelectedSauce
    ] = useState(null);


    const [
        selectedCheese,
        setSelectedCheese
    ] = useState(null);


    const [
        selectedSize,
        setSelectedSize
    ] = useState(
        SIZES[0]
    );


    const [
        selectedVegetables,
        setSelectedVegetables
    ] = useState([]);


    /* =================================================
       LOAD INVENTORY
    ================================================= */

    const loadInventory =
        async () => {

            try {

                setInventoryLoading(
                    true
                );

                setInventoryError("");


                const response =
                    await fetch(
                        INVENTORY_API
                    );


                const data =
                    await response.json();


                if (
                    !response.ok
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to load ingredients."
                    );

                }


                const items =
                    data.inventory || [];


                const grouped = {

                    Base: [],

                    Sauce: [],

                    Cheese: [],

                    Vegetable: []

                };


                items.forEach(
                    item => {

                        if (
                            grouped[
                                item.category
                            ]
                        ) {

                            grouped[
                                item.category
                            ].push(item);

                        }

                    }
                );


                /* =========================
                   ONLY AVAILABLE BASES
                ========================= */

                grouped.Base =
                    grouped.Base
                        .filter(
                            item =>
                                item.isAvailable &&
                                Number(item.stock) > 0
                        )
                        .map(
                            item =>
                                makeOption(
                                    item,
                                    BASE_PRICES[
                                        item.name
                                    ]
                                )
                        )
                        .filter(
                            item =>
                                item.price !==
                                undefined
                        );


                /* =========================
                   ONLY AVAILABLE SAUCES
                ========================= */

                grouped.Sauce =
                    grouped.Sauce
                        .filter(
                            item =>
                                item.isAvailable &&
                                Number(item.stock) > 0
                        )
                        .map(
                            item =>
                                makeOption(
                                    item,
                                    SAUCE_PRICES[
                                        item.name
                                    ]
                                )
                        )
                        .filter(
                            item =>
                                item.price !==
                                undefined
                        );


                /* =========================
                   ONLY AVAILABLE CHEESES
                ========================= */

                grouped.Cheese =
                    grouped.Cheese
                        .filter(
                            item =>
                                item.isAvailable &&
                                Number(item.stock) > 0
                        )
                        .map(
                            item =>
                                makeOption(
                                    item,
                                    CHEESE_PRICES[
                                        item.name
                                    ]
                                )
                        )
                        .filter(
                            item =>
                                item.price !==
                                undefined
                        );


                /* =========================
                   ONLY AVAILABLE VEGETABLES
                ========================= */

                grouped.Vegetable =
                    grouped.Vegetable
                        .filter(
                            item =>
                                item.isAvailable &&
                                Number(item.stock) > 0
                        )
                        .map(
                            item =>
                                makeOption(
                                    item,
                                    VEGETABLE_PRICES[
                                        item.name
                                    ]
                                )
                        )
                        .filter(
                            item =>
                                item.price !==
                                undefined
                        );


                setInventory(
                    grouped
                );


                /* =========================
                   DEFAULT SELECTIONS
                ========================= */

                setSelectedBase(
                    grouped.Base[0] ||
                    null
                );


                setSelectedSauce(
                    grouped.Sauce[0] ||
                    null
                );


                /*
                 * Prefer Mozzarella if available.
                 */

                const mozzarella =
                    grouped.Cheese.find(
                        cheese =>
                            cheese.name ===
                            "Mozzarella"
                    );


                setSelectedCheese(
                    mozzarella ||
                    grouped.Cheese[0] ||
                    null
                );


                setSelectedVegetables(
                    []
                );


            } catch (error) {

                console.error(
                    "Pizza builder inventory error:",
                    error
                );


                setInventoryError(
                    error.message ||
                    "Unable to load ingredients."
                );


            } finally {

                setInventoryLoading(
                    false
                );

            }

        };


    useEffect(() => {

        loadInventory();

    }, []);


    /* =================================================
       VEGETABLE TOGGLE
    ================================================= */

    const toggleVegetable =
        (vegetable) => {

            setSelectedVegetables(
                current => {

                    const exists =
                        current.some(
                            item =>
                                item.name ===
                                vegetable.name
                        );


                    if (exists) {

                        return current.filter(
                            item =>
                                item.name !==
                                vegetable.name
                        );

                    }


                    return [

                        ...current,

                        vegetable

                    ];

                }
            );

        };


    /* =================================================
       TOTAL
    ================================================= */

    const vegetablesTotal =
        selectedVegetables.reduce(

            (
                total,
                vegetable
            ) =>

                total +
                vegetable.price,

            0

        );


    const totalPrice =

        (selectedSize?.price || 0)

        +

        (selectedBase?.price || 0)

        +

        (selectedSauce?.price || 0)

        +

        (selectedCheese?.price || 0)

        +

        vegetablesTotal;


    /* =================================================
       CHECK IF BUILDER READY
    ================================================= */

    const builderReady =

        Boolean(
            selectedBase &&
            selectedSauce &&
            selectedCheese
        );


    /* =================================================
       ADD TO CART
    ================================================= */

    const handleAddToCart =
        () => {

            if (
                !builderReady
            ) {

                return;

            }


            const customPizza = {

                _id:
                    `custom-${Date.now()}`,

                /*
                 * IMPORTANT:
                 * Backend + Checkout use this
                 * flag to identify custom pizza.
                 */

                isCustom:
                    true,

                name:
                    "Custom Pizza",

                description:

                    `${selectedBase.name}, ${selectedSauce.name}, ${selectedCheese.name}`,

                category:
                    "Special",

                image:
                    "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85",


                basePrice:
                    totalPrice,


                sizes: [

                    {

                        name:
                            selectedSize.name,

                        price:
                            totalPrice

                    }

                ],


                selectedSize: {

                    name:
                        selectedSize.name,

                    price:
                        totalPrice

                },


                toppings:
                    selectedVegetables.map(
                        vegetable =>
                            vegetable.name
                    ),


                customizations: {

                    base: {

                        name:
                            selectedBase.name,

                        price:
                            selectedBase.price

                    },


                    sauce: {

                        name:
                            selectedSauce.name,

                        price:
                            selectedSauce.price

                    },


                    cheese: {

                        name:
                            selectedCheese.name,

                        price:
                            selectedCheese.price

                    },


                    vegetables:
                        selectedVegetables.map(
                            vegetable => ({

                                name:
                                    vegetable.name,

                                price:
                                    vegetable.price

                            })
                        )

                },


                quantity:
                    1

            };


            addToCart(
                customPizza
            );


            navigate("/");

        };


    /* =================================================
       LOADING
    ================================================= */

    if (
        inventoryLoading
    ) {

        return (

            <main
                className="pizza-builder-page"
            >

                <section
                    className="pizza-builder-header"
                >

                    <p
                        className="eyebrow"
                    >
                        CREATE YOUR PIZZA
                    </p>

                    <h1>
                        Build your
                        <br />

                        <span>
                            perfect pizza.
                        </span>
                    </h1>

                    <p>
                        Loading available ingredients...
                    </p>

                </section>


                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        padding: "60px"
                    }}
                >

                    <RefreshCw
                        size={30}
                        className="spin"
                    />

                </div>

            </main>

        );

    }


    /* =================================================
       ERROR
    ================================================= */

    if (
        inventoryError
    ) {

        return (

            <main
                className="pizza-builder-page"
            >

                <section
                    className="pizza-builder-header"
                >

                    <p
                        className="eyebrow"
                    >
                        CREATE YOUR PIZZA
                    </p>

                    <h1>
                        Build your
                        <br />

                        <span>
                            perfect pizza.
                        </span>
                    </h1>

                    <div
                        className="auth-error"
                    >

                        <AlertCircle
                            size={18}
                        />

                        {inventoryError}

                    </div>


                    <button
                        type="button"
                        className="builder-back-btn"
                        onClick={
                            loadInventory
                        }
                    >

                        <RefreshCw
                            size={17}
                        />

                        Try Again

                    </button>

                </section>

            </main>

        );

    }
        /* =================================================
       MAIN BUILDER UI
    ================================================= */

    return (

        <main
            className="pizza-builder-page"
        >


            {/* =================================================
                HEADER
            ================================================= */}

            <section
                className="pizza-builder-header"
            >

                <button
                    type="button"
                    className="builder-back-btn"
                    onClick={() =>
                        navigate("/menu")
                    }
                >

                    <ArrowLeft
                        size={18}
                    />

                    Back to Menu

                </button>


                <p
                    className="eyebrow"
                >
                    CREATE YOUR PIZZA
                </p>


                <h1>

                    Build your
                    <br />

                    <span>
                        perfect pizza.
                    </span>

                </h1>


                <p>
                    Choose your base, sauce, cheese
                    and favourite vegetables.
                </p>

            </section>


            {/* =================================================
                BUILDER
            ================================================= */}

            <section
                className="pizza-builder-layout"
            >


                {/* =================================================
                    OPTIONS
                ================================================= */}

                <div
                    className="pizza-builder-options"
                >


                    {/* =========================
                       SIZE
                    ========================= */}

                    <div
                        className="builder-section"
                    >

                        <div
                            className="builder-section-heading"
                        >

                            <div>

                                <span>
                                    01
                                </span>

                                <h2>
                                    Choose Size
                                </h2>

                            </div>

                        </div>


                        <div
                            className="builder-options-grid"
                        >

                            {SIZES.map(
                                size => (

                                    <button
                                        type="button"

                                        key={
                                            size.name
                                        }

                                        className={
                                            selectedSize.name ===
                                            size.name

                                                ? "builder-option active"

                                                : "builder-option"
                                        }

                                        onClick={() =>
                                            setSelectedSize(
                                                size
                                            )
                                        }
                                    >

                                        {
                                            selectedSize.name ===
                                            size.name && (

                                                <Check
                                                    size={16}
                                                />

                                            )
                                        }


                                        <strong>
                                            {
                                                size.name
                                            }
                                        </strong>


                                        <span>
                                            ₹
                                            {
                                                size.price
                                            }
                                        </span>

                                    </button>

                                )
                            )}

                        </div>

                    </div>


                    {/* =========================
                       BASE
                    ========================= */}

                    <div
                        className="builder-section"
                    >

                        <div
                            className="builder-section-heading"
                        >

                            <div>

                                <span>
                                    02
                                </span>

                                <h2>
                                    Choose Base
                                </h2>

                            </div>

                        </div>


                        {
                            inventory.Base.length ===
                            0

                                ? (

                                    <p>
                                        No bases currently
                                        available.
                                    </p>

                                )

                                : (

                                    <div
                                        className="builder-options-grid"
                                    >

                                        {
                                            inventory.Base.map(
                                                base => (

                                                    <button
                                                        type="button"

                                                        key={
                                                            base.inventoryId
                                                        }

                                                        className={
                                                            selectedBase?.name ===
                                                            base.name

                                                                ? "builder-option active"

                                                                : "builder-option"
                                                        }

                                                        onClick={() =>
                                                            setSelectedBase(
                                                                base
                                                            )
                                                        }
                                                    >

                                                        {
                                                            selectedBase?.name ===
                                                            base.name && (

                                                                <Check
                                                                    size={16}
                                                                />

                                                            )
                                                        }


                                                        <strong>
                                                            {
                                                                base.name
                                                            }
                                                        </strong>


                                                        <span>
                                                            +₹
                                                            {
                                                                base.price
                                                            }
                                                        </span>

                                                    </button>

                                                )
                                            )
                                        }

                                    </div>

                                )
                        }

                    </div>


                    {/* =========================
                       SAUCE
                    ========================= */}

                    <div
                        className="builder-section"
                    >

                        <div
                            className="builder-section-heading"
                        >

                            <div>

                                <span>
                                    03
                                </span>

                                <h2>
                                    Choose Sauce
                                </h2>

                            </div>

                        </div>


                        {
                            inventory.Sauce.length ===
                            0

                                ? (

                                    <p>
                                        No sauces currently
                                        available.
                                    </p>

                                )

                                : (

                                    <div
                                        className="builder-options-grid"
                                    >

                                        {
                                            inventory.Sauce.map(
                                                sauce => (

                                                    <button
                                                        type="button"

                                                        key={
                                                            sauce.inventoryId
                                                        }

                                                        className={
                                                            selectedSauce?.name ===
                                                            sauce.name

                                                                ? "builder-option active"

                                                                : "builder-option"
                                                        }

                                                        onClick={() =>
                                                            setSelectedSauce(
                                                                sauce
                                                            )
                                                        }
                                                    >

                                                        {
                                                            selectedSauce?.name ===
                                                            sauce.name && (

                                                                <Check
                                                                    size={16}
                                                                />

                                                            )
                                                        }


                                                        <strong>
                                                            {
                                                                sauce.name
                                                            }
                                                        </strong>


                                                        <span>
                                                            +₹
                                                            {
                                                                sauce.price
                                                            }
                                                        </span>

                                                    </button>

                                                )
                                            )
                                        }

                                    </div>

                                )
                        }

                    </div>
                    {/* =========================
                       CHEESE
                    ========================= */}

                    <div
                        className="builder-section"
                    >

                        <div
                            className="builder-section-heading"
                        >

                            <div>

                                <span>
                                    04
                                </span>

                                <h2>
                                    Choose Cheese
                                </h2>

                            </div>

                        </div>


                        {
                            inventory.Cheese.length ===
                            0

                                ? (

                                    <p>
                                        No cheeses currently
                                        available.
                                    </p>

                                )

                                : (

                                    <div
                                        className="builder-options-grid"
                                    >

                                        {
                                            inventory.Cheese.map(
                                                cheese => (

                                                    <button
                                                        type="button"

                                                        key={
                                                            cheese.inventoryId
                                                        }

                                                        className={
                                                            selectedCheese?.name ===
                                                            cheese.name

                                                                ? "builder-option active"

                                                                : "builder-option"
                                                        }

                                                        onClick={() =>
                                                            setSelectedCheese(
                                                                cheese
                                                            )
                                                        }
                                                    >

                                                        {
                                                            selectedCheese?.name ===
                                                            cheese.name && (

                                                                <Check
                                                                    size={16}
                                                                />

                                                            )
                                                        }


                                                        <strong>
                                                            {
                                                                cheese.name
                                                            }
                                                        </strong>


                                                        <span>
                                                            +₹
                                                            {
                                                                cheese.price
                                                            }
                                                        </span>

                                                    </button>

                                                )
                                            )
                                        }

                                    </div>

                                )
                        }

                    </div>


                    {/* =========================
                       VEGETABLES
                    ========================= */}

                    <div
                        className="builder-section"
                    >

                        <div
                            className="builder-section-heading"
                        >

                            <div>

                                <span>
                                    05
                                </span>

                                <h2>
                                    Choose Vegetables
                                </h2>

                            </div>

                        </div>


                        {
                            inventory.Vegetable.length ===
                            0

                                ? (

                                    <p>
                                        No vegetables currently
                                        available.
                                    </p>

                                )

                                : (

                                    <div
                                        className="builder-options-grid"
                                    >

                                        {
                                            inventory.Vegetable.map(
                                                vegetable => {

                                                    const selected =
                                                        selectedVegetables.some(
                                                            item =>
                                                                item.name ===
                                                                vegetable.name
                                                        );


                                                    return (

                                                        <button
                                                            type="button"

                                                            key={
                                                                vegetable.inventoryId
                                                            }

                                                            className={
                                                                selected

                                                                    ? "builder-option active"

                                                                    : "builder-option"
                                                            }

                                                            onClick={() =>
                                                                toggleVegetable(
                                                                    vegetable
                                                                )
                                                            }
                                                        >

                                                            {
                                                                selected && (

                                                                    <Check
                                                                        size={16}
                                                                    />

                                                                )
                                                            }


                                                            <strong>
                                                                {
                                                                    vegetable.name
                                                                }
                                                            </strong>


                                                            <span>
                                                                +₹
                                                                {
                                                                    vegetable.price
                                                                }
                                                            </span>

                                                        </button>

                                                    );

                                                }
                                            )
                                        }

                                    </div>

                                )
                        }

                    </div>


                </div>


                {/* =================================================
                    SUMMARY CARD
                ================================================= */}

                <aside
                    className="pizza-builder-summary"
                >

                    <div
                        className="builder-summary-card"
                    >

                        <div
                            className="builder-summary-image"
                        >

                            <img
                                src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85"
                                alt="Custom Pizza"
                            />

                        </div>


                        <div
                            className="builder-summary-content"
                        >

                            <p
                                className="eyebrow"
                            >
                                YOUR CREATION
                            </p>


                            <h2>
                                Custom Pizza
                            </h2>


                            <div
                                className="builder-summary-list"
                            >

                                <div>
                                    <span>
                                        Size
                                    </span>

                                    <strong>
                                        {
                                            selectedSize?.name ||
                                            "-"
                                        }
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Base
                                    </span>

                                    <strong>
                                        {
                                            selectedBase?.name ||
                                            "-"
                                        }
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Sauce
                                    </span>

                                    <strong>
                                        {
                                            selectedSauce?.name ||
                                            "-"
                                        }
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Cheese
                                    </span>

                                    <strong>
                                        {
                                            selectedCheese?.name ||
                                            "-"
                                        }
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Vegetables
                                    </span>

                                    <strong>
                                        {
                                            selectedVegetables.length
                                                ? selectedVegetables
                                                    .map(
                                                        vegetable =>
                                                            vegetable.name
                                                    )
                                                    .join(
                                                        ", "
                                                    )

                                                : "None"
                                        }
                                    </strong>
                                </div>

                            </div>


                            <div
                                className="builder-total"
                            >

                                <span>
                                    Total
                                </span>

                                <strong>
                                    ₹
                                    {
                                        totalPrice
                                    }
                                </strong>

                            </div>


                            <button
                                type="button"

                                className="builder-add-btn"

                                disabled={
                                    !builderReady
                                }

                                onClick={
                                    handleAddToCart
                                }
                            >

                                <ShoppingBag
                                    size={19}
                                />

                                Add to Cart

                            </button>


                            {
                                !builderReady && (

                                    <p
                                        className="builder-help-text"
                                    >
                                        Please select a base,
                                        sauce and cheese.
                                    </p>

                                )
                            }

                        </div>

                    </div>

                </aside>

            </section>

        </main>

    );

}


export default PizzaBuilder;