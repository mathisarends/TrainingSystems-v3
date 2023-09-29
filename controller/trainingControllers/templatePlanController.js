import User from "../../models/user.js";
import templateTrainingsGenerator from "../../models/templateTrainingGenerator.js";


import {
  getTrainingPlanInfo,
  getLastTrainingDayOfWeek,
  extractDataOfTrainingDay,
  categorizeExercises,
  updateVolumeMarkers,
  updateExerciseDetails,
} from "./sharedFunctionality.js";




export async function getTemplateTraining(req, res, templateType, templateName, weekIndex, templates) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).send("Benutzer nicht gefunden");
      }
      const trainingPlan = user.trainingPlanTemplate[templateType];
      const { trainingTitle, trainingFrequency, trainingPhase, amountOfTrainingDays } = getTrainingPlanInfo(trainingPlan);
      console.log(trainingTitle);
      const lastTrainingDay = getLastTrainingDayOfWeek(trainingPlan, weekIndex);
  
  
      const trainingWeekData = []; //this training week
      for (let j = 0; j < amountOfTrainingDays; j++) {
        trainingWeekData.push(extractDataOfTrainingDay(trainingPlan, weekIndex, j));
      }

      const previousTrainingWeekData = [];
      if (weekIndex >= 1) { // check bounds in order to prevent indexOutOfBounds
        for (let j = 0; j < amountOfTrainingDays; j++) {
          previousTrainingWeekData.push(extractDataOfTrainingDay(trainingPlan, weekIndex - 1, j));
        }
      }
  
      let firstTrainingWeekData = []; //fallback option firstTrainingWeek
      if (weekIndex !== 0) {
        for (let j = 0; j < amountOfTrainingDays; j++) {
          firstTrainingWeekData.push(extractDataOfTrainingDay(trainingPlan, 0, j));
        }
      }
  
  
      const { exerciseCategories, categoryPauseTimes, categorizedExercises, defaultRepSchemeByCategory } = categorizeExercises(user.exercises);
  
      const trainingData = user.trainingData.length > 0 ? user.trainingData[0] : {}; //volume recomandations
  
      //navigation to nextTrainingWeek and the week before
      const templateIndexes = templates
        .filter(t => (t.startsWith("A") && templateType === 0) || (t.startsWith("B") && templateType === 1))
        .map(t => parseInt(t.slice(1)));
  
      const templateIndex = templateIndexes.indexOf(weekIndex + 1);
  
      const beforeTemplateIndex = (templateIndex - 1 + templateIndexes.length) % templateIndexes.length;
      const afterTemplateIndex = (templateIndex + 1) % templateIndexes.length;
  
      const beforePage = `/training/template-${templateType === 0 ? "A" : "B"}${templateIndexes[beforeTemplateIndex]}`;
      const afterPage = `/training/template-${templateType === 0 ? "A" : "B"}${templateIndexes[afterTemplateIndex]}`;
  
      res.render("trainingPlans/template/trainingPlan", {
  
        userID: user.id,
        user: user,
  
        trainingWeekData: trainingWeekData,
        previousTrainingWeekData: previousTrainingWeekData,
        firstTrainingWeekData: firstTrainingWeekData.length > 0 ? firstTrainingWeekData : trainingWeekData,
  
        amountOfTrainingDays: amountOfTrainingDays,
        workoutName: trainingTitle,
        trainingFrequency: trainingFrequency,
        trainingPhase: trainingPhase,
  
        exerciseCategories: exerciseCategories,
        categorizedExercises: categorizedExercises,
        categoryPauseTimes: categoryPauseTimes,
        defaultRepSchemeByCategory: defaultRepSchemeByCategory,
  
        trainingData: trainingData,
        squatmev: trainingData.minimumSetsSquat || "",
        squatmrv: trainingData.maximumSetsSquat || "",
        benchmev: trainingData.minimumSetsBench || "",
        benchmrv: trainingData.maximumSetsBench || "",
        deadliftmev: trainingData.minimumSetsDeadlift || "",
        deadliftmrv: trainingData.maximumSetsDeadlift || "",
  
        beforePage: beforePage,
        afterPage: afterPage,
        week: weekIndex + 1,
  
        lastTrainingDay: lastTrainingDay,
  
        templatePlanName: templateName,
        workoutName: trainingTitle,
      });
  
    } catch (err) {
      console.log(`Fehler beim Aufrufen des Template Plan ${templateName}: ${err}`);
    }
  }

  export async function patchTemplateTraining(req, res, i, templateName) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).send("Benutzer nicht gefunden");
      }
  
      //hier gibt es schwierigkeitn
      const updatedData = req.body;
      const isTemplateA = templateName.startsWith("A");
      const templateIndex = isTemplateA ? 0 : 1; // 0 for A templates, 1 for B templates
     
      const trainingPlan = user.trainingPlanTemplate[templateIndex];
      trainingPlan.lastUpdated = new Date();
      const weekSuffix = parseInt(templateName.slice(1)); // Extract week suffix (1, 2, ...)
      const trainingWeek = trainingPlan.trainingWeeks[weekSuffix - 1]; // Adjust index
  
      updateVolumeMarkers(updatedData, trainingWeek);
  
      for (let i = 0; i < trainingWeek.trainingDays.length; i++) {
        const trainingDay = trainingWeek.trainingDays[i];
        
        for (let j = 0; j < trainingDay.exercises.length; j++) {
          const exercise = trainingDay.exercises[j];
          updateExerciseDetails(trainingDay, exercise, updatedData, i, j);
        }
      }
  
      //update Title and Training Phase
      const reqTrainingTitle = updatedData["workout_name"];
      if (reqTrainingTitle !== trainingPlan.title) {
        trainingPlan.title = reqTrainingTitle;
      }
      const reqTrainingPhase = updatedData["volumePhase"];
      if (reqTrainingPhase !== trainingPlan.trainingPhase) {
        trainingPlan.trainingPhase = reqTrainingPhase;
      }
    
      await user.save();
      res.status(200).json({});
    } catch (err) {
      console.log(`Error ocurred while patching the ressource (${templateName}): ${err}`);
      res.status(500).json({ error: `Error ocurred while patching the ressource  (${templateName}): ${err}` })
    }
  }

  export async function deleteTemplateTraining(req, res) {
    try {
      const user = await User.findById(req.user._id);
  
      if (!user) {
        return res.status(404).send("Benutzer nicht gefunden");
      }
      const resetIndex = req.body.resetIndex; //wird richtig übergeben
  
      if (parseInt(resetIndex) === 0) {
        user.trainingPlanTemplate[resetIndex] = templateTrainingsGenerator.createTemplatePlanA(req.user._id);
      } else if (parseInt(resetIndex) === 1) {
        user.trainingPlanTemplate[resetIndex] = templateTrainingsGenerator.createTemplatePlanB(req.user._id);
      }
  
      await user.save();
      res.status(200).json({});
  
    } catch (err) {
      console.log("A error occured while resetting the template training", err);
    }
  }

  