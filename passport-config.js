import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import User from "./models/user.js";

function initialize(passport) {
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

export default initialize;