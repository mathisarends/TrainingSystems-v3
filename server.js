import dotenv from "dotenv";

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

import express from "express";
import cors from "cors";
import session from "express-session";
import MongoDBStoreFactory from "connect-mongodb-session";
import flash from "express-flash";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from "path";
import bodyParser from 'body-parser';
import passport from "passport";
import expressLayouts from "express-ejs-layouts";
import methodOverride from "method-override";
import initializePassport from "./passport-config.js";

import indexRouter from "./routes/index.js";
import trainingRouter from "./routes/training.js";
import loginRouter from "./routes/login.js";
import registerRouter from "./routes/register.js";
import logoutRouter from "./routes/logout.js";
import toolRouter from "./routes/tools.js";
import exerciseRouter from "./routes/exercises.js";

import mongoose from "mongoose";
import crypto from "crypto";
import "./oauth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MongoDBStore = MongoDBStoreFactory(session); 
const app = express();
const PORT = process.env.PORT || 8080;

const mongoURI = process.env.MONGODB_URI;
const sessionSecret= process.env.SESSION_SECRET;

// connect to MongoDB database
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
app.use(express.static(__dirname + "/public"));
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


