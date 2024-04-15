import { Router as CoreRouter, interceptLinks } from './router.js'
import { wc, fromParam, fromQuery, fromValue, getRouteEl } from './middlewares/wc.js'
import { routerLinks } from './middlewares/router-links.js'
import './components/router-links.js'

/**
 * @typedef {import("./middlewares/wc.js").WCRouteDef} WCRouteDef
 * @typedef {import("./middlewares/wc.js").PropertyHook} PropertyHook
 */

class Router extends CoreRouter {
  constructor(options) {
    super(options)
    this.use(wc)
    this.use(routerLinks)
  }
}

export { Router, interceptLinks, fromParam, fromQuery, fromValue, getRouteEl }
