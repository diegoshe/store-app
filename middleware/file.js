const multer = require('multer')

//куда и как определять файл(картинку) который загр. на сервер
const storage = multer.diskStorage({
    destination(req, file, cb) {        //куда слаживать файл(1ый-ошибка, 2ой-путь до папки)
        cb(null, 'images')
    },
    filename (req, file, cb) {          //как назвать файл уникально
        cb(null, file.originalname)
    }
})

//`${new Date().toISOString()}-file.originalname`
const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg']

//некий валидатор для файлов
const fileFilter = (req, file, cb) => {
    if(allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

//готовый и настроенный middleware
module.exports = multer({
    storage,fileFilter
})