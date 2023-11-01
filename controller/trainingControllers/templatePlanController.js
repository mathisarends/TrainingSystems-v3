import User from "../../models/user.js";
import templateTrainingsGenerator from "../../models/templateTrainingGenerator.js";


import {
  getTrainingPlanInfo,
  getAmountOfTrainingWeeks,
  removeTrainingWeeks,
  addNewTrainingWeeks,
} from "./sharedFunctionality.js";


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

      const trainingPlanId = trainingPlan._id;
      
      const currentBlockLength = trainingPlan.trainingWeeks.length
      if (currentBlockLength !== newBlockLength) {
        if (newBlockLength > currentBlockLength) {
          const weekDifference = newBlockLength - currentBlockLength; //get the difference how many sets shall be added
          addNewTrainingWeeks(trainingPlan.trainingWeeks, trainingPlan.trainingFrequency, weekDifference, trainingPlanId);

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

  