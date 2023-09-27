import User from "../../models/user.js";

import { renderTrainingPlansView } from "./sharedFunctionality.js";

export async function getTrainingIndexPage(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send("Benutzer nicht gefunden");
    }

    renderTrainingPlansView(res, user);
  } catch (err) {
    console.log(err);
  }
}









