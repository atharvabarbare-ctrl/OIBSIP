import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
    const location = useLocation();

    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");


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

    
    if (!user) {
        localStorage.removeItem("token");

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    return children;
}

export default ProtectedRoute;