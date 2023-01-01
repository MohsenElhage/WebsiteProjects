const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3001;
const { DB_URL } = require("./config");
require("./models/user");
require("./models/artwork");

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(require("./routes/user"));

mongoose.connect(DB_URL);
mongoose.connection.on("connected", () => {
  console.log("db connected");
});
mongoose.connection.on("error", (err) => {
  console.log(err);
});
require("./models/user");
app.listen(PORT, () => {
  console.log(`server is listening on ${PORT}`);
});
