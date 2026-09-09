import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    Link,
    useSearchParams
} from "react-router-dom";

import {
    CheckCircle,
    XCircle,
    LoaderCircle
} from "lucide-react";


function VerifyEmail() {

    const [
        searchParams
    ] = useSearchParams();


    // ========================================
    // PREVENT DUPLICATE REQUEST
    // ========================================

    const verificationStarted =
        useRef(false);


    // ========================================
    // STATE
    // ========================================

    const [
        status,
        setStatus
    ] = useState("loading");


    const [
        message,
        setMessage
    ] = useState(
        "Verifying your email..."
    );


    // ========================================
    // VERIFY EMAIL
    // ========================================

    useEffect(() => {

        const token =
            searchParams.get("token");


        // ========================================
        // TOKEN MISSING
        // ========================================

        if (!token) {

            setStatus("error");

            setMessage(
                "Verification token is missing."
            );

            return;

        }


        // ========================================
        // PREVENT SECOND REQUEST
        // ========================================

        if (
            verificationStarted.current
        ) {

            console.log(
                "Verification request already started."
            );

            return;

        }


        verificationStarted.current =
            true;


        // ========================================
        // API REQUEST
        // ========================================

        const verifyAccount =
            async () => {

                try {

                    console.log(
                        "Verifying token..."
                    );


                    const response =
                        await fetch(
                            `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/verify-email?token=${encodeURIComponent(token)}`,
                            {
                                method: "GET",
                                headers: {
                                    "Accept":
                                        "application/json"
                                }
                            }
                        );


                    const data =
                        await response.json();


                    console.log(
                        "Verification response:",
                        data
                    );


                    // ========================================
                    // FAILED
                    // ========================================

                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Email verification failed."
                        );

                    }


                    // ========================================
                    // SUCCESS
                    // ========================================

                    setStatus(
                        "success"
                    );


                    setMessage(
                        data.message ||
                        "Your email has been verified successfully!"
                    );


                } catch (error) {

                    console.error(
                        "Email verification error:",
                        error
                    );


                    setStatus(
                        "error"
                    );


                    setMessage(
                        error.message ||
                        "Unable to verify your email."
                    );

                }

            };


        verifyAccount();


    }, [searchParams]);


    // ========================================
    // UI
    // ========================================

    return (

        <main className="auth-page">

            <div className="auth-container">

                <div
                    style={{
                        textAlign: "center"
                    }}
                >


                    {/* ========================================
                        LOADING
                    ======================================== */}

                    {status === "loading" && (

                        <>

                            <LoaderCircle
                                size={60}
                                className="loading-icon"
                            />


                            <h1>
                                Verifying
                                <span>.</span>
                            </h1>


                            <p>
                                Please wait while we
                                verify your email.
                            </p>

                        </>

                    )}


                    {/* ========================================
                        SUCCESS
                    ======================================== */}

                    {status === "success" && (

                        <>

                            <CheckCircle
                                size={60}
                                color="#22c55e"
                            />


                            <h1>
                                Email Verified
                                <span>.</span>
                            </h1>


                            <p>
                                {message}
                            </p>


                            <Link
                                to="/login"
                                className="auth-submit"
                                style={{
                                    display:
                                        "inline-flex",
                                    textDecoration:
                                        "none",
                                    marginTop:
                                        "25px"
                                }}
                            >

                                Login to PizzaHub

                            </Link>

                        </>

                    )}


                    {/* ========================================
                        ERROR
                    ======================================== */}

                    {status === "error" && (

                        <>

                            <XCircle
                                size={60}
                                color="#ff5a3c"
                            />


                            <h1>
                                Verification Failed
                                <span>.</span>
                            </h1>


                            <p>
                                {message}
                            </p>


                            <Link
                                to="/register"
                                className="auth-submit"
                                style={{
                                    display:
                                        "inline-flex",
                                    textDecoration:
                                        "none",
                                    marginTop:
                                        "25px"
                                }}
                            >

                                Back to Register

                            </Link>

                        </>

                    )}

                </div>

            </div>

        </main>

    );

}


export default VerifyEmail;