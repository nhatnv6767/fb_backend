const User = require("../models/User");
exports.reactPost = async (req, res) => {
    try {
        const {postId, react} = req.body;
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};