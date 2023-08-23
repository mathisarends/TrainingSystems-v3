const express = require("express");
const passport = require("passport");
const Router = express.Router();

const transporter = require("../mailerConfig");
const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET;

const bcrypt = require("bcrypt");
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../authMiddleware");

const User = require("../models/user");

Router.get("/", checkNotAuthenticated, (req, res) => {
  res.render("login/index", { layout: false });
});

Router.post(
  "/",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

Router.get("/reset", checkNotAuthenticated, (req, res) => {
  res.render("login/reset", { layout: false, errorNotification: "" });
})

Router.get("/resetPassword/:token",  async (req, res) => {

  try {
    const token = req.params.token;
    const decodedToken = jwt.verify(token, jwtSecret);

    const user = await User.findById(decodedToken.userId);

    if (!user) {
      res.render("login/resetPassword", { layout: false, errorNotification: "Benutzer nicht gefunden" });
      return;
    } else {
      // Rendere die Seite zum Zurücksetzen des Passworts
      console.log(token);
      res.render("login/resetPassword", { layout: false, token: token, errorNotification: "" });
    }

  } catch (err) {
    console.error(err);
    res.render("login/reset", { layout: false, errorNotification: "Ungültiger Token oder anderer Fehler. Starte einen neuen Versuch!"});
  }
})

Router.post("/resetPassword",  async (req, res) => {

  try {
    const token = req.body.token;
    console.log("übergebener Token:");
    console.log(token);

    const decodedToken = jwt.verify(token, jwtSecret);

    const user = await User.findById(decodedToken.userId);

    if (!user) {
      res.render("login/resetPassword", { layout: false, errorNotification: "Benutzer nicht gefunden"});
      return;
    }

    const newPassword = req.body.password;
    const newPasswordHashed = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newPasswordHashed;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.render("login/resetPassword", { layout: false, errorNotification: "Ungültiger Token oder anderer Fehler. Starte einen neuen Versuch!"});
  }
})


Router.post("/reset", async (req, res) => {
  const emailReceived = req.body.email;

  try {
    const user = await User.findOne({ email: emailReceived });
    console.log(user);

    if(!user) {
      res.render("login/reset", { layout: false, errorNotification: "There is no user with that E-Mail" });
      return;
    }

    const generatedToken = jwt.sign({ userId: user._id }, jwtSecret, {expiresIn: "10m"});

    user.resetToken = generatedToken;
    user.resetTokenExpiration = Date.now() + 10 * 60 * 1000; //aktuelle Zeit + 10 Minuten
    await user.save();

    console.log("Bis hierhin")


    // noch gar nicht getestet mit dem html ups TODO:
    const mailOptions = {
      from: "imreavy@gmail.com",
      to: user.email,
      subject: "Passwort zurücksetzen",
      text: "Klicke auf den folgenden Link um dein Passwort zurückzusetzen: http://localhost:3000/login/resetPassword/" + generatedToken,
      html: `<!DOCTYPE html>
      <html>
      <head>
          <style>
              /* Inline CSS-Stile für die E-Mail */
              body {
                  font-family: Arial, sans-serif;
              }
              .email-container {
                  background-color: #F5F5F5;;
                  padding: 20px;
              }
      
              .button {
                  background-color: #002952;
                  color: white;
                  padding: 10px 20px;
                  text-decoration: none;
                  border-radius: 5px;
              }
      
              .link-container {
                  margin-top: 20px;
              }
          </style>
      </head>
      <body>
          <div class="email-container">
              <h1>Passwort zurücksetzen</h1>
              <p>Klicke auf den folgenden Link, um dein Passwort zurückzusetzen:</p>
              <div class="link-container">
                  <a href="http://localhost:3000/login/resetPassword/${generatedToken}" class="button">Passwort zurücksetzen</a>
              </div>
              
          </div>
      </body>`
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Fehler beim Versenden der E-mail: " + error);
        res.render("login/reset", { layout: false, errorNotification: "Fehler beim Versenden der E-Mail"});
      } else {
        console.log("Email wurde erfolgreich versendet: " + info.response);
        res.render("login/reset", { layout: false, errorNotification: "Die Email wurde erfolgreich versandt!"});
      }
    })

    /* console.log("Nutzer gefunden redirect zu login");
    res.redirect("/login"); */
    } catch (err) {
      console.log("Es ist ein Fehler beim zurücksetzen des Passwortes aufgetreten!");
      console.error(err);
    }
})

module.exports = Router;
