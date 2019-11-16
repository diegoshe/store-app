const {Router} = require('express')
const router = Router()

router.get('/', (req, res) => {
    //res.status(200)
    //res.sendFile(path.join(__dirname, 'template', 'index.html'))
    //? после подключения express-handlebars достаем страничку вот так
    res.render('index', {
        title: 'Home',
        isHome: true
    })
})

module.exports = router