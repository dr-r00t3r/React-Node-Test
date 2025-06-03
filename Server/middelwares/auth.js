const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: "Authentication failed, Token missing" });
    }

    try {
        const jwtSecret = process.env.JWT_SECRET || 'secret_key';
        const decode = jwt.verify(token, jwtSecret);
        req.user = decode;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        return res.status(401).json({ message: 'Authentication failed. Invalid token.' });
    }
}

module.exports = auth