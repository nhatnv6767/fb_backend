const jwt = require('jsonwebtoken')

exports.authUser = async (req, res, next) => {
    try {

    } catch (e) {
        return res.status(500).json({message: e.message})
    }
}