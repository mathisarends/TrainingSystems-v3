import express from "express";
const router = express.Router();

import { getIndexPage, getOfflinePage } from "../controller/indexController.js";

router.get("/", getIndexPage);
router.get("/offline", getOfflinePage);


export default router;


