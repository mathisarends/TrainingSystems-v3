const express = require("express");
const Router = express.Router();
const { checkAuthenticated, checkNotAuthenticated } = require("../authMiddleware");
const User = require("../models/user");

Router.get("/", checkAuthenticated, (req, res) => {
    res.render("account/index", {});
})

module.exports = Router;