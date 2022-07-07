const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const {readdirSync} = require("fs");
const app = express();
app.use(cors());

// routes
readdirSync("./routes").map((r) => app.use("/", require("./routes/" + r)));

// database
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`server is running at ${PORT}`);
});
