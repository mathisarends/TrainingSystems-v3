import express from "express";
const router = express.Router();
import User from "../models/user.js";
import Friend from "../models/friend.js";
import { checkAuthenticated, checkNotAuthenticated } from "../authMiddleware.js";

// middle ware
/* const isLoggedIn = async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).send("Benutzer nicht gefunden");
  }
  req.context.user = user;
  next();
}; */

router.get("/", checkAuthenticated, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).send("Benutzer nicht gefunden");
  }

  const username = user.name;
  const users = await User.find();

  res.render("social/index", {
    username,
    users
  });
});

router.get("/add", checkAuthenticated, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).send("Benutzer nicht gefunden");
  }
});

router.post("/add", checkAuthenticated, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).send("Benutzer nicht gefunden");
  }

  const addedUserId = req.body.addedUserId;

  // user id valid?
  if (!mongoose.Types.ObjectId.isValid(addedUserId)) {
    return res.status(400).send("Ungültige Nutzer-ID");
  }

  const addedUser = await User.findById(addedUserId);

  if (!addedUser) {
    return res.status(404).send("Hinzugefügter Benutzer nicht gefunden");
  }

  const newFriendObj = {
    name: addedUser.name,
    friendSince: new Date()
  };

  // Nutzer müssen sich gegenseitig adden
  user.friendRequestsSent.push(newFriendObj);
  addedUser.friendRequestsPending.push(user);

  await user.save();
  await addedUser.save();

  res.status(200).json({ message: "Freund erfolgreich hinzugefügt!" });
});

export default router;
