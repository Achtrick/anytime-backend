const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
require("dotenv").config();
const { mongoose } = require("./database/mongoose");
const { user } = require("./database/models/user.model");
const { client } = require("./database/models/client.model");

// server settings
const port = process.env.PORT || 3001;
app = express();
app.enable("trust proxy");
app.listen(port, () => {
  console.log("RUNNING ON PORT " + port + " ...");
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
// production samesite = none // secure = true ..
// development samesite = lax // secure = false ..
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    key: "user",
    resave: false,
    secret: "AnytimeAnywhereMailer",
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 48,
      sameSite: "lax",
    },
  })
);

// server API'S

// Auth
app.get("/", (req, res) => {
  res.send("RUNNING SERVER ON PORT: " + port);
});

app.post("/createAccount", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const hash = bcrypt.hashSync(password, 10);

  const newuser = new user({
    email: email,
    password: hash,
  });
  try {
    newuser.save();

    res.send("SUCCESS");
  } catch (err) {
    res.send("ERROR");
    console.log(err);
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  user.findOne({ email: email }, (err, user) => {
    if (err) {
      res.send("ACCOUNT NOT FOUND");
    } else if (user) {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          res.send("ERROR");
        } else {
          if (result) {
            req.session.user = {
              connected: true,
            };
            res.send(req.session.user);
          } else {
            res.send("WRONG PASSWORD");
          }
        }
      });
    } else {
      res.send("ERROR");
    }
  });
});

app.get("/login", (req, res) => {
  if (req.session.user) {
    res.send(req.session.user);
  } else {
    res.send({ connected: false });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy();
});

// Mailing
app.post("/addclient", (req, res) => {
  const companyName = req.body.companyName,
    activity = req.body.activity,
    ceoName = req.body.ceoName,
    phone = req.body.phone,
    email = req.body.email,
    address = req.body.address;

  newClient = new client({
    companyName,
    activity,
    ceoName,
    phone,
    email,
    address,
  });

  try {
    newClient.save();
    res.send("SUCCESS");
  } catch (e) {
    res.send("ERROR");
  }
});

app.get("/sendmails", async (req, res) => {
  const clientsList = await client.find({});
  var emails = [];
  clientsList.map((client) => {
    emails.push(client.email);
  });
  console.log(emails);
});
