/* eslint-disable array-callback-return */
import $ from './nanodom'
import { Router } from '../../lib/router'

export default function TestApp(options) {
  options = options || {}

  // create the router
  const router = (this.router = new Router(options))

  // provide the route map
  router.map(function (route) {
    route('application', { path: '/' }, function () {
      route('about')
      route('faq')
      route('posts', function () {
        route('posts.popular')
        route('posts.filter', { path: 'filter/:filterId' })
        route('posts.show', { path: ':id' })
      })
    })
  })

  const handlers = {}

  handlers.application = {
    // this is a hook for 'performing'
    // actions upon entering this state
    activate: function () {
      this.$view = $(
        '<div class="application" style="margin: 100px; test-align: center; border: 10px solid #333;"></div>',
      )
      this.$view.html('<h1>Slick Router Application</h1><div class="outlet"></div>')
      this.$outlet = this.$view.find('.outlet')
      this.$outlet.html('Welcome to this application')
      $(document.body).html(this.$view)
    },
  }

  handlers.about = {
    activate: function () {
      this.parent.$outlet.html('This is about page')
    },
  }

  handlers.faq = {
    activate: function (params, query) {
      this.parent.$outlet.html('FAQ. Sorted By: ' + query.sortBy)
    },
  }

  handlers.posts = {
    activate: function () {},
  }

  handlers['posts.filter'] = {
    activate: function (params) {
      if (params.filterId === 'mine') {
        this.parent.parent.$outlet.html('My posts...')
      } else {
        this.parent.parent.$outlet.html('Filter not found')
      }
    },
  }

  router.use((transition) => {
    transition.routes.forEach((route, i) => {
      const handler = handlers[route.name]
      const parentRoute = transition.routes[i - 1]
      handler.parent = parentRoute ? handlers[parentRoute.name] : null
      handler.activate(transition.params, transition.query)
    })
  })
}

TestApp.prototype.start = function () {
  return this.router.listen()
}

TestApp.prototype.destroy = function () {
  document.body.innerHTML = ''
  return this.router.destroy()
}
