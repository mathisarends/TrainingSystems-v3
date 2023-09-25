export function handleLogout(req, res) {
    req.logout(() => {}); // logout => empty callback
    res.redirect("/login"); // back to login
}