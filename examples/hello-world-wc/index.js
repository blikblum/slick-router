import Router from 'slick-router'
import './components.js'

// create the router
const router = new Router({
  log: true
})

// provide your route map
// in this particular case we configure components by its tag name

router.map((route) => {
  route('application', {path: '/', component: 'application-view', abstract: true}, () => {
    route('home', {path: '', component: 'home-view'})
    route('messages', {component: 'messages-view'})
    route('status', {path: ':user/status/:id'})
    route('profile', {path: ':user', component: 'profile-view', abstract: true}, () => {
      route('profile.index', {path: '', component: 'profile-index-view'})
      route('profile.lists')
      route('profile.edit')
    })
  })
})

const elMap = {}

// install middleware that will handle transitions
router.use(function render (transition) {
  transition.routes.forEach((route, i) => {
    const tagName = route.options.component
    router.log(`Transition #${transition.id} rendering '${route.name}'`)
    const el = document.createElement(tagName)
    el.router = router
    el.routeParams = transition.params
    elMap[route.name] = el
    if (tagName) {
      const parent = transition.routes[i - 1]
      const parentEl = parent && elMap[parent.name]
      const container = parent ? parentEl && parentEl.querySelector('.Container') : document.body
      if (container) {
        container.innerHTML = ''
        container.appendChild(el)
      }
    }
  })
})

// start listening to browser's location bar changes
router.listen()
