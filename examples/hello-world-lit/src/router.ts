import { Router, type Transition } from 'slick-router'
import { events } from 'slick-router/middlewares/events.js'
import {
  AnimatedOutlet,
  setDefaultAnimation,
  AnimateCSS,
} from 'slick-router/components/animated-outlet.js'

import './pages/application'
import './pages/home'
import './pages/messages'
import './pages/profile'
import './pages/profile-index'

setDefaultAnimation(AnimateCSS, { enter: 'rotateInDownRight', leave: 'hinge' })

customElements.define('router-outlet', AnimatedOutlet)

// create the router
export const router = new Router({
  log: true,
  outlet: 'router-outlet',
})

// provide your route map
// in this particular case we configure components by its tag name

router.map((route) => {
  route('home', { path: '', component: 'home-view' })
  route('messages', { component: 'messages-view' })
  route('status', { path: ':user/status/:id' })
  route('profile', { path: ':user', component: 'profile-view' }, () => {
    route('profile.index', { path: '', component: 'profile-index-view' })
    route('profile.lists')
    route('profile.edit')
  })
})

// install middleware that will trigger events
router.use(events)

window.addEventListener('router-transition', function (e) {
  console.log('router.transition', e.detail.transition.pathname)
})

declare global {
  interface HTMLElementTagNameMap {
    'router-outlet': AnimatedOutlet
  }

  interface WindowEventMap {
    'router-transition': CustomEvent<{ transition: Transition }>
  }
}
