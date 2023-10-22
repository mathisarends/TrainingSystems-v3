import User from "../../models/user.js";

/* FOR RETRIEVING CUSTOM TRAINING PLAN */
export function getTrainingPlanInfo(trainingPlan) {
  const trainingTitle = trainingPlan.title;
  const trainingFrequency = trainingPlan.trainingFrequency;
  const trainingPhase = trainingPlan.trainingPhase;
  const amountOfTrainingDays =
    trainingPlan.trainingWeeks[0].trainingDays.length;
  const amountOfExercises = trainingPlan.exercisesPerDay;
  const lastWeekDeload = trainingPlan.lastWeekDeload;
  const weightPlaceholders = trainingPlan.weightPlaceholders;

  return {
    trainingTitle,
    trainingFrequency,
    trainingPhase,
    amountOfTrainingDays,
    amountOfExercises,
    lastWeekDeload,
    weightPlaceholders
  };
}

/* GET TRAINING PAGE (CUSTOM, TEMPLATE ) */
export function getLastTrainingDayOfWeek(trainingPlan, weekIndex) {
  const trainingWeek = trainingPlan.trainingWeeks[weekIndex];

  for (let i = trainingWeek.trainingDays.length - 1; i >= 0; i--) {
    const trainingDay = trainingWeek.trainingDays[i];

    if (trainingDay.exercises?.some((exercise) => exercise.weight)) {
      return i + 1;
    }
  }

  return 1; //ansonsten ist es woche 1;
}

export function extractDataOfTrainingDay(trainingPlan, week, day) {
  // validate input
  if (
    trainingPlan &&
    trainingPlan.trainingWeeks[week] &&
    trainingPlan.trainingWeeks[week].trainingDays[day]
  ) {
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
        });
      }
    }
    const data = {
      exercises: exercises,
      trainingDayNotes: trainingDayNotes,
    };

    return data;
  }
}

export function categorizeExercises(exercises) {
  const exerciseCategories = [
    ...new Set(exercises.map((exercise) => exercise.category.name)),
  ];

  const categoryPauseTimes = {};
  const maxFactors = {};

  exercises.forEach((exercise) => {
    const categoryName = exercise.category.name;
    const pauseTime = exercise.category.pauseTime;
    if (!categoryPauseTimes[categoryName]) {
      categoryPauseTimes[categoryName] = pauseTime;
    }
    maxFactors[exercise.name] = exercise.maxFactor;
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
      };
    }
  });

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
    maxFactors,
  };
}

// updates volume markers if there are changed - for patching training pages
export function updateVolumeMarkers(updatedData, trainingWeek) {
  if (trainingWeek.squatSetsDone != updatedData[`squat_sets_done`]) {
    trainingWeek.squatSetsDone = updatedData[`squat_sets_done`];
  }
  if (trainingWeek.squatTonnage != updatedData[`squat_tonnage`]) {
    trainingWeek.squatTonnage = updatedData[`squat_tonnage`];
  }
  if (trainingWeek.benchSetsDone != updatedData[`bench_sets_done`]) {
    trainingWeek.benchSetsDone = updatedData[`bench_sets_done`];
  }
  if (trainingWeek.benchTonnage != updatedData[`bench_tonnage`]) {
    trainingWeek.benchTonnage = updatedData[`bench_tonnage`];
  }
  if (trainingWeek.deadliftSetsDone != updatedData[`deadlift_sets_done`]) {
    trainingWeek.deadliftSetsDone = updatedData[`deadlift_sets_done`];
  }
  if (trainingWeek.deadliftTonnage != updatedData[`deadlift_tonnage`]) {
    trainingWeek.deadliftTonnage = updatedData[`deadlift_tonnage`];
  }
}

//last parameter for deleting i = dayIndex, j = exerciseIndex
export function updateExerciseDetails(
  trainingDay,
  exercise,
  updatedData,
  i,
  j,
  trainingDayExercises
) {
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
      trainingDay.exercises[j] = exercise;
    } else {
      //update existing data if changed

      if (
        exercise.category != categoryValue ||
        exercise.exercise !== exerciseNameValue ||
        exercise.sets != updatedData[`${fieldPrefix}sets`] ||
        exercise.reps != updatedData[`${fieldPrefix}reps`] ||
        exercise.weight != updatedData[`${fieldPrefix}weight`] ||
        exercise.targetRPE != updatedData[`${fieldPrefix}targetRPE`] ||
        exercise.actualRPE != updatedData[`${fieldPrefix}actualRPE`] ||
        exercise.estMax != updatedData[`${fieldPrefix}estMax`] ||
        exercise.notes != updatedData[`${fieldPrefix}workout_notes`]
      ) {
        exercise.category = categoryValue || exercise.category;
        exercise.exercise = exerciseNameValue || exercise.exercise;
        exercise.sets = updatedData[`${fieldPrefix}sets`] || exercise.sets;
        exercise.reps = updatedData[`${fieldPrefix}reps`] || exercise.reps;
        exercise.weight =
          updatedData[`${fieldPrefix}weight`] || exercise.weight;
        exercise.targetRPE =
          updatedData[`${fieldPrefix}targetRPE`] || exercise.targetRPE;
        exercise.actualRPE =
          updatedData[`${fieldPrefix}actualRPE`] || exercise.actualRPE;
        exercise.estMax =
          updatedData[`${fieldPrefix}estMax`] || exercise.estMax;
        exercise.notes =
          updatedData[`${fieldPrefix}workout_notes`] || exercise.notes;
      }
    }
  } else {
    //neue category ist placeholder - delete
    if (exercise) {
      const index = trainingDayExercises.indexOf(exercise);
      if (index > -1) {
        // Das exercise-Objekt im Array entfernen
        trainingDayExercises.splice(index, 1);
      }
    }
  }
}

/* regards rendering training plan view with or without additional data */
// used to display max amount of trainingplans etc.
export function renderTrainingPlansView(res, user, additionalData = {}) {
  const defaultData = {
    user,
    userID: user.id,
    errorCreatingNewCustomTrainingPlan: "",
    errorCreatingNewCustomTraining: "",
  };

  const {
    //retrieve all necessary data from user:
    trainingPlanTemplate,
    trainingPlansCustomNew,
    trainings,
    archivedPlans,
  } = user;

  const trainingFormattedDates = getLastEditedTrainingDates(trainings);

  const formattedTrainingPlanDates = getLastEditedDatesOfType(
    trainingPlansCustomNew
  );

  const formattedTemplateTrainingPlanDates =
    getLastEditedDatesOfType(trainingPlanTemplate);

  const formattedArchiveTrainingPlanDates =
    getLastEditedDatesOfType(archivedPlans);

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
    archivedPlans,

    trainingFormattedDates,
    formattedTrainingPlanDates: formattedTrainingPlanDates || "",
    formattedArchiveTrainingPlanDates,
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

      if (day.exercises?.some((exercise) => exercise && exercise.weight)) {
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

export async function getStatisticPage(req, res, index) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }
    const userID = req.user._id;

    const trainingPlan = user.trainingPlansCustomNew[index];

    if (!trainingPlan) {
      return res.status(404).send("Training nicht gefunden!");
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

    //get best squat/bench/deadlift sets
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

    res.render("trainingPlans/statsPage", {
      trainingTitle,
      userID,

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
    console.log("Fehler beim aufrufen der statistic page:");
  }
}

function findBestSetInCategory(week, category, userExercises) {
  // get all the relevant exercise in order to get access to maxFactors
  const usersCategoryExercises = userExercises.filter(
    (exercise) => exercise.category.name === category
  );

  const maxFactors = {}; // create an maxFactor Object that allow acces to maxFactors by exercise name
  usersCategoryExercises.forEach((exercise) => {
    maxFactors[exercise.name] = exercise.maxFactor;
  });

  let bestSet = null;
  let bestDayIndex = -1;

  week.trainingDays.forEach((trainingDay, dayIndex) => {
    const categorySets = trainingDay.exercises.filter(
      (exercise) => exercise.category === category && exercise.estMax !== null
    );

    if (categorySets.length > 0) {
      categorySets.forEach((categorySet) => {
        const adjustedMax =
          categorySet.estMax / maxFactors[categorySet.exercise];
        if (!bestSet || adjustedMax > bestSet.estMax) {
          bestSet = categorySet;
          bestDayIndex = dayIndex;
        }
      });
    }
  });

  if (bestSet) {
    bestSet.dayIndex = bestDayIndex;
  }

  return bestSet || {}; // Falls kein passendes Set gefunden wurde, wird ein leeres Objekt zurückgegeben
}

export function removeTrainingWeeks(
  trainingWeeks,
  numberOfRemovedTrainingWeeks
) {
  for (let i = 0; i < numberOfRemovedTrainingWeeks; i++) {
    trainingWeeks.pop();
  }
}

export function addNewTrainingWeeks(
  trainingWeeks,
  daysPerWeek,
  trainingWeeksToAdd
) {
  const emptyTrainingDay = {
    exercises: [],
  };

  for (let j = 0; j < trainingWeeksToAdd; j++) {
    const trainingDays = [];
    for (let i = 0; i < daysPerWeek; i++) {
      trainingDays.push(emptyTrainingDay);
    }
    trainingWeeks.push({ trainingDays });
  }
}

export function getAmountOfTrainingWeeks(trainingPlan) {
  const trainingWeeks = trainingPlan.trainingWeeks.length;
  return trainingWeeks;
}

export async function handleArchiveProcess(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    const data = req.body;
    const index = parseInt(data.archiveIndex);
    const typeOfPlan = data.trainingPlanType;

    const trainingPlan = getTrainingPlanForArchive(user, typeOfPlan, index);
    trainingPlan.lastUpdated = new Date();
    trainingPlan.typeOfPlan = typeOfPlan;

    console.log(trainingPlan);

    //delete the plan from the right array 
    const usersTrainingPlansOfType = typeOfPlan === "custom" ? user.trainingPlansCustomNew : user.trainingPlanTemplate;
    if (usersTrainingPlansOfType.length > index) {
      usersTrainingPlansOfType.splice(index, 1);
    } else {
      return res.status(400).json({ error: "Ungültiger Index"});
    }
    
    user.archivedPlans.unshift(trainingPlan);
    await user.save();
    res.status(200).json({});

  } catch (err) {
    console.log("Fehler beim archivieren des Plans", err);
    res.status(500).json({error: "Es ist ein Fehler beim archivieren aufgetreten"});
  }
}

export async function handleArchiveDelete(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    const data = req.body;
    const deleteIndex = data.deleteIndex;

    const userArchivedPlans = user.archivedPlans;

    if (userArchivedPlans.length > deleteIndex) {
      userArchivedPlans.splice(deleteIndex, 1)
    } else {
      res.status(400).json({ error: "Ungültiger Index" });
    }

    await user.save();
    res.status(200).json({});

  } catch (error) {
    console.log("Es ist ein Fehler beim löschen des Trainingplans aus dem Archiv aufgetreten!", error);
    res.status(500).json({error: "Es ist ein Fehler beim löschen eines archivierten Plans aufgetreten"});
  }
}

function getTrainingPlanForArchive(user, typeOfPlan, index) {
  if (typeOfPlan === "custom") {
    return user.trainingPlansCustomNew[index];
  } else if (typeOfPlan === "template") {
    return user.trainingPlanTemplate[index];
  } else {
    return null;
  }
}

export async function getTrainingPlan(req, res, index, letter, week, typeOfPlan) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    const trainingPlan = getTypeOfPlan(user, typeOfPlan, index);
    const weightPlaceholders = trainingPlan.weightPlaceholders;

    if(!trainingPlan) { //Routes will hopefully will never be reached
      return res.status(404).send("Training nicht gefunden!");
    }

    if (week > trainingPlan.trainingWeeks.length) {
      return res.status(404).send("Ungültige Woche");
    }

    const isDeloadWeek = isWeekDeloadWeek(trainingPlan, week);
    const { trainingTitle, trainingFrequency, trainingPhase, amountOfTrainingDays, amountOfExercises } = getTrainingPlanInfo(trainingPlan);
    const lastTrainingDay = getLastTrainingDayOfWeek(trainingPlan, week - 1); //in order to always directly navigate to the correct training day:

    //the most recent data is displayed then the data from last week and as a fallback the data from the first week - offset by one because of index
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

    const beforePage = `/training/${typeOfPlan}-${letter}${beforePageIndex}`;
    const afterPage = `/training/${typeOfPlan}-${letter}${afterPageIndex}`;

    const previousTrainingWeek = (week >= 2) ? trainingPlan.trainingWeeks[week - 2] : {};


    res.render("trainingPlans/custom/trainingPlan", {

      userID: user.id,
      user: user,

      trainingWeek: trainingPlan.trainingWeeks[week - 1], //new generate amount of table colums automatically
      previousTrainingWeek: previousTrainingWeek,
      firstTrainingWeek: trainingPlan.trainingWeeks[0],

      trainingWeekData: trainingWeekData,
      previousTrainingWeekData: previousTrainingWeekData,
      firstTrainingWeekData: firstTrainingWeekData,
      currentTrainingWeekFatique: currentTrainingWeekFatique || [], //current training week

      isDeloadWeek: isDeloadWeek,
      weightPlaceholders: weightPlaceholders,
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

      typeOfPlan: typeOfPlan,
      templatePlanName: `${letter}${week}`,
    });
  } catch (err) {
    console.log("Fehler beim Aufrufen der Trainingsseite: " + err);
  }
}

//patch training
export async function patchTrainingPlan(req, res, week, i, isCustom) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    const updatedData = req.body;
    const trainingPlan = isCustom
      ? user.trainingPlansCustomNew[i]
      : user.trainingPlanTemplate[i]; // Je nach isCustom den richtigen Trainingsplan auswählen

    // if this was send
    if (updatedData["lastWeekDeloadHandled"]) {
      trainingPlan.lastWeekDeloadHandled = true;
    }

    trainingPlan.lastUpdated = new Date(); //save timestamp

    const trainingWeek = trainingPlan.trainingWeeks[week - 1];

    updateVolumeMarkers(updatedData, trainingWeek);

    for (let i = 0; i < trainingWeek.trainingDays.length; i++) {
      const trainingDay = trainingWeek.trainingDays[i];
      updateFatiqueLevels(trainingWeek, i, updatedData);

      const updatedExercisesPerDay = findMaxExerciseNumber(i + 1, updatedData);

      // wurde eine neue übung hinzugefügt oder sogar entfernt?
      const amountOfExercises =
        updatedExercisesPerDay > trainingDay.exercises.length
          ? updatedExercisesPerDay - 1
          : trainingDay.exercises.length - 1;

      // rückwärts drüber iterieren wegen löschen
      for (let j = amountOfExercises; j >= 0; j--) {
        const exercise = trainingDay.exercises[j];
        updateExerciseDetails(
          trainingDay,
          exercise,
          updatedData,
          i,
          j,
          trainingDay.exercises
        );
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

function getTypeOfPlan(user, typeOfPlan, index) {
  if (typeOfPlan === "custom") {
    return user.trainingPlansCustomNew[index];
  } else if (typeOfPlan === "template") {
    return user.trainingPlanTemplate[index];
  } 
  return null;
}

// if it is the last week and the user selected the last week is deload option return true else false
function isWeekDeloadWeek(trainingPlan, week) {
  if (week === trainingPlan.trainingWeeks.length) {
    if (trainingPlan.lastWeekDeload === undefined || !trainingPlan.lastWeekDeload) {
      return false;
    } else {
      return true;
    }
  }
  return false;
}

function updateFatiqueLevels(trainingWeek, dayIndex, updatedData) {
  const trainingDay = trainingWeek.trainingDays[dayIndex];

  if (
    trainingDay.fatiqueLevel !== updatedData[`day${dayIndex + 1}_fatiqueLevel`]
  ) {
    trainingDay.fatiqueLevel = updatedData[`day${dayIndex + 1}_fatiqueLevel`];
  }
}

// 12 ist jetzt die maximale Übungsanzahl
function findMaxExerciseNumber(trainingDayNumber, updatedData) {
  let exerciseCount = 0;
  for (let i = 1; i <= 12; i++) {
    const categoryNameKey = `day${trainingDayNumber}_exercise${i}_category`;
    const category = updatedData[categoryNameKey];

    if (category) {
      exerciseCount++;
    } else {
      break;
    }
  }
  return exerciseCount;
}

export async function handleWeeklyProgression(req, res, week, index, isCustom) {
  //typeOfPlan === custom || template
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    const updatedData = req.body;
    const trainingPlan = isCustom
      ? user.trainingPlansCustomNew[index]
      : user.trainingPlanTemplate[index]; // Je nach isCustom den richtigen Trainingsplan auswählen

    trainingPlan.lastUpdated = new Date(); //save timestamp

    const trainingWeek = trainingPlan.trainingWeeks[week - 1];

    updateVolumeMarkers(updatedData, trainingWeek);

    for (let i = 0; i < trainingWeek.trainingDays.length; i++) {
      const trainingDay = trainingWeek.trainingDays[i];
      updateFatiqueLevels(trainingWeek, i, updatedData);

      const updatedExercisesPerDay = findMaxExerciseNumber(i + 1, updatedData);

      // wurde eine neue übung hinzugefügt oder sogar entfernt?
      const amountOfExercises =
        updatedExercisesPerDay > trainingDay.exercises.length
          ? updatedExercisesPerDay - 1
          : trainingDay.exercises.length - 1;

      // rückwärts drüber iterieren wegen löschen
      for (let j = amountOfExercises; j >= 0; j--) {
        const exercise = trainingDay.exercises[j];
        updateExerciseDetails(
          trainingDay,
          exercise,
          updatedData,
          i,
          j,
          trainingDay.exercises
        );
      }
    }

    await user.save();
    // first part save training data regularly

    trainingPlan.trainingWeeks.forEach((trainingWeek, weekIndex) => {
      if (weekIndex !== 0) { //erste woche wird nicht weiter betrachtet für die progression
        trainingWeek.trainingDays.forEach((trainingDay, dayIndex) => {
          trainingPlan.trainingWeeks[0].trainingDays[dayIndex].exercises.forEach((exercise, exerciseIndex) => { //von der ersten trainingswoche betrachten wir jeden tag eizeln:
            
            if (!trainingDay.exercises[exerciseIndex]) { //wenn dieser wert für den trainingstag aus der aktuellen woche nicht definiert ist 
                                                        // kopiere die relevanten informationen in diese object damit geupdated werden kann
              trainingDay.exercises[exerciseIndex] = copyRelevantExerciseDetails(exercise);
            }
            handleAutomaticProgressionPerExercise(weekIndex, dayIndex, trainingDay.exercises[exerciseIndex], updatedData, exerciseIndex);
          })
        });
      }
    });

    await user.save();

    res.status(200).json({});
  } catch (err) {
    console.log("Error while patching custom page", err);
    res.status(500).json({ error: `Errro while patching custom page ${err}` });
  }
}

function copyRelevantExerciseDetails(exercise) {

  const newExerciseObject = {};
  
  newExerciseObject.category = exercise.category;
  newExerciseObject.exercise = exercise.exercise;
  newExerciseObject.sets = exercise.sets;
  newExerciseObject.reps = exercise.reps;
  newExerciseObject.targetRPE = exercise.targetRPE;

  return newExerciseObject;
}

function handleAutomaticProgressionPerExercise(weekIndex, dayIndex, exercise, updatedData, exerciseIndex) {
  const fieldPrefix = `day${dayIndex + 1}_exercise${exerciseIndex + 1}_`;

  let increment = parseFloat(weekIndex * 0.5);

  const categoryValue = updatedData[`${fieldPrefix}category`];
  const exerciseCategory = exercise.category;
  const targetRPE = parseFloat(updatedData[`${fieldPrefix}targetRPE`]); //always take it from the data send which is the first week:


  if ((categoryValue === exerciseCategory) && 
      (categoryValue === "Squat" ||categoryValue === "Bench" || categoryValue === "Deadlift") 
      && exercise) {
        exercise.targetRPE = Math.min(targetRPE + increment, 9);
  }
}

function extractFatiqueLevelOfTrainingDay(trainingPlan, weekIndex, dayIndex) {
  const trainingWeek = trainingPlan.trainingWeeks[weekIndex];
  const trainingDay = trainingWeek.trainingDays[dayIndex];
  return trainingDay.fatiqueLevel;
}