## Slick Router Changelog

### Unreleased

### [v3.0.0] - 2024-04-18

- make patternCompiler configurable
- regexparam as default pattern compiler (replace path-to-regexp by regexparam)
- add router-links component
- remove withRouterLinks decorator
- add customizable property hooks
- replace paramValue and queryValue by withParam and withQuery hooks
- default entry point exports a Router with wc and routerLinks middlewares
- basic typescript support

### [v2.5.2] - 2021-06-30

- router-links: catch errors when generating link
- router-links: convert from kebab case to camel case param-_ and query-_ attributes

### [v2.5.1] - 2020-01-24

- animated-outlet: export GenericCSS class

### [v2.5.0] - 2020-01-18

- implement animated-outlet component

### [v2.4.0] - 2020-01-04

- routerLinks: implement replace option
- wc: fix rendering when transitioning from a child to a parent route

### [v2.3.1] - 2019-12-31

- wc: add getRouteEl function
- events: add before:transition event

### [v2.3.0] - 2019-12-30

- Implement exact active matching in isActive
- routerLinks: fix updating active class when link is created outside an active transition
- routerLinks: implement exact active matching through exact attribute
- Add events middleware

### [v2.2.1] - 2019-12-28

- routerLinks: fix using withRouterLinks with non legacy decorators

### [v2.2.0] - 2019-12-28

- wc: Implement reuse option
- wc: Implement properties option
- wc: Set $route property before connectedCallback is called
- routerLinks: Fix creating router links when link is not a direct child of root el

### [v2.1.1] - 2019-12-27

- Fix URL generation of index routes

### [v2.1.0] - 2019-12-27

- Allow to customize outlet selector with outlet static property
- Allow to define routes without component
- Accept a selector as router outlet

### [v2.0.0] - 2019-12-26

- Add wc middleware (render web components)
- Add routerLinks middleware
- Rename `next` middleware hook to `resolve`
- Export Router as named export instead of as default
- Convert classes to ES6 syntax
- Do not transpile to ES5 (publishes package as ES6)
- Use path-to-regexp instead of path-to-regexp-es
- Allow to create index routes without using abstract option
- Extract intercepLinks funcionality from Router class
- Add `at` option to control middleware insert position

### [v1.0.0] - 2019-07-02

- replace path-to-regexp by path-to-regexp-es
- improve log messages
- update examples

### [v0.9.0] - 2019-05-15

- reset version to 0.9
- renamed project to Slick Router (published as slick-router)
- update path-to-regexp to v3
- use path-to-regexp-es instead of path-to-regexp
- improve default logging

---

## Cherrytree fork (published as cherrytreex)

### v3.5.0

- Implement defining routes as array
- Allow to pass routes as a constructor option (calls map automatically)

### v3.4.0

- Use rollup instead of webpack for tests
- Optimize clone
- Optimize mapping routes from function dsl

### v3.3.0

- Add module entry for package

### v3.2.0

- Implement cancel hook
- Reset URL when transition started by URL is cancelled

### v3.1.0

- Use rollup instead of webpack for main bundle
- Optimize dash functions

### v3.0.0 (first cherrytreex release)

- API changes:
  - Published package with cherrytreex name
  - Export router constructor instead of factory function
  - Add possibility to register middleware with a object containing next/done/error hooks
  - Drop ability to customize Promise implementation. To run in browsers without native Promise is necessary a polyfill
  - Do not use active state to generate links
- Infrastructure changes
  - Update build system simplifying it and producing smaller bundle
  - Incorporated location-bar dependency removing shared code
  - Upgraded dev dependencies

---

## Original Cherrytree

### v2.4.1

- Fix a broken release, for some reason the `npm run release` failed to package correctly

### v2.4.0

- Make it possible to `transitionTo('anAbstractRoute')` and `generate('anAbstractRoute')` in cases where the abstract route has a corresponding index route. This can be more intuitive in some cases.

### v2.3.2

- URL encode slashes in route params

### v2.3.1

- Don't intercept clicks on `mailto:` links

### v2.2.1

- Fix: stop using Array.prototype.find which is not available in older browsers

### v2.2.0

- Add router.isActive method for testing if a given route is currently active. See [docs](docs/api.md#routerisactivename-params-query)

### v2.1.0

- Parse query params when transitioning even when no route matches

### v2.0.0

Nothing changed from v2.0.0-rc4.

### v2.0.0-rc4

- BrowserLocation and HistoryLocation can now be accessed at cherrytree.BrowserLocation and cherrytree.MemoryLocation again. This is to make it easier to use those modules for UMD users (#116).

### v2.0.0-rc3

Breaking changes:

- `HistoryLocation` has been renamed to `BrowserLocation`. Location in cherrytree is the place that stores the current location of the app. Location is updated with the new path when cherytree transitions. Location also triggers updates when someone changes the location externally (e.g. by navigating with back/forward buttons or updating the URL). `BrowserLocation` is a more apt name since this location implementation represents browser's location bar and is configurable to use pushState or hashchange. This way, the other location that ships with cherrytree, `MemoryLocation`- also makes more sense, in this case we're saying the URL is simply stored in this in memory object and not really connected to the browser (which is what makes it useful on the server, for example).

### v2.0.0-rc2

- Fix: query params were stringified incorrectly when more than 2 params and when some of params were undefined. `router.generate('/a/b/c', {}, { id: 'def', foo: 'bar', baz: undefined })` results in `/a/b/c?id=def&foo=bar` now as in the older versions of cherrytree.

### v2.0.0-rc1

Breaking changes:

- Every route is now routable. Previously it was only possible to generate links and transition to leaf routes. This simplifies the typical usage of the router and opens up new use cases as well. For example, if you want to redirect from '/' to '/some/:id', it's now easier to implement this kind of redirect behaviour without needing to create many reduntant '.index' routes.
- The special `.index` treatment has been removed. Previously, if the route name ended with `.index`, the path was automatically set to ''. Now, such path will default to 'index' as with all other routes. Set `path: ''` on your index routes when upgrading.
- An exception is now thrown when multiple routes have the same URL pattern.
- Given all the above changes - a new route option `abstract: true` was introduced for making non leaf routes non routable. This also solves the problem where using `path: ''` would result in multiple routes with the same path.
- The `paramNames` array (e.g. ['id', 'filter']) was replaced with `params` object (e.g. {id: 1, filter: 'foo'}) in the route descriptor on the transition object.
- The `ancestors` attribute was removed from the route descriptor.
- Switching between using `history` and `memory` locations has been simplified. Previously, you'd need to pass `new MemoryLocation(path)` when calling `listen`. Now, specify the location to use with `location: 'memory'` when creating the router and pass the path when calling `listen`.
- The `qs` module was removed from dependencies and was replaced with a tiny, simple query string parser. This can be sufficient for a lot of applications and saves a couple of kilobytes. If you want to use `qs` or any other query parsing module, pass it as `qs: require('qs')` option to the router.
- params, query and route array are now immutable between transitions, i.e. modifying those directly on the transition only affects that transition
- Drop out-of-the-box support for ES3 environments (IE8). To use Cherrytree in older environments - es5 polyfills for native `map`, `reduce` and `forEach` need to be used now.
- An undocumented, noop function `reset` was removed from the router.

New features:

- Support for custom [click intercept handlers](docs/api.md#intercepting-links)

Under the hood improvements:

- Update all dependencies to the latest versions
- Tests are being run in more browsers now
- Replaced `co` with `babel-creed-async` in tests
- Removed the dependency on `lodash`

Documentation:

- Moved docs back to a separate [`docs/api.md`](docs/api.md) file
- Documented [router.matchers](docs/api.md#routermatchers)
- Documented [404 handling](docs/api.md#handling-404)

### v2.0.0-alpha.12

- BYOP - Cherrytree now requires a global Promise implementation to be available or a Promise constructor passed in as an option

### v2.0.0-alpha.11

- Add `transition.redirectTo` so that middleware could initiate redirects without having the router

### v2.0.0-alpha.10

- Log errors by default (i.e. options.logError: true by default)

### v2.0.0-alpha.9

- Fix router.destroy() - DOM click events for link interception are now cleaned up when router.destroy() is called
- Add server side support
  - events.js now exports an {} object on the server instead of crashing due to missing `window`
  - MemoryLocation correctly handles option flags and can be instantiated with a starting `path`
- Add a [server-side-react example](../examples/server-side-react)
- When transition is rejected with a `TransitionRedirected` error - the `err.nextPath` is now available)

### v2.0.0-alpha.8

- Fix dependencies - lodash was declared as a devDependency

### v2.0.0-alpha.7

- Fix the URL generation when `pushState: true` and root !== '/'

### v2.0.0-alpha.1

A brand new and improved cherrytree!

### v0.x.x

See https://github.com/QubitProducts/cherrytree/tree/677f2c915780d712968023b8d24306ff787a426d
