const express = require("express");
const Router = express.Router();
const User = require("../models/user");
const multer = require("multer");
const path = require("path");

const fs = require("fs");
const profilesImagePath = path.join(__dirname, "../public"); // Absoluter Pfad zum Verzeichnis "public/images/profiles"

const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../authMiddleware");

// Definiere Speicherort und Dateinamen für die Profilbilder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/profiles"); // Speicherort für hochgeladene Bilder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, "profile-picture-" + uniqueSuffix + fileExtension);
  },
});

const upload = multer({ storage: storage });

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
      const user = await User.findOne({ name: req.user.name });
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

Router.get("/newIndex", async (req, res) => {
  try {
    res.render("newIndex", { layout: false });
  } catch (e) {
    console.log("Fehler aufgetreten: " + e);
  }
})



Router.get("/", checkAuthenticated, async (req, res) => {
  try {
    if (req.user) {
      const user = await User.findOne({ name: req.user.name });
      if (!user) {
        return res.status(404).send("Benutzer nicht gefunden");
      }

      // TODO: hier möchte ich eigentlich auch noch die neuen templates berücksichtigen

      const customTrainingPlans = user.trainingPlansCustomNew || [];
      const templateTrainingPlans = user.trainingPlanTemplate || [];
      const allTrainingPlans = [...customTrainingPlans, ...templateTrainingPlans];
      const mostRecentTrainingPlan = getMostRecentTrainingPlan(allTrainingPlans); //am anfang kommt so ein quatsch wert raus weil der als letztes auto erstellt wurde ^^
      const { weekIndex, dayIndex } = getmostRecentTrainingDay(mostRecentTrainingPlan);

      const mostRecentTrainingWeek = mostRecentTrainingPlan?.trainingWeeks[weekIndex];

      const mostRecentTrainingTotal = calculateWeeklyTrainingTotal(
        mostRecentTrainingWeek,
        user.maxSquat,
        user.maxBench,
        user.maxDeadlift
      );

      const mostRecentTrainingPlanDate = mostRecentTrainingPlan.lastUpdated;
      
      const formattedDate = formatDateToGermanDateString(new Date(mostRecentTrainingPlanDate));

      let mostRecentTrainingPlanTitle = mostRecentTrainingPlan ? mostRecentTrainingPlan.title : "";

        // Trainingsplan wird beim erstellen immer neu geordnet deswegen immer A ganz praktisch
  
      let trainingWeek = weekIndex + 1;
      trainingWeek = isNaN(trainingWeek) ? 1 : trainingWeek;
      let currentTrainingDay = dayIndex + 1;

        //JUMP
      let nextTrainingday =
        (parseInt(currentTrainingDay) + 1) %
        (mostRecentTrainingPlan?.trainingFrequency + 1);

      if (nextTrainingday === 0) {
        nextTrainingday = 1;
        trainingWeek = parseInt(trainingWeek) + 1;
      }

      let trainingPlanType;
      if (allTrainingPlans.indexOf(mostRecentTrainingPlan) < customTrainingPlans.length) {
        trainingPlanType = "custom-A";
      } else if (mostRecentTrainingPlan === templateTrainingPlans[0]) {
        trainingPlanType = "template-A";
      } else if (mostRecentTrainingPlan === templateTrainingPlans[1]) {
        trainingPlanType = "template-B";
      }

      let mostRecentTrainingPlanURI = `/training/${trainingPlanType}${trainingWeek}`;
      
      // wird nur ausgeführt wenn es noch keinen einzigen bereits bearbeiteten plan gibt
      if (weekIndex === undefined && dayIndex === undefined) {
        mostRecentTrainingPlanURI = `/training/template-A1`;
        mostRecentTrainingPlanTitle = "Template A";
      }

      const userGender = user.gender;


      res.render("index", {
        user: user,
        id: req.user.id,
        name: user.name,
        gender: userGender,
        userProfilePicturePath: user.profilePicture,
        mostRecentTrainingPlanURI:
          mostRecentTrainingPlanURI || "/training/custom-A1", //URI übergeben
          formattedDate: formattedDate || "",
        currentTrainingDay: currentTrainingDay || 0,
        trainingWeek: trainingWeek || 1,
        nextTrainingday: nextTrainingday || 1,
        mostRecentTrainingPlan: mostRecentTrainingPlan,
        trainingPlanTitle: mostRecentTrainingPlanTitle || "null",
        mostRecentTrainingTotal: mostRecentTrainingTotal,
      });
    } else {
      res.render("index", { id: null, name: null });
    }
  } catch (err) {
    console.log("Fehler beim Laden der Hauptseite");
    console.log(err);
  }
});

module.exports = Router;

function getMostRecentTrainingPlan(trainingPlans) {
  try {
    trainingPlans.sort(
      //sortiere die übergebenen Trainingspläne nach datum
      (a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime()
    );

    return trainingPlans[0];

  } catch (err) {
    console.log("Fehler beim Abrufen der Trainingspläne:", err);
    return null;
  }
}

//trainingPlansCustom[i] übergeben + die bisherigen gespeicherten maxes für den user:
function calculateWeeklyTrainingTotal(
  trainingWeek,
  fallbackSquat,
  fallbackBench,
  fallbackDeadlift
) {
  if (!trainingWeek) {
    return "Es konnten noch keine Werte erfasst werden!";
}

  let weeklySquatMax = 0;
  let weeklyBenchMax = 0;
  let weeklyDeadliftMax = 0;

  let weeklyTotal = 0;

  for (let i = 0; i < trainingWeek.trainingDays.length; i++) {
    const trainingDay = trainingWeek.trainingDays[i];
    for (let j = 0; j < trainingDay.exercises.length; j++) {
      const exercise = trainingDay.exercises[j];

      if (exercise.category === "Squat" && exercise.estMax > weeklySquatMax) {
        weeklySquatMax = exercise.estMax;
      } else if (exercise.category === "Bench" && exercise.estMax > weeklyBenchMax) {
        weeklyBenchMax = exercise.estMax;
      } else if (exercise.category === "Deadlift" && exercise.estMax > weeklyDeadliftMax) {
        weeklyDeadliftMax = exercise.estMax;
      }
    }
  }

  if (weeklySquatMax === 0 && !fallbackSquat || weeklyBenchMax === 0 && !fallbackBench || weeklyDeadliftMax === 0 && !fallbackDeadlift) {
    return "Es konnte kein gültiges Total ermittelt werden!";
  }

  // backup values of record maxes if there where no valid values
  if (weeklySquatMax === 0) {
    weeklySquatMax = fallbackSquat;
  }

  if (weeklyBenchMax === 0) {
    weeklyBenchMax = fallbackBench;
  }

  if (weeklyDeadliftMax === 0) {
    weeklyDeadliftMax = fallbackDeadlift;
  }

  weeklyTotal = weeklySquatMax + weeklyBenchMax + weeklyDeadliftMax;

  return weeklyTotal;
}

//Fumktion die den zuletzt trainierten Trainingstag von dem zuletzt trainierten Trainingsplan rausfindet

function getmostRecentTrainingDay(trainingPlan) {

  if (!trainingPlan) {
    console.log("Kein Trainingsplan übergeben!")
    return {
      weekIndex: undefined,
      dayIndex: undefined,
    }
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
  }
}

function formatDateToGermanDateString(date) {
  const daysOfWeek = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const dayOfWeek = daysOfWeek[date.getDay()];

  return `${dayOfWeek}, den ${day}.${month}.${year}`;
}

