/**
 * @typedef {import("./router.js").Route} Route
 */
/**
 * @callback registerRoute
 * @param {string} name
 * @param {Object} [options]
 * @param {routeCallback} [childrenCallback]
 */
/**
 * @callback routeCallback
 * @param {registerRoute} route
 */
/**
 * @export
 * @param {routeCallback} callback
 * @return {Route[]}
 */
export default function functionDsl(callback: routeCallback): Route[];
export type Route = import("./router.js").Route;
export type registerRoute = (name: string, options?: any, childrenCallback?: routeCallback) => any;
export type routeCallback = (route: registerRoute) => any;
//# sourceMappingURL=function-dsl.d.ts.map