const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    first_name: {
        type: String,
        required: [true, "first_name is required"],
        // if have any spaces, it's going to remove them
        trim: true,
        // use it to search
        text: true,
    },
});