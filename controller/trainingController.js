import User from "../models/user.js";
import NewTrainingPlan from "../models/trainingPlanSchema.js";

export async function getTrainingIndexPage(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    renderTrainingPlansView(res, user);
  } catch (err) {
    console.log(err);
  }
}

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

    /* res.redirect("/training"); */
    res.status(200).json({});
  } catch (err) {
    console.log("Fehler beim löschen des Trainingsplans: " + err);
  }
}

export async function patchCustomTraining(req, res, week, i) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    const updatedData = req.body;
    const trainingPlan = user.trainingPlansCustomNew[i];

    trainingPlan.lastUpdated = new Date(); //save timestamp

    const trainingWeek = trainingPlan.trainingWeeks[week - 1];

    for (let i = 0; i < trainingWeek.trainingDays.length; i++) {
      const trainingDay = trainingWeek.trainingDays[i];
      updateTrainingDayNotes(trainingDay, updatedData, i);

      // 9 Exercise Felder damit in for loop
      for (let j = 0; j < 9; j++) {
        const exercise = trainingDay.exercises[j];
        updateExerciseDetails(trainingDay, exercise, updatedData, i, j);
      }
    }
    await user.save();
    console.log("Patch on trainingplan sucessful");
    res.status(200).json({});
  } catch (err) {
    console.log("Error while patching custom page", err);
    res.status(500).json({ error: `Errro while patching custom page ${err}` });
  }
}

/* UPDATING TRAINING PLANS */
function updateTrainingDayNotes(trainingDay, updatedData, index) {
  const notesFieldName = `workout_notes_${index + 1}`;
  trainingDay.trainingDayNotes =
    updatedData[notesFieldName] || trainingDay.trainingDayNotes;
}

function updateExerciseDetails(trainingDay, exercise, updatedData, i, j) {
  const fieldPrefix = `day${i + 1}_exercise${j + 1}_`;

  const categoryValue = updatedData[`${fieldPrefix}category`];
  const exerciseNameValue = updatedData[`${fieldPrefix}exercise_name`];

  if (
    categoryValue !== "- Bitte Auswählen -" &&
    exerciseNameValue !== "Placeholder"
  ) {
    if (!exercise) {
      //wenn es kein exerciseObject gibt dann erstellen wir eines
      exercise = {
        category: categoryValue || "",
        exercise: exerciseNameValue || "",
        sets: updatedData[`${fieldPrefix}sets`] || "",
        reps: updatedData[`${fieldPrefix}reps`] || "",
        weight: updatedData[`${fieldPrefix}weight`] || "",
        targetRPE: updatedData[`${fieldPrefix}targetRPE`] || "",
        actualRPE: updatedData[`${fieldPrefix}actualRPE`] || "",
        estMax: updatedData[`${fieldPrefix}estMax`] || "",
        notes: updatedData[`${fieldPrefix}workout_notes`] || "",
      };
      trainingDay.exercises.push(exercise);
    } else {
      exercise.category = categoryValue || exercise.category;
      exercise.exercise = exerciseNameValue || exercise.exercise;
      exercise.sets = updatedData[`${fieldPrefix}sets`] || exercise.sets;
      exercise.reps = updatedData[`${fieldPrefix}reps`] || exercise.reps;
      exercise.weight = updatedData[`${fieldPrefix}weight`] || exercise.weight;
      exercise.targetRPE =
        updatedData[`${fieldPrefix}targetRPE`] || exercise.targetRPE;
      exercise.actualRPE =
        updatedData[`${fieldPrefix}actualRPE`] || exercise.actualRPE;
      exercise.estMax = updatedData[`${fieldPrefix}estMax`] || exercise.estMax;
      exercise.notes =
        updatedData[`${fieldPrefix}workout_notes`] || exercise.notes;
    }
  } else {
    //wenn die Kategorie die placeholder kategorie ist: bedeutet alle werte die vorher da waren sollen resettet werden -> user entfernt die exercise quasi

    if (exercise) {
      //hier nur etwas machen wenn es eine exercise gibt bzw. gab
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

/* GET TRAINING PAGE (CUSTOM, TEMPLATE ) */
function getLastTrainingDayOfWeek(trainingPlan, weekIndex) {
  const trainingWeek = trainingPlan.trainingWeeks[weekIndex];

  for (let i = trainingWeek.trainingDays.length - 1; i >= 0; i--) {
    const trainingDay = trainingWeek.trainingDays[i];

    if (trainingDay.exercises?.some((exercise) => exercise.weight)) {
      return i + 1;
    }
  }

  return 1; //ansonsten ist es woche 1;
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

/* GET TRAINING IDNEX */
function renderTrainingPlansView(res, user, additionalData = {}) {
  const defaultData = {
    user,
    userID: user.id,
    errorCreatingNewCustomTrainingPlan: "",
    errorCreatingNewCustomTraining: "",
    lastVisitedTrainingMode: user.lastVisitedTrainingMode || "",
  };

  const {
    //retrieve all necessary data from user:
    trainingPlanTemplate,
    trainingPlansCustomNew,
    trainings,
  } = user;

  const trainingFormattedDates = getLastEditedTrainingDates(trainings);

  const formattedTrainingPlanDates = getLastEditedDatesOfType(
    trainingPlansCustomNew
  );

  const formattedTemplateTrainingPlanDates =
    getLastEditedDatesOfType(trainingPlanTemplate);

  const customCurrentTrainingWeek = getMostRecentTrainingWeeks(
    trainingPlansCustomNew
  );

  const templateCurrentTrainingWeek =
    getMostRecentTrainingWeeks(trainingPlanTemplate);

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
    templateCurrentTrainingWeek,
  };

  res.render("trainingPlans/index", mergedData);
}

function getLastEditedTrainingDates(trainings) {
  const trainingFormattedDates = [];
  for (let i = 0; i < trainings.length; i++) {
    trainingFormattedDates.push(formatDate(trainings[i].lastUpdated));
  }

  return trainingFormattedDates;
}

function getLastEditedDatesOfType(trainingPlans) {
  const trainingDates = [];

  for (let i = 0; i < trainingPlans.length; i++) {
    trainingDates.push(formatDateWithDay(trainingPlans[i].lastUpdated));
  }

  return trainingDates;
}

// for redirecting to the most recent trainingDay
function getMostRecentTrainingWeeks(trainingPlans) {
  const mostRecentTrainingWeeks = [];

  for (const trainingPlan of trainingPlans) {
    const result = getIndexOfMostRecentTrainingDay(trainingPlan);
    const week = parseInt(result.weekIndex + 1);
    mostRecentTrainingWeeks.push(week);
  }
  return mostRecentTrainingWeeks;
}

function getIndexOfMostRecentTrainingDay(trainingPlan) {
  if (!trainingPlan || !trainingPlan.trainingWeeks) {
    return {
      weekIndex: undefined,
      dayIndex: undefined,
    };
  }

  const lastWeekIndex = trainingPlan.trainingWeeks.length - 1;

  for (
    let weekIndex = trainingPlan.trainingWeeks.length - 1;
    weekIndex >= 0;
    weekIndex--
  ) {
    const week = trainingPlan.trainingWeeks[weekIndex];
    const lastDayIndex = week.trainingDays.length - 1;

    for (let dayIndex = lastDayIndex; dayIndex >= 0; dayIndex--) {
      const day = week.trainingDays[dayIndex];

      if (day.exercises?.some((exercise) => exercise.weight)) {
        if (dayIndex === lastDayIndex && weekIndex === lastWeekIndex) {
          return {
            weekIndex: 0,
            dayIndex: 0,
          };
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

function formatDate(date) {
  const options = {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };

  const formattedDate = date.toLocaleDateString("de-DE", options);

  // Manuell den Wochentag hinzufügen
  const weekdays = [
    "Sonntag",
    "Montag",
    "Dienstag",
    "Mittwoch",
    "Donnerstag",
    "Freitag",
    "Samstag",
  ];
  const weekday = weekdays[date.getDay()];

  return `${weekday}, den ${formattedDate.replace(",", "")}`;
}
