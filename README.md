# Slick Router

Slick Router is a flexible hierarchical router that translates every URL change into a transition descriptor object and calls your middleware functions that put the application into a desired state. It is derived from [cherrytree](https://github.com/QubitProducts/cherrytree) library (see [differences](docs/versions-differences.md)).

## Features

* can be used with any view and data framework
* nested routes are great for nested UIs
* generate links in a systematic way, e.g. `router.generate('commit', {sha: '1e2760'})`
* use pushState with automatic hashchange fallback
* all urls are generated with or without `#` as appropriate
* link clicks on the page are intercepted automatically when using pushState
* dynamically load parts of your app during transitions
* dynamic segments, optional params and query params
* support for custom query string parser
* transition is a first class citizen - abort, pause, resume, retry. E.g. pause the transition to display "There are unsaved changes" message if the user clicked some link on the page or used browser's back/forward buttons
* navigate around the app programatically, e.g. `router.transitionTo('commits')`
* easily rename URL segments in a single place (e.g. /account -> /profile)


## Installation

The size excluding path-to-regexp dependency is ~40kB (without minification and compression)

    $ npm install --save slick-router


```js
import { Router } from 'slick-router';
```

## Docs

* [Intro Guide](docs/intro.md)
* [API Docs](docs/api.md)
* [Changelog](CHANGELOG.md)


## Buitins middlewares

TBD

## Usage

```js
import { Router } from 'slick-router';
import handlers from './handlers';

// route tree definition
const routes = function (route) {
  route('application', {path: '/'}, function () {
    route('feed', {path: ''})
    route('messages')
    route('status', {path: ':user/status/:id'})
    route('profile', {path: ':user'}, function () {
      route('profile.lists')
      route('profile.edit')
    })
  })
}

// create the router
var router = new Router({
  routes
})

// render middleware
router.use(function render (transition) {
  transition.routes.forEach(function (route, i) {
    route.view = handlers[route.name]({
      params: transition.params,
      query: transition.query
    })
    var parent = transition.routes[i-1]
    var containerEl = parent ? parent.view.el.querySelector('.outlet') : document.body
    containerEl.appendChild(view.render().el)
  })
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

You can clone this repo if you want to run the `examples` locally:

* [hello-world-jquery](examples/hello-world-jquery) - minimal example with good old jquery
* [hello-world-react](hello-world-react) - minimal example with React
* [hello-world-wc](hello-world-react) - minimal example with Web Component (no build required)
* [vanilla-blog](examples/vanilla-blog) - a small static demo of blog like app that uses no framework

## Browser Support

Slick Router works in all modern browsers. V1 requires es5 environment and es6 promises. Use polyfills for those if you have to support older browsers, e.g.:

* https://github.com/es-shims/es5-shim
* https://github.com/jakearchibald/es6-promise

----

Copyright (c) 2019 Luiz Américo Pereira Câmara

Copyright (c) 2017 Karolis Narkevicius