function redirectToReferer(req, res, next) {
    const referer = req.header.referer || "/";
    console.log(referer + " testen");
    res.redirect(referer);
}

module.exports = redirectToReferer;