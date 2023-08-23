const express = require("express");
const Router = express.Router();

const User = require("../models/user");
const standartExerciseCatalog = require("../models/standartExerciseCatalog");

const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../authMiddleware");

Router.get("/", checkAuthenticated, async (req, res) => {
  try {
    const user = await User.findOne({ name: req.user.name });

    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    const exercisesData = prepareExercisesData(user);

    res.render("exercises/userExercises", exercisesData);
  } catch (err) {
    console.log("Ein Fehler beim Laden der Exercise-Seite ist aufgetreten. " + err);
  }
});

Router.post("/", checkAuthenticated, async (req, res) => {
  try {
    const user = await User.findOne({ name: req.user.name });

    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    const exerciseData = req.body;
    const maxAmountOfExercises = parseInt(req.body.maxExercises);
    const exerciseCategoriesLength = parseInt(
      req.body.exerciseCategoriesLength
    );
    const exercises = [];

    const exerciseCategoryPauseTimes = [];
    const exerciseCategorySets = [];
    const exerciseCategoryReps = [];
    const exerciseCategoryRPE = [];

    for (let i = 0; i < exerciseCategoriesLength; i++) {
      exerciseCategoryPauseTimes.push(
        exerciseData[`categoryPauseTimeSelect_${i}`],
      );
      exerciseCategorySets.push(
        exerciseData[`categoryDefaultSetSelect_${i}`],
      );
      exerciseCategoryReps.push(
        exerciseData[`categoryDefaultRepSelect_${i}`],
      );
      exerciseCategoryRPE.push(
        exerciseData[`categoryDefaultRPESelect_${i}`],
      )
    }

    for (let i = 0; i < exerciseCategoriesLength; i++) {
      for (let k = 0; k < maxAmountOfExercises; k++) {
        if (exerciseData[`exercise_${i}_${k}`]) {
          exercises.push(
            createUserExerciseObject(
              exerciseData[`exercise_${i}_${k}`],
              i,
              exerciseCategoryPauseTimes,
              exerciseCategorySets,
              exerciseCategoryReps,
              exerciseCategoryRPE,
            )
          );
        } else {
          continue;
        }
      }
    }

    user.exercises = exercises;
    await user.save();
    const referer = req.headers.referer || "/";
    res.redirect(referer);

  } catch (err) {
    console.log("Es ist ein Fehler beim Posten der Exercises aufgetreten.");
  }
});

Router.post("/reset", checkAuthenticated, async (req, res) => {
    try {
        const user = await User.findOne({ name: req.user.name });
    
        if (!user) {
          return res.status(404).send("Benutzer nicht gefunden");
        }
    
        user.exercises = standartExerciseCatalog;
    
        await user.save();
        res.redirect("/exercises");
    
      } catch (err) {
        console.log("Es ist ein Fehler beim zurücksetzen der Exercises aufgetreten: " + err);
      }
})

module.exports = Router;

function prepareExercisesData(user) {
  const predefinedExercises = user.exercises;

  const exerciseCategories = [
    ...new Set(predefinedExercises.map((exercise) => exercise.category.name)),
  ];

  const categoryPauseTimes = {};
  predefinedExercises.forEach((exercise) => {
    const categoryName = exercise.category.name;
    const pauseTime = exercise.category.pauseTime;
    if (!categoryPauseTimes[categoryName]) {
      categoryPauseTimes[categoryName] = pauseTime;
    }
  });

  const defaultRepSchemeByCategory = {};
  predefinedExercises.forEach((exercise) => {
    const categoryName = exercise.category.name;
    const defaultSets = exercise.category.defaultSets;
    const defaultReps = exercise.category.defaultReps;
    const defaultRPE = exercise.category.defaultRPE;

    if (!defaultRepSchemeByCategory[categoryName]) {
      defaultRepSchemeByCategory[categoryName] = {
        defaultSets: defaultSets,
        defaultReps: defaultReps,
        defaultRPE: defaultRPE,
      };
    }
  });

  const categorizedExercises = predefinedExercises.reduce((acc, exercise) => {
    const categoryName = exercise.category.name;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(exercise.name);
    return acc;
  }, {});

  return {
    exerciseCategories: exerciseCategories,
    categoryPauseTimes: categoryPauseTimes,
    categorizedExercises: categorizedExercises,
    defaultRepSchemeByCategory: defaultRepSchemeByCategory,
    error: "",
  };
}

function createUserExerciseObject(exerciseName, index, exerciseCategoryPauseTimes, exerciseCategorySets, exerciseCategoryReps, exerciseCategoryRPE) {
  
    let associatedCategory;
  
    if (index === 0) {
      associatedCategory = "- Bitte Auswählen -";
    } else if (index === 1) {
      associatedCategory = "Squat";
    } else if (index === 2) {
      associatedCategory = "Bench";
    } else if (index === 3) {
      associatedCategory = "Deadlift";
    } else if (index === 4) {
      associatedCategory = "Overheadpress";
    } else if (index === 5) {
      associatedCategory = "Chest";
    } else if (index === 6) {
      associatedCategory = "Back";
    } else if (index === 7) {
      associatedCategory = "Shoulder";
    } else if (index === 8) {
      associatedCategory = "Triceps";
    } else if (index === 9) {
      associatedCategory = "Biceps";
    } else if (index === 10) {
      associatedCategory = "Core";
    } else if (index === 11) {
      associatedCategory = "Legs";
    } else {
      console.log("Fehler im for-loop-index");
      return;
    }
    
    const object = {
      name: exerciseName,
      category: {
        name: associatedCategory,  //todo hier pauseTime einfügen JUMP:
        pauseTime: exerciseCategoryPauseTimes[index],
        defaultSets: exerciseCategorySets[index],
        defaultReps: exerciseCategoryReps[index],
        defaultRPE: exerciseCategoryRPE[index]
      } 
    }
  
    return object;
  }
