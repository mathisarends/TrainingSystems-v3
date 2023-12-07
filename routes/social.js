import express from "express";
const router = express.Router();
import User from "../models/user.js";

router.get("/", async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).send("Benutzer nicht gefunden");
  }

  res.render("social/index");
});

router.get("/add", async (req, res) => {});

export default router;
