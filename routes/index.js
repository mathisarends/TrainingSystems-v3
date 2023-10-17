import express from "express";
const router = express.Router();

import { getIndexPage, getOfflinePage, setColorTheme } from "../controller/indexController.js";

router.get("/", getIndexPage);
router.get("/offline", getOfflinePage);
router.patch("/setColorTheme", (req, res) => setColorTheme(req, res));


export default router;


