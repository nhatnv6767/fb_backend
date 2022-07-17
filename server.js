const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const {readdirSync} = require("fs");
dotenv.config();

let allowed = ["http://localhost:8000", "192.168.1.113:8000", "192.168.1.202:8000"];

let options = (req, res) => {
    let tmp;
    let origin = req.header("Origin");
    if (allowed.indexOf(origin) > -1) {
        tmp = {
            origin: true,
            optionSuccessStatus: 200,
        };
    } else {
        tmp = {
            origin: "nothing",
        };
    }
    res(null, tmp);
};

const app = express();
app.use(express.json());
app.use(cors());
app.use(fileUpload({
    /* Used to store the file temporarily in the server. */
    useTempFiles: true,
}));

// routes
readdirSync("./routes").map((r) => app.use("/", require("./routes/" + r)));

// database
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
})
    .then(() => console.log("Database connected successfully"))
    .catch((err) => console.log("Error connecting to mongodb", err));

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`server is running at ${PORT}`);
});

