import { Navigate, useLocation } from "react-router-dom";

function AdminRoute({ children }) {
    const location = useLocation();

    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");


    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location.pathname
                }}
            />
        );
    }

    // User data missing
    if (!userString) {
        localStorage.removeItem("token");

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    let user;

    try {
        user = JSON.parse(userString);
    } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    if (user?.role !== "admin") {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

 
    return children;
}

export default AdminRoute;