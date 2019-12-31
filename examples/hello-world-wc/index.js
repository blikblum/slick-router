import { Router } from 'slick-router'
import { wc } from 'slick-router/middlewares/wc.js'
import { routerLinks } from 'slick-router/middlewares/router-links.js'
import { events } from 'slick-router/middlewares/events.js'
import './components.js'

// create the router
const router = new Router({
  log: true
})

// provide your route map
// in this particular case we configure components by its tag name

router.map((route) => {
  route('application', {path: '/', component: 'application-view'}, () => {
    route('home', {path: '', component: 'home-view'})
    route('messages', {component: 'messages-view'})
    route('status', {path: ':user/status/:id'})
    route('profile', {path: ':user', component: 'profile-view'}, () => {
      route('profile.index', {path: '', component: 'profile-index-view'})
      route('profile.lists')
      route('profile.edit')
    })
  })
})

// install middleware that will handle transitions
router.use(wc)
router.use(routerLinks)
router.use(events)

// start listening to browser's location bar changes
router.listen()

window.addEventListener('router-transition', function (e) {
  console.log('router.transition', e.detail.transition.pathname)
})