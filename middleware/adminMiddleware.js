const adminMiddleware = (req, res, next) => {

    // Check if user is authenticated
    if (!req.user) {
        return res.status(401).json({
            message: 'Access denied. Authentication required.'
        });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Access denied. Admin privileges required.'
        });
    }

    // User is admin
    next();
};

module.exports = adminMiddleware;