# Slick Router

Slick Router is a powerful, flexible router that translates URL changes into route transitions allowing to put the application into a desired state. It is derived from [cherrytree](https://github.com/QubitProducts/cherrytree) library (see [differences](docs/versions-differences.md)).

## Features

* Can be used with any view and data framework
* Can nest routes allowing to create nested UI and/or state
* Route transition is a first class citizen - abort, pause, resume, retry
* Generate links in a systematic way, e.g. `router.generate('commit', {sha: '1e2760'})`
* Use pushState or hashchange for URL change detection
* Define path dynamic segments (uses path-to-regexp under the hood)
* Supports custom query string parser
* Trigger router navigate programatically
* With builtin middlewares/components:
  * Render nested UI using web components
  * Streamlined support for code spliting and lazy loading 
  * Expose route state to components
  * Declarative handling of router links
  * Allow to animate route transitions

## Installation

The main library size including regexparam dependency is ~12kB minified (without gzip compression).
With wc and routerLinks middlewares the size increases to ~17kb. AnimatedOutlet web component, which can be used independent from the router, has a 2.5kb size.
See [webpack test project](examples/tree-shaking) for more results.

    $ npm install --save slick-router


## Docs

* [Intro Guide](docs/intro.md)
* [Router Configuration](docs/router-configuration.md)
* [Programmatic Navigation and Link Handling](docs/programmatic-navigation-and-link.md)
* [Route Transition](docs/route-transition.md)
* [Common Situations](docs/common-situations.md)
* [Changelog](CHANGELOG.md)


## Builtin middlewares

 * [wc](docs/middlewares/wc.md) (advanced Web Component rendering and lifecycle)
 * [routerLinks](docs/middlewares/routerlinks.md) (handle route related links state)
 * [events](docs/middlewares/events.md) (fires route events on window)

## Builtin components

 * [animated-outlet](docs/components/animated-outlet.md) (enable animation on route transitions)

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
* [hello-world-wc](examples/hello-world-wc) - minimal example with Web Component (no build required)
* [vanilla-blog](examples/vanilla-blog) - a small static demo of blog like app that uses no framework

## Browser Support

Slick Router works in all modern browsers. No IE support.

----

Copyright (c) 2023 Luiz Américo Pereira Câmara

Copyright (c) 2017 Karolis Narkevicius