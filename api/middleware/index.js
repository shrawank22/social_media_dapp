const middlewareObj = {};
const jwt = require('jsonwebtoken');

middlewareObj.isLoggedIn = (req, res, next) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, 'your_secret_key', (err, decoded) => {
            if (err) {
                return res.status(401).send("Invalid token");
            } else {
                req.user = decoded;
                next();
            }
        });
    } else {
        return res.status(401).send("You need to be logged in to do that!");
    }
}

module.exports = middlewareObj;