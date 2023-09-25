import express from "express";
const router = express.Router();

import User from "../models/user.js";
import NewTrainingPlan from "../models/trainingPlanSchema.js";
import TrainingSchema from "../models/trainingSchema.js";

import templateTrainingsGenerator from "../models/templateTrainingGenerator.js";

import { checkAuthenticated } from "../authMiddleware.js";

const templates = ["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4"]; //template ULR-Endings
const customTemplateLetters = ["A", "B", "C", "D"]; //customURL-Endings
const maxWeeks = 6; 

import { 
  getTrainingIndexPage, 
  getCreateTrainingPlan, 
  postCreateTrainingPlan, 
  handleDeleteTrainingPlan, 
  patchCustomTraining, 
  getCustomTraining, 
  getCustomEditPage,
  patchCustomEditPage,
  getTemplateTraining,
  patchTemplateTraining,
  deleteTemplateTraining,
  getCreateTraining,  
  postCreateTraining,
  handleDeleteSession,
  getSessionEdit,
  patchSessionEdit,
  getTrainingSession,
  patchTrainingSession
} from "../controller/trainingController.js";

//regular custom training plans (standart)
router.get("/", checkAuthenticated, getTrainingIndexPage);

/* CUSTOM TRAINING PLANS */
router.get("/create-training-plan", checkAuthenticated, getCreateTrainingPlan);
router.post("/create-training-plan", checkAuthenticated, postCreateTrainingPlan);
router.delete("/delete-training-plan", checkAuthenticated, handleDeleteTrainingPlan)

for (let i = 0; i < customTemplateLetters.length; i++) { // get custom trainings
  const letter = customTemplateLetters[i];
  for (let week = 1; week <= maxWeeks; week++) {
    const routePath = `/custom-${letter}${week}`;
    router.get(routePath, checkAuthenticated, (req, res) => getCustomTraining(req, res, i, letter, week));
  }
}

for (let i = 0; i < customTemplateLetters.length; i++) { //patch custom trainings
  const letter = customTemplateLetters[i];
  for (let week = 1; week <= maxWeeks; week++) {
    const routePath = `/custom-${letter}${week}`;
    router.patch(routePath, checkAuthenticated, (req, res) => patchCustomTraining(req, res, week, i));
  }
}

for (let i = 0; i < customTemplateLetters.length; i++) { //get custom edit pages
  const letter = customTemplateLetters[i];
  const routePath = `/custom-${letter}-edit`;
  router.get(routePath, checkAuthenticated, (req, res) => getCustomEditPage(req, res, i, letter));
}

for (let i = 0; i < customTemplateLetters.length; i++) { //patch custom edit pages
  const letter = customTemplateLetters[i];
    const routePath = `/custom-${letter}-edit`;
    router.patch(routePath, checkAuthenticated, (req, res) => patchCustomEditPage(req, res, i));
}

/* TEMPLATE PLANS */
for (let i = 0; i < templates.length; i++) {
  const templateName = templates[i]; 
  const templateType = templateName.startsWith("A") ? 0 : 1; // 0 for A templates, 1 for B templates
  const weekIndex = parseInt(templateName.slice(1) - 1);
  router.get(`/template-${templateName}`, checkAuthenticated, (req, res) => getTemplateTraining(req, res, templateType, templateName, weekIndex, templates));
}

for (let i = 0; i < templates.length; i++) {
  const templateName = templates[i];
  router.patch(`/template-${templateName}`, checkAuthenticated, (req, res) => patchTemplateTraining(req, res, i, templateName));
}

router.delete("/reset-template-training", checkAuthenticated, deleteTemplateTraining);


// TRAINING SINGLE
for (let i = 1; i <= 3; i++) { // 5 Training Slots GET
  router.get(`/session-edit-${i}`, checkAuthenticated, (req, res) => getSessionEdit(req, res, i - 1));
}

for (let i = 1; i <= 3; i++) { // 5 Training Slots POST
  router.patch(`/session-edit-${i}`, checkAuthenticated, (req, res) => patchSessionEdit(req, res, i - 1));
}


// Todo hier gibt es probleme, da die Übungskategorie und die übung selbst nicht angezeigt wird: TODO:
for (let i = 1; i <= 3; i++) {
  router.get(`/session-train-${i}`, checkAuthenticated, (req, res) => getTrainingSession(req, res, i - 1));
}

for (let i = 1; i <= 3; i++) {
  router.patch(`/session-train-${i}`, checkAuthenticated, (req, res) => patchTrainingSession(req, res, i - 1)); 
}


function getLastEditedTrainingDates(trainings) {
  const trainingFormattedDates = [];
  for (let i = 0; i < trainings.length; i++) {
    trainingFormattedDates.push(formatDate(trainings[i].lastUpdated));
  }


  return trainingFormattedDates;
}

//ein bisschen weiter oben habe ich erstmal ausgelassen TODO: refactor

router.get("/createTraining", checkAuthenticated, getCreateTraining);
router.post("/createTraining", checkAuthenticated, postCreateTraining);
router.delete("/delete-training", checkAuthenticated, handleDeleteSession);

export default router;

//for retrieving the user exercise Data. Almost every GET uses this method
function categorizeExercises(exercises) {
  const exerciseCategories = [...new Set(exercises.map((exercise) => exercise.category.name))];

    const categoryPauseTimes = {};
    
    exercises.forEach((exercise) => {
        const categoryName = exercise.category.name;
        const pauseTime = exercise.category.pauseTime;
        if (!categoryPauseTimes[categoryName]) {
            categoryPauseTimes[categoryName] = pauseTime;
        }
    });

    const defaultRepSchemeByCategory = {};
    exercises.forEach((exercise) => {
      const categoryName = exercise.category.name;
      const defaultSets = exercise.category.defaultSets;
      const defaultReps = exercise.category.defaultReps;
      const defaultRPE = exercise.category.defaultRPE;

      if (!defaultRepSchemeByCategory[categoryName]) {
        defaultRepSchemeByCategory[categoryName] = {
          defaultSets: defaultSets,
          defaultReps: defaultReps,
          defaultRPE: defaultRPE,
        }
      }
    })
    
    const categorizedExercises = exercises.reduce((acc, exercise) => {
        const categoryName = exercise.category.name;
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(exercise.name);
        return acc;
    }, {});
    
    return {
        exerciseCategories,
        categoryPauseTimes,
        categorizedExercises,
        defaultRepSchemeByCategory,
    };
}

function updateTrainingExerciseDetails(training, updatedData, exercise, index) {

  const exerciseValue = updatedData[`exercise_name_${index}`];
  const setsValue = updatedData[`exercise_sets_${index}`];
  const repsValue = updatedData[`exercise_reps_${index}`];
  const weightValue = updatedData[`exercise_weight_${index}`];
  const rpeValue = updatedData[`exercise_actualRPE_${index}`];
  const estMaxValue = updatedData[`exercise_max_${index}`];

  if (!exercise) { //neue Exercise erstellen
    exercise = {
      exercise: exerciseValue  || "",
      sets: setsValue || "",
      reps: repsValue || "",
      weight: weightValue || "",
      rpe: rpeValue || "",
      estMax: estMaxValue || "",
    }
    training.exercises.push(exercise);
  } else { 
    exercise.exercise = exerciseValue || exercise.exercise;
    exercise.sets = setsValue || exercise.sets;
    exercise.reps = repsValue || exercise.reps;
    exercise.weight = weightValue || exercise.weight;
    exercise.rpe = rpeValue || exercise.rpe;
    exercise.estMax = estMaxValue || exercise.estMax;
    console.log(exercise.rpe)
  }

}


function updateTrainingDayNotes(trainingDay, updatedData, index) {
  const notesFieldName = `workout_notes_${index + 1}`;
  trainingDay.trainingDayNotes = updatedData[notesFieldName] || trainingDay.trainingDayNotes;
}

function updateExerciseDetails(trainingDay, exercise, updatedData, i, j) {
  const fieldPrefix = `day${i + 1}_exercise${j + 1}_`;

  const categoryValue = updatedData[`${fieldPrefix}category`];
  const exerciseNameValue = updatedData[`${fieldPrefix}exercise_name`];

  if (categoryValue !== "- Bitte Auswählen -" && exerciseNameValue !== "Placeholder") {
    if (!exercise) { //wenn es kein exerciseObject gibt dann erstellen wir eines
      exercise = {
        category: categoryValue || '',
        exercise: exerciseNameValue || '',
        sets: updatedData[`${fieldPrefix}sets`] || '',
        reps: updatedData[`${fieldPrefix}reps`] || '',
        weight: updatedData[`${fieldPrefix}weight`] || '',
        targetRPE: updatedData[`${fieldPrefix}targetRPE`] || '',
        actualRPE: updatedData[`${fieldPrefix}actualRPE`] || '',
        estMax: updatedData[`${fieldPrefix}estMax`] || '',
        notes: updatedData[`${fieldPrefix}workout_notes`] || '',
      };
      trainingDay.exercises.push(exercise);
    } else {
      exercise.category = categoryValue || exercise.category;
      exercise.exercise = exerciseNameValue || exercise.exercise;
      exercise.sets = updatedData[`${fieldPrefix}sets`] || exercise.sets;
      exercise.reps = updatedData[`${fieldPrefix}reps`] || exercise.reps;
      exercise.weight = updatedData[`${fieldPrefix}weight`] || exercise.weight;
      exercise.targetRPE = updatedData[`${fieldPrefix}targetRPE`] || exercise.targetRPE;
      exercise.actualRPE = updatedData[`${fieldPrefix}actualRPE`] || exercise.actualRPE;
      exercise.estMax = updatedData[`${fieldPrefix}estMax`] || exercise.estMax;
      exercise.notes = updatedData[`${fieldPrefix}workout_notes`] || exercise.notes;
    }
  } else { //wenn die Kategorie die placeholder kategorie ist: bedeutet alle werte die vorher da waren sollen resettet werden -> user entfernt die exercise quasi



    if (exercise) { //hier nur etwas machen wenn es eine exercise gibt bzw. gab
      exercise.category = categoryValue;
      exercise.exercise = exerciseNameValue;
      exercise.sets = "";
      exercise.reps = "";
      exercise.weight = "";
      exercise.targetRPE = "";
      exercise.actualRPE = "";
      exercise.estMax = "";
      exercise.notes = "";
    }


  }
}


function getTrainingPlanInfo(trainingPlan) {
  const trainingTitle = trainingPlan.title;
  const trainingFrequency = trainingPlan.trainingFrequency;
  const trainingPhase = trainingPlan.trainingPhase;
  const amountOfTrainingDays = trainingPlan.trainingWeeks[0].trainingDays.length;
  
  return {
    trainingTitle,
    trainingFrequency,
    trainingPhase,
    amountOfTrainingDays
  };
}

function getAmountOfTrainingWeeks(trainingPlan) {
  const trainingWeeks = trainingPlan.trainingWeeks.length;
  return trainingWeeks;
}


function extractDataOfTrainingDay(trainingPlan, week, day) {

  // if input is valid
  if (trainingPlan && trainingPlan.trainingWeeks[week] && trainingPlan.trainingWeeks[week].trainingDays[day]) {
    
    const exercises = [];
    const trainingWeek = trainingPlan.trainingWeeks[week];
    const trainingDay = trainingWeek.trainingDays[day];
    const trainingDayNotes = trainingDay.trainingDayNotes;

    for (let i = 0; i < trainingDay.exercises.length; i++) {
      const exercise = trainingDay.exercises[i];

      if (exercise) {
        exercises.push({
          category: exercise.category || "",
          exercise: exercise.exercise || "",
          sets: exercise.sets || "",
          reps: exercise.reps || "",
          weight: exercise.weight || "",
          targetRPE: exercise.targetRPE || "",
          actualRPE: exercise.actualRPE || "",
          estMax: exercise.estMax || "",
          notes: exercise.notes || "",
        })
      }
    }
  const data = {
    exercises: exercises,
    trainingDayNotes: trainingDayNotes,
  }

  return data;

  }
}

function formatDateWithDay(date) {
  const daysOfWeek = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Monate sind nullbasiert
  const year = String(date.getFullYear()).slice(-2); // Die letzten zwei Stellen des Jahres
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const dayOfWeek = daysOfWeek[date.getDay()]; // Wochentag als Text

  return `${dayOfWeek} ${day}.${month}.${year} ${hours}:${minutes}`;

}

function formatDate(date) {
  const options = {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  };

  const formattedDate = date.toLocaleDateString('de-DE', options);

  // Manuell den Wochentag hinzufügen
  const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const weekday = weekdays[date.getDay()];

  return `${weekday}, den ${formattedDate.replace(',', '')}`;
}


//render INDEX PAGE
function renderTrainingPlansView(res, user, additionalData = {}) {
  const defaultData = {
    user,
    userID: user.id,
    errorCreatingNewCustomTrainingPlan: "",
    errorCreatingNewCustomTraining: "",
    lastVisitedTrainingMode: user.lastVisitedTrainingMode || "",
  };

  const { //retrieve all necessary data from user:
    trainingPlanTemplate,
    trainingPlansCustomNew,
    trainings,
  } = user;

  const trainingFormattedDates = getLastEditedTrainingDates(trainings);

  const formattedTrainingPlanDates = getLastEditedDatesOfType(
    trainingPlansCustomNew
  );

  const formattedTemplateTrainingPlanDates = getLastEditedDatesOfType(
    trainingPlanTemplate
  );

  const customCurrentTrainingWeek = getMostRecentTrainingWeeks(trainingPlansCustomNew);

  const templateCurrentTrainingWeek = getMostRecentTrainingWeeks(trainingPlanTemplate);

  const mergedData = {
    ...defaultData,
    ...additionalData,
    userTemplateTrainings: trainingPlanTemplate,
    userCustomTrainings: trainingPlansCustomNew,
    userTrainings: trainings,

    trainingFormattedDates,
    formattedTrainingPlanDates: formattedTrainingPlanDates || "",
    formattedTemplateTrainingPlanDates,

    customCurrentTrainingWeek,
    templateCurrentTrainingWeek
  };

  res.render("trainingPlans/index", mergedData);
}

// for redirecting directly to the next page
function getMostRecentTrainingWeeks(trainingPlans) {
  const mostRecentTrainingWeeks = [];

  for (const trainingPlan of trainingPlans) {
    const result = getIndexOfMostRecentTrainingDay(trainingPlan);
    const week = parseInt(result.weekIndex + 1);
    mostRecentTrainingWeeks.push(week);
  }
  return mostRecentTrainingWeeks;
}


//INDEX PAGE TRAININGPLAN PREVIEW
function getExerciseOfNextTrainingDayPerPlan(trainingPlans) {
  const exercises = [];

  for (const trainingPlan of trainingPlans) {
    const { weekIndex, dayIndex } = getIndexOfMostRecentTrainingDay(trainingPlan);

    if (weekIndex !== undefined && dayIndex !== undefined) {
      const lastTrainingDay = trainingPlan.trainingWeeks[weekIndex]?.trainingDays[dayIndex];
      
      if (lastTrainingDay?.exercises) {
        const onExerciseObject = lastTrainingDay.exercises
          .filter(exercise => {
            // Überprüfen, ob die Kategorie eine der gewünschten Kategorien ist
            return ["Squat", "Bench", "Deadlift"].includes(exercise.category);
          })
          .map(exercise => ({
            exercise: exercise.exercise,
            sets: exercise.sets,
            reps: exercise.reps,
            targetRPE: exercise.targetRPE,
          }));
          exercises.push(onExerciseObject);
      }
    }
  }

  return exercises;
}

function getIndexOfMostRecentTrainingDay(trainingPlan) {
  if (!trainingPlan || !trainingPlan.trainingWeeks) {
    return {
      weekIndex: undefined,
      dayIndex: undefined,
    };
  }

  const lastWeekIndex = trainingPlan.trainingWeeks.length -1;

  for (let weekIndex = trainingPlan.trainingWeeks.length - 1; weekIndex >= 0; weekIndex--) {
    const week = trainingPlan.trainingWeeks[weekIndex];
    const lastDayIndex = week.trainingDays.length - 1;
    
    for (let dayIndex = lastDayIndex; dayIndex >= 0; dayIndex--) {
      const day = week.trainingDays[dayIndex];
      
      if (day.exercises?.some(exercise => exercise.weight)) {
        
        if (dayIndex === lastDayIndex && weekIndex === lastWeekIndex) {
          return {
            weekIndex: 0,
            dayIndex: 0,
          }
        } else if (dayIndex === lastDayIndex) {
          // Wenn es sich um den letzten Tag der Woche handelt, erhöhen Sie weekIndex
          return {
            weekIndex: weekIndex + 1,
            dayIndex: 0,
          };
        } else {
          // Andernfalls erhöhen Sie den dayIndex
          return {
            weekIndex: weekIndex,
            dayIndex: dayIndex + 1,
          };
        }
      }
    }
  }

  return {
    weekIndex: 0,
    dayIndex: 0,
  };
}

function getLastEditedDatesOfType(trainingPlans) {
  
  const trainingDates = [];

  for (let i = 0; i < trainingPlans.length; i++) {
    trainingDates.push(formatDateWithDay(trainingPlans[i].lastUpdated));
  }

  return trainingDates;
}

//erstellt einen neuen Trainingsplan mit Platzhaltern für die gegebene Anzahl an Tagen und Wochen
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
    trainingWeeks.push({trainingDays});
  }

  return trainingWeeks;
}
