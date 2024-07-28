import { clone } from './utils.js'
import invariant from './invariant.js'
import { TRANSITION_CANCELLED, TRANSITION_REDIRECTED } from './constants.js'

/**
 * @typedef {import("./router.js").Route} Route
 */

/**
 * @typedef {Pick<Transition, 'routes' | 'pathname' | 'path' | 'params' | 'query' >} TransitionData
 */

/**
 * @typedef Transition
 * @property {Route[]} routes
 * @property {string} pathname
 * @property {string} path
 * @property {Object} params
 * @property {Object} query
 * @property {TransitionData} prev
 * @property {(name: string, params?: any, query?: any) => Transition} redirectTo
 * @property {(name: string, params?: any, query?: any) => Transition} retry
 * @property {(error: string | Error) => void} cancel
 * @property {() => Promise<any>} followRedirects
 * @property {function} then
 * @property {function} catch
 * @property {boolean} noop
 * @property {boolean} isCancelled
 */

/**
 * @param {*} router
 * @param {Transition} transition
 * @param {*} err
 */
function runError(router, transition, err) {
  router.middleware.forEach((m) => {
    m.error && m.error(transition, err)
  })
}

/**
 * @export
 * @param {*} options
 * @return {Transition}
 */
export default function transition(options) {
  options = options || {}

  const router = options.router
  const log = router.log
  const logError = router.logError

  const path = options.path
  const match = options.match
  const routes = match.routes
  const params = match.params
  const pathname = match.pathname
  const query = match.query

  const id = options.id
  const startTime = Date.now()
  log('---')
  log('Transition #' + id, 'to', path)
  log(
    'Transition #' + id,
    'routes:',
    routes.map((r) => r.name),
  )
  log('Transition #' + id, 'params:', params)
  log('Transition #' + id, 'query:', query)

  // create the transition promise
  let resolve, reject
  const promise = new Promise(function (res, rej) {
    resolve = res
    reject = rej
  })

  // 1. make transition errors loud
  // 2. by adding this handler we make sure
  //    we don't trigger the default 'Potentially
  //    unhandled rejection' for cancellations
  promise
    .then(function () {
      log('Transition #' + id, 'completed in', Date.now() - startTime + 'ms')
    })
    .catch(function (err) {
      if (err.type !== TRANSITION_REDIRECTED && err.type !== TRANSITION_CANCELLED) {
        log('Transition #' + id, 'FAILED')
        logError(err)
      }
    })

  let cancelled = false

  const transition = {
    id,
    prev: {
      routes: clone(router.state.routes) || [],
      path: router.state.path || '',
      pathname: router.state.pathname || '',
      params: clone(router.state.params) || {},
      query: clone(router.state.query) || {},
    },
    routes: clone(routes),
    path,
    pathname,
    params: clone(params),
    query: clone(query),
    redirectTo: function (...args) {
      return router.transitionTo(...args)
    },
    retry: function () {
      return router.transitionTo(path)
    },
    cancel: function (err) {
      if (router.state.activeTransition !== transition) {
        return
      }

      if (transition.isCancelled) {
        return
      }

      router.state.activeTransition = null
      transition.isCancelled = true
      cancelled = true

      if (!err) {
        err = new Error(TRANSITION_CANCELLED)
        err.type = TRANSITION_CANCELLED
      }
      if (err.type === TRANSITION_CANCELLED) {
        log('Transition #' + id, 'cancelled')
      }
      if (err.type === TRANSITION_REDIRECTED) {
        log('Transition #' + id, 'redirected')
      }

      router.middleware.forEach((m) => {
        m.cancel && m.cancel(transition, err)
      })
      reject(err)
    },
    followRedirects: function () {
      return promise.catch(function (reason) {
        if (router.state.activeTransition) {
          return router.state.activeTransition.followRedirects()
        }
        return Promise.reject(reason)
      })
    },

    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
  }

  router.middleware.forEach((m) => {
    m.before && m.before(transition)
  })

  // here we handle calls to all of the middlewares
  function callNext(i, prevResult) {
    let middleware
    let middlewareName
    // if transition has been cancelled - nothing left to do
    if (cancelled) {
      return
    }
    // done
    if (i < router.middleware.length) {
      middleware = router.middleware[i]
      middlewareName = middleware.name || 'anonymous'
      log('Transition #' + id, 'resolving middleware:', middlewareName)
      let middlewarePromise
      try {
        middlewarePromise = middleware.resolve
          ? middleware.resolve(transition, prevResult)
          : prevResult
        invariant(
          transition !== middlewarePromise,
          'Middleware %s returned a transition which resulted in a deadlock',
          middlewareName,
        )
      } catch (err) {
        router.state.activeTransition = null
        runError(router, transition, err)
        return reject(err)
      }
      Promise.resolve(middlewarePromise)
        .then(function (result) {
          callNext(i + 1, result)
        })
        .catch(function (err) {
          log('Transition #' + id, 'resolving middleware:', middlewareName, 'FAILED')
          router.state.activeTransition = null
          runError(router, transition, err)
          reject(err)
        })
    } else {
      router.state = {
        activeTransition: null,
        routes,
        path,
        pathname,
        params,
        query,
      }
      router.middleware.forEach((m) => {
        m.done && m.done(transition)
      })
      resolve()
    }
  }

  if (!options.noop) {
    Promise.resolve().then(() => callNext(0))
  } else {
    resolve()
  }

  if (options.noop) {
    transition.noop = true
  }

  return transition
}
