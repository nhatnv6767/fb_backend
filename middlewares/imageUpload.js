const fs = require('fs');
module.exports = async function (req, res, next) {
    try {
        if (!req.files || Object.values(req.files).flat().length === 0) {
            return res.status(400).json({message: "No files selected."});
        }
        let files = Object.values(req.files).flat();
        files.forEach((file) => {
            if (file.mimetype !== "image/jpeg"
                && file.mimetype !== "image/png"
                && file.mimetype !== "image/gif"
                && file.mimetype !== "image/webp"
            ) {
                removeTmp(file.tempFilePath);
                return res.status(400).json({message: "Unsupported format."});
            }
        });
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};

const removeTmp = (path) => {

}