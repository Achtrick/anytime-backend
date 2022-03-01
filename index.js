const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const mailer = require("./components/mailer");

require("dotenv").config();
const { mongoose } = require("./database/mongoose");
const { user } = require("./database/models/user.model");
const { client } = require("./database/models/client.model");

// server settings
const port = process.env.PORT || 3001;
// production samesite = none // secure = true ..
// development samesite = lax // secure = false ..
const cookie =
  process.env.NODE_ENV === "production"
    ? {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 48,
        sameSite: "none",
      }
    : {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 48,
        sameSite: "lax",
      };

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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    key: "user",
    resave: false,
    secret: "AnytimeAnywhereMailer",
    saveUninitialized: true,
    cookie: cookie,
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
    contactName = req.body.contactName,
    phone = req.body.phone,
    email = req.body.email,
    address = req.body.address;

  newClient = new client({
    companyName,
    activity,
    contactName,
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

app.post("/getclients", async (req, res) => {
  var currentPage;
  var searchTerm;
  var allPages = [];

  if (req.body.currentPage) {
    currentPage = req.body.currentPage;
  } else {
    currentPage = 1;
  }
  if (req.body.searchTerm) {
    searchTerm = req.body.searchTerm;
  } else {
    searchTerm = "";
  }

  try {
    const clients = await client
      .find({
        $or: [
          {
            companyName: { $regex: ".*" + searchTerm + ".*", $options: "i" },
          },
          {
            contactName: { $regex: ".*" + searchTerm + ".*", $options: "i" },
          },
        ],
      })
      .limit(10)
      .skip((currentPage - 1) * 10)
      .sort({ createdAt: -1 })
      .exec();

    const count = await client.countDocuments({
      firstName: { $regex: ".*" + searchTerm + ".*" },
    });
    let totalPages = Math.ceil(count / 10);

    for (let i = 1; i <= totalPages; i++) {
      allPages.push(i);
    }
    res.send({
      clients,
      allPages,
    });
  } catch (err) {
    console.error(err.message);
  }
});

app.post("/getclient", (req, res) => {
  const id = req.body.id;
  client.findById(id, (err, row) => {
    if (row) {
      res.send(row);
    }
  });
});

app.post("/sendmails", async (req, res) => {
  const subject = req.body.subject,
    message = req.body.message;
  const clientsList = await client.find({});

  if (clientsList.length >= 1) {
    clientsList.forEach((client) => {
      mailer.transporter.sendMail(
        {
          from: '"Anytime & Anywhere" <' + process.env.AUTH_EMAIL + ">",
          to: client.email,
          subject: subject,
          html: `<html>
                  <head>
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
                    <link
                      href="https://fonts.googleapis.com/css2?family=Poppins:wght@200&family=Source+Sans+Pro:wght@300;400&display=swap"
                      rel="stylesheet"
                    />
                  </head>
                  <body>
                    <div
                      style="
                        width: 100%;
                        background-color: #ccc;
                        display: inline-flex;
                        margin: 0px;
                        padding-top: 100px;
                        padding-bottom: 100px;
                      "
                    >
                      <div style="width: 10%; background-color: #ccc"></div>
                      <div style="width: 80%; background-color: #fff">
                        <div
                          style="
                            width: 100%;
                            display: inline-flex;
                            background-color: rgb(255, 255, 255);
                          "
                        >
                          <div style="width: 20%"></div>
                          <div style="width: 60%">
                            <div
                              style="
                                display: flex;
                                width: 100%;
                                justify-content: center;
                                padding-top: 50px;
                              "
                            >
                              <img
                                width="100%"
                                alt="header"
                                src="https://lh3.google.com/u/0/d/16yDuGG3_Xm3MbaG-ipgcvv5aRI96513N=w1366-h568-iv1"
                              />
                            </div>
                            <div
                              style="
                                display: block;
                                width: 100%;
                                justify-content: center;
                                padding-top: 50px;
                                padding-bottom: 100px;
                                font-family: 'Poppins', sans-serif;
                                font-family: 'Source Sans Pro', sans-serif;
                              "
                            >
                              <div
                                style="
                                  width: 100%;
                                  display: inline-block;
                                  justify-content: center;
                                  font-size: x-large;
                                  text-align: center;
                                "
                              >
                                Trouvez vos prochains clients grâce
                                <br />
                                <div style="display: inline-flex">
                                  <div style="padding-right: 5px">à</div>
                                  <div style="padding-right: 5px">un</div>
                                  <div style="padding-right: 5px">ou</div>
                                  <div style="padding-right: 5px">une</div>
                                  <div style="font-weight: bold; padding-left: 5px">
                                    spécialiste marketing
                                  </div>
                                </div>
                                <br />
                                <br />
                                <div style="font-size: large; text-align: justify">
                                  Bonjour:${client.companyName}
                                </div>
                                <br />
                                <div style="font-size: large; text-align: justify">
                                ${message}
                                </div>
                                <div style="padding-top: 100px">
                                  <a href="tel:+21654563326"
                                    ><img
                                      width="100%"
                                      alt="callBtn"
                                      src="https://lh3.google.com/u/0/d/1sBiO0k_R5HExQ3SCHCvnZZuVlpfVY1EB=w1366-h625-iv1"
                                  /></a>
                                </div>
                                <br />
                                <div style="font-size: large; text-align: left">
                                  Bien cordialement,
                                </div>
                                <br />
                                <br />
                                <div
                                  style="
                                    display: inline-flex;
                                    justify-content: center;
                                    align-items: center;
                                    width: 100%;
                                  "
                                >
                                  <div style="width: 10%"></div>
                                  <div style="width: 20%">
                                    <img
                                      width="100%"
                                      alt="nizarPhoto"
                                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Breezeicons-actions-22-im-user.svg/1200px-Breezeicons-actions-22-im-user.svg.png"
                                      style="border-radius: 50%; padding: 10px; height: auto"
                                    />
                                  </div>
                                  <div style="width: 60%; margin-left: 20px">
                                    <div
                                      style="
                                        font-size: large;
                                        text-align: left;
                                        font-weight: bold;
                                      "
                                    >
                                      Nizar JERFEL
                                    </div>
                                    <div
                                      style="
                                        font-size: large;
                                        text-align: left;
                                        color: rgb(102, 102, 102);
                                      "
                                    >
                                      Votre spécialiste marketing digital
                                    </div>
                                  </div>
                                  <div style="display: block; width: 10%"></div>
                                </div>
                                <br />
                                <br />
                                <div
                                  style="
                                    display: inline-flex;
                                    justify-content: center;
                                    align-items: center;
                                    width: 100%;
                                  "
                                >
                                  <div style="width: 30%"></div>
                                  <div style="width: 60%">
                                    <div
                                      style="
                                        display: inline-flex;
                                        justify-content: center;
                                        align-items: center;
                                        width: 100%;
                                      "
                                    >
                                      <a
                                        href="https://www.facebook.com/anywhere4"
                                        style="width: calc(100% / 3)"
                                      >
                                        <img
                                          width="100%"
                                          style="padding: 10px"
                                          src="https://lh3.google.com/u/0/d/1p-_hJBtvmkLCKSJyeMZ0fc8ctlzPoX8C=w1366-h625-iv1"
                                          alt="Facebook"
                                        />
                                      </a>
                                      <a
                                        href="https://www.instagram.com/anytime4anywhere/"
                                        style="width: calc(100% / 3)"
                                      >
                                        <img
                                          width="100%"
                                          style="padding: 10px"
                                          src="https://lh3.google.com/u/0/d/1IDKWCMD05SDTKPqUj4NnidBKSuSkNkFO=w860-h625-iv1"
                                          alt="Instagram"
                                        />
                                      </a>
                                      <a
                                        href="https://www.linkedin.com/company/anytime-anywhere/"
                                        style="width: calc(100% / 3)"
                                      >
                                        <img
                                          width="100%"
                                          style="padding: 10px"
                                          src="https://lh3.google.com/u/0/d/1kFCu6Z-0IoEqrLtt1jFM37jDVPw8Q68r=w1366-h625-iv1"
                                          alt="LinkedIn"
                                        />
                                      </a>
                                    </div>
                                  </div>
                                  <div style="width: 30%"></div>
                                </div>
                                <br />
                                <div
                                  style="
                                    padding-top: 20px;
                                    display: block;
                                    text-align: center;
                                    width: 100%;
                                    font-size: 20px;
                                  "
                                >
                                  Anytime & Anywhere
                                  <br />
                                  <br />
                                  <br />
                                  <hr />
                                  www.anytime4anywhere.com
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style="width: 10%; background-color: #ccc"></div>
                    </div>
                  </body>
                </html>
                `,
        },
        (err) => {
          if (err) {
            res.send("ERROR");
          } else {
            res.send("SUCCESS");
          }
        }
      );
    });
  } else {
    res.send("EMPTY");
  }
});
