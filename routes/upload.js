const express = require('express');
const {uploadImages} = require("../controllers/upload");
const {authUser} = require("../middlewares/auth");

const router = express.Router();

router.post("/uploadImages", uploadImages);

module.exports = router;