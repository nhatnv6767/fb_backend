module.exports = async function (req, res, next) {
    try {
        console.log(Object.values(req.files).flat());
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};