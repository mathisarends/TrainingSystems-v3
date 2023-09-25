import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
    req.logout(() => {}); // logout => empty callback
    res.redirect("/login"); // back to login
});

export default router;