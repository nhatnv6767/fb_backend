const React = require("../models/React");
exports.reactPost = async (req, res) => {
    try {
        const {postId, react} = req.body;
        const check = await React.findOne({
            postRef: postId,
            reactBy: req.user.id,
        });
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};