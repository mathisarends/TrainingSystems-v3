import express from "express";
import User from "../models/user.js";
const router = express.Router();
import bcrypt from "bcrypt";

import standartExerciseCatalog from "../models/standartExerciseCatalog.js";
import templateTrainingGenerator from "../models/templateTrainingGenerator.js";

import passwordValidator from "password-validator";
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

router.get("/", (req, res) => {
  res.render("register/index", { layout: false, error: "" });
});

router.post("/", async (req, res) => {
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
      const errors = passwordSchema.validate(password, { list: true });
      // errors enthält eine Liste der fehlenden Anforderungen
    
      let errorMessage = "";

      if (errors.includes("uppercase")) {
        errorMessage += "Mindestens 1 Großbuchstabe<br>";
      }

      if (errors.includes("lowercase")) {
        errorMessage += "Mindestens 1 Kleinbuchstabe<br>";
      }
    
      if (errors.includes("min")) {
        errorMessage += "Mindestens 8 Zeichen<br>";
      }

      if (errors.includes("spaces")) {
        errorMessage += "Keine Leerzeichen<br>";
      }
    
      if (errors.includes("digits")) {
        errorMessage += "Mindestens 1 Zahl<br>";
      }
    

    
      return res.render("register/index", {
        layout: false,
        error: errorMessage,
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
router.get("/config", async (req, res) => {
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

router.post("/config", async (req, res) => {
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

export default router;