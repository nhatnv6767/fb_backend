const jwt = require('jsonwebtoken');

exports.authUser = async (req, res, next) => {
    try {
        let tmp = req.header("Authorization");
        const token = tmp.slice(7, tmp.length);
        if (!token) {
            return res.status(400).json({message: "Invalid Authentification"});
        }
        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.status(400).json({message: "Invalid Authentification"});
            }
            /* Setting the user object to the request object. */
            req.user = user;
            /* `next()` is a function that is passed to the middleware function.
            It is used to call the next middleware
            function in the stack. */
            next();
        });
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
};