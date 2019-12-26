/**
* Bind `el` event `type` to `fn`.
*
* @param {Element} el
* @param {String} type
* @param {Function} fn
* @return {Function}
* @api public
*/

export function bindEvent (el, type, fn) {
  el.addEventListener(type, fn)
  return fn
}

/**
* Unbind `el` event `type`'s callback `fn`.
*
* @param {Element} el
* @param {String} type
* @param {Function} fn
* @return {Function}
* @api public
*/

export function unbindEvent (el, type, fn) {
  el.removeEventListener(type, fn)
  return fn
}
