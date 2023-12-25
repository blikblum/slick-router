import { bindEvent, unbindEvent } from './events.js'

/**
 * Handle link delegation on `el` or the document,
 * and invoke `fn(e)` when clickable.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api public
 */

export function intercept (el, fn) {
  const cb = delegate(el, 'click', function (e, el) {
    if (clickable(e, el)) fn(e, el)
  })

  return function dispose () {
    unbindEvent(el, 'click', cb)
  }
}

/**
 * Delegate event `type` to links
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

function delegate (el, type, fn) {
  return bindEvent(el, type, function (e) {
    const el = e.target.closest('a')
    if (el) {
      fn(e, el)
    }
  })
}

/**
 * Check if `e` is clickable.
 */

/**
 * @param {Event} e
 * @param {HTMLElement} el
 * @return {Boolean | undefined}
 */
function clickable (e, el) {
  if (which(e) !== 1) return
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  if (e.defaultPrevented) return

  // check target
  if (el.target) return

  // check for data-bypass attribute
  if (el.getAttribute('data-bypass') !== null) return

  // inspect the href
  const href = el.getAttribute('href')
  if (!href || href.length === 0) return

  // don't handle hash links, external/absolute links,  email links and javascript links
  if (/^(#|https{0,1}:\/\/|mailto|javascript:)/i.test(href)) return

  return true
}

/**
 * Event button.
 */

function which (e) {
  e = e || window.event
  return e.which === null ? e.button : e.which
}
