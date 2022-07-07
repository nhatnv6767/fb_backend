const User = require("../models/User");
const {validateEmail} = require('../helpers/validation');

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

        const check = await User.findOne({
            email: email
        });

        return;
        const user = await new User({
            first_name,
            last_name,
            email,
            password,
            username,
            bYear,
            bMonth,
            bDay,
            gender,
        }).save();
        res.json(user);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};