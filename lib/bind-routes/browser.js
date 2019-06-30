var window = require('global/window')
var document = require('global/document')
var xtend = require('xtend')
var routington = require('routington')
var href = require('nanohref')
var { through, pipe } = require('mississippi')

module.exports = function bindRoutes (org, _opt) {
  if (!org.routes) return org

  var opt = xtend({ notFound: _notFound }, _opt)
  var router = routington()
  var linksRouter = routington()
  var dummy = {}
  var render = m => (null)
  var actionOnChangeRoutes = Symbol('routes.actionOnChangeRoutes')
  var effectRoutesInitType = Symbol('routes.effectRoutesInit')
  var effectRoutesInit = { type: effectRoutesInitType }
  Object.keys(org.routes).map(route => {
    var node = router.define(route)[0]
    node.handler = org.routes[route].bind(org)
  })

  if (opt.links) {
    Object.keys(opt.links).map(route => {
      var node = linksRouter.define(route)[0]
      node.handlers = opt.links[route]
    })
  }

  var u = new URL(window.location)
  changeRenderFunc(u, router.match(u.pathname))

  return xtend(org, { init, update, view, run })

  function init () {
    var state = org.init()
    var model = state.model
    var effect = (
      state.effect
        ? [].concat(state.effect).concat(effectRoutesInit)
        : effectRoutesInit
    )
    return { model, effect }
  }

  function update (model, action) {
    if (action.type === actionOnChangeRoutes) {
      return { model: xtend(model) }
    }
    return org.update(model, action)
  }

  function run (effect, sources) {
    if (effect.type === effectRoutesInitType) {
      var s = through.obj()
      href(node => {
        changeRenderFunc(node, router.match(node.pathname))
        window.history.pushState(dummy, '', node.pathname)
        s.write({ type: actionOnChangeRoutes, value: node })

        onLinks(node, s)
      })

      window.onpopstate = e => {
        var u = new URL(window.location)
        changeRenderFunc(u, router.match(u.pathname))
        s.write({ type: actionOnChangeRoutes, value: u })

        onLinks(u, s)
      }

      onLinks(new URL(window.location), s)

      return s
    }

    return org.run && org.run(effect, sources)

//    function onLinks (u, s) {
//      if (!opt.links) return
//
//      var lsm = linksRouter.match(u.pathname)
//      if (lsm == null) return
//
//      var handlers = lsm.node.handlers
//      pipe(
//        handlers.onRequest(_url(u, lsm.param)),
//        through.obj((value, _, done) => {
//          s.write(handlers.onResponse(value))
//          done()
//        }),
//        onEnd
//      )
//
//      function onEnd (err) {
//        if (err) {
//          console.error(err)
//          return s.write({ type: 'error', value: err })
//        }
//      }
//    }
  }

  function view (model, actionsUp) {
    return render(model, actionsUp)
  }

  function onLinks (u, s) {
    if (!opt.links) return

    var lsm = linksRouter.match(u.pathname)
    if (lsm == null) return

    var handlers = lsm.node.handlers
    pipe(
      handlers.onRequest(_url(u, lsm.param)),
      through.obj((value, _, done) => {
        s.write(handlers.onResponse(value))
        done()
      }),
      onEnd
    )

    function onEnd (err) {
      if (err) {
        console.error(err)
        return s.write({ type: 'error', value: err })
      }
    }
  }

  function changeRenderFunc (uri, match) {
    render = (model, actionsUp) => (
      match == null
        ? opt.notFound(_url(uri, null), model, actionsUp)
        : match.node.handler(_url(uri, match.param), model, actionsUp)
    )
  }

  function _url (o, params) {
    o.params = params
    return o
  }
}

function _notFound (u) {
  var s = document.createElement('section')
  var p = document.createElement('p')
  var msg = `not found "${u.pathname}" :(`
  p.innerText = msg
  s.appendChild(p)
  return s
}
