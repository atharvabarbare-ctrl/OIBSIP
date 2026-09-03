const jwt = require("jsonwebtoken");
const User = require("../models/User");


const protect = async (req, res, next) => {
    try {

        const authHeader =
            req.headers.authorization;


        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required."
            });
        }


        const token =
            authHeader.split(" ")[1];


        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // Get actual user from database
        const user =
            await User.findById(decoded.id)
                .select("-password");


        if (!user) {

            return res.status(401).json({
                success: false,
                message:
                    "User not found."
            });
        }


        // Attach actual user document
        req.user = user;


        next();

    } catch (error) {

        console.error(
            "Authentication error:",
            error.message
        );


        return res.status(401).json({
            success: false,
            message:
                "Invalid or expired authentication token."
        });
    }
};


const adminOnly = (req, res, next) => {

    if (req.user?.role !== "admin") {

        return res.status(403).json({
            success: false,
            message:
                "Admin access required."
        });
    }


    next();
};


module.exports = {
    protect,
    adminOnly
};