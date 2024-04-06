/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @return {Function}
 * @api public
 */
export function bindEvent(el: Element, type: string, fn: Function): Function;
/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @return {Function}
 * @api public
 */
export function unbindEvent(el: Element, type: string, fn: Function): Function;
//# sourceMappingURL=events.d.ts.map