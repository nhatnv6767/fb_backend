module.exports = async function (req, res, next) {
    try {
        console.log((req.files));
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};