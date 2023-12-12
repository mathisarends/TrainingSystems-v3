import express from "express";
const router = express.Router();
import User from "../models/user.js";
import Friend from "../models/friend.js";
import Friendship from "../models/friendShip.js";
import { checkAuthenticated } from "../authMiddleware.js";

router.get("/", checkAuthenticated, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).send("Benutzer nicht gefunden");
  }
  const username = user.name;

  const befriendedUsers = await Friendship.find({ user: user._id });
  const friendIds = befriendedUsers.map(befriendedUser => befriendedUser.friend);

  // Finde alle Benutzer außer dem aktuellen Benutzer und den Freunden
  const otherUsers = await User.find({ _id: { $ne: user._id, $nin: friendIds } });

  const acceptedFriendRequests = await Friendship.find({ user: user._id, status: "accepted" }).populate("friend");

  const friends = acceptedFriendRequests.map(acceptedFriend => {
    return {
      name: acceptedFriend.friend.name, // Hier nimm das entsprechende Attribut für den Namen
      friendSince: formatDate(acceptedFriend.friendSince) // Hier wird ein Funktion "formatDate" verwendet
    };
  });

  const pendingFriendRequests = await Friendship.find({
    user: user._id,
    status: { $in: ["pending", "sent"] }
  }).populate("friend");

  const pendingFriends = pendingFriendRequests.map(pendingFriend => {
    return {
      name: pendingFriend.friend.name,
      requestSent: formatDate(pendingFriend.friendSince),
      status: pendingFriend.status // either pending or sent
    };
  });

  console.log(friends);
  console.log(pendingFriends);

  res.render("social/index", {
    username,
    otherUsers, // the userbase in general
    friends, // establishedFriendships
    pendingFriends // pending friendships
  });
});

router.post("/add", checkAuthenticated, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).send("Benutzer nicht gefunden");
  }

  console.log("Hey, wir sind in der Route");

  const addedUserId = req.body.addedUserId;
  const addedUser = await User.findById(addedUserId);

  if (!addedUser) {
    return res.status(404).send("Hinzugefügter Benutzer nicht gefunden");
  }

  const friendshipData = {
    user: user._id,
    friend: addedUser._id,
    status: "sent"
  };

  const newFriendship = new Friendship(friendshipData);

  newFriendship
    .save()
    .then(result => {
      console.log("Freundschaftsanfrage gesendet!");
      res.status(200).send({ message: "Freundschaftsanfrage gesendet!" });
    })
    .catch(err => {
      if (err.code === 11000) {
        // Eindeutigkeitsverletzung, es gibt bereits eine Freundschaft zwischen den Benutzern
        console.error("Eindeutigkeitsverletzung: Freundschaft existiert bereits");
        res.status(400).send("Du bist bereits mit diesem Benutzer befreundet.");
      } else {
        console.error("Fehler beim Senden der Freundschaftsanfrage", err);
        res.status(500).send("Interner Serverfehler");
      }
    });
});

export default router;

// Funktion zum Formatieren des Datums
function formatDate(date) {
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  return new Date(date).toLocaleDateString("de-DE", options);
}
