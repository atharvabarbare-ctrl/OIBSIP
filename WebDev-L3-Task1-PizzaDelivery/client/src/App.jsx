import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import PizzaBuilder from "./pages/PizzaBuilder";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import Admin from "./pages/Admin";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import { CartProvider } from "./context/CartContext";


function App() {

    return (

        <BrowserRouter>

            <CartProvider>

                <Navbar />

                <Routes>


                    {/* =========================
                        HOME
                    ========================= */}

                    <Route
                        path="/"
                        element={<Home />}
                    />


                    {/* =========================
                        MENU
                    ========================= */}

                    <Route
                        path="/menu"
                        element={<Menu />}
                    />


                    {/* =========================
                        CUSTOM PIZZA BUILDER
                    ========================= */}

                    <Route
                        path="/pizza-builder"
                        element={<PizzaBuilder />}
                    />


                    {/* =========================
                        AUTH
                    ========================= */}

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />

                    <Route
                        path="/reset-password"
                        element={<ResetPassword />}
                    />

                    <Route
                        path="/verify-email"
                        element={<VerifyEmail />}
                    />


                    {/* =========================
                        CHECKOUT
                    ========================= */}

                    <Route
                        path="/checkout"
                        element={
                            <ProtectedRoute>
                                <Checkout />
                            </ProtectedRoute>
                        }
                    />


                    {/* =========================
                        ORDERS
                    ========================= */}

                    <Route
                        path="/orders"
                        element={
                            <ProtectedRoute>
                                <MyOrders />
                            </ProtectedRoute>
                        }
                    />


                    {/* =========================
                        ADMIN
                    ========================= */}

                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <Admin />
                            </AdminRoute>
                        }
                    />


                    {/* =========================
                        FALLBACK
                    ========================= */}

                    <Route
                        path="*"
                        element={<Home />}
                    />

                </Routes>


                <CartDrawer />

            </CartProvider>

        </BrowserRouter>

    );

}


export default App;