const toCurrency = price => {
    return new Intl.NumberFormat('ru-RU', {
        currency: 'usd',
        style: 'currency'
    }).format(price)
}

const toDate = date => {
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(new Date(date))
}

document.querySelectorAll('.price').forEach(node => {
    node.textContent = toCurrency(node.textContent)
})

document.querySelectorAll('.date').forEach(node => {
    node.textContent = toDate(node.textContent)
})

const $card = document.querySelector('#card')                 //? выясняем есть ли div с id=card
if ($card) {
    $card.addEventListener('click', event => {
        if (event.target.classList.contains('js-remove')) {
            const id = event.target.dataset.id                  //? получаем id того элемента по которому кликнули
            const csrf = event.target.dataset.csrf

            // удаление курса в корзине с помощью AJAX
            fetch('/card/remove/' + id, {
                method: 'delete',
                headers: {'X-XSRF-TOKEN': csrf},
            }).then(res => res.json())
                .then(card => {
                    if (card.games.length) {
                        const html = card.games.map(g => {
                            return `
                            <tr>
                                <td>${g.title}</td>
                                <td>${g.count}</td>
                                <td>
                                    <button class="btn btn-small js-remove" data-id="${g.id}">Delete</button>
                                </td>
                            </tr>
                            `
                        }).join('')
                        $card.querySelector('tbody').innerHTML = html
                        $card.querySelector('.price').textContent = toCurrency(card.price)
                    } else {
                        $card.innerHTML = '<p>Cart is empty</p>'
                    }
                })
        }
    })
}

//подключение стилей с materializecss
M.Tabs.init(document.querySelectorAll('.tabs'))  //? класс div в который обернуты sign in и ...