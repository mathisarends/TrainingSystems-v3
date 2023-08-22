const express = require("express");
const User = require("../models/user");
const Router = express.Router();
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../authMiddleware");

Router.get("/", (req, res) => {
  res.render("tools/index");
});

Router.get("/volume", checkAuthenticated, async (req, res) => {
  try {
    if (req.user) {
      const user = await User.findOne({ name: req.user.name });
      if (!user) {
        return res.status(404).send("Benutzer nicht gefunden");
      }
      const trainingData =
        user.trainingData.length > 0 ? user.trainingData[0] : {};

      res.render("tools/volume", {
        id: req.user.id,
        name: user.name,
        squatMax: user.maxSquat || "",
        benchMax: user.maxBench || "",
        deadliftMax: user.maxDeadlift || "",
        total: user.total || "",
        gender : user.gender || "",
        bodyweight : user.bodyWeight || "",
        bodyheight: user.bodyHeight || "",
        strengthLevel: user.strengthLevel || "",
        stress: user.stress || "",
        age: user.age || "",
        nutrition: user.nutrition || "",
        sleep: user.sleepQuality || "",
        doping: user.doping || "",
        regeneration: user.regeneration || "",
        trainingExperience: user.trainingExperience || "",
        recentSquatWeight: trainingData.recentSquatWeight || "",
        recentSquatReps: trainingData.recentSquatReps || "",
        recentBenchWeight: trainingData.recentBenchWeight || "",
        recentBenchReps: trainingData.recentBenchReps || "",
        recentDeadliftWeight: trainingData.recentDeadliftWeight || "",
        recentDeadliftReps: trainingData.recentDeadliftReps || "",
      });
    } else {
      res.render("tools/volume", { id: null, name: null });
    }
  } catch (err) {
    console.log("hat nicht geklappt");
    console.log(err);
  }
});

Router.post("/volume", checkAuthenticated, async (req, res) => {
  try {
    const {
      squatWeight,
      squatReps,
      squatEstMax,
      benchWeight,
      benchReps,
      benchEstMax,
      deadliftWeight,
      deadliftReps,
      deadliftEstMax,
      totalEstMax,
      gender,
      bodyweight,
      bodyheight,
      strengthLevel,
      trainingExperience,
      age,
      nutrition,
      sleep,
      stress,
      doping,
      regeneration,
      squatmev,
      squatmrv,
      benchmev,
      benchmrv,
      deadliftmev,
      deadliftmrv
    } = req.body;

    const user = await User.findOne({ name: req.user.name });

    if (!user.trainingData || user.trainingData.length === 0) {
      // If no trainingData exists, create a new entry
      user.trainingData = [
        {
          recentSquatWeight: squatWeight,
          recentSquatReps: squatReps,
          recentBenchWeight: benchWeight,
          recentBenchReps: benchReps,
          recentDeadliftWeight: deadliftWeight,
          recentDeadliftReps: deadliftReps,
          minimumSetsSquat: squatmev,
          maximumSetsSquat: squatmrv,
          minimumSetsBench: benchmev,
          maximumSetsBench: benchmrv,
          minimumSetsDeadlift: deadliftmev,
          maximumSetsDeadlift: deadliftmrv,
        },
      ];
    } else {
      // Update the existing trainingData entry
      user.trainingData[0] = {
        recentSquatWeight: squatWeight,
        recentSquatReps: squatReps,
        recentBenchWeight: benchWeight,
        recentBenchReps: benchReps,
        recentDeadliftWeight: deadliftWeight,
        recentDeadliftReps: deadliftReps,
        minimumSetsSquat: squatmev,
        maximumSetsSquat: squatmrv,
        minimumSetsBench: benchmev,
        maximumSetsBench: benchmrv,
        minimumSetsDeadlift: deadliftmev,
        maximumSetsDeadlift: deadliftmrv,
      };
    }

    user.gender = gender;
    user.bodyWeight = bodyweight;
    user.bodyHeight = bodyheight;
    user.strengthLevel = strengthLevel;
    user.trainingExperience = trainingExperience;
    user.age = age;
    user.nutrition = nutrition;
    user.sleepQuality = sleep;
    user.stress = stress;
    user.doping = doping;
    user.regenerationCapacity = regeneration;
    user.maxSquat = squatEstMax;
    user.maxBench = benchEstMax;
    user.maxDeadlift = deadliftEstMax;
    user.total = totalEstMax;

    await user.save();

    console.log("Daten gespeichert");
    console.log(user);
    // Redirect zurück zur vorherigen Seite (der Seite, auf der das Formular abgeschickt wurde)
    const referer = req.headers.referer || "/";
    res.redirect(referer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Fehler beim Verarbeiten der Formulardaten");
  }
});

Router.get("/backoff", (req, res) => {
  res.render("tools/backoff");
});

Router.get("/max", (req, res) => {
  res.render("tools/max");
});

module.exports = Router;
