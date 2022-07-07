exports.home = (req, res) => {
    res.json({
        message: "You should not go here.",
        error: "Kick out",
    });
};