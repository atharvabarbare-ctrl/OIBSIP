import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ShoppingBag,
    LogOut,
    ClipboardList,
    LayoutDashboard
} from "lucide-react";

import { useCart } from "../context/CartContext";

function Navbar() {

    const {
        cartCount,
        openCart
    } = useCart();

    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("token")
    );

    const [isAdmin, setIsAdmin] = useState(false);


    // =========================
    // CHECK LOGIN
    // =========================

    const checkAuth = () => {

        const token = localStorage.getItem("token");

        setIsLoggedIn(!!token);

        if (!token) {
            setIsAdmin(false);
            return;
        }

        try {

            const payload = JSON.parse(
                atob(token.split(".")[1])
            );

            setIsAdmin(payload.role === "admin");

        } catch (error) {

            console.error(
                "Unable to read auth token."
            );

            setIsAdmin(false);

        }
    };


    useEffect(() => {

        checkAuth();

        // Browser storage changes
        window.addEventListener(
            "storage",
            checkAuth
        );

        // Same-tab login/logout
        window.addEventListener(
            "authChanged",
            checkAuth
        );

        return () => {

            window.removeEventListener(
                "storage",
                checkAuth
            );

            window.removeEventListener(
                "authChanged",
                checkAuth
            );

        };

    }, []);


    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("authToken");

        setIsLoggedIn(false);
        setIsAdmin(false);

        window.dispatchEvent(
            new Event("authChanged")
        );

        navigate("/login");

    };


    return (

        <nav className="navbar">

            {/* LOGO */}

            <Link
                to="/"
                className="logo"
            >
                🍕 Pizza<span>Hub</span>
            </Link>


            {/* NAV LINKS */}

            <div className="nav-links">

                <Link to="/">
                    Home
                </Link>

                <Link to="/menu">
                    Menu
                </Link>


                {isLoggedIn ? (

                    <>

                        <Link
                            to="/orders"
                            className="nav-icon-link"
                        >
                            <ClipboardList
                                size={17}
                            />

                            My Orders
                        </Link>


                        {isAdmin && (

                            <Link
                                to="/admin"
                                className="nav-icon-link"
                            >
                                <LayoutDashboard
                                    size={17}
                                />

                                Admin
                            </Link>

                        )}


                        <button
                            className="logout-btn"
                            onClick={handleLogout}
                        >

                            <LogOut size={17} />

                            Logout

                        </button>

                    </>

                ) : (

                    <>

                        <Link to="/login">
                            Login
                        </Link>

                        <Link to="/register">
                            Register
                        </Link>

                    </>

                )}


                {/* CART */}

                <button
                    className="cart-btn"
                    onClick={openCart}
                >

                    <ShoppingBag size={20} />

                    <span>
                        Cart
                    </span>

                    {cartCount > 0 && (

                        <b className="cart-count">
                            {cartCount}
                        </b>

                    )}

                </button>

            </div>

        </nav>

    );
}

export default Navbar;