# Router Configuration

## Router Instance

A router instance must be configured at start of application.

> An application should not have more than one instance.

```js
import { Router } from 'slick-router'
const router = new Router(options)
```

* **options.routes** - route tree definition (an array or a callback function).
* **options.log** - a function that is called with logging info, default is noop. Pass in `true`/`false` or a custom logging function.
* **options.logError** - default is true. A function that is called when transitions error (except for the special `TransitionRedirected` and `TransitionCancelled` errors). Pass in `true`/`false` or a custom error handling function.
* **options.pushState** - default is false, which means using hashchange events. Set to `true` to use pushState.
* **options.root** - default is `/`. Use in combination with `pushState: true` if your application is not being served from the root url /.
* **options.qs** - default is a simple built in query string parser. Pass in an object with `parse` and `stringify` functions to customize how query strings get treated.


## Routes Definition

The route tree con be configured as a callback, that receives a `route` function

`route` first argument must be a unique name, the second (optional) argument is the route options and the third (also optional) is a caal back to configure the children.

The route options can be `path`, `abstract` or arbitrary ones that can be used by the middlewares.

```js
// route tree as callback
const routes = function (route) {
  route('app', {path: '/'}, function () {
    route('about')
    route('post', {path: ':postId'}, function () {
      route('show')
      route('edit')
    })
  })
}
```

It can be defined also as plain array:

```js
// route tree as array
const routes = [
  {
    name: 'app',
    path: '/',
    children: [
      {
        name: 'about'
      },
      {
        name: 'post',
        path: ':postId',
        children: [
          {
            name: 'show'
          },
          {
            name: 'edit'
          }
        ]
      }
    ]
  }
]
```

The routes definition can be passed directly as Router constructor `routes` option or using `map`

```js
const router = new Router({routes})

// or

const router = new Router()
router.map(routes)
```

### Nested paths

Nested paths are concatenated unless they start with a '/'. For example

```js
router.map(function (route) {
  route('foo', {path: '/foo'}, function () {
    route('bar', {path: '/bar'}, function () {
      route('baz', {path: '/baz'})
    });
  })
})
```

The above map results in 1 URL `/baz` mapping to ['foo', 'bar', 'baz'] routes.

```js
router.map(function (route) {
  route('foo', {path: '/foo'}, function () {
    route('bar', {path: 'bar'}, function () {
      route('baz', {path: 'baz'})
    });
  })
})
```

The above map results in 1 URL `/foo/bar/baz` mapping to ['foo', 'bar', 'baz'] routes.

### Dynamic paths

Paths can contain dynamic segments as described in the docs of [path-to-regexp](https://github.com/pillarjs/path-to-regexp). For example:

```js
route('foo', {path: '/hello/:myParam'}) // single named param, matches /hello/1
route('foo', {path: '/hello/:myParam/:myOtherParam'}) // two named params, matches /hello/1/2
route('foo', {path: '/hello/:myParam?'}) // single optional named param, matches /hello and /hello/1
route('foo', {path: '/hello/:splat*'}) // match 0 or more segments, matches /hello and /hello/1 and /hello/1/2/3
route('foo', {path: '/hello/:splat+'}) // match 1 or more segments, matches /hello/1 and /hello/1/2/3
```

### Abstract routes

By default, both leaf and non leaf routes can be navigated to. Sometimes you might not want it to be possible to navigate to certain routes at all, e.g. if the route is only used for data fetching and doesn't render anything by itself. In that case, you can set `abstract: true` in the route options. Abstract routes can still form a part of the URL.

```js
router.map(function (route) {
  route('application', {path: '/'}, function () {
    route('dashboard', {path: 'dashboard/:accountId', abstract: true}, function () {
      route('defaultDashboard', {path: ''})
      route('realtimeDashboard', {path: 'realtime'})
    });
  })
})
```

Abstract routes are especially useful when creating `index` subroutes as demonstrated above. The above route map results in the following URLs:

```
/ - ['application']
/dashboard/:accountId - ['application', 'dashboard', 'defaultDashboard']
/dashboard/:accountId/realtime - ['application', 'dashboard', 'realtimeDashboard']
```

Navigating to an abstract route that has an index route is equivalent to navigating to the index route. E.g. these are equivalent:

```js
router.transitionTo('dashboard')
router.transitionTo('defaultDashboard')
```

Generating links is also equivalent
```js
router.generate('dashboard') === router.generate('defaultDashboard')
```

However, if the abstract route does not have an index route, then it's not routable and can't have URLs generated.

It's also common to redirect from non leaf routes. In this example we might want to redirect from `application` to the `defaultDashboard` route. If each of your routes are backed by some route handler object, you can achieve the redirect with the following middleware:

```js
router.use(function redirect (transition) {
  var lastRoute = transition.routes[transition.routes.length - 1]
  if (lastRoute.handler.redirect) {
    lastRoute.handler.redirect(transition.params, transition.query)
  }
})
```

### Default path

If a route path is not specified, it defaults to the name of the route, e.g.:

```js
route('foo')

// equivalent to

route('foo', {path: 'foo'})
```

If a route has a name with dots and no path specified, the path defaults to the last segment of the path. 

```js
route('foo.bar')

// equivalent to

route('foo.bar', {path: 'bar'})
```

## Middlewares Setup

Middlewares (builtin or custom ones) are added through `use` method 

### router.use(fn, options)

Add a transition middleware. Every time a transition takes place this middleware will be called with a transition as the argument. You can call `use` multiple times to add more middlewares. The middleware function can return a promise and the next middleware will not be called until the promise of the previous middleware is resolved. The result of the promise is passed in as a second argument to the next middleware. E.g.

```js
router.use(function (transition) {
  return Promise.all(transition.routes.map(function (route) {
    return route.options.handler.fetchData()
  }))
})

router.use(function (transition, datas) {
  transition.routes.forEach(function (route, i) {
    route.options.handler.activate(datas[i])
  })
})
```

Its possible to control the order which the middleware is inserted in internal queue by using `options.at`:

```js
// ensure middleware will be executed first
router.use(function () { console.log('my middleware') }, { at: 0 })
```

The middleware can be defined also as an object with one or more of the following methods:

- `resolve(transition, prevData)`: called once per transition after previous middleware, if any, is resolved. Main action should be done here.
- `done(transition)`: called when transition succeeds and after all middlewares are resolved
- `cancel(transition, err)`: called if transition is cancelled / redirected
- `error(transition, err)`: called if an error occurs while executing the trasition
- `create(router)`: called once at middleware registration. Useful to configure the middleware
- `destroy(router)`: called once when router destroyed

## Router Start

After the router has been configured with a route map and middleware is necessary to call `listen`

### router.listen()

Start listening to URL changes and transition to the appropriate route based on the current URL.

When using `location: 'memory'`, the current URL is not read from the browser's location bar and instead can be  passed in via listen: `listen(path)`.

```js
router.listen()
```

## Query Params

The query params is extracted and parsed using a very simple query string parser that only supports key values. For example, `?a=1&b=2` will be parsed to `{a: 1, b:2}`. If you want to use a more sophisticated query parser, pass in an object with `parse` and `stringify` functions - an interface compatible with the popular [qs](https://github.com/hapijs/qs) module e.g.:

```js
const router = new Router({
  qs: require('qs')
})
```

## BrowserLocation

Is possible to configure how browser's URL/history is managed. By default, Slick Router will use a very versatile implementation - `slick-router/lib/locations/browser` which supports `pushState` and `hashChange` based URL management with graceful fallback of `pushState` -> `hashChange` -> `polling` depending on browser's capabilities.

Configure BrowserLocation by passing options directly to the router.

```js
var router = new Router({
  pushState: true
})
```

* options.pushState - default is false, which means using hashchange events. Set to true to use pushState.
* options.root - default is `/`. Use in combination with `pushState: true` if your application is not being served from the root url /.

## MemoryLocation

MemoryLocation can be used if you don't want router to touch the address bar at all. Navigating around the application will only be possible programatically by calling `router.transitionTo` and similar methods.

e.g.

```js
var router = new Router({
  location: 'memory'
})
```

## CustomLocation

You can also pass a custom location in explicitly. This is an advanced use case, but might turn out to be useful in non browser environments. For this you'll need to investigate how BrowserLocation is implemented.

```js
var router = new Router({
  location: myCustomLocation()
})
```


## Intercepting Links

When using pushState is necessary to intercept link clicks otherwise the browser would just do a full page refresh on every click of a link.

Slick Router automatically handles that when using [routerLinks](middlewares/routerlinks.md) middleware or `interceptLinks` function

The clicks **are** intercepted only if:

  * `interceptLinks(router)` is called
  * the currently used location and browser supports pushState
  * clicked with the left mouse button with no cmd or shift key

The clicks that **are never** intercepted:

  * external links
  * `javascript:` links
  * `mailto:` links
  * links with a `data-bypass` attribute
  * links starting with `#`

The default implementation of the intercept click handler is:

```js
function defaultClickHandler (event, link, router) {
  event.preventDefault()
  router.transitionTo(router.location.removeRoot(link.getAttribute('href')))
}
```

You can pass the root element to look for links and a custom function as `interceptLinks` params:

```js
function customClickHandler (event, link, router) {
  event.preventDefault()
  router.replaceWith(router.location.removeRoot(link.getAttribute('href')))
}

interceptLinks(router, document, customClickHandler)
```

