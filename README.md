# Slick Router

Slick Router is a powerful, flexible router that translates URL changes into route transitions allowing to put the application into a desired state. It is derived from [cherrytree](https://github.com/QubitProducts/cherrytree) library (see [differences](docs/versions-differences.md)).

## Features

- Out of the box support for Web Components:
  - Streamlined support for code spliting and lazy loading
  - Expose route state (query, params) to components
  - Property hooks to map global state to component props
  - Declarative handling of router links
- Can nest routes allowing to create nested UI and/or state
- Route transition is a first class citizen - abort, pause, resume, retry
- Generate links in a systematic way, e.g. `router.generate('commit', {sha: '1e2760'})`
- Use pushState or hashchange for URL change detection
- Define path dynamic segments
- Trigger router navigate programatically
- With builtin middlewares/components:
  - components/animated-outlet: enable animation on route transitions
  - components/router-links: handle route related links state
  - middlewares/wc: advanced Web Component rendering and lifecycle (included in default export)
  - middlewares/router-links: handle route related links state (included in default export)
  - middlewares/events: fires route events on window

## Installation

The default export (including web component support and routerLinks) is 17kb. The core Router class is ~12kB minified (without gzip compression). AnimatedOutlet web component, which can be used independent from the router, has a 2.5kb size.
See [webpack test project](examples/tree-shaking) for more results.

    $ npm install --save slick-router

## Docs

- [Intro Guide](docs/intro.md)
- [Router Configuration](docs/router-configuration.md)
- [Programmatic Navigation and Link Handling](docs/programmatic-navigation-and-link.md)
- [Route Transition](docs/route-transition.md)
- [Common Situations](docs/common-situations.md)
- [Changelog](CHANGELOG.md)

## Builtin middlewares

- [wc](docs/middlewares/wc.md) (advanced Web Component rendering and lifecycle)
- [routerLinks](docs/middlewares/routerlinks.md) (handle route related links state)
- [events](docs/middlewares/events.md) (fires route events on window)

## Builtin components

- [animated-outlet](docs/components/animated-outlet.md) (enable animation on route transitions)
- [router-links](docs/middlewares/routerlinks.md) (handle route related links state)

## Usage

### With Web Components

The default Router class comes with Web Components and router links support.

```js
import { Router } from 'slick-router'

function checkAuth(transition) {
  if (!!localStorage.getItem('token')) {
    transition.redirectTo('login')
  }
}

// route tree definition
const routes = function (route) {
  route('application', { path: '/', component: 'my-app' }, function () {
    route('feed', { path: '' })
    route('messages')
    route('status', { path: ':user/status/:id' })
    route('profile', { path: ':user', beforeEnter: checkAuth }, function () {
      route('profile.lists', { component: 'profile-lists' })
      route('profile.edit', { component: 'profile-edit' })
    })
  })
}

// create the router
var router = new Router({
  routes,
})

// start listening to URL changes
router.listen()
```

### Custom middlewares

Is possible to create a router with customized behavior by using the core Router with middlewares.

Check how to create middlewares in the [Router Configuration Guide](docs/router-configuration.md).

```js
import { Router } from 'slick-router/core.js'

// create a router similar to page.js - https://github.com/visionmedia/page.js

const user = {
  list() {},
  async load() {},
  show() {},
  edit() {},
}

const routes = [
  {
    name: 'users',
    path: '/',
    handler: user.list,
  },
  {
    name: 'user.show',
    path: '/user/:id/edit',
    handler: [user.load, user.show],
  },
  ,
  {
    name: 'user.edit',
    path: '/user/:id/edit',
    handler: [user.load, user.edit],
  },
]

const router = new Router({ routes })

function normalizeHandlers(handlers) {
  return Array.isArray(handlers) ? handlers : [handlers]
}

router.use(async function (transition) {
  for (const route of transition.routes) {
    const handlers = normalizeHandlers(route.options.handler)
    for (const handler of handlers) {
      await handler(transition)
    }
  }
})

// protect private routes
router.use(function privateHandler(transition) {
  if (transition.routes.some((route) => route.options.private)) {
    if (!userLogged()) {
      transition.cancel()
    }
  }
})

// for error logging attach a catch handler to transition promise...
router.use(function errorHandler(transition) {
  transition.catch(function (err) {
    if (err.type !== 'TransitionCancelled' && err.type !== 'TransitionRedirected') {
      console.error(err.stack)
    }
  })
})

// ...or use the error hook
router.use({
  error: function (transition, err) {
    if (err.type !== 'TransitionCancelled' && err.type !== 'TransitionRedirected') {
      console.error(err.stack)
    }
  },
})

// start listening to URL changes
router.listen()
```

## Examples

- [lit-element-mobx-realworld](https://github.com/blikblum/lit-element-mobx-realworld-example-app) A complete app that uses router advanced features. [Live demo](https://blikblum.github.io/lit-element-mobx-realworld-example-app)

You can also clone this repo and run the `examples` locally:

- [hello-world-jquery](examples/hello-world-jquery) - minimal example with good old jquery
- [hello-world-wc](examples/hello-world-wc) - minimal example with Web Component (no build required)
- [vanilla-blog](examples/vanilla-blog) - a small static demo of blog like app that uses no framework

## Browser Support

Slick Router works in all modern browsers. No IE support.

---

Copyright (c) 2024 Luiz Américo Pereira Câmara

Copyright (c) 2017 Karolis Narkevicius
