const {Router} = require('express');
const {validationResult} = require('express-validator/check')
const Game = require('../models/game');
const auth = require('../middleware/auth')
const {gameValidators} = require('../utils/validators')
const router = Router();

router.get('/', auth, (req, res) => {
    //res.status(200)
    //res.sendFile(path.join(__dirname, 'template', 'about.html'))
    res.render('add', {
        title: 'Add game',
        isAdd: true
    })
});

router.post('/', auth, gameValidators, async (req, res) => {
	//console.log(req.body)    
	const errors = validationResult(req)

	if(!errors.isEmpty()) {
		return res.status(422).render('add', {
			title: 'Add game',
			isAdd: true,
			error: errors.array()[0].msg,
			data: {
				title: req.body.title,
				price: req.body.price,
				img: req.body.img
			}
		})
	}
	
	//? в req.body хранятся все данные которые приходят с input (ключ это значение атрибута name тега input )
	const game = new Game({
		title: req.body.title,
		price: req.body.price,
		img: req.body.img,
		userId: req.user
	});

	try{
		await game.save()
		res.redirect('/games')
	} catch (e) {
		console.log(e)
	}
});

module.exports = router;