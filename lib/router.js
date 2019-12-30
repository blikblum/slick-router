import { pick, clone, extend, isEqual } from './dash'
import functionDsl from './function-dsl'
import arrayDsl from './array-dsl'
import { withQuery, withoutQuery, injectParams, extractParams, extractParamNames, extractQuery } from './path'
import invariant from './invariant'
import BrowserLocation from './locations/browser'
import MemoryLocation from './locations/memory'
import transition from './transition'
import { intercept } from './links'
import defineLogger from './logger'
import qs from './qs'
import { TRANSITION_CANCELLED, TRANSITION_REDIRECTED } from './constants'

class Router {
  constructor (options = {}) {
    this.nextId = 1
    this.state = {}
    this.middleware = []
    this.options = extend({
      location: 'browser',
      logError: true,
      qs
    }, options)
    defineLogger(this, 'log', this.options.log)
    defineLogger(this, 'logError', this.options.logError)
    if (options.routes) {
      this.map(options.routes)
    }
  }

  /**
   * Add a middleware
   * @param  {Function} middleware
   * @return {Object}   router
   * @api public
   */
  use (middleware, options = {}) {
    const m = typeof middleware === 'function' ? { resolve: middleware } : middleware
    typeof options.at === 'number' ? this.middleware.splice(options.at, 0, m) : this.middleware.push(m)
    m.create && m.create(this)
    return this
  }

  /**
   * Add the route map
   * @param  {Function} routes
   * @return {Object}   router
   * @api public
   */
  map (routes) {
    // create the route tree
    this.routes = Array.isArray(routes) ? arrayDsl(routes) : functionDsl(routes)

    // create the matcher list, which is like a flattened
    // list of routes = a list of all branches of the route tree
    const matchers = this.matchers = []
    // keep track of whether duplicate paths have been created,
    // in which case we'll warn the dev
    const dupes = {}
    // keep track of abstract routes to build index route forwarding
    const abstracts = {}

    eachBranch({ routes: this.routes }, [], routes => {
      // concatenate the paths of the list of routes
      let path = routes.reduce((memo, r) => // reset if there's a leading slash, otherwise concat
      // and keep resetting the trailing slash
        (r.path[0] === '/' ? r.path : `${memo}/${r.path}`).replace(/\/$/, ''), '')
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
        matchers.some(m => {
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
            path
          })
        }
      }

      // register routes
      matchers.push({
        routes,
        name: lastRoute.name,
        path
      })

      // dupe detection
      if (dupes[path] && lastRoute.path !== '') {
        throw new Error(`Routes ${dupes[path]} and ${lastRoute.name} have the same url path '${path}'`)
      }
      dupes[path] = lastRoute.name
    })

    function eachBranch (node, memo, fn) {
      node.routes.forEach(route => {
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
   * @param  {Object}  location (optional)
   * @return {Promise} initial transition
   *
   * @api public
   */
  listen (path) {
    const location = this.location = this.createLocation(path || '')
    // setup the location onChange handler
    location.onChange((url) => {
      const previousUrl = this.state.path
      this.dispatch(url).catch((err) => {
        if (err && err.type === TRANSITION_CANCELLED) {
          // reset the URL in case the transition has been cancelled
          this.location.replaceURL(previousUrl, { trigger: false })
        }
        return err
      })
    })
    // and also kick off the initial transition
    return this.dispatch(location.getURL())
  }

  /**
   * Transition to a different route. Passe in url or a route name followed by params and query
   * @param  {String} url     url or route name
   * @param  {Object} params  Optional
   * @param  {Object} query   Optional
   * @return {Object}         transition
   *
   * @api public
   */
  transitionTo (...args) {
    if (this.state.activeTransition) {
      return this.replaceWith.apply(this, args)
    }
    return this.doTransition('setURL', args)
  }

  /**
   * Like transitionTo, but doesn't leave an entry in the browser's history,
   * so clicking back will skip this route
   * @param  {String} url     url or route name followed by params and query
   * @param  {Object} params  Optional
   * @param  {Object} query   Optional
   * @return {Object}         transition
   *
   * @api public
   */
  replaceWith (...args) {
    return this.doTransition('replaceURL', args)
  }

  /**
   * Create an href
   * @param  {String} name   target route name
   * @param  {Object} params
   * @param  {Object} query
   * @return {String}        href
   *
   * @api public
   */
  generate (name, params, query) {
    invariant(this.location, 'call .listen() before using .generate()')
    let matcher

    query = query || {}

    this.matchers.forEach(m => {
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
  destroy () {
    if (this.location && this.location.destroy) {
      this.location.destroy()
    }
    if (this.state.activeTransition) {
      this.state.activeTransition.cancel()
    }
    this.state = {}
    this.middleware.forEach(m => {
      m.destroy && m.destroy(this)
    })
  }

  /**
   * Check if the given route/params/query combo is active
   * @param  {String} name   target route name
   * @param  {Object} params
   * @param  {Object} query
   * @return {Boolean}
   *
   * @api public
   */
  isActive (name, params, query, exact) {
    params = params || {}
    query = query || {}
    const activeRoutes = this.state.routes || []
    const activeParams = this.state.params || {}
    const activeQuery = this.state.query || {}

    let isActive = activeRoutes.some(route => route.name === name)
    isActive = isActive && Object.keys(params).every(key => activeParams[key] === params[key])
    isActive = isActive && Object.keys(query).every(key => activeQuery[key] === query[key])

    if (exact) {
      isActive = isActive && activeRoutes[activeRoutes.length - 1].name === name
    }

    return isActive
  }

  /**
   * @api private
   */
  doTransition (method, params) {
    const previousUrl = this.location.getURL()

    let url = params[0]
    if (url[0] !== '/') {
      url = this.generate.apply(this, params)
      url = url.replace(/^#/, '/')
    }

    if (this.options.pushState) {
      url = this.location.removeRoot(url)
    }

    const transition = this.dispatch(url)

    transition.catch((err) => {
      if (err && err.type === TRANSITION_CANCELLED) {
        // reset the URL in case the transition has been cancelled
        this.location.replaceURL(previousUrl, { trigger: false })
      }
      return err
    })

    this.location[method](url, { trigger: false })

    return transition
  }

  /**
   * Match the path against the routes
   * @param  {String} path
   * @return {Object} the list of matching routes and params
   *
   * @api private
   */
  match (path) {
    path = (path || '').replace(/\/$/, '') || '/'
    let params
    let routes = []
    const pathWithoutQuery = withoutQuery(path)
    const qs = this.options.qs
    this.matchers.some(matcher => {
      params = extractParams(matcher.path, pathWithoutQuery)
      if (params) {
        routes = matcher.routes
        return true
      }
    })
    return {
      routes: routes.map(descriptor),
      params: params || {},
      pathname: pathWithoutQuery,
      query: extractQuery(qs, path) || {}
    }

    // clone the data (only a shallow clone of options)
    // to make sure the internal route store is not mutated
    // by the middleware. The middleware can mutate data
    // before it gets passed into the resolve middleware, but
    // only within the same transition. New transitions
    // will get to use pristine data.
    function descriptor (route) {
      return {
        name: route.name,
        path: route.path,
        params: pick(params, extractParamNames(route.path)),
        options: clone(route.options)
      }
    }
  }

  dispatch (path) {
    const match = this.match(path)
    const query = match.query
    const pathname = match.pathname

    const activeTransition = this.state.activeTransition

    // if we already have an active transition with all the same
    // params - return that and don't do anything else
    if (activeTransition &&
        activeTransition.pathname === pathname &&
        isEqual(activeTransition.query, query)) {
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
      if (this.state.pathname === pathname &&
          isEqual(this.state.query, query)) {
        return transition({
          id: this.nextId++,
          path,
          match,
          noop: true,
          router: this
        })
      }
    }

    const t = transition({
      id: this.nextId++,
      path,
      match,
      router: this
    })

    this.state.activeTransition = t

    return t
  }

  /**
   * Create the default location.
   * This is used when no custom location is passed to
   * the listen call.
   * @return {Object} location
   *
   * @api private
   */
  createLocation (path) {
    const location = this.options.location
    if (typeof location !== 'string') {
      return location
    }
    if (location === 'browser') {
      return new BrowserLocation(pick(this.options, ['pushState', 'root']))
    } else if (location === 'memory') {
      return new MemoryLocation({ path })
    } else {
      throw new Error('Location can be `browser`, `memory` or a custom implementation')
    }
  }

  log (...args) {
    console.info.apply(console, args)
  }

  logError (...args) {
    console.error.apply(console, args)
  }
}

function defaultClickHandler (event, link, router) {
  event.preventDefault()
  router.transitionTo(router.location.removeRoot(link.getAttribute('href')))
}

/**
 * Helper to intercept links when using pushState but server is not configured for it
 * Link clicks are handled via the router avoiding browser page reload
 */
function interceptLinks (router, el = document, clickHandler = defaultClickHandler) {
  return intercept(el, (event, link) => clickHandler(event, link, router))
}

export { Router, interceptLinks }
