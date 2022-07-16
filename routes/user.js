const express = require('express');
const {
    register,
    activateAccount,
    login,
    sendVerification,
    findUser,
} = require("../controllers/user");
const {authUser} = require("../middlewares/auth");

const router = express.Router();

router.post("/register", register);
router.post("/activate", authUser, activateAccount);
router.post("/login", login);
router.post("/sendVerification", authUser, sendVerification);
router.post("/findUser", findUser);

module.exports = router;