import express from "express";
const router = express.Router();

import { checkAuthenticated } from "../authMiddleware.js";

const templates = ["A1", "A2", "A3", "A4", "A5", "B1", "B2", "B3", "B4", "B5"]; //template ULR-Endings
const customTemplateLetters = ["A", "B", "C", "D"]; //customURL-Endings
const maxWeeks = 6; 

import {
  getCreateTrainingPlan, 
  postCreateTrainingPlan, 
  handleDeleteTrainingPlan, 
  patchCustomTraining, 
  getCustomTraining, 
  getCustomEditPage,
  patchCustomEditPage,
} from "../controller/trainingControllers/customPlanController.js";

import {
  getTemplateTraining,
  patchTemplateTraining,
  deleteTemplateTraining,
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
  getStatisticPage
} from "../controller/trainingControllers/sharedFunctionality.js"

import { 
  getTrainingIndexPage, 
} from "../controller/trainingControllers/trainingController.js";

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

for (let i = 0; i < customTemplateLetters.length; i++) {
  const letter = customTemplateLetters[i];
  const routePath = `/custom-${letter}-stats`;
  router.get(routePath, checkAuthenticated, (req, res) => getStatisticPage(req, res, i)) //TODO:
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

for (let i = 0; i < 2; i++) {
  const templateName = customTemplateLetters[i]; 
  router.get(`/template-${templateName}-stats`, checkAuthenticated, (req, res) => getStatisticPage(req, res, i));
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


router.get("/createTraining", checkAuthenticated, getCreateTraining);
router.post("/createTraining", checkAuthenticated, postCreateTraining);
router.delete("/delete-training", checkAuthenticated, handleDeleteSession);

export default router;


