const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const useRoutes = require("./routes/user");

app.use("/api", useRoutes);

app.listen(8000, () => {
    console.log("server is listening...");
});
