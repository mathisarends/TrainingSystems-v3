import User from "../../models/user.js";

import {
    getTrainingPlanInfo,
    categorizeExercises,
    isWeekDeloadWeek,
    extractDataOfTrainingDay,
    findBestSetInCategory, //for stats --
    getIndexOfMostRecentTrainingDay
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
    
        const trainingWeekData = [];

        for (let i = 0; i < amountOfTrainingDays; i++) {
            trainingWeekData.push(extractDataOfTrainingDay(trainingPlan, weekNumber - 1, i));
        }
    
        const {
          exerciseCategories,
          categoryPauseTimes,
          categorizedExercises,
          defaultRepSchemeByCategory,
          maxFactors,
        } = categorizeExercises(user.exercises);
    
        const trainingData =
        user.trainingData.length > 0 ? user.trainingData[0] : {};



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

export async function viewArchivedPlanStats(req, res) {
  try {
    const user = await User.findById(req.user._id); // Assuming you're using user authentication.
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const planId = req.params.planId;
    const trainingPlan = user.archivedPlans.id(planId);

    if (!trainingPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const { trainingTitle } = getTrainingPlanInfo(trainingPlan);

    const squatSetsDone = [];
    const squatTonnage = [];
    const benchSetsDone = [];
    const benchTonnage = [];
    const deadliftSetsDone = [];
    const deadliftTonnage = [];

    trainingPlan.trainingWeeks.forEach((trainingWeek) => {
      squatSetsDone.push(trainingWeek.squatSetsDone);
      squatTonnage.push(trainingWeek.squatTonnage);
      benchSetsDone.push(trainingWeek.benchSetsDone);
      benchTonnage.push(trainingWeek.benchTonnage);
      deadliftSetsDone.push(trainingWeek.deadliftSetsDone);
      deadliftTonnage.push(trainingWeek.deadliftTonnage);
    });

    const bestSquatSets = [];
    const bestBenchSets = [];
    const bestDeadliftSets = [];

    trainingPlan.trainingWeeks.forEach((trainingWeek) => {
      const bestSquatSetInWeek = findBestSetInCategory(
        trainingWeek,
        "Squat",
        user.exercises
      );
      const bestBenchSetInWeek = findBestSetInCategory(
        trainingWeek,
        "Bench",
        user.exercises
      );
      const bestDeadliftSetInWeek = findBestSetInCategory(
        trainingWeek,
        "Deadlift",
        user.exercises
      );

      if (bestSquatSetInWeek) {
        bestSquatSets.push(bestSquatSetInWeek);
      }

      if (bestBenchSetInWeek) {
        bestBenchSets.push(bestBenchSetInWeek);
      }

      if (bestDeadliftSetInWeek) {
        bestDeadliftSets.push(bestDeadliftSetInWeek);
      }
    });

    const { weekIndex: lastWeekIndex } =
    getIndexOfMostRecentTrainingDay(trainingPlan);

    res.render("trainingPlans/archive/archiveStats", {
      trainingTitle,
      userID: req.user._id,

      squatSetsDone,
      squatTonnage,
      benchSetsDone,
      benchTonnage,
      deadliftSetsDone,
      deadliftTonnage,

      bestSquatSets,
      bestBenchSets,
      bestDeadliftSets,

      lastWeekIndex,
    });



  } catch (error) {
    console.log("Es ist ein Fehler beim aufrufen der ArchiveStats Page aufgetreten", error);
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
