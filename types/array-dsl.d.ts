/**
 * @typedef {import("./router.js").Route} Route
 */
/**
 * @typedef RouteDef
 * @property {string} name
 * @property {string} path
 * @property {RouteDef[]} children
 */
/**
 * @export
 * @param {RouteDef[]} routes
 * @return {Route[]}
 */
export default function arrayDsl(routes: RouteDef[]): Route[];
export type Route = import("./router.js").Route;
export type RouteDef = {
    name: string;
    path: string;
    children: RouteDef[];
};
//# sourceMappingURL=array-dsl.d.ts.map