var api = require('./api')
var {
  actionSetFavorite
} = require('./actions')

console.log(api)
module.exports = {
  '/favorite/:favorite': {
    onRequest (u) {
      return api['favorites.getFavorite'](u.params)
    },
    onResponse (value) {
      return { type: actionSetFavorite, value }
    }
  }
}
