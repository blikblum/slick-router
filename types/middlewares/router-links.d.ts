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
export type RoutePropCallback = (routeName: string, routeEl: HTMLElement) => Record<string, any>;
export type RouterLinksOptions = {
    params?: Record<string, any> | RoutePropCallback;
    query?: Record<string, any> | RoutePropCallback;
    event?: string;
};
declare function create(instance: any): void;
declare function done(): void;
export {};
//# sourceMappingURL=router-links.d.ts.map