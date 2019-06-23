export default function defineLogger (router, method, fn) {
  if (fn === true) return
  router[method] = typeof fn === 'function' ? fn : () => {}
}
