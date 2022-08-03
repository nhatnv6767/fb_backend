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
        } else {
            if (check.react == react) {
                await React.findByIdAndRemove(check._id);
            } else {
                await React.findByIdAndUpdate(check._id, {
                    react: react,
                });
            }
        }
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};

exports.getReacts = async (req, res) => {
    try {
        const reacts = await React.find({postRef: req.params.id});
        /* Checking if the user has already reacted to the post. */
        // .toString because it's an object id
        /*
        * const check1 = reacts.find((x) => x.reactBy.toString() == req.user.id)?.react;
        console.log(check1);
        * */
        const newReacts = reacts.reduce((group, react) => {
            console.log("react", react);
        });

        const check = await React.findOne({
            postRef: req.params.id,
            reactBy: req.user.id,
        });
        res.json({
            reacts,
            check: check?.react,
        });
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};