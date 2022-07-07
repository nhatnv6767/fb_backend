const express = require("express");
const cors = require("cors");

const app = express();
let allowed=["http://localhost:3000", "some another link"]
let options = (req, res) => {
  let tmp;
  let origin = req.header("Origin");
  if(allowed.indexOf(origin) > -1) {
    tmp = {
      origin: true,
      optionSuccessStatus: 200,
    }
  } else {
    tmp = {
      origin: "nothing",
    }
  }
  res(null, tmp);
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
