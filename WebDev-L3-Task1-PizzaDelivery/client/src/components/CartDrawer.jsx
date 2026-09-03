import {
    X,
    Minus,
    Plus,
    Trash2,
    ShoppingBag,
    ArrowRight
} from "lucide-react";

import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";


function CartDrawer() {

    const {
        cart,
        cartTotal,
        isCartOpen,
        closeCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        changeSize,
        clearCart
    } = useCart();


    const navigate = useNavigate();


    // =========================
    // CART CLOSED
    // =========================

    if (!isCartOpen) {
        return null;
    }


    // =========================
    // GO TO CHECKOUT
    // =========================

    const handleCheckout = () => {

        closeCart();

        navigate("/checkout");

    };


    // =========================
    // GO TO MENU
    // =========================

    const handleExploreMenu = () => {

        closeCart();

        navigate("/menu");

    };


    return (

        <>

            {/* =========================
                OVERLAY
            ========================= */}

            <div
                className="cart-overlay"
                onClick={closeCart}
            />


            {/* =========================
                CART DRAWER
            ========================= */}

            <aside className="cart-drawer">


                {/* =========================
                    HEADER
                ========================= */}

                <div className="cart-header">

                    <div>

                        <p className="cart-eyebrow">
                            YOUR ORDER
                        </p>

                        <h2>
                            Your Cart
                        </h2>

                    </div>


                    <button
                        className="cart-close"
                        onClick={closeCart}
                        aria-label="Close cart"
                    >

                        <X size={22} />

                    </button>

                </div>


                {/* =========================
                    EMPTY CART
                ========================= */}

                {cart.length === 0 ? (

                    <div className="empty-cart">

                        <div className="empty-cart-icon">

                            <ShoppingBag size={30} />

                        </div>


                        <h3>
                            Your cart is empty
                        </h3>


                        <p>
                            Add a delicious pizza
                            to get started.
                        </p>


                        <button
                            onClick={handleExploreMenu}
                            className="continue-shopping"
                        >

                            Explore Menu

                            <ArrowRight size={17} />

                        </button>

                    </div>

                ) : (

                    <>

                        {/* =========================
                            CART ITEMS
                        ========================= */}

                        <div className="cart-items">

                            {cart.map((item) => (

                                <div
                                    className="cart-item"
                                    key={item._id}
                                >


                                    {/* Pizza Image */}

                                    <img
                                        src={item.image}
                                        alt={item.name}
                                    />


                                    <div className="cart-item-info">


                                        {/* Pizza Name */}

                                        <div className="cart-item-title">

                                            <h3>
                                                {item.name}
                                            </h3>


                                            <button
                                                className="remove-btn"
                                                onClick={() =>
                                                    removeFromCart(
                                                        item._id
                                                    )
                                                }
                                                aria-label={`Remove ${item.name}`}
                                            >

                                                <Trash2 size={15} />

                                            </button>

                                        </div>


                                        {/* Size Selector */}

                                        <div className="size-selector">

                                            {item.sizes?.map(
                                                (size) => (

                                                    <button
                                                        key={size.name}
                                                        className={
                                                            item.selectedSize?.name ===
                                                            size.name
                                                                ? "active"
                                                                : ""
                                                        }
                                                        onClick={() =>
                                                            changeSize(
                                                                item._id,
                                                                size
                                                            )
                                                        }
                                                    >

                                                        {size.name}

                                                    </button>

                                                )
                                            )}

                                        </div>


                                        {/* Quantity + Price */}

                                        <div className="cart-item-bottom">


                                            <div className="quantity-control">

                                                <button
                                                    onClick={() =>
                                                        decreaseQuantity(
                                                            item._id
                                                        )
                                                    }
                                                    aria-label="Decrease quantity"
                                                >

                                                    <Minus size={14} />

                                                </button>


                                                <span>
                                                    {item.quantity}
                                                </span>


                                                <button
                                                    onClick={() =>
                                                        increaseQuantity(
                                                            item._id
                                                        )
                                                    }
                                                    aria-label="Increase quantity"
                                                >

                                                    <Plus size={14} />

                                                </button>

                                            </div>


                                            <strong>

                                                ₹
                                                {
                                                    item.selectedSize.price *
                                                    item.quantity
                                                }

                                            </strong>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>


                        {/* =========================
                            CART FOOTER
                        ========================= */}

                        <div className="cart-footer">


                            {/* Summary */}

                            <div className="cart-summary">

                                <div>

                                    <span>
                                        Subtotal
                                    </span>


                                    <strong>
                                        ₹{cartTotal}
                                    </strong>

                                </div>


                                <p>
                                    Taxes and delivery
                                    charges calculated
                                    at checkout.
                                </p>

                            </div>


                            {/* Checkout Button */}

                            <button
                                className="checkout-btn"
                                onClick={handleCheckout}
                            >

                                Proceed to Checkout

                                <ArrowRight size={18} />

                            </button>


                            {/* Clear Cart */}

                            <button
                                className="clear-cart-btn"
                                onClick={clearCart}
                            >

                                Clear Cart

                            </button>

                        </div>

                    </>

                )}

            </aside>

        </>

    );

}


export default CartDrawer;