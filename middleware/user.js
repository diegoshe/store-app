const User = require('../models/user')


//переделываем данные user чтобы засунуть его в session
module.exports = async function(req, res, next) {
    if (!req.session.user) {
        return next()
    }
    req.user = await User.findById(req.session.user._id)   //? складываем в user новую модель user
    next()
}