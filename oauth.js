import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import standartExerciseCatalog from "./models/standartExerciseCatalog.js";
import templateTrainingGenerator from "./models/templateTrainingGenerator.js";
import User from "./models/user.js";

// use environment variables instead
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL}/google/callback`,
    passReqToCallback: true
  },
  async function(request, accessToken, refreshToken, profile, done) {

    let newUser;

    try {
      // Suchen nach einem Benutzer mit der Google ID
      const existingUser = await User.findOne({ googleId: profile.id });
      
      if (existingUser) {
        // Benutzer gefunden, gebe ihn zurück
        return done(null, existingUser);
      } else {
        // Benutzer nicht gefunden, erstelle einen neuen Benutzer
        newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.email,
          exercises: standartExerciseCatalog,
          // ... Weitere Felder
        });

        // Speichern des neuen Benutzers in der Datenbank
        await newUser.save();

        newUser.trainingPlanTemplate = [
          templateTrainingGenerator.createTemplatePlanA(newUser._id),
          templateTrainingGenerator.createTemplatePlanB(newUser._id)
        ];

        await newUser.save();
        
        return done(null, newUser);
      }
    } catch (err) {
      console.error("Fehler bei Google-Authentifizierung:", err);

      // Lösche den neu erstellten Benutzer, wenn ein Fehler auftritt
      if (newUser) {
        await User.deleteOne({ _id: newUser._id });
      }

      return done(err, null);
    }
  }
));

//bin mir nicht sicher ob ich die hier brauche todo: 
passport.serializeUser(function(user, done) {
    done(null, user);
})

passport.deserializeUser(function(user, done) {
    done(null, user);
})