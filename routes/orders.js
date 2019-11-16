const { Router } = require('express')
const Order = require('../models/order')
const auth = require('../middleware/auth')
const router = Router()

//получение списка orders
router.get('/', auth, async (req, res) => {
    try{
        const orders = await Order.find({'user.userId': req.user._id})
        .populate('user.userId')
        res.render('orders', {
            isOrder: 'true',
            title: 'Order',
            orders: orders.map(o => {
                return {
                    ...o._doc,
                    price: o.games.reduce((total, c) => {
                        return total += c.count * c.game.price
                    }, 0)
                }
            })
        })
    } catch (err) {
        console.log(err)
    }
    
})

//создание order
router.post('/', auth, async (req, res) => {
    try {
        const user = await req.user
            .populate('cart.items.gameId')
            .execPopulate()

        const games = user.cart.items.map(i => ({
            count: i.count,
            game: { ...i.gameId._doc }
        }))

        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user
            },
            games: games
        })

        await order.save()
        await req.user.clearCart()

        res.redirect('/orders')
    } catch (err) {
        console.log(err)
    }

})

module.exports = router