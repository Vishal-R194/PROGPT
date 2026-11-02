
import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Authentication required. Please log in."
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            error: "Invalid authentication token."
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.userId) {
            return res.status(401).json({
                error: "Invalid authentication token."
            });
        }

        req.user = {
            userId: decoded.userId
        };

        next();
    } catch (err) {
        return res.status(401).json({
            error: "Your session is invalid or expired. Please log in again."
        });
    }
};

export default verifyToken;
