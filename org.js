var yo = require('yo-yo')
var xtend = require('xtend')
var { actionSetFavorite } = require('./actions')

function favs (fs, actionsUp) {
  return yo`
    <ul>
      ${fs.map(f => yo`
        <li>
          <a
            href="/favorite/${f}"
         >
            ${f}
          </a>
        </li>
      `)}
    </ul>
  `
}

module.exports = {
  init () {
    return {
      model: {
        me: {
          name: 'Yasako',
          favorites: [
            'foo', 'bar', 'fuba'
          ]
        },
        pickup: ''
      }
    }
  },
  update (model, action) {
    if (action.type === actionSetFavorite) {
      return { model: xtend(model, { pickup: action.value }) }
    }
    return { model }
  },
  run (effect, sources) {},
  routes: {
    '/' (u, model, actionsUp) {
      return yo`
        <section>
          <header>
            <h1>home</h1>
          </header>
          <section>
            <p>i am <strong>${model.me.name}</strong></p>
            <h2>favorites</h2>
            ${favs(model.me.favorites, actionsUp)}
          </section>
        </section>
      `
    },
    '/favorite/:favorite' (u, model, actionsUp) {
      return yo`
        <section>
          <header>
            <h1>favorite</h1>
            <p>${model.pickup}</p>
          </header>
          <section>
            <h2>favorites</h2>
            ${favs(model.me.favorites, actionsUp)}
          </section>
          <footer>
            <p>
              <a href="/">home</a>
            </p>
          </footer>
        </section>
      `
    }
  }
}
