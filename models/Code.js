const mongoose = require('mongoose');

/* Destructuring the `ObjectId` property from the `mongoose.Schema` object. */
const {ObjectId} = mongoose.Schema;

const codeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    user: {
        type: ObjectId,
        ref: "User",
        required: true,
    }
});

module.exports = mongoose.model("Code", codeSchema);