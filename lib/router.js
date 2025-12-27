/* eslint-disable array-callback-return */
import { pick, clone, extend, isEqual, keys, isArray } from './utils.js'
import functionDsl from './function-dsl.js'
import arrayDsl from './array-dsl.js'
import {
  withQuery,
  withoutQuery,
  injectParams,
  extractParams,
  extractParamNames,
  extractQuery,
} from './path.js'
import BrowserLocation from './locations/browser.js'
import MemoryLocation from './locations/memory.js'
import transition from './transition.js'
import { intercept } from './links.js'
import defineLogger from './logger.js'
import qs from './qs.js'
import { patternCompiler } from './patternCompiler.js'
import { TRANSITION_CANCELLED, TRANSITION_REDIRECTED } from './constants.js'

/**
 * @typedef {import('./function-dsl.js').routeCallback} routeCallback
 * @typedef {import('./array-dsl.js').RouteDef} RouteDef
 * @typedef {import('./transition.js').Transition} Transition
 *
 * @typedef Route
 * @property {String} name
 * @property {String} path
 * @property {Object} options
 * @property {Route[]} routes
 *
 * @typedef RouterLocation
 * @property {(url: string) => string} formatURL
 * @property {(url: string) => string} removeRoot
 * @property {(path: string, options?: Object) => void} setURL
 * @property {(path: string, options?: Object) => void} replaceURL
 * @property {(callback: (url: string) => void) => void} onChange
 * @property {() => string} getURL
 * @property {(path?: string) => void} start

 * @typedef {RouterLocation | 'browser' | 'memory'} LocationParam
 *
 * @typedef RouterMiddleware
 * @property {(router: Router) => void} [create]
 * @property {() => void} [destroy]
 * @property {(transition: Transition) => void} [resolve]
 * @property {(transition: Transition) => void} [before]
 * @property {(transition: Transition) => void} [after]
 * @property {(transition: Transition, error: any) => void} [error]
 * @property {(transition: Transition, error: any) => void} [cancel]
 *
 * @typedef RouterOptions
 * @property {routeCallback | RouteDef[]} [routes]
 * @property {LocationParam} [location]
 * @property {Boolean} [logError]
 * @property {Object} [qs]
 * @property {Object} [patternCompiler]
 *
 */

/**
 * Create the default location.
 * This is used when no custom location is passed to
 * the listen call.
 * @param  {RouterOptions} options
 * @return {RouterLocation} location
 */
function createLocation(options) {
  const location = options.location
  if (typeof location !== 'string') {
    return location
  }
  if (location === 'browser') {
    const { pushState, root } = options
    return new BrowserLocation({ pushState, root })
  } else if (location === 'memory') {
    return new MemoryLocation()
  } else {
    throw new Error('Location can be `browser`, `memory` or a custom implementation')
  }
}

class Router {
  /**
   * @param {RouterOptions} [options]
   */
  constructor(options = {}) {
    this.nextId = 1
    this.state = {}
    this.middleware = []
    this.options = extend(
      {
        location: 'browser',
        logError: true,
        qs,
        patternCompiler,
      },
      options,
    )
    defineLogger(this, 'log', this.options.log)
    defineLogger(this, 'logError', this.options.logError)
    if (options.routes) {
      this.map(options.routes)
    }
    this.location = createLocation(this.options)
  }

  /**
   * Add a middleware
   * @param  {((transition: Transition) => void) | RouterMiddleware} middleware
   * @param  {object} [options]
   * @param  {number} [options.at] position to insert the middleware
   * @return {Router}
   * @api public
   */
  use(middleware, options = {}) {
    const m = typeof middleware === 'function' ? { resolve: middleware } : middleware
    typeof options.at === 'number'
      ? this.middleware.splice(options.at, 0, m)
      : this.middleware.push(m)
    m.create && m.create(this)
    return this
  }

  /**
   * Add the route map
   * @param  {routeCallback | RouteDef[]} routes
   * @return {Router}
   * @api public
   */
  map(routes) {
    // create the route tree
    this.routes = isArray(routes) ? arrayDsl(routes) : functionDsl(routes)

    // create the matcher list, which is like a flattened
    // list of routes = a list of all branches of the route tree
    const matchers = (this.matchers = [])
    // keep track of whether duplicate paths have been created,
    // in which case we'll warn the dev
    const dupes = {}
    // keep track of abstract routes to build index route forwarding
    const abstracts = {}

    eachBranch({ routes: this.routes }, [], (routes) => {
      // concatenate the paths of the list of routes
      let path = routes.reduce(
        (
          memo,
          r, // reset if there's a leading slash, otherwise concat
        ) =>
          // and keep resetting the trailing slash
          (r.path[0] === '/' ? r.path : `${memo}/${r.path}`).replace(/\/$/, ''),
        '',
      )
      // ensure we have a leading slash
      if (path === '') {
        path = '/'
      }

      const lastRoute = routes[routes.length - 1]

      if (lastRoute.options.abstract) {
        abstracts[path] = lastRoute.name
        return
      }

      if (lastRoute.path === '') {
        let matcher
        matchers.some((m) => {
          if (m.path === path) {
            matcher = m
            return true
          }
        })

        if (matcher) {
          // remap the matcher of a parent route
          matcher.routes = routes
        } else if (abstracts[path]) {
          matchers.push({
            routes,
            name: abstracts[path],
            path,
          })
        }
      }

      // register routes
      matchers.push({
        routes,
        name: lastRoute.name,
        path,
      })

      // dupe detection
      if (dupes[path] && lastRoute.path !== '') {
        throw new Error(
          `Routes ${dupes[path]} and ${lastRoute.name} have the same url path '${path}'`,
        )
      }
      dupes[path] = lastRoute.name
    })

    function eachBranch(node, memo, fn) {
      node.routes.forEach((route) => {
        fn(memo.concat(route))

        if (route.routes.length) {
          eachBranch(route, memo.concat(route), fn)
        }
      })
    }

    return this
  }

  /**
   * Starts listening to the location changes.
   * @param  {string}  [path]
   * @return {Transition} initial transition
   *
   * @api public
   */
  listen(path) {
    const location = this.location
    location.start(path)
    // setup the location onChange handler
    location.onChange((url) => {
      const previousUrl = this.state.path
      this.dispatch(url).catch((err) => {
        if (err && err.type === TRANSITION_CANCELLED) {
          // reset the URL in case the transition has been cancelled
          location.replaceURL(previousUrl, { trigger: false })
        }
        return err
      })
    })
    // and also kick off the initial transition
    return this.dispatch(location.getURL())
  }

  /**
   * Transition to a different route. Passe in url or a route name followed by params and query
   * @param  {string} name     url or route name
   * @param  {Record<string, any>} [params]  Optional
   * @param  {Record<string, any>} [query]   Optional
   * @return {Transition}         transition
   *
   * @api public
   */
  transitionTo(name, params, query) {
    if (this.state.activeTransition) {
      return this.replaceWith(name, params, query)
    }
    return this.doTransition('setURL', name, params, query)
  }

  /**
   * Like transitionTo, but doesn't leave an entry in the browser's history,
   * so clicking back will skip this route
   * @param  {String} name     url or route name followed by params and query
   * @param  {Record<string, any>} [params]
   * @param  {Record<string, any>} [query]
   * @return {Transition}         transition
   *
   * @api public
   */
  replaceWith(name, params, query) {
    return this.doTransition('replaceURL', name, params, query)
  }

  /**
   * Create an href
   * @param  {string} name   target route name
   * @param  {Record<string, any>} [params]
   * @param  {Record<string, any>} [query]
   * @return {string}        href
   *
   * @api public
   */
  generate(name, params, query) {
    let matcher

    query = query || {}

    this.matchers.forEach((m) => {
      if (m.name === name) {
        matcher = m
      }
    })

    if (!matcher) {
      throw new Error(`No route is named ${name}`)
    }

    const url = withQuery(this.options.qs, injectParams(matcher.path, params), query)
    return this.location.formatURL(url)
  }

  /**
   * Stop listening to URL changes
   * @api public
   */
  destroy() {
    const { location, state, middleware } = this

    location.destroy?.()

    if (state.activeTransition) {
      state.activeTransition.cancel()
    }
    this.state = {}
    middleware.forEach((m) => {
      m.destroy?.(this)
    })
  }

  /**
   * Check if the given route/params/query combo is active
   * @param  {string} name   target route name
   * @param  {Record<string, any>} [params]
   * @param  {Record<string, any>} [query]
   * @param  {boolean} [exact]
   * @return {boolean}
   *
   * @api public
   */
  isActive(name, params, query, exact) {
    const activeRoutes = this.state.routes || []
    const activeParams = this.state.params
    const activeQuery = this.state.query

    let isActive =
      activeRoutes.some((route) => route.name === name) &&
      (!exact || activeRoutes[activeRoutes.length - 1].name === name)
    isActive =
      isActive && (!params || keys(params).every((key) => activeParams[key] === params[key]))
    isActive = isActive && (!query || keys(query).every((key) => activeQuery[key] === query[key]))

    return isActive
  }

  /**
   * @api private
   * @param  {'setURL' | 'replaceURL'} method  pushState or replaceState
   * @param  {string} name    target route name
   * @param  {Record<string, any>} [params]
   * @param  {Record<string, any>} [query]
   * @return {Transition}         transition
   */
  doTransition(method, name, params, query) {
    const { location, options } = this
    const previousUrl = location.getURL()

    let url = name
    if (url[0] !== '/') {
      url = this.generate(name, params, query)
      url = url.replace(/^#/, '/')
    }

    if (options.pushState) {
      url = location.removeRoot(url)
    }

    const transition = this.dispatch(url)

    transition.catch((err) => {
      if (err && err.type === TRANSITION_CANCELLED) {
        // reset the URL in case the transition has been cancelled
        location.replaceURL(previousUrl, { trigger: false })
      }
      return err
    })

    location[method](url, { trigger: false })

    return transition
  }

  /**
   * Match the path against the routes
   * @param  {String} path
   * @return {Object} the list of matching routes and params
   *
   * @api private
   */
  match(path) {
    path = (path || '').replace(/\/$/, '') || '/'
    let params
    let routes = []
    const pathWithoutQuery = withoutQuery(path)
    const { qs, patternCompiler } = this.options
    this.matchers.some((matcher) => {
      params = extractParams(matcher.path, pathWithoutQuery, patternCompiler)
      if (params) {
        routes = matcher.routes
        return true
      }
    })
    return {
      routes: routes.map(descriptor),
      params: params || {},
      pathname: pathWithoutQuery,
      query: extractQuery(qs, path) || {},
    }

    // clone the data (only a shallow clone of options)
    // to make sure the internal route store is not mutated
    // by the middleware. The middleware can mutate data
    // before it gets passed into the resolve middleware, but
    // only within the same transition. New transitions
    // will get to use pristine data.
    function descriptor(route) {
      return {
        name: route.name,
        path: route.path,
        params: pick(params, extractParamNames(route.path, patternCompiler)),
        options: clone(route.options),
      }
    }
  }

  /**
   *
   * @param {string} path
   * @returns {Transition}
   */
  dispatch(path) {
    const match = this.match(path)
    const query = match.query
    const pathname = match.pathname

    const activeTransition = this.state.activeTransition

    // if we already have an active transition with all the same
    // params - return that and don't do anything else
    if (
      activeTransition &&
      activeTransition.pathname === pathname &&
      isEqual(activeTransition.query, query)
    ) {
      return activeTransition
    }

    // otherwise, cancel the active transition since we're
    // redirecting (or initiating a brand new transition)
    if (activeTransition) {
      const err = new Error(TRANSITION_REDIRECTED)
      err.type = TRANSITION_REDIRECTED
      err.nextPath = path
      activeTransition.cancel(err)
    }

    // if there is no active transition, check if
    // this is a noop transition, in which case, return
    // a transition to respect the function signature,
    // but don't actually run any of the middleware
    if (!activeTransition) {
      if (this.state.pathname === pathname && isEqual(this.state.query, query)) {
        return transition({
          id: this.nextId++,
          path,
          match,
          noop: true,
          router: this,
        })
      }
    }

    const t = transition({
      id: this.nextId++,
      path,
      match,
      router: this,
    })

    this.state.activeTransition = t

    return t
  }

  log(...args) {
    console.info(...args)
  }

  logError(...args) {
    console.error(...args)
  }
}

/**
 *
 * @param {Event} event
 * @param {HTMLAnchorElement} link
 * @param {Router} router
 */
function defaultClickHandler(event, link, router) {
  event.preventDefault()
  router.transitionTo(router.location.removeRoot(link.getAttribute('href')))
}

/**
 * @description Helper to intercept links when using pushState but server is not configured for it
 * Link clicks are handled via the router avoiding browser page reload
 * @param {Router} router
 * @param {HTMLElement} el
 * @param {(e: Event, link: HTMLAnchorElement, router: Router) => void} clickHandler
 * @returns {Function} dispose
 */
function interceptLinks(router, el = document, clickHandler = defaultClickHandler) {
  return intercept(el, (event, link) => clickHandler(event, link, router))
}

export { Router, interceptLinks }
