import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    Mail,
    Lock,
    LogIn,
    LoaderCircle,
    KeyRound
} from "lucide-react";


function Login() {

    const navigate = useNavigate();


    // ========================================
    // FORM
    // ========================================

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });


    // ========================================
    // STATES
    // ========================================

    const [loading, setLoading] =
        useState(false);

    const [resendLoading, setResendLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [resendSuccess, setResendSuccess] =
        useState("");


    // ========================================
    // HANDLE INPUT
    // ========================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));


        setError("");
        setResendSuccess("");

    };


    // ========================================
    // LOGIN
    // ========================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        setError("");
        setResendSuccess("");


        // ========================================
        // VALIDATION
        // ========================================

        if (
            !formData.email ||
            !formData.password
        ) {

            setError(
                "Please enter email and password."
            );

            return;

        }


        try {

            setLoading(true);


            // ========================================
            // API REQUEST
            // ========================================

            const response =
                await fetch(
                    "http://localhost:5000/api/auth/login",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                formData
                            )

                    }
                );


            const data =
                await response.json();


            // ========================================
            // LOGIN FAILED
            // ========================================

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Login failed."
                );

            }


            // ========================================
            // SAVE JWT
            // ========================================

            localStorage.setItem(
                "token",
                data.token
            );


            // ========================================
            // SAVE USER
            // ========================================

            if (data.user) {

                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        data.user
                    )
                );

            }


            // ========================================
            // UPDATE NAVBAR
            // ========================================

            window.dispatchEvent(
                new Event("authChanged")
            );


            // ========================================
            // SUCCESS
            // ========================================

            alert(
                "🍕 Login successful!"
            );


            navigate("/menu");


        } catch (err) {

            console.error(
                "Login error:",
                err
            );


            setError(
                err.message ||
                "Unable to login. Please try again."
            );


        } finally {

            setLoading(false);

        }

    };


    // ========================================
    // RESEND VERIFICATION EMAIL
    // ========================================

    const handleResendVerification =
        async () => {

            try {

                setResendLoading(true);

                setError("");
                setResendSuccess("");


                // ========================================
                // EMAIL VALIDATION
                // ========================================

                if (!formData.email) {

                    setError(
                        "Please enter your email address first."
                    );

                    return;

                }


                // ========================================
                // API REQUEST
                // ========================================

                const response =
                    await fetch(
                        "http://localhost:5000/api/auth/resend-verification",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email:
                                    formData.email
                            })

                        }
                    );


                const data =
                    await response.json();


                // ========================================
                // FAILED
                // ========================================

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to resend verification email."
                    );

                }


                // ========================================
                // SUCCESS
                // ========================================

                setResendSuccess(
                    data.message ||
                    "Verification email sent successfully. Please check your inbox."
                );


            } catch (err) {

                console.error(
                    "Resend verification error:",
                    err
                );


                setError(
                    err.message ||
                    "Unable to resend verification email."
                );


            } finally {

                setResendLoading(false);

            }

        };


    // ========================================
    // UI
    // ========================================

    return (

        <main className="auth-page">

            <div className="auth-container">


                {/* ========================================
                    HEADER
                ======================================== */}

                <div className="auth-header">

                    <p className="auth-eyebrow">
                        WELCOME BACK
                    </p>


                    <h1>
                        Login<span>.</span>
                    </h1>


                    <p>
                        Login to continue ordering
                        your favourite pizzas.
                    </p>

                </div>


                {/* ========================================
                    LOGIN FORM
                ======================================== */}

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >


                    {/* ========================================
                        EMAIL
                    ======================================== */}

                    <div className="form-field">

                        <label>
                            Email Address
                        </label>


                        <div className="input-wrap">

                            <Mail
                                size={18}
                            />


                            <input
                                type="email"
                                name="email"
                                value={
                                    formData.email
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="atharva@pizzahub.com"
                                autoComplete="email"
                            />

                        </div>

                    </div>


                    {/* ========================================
                        PASSWORD
                    ======================================== */}

                    <div className="form-field">

                        <label>
                            Password
                        </label>


                        <div className="input-wrap">

                            <Lock
                                size={18}
                            />


                            <input
                                type="password"
                                name="password"
                                value={
                                    formData.password
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />

                        </div>

                    </div>


                    {/* ========================================
                        FORGOT PASSWORD
                    ======================================== */}

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            marginTop: "-8px",
                            marginBottom: "8px"
                        }}
                    >

                        <Link
                            to="/forgot-password"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "14px",
                                fontWeight: "600",
                                textDecoration: "none"
                            }}
                        >

                            <KeyRound
                                size={15}
                            />

                            Forgot Password?

                        </Link>

                    </div>


                    {/* ========================================
                        ERROR
                    ======================================== */}

                    {error && (

                        <div className="auth-error">

                            {error}

                        </div>

                    )}


                    {/* ========================================
                        RESEND VERIFICATION
                    ======================================== */}

                    {error ===
                        "Please verify your email before logging in." && (

                        <div
                            style={{
                                textAlign: "center",
                                marginTop: "10px"
                            }}
                        >

                            <button
                                type="button"
                                onClick={
                                    handleResendVerification
                                }
                                disabled={
                                    resendLoading
                                }
                                style={{
                                    background: "none",
                                    border: "none",
                                    padding: "0",
                                    color: "#ff5a3c",
                                    cursor:
                                        resendLoading
                                            ? "not-allowed"
                                            : "pointer",
                                    fontSize: "14px",
                                    fontWeight: "600"
                                }}
                            >

                                {resendLoading ? (

                                    <span
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "6px"
                                        }}
                                    >

                                        <LoaderCircle
                                            size={15}
                                            className="loading-icon"
                                        />

                                        Sending...

                                    </span>

                                ) : (

                                    "Resend verification email"

                                )}

                            </button>

                        </div>

                    )}


                    {/* ========================================
                        RESEND SUCCESS
                    ======================================== */}

                    {resendSuccess && (

                        <div
                            style={{
                                marginTop: "12px",
                                padding: "10px 12px",
                                borderRadius: "8px",
                                fontSize: "14px",
                                textAlign: "center",
                                background:
                                    "rgba(34, 197, 94, 0.10)",
                                color: "#22c55e"
                            }}
                        >

                            {resendSuccess}

                        </div>

                    )}


                    {/* ========================================
                        LOGIN BUTTON
                    ======================================== */}

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >

                        {loading ? (

                            <>

                                <LoaderCircle
                                    size={18}
                                    className="loading-icon"
                                />

                                Logging in...

                            </>

                        ) : (

                            <>

                                <LogIn
                                    size={18}
                                />

                                Login

                            </>

                        )}

                    </button>


                </form>


                {/* ========================================
                    FOOTER
                ======================================== */}

                <div className="auth-footer">

                    <p>
                        Don't have an account?
                    </p>


                    <Link to="/register">
                        Create Account
                    </Link>

                </div>


            </div>

        </main>

    );

}


export default Login;