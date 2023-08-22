const express = require("express");
const session = require("express-session");
const flash = require("express-flash");
const path = require("path");
const crypto = require("crypto");
const passport = require("passport");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const initializePassport = require("./passport-config");
const indexRouter = require("./routes/index");
const accountRouter = require("./routes/account");
const trainingRouter = require("./routes/training");
const loginRouter = require("./routes/login");
const registerRouter = require("./routes/register");
const logoutRouter = require("./routes/logout");
const toolRouter = require("./routes/tools");
const exerciseRouter = require("./routes/exercises");
const mongoose = require("mongoose");

const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("./authMiddleware");

/* const BASE_URL = require("./urlConfig"); */
const app = express();
const PORT = 3000;

const mongoURI = process.env.MONGODB_URI;

// MongoDB Verbindung
async function connect() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connected to the Database");
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
app.use(express.static("public", { maxAge: 0 })); // Setze den Cache auf 0, um ihn zu deaktivieren
app.use(express.urlencoded({ extended: false }));

// Generiere ein zufälliges Secret für die Sitzung
function generateRandomSecret() {
  return crypto.randomBytes(32).toString("hex");
}
const secret = generateRandomSecret();

// Sitzungskonfiguration
app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 } // Setze die Sitzungslaufzeit auf 1 Stunde (in Millisekunden)
  })
);

// Passport-Konfiguration
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false })); // Body-Parser-Middleware
app.use(express.json()); //JSON Parser

// Flash-Messages
app.use(flash());

// Passport-Initialisierung
initializePassport(passport);

// Routers
app.use("/", indexRouter);
app.use("/training", trainingRouter);
app.use("/account", accountRouter);
app.use("/logout", logoutRouter);
app.use("/login", loginRouter);
app.use("/register", registerRouter);
app.use("/tools", toolRouter);
app.use("/exercises", exerciseRouter);


// Starte den Server
/* app.listen(PORT, () => console.log(`Server up at port ${PORT}`)); */

app.listen(process.env.PORT || PORT, () => console.log(`Listening on port ${PORT}`));

