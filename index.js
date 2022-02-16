const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const session = require("express-session");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const port = process.env.PORT || 3001;

app = express();

app.listen(port, () => {
  console.log("Running on port " + port + " ...");
});

app.use(
  cors({
    origin: [
      "https://anytime4anywhere.com",
      "https://anytime4anywhere.fr",
      "http://localhost:3000",
    ],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

let transporter = nodemailer.createTransport({
  service: "SMTP",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

const mailcss = {
  background: `
  style="background: rgb(99, 182, 199);
  background: linear-gradient(
  90deg,
  rgba(99, 182, 199, 1) 0%,
  rgba(99, 182, 199, 1) 48%,
  rgba(99, 182, 199, 1) 100%
  );
  border-radius: 5px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
  color: white;"`,
  body: `
  style="background: white;
  border-radius: 5px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
  color: black;"`,
};

app.get("/", (req, res) => {
  res.send("Running on port " + port + " ...");
});
