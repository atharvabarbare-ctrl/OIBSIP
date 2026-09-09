import { useState } from "react";
import {
    Link,
    useNavigate,
    useSearchParams
} from "react-router-dom";

import {
    Lock,
    KeyRound,
    LoaderCircle,
    CheckCircle,
    ArrowLeft
} from "lucide-react";


function ResetPassword() {

    const navigate = useNavigate();

    const [searchParams] =
        useSearchParams();

    const token =
        searchParams.get("token");


    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");


        if (!token) {

            setError(
                "Password reset token is missing or invalid."
            );

            return;
        }


        if (!password || !confirmPassword) {

            setError(
                "Please enter and confirm your new password."
            );

            return;
        }


        if (password.length < 6) {

            setError(
                "Password must contain at least 6 characters."
            );

            return;
        }


        if (password !== confirmPassword) {

            setError(
                "Passwords do not match."
            );

            return;
        }


        try {

            setLoading(true);


            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/reset-password`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        token,
                        password
                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to reset password."
                );
            }


            setSuccess(
                data.message ||
                "Password reset successfully."
            );


            setTimeout(() => {

                navigate("/login");

            }, 1800);


        } catch (err) {

            console.error(
                "Reset password error:",
                err
            );


            setError(
                err.message ||
                "Unable to reset password."
            );


        } finally {

            setLoading(false);

        }

    };


    return (

        <main className="auth-page">

            <div className="auth-container">


                {/* HEADER */}

                <div className="auth-header">

                    <p className="auth-eyebrow">
                        ACCOUNT RECOVERY
                    </p>


                    <h1>
                        Reset Password<span>.</span>
                    </h1>


                    <p>
                        Create a new password for
                        your PizzaHub account.
                    </p>

                </div>


                {/* SUCCESS */}

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

                            Redirecting to login...

                        </span>

                    </div>

                ) : (


                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >


                        {/* NEW PASSWORD */}

                        <div className="form-field">

                            <label>
                                New Password
                            </label>


                            <div className="input-wrap">

                                <Lock
                                    size={18}
                                />


                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter new password"
                                    autoComplete="new-password"
                                />

                            </div>

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div className="form-field">

                            <label>
                                Confirm Password
                            </label>


                            <div className="input-wrap">

                                <KeyRound
                                    size={18}
                                />


                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Confirm new password"
                                    autoComplete="new-password"
                                />

                            </div>

                        </div>


                        {/* ERROR */}

                        {error && (

                            <div className="auth-error">

                                {error}

                            </div>

                        )}


                        {/* BUTTON */}

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

                                    Resetting Password...

                                </>

                            ) : (

                                <>

                                    <KeyRound
                                        size={18}
                                    />

                                    Reset Password

                                </>

                            )}

                        </button>

                    </form>

                )}


                {/* FOOTER */}

                <div className="auth-footer">

                    <Link to="/login">

                        <ArrowLeft
                            size={15}
                            style={{
                                verticalAlign: "middle",
                                marginRight: "5px"
                            }}
                        />

                        Back to Login

                    </Link>

                </div>

            </div>

        </main>

    );

}


export default ResetPassword;