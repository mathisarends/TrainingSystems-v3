const express = require("express");
const Router = express.Router();
const User = require("../models/user");
const path = require("path");

const fs = require("fs");
const profilesImagePath = path.join(__dirname, "../public"); // Absoluter Pfad zum Verzeichnis "public/images/profiles"

const upload = require("../multerConfig");

Router.post(
  "/upload-profile-picture",
  upload.single("profile-picture"),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect("/");
      }

      const filePath = req.file.path;

      const normalizedFilePath = path.normalize(filePath);
      let imagePathForDB = normalizedFilePath
        .replace("public" + path.sep, "")
        .replace(/\\/g, "/");
      imagePathForDB = "/" + imagePathForDB;

      //aktualisiere das User-Dokument in der Datenbank mit dem neuen Profilbild-Pfad
      const user = await User.findById(req.user._id);
      const oldProfilePicturePath = user.profilePicture;
      user.profilePicture = imagePathForDB;
      await user.save();

      if (oldProfilePicturePath) {
        const oldImagePath = path.join(
          profilesImagePath,
          oldProfilePicturePath
        );
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error("Fehler beim Löschen des alten Profilbildes: " + err);
          } else {
            console.log("Altes Profilbild erfolgreich gelöscht.");
          }
        });
      }

      res.redirect("/");
    } catch (error) {
      console.error("Fehler beim Hochladen des Profilbildes: " + error);
      res.redirect("/");
    }
  }
);

Router.get("/", async (req, res) => {
  try {
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).send("Benutzer nicht gefunden");
      }
      res.render("index", {
        user: user,
      });
    } else {
      res.redirect("/welcome");
    }
  } catch (err) {
    console.log("Fehler beim Laden der Hauptseite");
    console.log(err);
  }
});

Router.get("/welcome", async (req, res) => {

  res.render("indexNoAuthentication");
})

Router.get("/offline", async (req, res) => {
  res.render("offline");
})



Router.get("/home", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }
  } catch (err) {
    console.log("Fehler beim Laden der homePage", err);
  }
})

module.exports = Router;


// TODO: Diese funktion im training router verwenden
function getmostRecentTrainingDay(trainingPlan) {
  if (!trainingPlan) {
    console.log("Kein Trainingsplan übergeben!");
    return {
      weekIndex: undefined,
      dayIndex: undefined,
    };
  }

  for (let i = trainingPlan.trainingWeeks.length - 1; i >= 0; i--) {
    const week = trainingPlan.trainingWeeks[i];
    for (let j = week.trainingDays.length - 1; j >= 0; j--) {
      const day = week.trainingDays[j];
      // Überprüfe, ob es Übungen im aktuellen Trainingstag gibt
      if (day.exercises) {
        for (let k = 0; k < day.exercises.length; k++) {
          const exercise = day.exercises[k];
          // Überprüfe, ob das "weight"-Attribut in der Übung vorhanden ist
          if (exercise.weight) {
            console.log("gefunden!: " + i + " " + j + " " + k);
            return {
              weekIndex: parseInt(i),
              dayIndex: parseInt(j),
            };
          }
        }
      }
    }
  }
  return {
    weekIndex: undefined,
    dayIndex: undefined,
  };
}
