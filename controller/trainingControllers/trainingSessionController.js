import User from "../../models/user.js";
import TrainingSchema from "../../models/trainingSchema.js";

import {
    renderTrainingPlansView,
    categorizeExercises
} from "./sharedFunctionality.js";

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
        res.render("trainingPlans/scratch/createTraining", {layout: false});
      }
  
  
  
    } catch (err) {
      console.log("Es ist ein Fehler beim Aufrufen der Create-Training Page enstanden. " + err);
    }
  }

  export async function postCreateTraining(req, res) {
    try {
      const user = await User.findById(req.user._id);
  
      if(!user) {
        return res.status(404).send("Benutzer nicht gefunden");
      }
  
      const trainingTitle = req.body.training_title;
      const trainingPhase = req.body.training_phase;
      const date = new Date();
      const userID = req.user._id;
  
  
      const exercises = [];
  
      // weil auf der page maximal 9 übungen erlaubt sind
      for (let i = 1; i <= 9; i++) {
        const exerciseObject = {
          category: "",
          exercise: "",
          sets: null,
          reps: null,
          weight: null,
          targetRPE: null,
          actualRPE: null,
          estMax: null,
          notes: "",
        }
        exercises.push(exerciseObject);
      }
  
  
      const trainingObject = { //create object which we can save in trainings-array
        trainingDate: date,
        exercises: exercises,
      }
  
      const newTrainingPlan = new TrainingSchema({
        user: userID,
        title: trainingTitle,
        lastUpdated: date,
        trainingPhase: trainingPhase,
        trainings: trainingObject,
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
        layout: false,
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
      res.status(200).json({});
  
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
      const previousTrainingData = [];
      for (let i = 0; i < training.trainings.length; i++) {
        previousTrainingData.push(extractTrainingExerciseData(training, i));
      }
  
      // retrieve information then previous trainings were mad
      const previousTrainingDates = [];
      for (let i = 0; i < training.trainings.length; i++) {
        previousTrainingDates.push(extractPreviousTrainingDates(training, i));
      }
  
      //JUMP
      const { exerciseCategories, categoryPauseTimes, categorizedExercises, defaultRepSchemeByCategory } = categorizeExercises(user.exercises);
  
      const volumeMarkers = user.trainingData.length > 0 ? user.trainingData[0] : {}; //volume recomandations
  
      const date = formatDateWithDay(training.lastUpdated); //newst date from newest training
  
      res.render("trainingPlans/scratch/trainAgain", {
  
        userID: user.id,
  
        exerciseCategories,
        categoryPauseTimes,
        categorizedExercises,
        defaultRepSchemeByCategory,
  
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
        previousTrainingDates: previousTrainingDates,
  
        training: training,
        trainingPhase: trainingPhase,
  
        date: date,
  
        number: index + 1,
          });
  
    } catch(err) {
      console.log("Error ocurred while trying to display the training mode", err);
    }
  }

  export async function patchTrainingSession(req, res, index) {
    try {
      const user = await User.findById(req.user._id);
  
      if (!user) {
        return res.status(404).send("Benutzer nicht gefunden");
      }
  
      const trainingData = req.body;
  
      const exerciseArray = [];
  
      for (let i = 1; i <= 9; i++) {
        const exerciseObject = {
          category: trainingData[`exercise_category_${i}`],
          exercise: trainingData[`exercise_name_${i}`],
          sets: trainingData[`exercise_sets_${i}`],
          reps: trainingData[`exercise_reps_${i}`],
          weight: trainingData[`exercise_weight_${i}`],
          targetRPE: trainingData[`exercise_targetRPE_${i}`],
          actualRPE: trainingData[`exercise_actualRPE_${i}`],
          rpe: trainingData[`exercise_actualRPE_${i}`],
          estMax: trainingData[`exercise_max_${i}`],
        }
  
        exerciseArray.push(exerciseObject);
      }
  
      const trainingObject = {
        trainingDate: new Date(),
        trainingNote: trainingData.notes_regarding_workout,
        exercises: exerciseArray
      }
  
      // Hinzufügen des neuen Training-Objekts zum trainings-Array
      user.trainings[index].trainings.unshift(trainingObject);
  
      // Sortieren des trainings-Arrays nach dem trainingDate in absteigender Reihenfolge (neuestes zuerst)
      user.trainings[index].trainings.sort((a, b) => b.trainingDate - a.trainingDate);
  
      // TODO: das hier kann eigentlich auch nicht sein:
    if (user.trainings[index].trainings.length > 3) {
      user.trainings[index].trainings = user.trainings[index].trainings.slice(0, 3);
    }
  
      // Speichern des aktualisierten Benutzers
      await user.save();
  
      res.status(200).json({});
  
    } catch(err) {
      console.log("Es ist ein Fehler beim Posten des Trainingsmodus vorgefallen! " + err);
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
            notes: exercise.notes || "",
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
    const daysOfWeek = [
      "Sonntag",
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "Freitag",
      "Samstag",
    ];
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Monate sind nullbasiert
    const year = String(date.getFullYear()).slice(-2); // Die letzten zwei Stellen des Jahres
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const dayOfWeek = daysOfWeek[date.getDay()]; // Wochentag als Text
  
    return `${dayOfWeek} ${day}.${month}.${year} ${hours}:${minutes}`;
  }