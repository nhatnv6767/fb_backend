const express = require('express');

const router = express.Router();

router.get("/add", (req, res) => {
    res.send("welcome from user home");
});

module.exports = router;