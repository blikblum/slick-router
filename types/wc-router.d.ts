export type WCRouteDef = import("./middlewares/wc.js").WCRouteDef;
export type PropertyHook = import("./middlewares/wc.js").PropertyHook;
export type Transition = import("./transition.js").Transition;
/**
 * @typedef {import("./middlewares/wc.js").WCRouteDef} WCRouteDef
 * @typedef {import("./middlewares/wc.js").PropertyHook} PropertyHook
 * @typedef {import("./transition.js").Transition} Transition
 */
export class Router extends CoreRouter {
    constructor(options: any);
}
import { interceptLinks } from './router.js';
import { fromParam } from './middlewares/wc.js';
import { fromQuery } from './middlewares/wc.js';
import { fromValue } from './middlewares/wc.js';
import { getRouteEl } from './middlewares/wc.js';
import { Router as CoreRouter } from './router.js';
export { interceptLinks, fromParam, fromQuery, fromValue, getRouteEl };
//# sourceMappingURL=wc-router.d.ts.map