const { Router } = require('express')
const { validationResult } = require('express-validator')
const Game = require('../models/game')
const auth = require('../middleware/auth')
const { gameValidators } = require('../utils/validators')
const router = Router()

function isOwner(game, req) {
    return game.userId.toString() === req.user._id.toString()
}

router.get('/', async (req, res) => {
    try {
        const games = await Game.find()
            .populate('userId', 'email name')
            .select('price title img')

        res.render('games', {
            title: 'Games',
            isGames: true,
            userId: req.user ? req.user._id.toString() : null,
            games
        })
    } catch (err) {
        console.log(err)
    }

})

router.get('/:id/edit', auth, async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/')
    }

    try {
        const game = await Game.findById(req.params.id)

        if (!isOwner(game, req)) {
            return res.redirect('/games')
        }

        res.render('game-edit', {
            title: `Edit ${game.title}`,
            game
        })
    } catch (err) {
        console.log(err)
    }
})

router.post('/edit', auth, gameValidators, async (req, res) => {
    const errors = validationResult(req)
    const { id } = req.body

    if (!errors.isEmpty()) {
        return res.status(422).redirect(`/games/${id}/edit?allow=true`)
    }

    try {
        delete req.body.id
        const game = await Game.findById(id)
        if (!isOwner(game, req)) {
            return res.redirect('/games')
        }
        Object.assign(game, req.body)
        await game.save()
        res.redirect('/games')
    } catch (err) {
        console.log(err)
    }
})

router.post('/remove', auth, async (req, res) => {
    try {
        await Game.deleteOne({
            _id: req.body.id,
            userId: req.user._id
        })
        res.redirect('/games')
    } catch (e) {
        console.log(e)
    }
})

router.get('/:id', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id)
        res.render('game', {
            layout: 'empty',
            title: `Game ${game.title}`,
            game
        })
    } catch (err) {
        console.log(err)
    }
})

module.exports = router