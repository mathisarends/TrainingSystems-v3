import User from "../../models/user.js";
import templateTrainingsGenerator from "../../models/templateTrainingGenerator.js";


import {
  getTrainingPlanInfo,
  getLastTrainingDayOfWeek,
  extractDataOfTrainingDay,
  categorizeExercises,
  updateVolumeMarkers,
  updateExerciseDetails,
  getAmountOfTrainingWeeks,
  removeTrainingWeeks,
  addNewTrainingWeeks,
} from "./sharedFunctionality.js";




export async function getTemplateTraining(req, res, index, letter, week, typeOfPlan) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).send("Benutzer nicht gefunden");
      }
      const trainingPlan = user.trainingPlanTemplate[index];

      if (!trainingPlan) {
        return res.status(404).send("Training nicht gefunden!");
      }

      if (week > trainingPlan.trainingWeeks.length) {
        return res.status(404).send("Ungültige Woche");
      }

      let isDeloadWeek = false;
      if (week === trainingPlan.trainingWeeks.length) {
        if (trainingPlan.lastWeekDeload === undefined || !trainingPlan.lastWeekDeload) {
          isDeloadWeek = false;
        } else {
          isDeloadWeek = true;
        }
      }



      const { trainingTitle, trainingFrequency, trainingPhase, amountOfTrainingDays, amountOfExercises } = getTrainingPlanInfo(trainingPlan);
      const lastTrainingDay = getLastTrainingDayOfWeek(trainingPlan, week - 1);
  
  
      const trainingWeekData = []; //this training week
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
  
      let firstTrainingWeekData = []; //fallback option firstTrainingWeek
        for (let j = 0; j < amountOfTrainingDays; j++) {
          firstTrainingWeekData.push(extractDataOfTrainingDay(trainingPlan, 0, j));
        }
  
      const { exerciseCategories, categoryPauseTimes, categorizedExercises, defaultRepSchemeByCategory, maxFactors } = categorizeExercises(user.exercises);
  
      const trainingData = user.trainingData.length > 0 ? user.trainingData[0] : {}; //volume recomandations
    
      let afterPageIndex = (week + 1) % trainingPlan.trainingWeeks.length;
      afterPageIndex = afterPageIndex === 0 ? trainingPlan.trainingWeeks.length : afterPageIndex;
  
      let beforePageIndex = (week - 1) % trainingPlan.trainingWeeks.length;
      beforePageIndex = beforePageIndex === 0 ? trainingPlan.trainingWeeks.length : beforePageIndex;
  
      const beforePage = `/training/template-${letter}${beforePageIndex}`;
      const afterPage = `/training/template-${letter}${afterPageIndex}`;

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
      console.log(`Fehler beim Aufrufen des Template Plan ${templateName}: ${err}`);
    }
  }

  export async function getTemplateEditPage(req, res, index, letter) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).send("Benutzer nicht gefunden");
      }

      const trainingPlan = user.trainingPlanTemplate[index];

      if (!trainingPlan) {
        return res.status(404).send("Training nicht gefunden!");
      }

      const { trainingTitle, trainingFrequency, trainingPhase, amountOfTrainingDays, lastWeekDeload } = getTrainingPlanInfo(trainingPlan);

      const blockLength = getAmountOfTrainingWeeks(trainingPlan);

      res.render("trainingPlans/custom/trainingPlanEdit", {
        userID: user.id,
        layout: false,
        amountOfTrainingDays: amountOfTrainingDays,
        workoutName: trainingTitle,
        trainingFrequency: trainingFrequency,
        trainingPhase: trainingPhase,
        lastWeekDeload: lastWeekDeload,
        blockLength: blockLength,
        templatePlanName: `template-${letter}`, //for posting to the right path
      });

    } catch (error) {
      console.log("Error while trying to access the edit training page", error);
    }
  }

  export async function patchTemplateEditPage(req, res, index) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).send("Benutzer nicht gefunden");
      }
      
      const trainingPlan = user.trainingPlanTemplate[index];

      if (!trainingPlan) {
        return res.status(404).send("Training nicht gefunden!");
      }

      //update data
      const newTitle = req.body.training_title;
      const newTrainingFrequency = req.body.training_frequency;
      const newTrainingPhase = req.body.training_phase;
      const isLastWeekDeload = req.body.isLastWeekDeload;
      const newBlockLength = req.body.block_length;

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

      if (trainingPlan.lastWeekDeload !== isLastWeekDeload) {
        trainingPlan.lastWeekDeload = isLastWeekDeload;
      }      

      
      const currentBlockLength = trainingPlan.trainingWeeks.length
      if (currentBlockLength !== newBlockLength) {
        if (newBlockLength > currentBlockLength) {
          const weekDifference = newBlockLength - currentBlockLength; //get the difference how many sets shall be added
          addNewTrainingWeeks(trainingPlan.trainingWeeks, trainingPlan.trainingFrequency, weekDifference);

        } else if (newBlockLength < currentBlockLength) {
          const weekDifference = currentBlockLength - newBlockLength;
          removeTrainingWeeks(trainingPlan.trainingWeeks, weekDifference);
        }
      }
      
      await user.save();
      res.status(200).json({});

    } catch (error) {
      console.log("Error while patching meta data of template training", error);
    }
  }

  //actually just resets the custom training
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


  // now duplicate
  function extractFatiqueLevelOfTrainingDay(trainingPlan, weekIndex, dayIndex) {
    const trainingWeek = trainingPlan.trainingWeeks[weekIndex];
    const trainingDay = trainingWeek.trainingDays[dayIndex];
    return trainingDay.fatiqueLevel;
  }

  