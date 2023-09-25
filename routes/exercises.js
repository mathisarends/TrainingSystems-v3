import express from "express";

import { checkAuthenticated } from "../authMiddleware.js";
import { showUserExercises, patchUserExercises, resetUserExercises } from "../controller/exerciseController.js";

const router = express.Router();

router.get("/", checkAuthenticated, showUserExercises);
router.patch("/", checkAuthenticated, patchUserExercises);
router.post("/reset", checkAuthenticated, resetUserExercises);

export default router;

