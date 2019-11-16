const express = require('express')
const path = require('path')
const csrf = require('csurf')
const flash = require('connect-flash')
const mongoose = require('mongoose')
const helmet = require('helmet')
const compression = require('compression')
const exphbs = require('express-handlebars')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const homeRoutes = require('./routes/home')
const cardRoutes = require('./routes/card')
const addRoutes = require('./routes/add')
const ordersRoutes = require('./routes/orders')
const gamesRoutes = require('./routes/games')
const authRoutes = require('./routes/auth')
const profileRoutes = require('./routes/profile')
const varMiddleware = require('./middleware/variables')
const userMiddleware = require('./middleware/user')
const errorHandler = require('./middleware/error')
const fileMiddleware = require('./middleware/file')
const keys = require('./keys')

const PORT = process.env.PORT || 3000

const app = express()
const hbs = exphbs.create({
    defaultLayout: 'main',           //? в папке layout которую нужно создать, создать файл main.hbs или так как напишешь сдесь
    extname: 'hbs',
    helpers: require('./utils/hbs-helpers')
})
const store = new MongoStore({
    collection: 'session',
    uri: keys.MONGODB_URI
})

app.engine('hbs', hbs.engine)        //? регестрируем в EXPRESS движок handlebars
app.set('view engine', 'hbs')        //? а после мы начинаем его использовать
app.set('views', 'template')         //? указывваем название папки(template) где будут храниться шаблоны
//временный мидлвэир, 
// app.use(async (req, res, next) => {     //next() продолжает цепочку мидолвееров (use)
//     try{
//         const user = await User.findById('5db74781f896691bec1ea284')
//         req.user = user
//         next()
//     } catch (e) {
//         console.log(e)
//     }
// })
app.use(express.static(path.join(__dirname, 'public')))     //? сделали папку public статической(т.е. ввели ее в видимость EXPRESS ) чтобы применились стили 
app.use('/images', express.static(path.join(__dirname, 'images'))) 
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: keys.SESSION_SECRET,              //? строка на основе которой сессия будет шифроваться
    resave: false,
    saveUninitialized: false,
    store: store
}))
app.use(fileMiddleware.single('avatar'))    //? 'avatar' задали поле куда будет слаживаться аватар
app.use(csrf())
app.use(flash())
app.use(helmet())
app.use(compression())
app.use(varMiddleware)
app.use(userMiddleware)

app.use('/', homeRoutes)
app.use('/add', addRoutes)
app.use('/games', gamesRoutes)
app.use('/card', cardRoutes)
app.use('/orders', ordersRoutes)
app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)

app.use(errorHandler)          //подключается в самом конце

async function start() {
    try {
        //const url = `mongodb+srv://andrew:pCJLQyNYA7sgTvTT@cluster0-906ou.mongodb.net/shop`
        await mongoose.connect(keys.MONGODB_URI, {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        })
            // временный пользователь
        // const candidate = await User.findOne()
        // if (!candidate) {
        //     const user = new User({
        //         email: 'belov510@gmail.com',
        //         name: 'Vitaliy',
        //         cart: {items: []}
        //     })
        //     await user.save()
        // }

        app.listen(PORT, () => {
            console.log(`****Server is running on port ${PORT}`)
        })
    } catch (e) {
        console.log('Ошибка', e)
    }
}

start()




