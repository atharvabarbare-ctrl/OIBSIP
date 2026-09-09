import { useState } from "react";

import {
    Link
} from "react-router-dom";

import {
    Mail,
    LoaderCircle,
    CheckCircle,
    ArrowLeft
} from "lucide-react";


function ForgotPassword() {

    const [email, setEmail] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // ========================================
    // SUBMIT
    // ========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");


        // ========================================
        // VALIDATION
        // ========================================

        if (!email.trim()) {

            setError(
                "Please enter your email address."
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
                    `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/forgot-password`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email:
                                email.trim()
                        })
                    }
                );


            const data =
                await response.json();


            // ========================================
            // ERROR
            // ========================================

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to process your request."
                );

            }


            // ========================================
            // SUCCESS
            // ========================================

            setSuccess(
                data.message ||
                "If an account exists with this email, a password reset link has been sent."
            );


            setEmail("");


        } catch (err) {

            console.error(
                "Forgot password error:",
                err
            );


            setError(
                err.message ||
                "Unable to process your request. Please try again."
            );


        } finally {

            setLoading(false);

        }

    };


    return (

        <main className="auth-page">

            <div className="auth-container">


                {/* =========================
                    HEADER
                ========================= */}

                <div className="auth-header">

                    <p className="auth-eyebrow">
                        ACCOUNT RECOVERY
                    </p>


                    <h1>
                        Forgot Password<span>.</span>
                    </h1>


                    <p>
                        Enter your email address and
                        we'll send you a link to reset
                        your password.
                    </p>

                </div>


                {/* =========================
                    SUCCESS
                ========================= */}

                {success ? (

                    <div
                        className="auth-success"
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "10px"
                        }}
                    >

                        <CheckCircle
                            size={20}
                        />


                        <span>
                            {success}
                            <br />
                            Please check your email
                            for the reset link.
                        </span>

                    </div>

                ) : (


                    /* =========================
                       FORM
                    ========================= */

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >


                        {/* EMAIL */}

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
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(
                                            e.target.value
                                        )
                                    }
                                    placeholder="atharva@pizzahub.com"
                                    autoComplete="email"
                                />

                            </div>

                        </div>


                        {/* ERROR */}

                        {error && (

                            <div className="auth-error">

                                {error}

                            </div>

                        )}


                        {/* SUBMIT */}

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

                                    Sending Reset Link...

                                </>

                            ) : (

                                <>

                                    <Mail
                                        size={18}
                                    />

                                    Send Reset Link

                                </>

                            )}

                        </button>


                    </form>

                )}


                {/* =========================
                    FOOTER
                ========================= */}

                <div className="auth-footer">

                    <Link to="/login">

                        <ArrowLeft
                            size={15}
                            style={{
                                verticalAlign:
                                    "middle",
                                marginRight:
                                    "5px"
                            }}
                        />

                        Back to Login

                    </Link>

                </div>


            </div>

        </main>

    );

}


export default ForgotPassword;