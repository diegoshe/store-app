// const path = require('path')
// const fs = require('fs')

// const p = path.join(
//     path.dirname(process.mainModule.filename),
//     'data',
//     'card.json'
// )

// class Card {
//     static async add(game) {
//         const card = await Card.fetch()

//         const idx = card.games.findIndex(g => g.id === game.id)
//         const candidate = card.games[idx]

//         if (candidate) {
//             //игра уже есть
//             candidate.count++
//             card.games[idx] = candidate
//         } else {
//             // нужно добавить игру
//             game.count = 1
//             card.games.push(game)
//         }

//         card.price += +game.price

//         return new Promise((resolve, reject) => {
//             fs.writeFile(p, JSON.stringify(card), err => {
//                 if (err) {
//                     reject(err)
//                 } else {
//                     resolve()
//                 }
//             })
//         })
//     }

//     static async remove(id) {
//         const card = await Card.fetch()

//         const idx = card.games.findIndex(g => g.id === id)
//         const game = card.games[idx]

//         if (game.count === 1) {
//             //удалить
//             card.games = card.games.filter(g => g.id !== id)
//         } else {
//             //изменить ко-во
//             card.games[idx].count--
//         }

//         card.price -= game.price

//         return new Promise((resolve, reject) => {
//             fs.writeFile(p, JSON.stringify(card), err => {
//                 if (err) {
//                     reject(err)
//                 } else {
//                     resolve(card)
//                 }
//             })
//         })

//     }

//     static async fetch() {
//         return new Promise((resolve, reject) => {
//             fs.readFile(p, 'utf-8', (err, content) => {
//                 if (err) {
//                     reject(err)
//                 } else {
//                     resolve(JSON.parse(content))
//                 }
//             })
//         })
//     }
// }


// module.exports = Card