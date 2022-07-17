const cloudinary = require('cloudinary');
const fs = require('fs');
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});
exports.uploadImages = async (req, res) => {
    try {
        const {path} = req.body;
        let files = Object.values(req.files).flat();
        let images = [];
        for (const file of files) {
            const url = await uploadToCloudinary(file, path);
            images.push(url);
        }
        res.json(images);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};

const uploadToCloudinary = async (file, path) => {
    return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload(
            file.tempFilePath, {
                folder: path
            }, (err, res) => {
                if (err) {

                }
            }
        )
    })
}