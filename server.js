if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const baseUrl = process.env.BASE_URL;

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("express-flash");
const path = require("path");
const bodyParser = require('body-parser');

const passport = require("passport");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const initializePassport = require("./passport-config");

const indexRouter = require("./routes/index");
const trainingRouter = require("./routes/training");
const loginRouter = require("./routes/login");
const registerRouter = require("./routes/register");
const logoutRouter = require("./routes/logout");
const toolRouter = require("./routes/tools");
const exerciseRouter = require("./routes/exercises");

const mongoose = require("mongoose");
const crypto = require("crypto");

const oauth = require("./oauth");

const app = express();
const PORT = 3000;

const mongoURI = process.env.MONGODB_URI;
const sessionSecret= process.env.SESSION_SECRET;

// MongoDB Verbindung
async function connect() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connected to the Database");
    
    // Erstelle das MongoDBStore-Objekt nach erfolgreicher Verbindung
    // create mongoDBStore-Object after sucessfull connection
    const store = new MongoDBStore({
      uri: mongoURI, // use same uri
      collection: 'sessionStorage',
    });
    
    // configure express-session with mongoDBStore
    app.use(
      session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        store: store, // use the mongoDB-store object created
      })
    );

  } catch (err) {
    console.error("Error connecting to the database: ", err);
    throw err;
  }
}
connect();

initializePassport(passport);

// Express-Einstellungen und Middleware
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/public/audio", cors());
app.use(express.static("public", { maxAge: 0 }));
app.use(express.urlencoded({ extended: true })); //ACHTUNG HIER AUF FEHLER PRÜFEN
app.use(bodyParser.urlencoded({ extended: true }));

const secret = process.env.SESSION_SECRET || generateRandomSecret();

app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 } // session-time
  })
);

// Passport-Konfiguration
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json()); //JSON Parser

// Flash-Messages
app.use(flash());

// Passport-Initialisierung
initializePassport(passport);

// Routers
app.use("/", indexRouter);
app.use("/training", trainingRouter);
app.use("/logout", logoutRouter);
app.use("/login", loginRouter);
app.use("/register", registerRouter);
app.use("/tools", toolRouter);
app.use("/exercises", exerciseRouter);

app.get("/auth/google", 
  passport.authenticate("google", { scope: ["email", "profile"]}),
)

app.get("/google/callback",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/login"
  })
)

app.get("/register-service-worker", (req, res) => {
  res.sendFile(path.join(__dirname, "service-worker.js"))
})

app.get("/offline", (req, res) => {
  res.render("offline.ejs");
})


app.listen(process.env.PORT || PORT, () => console.log(`Listening on port ${PORT}`));

function generateRandomSecret() {
  return crypto.randomBytes(32).toString("hex");
}


