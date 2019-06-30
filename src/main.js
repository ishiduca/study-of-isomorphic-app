var yo = require('yo-yo')
var document = require('global/document')
var { start } = require('@ishiduca/snoopy')
var multi = require('@ishiduca/snoopy-multi')
var bindRoutes = require('../lib/bind-routes')
var org = require('../org')
var links = require('../links')
var app = multi(bindRoutes(org, { links }))
// var app = multi(bindRoutes(org))
var { views, models, actions } = start(app)
var root = document.body.firstElementChild

actions().on('data', action => console.log(action))
models().on('data', model => console.log(model))
views().on('data', el => {
  var rt = document.createElement(root.tagName)
  rt.appendChild(el)
  yo.update(root, rt)
})
