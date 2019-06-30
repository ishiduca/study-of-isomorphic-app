var { through } = require('mississippi')

module.exports = {
  'favorites.getFavorite' (params) {
    var src = through.obj()
    process.nextTick(() => src.end(params.favorite))
    return src
  }
}
