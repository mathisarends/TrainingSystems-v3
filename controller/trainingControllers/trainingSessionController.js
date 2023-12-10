import User from "../../models/user.js";
import TrainingSchema from "../../models/trainingSchema.js";

import { renderTrainingPlansView, categorizeExercises } from "./sharedFunctionality.js";

/* TRAINING SESSION */
export async function getCreateTraining(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    if (user.trainings.length >= 3) {
      renderTrainingPlansView(res, user, {
        errorCreatingNewCustomTraining: "Du hast bereits die maximale Anzahl an Trainings gespeichert!"
      });
    } else {
      res.render("trainingPlans/scratch/createTraining", { layout: false });
    }
  } catch (err) {
    console.log("Es ist ein Fehler beim Aufrufen der Create-Training Page enstanden. " + err);
  }
}

export async function postCreateTraining(req, res) {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    const trainingTitle = req.body.training_title;
    const trainingPhase = req.body.training_phase;
    const date = new Date();
    const userID = req.user._id;

    const trainingObject = {
      //create object which we can save in trainings-array
      trainingDate: date,
      exercises: []
    };

    const newTrainingPlan = new TrainingSchema({
      user: userID,
      title: trainingTitle,
      lastUpdated: date,
      trainingPhase: trainingPhase,
      trainings: trainingObject
    });

    const savedTrainingPlan = await newTrainingPlan.save();

    user.trainings.push(savedTrainingPlan);
    user.trainings.sort((a, b) => b.lastUpdated - a.lastUpdated); //Trainingspläne sollen immer nach datum absteigend sortiert sein TODO: Testen ob das funktioniert
    await user.save();
    res.redirect("/training/session-train-1");
  } catch (err) {
    console.error(err);
    res.status(500).send("Fehler beim Verarbeiten der Formulardaten");
  }
}

export async function handleDeleteSession(req, res) {
  const indexToDelete = req.body.deleteIndex;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    user.trainings.splice(indexToDelete, 1);
    await user.save();

    console.log("Trainingsplan gelöscht");

    res.status(200).json({});
  } catch (err) {
    console.log("A error occured while trying to delete the training plan", err);
  }
}

export async function getSessionEdit(req, res, sessionIndex) {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    const training = user.trainings[sessionIndex];
    const trainingTitle = training.title;
    const trainingPhase = training.trainingPhase;

    //hier müssen wir mehr informationen retrieven über die einzelnen trainingstage

    res.render("trainingPlans/scratch/editTraining", {
      userID: user.id,

      sessionIndex: sessionIndex,
      trainingTitle,
      trainingPhase,
      layout: false
    });
  } catch (err) {
    console.error("Error occured while trying to access the session edit page", err);
  }
}

export async function patchSessionEdit(req, res, sessionIndex) {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    const trainingSession = user.trainings[sessionIndex];
    const newTitle = req.body.training_title;
    const newTrainingPhase = req.body.training_phase;

    if (trainingSession.title !== newTitle) {
      trainingSession.title = newTitle;
    }
    if (trainingSession.trainingPhase !== newTrainingPhase) {
      trainingSession.trainingPhase = newTrainingPhase;
    }

    await user.save();
    res.redirect("/training");
    /* res.status(200).json({}); */
  } catch (err) {
    console.log("An error ocurred while patching the session", err);
  }
}

export async function getTrainingSession(req, res, index) {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    const training = user.trainings[index];

    const trainingTitle = training.title;
    const trainingPhase = training.trainingPhase;

    const trainingData = extractTrainingExerciseData(training, 0); //JUMP
    const previousTrainingData = extractTrainingExerciseData(training, 1);

    //JUMP
    const { exerciseCategories, categoryPauseTimes, categorizedExercises, defaultRepSchemeByCategory, maxFactors } =
      categorizeExercises(user.exercises);

    const volumeMarkers = user.trainingData.length > 0 ? user.trainingData[0] : {}; //volume recomandations

    const date = formatDateWithDay(training.lastUpdated); //newst date from newest training

    res.render("trainingPlans/scratch/trainingSession", {
      userID: user.id,
      user: user,

      exerciseCategories,
      categoryPauseTimes,
      categorizedExercises,
      defaultRepSchemeByCategory,
      maxFactors,

      volumeMarkers: volumeMarkers,
      squatmev: volumeMarkers.minimumSetsSquat || "",
      squatmrv: volumeMarkers.maximumSetsSquat || "",
      benchmev: volumeMarkers.minimumSetsBench || "",
      benchmrv: volumeMarkers.maximumSetsBench || "",
      deadliftmev: volumeMarkers.minimumSetsDeadlift || "",
      deadliftmrv: volumeMarkers.maximumSetsDeadlift || "",

      trainingTitle: trainingTitle,

      trainingData: trainingData,
      previousTrainingData: previousTrainingData,

      training: training,
      trainingPhase: trainingPhase,

      date: date,

      number: index + 1
    });
  } catch (err) {
    console.log("Error ocurred while trying to display the training mode", err);
  }
}

function findMaxExerciseNumberSession(updatedData) {
  let exerciseCount = 0;
  for (let i = 1; i <= 12; i++) {
    const categoryNameKey = `exercise_${i}_category`;
    const category = updatedData[categoryNameKey];

    if (category) {
      exerciseCount++;
    } else {
      break;
    }
  }
  return exerciseCount;
}

function updateSessionExerciseDetails(updatedData, trainingSession, exercise, exerciseNumber) {
  const fieldPrefix = `exercise_${exerciseNumber + 1}_`;
  const categoryValue = updatedData[`${fieldPrefix}category`];

  if (categoryValue !== "- Bitte Auswählen -") {
    if (!exercise) {
      console.log("wir versuchen zu erstellen");
      exercise = {
        category: categoryValue || "",
        exercise: updatedData[`${fieldPrefix}exercise`] || "",
        sets: updatedData[`${fieldPrefix}sets`] || "",
        reps: updatedData[`${fieldPrefix}reps`] || "",
        weight: updatedData[`${fieldPrefix}weight`] || "",
        targetRPE: updatedData[`${fieldPrefix}targetRPE`] || "",
        actualRPE: updatedData[`${fieldPrefix}actualRPE`] || "",
        estMax: updatedData[`${fieldPrefix}estMax`] || "",
        notes: updatedData[`${fieldPrefix}notes`] || ""
      };
      trainingSession.exercises[exerciseNumber] = exercise;
    } else {
      // wenn einer der werte geändert wurde patche sie
      if (
        exercise.category != categoryValue ||
        exercise.exercise != updatedData[`${fieldPrefix}exercise`] ||
        exercise.sets != updatedData[`${fieldPrefix}sets`] ||
        exercise.reps != updatedData[`${fieldPrefix}reps`] ||
        exercise.weight != updatedData[`${fieldPrefix}weight`] ||
        exercise.targetRPE != updatedData[`${fieldPrefix}targetRPE`] ||
        exercise.actualRPE != updatedData[`${fieldPrefix}actualRPE`] ||
        exercise.estMax != updatedData[`${fieldPrefix}estMax`] ||
        exercise.notes != updatedData[`${fieldPrefix}notes`]
      ) {
        exercise.category = categoryValue;
        exercise.exercise = updatedData[`${fieldPrefix}exercise`];
        exercise.sets = updatedData[`${fieldPrefix}sets`];
        exercise.reps = updatedData[`${fieldPrefix}reps`];
        exercise.weight = updatedData[`${fieldPrefix}weight`];
        exercise.targetRPE = updatedData[`${fieldPrefix}targetRPE`];
        exercise.actualRPE = updatedData[`exercise_actualRPE_${exerciseNumber}`];
        exercise.estMax = updatedData[`exercise_max_${exerciseNumber}`];
        exercise.notes = updatedData[`exercise_notes_${exerciseNumber}`];
      }
    }
  } else {
    //wenn die category "- Bitte Auswählen -" ist und zuvor eine exercise existiert hat dann löschen
    console.log("wir versuchen zu  löschen");
    if (exercise) {
      const index = trainingSession.exercises.indexOf(exercise);
      if (index > -1) {
        trainingSession.exercises.splice(index, 1);
      }
    }
  }
}

export async function patchTrainingSession(req, res, index) {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    const trainingData = req.body;

    if (req.body.isSessionComplete && typeof req.body.isSessionComplete === "boolean") {
      //handleSessionComplete hier den spezialfall behandeln. das training in auf dasd trainings[1] setzen
      // zusätzlich im get zweig auf diese daten zugreifen und sie z.b. bei weight als placeholder verwenden
      const exerciseArray = [];
      const updatedExercisesPerDay = findMaxExerciseNumberSession(trainingData);

      for (let i = 1; i <= updatedExercisesPerDay; i++) {
        const fieldPrefix = `exercise_${i}_`;
        const category = trainingData[`${fieldPrefix}category`];

        if (category !== "- Bitte Auswählen -") {
          const exerciseObject = {
            category: category,
            exercise: trainingData[`${fieldPrefix}exercise`],
            sets: trainingData[`${fieldPrefix}sets`],
            reps: trainingData[`${fieldPrefix}reps`],
            weight: "",
            targetRPE: trainingData[`${fieldPrefix}targetRPE`],
            actualRPE: "",
            estMax: "",
            notes: ""
          };

          exerciseArray.push(exerciseObject);
        }
      }

      const trainingObj = {
        trainingDate: new Date(),
        exercises: exerciseArray
      };

      user.trainings[index].trainings.unshift(trainingObj); //hinzufügen zur trainings historie
      user.trainings[index].trainings.sort((a, b) => b.trainingDate - a.trainingDate); //neueste zuerst sortierung vornehmen

      if (user.trainings[index].trainings.length > 2) {
        user.trainings[index].trainings = user.trainings[index].trainings.slice(0, 2);
      }
    } else {
      //normaler patch

      handleSessionPatch(user, trainingData, index);
    }

    await user.save();
    res.status(200).json({});
  } catch (err) {
    console.log("Es ist ein Fehler beim Posten des Trainingsmodus vorgefallen! " + err);
  }
}

function handleSessionComplete() {}

function handleSessionPatch(user, trainingData, index) {
  const trainingSession = user.trainings[index].trainings[0]; // trainings speichert trainings die wieder vorangegangene trainings habenm wir betrachten immer das erste neuste

  const updatedExercisesPerDay = findMaxExerciseNumberSession(trainingData);

  let amountOfExercises; //wenn ein neue Übung hinzugefügt wurde dann "updatedExercisesPerDay" anonsten die "normale length" des arrays

  if (updatedExercisesPerDay > trainingSession?.exercises?.length || !trainingSession?.exercises?.length) {
    amountOfExercises = updatedExercisesPerDay;
  } else {
    amountOfExercises = trainingSession?.exercises?.length;
  }

  for (let i = amountOfExercises - 1; i >= 0; i--) {
    const exercise = trainingSession.exercises[i];
    updateSessionExerciseDetails(trainingData, trainingSession, exercise, i);
  }
}

/* GET TRAINING SESSION */
function extractTrainingExerciseData(trainingSession, index) {
  const exerciseData = [];

  if (trainingSession && trainingSession.trainings[index]) {
    const nthTrainingSession = trainingSession.trainings[index]; // Erster Trainingstag

    for (let i = 0; i < nthTrainingSession.exercises.length; i++) {
      const exercise = nthTrainingSession.exercises[i];

      if (exercise !== null) {
        exerciseData.push({
          category: exercise.category || "",
          exercise: exercise.exercise || "",
          sets: exercise.sets || "",
          reps: exercise.reps || "",
          weight: exercise.weight || "",
          targetRPE: exercise.targetRPE || "",
          actualRPE: exercise.actualRPE || "",
          estMax: exercise.estMax || "",
          notes: exercise.notes || ""
        });
      }
    }
  }

  return exerciseData;
}

function extractPreviousTrainingDates(trainingSession, index) {
  const dates = [];

  if (trainingSession && trainingSession.trainings[index]) {
    const nthTrainingSession = trainingSession.trainings[index];

    let trainingDate = nthTrainingSession.trainingDate;
    trainingDate = formatDateWithDay(trainingDate);

    dates.push(trainingDate);
  }

  return dates;
}

// format date functions
function formatDateWithDay(date) {
  const daysOfWeek = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Monate sind nullbasiert
  const year = String(date.getFullYear()).slice(-2); // Die letzten zwei Stellen des Jahres
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const dayOfWeek = daysOfWeek[date.getDay()]; // Wochentag als Text

  return `${dayOfWeek} ${day}.${month}.${year} ${hours}:${minutes}`;
}
