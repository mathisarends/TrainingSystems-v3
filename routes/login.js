import express from "express";
import passport from "passport";
const router = express.Router();
import transporter from "../mailerConfig.js";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET;

import bcrypt from "bcrypt";
import { checkNotAuthenticated } from "../authMiddleware.js";
import User from "../models/user.js";

router.get("/", checkNotAuthenticated, (req, res) => {
  res.render("login/index", {layout: false});
});

router.post(
  "/",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

router.get("/reset", checkNotAuthenticated, (req, res) => {
  res.render("login/reset", { layout: false, errorNotification: "" });
})

router.get("/resetPassword/:token",  async (req, res) => {

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

router.post("/resetPassword",  async (req, res) => {

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


router.post("/reset", async (req, res) => {
  const emailReceived = req.body.email;


  try {
    const user = await User.findOne({ email: emailReceived });

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
      text: `Klicke auf den folgenden Link um dein Passwort zurückzusetzen: ${process.env.BASE_URL}/login/resetPassword/${generatedToken}`,
      //hier könnte man mit html: auch eine html datei einklemmen
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

    } catch (err) {
      console.log("Es ist ein Fehler beim zurücksetzen des Passwortes aufgetreten!");
      console.error(err);
    }
})

export default router;
