/**
 * @export
 * @param {HTMLElement} rootEl
 * @param {RouterLinksOptions} [options={}]
 * @return {Function}
 */
export function bindRouterLinks(rootEl: HTMLElement, options?: RouterLinksOptions): Function;
export namespace routerLinks {
    export { create };
    export { done };
}
export type RoutePropCallback = (routeName: string, routeEl: HTMLElement) => any;
export type RouterLinksOptions = {
    params?: any | RoutePropCallback;
    query?: any | RoutePropCallback;
};
declare function create(instance: any): void;
declare function done(): void;
export {};
//# sourceMappingURL=router-links.d.ts.map