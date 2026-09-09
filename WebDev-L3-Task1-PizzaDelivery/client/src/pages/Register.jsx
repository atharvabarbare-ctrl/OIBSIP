import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    User,
    Mail,
    Lock,
    UserPlus,
    LoaderCircle
} from "lucide-react";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


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
        setSuccess("");
    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");


        if (
            !formData.name ||
            !formData.email ||
            !formData.password ||
            !formData.confirmPassword
        ) {

            setError(
                "Please fill all fields."
            );

            return;
        }


        if (
            formData.password !==
            formData.confirmPassword
        ) {

            setError(
                "Passwords do not match."
            );

            return;
        }


        if (
            formData.password.length < 6
        ) {

            setError(
                "Password must contain at least 6 characters."
            );

            return;
        }


        try {

            setLoading(true);


            const response =
                await fetch(
                    `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/register`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            name:
                                formData.name,

                            email:
                                formData.email,

                            password:
                                formData.password
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Registration failed."
                );

            }


            setSuccess(
                "🎉 Account created! Check your email to verify your account."
            );


            setFormData({
                name: "",
                email: "",
                password: "",
                confirmPassword: ""
            });


        } catch (err) {

            console.error(
                "Register error:",
                err
            );

            setError(
                err.message ||
                "Unable to create account."
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <main className="auth-page">

            <div className="auth-container">


                <div className="auth-header">

                    <p className="auth-eyebrow">
                        JOIN PIZZAHUB
                    </p>

                    <h1>
                        Create Account<span>.</span>
                    </h1>

                    <p>
                        Create your account and
                        start ordering delicious pizzas.
                    </p>

                </div>


                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >


                    {/* NAME */}

                    <div className="form-field">

                        <label>
                            Full Name
                        </label>

                        <div className="input-wrap">

                            <User size={18} />

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Atharva Barbare"
                                autoComplete="name"
                            />

                        </div>

                    </div>


                    {/* EMAIL */}

                    <div className="form-field">

                        <label>
                            Email Address
                        </label>

                        <div className="input-wrap">

                            <Mail size={18} />

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                autoComplete="email"
                            />

                        </div>

                    </div>


                    {/* PASSWORD */}

                    <div className="form-field">

                        <label>
                            Password
                        </label>

                        <div className="input-wrap">

                            <Lock size={18} />

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Minimum 6 characters"
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

                            <Lock size={18} />

                            <input
                                type="password"
                                name="confirmPassword"
                                value={
                                    formData.confirmPassword
                                }
                                onChange={handleChange}
                                placeholder="Repeat your password"
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


                    {/* SUCCESS */}

                    {success && (

                        <div
                            className="auth-success"
                        >
                            {success}
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

                                Creating Account...
                            </>

                        ) : (

                            <>
                                <UserPlus size={18} />

                                Create Account
                            </>

                        )}

                    </button>


                </form>


                <div className="auth-footer">

                    <p>
                        Already have an account?
                    </p>

                    <Link to="/login">
                        Login
                    </Link>

                </div>


            </div>

        </main>

    );
}

export default Register;