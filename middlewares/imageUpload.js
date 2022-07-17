module.exports = async function (req, res, next) {
    try {
        console.log("Welcome from middleware");
        next();
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};