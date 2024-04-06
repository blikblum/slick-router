export type routeCallback = import('./function-dsl.js').routeCallback;
export type RouteDef = import('./array-dsl.js').RouteDef;
export type Transition = import('./transition.js').Transition;
export type Route = {
    name: string;
    path: string;
    options: any;
    routes: Route[];
};
export type LocationParam = any | 'browser' | 'memory';
export type RouterOptions = {
    routes?: routeCallback | RouteDef[];
    location?: LocationParam;
    logError?: boolean;
    qs?: any;
    patternCompiler?: any;
};
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

 * @typedef {Object | 'browser' | 'memory'} LocationParam
 *
 *
 * @typedef RouterOptions
 * @property {routeCallback | RouteDef[]} [routes]
 * @property {LocationParam} [location]
 * @property {Boolean} [logError]
 * @property {Object} [qs]
 * @property {Object} [patternCompiler]
 *
 */
export class Router {
    /**
     * @param {RouterOptions} [options]
     */
    constructor(options?: RouterOptions);
    nextId: number;
    state: {};
    middleware: any[];
    options: {
        location: string;
        logError: boolean;
        qs: {
            parse(querystring: any): any;
            stringify(params: any): string;
        };
        patternCompiler: typeof patternCompiler;
    } & RouterOptions;
    /**
     * Add a middleware
     * @param  {Function} middleware
     * @return {Router}
     * @api public
     */
    use(middleware: Function, options?: {}): Router;
    /**
     * Add the route map
     * @param  {routeCallback | RouteDef[]} routes
     * @return {Router}
     * @api public
     */
    map(routes: routeCallback | RouteDef[]): Router;
    routes: Route[];
    matchers: any[];
    /**
     * Starts listening to the location changes.
     * @param  {String}  [path]
     * @return {Transition} initial transition
     *
     * @api public
     */
    listen(path?: string): Transition;
    location: any;
    /**
     * Transition to a different route. Passe in url or a route name followed by params and query
     * @param  {String} name     url or route name
     * @param  {Object} [params]  Optional
     * @param  {Object} [query]   Optional
     * @return {Transition}         transition
     *
     * @api public
     */
    transitionTo(name: string, params?: any, query?: any): Transition;
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
    replaceWith(name: string, params?: Record<string, any>, query?: Record<string, any>): Transition;
    /**
     * Create an href
     * @param  {String} name   target route name
     * @param  {Object} [params]
     * @param  {Object} [query]
     * @return {String}        href
     *
     * @api public
     */
    generate(name: string, params?: any, query?: any): string;
    /**
     * Stop listening to URL changes
     * @api public
     */
    destroy(): void;
    /**
     * Check if the given route/params/query combo is active
     * @param  {String} name   target route name
     * @param  {Record<string, any>} [params]
     * @param  {Record<string, any>} [query]
     * @param  {Boolean} [exact]
     * @return {Boolean}
     *
     * @api public
     */
    isActive(name: string, params?: Record<string, any>, query?: Record<string, any>, exact?: boolean): boolean;
    /**
     * @api private
     * @param  {String} method  pushState or replaceState
     * @param  {String} name    target route name
     * @param  {Object} [params]
     * @param  {Object} [query]
     * @return {Transition}         transition
     */
    doTransition(method: string, name: string, params?: any, query?: any): Transition;
    /**
     * Match the path against the routes
     * @param  {String} path
     * @return {Object} the list of matching routes and params
     *
     * @api private
     */
    match(path: string): any;
    /**
     *
     * @param {string} path
     * @returns {Transition}
     */
    dispatch(path: string): Transition;
    /**
     * Create the default location.
     * This is used when no custom location is passed to
     * the listen call.
     * @param  {LocationParam} path
     * @return {Object} location
     *
     * @api private
     */
    createLocation(path: LocationParam): any;
    log(...args: any[]): void;
    logError(...args: any[]): void;
}
/**
 * @description Helper to intercept links when using pushState but server is not configured for it
 * Link clicks are handled via the router avoiding browser page reload
 * @param {Router} router
 * @param {HTMLElement} el
 * @param {(e: Event, link: HTMLAnchorElement, router: Router) => void} clickHandler
 * @returns {Function} dispose
 */
export function interceptLinks(router: Router, el?: HTMLElement, clickHandler?: (e: Event, link: HTMLAnchorElement, router: Router) => void): Function;
import { patternCompiler } from './patternCompiler.js';
//# sourceMappingURL=router.d.ts.map