// Beispiel Logout-Route
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    req.logout(() => {}); // Benutzer aus der Sitzung ausloggen - llerer callback
    res.redirect("/login"); // Zurück zur Login-Seite leiten
});

module.exports = router;