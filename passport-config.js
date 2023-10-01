import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import User from "./models/user.js";

export function initialize(passport) {
    const authenticateUser = async (username, password, done) => {
      try {
        const user = await User.findOne({ $or: [{ name: username }, { email: username }] });
        if (!user) {
          return done(null, false, { message: "No user with that name or email" });
        }
  
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (isPasswordValid) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Password incorrect" });
        }
      } catch (err) {
        return done(err);
      }
    }
  
    passport.use(new LocalStrategy({ usernameField: "username" }, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
      try {
        const user = await User.findById(id);
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    });
  }
  
  export function customLoginMiddleware(passport) {
    return (req, res, next) => {
      passport.authenticate("local", (err, user, info) => {
        if (err) {
            // Fehler während der Anmeldung
            return res.status(500).json({ success: false, message: "Anmeldefehler" });
        }
        
        if (!user) {
          // Anmeldung fehlgeschlagen
          return res.status(401).json({ success: false});
        }
  
        // Anmeldung erfolgreich
        req.logIn(user, (err) => {
          if (err) {
            return res.status(500).json({ success: false});
          }
          return res.status(200).json({ success: true, message: "Anmeldung erfolgreich" });
        });
      })(req, res, next);
    };
  }