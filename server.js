const express = require("express");
const cors = require("cors");
const {readdirSync} = require("fs");
const app = express();
app.use(cors());
const useRoutes = require("./routes/user");

app.use("/user", useRoutes);
readdirSync("./routes");

app.listen(8000, () => {
    console.log("server is listening...");
});
