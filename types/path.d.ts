export function clearPatternCompilerCache(): void;
/**
 * Returns an array of the names of all parameters in the given pattern.
 */
export function extractParamNames(pattern: any, compiler: any): any;
/**
 * Extracts the portions of the given URL path that match the given pattern
 * and returns an object of param name => value pairs. Returns null if the
 * pattern does not match the given path.
 */
export function extractParams(pattern: any, path: any, compiler: any): {};
/**
 * Returns a version of the given route path with params interpolated. Throws
 * if there is a dynamic segment of the route path for which there is no param.
 */
export function injectParams(pattern: any, params: any): any;
/**
 * Returns an object that is the result of parsing any query string contained
 * in the given path, null if the path contains no query string.
 */
export function extractQuery(qs: any, path: any): any;
/**
 * Returns a version of the given path with the parameters in the given
 * query merged into the query string.
 */
export function withQuery(qs: any, path: any, query: any): any;
/**
 * Returns a version of the given path without the query string.
 */
export function withoutQuery(path: any): any;
//# sourceMappingURL=path.d.ts.map