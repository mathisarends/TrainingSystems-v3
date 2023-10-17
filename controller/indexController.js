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

export async function setColorTheme(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status-(404).send("Benutzer nicht gefunden!");
    }

    const colorTheme = req.body.colorTheme;

    user.colorTheme = colorTheme;
    await user.save();

  } catch (error) {
    console.log("Fehler beim patchen des themes aufgetreten", err);
  }
}