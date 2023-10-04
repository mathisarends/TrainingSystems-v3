import User from "../../models/user.js";
import NewTrainingPlan from "../../models/trainingPlanSchema.js";


import {
  getTrainingPlanInfo,
  getLastTrainingDayOfWeek,
  extractDataOfTrainingDay,
  categorizeExercises,
  updateVolumeMarkers,
  updateExerciseDetails,
  renderTrainingPlansView,
} from "./sharedFunctionality.js";

/* CUSTOM TRAININGS */
export async function getCreateTrainingPlan(req, res) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).send("Benutzer nicht gefunden");
      }
  
      if (user.trainingPlansCustomNew.length >= 3) {
        renderTrainingPlansView(res, user, {
          errorCreatingNewCustomTrainingPlan:
            "Maximale Anzahl an Plänen erreicht.",
        });
      } else {
        res.render("trainingPlans/custom/createNewCustomTraining", {
          layout: false,
        });
      }
    } catch (err) {
      console.log("Fehler beim Erstellen des Trainingsplans " + err);
    }
  }

  export async function postCreateTrainingPlan(req, res) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).send("Benutzer nicht gefunden");
      }
  
      const trainingPlanData = req.body;
      const trainingPlanName = trainingPlanData.training_title;
      const trainingPlanPhase = trainingPlanData.training_phase;
      const trainingPlanFrequency = trainingPlanData.training_frequency;
      const trainingPlanWeeks = trainingPlanData.training_weeks;
      const exercisesPerDay = trainingPlanData.exercisesPerTraining;
      const lastWeekDeload = trainingPlanData.isLastWeekDeload;
  
      const lastUpdated = new Date();
  
      const trainingWeeks = createNewTrainingPlanWithPlaceholders(
        trainingPlanWeeks,
        trainingPlanFrequency
      );
  
      const newTrainingPlan = new NewTrainingPlan({
        user: req.user._id,
        title: trainingPlanName,
        trainingFrequency: trainingPlanFrequency,
        trainingPhase: trainingPlanPhase,
        lastUpdated: lastUpdated,
        lastWeekDeload: lastWeekDeload,
        exercisesPerDay: exercisesPerDay,
        trainingWeeks: trainingWeeks,
      });
  
      user.trainingPlansCustomNew.push(newTrainingPlan);
      user.trainingPlansCustomNew.sort((a, b) => b.lastUpdated - a.lastUpdated); // sorts by date descending
  
      await user.save();
  
      res.redirect("/training/custom-A1");
    } catch (err) {
      console.log(
        "Es ist ein Fehler beim erstellen des Trainingsplans vorgefallen! " + err
      );
    }
  }

  export async function handleDeleteTrainingPlan(req, res) {
    const indexToDelete = req.body.deleteIndex;
  
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).send("Benutzer nicht gefunden");
      }
  
      user.trainingPlansCustomNew.splice(indexToDelete, 1);
      await user.save();
  
      res.status(200).json({});
    } catch (err) {
      console.log("Fehler beim löschen des Trainingsplans: " + err);
    }
  }

  // get training page
  export async function getCustomTraining(req, res, i, letter, week) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).send("Benutzer nicht gefunden");
      }
  
      const trainingPlan = user.trainingPlansCustomNew[i];
  
      if(!trainingPlan) { //Routes will hopefully will never be reached
        return res.status(404).send("Training nicht gefunden!");
      }
  
      if (week > trainingPlan.trainingWeeks.length) {
        return res.status(404).send("Ungültige Woche");
      }

      let isDeloadWeek = false;
      if (week === trainingPlan.trainingWeeks.length) {
        if (trainingPlan.lastWeekDeload === undefined || !trainingPlan.lastWeekDeload) {
          isDeloadWeek = false;
        } else {
          isDeloadWeek = true;
        }
      }
  
      const { trainingTitle, trainingFrequency, trainingPhase, amountOfTrainingDays, amountOfExercises } = getTrainingPlanInfo(trainingPlan);
  
      // redirect directly to the page
      const lastTrainingDay = getLastTrainingDayOfWeek(trainingPlan, week - 1);
  
      /* the most recent data is displayed then the data from last week and as a fallback the data from the first week*/ /* week starts with 1 so - 1 everytime */
      const trainingWeekData = [];
      const currentTrainingWeekFatique = [];
      for (let j = 0; j < amountOfTrainingDays; j++) {
        trainingWeekData.push(extractDataOfTrainingDay(trainingPlan, week - 1, j));
        currentTrainingWeekFatique.push(extractFatiqueLevelOfTrainingDay(trainingPlan, week - 1, j));
      }

      const previousTrainingWeekData = [];
      if (week >= 2) { // check bounds in order to prevent indexOutOfBounds
        for (let j = 0; j < amountOfTrainingDays; j++) {
          previousTrainingWeekData.push(extractDataOfTrainingDay(trainingPlan, week - 2, j));
        }
      }
  
      const firstTrainingWeekData = [];
      for (let j = 0; j < amountOfTrainingDays; j++) {
        firstTrainingWeekData.push(extractDataOfTrainingDay(trainingPlan, 0, j));
      }
  
      const { exerciseCategories, categoryPauseTimes, categorizedExercises, defaultRepSchemeByCategory, maxFactors } = categorizeExercises(user.exercises);
  
      const trainingData = user.trainingData.length > 0 ? user.trainingData[0] : {};
  
      let afterPageIndex = (week + 1) % trainingPlan.trainingWeeks.length;
      afterPageIndex = afterPageIndex === 0 ? trainingPlan.trainingWeeks.length : afterPageIndex;
  
      let beforePageIndex = (week - 1) % trainingPlan.trainingWeeks.length;
      beforePageIndex = beforePageIndex === 0 ? trainingPlan.trainingWeeks.length : beforePageIndex;
  
      const beforePage = `/training/custom-${letter}${beforePageIndex}`;
      const afterPage = `/training/custom-${letter}${afterPageIndex}`;
  
      res.render("trainingPlans/custom/trainingPlan", {
  
        userID: user.id,
        user: user,

        trainingWeek: trainingPlan.trainingWeeks[week - 1], //new generate amount of table colums automatically
  
        trainingWeekData: trainingWeekData,
        previousTrainingWeekData: previousTrainingWeekData,
        firstTrainingWeekData: firstTrainingWeekData,
        currentTrainingWeekFatique: currentTrainingWeekFatique || [], //current training week

        isDeloadWeek: isDeloadWeek,
        amountOfExercises: amountOfExercises,
  
        amountOfTrainingDays: amountOfTrainingDays,
        workoutName: trainingTitle,
        trainingFrequency: trainingFrequency,
        trainingPhase: trainingPhase,
  
        exerciseCategories: exerciseCategories,
        categorizedExercises: categorizedExercises,
        categoryPauseTimes: categoryPauseTimes,
        defaultRepSchemeByCategory: defaultRepSchemeByCategory,
        maxFactors: maxFactors,
  
        trainingData: trainingData,
        squatmev: trainingData.minimumSetsSquat || "",
        squatmrv: trainingData.maximumSetsSquat || "",
        benchmev: trainingData.minimumSetsBench || "",
        benchmrv: trainingData.maximumSetsBench || "",
        deadliftmev: trainingData.minimumSetsDeadlift || "",
        deadliftmrv: trainingData.maximumSetsDeadlift || "",
  
        beforePage: beforePage,
        afterPage: afterPage,
        week: week,
  
        lastTrainingDay: lastTrainingDay,
  
        templatePlanName: `${letter}${week}`,
      });
    } catch (err) {
      console.log("Fehler beim Aufrufen der Trainingsseite: " + err);
    }
  }

  //patch training
  export async function patchCustomTraining(req, res, week, i) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).send("Benutzer nicht gefunden");
      }
  
      const updatedData = req.body;
      const trainingPlan = user.trainingPlansCustomNew[i];
      const exericsesPerTrainingDay = trainingPlan.exercisesPerDay || 9; //lass ich noch für meinen alten plan drinne: TODO: langfristig das fallback entfernen
  
      trainingPlan.lastUpdated = new Date(); //save timestamp
  
      const trainingWeek = trainingPlan.trainingWeeks[week - 1];
      
      updateVolumeMarkers(updatedData, trainingWeek);
  
      for (let i = 0; i < trainingWeek.trainingDays.length; i++) {
        const trainingDay = trainingWeek.trainingDays[i];
        updateFatiqueLevels(trainingWeek, i, updatedData);
  
        // 9 Exercise Felder damit in for loop
        for (let j = 0; j < exericsesPerTrainingDay; j++) {
          const exercise = trainingDay.exercises[j];
          updateExerciseDetails(trainingDay, exercise, updatedData, i, j);
        }
      }
  
      await user.save();
      console.log("Trainingsplan Änderungen gespeichert!");
      res.status(200).json({});
    } catch (err) {
      console.log("Error while patching custom page", err);
      res.status(500).json({ error: `Errro while patching custom page ${err}` });
    }
  }

  // get edit page (custom)
  export async function getCustomEditPage(req, res, i, letter) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).send("Benutzer nicht gefunden");
      }
  
      const trainingPlan = user.trainingPlansCustomNew[i];
  
      if (!trainingPlan) {
        return res.status(404).send("Training nicht gefunden!");
      }
  
      const { trainingTitle, trainingFrequency, trainingPhase, amountOfTrainingDays, lastWeekDeload } = getTrainingPlanInfo(trainingPlan);
  
      const blockLength = getAmountOfTrainingWeeks(trainingPlan);
  
      // JUMP TODO: hier das gerenderte Tempalte ändern
      res.render("trainingPlans/custom/trainingPlanEdit", {
        userID: user.id,
        layout: false,
        amountOfTrainingDays: amountOfTrainingDays,
        workoutName: trainingTitle,
        trainingFrequency: trainingFrequency,
        trainingPhase: trainingPhase,
        lastWeekDeload: lastWeekDeload,
        blockLength: blockLength,
        templatePlanName: `custom-${letter}`, //for posting to the right path
      });
    } catch (err) {
      console.log("Error while trying to access the edit training page", err);
    }
  }

  //patch edit page (custom)
  export async function patchCustomEditPage(req, res, i) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).send("Benutzer nicht gefunden");
      }
  
      const trainingPlan = user.trainingPlansCustomNew[i];
  
      if(!trainingPlan) { //Routes will hopefully will never be reached
        return res.status(404).send("Training nicht gefunden!");
      }
  
      //Neue übergebene Daten
      const newTitle = req.body.training_title;
      const newTrainingFrequency = req.body.training_frequency;
      const newTrainingPhase = req.body.training_phase;
      const isLastWeekDeload = req.body.isLastWeekDeload;
  
      // wenn es änderungen gibt dann aktualiseren
      if (trainingPlan.title !== newTitle) {
        trainingPlan.title = newTitle;
      }
      if (trainingPlan.trainingPhase !== newTrainingPhase) {
        trainingPlan.trainingPhase = newTrainingPhase;
      }
      if (trainingPlan.trainingFrequency !== newTrainingFrequency) {
        trainingPlan.trainingFrequency = newTrainingFrequency;
      }

      if (trainingPlan.lastWeekDeload !== isLastWeekDeload) {
        trainingPlan.lastWeekDeload = isLastWeekDeload;
      }
  
      console.log("patched training metadata")
      await user.save();
  
  
      res.status(200).json({});
  
      
    } catch (err) {
      console.log("Error while patching meta data of customTraining", err);
    }
  }

  /* CREATING NEW CUSTOM TRAINING */
function createNewTrainingPlanWithPlaceholders(weeks, daysPerWeek) {
    const trainingWeeks = [];
  
    for (let weekIndex = 0; weekIndex < weeks; weekIndex++) {
      const trainingDays = [];
      for (let dayIndex = 0; dayIndex < daysPerWeek; dayIndex++) {
        const trainingDay = {
          exercises: [],
          trainingNotes: "",
        };
        trainingDays.push(trainingDay);
      }
      trainingWeeks.push({ trainingDays });
    }
  
    return trainingWeeks;
  }


  /* GET EDIT PAGE CUSTOM */
function getAmountOfTrainingWeeks(trainingPlan) {
    const trainingWeeks = trainingPlan.trainingWeeks.length;
    return trainingWeeks;
  }

  function extractFatiqueLevelOfTrainingDay(trainingPlan, weekIndex, dayIndex) {
    const trainingWeek = trainingPlan.trainingWeeks[weekIndex];
    const trainingDay = trainingWeek.trainingDays[dayIndex];
    return trainingDay.fatiqueLevel;
  }

  function updateFatiqueLevels(trainingWeek, dayIndex, updatedData) {

    const trainingDay = trainingWeek.trainingDays[dayIndex];

    if (trainingDay.fatiqueLevel !== updatedData[`day${dayIndex + 1}_fatiqueLevel`]) {
      trainingDay.fatiqueLevel = updatedData[`day${dayIndex + 1}_fatiqueLevel`];
    }
  }
  
