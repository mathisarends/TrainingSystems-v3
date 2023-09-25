import express from "express";

import User from "../models/user.js";

const router = express.Router();


router.get("/", async (req, res) => {
  try {
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).send("Benutzer nicht gefunden");
      }
      res.render("index", {
        user: user,
        userID: user.id,
      });
    } else {
      res.render("indexNoAuthentication");
    }
  } catch (err) {
    console.log("Fehler beim Laden der Hauptseite");
    console.log(err);
  }
});

router.get("/welcome", async (req, res) => {

  res.render("indexNoAuthentication");
})

router.get("/offline", async (req, res) => {
  res.render("offline");
})


export default router;


