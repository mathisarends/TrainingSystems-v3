const express = require("express");
const User = require("../models/user");
const Router = express.Router();
const bcrypt = require("bcrypt");

const standartExerciseCatalog = require("../models/standartExerciseCatalog");
const templateTrainingGenerator = require("../models/templateTrainingGenerator");

const passwordValidator = require("password-validator");
const passwordSchema = new passwordValidator();
passwordSchema // Mindestlänge von 8 Zeichen
/*   .is()
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
  .spaces(); */

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

    if (password !== req.body.repeatPassword) {
      return res.render("register/index", {
        layout: false,
        error: "Passwörter stimmen nicht überein!",
      });
    }

    if (!passwordSchema.validate(password)) {
      // Das Passwort erfüllt nicht die Sicherheitsanforderungen
      return res.render("register/index", {
        layout: false,
        error: "Das Passwort erfüllt nicht die Mindestanforderungen.",
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
    res.redirect(`/register/config?userID=${newUser._id}`);
/*     res.redirect("/login"); */
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

// auf diese Seite wird man weitergeleitet nach der Restrierung und man kann seine einstellungen vornehmen
Router.get("/config", async (req, res) => {
  try {
    const userID = req.query.userID; // from query-parameter

    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden.");
    }

    

    res.render("register/registerConfig", { user, layout:false });
  } catch (err) {
    console.error("Fehler beim Aufrufen der Register Config Datei " + err);
  }
});

Router.post("/config", async (req, res) => {
  //Doping und regenerationsfähigkeit auf Standartwerte setzen:

  try {
    const userID = req.query.userID; // from query-parameter

    const user = await User.findById(userID);
  
    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden.");
    }
  
    const gender = req.body.gender;
    const height = req.body.height;
    const bodyWeight = req.body.bodyWeight;
    const age = req.body.age;
  
    const maxSquat = req.body.maxSquat;
    const maxBench = req.body.maxBench;
    const maxDeadlift = req.body.maxDeadlift;
    const strengthLevel = req.body.strengthLevel;
  
    const trainingExperience = req.body.trainingExperience;
    const sleep = req.body.sleep;
    const nutrition = req.body.nutrition;
    const stress = req.body.stress;
  
    console.log(sleep + "schlafqualität");

    user.gender = gender;
    user.bodyHeight = height;
    user.bodyWeight = bodyWeight;
    user.age = age;
    user.maxSquat = maxSquat;
    user.maxBench = maxBench;
    user.maxDeadlift = maxDeadlift;
    user.strengthLevel = strengthLevel;
    user.trainingExperience = trainingExperience;
    user.sleepQuality = sleep;
    user.nutrition = nutrition;
    user.stress = stress;
  
    // Standartwerte die ich einfach mal so annehme
    user.regenerationCapacity = "durchschnittlich";
    user.doping = "nein";
  
    await user.save();

    res.status(200).json({});
  
    console.log(user);
  } catch (err) {
    console.error("Es ist ein Fehler bei der Volumenconfig aufgetreten: " + err);
    res.status(500).json({ error: "Fehler beim Verarbeiten der Formulardaten" });

  }



  

})







module.exports = Router;
