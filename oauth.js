const dotenv = require('dotenv');
dotenv.config();

const passport = require("passport");
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const User = require("./models/user");

// use environment variables instead
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback: true
  },
  async function(request, accessToken, refreshToken, profile, done) {
    try {
      // Suchen nach einem Benutzer mit der Google ID
      const existingUser = await User.findOne({ googleId: profile.id });
      
      if (existingUser) {
        // Benutzer gefunden, gebe ihn zurück
        return done(null, existingUser);
      } else {
        // Benutzer nicht gefunden, erstelle einen neuen Benutzer
        const newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.email
          // ... Weitere Felder
        });

        // Speichern des neuen Benutzers in der Datenbank
        await newUser.save();
        
        return done(null, newUser);
      }
    } catch (err) {
      console.error("Fehler bei Google-Authentifizierung:", err);
      return done(err, null);
    }
  }
));

passport.serializeUser(function(user, done) {
    done(null, user);
})

passport.deserializeUser(function(user, done) {
    done(null, user);
})