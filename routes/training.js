import express from "express";
const router = express.Router();

import { checkAuthenticated } from "../authMiddleware.js";

const templates = ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8"]; //template ULR-Endings
const templateLetters = ["A", "B"];
const customTemplateLetters = ["A", "B", "C", "D"]; //customURL-Endings
const maxWeeks = 8; 

import {
  getCreateTrainingPlan, 
  postCreateTrainingPlan, 
  handleDeleteTrainingPlan, 
  getCustomEditPage,
  patchCustomEditPage,
} from "../controller/trainingControllers/customPlanController.js";

import {
  deleteTemplateTraining,
  getTemplateEditPage,
  patchTemplateEditPage
} from "../controller/trainingControllers/templatePlanController.js";

import {
  getCreateTraining,  
  postCreateTraining,
  handleDeleteSession,
  getSessionEdit,
  patchSessionEdit,
  getTrainingSession,
  patchTrainingSession,
} from "../controller/trainingControllers/trainingSessionController.js";

import {
  getStatisticPage,
  handleWeeklyProgression,
  patchTrainingPlan,
  getTrainingPlan,
} from "../controller/trainingControllers/sharedFunctionality.js"

import { 
  getTrainingIndexPage, 
} from "../controller/trainingControllers/trainingController.js";
import TrainingPlan from "../models/trainingPlanSchema.js";

//regular custom training plans (standart)
router.get("/", checkAuthenticated, getTrainingIndexPage);

/* CUSTOM TRAINING PLANS */
router.get("/create-training-plan", checkAuthenticated, getCreateTrainingPlan);
router.post("/create-training-plan", checkAuthenticated, postCreateTrainingPlan);
router.delete("/delete-training-plan", checkAuthenticated, handleDeleteTrainingPlan)

customTemplateLetters.forEach((letter, index) => {
  for (let week = 1; week <= maxWeeks; week++) {
    const routePath = `/custom-${letter}${week}`;
    const typeOfPlan = "custom";
    router.get(routePath, checkAuthenticated, (req, res) => getTrainingPlan(req, res, index, letter, week, typeOfPlan));
  }
})

customTemplateLetters.forEach((letter, index) => {
  for (let week = 1; week <= maxWeeks; week++) {
    const routePath = `/custom-${letter}${week}`;
    router.patch(routePath, checkAuthenticated, (req, res) => patchTrainingPlan(req, res, week, index, true))
  }
})

customTemplateLetters.forEach((letter, index) => {
  const routePath = `/custom-${letter}-automaticProgression`;
  router.get(routePath, checkAuthenticated, (req, res) => getCustomEditPage(req, res, index, letter));
})

customTemplateLetters.forEach((letter, index) => {
  const routePath = `/custom-${letter}-edit`;
  router.get(routePath, checkAuthenticated, (req, res) => getCustomEditPage(req, res, index, letter));
})

customTemplateLetters.forEach((letter, index) => {
  const routePath = `/custom-${letter}-edit`;
  router.patch(routePath, checkAuthenticated, (req, res) => patchCustomEditPage(req, res, index))
})

customTemplateLetters.forEach((letter, index) => {
  const routePath = `/custom-${letter}-stats`;
  router.get(routePath, checkAuthenticated, (req, res) => getStatisticPage(req, res, index)) //TODO:
})

//route ist nur für die erste woche gültig
customTemplateLetters.forEach((letter, index) => {
    const week = 1;
    const routePath = `/custom-${letter}-progression`;
    const isCustom = true;
    router.patch(routePath, checkAuthenticated, (req, res) => handleWeeklyProgression(req, res, week, index, isCustom));
})



/* TEMPLATE PLANS */
templateLetters.forEach((letter, index) => {
  for (let week = 1; week <= maxWeeks; week++) {
    const routePath = `/template-${letter}${week}`;
    const typeOfPlan = "template";
    router.get(routePath, checkAuthenticated, (req, res) => getTrainingPlan(req, res, index, letter, week, typeOfPlan));
  }
})

templateLetters.forEach((letter, index) => {
  for (let week = 1; week <= maxWeeks; week++) {
    const routePath = `/template-${letter}${week}`;
    router.patch(routePath, checkAuthenticated, (req, res) => patchTrainingPlan(req, res, week, index, false)); //false wegen !custom
  }
})

customTemplateLetters.forEach((letter, index) => {
  const week = 1;
  const routePath = `/template-${letter}-progression`;
  const isCustom = false;
  router.patch(routePath, checkAuthenticated, (req, res) => handleWeeklyProgression(req, res, week, index, isCustom));
})

templates.forEach((letter, index) => {
  router.get(`/template-${letter}-edit`, checkAuthenticated, (req, res) => getTemplateEditPage(req, res, index, letter));
})

templates.forEach((letter, index) => {
  router.patch(`/template-${letter}-edit`, checkAuthenticated, (req, res) => patchTemplateEditPage(req, res, index));
})

templates.forEach((letter, index) => {
  router.get(`/template-${letter}-stats`, checkAuthenticated, (req, res) => getStatisticPage(req, res, index));
})

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


router.get("/createTraining", checkAuthenticated, getCreateTraining);
router.post("/createTraining", checkAuthenticated, postCreateTraining);
router.delete("/delete-training", checkAuthenticated, handleDeleteSession);

export default router;


