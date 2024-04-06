/**
 * @param {*} value
 * @returns {PropertyHook}
 */
export function fromValue(value: any): PropertyHook;
/**
 * @param {string} key
 * @param {string | Function} [format]
 * @returns {PropertyHook}
 */
export function fromQuery(queryKey: any, format?: string | Function): PropertyHook;
/**
 *
 * @param {string} paramKey
 * @param {string | Function} format
 * @returns {PropertyHook}
 */
export function fromParam(paramKey: string, format: string | Function): PropertyHook;
export function getRouteEl(route: any): any;
export namespace wc {
    export { create };
    export { destroy };
    export { resolve };
    export { done };
}
export type Transition = import("../transition.js").Transition;
export type PropertySetter = (value: any) => void;
export type PropertyHook = {
    init?: (arg0: PropertySetter) => void;
    enter?: (arg0: Transition, arg1: PropertySetter) => void;
    leave?: (arg0: Transition, arg1: PropertySetter) => void;
    update?: (arg0: any, arg1: HTMLElement) => void;
};
declare function create(instance: any): void;
declare function destroy(): void;
declare function resolve(transition: any): Promise<void>;
declare function done(transition: any): void;
export {};
//# sourceMappingURL=wc.d.ts.map