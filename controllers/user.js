exports.home = (req, res) => {
    res.status(200).json({
        message: "You should not go here.",
        error: "Kick out",
    });
};