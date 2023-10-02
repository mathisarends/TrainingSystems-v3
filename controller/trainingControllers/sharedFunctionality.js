/* FOR RETRIEVING CUSTOM TRAINING PLAN */
export function getTrainingPlanInfo(trainingPlan) {
    const trainingTitle = trainingPlan.title;
    const trainingFrequency = trainingPlan.trainingFrequency;
    const trainingPhase = trainingPlan.trainingPhase;
    const amountOfTrainingDays = trainingPlan.trainingWeeks[0].trainingDays.length;
    const amountOfExercises = trainingPlan.exercisesPerDay;
    const lastWeekDeload = trainingPlan.lastWeekDeload;
    
    return {
      trainingTitle,
      trainingFrequency,
      trainingPhase,
      amountOfTrainingDays,
      amountOfExercises,
      lastWeekDeload
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

  export function categorizeExercises(exercises) {
    const exerciseCategories = [...new Set(exercises.map((exercise) => exercise.category.name))];
  
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
          maxFactors,
      };
  }

  // updates volume markers if there are changed - for patching training pages
export function updateVolumeMarkers(updatedData, trainingWeek) {

    if (trainingWeek.squatSetsDone != updatedData[`squat_sets_done`]) {
      trainingWeek.squatSetsDone = (updatedData[`squat_sets_done`]);
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

  export function updateExerciseDetails(trainingDay, exercise, updatedData, i, j) {
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

  /* regards rendering training plan view with or without additional data */
  // used to display max amount of trainingplans etc.
  export function renderTrainingPlansView(res, user, additionalData = {}) {
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