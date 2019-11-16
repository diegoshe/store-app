const {Schema, model} = require('mongoose')

const gameSchema = new Schema({
	title: {
		type: String,
		required: true                //нужное поле , чтобы не было ошибки
	},
	price: {
		type: Number,
		required: true
	},
	img: String,
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	}
})

//? трансформация данных к клиенту; замена id

gameSchema.method('toClient', function() {    
	const game = this.toObject()

	game.id = game._id
	delete game._id
	return game
})

module.exports = model('Game', gameSchema)