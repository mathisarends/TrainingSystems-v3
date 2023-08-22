const express = require("express");
const User = require("../models/user");
const Router = express.Router();
const bcrypt = require("bcrypt");
const standartExerciseCatalog = require("../models/standartExerciseCatalog");

const templateTrainingGenerator = require("../models/templateTrainingGenerator");

Router.get("/", (req, res) => {
  res.render("register/index", { layout: false, error: "" });
});

Router.post("/", async (req, res) => {
  if (req.body.password !== req.body.repeatPassword) {
    res.render("register/index", { layout: false, error: "Passwords do not match!" });
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  try {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: hashedPassword,
    });
    await newUser.save();
    console.log("User wurde erfolgreich erstellt");

    let userID = newUser._id;

    newUser.exercises = standartExerciseCatalog;
    await newUser.save();


    newUser.trainingPlanTemplate[0] = templateTrainingGenerator.createTemplatePlanA(userID);
    newUser.trainingPlanTemplate[1] = templateTrainingGenerator.createTemplatePlanB(userID);

    await newUser.save();
    console.log("Template TrainingPlan erfolgreich gespeichert");

    // redirection to login page
    res.redirect("/login");
  } catch (err) {
    console.error(err);

    if (newUser) {
      await newUser.remove();
      console.log("Newly created user deletet due to registration error");
    }

    res.render("register/index", {
      layout: false,
      error:
        "Fehler bei der Registrierung. Versuche es mit einem anderen Namen!",
    });
  }
});

module.exports = Router;

