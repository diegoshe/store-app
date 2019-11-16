const { Router } = require('express')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')          // для генерации рандомного ключа, стандартная
const {validationResult} = require('express-validator/check')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const User = require('../models/user')
const keys = require('../keys')
const regEmail = require('../emails/registration')
const resetEmail = require('../emails/reset')
const {registerValidators} = require('../utils/validators')
const router = Router()

const transporter = nodemailer.createTransport(sendgrid({    //? работа с почтой
    auth: {api_key: keys.SENDGRID_API_KEY}
}))

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Authorization',
        isLogin: true,
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError')
    })
})

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {                     //? для очистки данных из бд
        res.redirect('/auth/login#login')
    })
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const candidate = await User.findOne({ email })

        if (candidate) {
            const areSame = await bcrypt.compare(password, candidate.password)  //? compare возвращает промис

            if (areSame) {
                req.session.user = candidate                                           //? добовляем пользователя в сессию
                req.session.isAuthenticated = true
                req.session.save(err => {           //? чтобы redirect не сработал первее получения пользователя
                    if (err) {
                        throw err
                    }
                    res.redirect('/')
                })
            } else {
                req.flash('loginError', 'Wrong password')
                res.redirect('/auth/login#login')
            }
        } else {
            req.flash('loginError', 'User does not exist')
            res.redirect('/auth/login#login')
        }
    } catch (err) {
        console.log(err)
    }

})

router.post('/register', registerValidators, async (req, res) => {
    try {
        const { email, password, name } = req.body
       
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('registerError', errors.array()[0].msg)
            return res.status(422).redirect('/auth/login#register')
        }
            const hashPassword = await bcrypt.hash(password, 10)  //? hash возвращает промис
            const user = new User({
                email, name, password: hashPassword, cart: { items: [] }
            })
            await user.save()
            await transporter.sendMail(regEmail(email))             //? работа с почтой
            res.redirect('/auth/login#login')       
    } catch (err) {
        console.log(err)
    }
})

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Forgot your password?',
        error: req.flash('error')
    })
})

router.get('/password/:token', async (req, res) => {
    if (!req.params.token) {
        return res.redirect('/auth/login')
    }

    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: {$gt: Date.now()}
        })

        if (!user){
            return res.redirect('/auth/login')
        } else {
            res.render('auth/password', {
                title: 'Restore access',
                error: req.flash('error'),
                userId: user._id.toString(),
                token: req.params.token
            })
        }
        // res.render('auth/reset', {                  
        //     title: 'Forgot your password?',
        //     error: req.flash('error')
        // })
    } catch (err) {
        console.log(err)
    }
})

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {           //? генерируем рандомный ключ
            if (err) {
                req.flash('error', 'Something went wrong, try again later')
                return res.redirect('/auth/reset')
            }
            // создаем токен для востановления пароля
            const token = buffer.toString('hex')
            // есть ли такой юзер в системе?
            const candidate = await User.findOne({email: req.body.email}) // сравниваем emailы
            if (candidate) {
                candidate.resetToken = token
                candidate.resetTokenExp = Date.now() + 60*60*1000
                await candidate.save()
                await transporter.sendMail(resetEmail(candidate.email, token))
                res.redirect('/auth/login')
            } else {
                req.flash('error', 'Еthere is no such email')
                return res.redirect('/auth/reset')
            }
        })
    } catch (err) {
        console.log(err)
    }
})

router.post('/password', async (req, res) => {
    try{
        const user = await User.findOne({
            _id: res.body.userId,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        })
        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10)
            user.resetToken = undefined
            user.resetTokenExp= undefined
            await user.save()
            res.redirect('/auth/login')
        } else {
            req.flash('loginError', 'Token expired')
            res.redirect('/auth/login')
        }
    } catch (err) {
        console.log(err)
    }
})
module.exports = router
