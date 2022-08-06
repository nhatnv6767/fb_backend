const Post = require("../models/Post");
const User = require("../models/User");
exports.createPost = async (req, res) => {
    try {
        const post = await new Post(req.body).save();
        await post.populate("user", "first_name last_name cover picture username");
        res.json(post);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};

exports.getAllPosts = async (req, res) => {
    try {
        const followingTemp = await User.findById(req.user.id).select("following");
        const following = followingTemp.following;
        const promises = following.map((user) => {
            return Post.find({user: user})
                .populate("user", "first_name last_name picture username cover")
                .populate("comments.commentBy", "first_name last_name picture username")
                .sort({createdAt: -1})
                .limit(10);
        });
        const followingPosts = (await Promise.all(promises)).flat();
        const userPosts = await Post.find({user: req.user.id})
            .populate("user", "first_name last_name picture username cover")
            .populate("comments.commentBy", "first_name last_name picture username")
            .sort({createdAt: -1})
            .limit(10);
        followingPosts.push(...[...userPosts]);
        followingPosts.sort((a, b) => {
            return b.createdAt - a.createdAt;
        });
        res.json(followingPosts);
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
exports.savePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const user = await User.findById(req.user.id);
        const check = user?.savedPosts.find((post) => post.post.toString() === postId);

        if (check) {
            await User.findByIdAndUpdate(req.user.id, {
                $pull: {
                    savedPosts: {
                        post: postId,

                    }
                }
            });
        } else {
            await User.findByIdAndUpdate(req.user.id, {
                $push: {
                    savedPosts: {
                        post: postId,
                        saveAt: new Date(),
                    }
                }
            });
        }

    } catch (e) {
        res.status(500).json({message: e.message});
    }
};