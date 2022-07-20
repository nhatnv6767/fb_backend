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
            removeTmp(file.tempFilePath);
        }
        res.json(images);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};

exports.listImages = async (req, res) => {
    try {
        const {path, sort, max} = req.body;
        cloudinary.v2.search
            .expression(`${path}`)
            .sort_by("public_id", `${sort}`)
            .max_results(max)
            .execute()
            .then((result) => {
                res.json(result);
            }).catch((e) => {
            console.log(e.error.message);
        });
    } catch (e) {
        res.status(500).json({message: e.message});
    }
};

/**
 * It uploads a file to Cloudinary and returns a promise that resolves to an object containing the URL of the uploaded file
 * @param file - The file object that contains the file's information.
 * @param path - The path to the folder where you want to upload the image.
 */
const uploadToCloudinary = async (file, path) => {
    return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload(
            file.tempFilePath, {
                folder: path
            }, (err, res) => {
                if (err) {
                    removeTmp(file.tempFilePath);
                    return res.status(400).json({message: "Upload image failed"});
                }
                resolve({
                    url: res.secure_url,
                });
            }
        );
    });
};

const removeTmp = (path) => {
    /* It removes the file from the file system. */
    fs.unlink(path, (err) => {
        if (err) throw err;
    });
};