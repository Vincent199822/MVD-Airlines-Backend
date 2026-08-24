const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Get authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: 'Access denied. No token provided.'
            });
        }

        // Check Bearer token format
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Access denied. Invalid authorization format.'
            });
        }

        // Get token
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET_KEY
        );

        // Store decoded user information in request
        req.user = decoded;

        // Continue to the next middleware/controller
        next();

    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired token.'
        });
    }
};

module.exports = authMiddleware;