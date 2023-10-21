import User from "../../models/user.js";
import NewTrainingPlan from "../../models/trainingPlanSchema.js";


import {
  getTrainingPlanInfo,
  renderTrainingPlansView,
  removeTrainingWeeks,
  addNewTrainingWeeks,
  getAmountOfTrainingWeeks
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
      const lastWeekDeload = trainingPlanData.isLastWeekDeload;
      const weightPlaceholders = trainingPlanData.weightPlaceholders;
      const lastWeekDeloadHandled = false;
  
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
        lastWeekDeloadHandled: lastWeekDeloadHandled,
        trainingWeeks: trainingWeeks,
        weightPlaceholders: weightPlaceholders,
      });

      console.log(weightPlaceholders);
      console.log(newTrainingPlan.weightPlaceholders);
  
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
  
      const { trainingTitle, trainingFrequency, trainingPhase, amountOfTrainingDays, lastWeekDeload, weightPlaceholders } = getTrainingPlanInfo(trainingPlan);

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
        weightPlaceholders: weightPlaceholders,
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
      const newBlockLength = req.body.block_length;
      const weightPlaceholders = req.body.weightPlaceholders;
  
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

      if (trainingPlan.weightPlaceholders !== weightPlaceholders) {
        trainingPlan.weightPlaceholders = weightPlaceholders;
      }

      const currentBlockLength = trainingPlan.trainingWeeks.length
      if (currentBlockLength !== newBlockLength) {
        if (newBlockLength > currentBlockLength) {
          const weekDifference = newBlockLength - currentBlockLength; //get the difference how many sets shall be added
          addNewTrainingWeeks(trainingPlan.trainingWeeks, trainingPlan.trainingFrequency, weekDifference);

        } else if (newBlockLength < currentBlockLength) {
          const weekDifference = currentBlockLength - newBlockLength;
          removeTrainingWeeks(trainingPlan.trainingWeeks, weekDifference);
        }
      }
  
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
        };
        trainingDays.push(trainingDay);
      }
      trainingWeeks.push({ trainingDays });
    }
  
    return trainingWeeks;
  }

  
