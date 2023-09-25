import express from "express";
const router = express.Router();

import { checkNotAuthenticated } from "../authMiddleware.js";

import { getLoginPage, 
  postLoginPage, 
  getRequestNewPasswordPage,
  postRequestNewPasswordPage,
  getChangePasswordPage,
  setNewPassword,
 } from "../controller/loginController.js";

router.get("/", checkNotAuthenticated, getLoginPage);
router.post("/", postLoginPage);

router.get("/reset", checkNotAuthenticated, getRequestNewPasswordPage);
router.post("/reset", postRequestNewPasswordPage);

router.get("/resetPassword/:token",  getChangePasswordPage);
router.post("/resetPassword", setNewPassword);


export default router;
