import User from "../models/user.js";

export async function getIndexPage(req, res) {
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
}

export async function getOfflinePage(req, res) {
    res.render("offline");
}