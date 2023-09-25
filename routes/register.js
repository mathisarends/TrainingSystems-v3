import express from "express";
const router = express.Router();

import { getConfigPage, getRegisterIndex, handleRegisterPost, postConfigPage } from "../controller/registerController.js";

router.get("/", getRegisterIndex);
router.post("/", handleRegisterPost );

// this page comes after the registration in order to make further
// configuartions regarding the accout, may be skipped by user
router.get("/config", getConfigPage);
router.post("/config", postConfigPage);

export default router;