import {
    createContext,
    useContext,
    useState
} from "react";

const CartContext = createContext();

export function CartProvider({ children }) {

    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);


    // =====================================================
    // ADD TO CART
    // =====================================================

    const addToCart = (pizza) => {

        setCart((currentCart) => {

            // =================================================
            // CUSTOM PIZZA
            // =================================================

            if (pizza?.isCustom === true) {

                // Every custom pizza gets its own unique ID.
                // This prevents different custom pizzas from
                // being merged together.

                const customId =
                    pizza._id ||
                    `custom-${Date.now()}-${Math.random()
                        .toString(36)
                        .substring(2, 9)}`;


                // Custom pizza can come with either
                // selectedSize or size.

                const selectedSize =
                    pizza.selectedSize ||
                    pizza.size ||
                    {
                        name: "Small",
                        price: 149
                    };


                const customPizza = {

                    ...pizza,

                    _id: customId,

                    isCustom: true,

                    quantity:
                        Number(pizza.quantity) || 1,

                    selectedSize: {

                        name:
                            selectedSize.name ||
                            "Small",

                        price:
                            Number(
                                selectedSize.price
                            ) || 0

                    },


                    // Make absolutely sure
                    // customizations survive in cart.

                    customizations: {

                        base:
                            pizza.customizations?.base
                                ? {
                                    name:
                                        pizza.customizations
                                            .base.name,

                                    price:
                                        Number(
                                            pizza.customizations
                                                .base.price
                                        ) || 0
                                }
                                : null,


                        sauce:
                            pizza.customizations?.sauce
                                ? {
                                    name:
                                        pizza.customizations
                                            .sauce.name,

                                    price:
                                        Number(
                                            pizza.customizations
                                                .sauce.price
                                        ) || 0
                                }
                                : null,


                        cheese:
                            pizza.customizations?.cheese
                                ? {
                                    name:
                                        pizza.customizations
                                            .cheese.name,

                                    price:
                                        Number(
                                            pizza.customizations
                                                .cheese.price
                                        ) || 0
                                }
                                : null,


                        vegetables:
                            Array.isArray(
                                pizza.customizations
                                    ?.vegetables
                            )
                                ? pizza.customizations
                                    .vegetables
                                    .map(
                                        (vegetable) => ({
                                            name:
                                                typeof vegetable ===
                                                "string"
                                                    ? vegetable
                                                    : vegetable.name,

                                            price:
                                                Number(
                                                    typeof vegetable ===
                                                    "object"
                                                        ? vegetable.price
                                                        : 0
                                                ) || 0
                                        })
                                    )
                                : []

                    }

                };


                return [
                    ...currentCart,
                    customPizza
                ];

            }


            // =================================================
            // NORMAL PIZZA
            // =================================================

            const existing =
                currentCart.find(
                    (item) =>
                        !item.isCustom &&
                        item._id === pizza._id
                );


            if (existing) {

                return currentCart.map(
                    (item) =>
                        item._id === pizza._id &&
                        !item.isCustom
                            ? {
                                ...item,

                                quantity:
                                    item.quantity + 1
                            }
                            : item
                );

            }


            // =================================================
            // NORMAL PIZZA SIZE
            // =================================================

            const selectedSize =
                pizza.selectedSize ||
                pizza.sizes?.[0] ||
                {
                    name: "Regular",

                    price:
                        Number(
                            pizza.basePrice
                        ) || 0
                };


            return [

                ...currentCart,

                {

                    ...pizza,

                    isCustom: false,

                    quantity: 1,

                    selectedSize: {

                        name:
                            selectedSize.name,

                        price:
                            Number(
                                selectedSize.price
                            ) || 0

                    }

                }

            ];

        });


        setIsCartOpen(true);

    };


    // =====================================================
    // REMOVE FROM CART
    // =====================================================

    const removeFromCart = (id) => {

        setCart(
            (currentCart) =>
                currentCart.filter(
                    (item) =>
                        item._id !== id
                )
        );

    };


    // =====================================================
    // INCREASE QUANTITY
    // =====================================================

    const increaseQuantity = (id) => {

        setCart(
            (currentCart) =>
                currentCart.map(
                    (item) =>
                        item._id === id
                            ? {

                                ...item,

                                quantity:
                                    item.quantity + 1

                            }
                            : item
                )
        );

    };


    // =====================================================
    // DECREASE QUANTITY
    // =====================================================

    const decreaseQuantity = (id) => {

        setCart(
            (currentCart) =>
                currentCart
                    .map(
                        (item) =>
                            item._id === id
                                ? {

                                    ...item,

                                    quantity:
                                        item.quantity - 1

                                }
                                : item
                    )
                    .filter(
                        (item) =>
                            item.quantity > 0
                    )
        );

    };


    // =====================================================
    // CHANGE SIZE
    // =====================================================

    const changeSize = (
        id,
        size
    ) => {

        setCart(
            (currentCart) =>
                currentCart.map(
                    (item) =>
                        item._id === id
                            ? {

                                ...item,

                                selectedSize: {

                                    name:
                                        size.name,

                                    price:
                                        Number(
                                            size.price
                                        ) || 0

                                }

                            }
                            : item
                )
        );

    };


    // =====================================================
    // CLEAR CART
    // =====================================================

    const clearCart = () => {

        setCart([]);

    };


    // =====================================================
    // CART COUNT
    // =====================================================

    const cartCount =
        cart.reduce(
            (
                total,
                item
            ) =>
                total +
                (
                    Number(
                        item.quantity
                    ) || 0
                ),
            0
        );


    // =====================================================
    // CART TOTAL
    // =====================================================

    const cartTotal =
        cart.reduce(
            (
                total,
                item
            ) => {

                const price =
                    Number(
                        item.selectedSize?.price
                    ) ||
                    Number(
                        item.size?.price
                    ) ||
                    0;


                return (
                    total +
                    price *
                    (
                        Number(
                            item.quantity
                        ) || 0
                    )
                );

            },
            0
        );


    // =====================================================
    // OPEN CART
    // =====================================================

    const openCart = () => {

        setIsCartOpen(true);

    };


    // =====================================================
    // CLOSE CART
    // =====================================================

    const closeCart = () => {

        setIsCartOpen(false);

    };


    // =====================================================
    // PROVIDER
    // =====================================================

    return (

        <CartContext.Provider
            value={{

                cart,

                addToCart,

                removeFromCart,

                increaseQuantity,

                decreaseQuantity,

                changeSize,

                clearCart,

                cartCount,

                cartTotal,

                isCartOpen,

                openCart,

                closeCart

            }}
        >

            {children}

        </CartContext.Provider>

    );

}


// =====================================================
// USE CART
// =====================================================

export function useCart() {

    return useContext(
        CartContext
    );

}