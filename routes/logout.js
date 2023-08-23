// Beispiel Logout-Route
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    req.logout(() => {}); // logout => empty callback
    res.redirect("/login"); // back to login
});

module.exports = router;