const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const {readdirSync} = require("fs");
const app = express();
app.use(cors());

readdirSync("./routes").map((r) => app.use("/", require("./routes/" + r)));

app.listen(8000, () => {
    console.log("server is listening...");
});
