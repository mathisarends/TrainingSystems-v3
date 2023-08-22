// passport-config.js
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("./models/user"); // Passe den Pfad entsprechend an

function initialize(passport) {
    const authenticateUser = async (name, password, done) => {
        try {
            const user = await User.findOne({ name: name });
            if (!user) {
                return done(null, false, { message: "No user with that name" });
            }

            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            if (isPasswordValid) {
                console.log("eingeloggt");
                return done(null, user);
            } else {
                return done(null, false, { message: "Password incorrect" });
            }
        } catch (err) {
            return done(err);
        }
    }

    passport.use(new LocalStrategy({ usernameField: "name" }, authenticateUser));
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

module.exports = initialize;
