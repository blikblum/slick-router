const { Router } = require('slick-router')
const getHandler = require('./handler')

// create the router
const router = window.router = new Router({
  log: true
})

// define the route map
router.map(function (route) {
  route('application', { path: '/', abstract: true }, function () {
    route('home', { path: '' })
    route('about')
    route('faq')
    route('posts', { abstract: true }, function () {
      route('posts.index', { path: '' })
      route('posts.popular')
      route('posts.search', { path: 'search/:query' })
      route('posts.show', { path: ':id' })
    })
  })
})

// implement a set of middleware

// load and attach route handlers
// this can load handlers dynamically (TODO)
router.use(function loadHandlers (transition) {
  transition.routes.forEach(function (route, i) {
    const handler = getHandler(route.name)
    handler.name = route.name
    handler.router = router
    const parentRoute = transition.routes[i - 1]
    if (parentRoute) {
      handler.parent = parentRoute.handler
    }
    route.handler = handler
  })
})

// willTransition hook
router.use(function willTransition (transition) {
  transition.prev.routes.forEach(function (route) {
    route.handler.willTransition && route.handler.willTransition(transition)
  })
})

// deactive up old routes
// they also get a chance to abort the transition (TODO)
router.use(function deactivateHook (transition) {
  transition.prev.routes.forEach(function (route) {
    route.handler.deactivate()
  })
})

// model hook
// with the loading hook (TODO)
router.use(function modelHook (transition) {
  let prevContext = Promise.resolve()
  return Promise.all(transition.routes.map(function (route) {
    prevContext = Promise.resolve(route.handler.model(transition.params, prevContext, transition))
    return prevContext
  }))
})

// activate hook
// which only reactives routes starting at the match point (TODO)
router.use(function activateHook (transition, contexts) {
  transition.routes.forEach(function (route, i) {
    route.handler.activate(contexts[i])
  })
})

// start the routing
router.listen()
