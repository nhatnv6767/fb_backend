const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const userSchema = mongoose.Schema({
    first_name: {
        type: String,
        required: [true, "first_name is required"],
        // if have any spaces, it's going to remove them
        trim: true,
        // use it to search
        text: true,
    },

    last_name: {
        type: String,
        required: [true, "last_name is required"],
        trim: true,
        text: true,
    },

    username: {
        type: String,
        required: [true, "username is required"],
        trim: true,
        text: true,
        unique: true,
    },

    email: {
        type: String,
        required: [true, "email is required"],
        trim: true,
    },

    password: {
        type: String,
        required: [true, "password is required"],
    },

    picture: {
        type: String,
        trim: true,
        default: "https://bit.ly/3uvRXju",
    },

    cover: {
        type: String,
        trim: true,
    },

    gender: {
        type: String,
        required: [true, "gender is required"],
        trim: true,
    },

    bYear: {
        type: Number,
        required: true,
        trim: true,
    },

    bMonth: {
        type: Number,
        required: true,
        trim: true,
    },

    bDay: {
        type: Number,
        required: true,
        trim: true,
    },

    verified: {
        type: Boolean,
        default: false,
    },

    friends: {
        type: Array,
        default: [],
    },

    // the people that you follow
    following: {
        type: Array,
        default: [],
    },

    followers: {
        type: Array,
        default: [],
    },

    requests: {
        type: Array,
        default: [],
    },

    search: [
        {
            user: {
                type: ObjectId,
                ref: "User"
            }
        }
    ],

    details: {
        bio: {
            type: String,
        },
        otherName: {
            type: String,
        },
        job: {
            type: String,
        },
        workplace: {
            type: String,
        },
        highSchool: {
            type: String,
        },
        college: {
            type: String,
        },
        currentCity: {
            type: String,
        },
        hometown: {
            type: String,
        },
        relationship: {
            type: String,
            enum: ["Single", "In a relationship", "Married", "Divorced"],
        },
        instagram: {
            type: String,
        },
    },

    savedPosts: [
        {
            post: {
                type: ObjectId,
                ref: "Post",
            },
            savedAt: {
                type: Date,
                default: new Date(),
            },
        }
    ],
}, {
    timestamps: true,
});

module.exports = mongoose.model("User", userSchema);