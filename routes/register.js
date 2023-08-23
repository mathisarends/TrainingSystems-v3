const express = require("express");
const User = require("../models/user");
const Router = express.Router();
const bcrypt = require("bcrypt");

const standartExerciseCatalog = require("../models/standartExerciseCatalog");
const templateTrainingGenerator = require("../models/templateTrainingGenerator");

const passwordValidator = require("password-validator");
const passwordSchema = new passwordValidator();
passwordSchema // Mindestlänge von 8 Zeichen
  .is()
  .min(8)
  .is()
  .max(100)

  // Mindestens 1 Großbuchstabe, 1 Kleinbuchstabe und 1 Zahl
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits(1)
  //Keine Leerzeichen
  .has()
  .not()
  .spaces();

Router.get("/", (req, res) => {
  res.render("register/index", { layout: false, error: "" });
});

Router.post("/", async (req, res) => {
  let newUser; // Deklaration außerhalb des try-Blocks

  try {
    const existingUser = await User.findOne({
      $or: [{ name: req.body.name }, { email: req.body.email }],
    });

    if (existingUser) {
      return res.render("register/index", {
        layout: false,
        error: "Benutzername oder E-Mail bereits vorhanden!",
      });
    }

    const password = req.body.password;

    if (!passwordSchema.validate(password)) {
      // Das Passwort erfüllt nicht die Sicherheitsanforderungen
      return res.render("register/index", {
        layout: false,
        error: "Das Passwort erfüllt nicht die Mindestanforderungen.",
      });
    }

    if (password !== req.body.repeatPassword) {
      return res.render("register/index", {
        layout: false,
        error: "Passwörter stimmen nicht überein!",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    newUser = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: hashedPassword,
    });

    await newUser.save();
    console.log("User wurde erfolgreich erstellt");

    let userID = newUser._id;

    newUser.exercises = standartExerciseCatalog;
    await newUser.save();

    newUser.trainingPlanTemplate[0] =
      templateTrainingGenerator.createTemplatePlanA(userID);
    newUser.trainingPlanTemplate[1] =
      templateTrainingGenerator.createTemplatePlanB(userID);

    await newUser.save();
    console.log("Template TrainingPlan erfolgreich gespeichert");

    // Redirect zur Login-Seite
    res.redirect("/login");
  } catch (err) {
    console.error(err);

    if (newUser) {
      // Wenn ein Fehler auftritt und newUser existiert, entferne den Benutzer aus der Datenbank
      await newUser.remove();
      console.log("Neu erstellter Benutzer aufgrund eines Registrierungsfehlers gelöscht");
    }

    res.render("register/index", {
      layout: false,
      error:
        "Fehler bei der Registrierung. Versuche es mit einem anderen Namen oder einer anderen E-Mail-Adresse!",
    });
  }
});

module.exports = Router;
