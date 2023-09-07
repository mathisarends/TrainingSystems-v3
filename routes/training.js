const express = require("express");
const Router = express.Router();

const User = require("../models/user");
const NewTrainingPlan = require("../models/trainingPlanSchema");
const TrainingSchema = require("../models/trainingSchema");

const templateTrainingsGenerator = require("../models/templateTrainingGenerator");

const { checkAuthenticated, checkNotAuthenticated, } = require("../authMiddleware");
const redirectToReferer = require("../redirectMiddleware");

const templates = ["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4"]; //template ULR-Endings
const customTemplateLetters = ["A", "B", "C", "D"]; //customURL-Endings
const maxWeeks = 6; 

Router.get("/", checkAuthenticated, async (req, res) => {
  try {
    const user = await User.findOne({ name: req.user.name });
    if (!user) {
      return redirectToReferer(req, res);
    }

    renderTrainingPlansView(res, user);
  } catch (err) {
    console.log(err);
  }
});


Router.get("/create-training-plan", checkAuthenticated, async (req, res) => {
  try {
    const user = await User.findOne({ name: req.user.name });
    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    if (user.trainingPlansCustomNew.length >= 3) {
      renderTrainingPlansView(res, user, {
        errorCreatingNewCustomTrainingPlan: "Maximale Anzahl an Plänen erreicht."
      });

    } else {
      res.render("trainingPlans/custom/createNewCustomTraining", {layout: false});
    }
  } catch (err) {
    console.log("Fehler beim Erstellen des Trainingsplans " + err);
  }
});

Router.post("/create-training-plan", checkAuthenticated, async (req, res) => {
  try {
    const user = await User.findOne({ name: req.user.name });
      if (!user) {
        return res.status(404).send("Benutzer nicht gefunden");
      }

    const trainingPlanData = req.body;
    const trainingPlanName = trainingPlanData.training_title;
    const trainingPlanPhase = trainingPlanData.training_phase;
    const trainingPlanFrequency = trainingPlanData.training_frequency;
    const trainingPlanWeeks = trainingPlanData.training_weeks;

    const lastUpdated = new Date();

    const trainingWeeks = createNewTrainingPlanWithPlaceholders(trainingPlanWeeks, trainingPlanFrequency);

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
    console.log("Es ist ein Fehler beim erstellen des Trainingsplans vorgefallen! " + err);
  }
})



Router.delete("/delete-training-plan", checkAuthenticated, async (req, res) => {
  const indexToDelete = req.body.deleteIndex;

  try {
    const user = await User.findOne({ name: req.user.name });
    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    user.trainingPlansCustomNew.splice(indexToDelete, 1);
    await user.save();

    res.redirect("/training");

  } catch (err) {
    console.log("Fehler beim löschen des Trainingsplans: " + err);
  }
})

//PATCH CUSTOM TRAININGS
for (let i = 0; i < customTemplateLetters.length; i++) {
  const letter = customTemplateLetters[i];
  for (let week = 1; week <= maxWeeks; week++) {
    const routePath = `/custom-${letter}${week}`;
    Router.patch(routePath, checkAuthenticated, async (req, res) => {
      try {
        const user = await User.findOne({ name: req.user.name });
        if (!user) {
          return res.status(404).send("Benutzer nicht gefunden");
        }
        console.log("In der Patch _route")

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

        //update Title and Training Phase
      
      await user.save();
      console.log("Daten erfolgreich gespeichert")


      /* const referer = req.headers.referer || "/";
      res.redirect(referer);  */
      res.status(200).json({});

      } catch (err) {
        console.log(`Fehler beim Patchen der Seite CUSTOM ${letter}${week}! ` + err);
        res.status(500).json({ error: `Fehler beim Patchen der Seite CUSTOM ${letter}${week}! ` + err })
      }
    })
  }
}

// retrieves lastTrainingDay of the week based on weight input
function getLastTrainingDayOfWeek(trainingPlan, weekIndex) {
  const trainingWeek = trainingPlan.trainingWeeks[weekIndex];
  
  for (let i = trainingWeek.trainingDays.length - 1; i >= 0; i--) {
    const trainingDay = trainingWeek.trainingDays[i];

    if (trainingDay.exercises?.some(exercise => exercise.weight)) {
      return i + 1;
      }
    }

    return 1; //ansonsten ist es woche 1;
  }

//GET CUSTOM TRAININGS
for (let i = 0; i < customTemplateLetters.length; i++) {
  const letter = customTemplateLetters[i];
  for (let week = 1; week <= maxWeeks; week++) {
    const routePath = `/custom-${letter}${week}`;
    Router.get(routePath, checkAuthenticated, async (req, res) => {
      try {
        const user = await User.findOne({ name: req.user.name });
        if (!user) {
          return res.status(404).send("Benutzer nicht gefunden");
        }

        const trainingPlan = user.trainingPlansCustomNew[i];

        if(!trainingPlan) { //Routes will hopefully will never be reached
          return res.status(404).send("Training nicht gefunden!");
        }

        if (week > trainingPlan.trainingWeeks.length) {
          return res.status(400).send("Ungültige Woche");
        }

        const { trainingTitle, trainingFrequency, trainingPhase, amountOfTrainingDays } = getTrainingPlanInfo(trainingPlan);

        const lastTrainingDay = getLastTrainingDayOfWeek(trainingPlan, week - 1);

        const trainingWeekData = [];
        for (let j = 0; j < amountOfTrainingDays; j++) {
          trainingWeekData.push(extractDataOfTrainingDay(trainingPlan, week - 1, j));
        }

        const firstTrainingWeekData = [];
        for (let j = 0; j < amountOfTrainingDays; j++) {
          firstTrainingWeekData.push(extractDataOfTrainingDay(trainingPlan, 0, j));
        }

        const { exerciseCategories, categoryPauseTimes, categorizedExercises, defaultRepSchemeByCategory } = categorizeExercises(user.exercises);

        const trainingData = user.trainingData.length > 0 ? user.trainingData[0] : {};


        let afterPageIndex = (week + 1) % trainingPlan.trainingWeeks.length;
        afterPageIndex = afterPageIndex === 0 ? trainingPlan.trainingWeeks.length : afterPageIndex;

        let beforePageIndex = (week - 1) % trainingPlan.trainingWeeks.length;
        beforePageIndex = beforePageIndex === 0 ? trainingPlan.trainingWeeks.length : beforePageIndex;

        const beforePage = `/training/custom-${letter}${beforePageIndex}`;
        const afterPage = `/training/custom-${letter}${afterPageIndex}`;

        res.render("trainingPlans/custom/trainingPlan", {

          trainingWeekData: trainingWeekData,
          firstTrainingWeekData: firstTrainingWeekData,
    
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
          week: week,

          lastTrainingDay: lastTrainingDay,
    
          templatePlanName: `${letter}${week}`,
        });
      } catch (err) {
        console.log("Fehler beim Aufrufen der Trainingsseite: " + err);
      }
    })
  }
}

//GET CUSTOM TRAININGPLANS EDIT PAGE (for changing training tile frequency etc)
for (let i = 0; i < customTemplateLetters.length; i++) {
  const letter = customTemplateLetters[i];
  for (let week = 1; week <= maxWeeks; week++) {
    const routePath = `/custom-${letter}${week}-edit`;
    Router.get(routePath, checkAuthenticated, async (req, res) => {
      try {
        const user = await User.findOne({ name: req.user.name });
        if (!user) {
          return res.status(404).send("Benutzer nicht gefunden");
        }

        const trainingPlan = user.trainingPlansCustomNew[i];

        if(!trainingPlan) { //Routes will hopefully will never be reached
          return res.status(404).send("Training nicht gefunden!");
        }

        if (week > trainingPlan.trainingWeeks.length) {
          return res.status(400).send("Ungültige Woche");
        }

        const { trainingTitle, trainingFrequency, trainingPhase, amountOfTrainingDays } = getTrainingPlanInfo(trainingPlan);


        const blockLength = getAmountOfTrainingWeeks(trainingPlan);

        //JUMP TODO: hier das gerenderte Tempalte ändern
        res.render("trainingPlans/custom/trainingPlanEdit", {

          layout: false,
    
          amountOfTrainingDays: amountOfTrainingDays,
          workoutName: trainingTitle,
          trainingFrequency: trainingFrequency,
          trainingPhase: trainingPhase,
          blockLength: blockLength,
    
          templatePlanName: `${letter}${week}`, //for posting to the right path
        });
      } catch (err) {
        console.log("Fehler beim Aufrufen der Trainingsseite: " + err);
      }
    })
  }
}

for (let i = 0; i < customTemplateLetters.length; i++) {
  const letter = customTemplateLetters[i];
  for (let week = 1; week <= maxWeeks; week++) {
    const routePath = `/custom-${letter}${week}-edit`;
    Router.patch(routePath, checkAuthenticated, async (req, res) => {
      try {
        const user = await User.findOne({ name: req.user.name });
        if (!user) {
          return res.status(404).send("Benutzer nicht gefunden");
        }

        const trainingPlan = user.trainingPlansCustomNew[i];

        if(!trainingPlan) { //Routes will hopefully will never be reached
          return res.status(404).send("Training nicht gefunden!");
        }

        if (week > trainingPlan.trainingWeeks.length) {
          return res.status(400).send("Ungültige Woche");
        }

        //Neue übergebene Daten
        const newTitle = req.body.training_title;
        const newTrainingPhase = req.body.training_phase;
        const newTrainingFrequency = req.body.training_frequency;

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

        console.log("daten gespeichert");
        await user.save();


        res.redirect("/training");

        
      } catch (err) {
        console.log("Fehler beim Patchen der Meta-Datend des Trainings " + err);
      }
    })
  }
}



// TEMPLATE PLANS

for (let i = 0; i < templates.length; i++) {
  const templateName = templates[i]; 
  const templateType = templateName.startsWith("A") ? 0 : 1; // 0 for A templates, 1 for B templates
  const weekIndex = parseInt(templateName.slice(1) - 1);

  Router.get(`/template-${templateName}`, checkAuthenticated, async (req, res) => {
    try {
      const user = await User.findOne({ name: req.user.name });
      if (!user) {
        return res.status(404).send("Benutzer nicht gefunden");
      }
      const trainingPlan = user.trainingPlanTemplate[templateType];
      console.log(trainingPlan);
      const { trainingTitle, trainingFrequency, trainingPhase, amountOfTrainingDays } = getTrainingPlanInfo(trainingPlan);
      const lastTrainingDay = getLastTrainingDayOfWeek(trainingPlan, weekIndex);


      const trainingWeekData = []; //this training week
      for (let j = 0; j < amountOfTrainingDays; j++) {
        trainingWeekData.push(extractDataOfTrainingDay(trainingPlan, weekIndex, j));
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
        trainingWeekData: trainingWeekData,
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
  });
}

for (let i = 0; i < templates.length; i++) {
  const templateName = templates[i];
  Router.patch(`/template-${templateName}`, checkAuthenticated, async (req, res) => {
    try {
      const user = await User.findOne({ name: req.user.name });
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

      for (let i = 0; i < trainingWeek.trainingDays.length; i++) {
        const trainingDay = trainingWeek.trainingDays[i];
        const trainingDayNotesFieldName = `workout_notes_${i + 1}`;
        updateTrainingDayNotes(trainingDay, updatedData, i);
        
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
      console.log(reqTrainingPhase);
      if (reqTrainingPhase !== trainingPlan.trainingPhase) {
        trainingPlan.trainingPhase = reqTrainingPhase;
      }
    
      await user.save();
      res.status(200).json({});
    } catch (err) {
      console.log(`Ein Fehler ist beim Patchen der Ressource aufgetreten (${templateName}): ${err}`);
      res.status(500).json({ error: `Ein Fehler ist beim Patchen der Ressource aufgetreten (${templateName}): ${err}` })
    }
  })
}

Router.post("/reset-template-training", checkAuthenticated, async (req, res) => {
  try {
    const user = await User.findOne({ name: req.user.name });

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

    const referer = req.headers.referer || "/";
    res.redirect(referer);



  } catch (err) {
    console.log("Es ist ein Fehler beim zurücksetzen des Template Trainings vorgefallen. " + err);
  }
})

// TRAINING SINGLE


//TODO: Hier müssen gleich anpassungen gemacht werden
for (let i = 1; i <= 5; i++) { // 5 Training Slots GET
  Router.get(`/session-edit-${i}`, checkAuthenticated, (req, res) => {
    (req, res, i - 1);
  });
}

for (let i = 1; i <= 5; i++) { // 5 Training Slots POST
  Router.patch(`/session-edit-${i}`, checkAuthenticated, async (req, res) => {
    await handleSessionEditPatch(req, res, i - 1);
  });
}


// 2 Neue Routen für den Training Mode der Trainingsfunktion GET UND POST
for (let i = 1; i <= 5; i++) {
  Router.get(`/session-train-${i}`, checkAuthenticated, async (req, res) => {
    await handleTrainingSessionGET(req, res, i - 1);
  }) 
}

for (let i = 1; i <= 5; i++) {
  Router.patch(`/session-train-${i}`, checkAuthenticated, async (req, res) => {
    await handleTrainingSessionPOST(req, res, i - 1);
  }) 
}

// get für session-train-i
async function handleTrainingSessionGET(req, res, index) {
  try {
    const user = await User.findOne({ name: req.user.name });

    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    const training = user.trainings[index];
    const trainingTitle = training.title;
    const trainingPhase = training.trainingPhase;
    const trainingData = extractTrainingExerciseData(training, 0); //JUMP
    const previousTrainingData = [];
    for (let i = 0; i < training.trainings.length; i++) {
      previousTrainingData.push(extractTrainingExerciseData(training, i));
    }

    // retrieve information then previous trainings were mad
    const previousTrainingDates = [];
    for (let i = 0; i < training.trainings.length; i++) {
      previousTrainingDates.push(extractPreviousTrainingDates(training, i));
    }

    //JUMP
    const { exerciseCategories, categoryPauseTimes, categorizedExercises, defaultRepSchemeByCategory } = categorizeExercises(user.exercises);

    const volumeMarkers = user.trainingData.length > 0 ? user.trainingData[0] : {}; //volume recomandations

    const date = formatDateWithDay(training.lastUpdated); //newst date from newest training

    res.render("trainingPlans/scratch/trainAgain", {

      exerciseCategories,
      categoryPauseTimes,
      categorizedExercises,
      defaultRepSchemeByCategory,

      volumeMarkers: volumeMarkers,
      squatmev: volumeMarkers.minimumSetsSquat || "",
      squatmrv: volumeMarkers.maximumSetsSquat || "",
      benchmev: volumeMarkers.minimumSetsBench || "",
      benchmrv: volumeMarkers.maximumSetsBench || "",
      deadliftmev: volumeMarkers.minimumSetsDeadlift || "",
      deadliftmrv: volumeMarkers.maximumSetsDeadlift || "",

      trainingTitle: trainingTitle,

      trainingData: trainingData,
      previousTrainingData: previousTrainingData,
      previousTrainingDates: previousTrainingDates,

      training: training,
      trainingPhase: trainingPhase,

      date: date,

      number: index + 1,
        });

  } catch(err) {
    console.log("Es ist ein Fehler beim aufrufen des Trainingsmodus vorgefallen! " + err);
  }
}

function loadTrainingPreviewData(trainings) {
  const trainingFormattedDates = [];
  for (let i = 0; i < trainings.length; i++) {
    trainingFormattedDates.push(formatDate(trainings[i].lastUpdated));
  }

  const trainingPreviewInformation = [];
  for (let i = 0; i < trainings.length; i++) {
    trainingPreviewInformation.push(extractTrainingExerciseData(trainings[i], 0)); //immer die information des mostRecentTrainings anzeigen
  }

  return {
    trainingFormattedDates,
    trainingPreviewInformation,
  };
}



Router.get("/createTraining", checkAuthenticated, async (req, res) => {
  try {
    const user = await User.findOne({ name: req.user.name });
    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    if (user.trainings.length >= 3) {
      renderTrainingPlansView(res, user, {
        errorCreatingNewCustomTraining: "Du hast bereits die maximale Anzahl an Trainings gespeichert!"
      });

    } else {
      res.render("trainingPlans/scratch/createTraining", {layout: false});
    }



  } catch (err) {
    console.log("Es ist ein Fehler beim Aufrufen der Create-Training Page enstanden. " + err);
  }
})


Router.post("/createTraining", checkAuthenticated, async (req, res) => {
  try {
    const user = await User.findOne({ name: req.user.name });

    if(!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    const trainingData = req.body;
    const trainingTitle = req.body.training_title;
    const trainingPhase = req.body.training_phase;
    const date = new Date();
    const userID = req.user._id;


    const exercises = [];

    // weil auf der page maximal 9 übungen erlaubt sind
    for (let i = 1; i <= 9; i++) {
      const exerciseObject = {
        category: "",
        exercise: "",
        sets: null,
        reps: null,
        weight: null,
        targetRPE: null,
        actualRPE: null,
        estMax: null,
        notes: "",
      }
      exercises.push(exerciseObject);
    }


    const trainingObject = { //create object which we can save in trainings-array
      trainingDate: date,
      exercises: exercises,
    }

    const newTrainingPlan = new TrainingSchema({
      user: userID,
      title: trainingTitle,
      lastUpdated: date,
      trainingPhase: trainingPhase,
      trainings: trainingObject,
    });

    const savedTrainingPlan = await newTrainingPlan.save();

    user.trainings.push(savedTrainingPlan);
    user.trainings.sort((a, b) => b.lastUpdated - a.lastUpdated); //Trainingspläne sollen immer nach datum absteigend sortiert sein TODO: Testen ob das funktioniert
    await user.save();
    console.log("Daten gespeichert und werden an die Hauptpage weitergeleitet?");
    res.redirect("/training/session-train-1");

  } catch (err) {
    console.error(err);
    res.status(500).send("Fehler beim Verarbeiten der Formulardaten");
  }
})


Router.delete("/delete-training", checkAuthenticated, async (req, res) => {
  const indexToDelete = req.body.deleteIndex;
  console.log(indexToDelete);

  try {
    const user = await User.findOne({ name: req.user.name });
    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    user.trainings.splice(indexToDelete, 1);
    await user.save();

    console.log("Trainingsplan gelöscht");

    res.redirect("/training");

  } catch (err) {
    console.log("Ein Fehler beim löschen des Trainings ist aufgetreten: " + err);
  }

})

module.exports = Router;

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

//GET für session-edit-i JUMP
async function handleSessionEdit(req, res, sessionIndex) { //function for handling GET with a single Training session
  try {
    const user = await User.findOne({ name: req.user.name });

    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    const training = user.trainings[sessionIndex];
    const trainingTitle = training.title;
    const trainingPhase = training.trainingPhase;

    //hier müssen wir mehr informationen retrieven über die einzelnen trainingstage

    res.render("trainingPlans/scratch/editTraining", {
      sessionIndex: sessionIndex,
      trainingTitle,
      trainingPhase,
      layout: false,
    });

  } catch (err) {
    console.error("Ein Fehler beim Anzeigen der gespeicherten Session ist aufgetreten. " + err);
  }
}

async function handleSessionEditPatch(req, res, index) {
  try {
    const user = await User.findOne({ name: req.user.name });
    
    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    const trainingSession = user.trainings[index];

    const updatedData = req.body;


    const newTitle = req.body.training_title;
    const newTrainingPhase = req.body.training_phase;

    if (trainingSession.title !== newTitle) {
      trainingSession.title = newTitle;
    }
    if (trainingSession.trainingPhase !== newTrainingPhase) {
      trainingSession.trainingPhase = newTrainingPhase;
    }


    await user.save();
    res.redirect("/training");

  } catch (err) {
    console.log("Es ist ein Fehler beim Patchen der Session vorgefallen! " + err);
  }
}

async function handleTrainingSessionPOST(req, res, index) {
  try {
      const user = await User.findOne({ name: req.user.name });
  
      if (!user) {
        return res.status(404).send("Benutzer nicht gefunden");
      }
  
      const trainingData = req.body;
  
      const exerciseArray = [];
  
      for (let i = 1; i <= 9; i++) {
        const exerciseObject = {
          exercise: trainingData[`exercise_name_${i}`],
          sets: trainingData[`exercise_sets_${i}`],
          reps: trainingData[`exercise_reps_${i}`],
          weight: trainingData[`exercise_weight_${i}`],
          rpe: trainingData[`exercise_actualRPE_${i}`],
          estMax: trainingData[`exercise_max_${i}`],
        }
  
        exerciseArray.push(exerciseObject);
      }
  
      const trainingObject = {
        trainingDate: new Date(),
        trainingNote: trainingData.notes_regarding_workout,
        exercises: exerciseArray
      }
  
      // Hinzufügen des neuen Training-Objekts zum trainings-Array
      user.trainings[index].trainings.unshift(trainingObject);
  
      // Sortieren des trainings-Arrays nach dem trainingDate in absteigender Reihenfolge (neuestes zuerst)
      user.trainings[index].trainings.sort((a, b) => b.trainingDate - a.trainingDate);

      // Überprüfen, ob mehr als 3 Einträge vorhanden sind und ggf. die ältesten löschen
    if (user.trainings[index].trainings.length > 3) {
      user.trainings[index].trainings = user.trainings[index].trainings.slice(0, 3);
    }
  
      // Speichern des aktualisierten Benutzers
      await user.save();
  
      res.status(200).json({});
  
    } catch(err) {
      console.log("Es ist ein Fehler beim Posten des Trainingsmodus vorgefallen! " + err);
    }
  }

function extractPreviousTrainingDates(trainingSession, index) {
  const dates = [];

  if (trainingSession && trainingSession.trainings[index]) {
    const nthTrainingSession = trainingSession.trainings[index];

    let trainingDate = nthTrainingSession.trainingDate;
    trainingDate = formatDateWithDay(trainingDate);

    dates.push(trainingDate);
  }

  return dates;
}

function extractTrainingExerciseData(trainingSession, index) {
  const exerciseData = [];

  if (trainingSession && trainingSession.trainings[index]) {
    const nthTrainingSession = trainingSession.trainings[index]; // Erster Trainingstag

    for (let i = 0; i < nthTrainingSession.exercises.length; i++) {
      const exercise = nthTrainingSession.exercises[i];

      if (exercise !== null) {
        exerciseData.push({
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
  }

  return exerciseData;
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
    errorCreatingNewCustomTrainingPlan: "",
    errorCreatingNewCustomTraining: "",
    lastVisitedTrainingMode: user.lastVisitedTrainingMode || "",
  };

  const {
    trainingPlanTemplate,
    trainingPlansCustomNew,
    trainings,
  } = user;

  const {
    trainingFormattedDates,
    trainingPreviewInformation,
  } = loadTrainingPreviewData(trainings);

  const formattedTrainingPlanDates = getLastEditedDatesOfType(
    trainingPlansCustomNew
  );

  const formattedTemplateTrainingPlanDates = getLastEditedDatesOfType(
    trainingPlanTemplate
  );
  const customNextTrainingdayInformation = getExerciseOfNextTrainingDayPerPlan(
    trainingPlansCustomNew
  );

  const customCurrentTrainingWeek = getMostRecentTrainingWeeks(trainingPlansCustomNew);

  const templateCurrentTrainingWeek = getMostRecentTrainingWeeks(trainingPlanTemplate);

  const templateNextTrainingDayInformation = getExerciseOfNextTrainingDayPerPlan(
    trainingPlanTemplate
  );

  const mergedData = {
    ...defaultData,
    ...additionalData,
    userTemplateTrainings: trainingPlanTemplate,
    userCustomTrainings: trainingPlansCustomNew,
    userTrainings: trainings,

    trainingFormattedDates,
    trainingPreviewInformation,
    formattedTrainingPlanDates: formattedTrainingPlanDates || "",
    formattedTemplateTrainingPlanDates,
    customNextTrainingdayInformation,
    templateNextTrainingDayInformation,

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
