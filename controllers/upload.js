exports.uploadImages = async (req, res) => {
    try {
        res.json("Welcome from image upload.");
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};