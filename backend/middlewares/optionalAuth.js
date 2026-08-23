import jwt from "jsonwebtoken"

// Like isAuth, but never blocks the request: sets req.userId when a valid
// token cookie is present, otherwise leaves it undefined and continues.
// Used for endpoints that must stay reachable by anonymous users (e.g. chat)
// while still trusting the server-verified identity when one exists.
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (token) {
            const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = verifyToken.userId;
        }
    } catch (error) {
        // Invalid/expired token: treat the request as anonymous rather than failing it
    }
    next();
}

export default optionalAuth
