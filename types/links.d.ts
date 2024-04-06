/**
 * Handle link delegation on `el` or the document,
 * and invoke `fn(e)` when clickable.
 *
 * @param {Element} el
 * @param {(e: Event, el: HTMLElement) => void} fn
 * @return {Function} dispose
 * @api public
 */
export function intercept(el: Element, fn: (e: Event, el: HTMLElement) => void): Function;
//# sourceMappingURL=links.d.ts.map