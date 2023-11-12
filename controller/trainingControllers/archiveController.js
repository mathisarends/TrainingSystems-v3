import User from "../../models/user.js";

import {
    getTrainingPlanInfo,
    categorizeExercises,
    isWeekDeloadWeek,
    extractDataOfTrainingDay
  } from "./sharedFunctionality.js";

export async function viewArchivedPlan(req, res) {
    try {
        const planId = req.params.planId;
        const weekId = req.params.weekId;
        const user = await User.findById(req.user._id); // Assuming you're using user authentication.
    
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
    
        const trainingPlan = user.archivedPlans.id(planId);
    
        if (!trainingPlan) {
          return res.status(404).json({ message: "Plan not found" });
        }
    
        const week = trainingPlan.trainingWeeks.id(weekId);
    
        if (!week) {
          return req.status(404).json({ message: "Week not found" });
        }
    
        const {
          trainingTitle,
          trainingFrequency,
          trainingPhase,
          amountOfTrainingDays,
          amountOfExercises,
        } = getTrainingPlanInfo(trainingPlan);

        const weekNumber = getWeekNumberById(trainingPlan, weekId);
        console.log(weekNumber);
    
        const trainingWeekData = [];
        console.log(amountOfTrainingDays)

        for (let i = 0; i < amountOfTrainingDays; i++) {
            trainingWeekData.push(extractDataOfTrainingDay(trainingPlan, weekNumber - 1, i));
        }

        console.log(trainingWeekData[0].exercises);
    
        const {
          exerciseCategories,
          categoryPauseTimes,
          categorizedExercises,
          defaultRepSchemeByCategory,
          maxFactors,
        } = categorizeExercises(user.exercises);
    
        const trainingData =
        user.trainingData.length > 0 ? user.trainingData[0] : {};


        // implement this logi here !!!!
        const beforePage = ""; 
        const afterPage = "";

        const isDeloadWeek = isWeekDeloadWeek(trainingPlan, weekNumber);

        res.render("trainingPlans/archive/archivePlanView", {
            userID: user.id,
            user: user,
      
            trainingWeek: week,
            previousTrainingWeek: {},
            firstTrainingWeek: trainingPlan.trainingWeeks[0],
      
            trainingWeekData: trainingWeekData,
            previousTrainingWeekData: {},
            firstTrainingWeekData: {},
            currentTrainingWeekFatique: [], //current training week
      
            //
            isDeloadWeek: isDeloadWeek,
            weightPlaceholders: trainingPlan.weightPlaceholders,
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
            week: weekNumber,
      
            lastTrainingDay: 1,
          });
    
        /* const plan = user.archivedPlans.id(planId); */
    
      } catch (error) {
        console.log("Es ist ein Fehler beim Aufrufen der Archivseite aufgetreten", error);
        res.status(500).json({ message: "Internal server error" });
      }
}

function getWeekNumberById(trainingPlan, weekId) {
    for (let index = 0; index < trainingPlan.trainingWeeks.length; index++) {
        if (trainingPlan.trainingWeeks[index]._id == weekId) {
            return index + 1;
        }
    }
    return null;
}
