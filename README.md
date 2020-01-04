# Slick Router

Slick Router is a powerful, flexible router that translates URL changes into route transitions allowing to put the application into a desired state. It is derived from [cherrytree](https://github.com/QubitProducts/cherrytree) library (see [differences](docs/versions-differences.md)).

## Features

* can be used with any view and data framework
* can nest routes allowing to create nested UI and/or state
* generate links in a systematic way, e.g. `router.generate('commit', {sha: '1e2760'})`
* use pushState or hashchange for URL change detection
* dynamically load parts of your app during transitions
* dynamic segments, optional params and query params
* support for custom query string parser
* transition is a first class citizen - abort, pause, resume, retry. E.g. pause the transition to display "There are unsaved changes" message if the user clicked some link on the page or used browser's back/forward buttons
* navigate around the app programatically, e.g. `router.transitionTo('commits')`
* easily rename URL segments in a single place (e.g. /account -> /profile)
* link clicks can be intercepted when using pushState without server support


## Installation

The main library size including path-to-regexp dependency is ~15kB minified (without gzip compression).
wc and routerLinks middlewares accounts for 3kb each. See [webpack test project](examples/tree-shaking) for more results.

    $ npm install --save slick-router


## Docs

* [Intro Guide](docs/intro.md)
* [Router Configuration](docs/router-configuration.md)
* [Programmatic Navigation and Link Handling](docs/programmatic-navigation-and-link.md)
* [Route Transition](docs/route-transition.md)
* [Common Situations](docs/common-situations.md)
* [Changelog](CHANGELOG.md)


## Buitins middlewares

 * [wc](docs/middlewares/wc.md) (advanced Web Component rendering and lifecycle)
 * [routerLinks](docs/middlewares/router-links.md) (handle route related links state)
 * [events](docs/middlewares/events.md) (fires route events on window)

## Usage

```js
import { Router } from 'slick-router';

// route tree definition
const routes = function (route) {
  route('application', {path: '/', component: 'my-app'}, function () {
    route('feed', {path: ''})
    route('messages')
    route('status', {path: ':user/status/:id'})
    route('profile', {path: ':user', private: true}, function () {
      route('profile.lists', {component: 'profile-lists'})
      route('profile.edit', {component: 'profile-edit'})
    })
  })
}

// create the router
var router = new Router({
  routes
})

// renders a web component defined through component option
// or using route name suffixed with "-view"
// for advanced features use builtin wc middleware
router.use(async function render (transition) {
  const routes = transition.routes
  for (const route of routes) {
    const parent = routes[routes.indexOf(route) - 1]
    const tagName = route.options.component || `${route.name}-view`
    const el = route.el = document.createElement(tagName)
    const containerEl = parent ? parent.el.querySelector('.outlet') : document.body
    containerEl.appendChild(el)
    // supports lazy rendering e.g. LitElement and SkateJS
    await (el.updateComplete || Promise.resolve())
  }
})

// protect private routes
router.use(function privateHandler (transition) {
  if (transition.routes.some(route => route.options.private)) {
    if (!userLogged()) {
      transition.cancel()
    }
  }
})

// for error logging attach a catch handler to transition promise...
router.use(function errorHandler (transition) {
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
  }
})

// start listening to URL changes
router.listen()
```


## Examples

 * [lit-element-mobx-realworld](https://github.com/blikblum/lit-element-mobx-realworld-example-app) A complete app that uses router advanced features. [Live demo](https://blikblum.github.io/lit-element-mobx-realworld-example-app)

You can also clone this repo and run the `examples` locally:

* [hello-world-jquery](examples/hello-world-jquery) - minimal example with good old jquery
* [hello-world-react](hello-world-react) - minimal example with React
* [hello-world-wc](hello-world-react) - minimal example with Web Component (no build required)
* [vanilla-blog](examples/vanilla-blog) - a small static demo of blog like app that uses no framework

## Browser Support

Slick Router works in all modern browsers. V1 requires es5 environment and es6 promises. Use polyfills for those if you have to support older browsers, e.g.:

* https://github.com/es-shims/es5-shim
* https://github.com/jakearchibald/es6-promise

----

Copyright (c) 2020 Luiz Américo Pereira Câmara

Copyright (c) 2017 Karolis Narkevicius