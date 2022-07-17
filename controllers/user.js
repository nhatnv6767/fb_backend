const User = require("../models/User");
const Code = require("../models/Code");
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
        });
        sendResetCode(user.email, user.first_name, code);
        return res.status(200).json({
            message: "Email reset code has been sent to your email",
        });
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};