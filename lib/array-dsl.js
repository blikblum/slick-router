/**
   * @typedef {import("./router.js").Route} Route
 */

/**
 * @typedef {Object} RouteDef
 * @property {string} name
 * @property {string} path
 * @property {RouteDef[]} children
 */

/**
 * @export
 * @param {*} routes
 * @return {*}
 */
export default function arrayDsl (routes) {
  const result = []

  routes.forEach(({ name, children, ...options }) => {
    if (typeof options.path !== 'string') {
      const parts = name.split('.')
      options.path = parts[parts.length - 1]
    }
    result.push(
      {
        name,
        path: options.path,
        options,
        routes: children ? arrayDsl(children) : []
      }
    )
  })

  return result
}
