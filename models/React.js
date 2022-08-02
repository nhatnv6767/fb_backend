const mongoose = require('mongoose');

/* Destructuring the `ObjectId` property from the `mongoose.Schema` object. */
const {ObjectId} = mongoose.Schema;

const reactSchema = new mongoose.Schema({

});

module.exports = mongoose.model("React", reactSchema);