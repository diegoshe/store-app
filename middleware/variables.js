module.exports = function(req, res, next) {             //? мидлвэир
    res.locals.isAuth = req.session.isAuthenticated
    res.locals.csrf = req.csrfToken()
    next()
}