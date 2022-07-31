const User = require("../models/User");
const Code = require("../models/Code");
const Post = require("../models/Post");
const {
    validateEmail,
    validateLength,
    validateUsername
} = require('../helpers/validation');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const {generateToken} = require("../helpers/tokens");
const {sendVerificationEmail, sendResetCode} = require("../helpers/mailer");
const generateCode = require("../helpers/generateCode");


exports.register = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            password,
            username,
            bYear,
            bMonth,
            bDay,
            gender,
        } = req.body;


        if (!validateEmail(email)) {
            return res.status(400).json({
                message: 'Invalid email address',
            });
        }

        const check = await User.findOne({email});
        if (check) {
            return res.status(400).json({
                message: 'This email address is already exists, try with a different email address',
            });
        }

        if (!validateLength(first_name, 3, 30)) {
            return res.status(400).json({
                message: 'First name must be between 3 and 30 characters.',
            });
        }

        if (!validateLength(last_name, 3, 30)) {
            return res.status(400).json({
                message: 'Last name must be between 3 and 30 characters.',
            });
        }


        if (!validateLength(password, 6, 40)) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters.',
            });
        }

        const cryptedPassword = await bcrypt.hash(password, 12);

        let tempUsername = first_name + last_name;
        let newUsername = await validateUsername(tempUsername);
        const user = await new User({
            first_name,
            last_name,
            email,
            password: cryptedPassword,
            username: newUsername,
            bYear,
            bMonth,
            bDay,
            gender,
        }).save();

        const emailVerificationToken = generateToken(
            {id: user._id.toString()},
            "30m"
        );

        const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
        sendVerificationEmail(user.email, user.first_name, url);

        const token = generateToken({id: user._id.toString()}, "7d");
        res.send({
            id: user._id,
            username: user.username,
            picture: user.picture,
            first_name: user.first_name,
            last_name: user.last_name,
            token: token,
            verified: user.verified,
            message: "Register Success ! Please activate your email to start",
        });
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};

exports.activateAccount = async (req, res) => {
    try {
        const validUser = req.user.id;
        const {token} = req.body;
        const user = jwt.verify(token, process.env.TOKEN_SECRET);
        const check = await User.findById(user.id);

        if (validUser !== user.id) {
            return res.status(400).json({message: "You don't have the authorization to complete this operation"});
        }

        /* This is checking if the user is already verified. <verified> is a field in mongodb */
        if (check.verified) {
            return res.status(400).json({message: "This email is already activated"});
        } else {
            await User.findByIdAndUpdate(user.id, {
                verified: true,
            });
            return res.status(200).json({message: "Account has been activated successfully"});
        }
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({message: "The email address you entered is not connected to an account."});
        }

        const check = await bcrypt.compare(password, user.password);
        if (!check) {
            return res.status(400).json({message: "Invalid credentials. Please try again."});
        }

        const token = generateToken({id: user._id.toString()}, "7d");
        res.send({
            id: user._id,
            username: user.username,
            picture: user.picture,
            first_name: user.first_name,
            last_name: user.last_name,
            token: token,
            verified: user.verified,
        });
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};

exports.sendVerification = async (req, res) => {
    try {
        const id = req.user.id;
        const user = await User.findById(id);
        if (user.verified === true) {
            return res.status(400).json({message: "This account is already verified."});
        }
        const emailVerificationToken = generateToken(
            {id: user._id.toString()},
            "30m"
        );

        const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
        sendVerificationEmail(user.email, user.first_name, url);
        return res.status(200).json({message: "Email verification link has been sent to your email."});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};

exports.findUser = async (req, res) => {
    try {
        const {email} = req.body;
        const user = await User.findOne({email}).select("-password");
        if (!user) {
            return res.status(400).json({message: "Account does not exists."});
        }

        return res.status(200).json({
            email: user.email,
            picture: user.picture,
            first_name: user.first_name,
            last_name: user.last_name,
        });
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};


exports.sendResetPasswordCode = async (req, res) => {
    try {
        const {email} = req.body;
        const user = await User.findOne({email}).select("-password");
        /* Removing the code from the database. */
        await Code.findOneAndRemove({user: user._id});
        const code = generateCode(5);
        const saveCode = await new Code({
            code,
            user: user._id,
        }).save();
        sendResetCode(user.email, user.first_name, code);
        return res.status(200).json({
            message: "Email reset code has been sent to your email",
        });
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};

exports.validateResetCode = async (req, res) => {
    try {
        const {email, code} = req.body;
        const user = await User.findOne({email});
        const DbCode = await Code.findOne({user: user._id});

        if (DbCode.code !== code) {
            return res.status(400).json({message: "Verification code is wrong."});
        }
        return res.status(200).json({message: "Ok"});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};

exports.changePassword = async (req, res) => {
    try {
        const {email, password} = req.body;
        const cryptedPassword = await bcrypt.hash(password, 12);
        await User.findOneAndUpdate({email}, {
            password: cryptedPassword
        });
        return res.status(200).json({message: "Ok"});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};

exports.getProfile = async (req, res) => {
    try {
        const {username} = req.params;
        const user = await User.findById(req.user.id);
        const profile = await User.findOne({username}).select("-password");
        const friendship = {
            friends: false,
            following: false,
            requestSent: false,
            requestReceived: false,
        };
        if (!profile) {
            return res.json({ok: false});
        }

        /* The above code is checking if the user is already friends with the profile. */
        if (user.friends.includes(profile._id) && profile.friends.includes(user._id)) {
            friendship.friends = true
        }

        if (user.following.includes(profile._id)) {
            friendship.following = true
        }

        if (user.requests.includes(profile._id)) {
            friendship.requestReceived = true;
        }

        if (profile.requests.includes(user._id)) {
            friendship.requestSent = true
        }

        const posts = await Post.find({user: profile._id})
            .populate("user")
            .sort({createdAt: -1});


        res.json({...profile.toObject(), posts});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};

exports.updateProfilePicture = async (req, res) => {
    try {
        const {url} = req.body;
        await User.findByIdAndUpdate(req.user.id, {
            picture: url,
        });
        res.json(url);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};

exports.updateCover = async (req, res) => {
    try {
        const {url} = req.body;
        await User.findByIdAndUpdate(req.user.id, {
            cover: url,
        });
        res.json(url);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};
exports.updateDetails = async (req, res) => {
    try {
        const {infos} = req.body;
        const updated = await User.findByIdAndUpdate(req.user.id, {
            details: infos,
        }, {
            /* A mongoose option that returns the updated document instead of the original document. */
            /* if dont have, it's gonna have the user before the update, when having -> make sure to return
            the updated values of the user
            * */
            new: true,
        });
        res.json(updated.details);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};

exports.addFriend = async (req, res) => {
    try {
        /* It's checking if the user is trying to add himself as a friend. */
        if (req.user.id !== req.params.id) {
            const sender = await User.findById(req.user.id);
            const receiver = await User.findById(req.params.id);
            /* It's checking if the user is already in the requests array or in the friends array. */
            if (!receiver.requests.includes(sender._id) && !receiver.friends.includes(sender._id)) {
                await receiver.updateOne({
                    /* It's pushing the sender id to the requests array. */
                    $push: {requests: sender._id},
                });
                await receiver.updateOne({
                    $push: {followers: sender._id},
                });
                await sender.updateOne({
                    $push: {following: sender._id},
                });
                res.json({message: 'Friend request has been sent'});
            } else {
                return res.status(400).json({message: "Already sent"});
            }
        } else {
            return res.status(400).json({message: "You can't send a request to yourself"});
        }
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};
exports.cancelRequest = async (req, res) => {
    try {
        /* It's checking if the user is trying to add himself as a friend. */
        if (req.user.id !== req.params.id) {
            const sender = await User.findById(req.user.id);
            const receiver = await User.findById(req.params.id);
            /* Checking if the receiver's requests array includes the sender's id and if the receiver's friends array does
            not include the sender's id. */
            if (receiver.requests.includes(sender._id) && !receiver.friends.includes(sender._id)) {
                await receiver.updateOne({
                    /* It's pushing the sender id to the requests array. */
                    $pull: {requests: sender._id},
                });
                await receiver.updateOne({
                    $pull: {followers: sender._id},
                });
                await sender.updateOne({
                    $pull: {following: sender._id},
                });
                res.json({message: 'You successfully canceled request'});
            } else {
                return res.status(400).json({message: "Already canceled"});
            }
        } else {
            return res.status(400).json({message: "You can't cancel a request to yourself"});
        }
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};
exports.follow = async (req, res) => {
    try {
        /* It's checking if the user is trying to add himself as a friend. */
        if (req.user.id !== req.params.id) {
            const sender = await User.findById(req.user.id);
            const receiver = await User.findById(req.params.id);
            /* Checking if the receiver is not following the sender and the sender is not following the receiver. */
            if (!receiver.followers.includes(sender._id) && !sender.following.includes(receiver._id)) {
                await receiver.updateOne({
                    /* It's pushing the sender id to the requests array. */
                    $push: {followers: sender._id},
                });
                await sender.updateOne({
                    $push: {following: receiver._id},
                });
                res.json({message: 'Follow successfully'});
            } else {
                return res.status(400).json({message: "Already following"});
            }
        } else {
            return res.status(400).json({message: "You can't follow yourself"});
        }
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};
exports.unfollow = async (req, res) => {
    try {
        /* It's checking if the user is trying to add himself as a friend. */
        if (req.user.id !== req.params.id) {
            const sender = await User.findById(req.user.id);
            const receiver = await User.findById(req.params.id);
            /* Checking if the sender is following the receiver and if the receiver is following the sender. */
            if (receiver.followers.includes(sender._id) && sender.following.includes(receiver._id)) {
                await receiver.updateOne({
                    /* It's pushing the sender id to the requests array. */
                    $pull: {followers: sender._id},
                });
                await sender.updateOne({
                    $pull: {following: receiver._id},
                });
                res.json({message: 'Unfollow successfully'});
            } else {
                return res.status(400).json({message: "Already not following"});
            }
        } else {
            return res.status(400).json({message: "You can't unfollow yourself"});
        }
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};
exports.acceptRequest = async (req, res) => {
    try {
        /* It's checking if the user is trying to add himself as a friend. */
        if (req.user.id !== req.params.id) {
            const receiver = await User.findById(req.user.id);
            const sender = await User.findById(req.params.id);
            /* Checking if the sender is following the receiver and if the receiver is following the sender. */
            if (receiver.requests.includes(sender._id)) {
                await receiver.update({
                    /* Pushing the sender's id into the friends and following arrays of the receiver. */
                    $push: {friends: sender._id, following: sender._id},
                });
                await sender.update({
                    $push: {friends: receiver._id, followers: receiver._id},
                });
                await sender.updateOne({
                    $pull: {requests: sender._id},
                });
                res.json({message: 'Friend request accepted'});
            } else {
                return res.status(400).json({message: "Already friend"});
            }
        } else {
            return res.status(400).json({message: "You can't accept a request from yourself"});
        }
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};
exports.unfriend = async (req, res) => {
    try {
        /* It's checking if the user is trying to add himself as a friend. */
        if (req.user.id !== req.params.id) {
            const sender = await User.findById(req.user.id);
            const receiver = await User.findById(req.params.id);
            /* Checking if the sender is following the receiver and if the receiver is following the sender. */
            if (receiver.friends.includes(sender._id) && sender.friends.includes(receiver._id)) {
                await receiver.update({
                    /* Pushing the sender's id into the friends and following arrays of the receiver. */
                    $pull: {friends: sender._id, following: sender._id, followers: sender._id},
                });
                await sender.update({
                    /* Pushing the sender's id into the friends and following arrays of the receiver. */
                    $pull: {friends: receiver._id, following: receiver._id, followers: receiver._id},
                });

                res.json({message: 'Already unfriend...'});
            } else {
                return res.status(400).json({message: "Already not friend"});
            }
        } else {
            return res.status(400).json({message: "You can't unfriend yourself"});
        }
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};
exports.deleteRequest = async (req, res) => {
    try {
        /* It's checking if the user is trying to add himself as a friend. */
        if (req.user.id !== req.params.id) {
            const receiver = await User.findById(req.user.id);
            const sender = await User.findById(req.params.id);
            /* Checking if the sender is following the receiver and if the receiver is following the sender. */
            if (receiver.requests.includes(sender._id)) {
                await receiver.update({
                    /* Pushing the sender's id into the friends and following arrays of the receiver. */
                    $pull: {requests: sender._id, followers: sender._id},
                });
                await sender.update({
                    /* Pushing the sender's id into the friends and following arrays of the receiver. */
                    $pull: {following: receiver._id},
                });

                res.json({message: 'Delete request successfully...'});
            } else {
                return res.status(400).json({message: "Already deleted request"});
            }
        } else {
            return res.status(400).json({message: "You can't delete request yourself"});
        }
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};