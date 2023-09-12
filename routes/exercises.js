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
    const user = await User.findById(req.user._id);

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
    const user = await User.findById(req.user._id);

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

    //Arrays mit allen metaDaten der jeweiligen Kategorien
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
    console.log("gespeichert")
    res.status(200).json({});

  } catch (err) {
    console.log("Es ist ein Fehler beim Posten der Exercises aufgetreten. " + err);
  }
});

Router.patch("/", checkAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    const exerciseData = req.body;
    const maxAmountOfExercises = parseInt(req.body.maxExercises);
    const exerciseCategoriesLength = parseInt(
      req.body.exerciseCategoriesLength
    );

    const exerciseCategoryPauseTimes = [];
    const exerciseCategorySets = [];
    const exerciseCategoryReps = [];
    const exerciseCategoryRPE = [];

    //Arrays mit allen metaDaten der jeweiligen Kategorien
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

    const numberOfRequestedExercises = getNumberOfRequestedExercises(exerciseCategoriesLength, maxAmountOfExercises, exerciseData);
    if (numberOfRequestedExercises === user.exercises.length) { //Die Anzahl der übungen sind gleich deswegen reichen partielle Änderungen:

      let effectiveLoops = 0;
      for (let i = 0; i < exerciseCategoriesLength; i++) {
        for (let k = 0; k < maxAmountOfExercises; k++) {
          if (exerciseData[`exercise_${i}_${k}`]) {
  
            if (exerciseData[`exercise_${i}_${k}`] != user.exercises[effectiveLoops].name) {
              user.exercises[effectiveLoops].name = exerciseData[`exercise_${i}_${k}`];
            }
            if (exerciseCategoryPauseTimes[i] != user.exercises[effectiveLoops].category.pauseTime) {
              user.exercises[effectiveLoops].category.pauseTime = exerciseCategoryPauseTimes[i];
            } // übergebene pause time adners als bestehende
            if (exerciseCategorySets[i] != user.exercises[effectiveLoops].category.defaultSets) {
              user.exercises[effectiveLoops].category.defaultSets = exerciseCategorySets[i];
            }
            if (exerciseCategoryReps[i] != user.exercises[effectiveLoops].category.defaultReps) {
              user.exercises[effectiveLoops].category.defaultReps = exerciseCategoryReps[i];
            }
            if (exerciseCategoryRPE[i] != user.exercises[effectiveLoops].category.defaultRPE) {
              user.exercises[effectiveLoops].category.defaultRPE = exerciseCategoryRPE[i];
            }
  
            effectiveLoops++;
          } 
        }
      }
    } else { // es gibt mindestens eine neue Exercise und deswegen poste ich die einfach komplett nicht optimal aber...
            // sonst wären sehr viele verschiebeoperationen möglich wieviel performanter das dann wirklich noch ist? 
      const exercises = [];

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
    }

    await user.save();

    res.status(200).json({});

  } catch (err) {
    console.log("Es ist ein Fehler beim Patchen der Exercises aufgetreten." + err);
  }
});

function getNumberOfRequestedExercises(exerciseCategoriesLength, maxAmountOfExercises, exerciseData) {

  let count = 0;

  for (let i = 0; i < exerciseCategoriesLength; i++) {
    for (let k = 0; k < maxAmountOfExercises; k++) {
      if (exerciseData[`exercise_${i}_${k}`]) {
        count++;
      }
    }
  }

  return count;
}


function createUserExerciseObject(exerciseName, index, exerciseCategoryPauseTimes, exerciseCategorySets, exerciseCategoryReps, exerciseCategoryRPE) {
      
    const object = {
      name: exerciseName,
      category: {
        name: getAssociatedCategoryByIndex(index), 
        pauseTime: exerciseCategoryPauseTimes[index],
        defaultSets: exerciseCategorySets[index],
        defaultReps: exerciseCategoryReps[index],
        defaultRPE: exerciseCategoryRPE[index]
      } 
    }
  
    return object;
  }

  function getAssociatedCategoryByIndex(index) {
    let category = "";
    
    if (index === 0) {
      category = "- Bitte Auswählen -";
    } else if (index === 1) {
      category = "Squat";
    } else if (index === 2) {
      category = "Bench";
    } else if (index === 3) {
      category = "Deadlift";
    } else if (index === 4) {
      category = "Overheadpress";
    } else if (index === 5) {
      category = "Chest";
    } else if (index === 6) {
      category = "Back";
    } else if (index === 7) {
      category = "Shoulder";
    } else if (index === 8) {
      category = "Triceps";
    } else if (index === 9) {
      category = "Biceps";
    } else if (index === 10) {
      category = "Legs";
    } else {
      console.log("ES IST EIN FEHLER AUFGETRETEN:")
    }
    return category;
  }




Router.post("/reset", checkAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
    
        if (!user) {
          return res.status(404).send("Benutzer nicht gefunden");
        }
    
        user.exercises = standartExerciseCatalog;
    
        await user.save();
        console.log("Exercises zurückgesetzt!");
        res.status(200).json({});
    
      } catch (err) {
        console.log("Es ist ein Fehler beim zurücksetzen der Exercises aufgetreten: " + err);
        res.status(500).json({});
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
