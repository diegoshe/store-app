const {Schema, model} = require ('mongoose')

const userSchema = new Schema ({
    email: {
        type: String,
        required: true
    },
    name: String,
    password: {
        type: String,
        required:true
    },
    avatarUrl: String,
    resetToken: String,
    resetTokenExp: Date,
    cart: {
        items: [
            {
                count: {
                    type: Number,
                    required: true,
                    default: 1
                },
                gameId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Game',
                    required: true
                }
            }
        ]
    } 
})

userSchema.methods.addToCart = function(game) {        //? очень важно здесь использовать слово function т.к. будем использовать this
    const items = [...this.cart.items]
    const idx = items.findIndex(g => {
        return g.gameId.toString() === game._id.toString() //? обязательно при сравнении toString если задан тип type: Schema.Types.ObjectId
    })
//если idx = -1 тогда добовляем игру
    if (idx >= 0) {
        items[idx].count = items[idx].count + 1
    } else {
        items.push({
            gameId: game._id,
            count: 1
        })
    }
    // const newCart = {items: items}
    // this. cart = newCart
    //или
    this.cart = {items}
    return this.save()
}

userSchema.methods.removeFromCart = function(id) {
    let items = [...this.cart.items]
    const idx = items.findIndex(g => g.gameId.toString() === id.toString())

    if(items[idx].count === 1) {
        items = items.filter(g => g.gameId.toString() !== id.toString())
    } else {
        items[idx].count--
    }

    this.cart = {items}
    return this.save()
}

userSchema.methods.clearCart = function(){
    this.cart = {items: []}
    return this.save()
}

module.exports = model('User', userSchema)