const mongoose = require('mongoose');

/* Destructuring the `ObjectId` property from the `mongoose.Schema` object. */
const {ObjectId} = mongoose.Schema;

const reactSchema = new mongoose.Schema({
    react: {
        type: String,
        enum: ['like', 'love', 'haha', 'sad', 'angry', 'wow'],
        required: true,
    },
    postRef: {
        type: ObjectId,
        ref: "Post",
    },
    reactBy: {
        type: ObjectId,
        ref: "User",
    }
});

module.exports = mongoose.model("React", reactSchema);