const express = require("express");
const cors = require("cors");

const app = express();
const options = {
  origin: "http://localhost:3000"
}

app.use(cors(options));

app.get("/", (req, res) => {
  res.send("welcome from home");
});
app.get("/books", (req, res) => {
  res.send("nothing here");
});
app.listen(8000, () => {
  console.log("server is listening...");
});
