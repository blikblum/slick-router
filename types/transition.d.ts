/**
 * @export
 * @param {*} options
 * @return {Transition}
 */
export default function transition(options: any): Transition;
export type Route = import("./router.js").Route;
export type TransitionData = Pick<Transition, "routes" | "pathname" | "path" | "params" | "query">;
export type Transition = {
    routes: Route[];
    pathname: string;
    path: string;
    params: any;
    query: any;
    prev: TransitionData;
    redirectTo: (name: string, params?: any, query?: any) => Transition;
    retry: (name: string, params?: any, query?: any) => Transition;
    cancel: (error: string | Error) => void;
    followRedirects: () => Promise<any>;
    then: Function;
    catch: Function;
    noop: boolean;
    isCancelled: boolean;
};
//# sourceMappingURL=transition.d.ts.map