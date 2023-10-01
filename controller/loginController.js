import User from "../models/user.js";
import jwt from "jsonwebtoken";
import passport from "passport";
import transporter from "../mailerConfig.js";
import { customLoginMiddleware } from "../passport-config.js";

export function getLoginPage(req, res) {
  res.render("login/index", { layout: false });
}

// uses passport middleware
export function postLoginPage(req, res, next) {
/*   passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next); */
  customLoginMiddleware(passport)(req, res, next);
}

export function getRequestNewPasswordPage(req, res) {
  res.render("login/reset", { layout: false, errorNotification: "" });
}

export async function postRequestNewPasswordPage(req, res) {
  const emailReceived = req.body.email;

  try {
    const user = await User.findOne({ email: emailReceived });

    if (!user) {
      res.render("login/reset", {
        layout: false,
        errorNotification: "There is no user with that E-Mail",
      });
      return;
    }

    const generatedToken = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "10m",
    });

    user.resetToken = generatedToken;
    user.resetTokenExpiration = Date.now() + 10 * 60 * 1000; //10 minute timeframe
    await user.save();

    const mailOptions = {
      //still not tested in prod environment
      from: "imreavy@gmail.com",
      to: user.email,
      subject: "Passwort zurücksetzen",
      text: `Klicke auf den folgenden Link um dein Passwort zurückzusetzen: ${process.env.BASE_URL}/login/resetPassword/${generatedToken}`,
      // optional: send a basic html page per email
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Fehler beim Versenden der E-mail: " + error);
        res.render("login/reset", {
          layout: false,
          errorNotification: "Fehler beim Versenden der E-Mail",
        });
      } else {
        console.log("Email wurde erfolgreich versendet: " + info.response);
        res.render("login/reset", {
          layout: false,
          errorNotification: "Die Email wurde erfolgreich versandt!",
        });
      }
    });
  } catch (err) {
    console.log(
      "Es ist ein Fehler beim zurücksetzen des Passwortes aufgetreten!"
    );
    console.error(err);
  }
}

export async function getChangePasswordPage(req, res) {
  try {
    const token = req.params.token;
    const decodedToken = jwt.verify(token, jwtSecret);

    const user = await User.findById(decodedToken.userId);

    if (!user) {
      res.render("login/resetPassword", {
        layout: false,
        errorNotification: "Benutzer nicht gefunden",
      });
      return;
    } else {
      // render the page to reset the password;
      res.render("login/resetPassword", {
        layout: false,
        token: token,
        errorNotification: "",
      });
    }
  } catch (err) {
    console.error(err);
    res.render("login/reset", {
      layout: false,
      errorNotification:
        "Ungültiger Token oder anderer Fehler. Starte einen neuen Versuch!",
    });
  }
}

export async function setNewPassword(req, res) {
  try {
    const token = req.body.token;

    const decodedToken = jwt.verify(token, jwtSecret);

    const user = await User.findById(decodedToken.userId);

    if (!user) {
      res.render("login/resetPassword", {
        layout: false,
        errorNotification: "Benutzer nicht gefunden",
      });
      return;
    }

    const newPassword = req.body.password;
    const newPasswordHashed = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newPasswordHashed;
    
    // reset the token and expiration dates
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.render("login/resetPassword", {
      layout: false,
      errorNotification:
        "Ungültiger Token oder anderer Fehler. Starte einen neuen Versuch!",
    });
  }
}
