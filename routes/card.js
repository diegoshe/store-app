const {Router} = require('express')
const Game = require('../models/game')
const auth = require('../middleware/auth')
const router = Router()

function mapCartItems(cart) {
    return cart.items.map(g => ({        //? возвращаем объект с нужными для нас полями
        ...g.gameId._doc,          //? убираем все ненужные мета-данные
        id: g.gameId.id, 
        count: g.count
    }))
}

function computePrice(games) {              
    return games.reduce((total, game) => {
        return total += game.price * game.count
    }, 0)
}


router.post('/add', auth, async (req, res) => {         //? доб нов курс в корзину
    const game = await Game.findById(req.body.id)
    await req.user.addToCart(game)
    res.redirect('/card')
})

router.delete('/remove/:id', auth, async (req, res) => {    //?удаление из корзины
    await req.user.removeFromCart(req.params.id)        //? .params потомучто берем id из url  params указывает на адрессную строку
    
    const user = await req.user
    .populate('cart.items.gameId')
    .execPopulate()

    const games = mapCartItems(user.cart)
    const cart = {
        games, price: computePrice(games)
    }
    res.status(200).json(cart)
})
//отображение данных в корзине
router.get('/', auth, async (req, res) => {
    const user = await req.user
    .populate('cart.items.gameId')
    .execPopulate()

    const games = mapCartItems(user.cart)

    res.render('card', {
        title: 'Cart',
        isCard: true,
        games: games,
        price: computePrice(games)
    })
})

module.exports = router