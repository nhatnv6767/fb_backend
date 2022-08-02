const React = require("../models/React");
const mongoose = require('mongoose');
exports.reactPost = async (req, res) => {
    try {
        const {postId, react} = req.body;
        const check = await React.findOne({
            postRef: postId,
            reactBy: mongoose.Types.ObjectId(req.user.id),
        });

        if (check == null) {
            const newReact = new React({
                react: react,
                postRef: postId,
                reactBy: req.user.id,
            });
            await newReact.save();
        }
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};