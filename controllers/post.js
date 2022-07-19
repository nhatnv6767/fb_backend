const Post = require("../models/Post");
exports.createPost = async (req, res) => {
    try {
        const post = await new Post(req.body).save();
        res.json(post);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};

exports.getAllPosts = async (req, res) => {
    try {

    } catch (e) {
        res.status(500).json({message: e.message});
    }
}