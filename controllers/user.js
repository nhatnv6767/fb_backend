const User = require("User");

exports.register = async (req, res) => {
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

    const user = await new User(req.body).save();
    res.json(user);
};