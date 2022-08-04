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
        const posts = await Post.find().populate("user",
            "first_name last_name picture username gender"
            /* Sorting the posts by the date they were created. */
        ).sort({createdAt: -1});
        res.json(posts);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};

exports.comment = async (req, res) => {
    try {
        const {comment, image, postId} = req.body;
        let newComments = await Post.findByIdAndUpdate(postId, {
            $push: {
                comments: {
                    comment: comment,
                    image: image,
                    commentBy: req.user.id,
                    // use timezone of Javascript, dont use of mongodb
                    commentAt: new Date(),
                }
            }
        }, {
            new: true,
            /* Populating the `commentBy` field with the user's information. */
        }).populate("comments.commentBy", "picture first_name last_name username");
        res.json(newComments.comments);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};