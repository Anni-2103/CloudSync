const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');  // Redirect if no token found
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = { _id: decoded.userId, email: decoded.email, username: decoded.username };
        console.log('Decoded token:', decoded);  // For debugging
        next();
    });
};

module.exports = { verifyToken };
