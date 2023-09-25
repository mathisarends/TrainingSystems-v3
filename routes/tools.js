import express from "express";
const router = express.Router();

import { checkAuthenticated } from "../authMiddleware.js";
import { getVolumePage, patchVolume } from "../controller/toolController.js";

router.get("/volume", checkAuthenticated, getVolumePage);
router.patch("/volume", checkAuthenticated, patchVolume);

export default router;
