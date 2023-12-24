const routerLinksData = Symbol('routerLinksData')
const unbindRouterLinks = Symbol('unbindRouterLinks')
const resolved = Promise.resolve()
const linkContainers = new Set()
let router

/**
 * @callback RouterLinksOptionsCallback
 * @param {String} routeName
 * @param {HTMLElement} routeEl
 * @return {Object}
 *
 * @typedef {Object} RouterLinksOptions
 * @property {String | null} [selector]
 * @property {Object | RouterLinksOptionsCallback} [params]
 * @property {Object | RouterLinksOptionsCallback} [query]
 */

// Make a event delegation handler for the given `eventName` and `selector`
// and attach it to `el`.
// If selector is empty, the listener will be bound to `el`. If not, a
// new handler that will recursively traverse up the event target's DOM
// hierarchy looking for a node that matches the selector. If one is found,
// the event's `delegateTarget` property is set to it and the return the
// result of calling bound `listener` with the parameters given to the
// handler.

/**
 * @param {*} el
 * @param {*} eventName
 * @param {*} selector
 * @param {*} listener
 * @param {*} context
 * @return {*}
 */
const delegate = function (el, eventName, selector, listener, context) {
  const handler = function (e) {
    let node = e.target
    for (; node && node !== el; node = node.parentNode) {
      if (node.matches && node.matches(selector)) {
        e.selectorTarget = node
        listener.call(context, e)
      }
    }
  }

  handler.eventName = eventName
  el.addEventListener(eventName, handler, false)
  return handler
}

function isModifiedEvent (event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
}

const undelegate = function (el, handler) {
  const eventName = handler.eventName
  el.removeEventListener(eventName, handler, false)
}

const camelize = (str) => {
  if (str.indexOf('-') === -1) return str
  const words = str.split('-')
  let result = ''
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    result += i ? word.charAt(0).toUpperCase() + word.slice(1) : word
  }
  return result
}

function mutationHandler (mutations, observer) {
  mutations.forEach(function (mutation) {
    if (mutation.type === 'attributes') {
      const attr = mutation.attributeName
      if (attr.indexOf('param-') === 0 || attr.indexOf('query-') === 0) {
        updateLink(mutation.target, observer.ownerEl)
      }
    } else {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          if (node.getAttribute('route')) updateLink(node, observer.ownerEl)
          createLinks(observer.ownerEl, node)
        }
      })
    }
  })
}

const elementsObserverConfig = { childList: true, subtree: true, attributes: true }

function getAttributeValues (el, prefix, result) {
  const attributes = el.attributes

  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i]
    if (attr.name.indexOf(prefix) === 0) {
      const paramName = camelize(attr.name.slice(prefix.length))
      result[paramName] = attr.value
    }
  }
  return result
}

function getDefaults (ownerEl, routeName, propName, routeEl, options) {
  let result = options[propName]
  if (typeof result === 'function') result = result.call(ownerEl, routeName, routeEl)
  return result || {}
}

function getRouteProp (ownerEl, routeName, routeEl, propName, attrPrefix) {
  const options = ownerEl[routerLinksData].options
  const defaults = getDefaults(ownerEl, routeName, propName, routeEl, options)
  const rootEl = routeEl.closest(options.selector || '[routerlinks]') || ownerEl
  if (rootEl) {
    getAttributeValues(rootEl, attrPrefix, defaults)
  }
  return getAttributeValues(routeEl, attrPrefix, defaults)
}

function updateActiveClass (el, routeName, params, query) {
  const activeClass = el.hasAttribute('active-class') ? el.getAttribute('active-class') : 'active'
  if (activeClass) {
    const isActive = router.isActive(routeName, params, query, el.hasAttribute('exact'))
    el.classList.toggle(activeClass, isActive)
  }
}

function updateLink (el, ownerEl) {
  const routeName = el.getAttribute('route')
  if (!routeName) return
  const params = getRouteProp(ownerEl, routeName, el, 'params', 'param-')
  const query = getRouteProp(ownerEl, routeName, el, 'query', 'query-')
  try {
    const href = router.generate(routeName, params, query)
    const anchorEl = el.tagName === 'A' ? el : el.querySelector('a')
    if (anchorEl) anchorEl.setAttribute('href', href)
    if (!router.state.activeTransition) {
      updateActiveClass(el, routeName, params, query)
    }
  } catch (error) {
    console.warn(`Error generating link for "${routeName}": ${error}`)
  }
}

/**
 * @param {HTMLElement} ownerEl
 * @param {HTMLElement} rootEl
 */
function createLinks (ownerEl, rootEl) {
  const routeEls = rootEl.querySelectorAll('[route]')

  routeEls.forEach(el => {
    updateLink(el, ownerEl)
  })
}

function linkClickHandler (e) {
  if (e.button !== 0 || isModifiedEvent(e)) return
  e.preventDefault()
  const el = e.selectorTarget
  const routeName = el.getAttribute('route')
  if (!routeName) return
  const params = getRouteProp(this, routeName, el, 'params', 'param-')
  const query = getRouteProp(this, routeName, el, 'query', 'query-')
  const method = el.hasAttribute('replace') ? 'replaceWith' : 'transitionTo'
  router[method](routeName, params, query)
}

/**
 * @export
 * @param {HTMLElement} ownerEl
 * @param {RouterLinksOptions} [options={}]
 * @return {Function}
 */
export function bindRouterLinks (ownerEl, options = {}) {
  const { selector = '[routerlinks]' } = options
  const rootEls = selector ? ownerEl.querySelectorAll(selector) : [ownerEl]
  const observer = new MutationObserver(mutationHandler)
  const eventHandlers = []
  observer.ownerEl = ownerEl
  ownerEl[routerLinksData] = { options, rootEls, observer }
  rootEls.forEach(rootEl => {
    eventHandlers.push(delegate(rootEl, 'click', '[route]', linkClickHandler, ownerEl))
    createLinks(ownerEl, rootEl)
    observer.observe(rootEl, elementsObserverConfig)
  })
  linkContainers.add(ownerEl)

  return function () {
    linkContainers.delete(ownerEl)
    eventHandlers.forEach((eventHandler, i) => undelegate(rootEls[i], eventHandler))
  }
}

const createClass = (ctor, options = {}) => {
  return class extends ctor {
    connectedCallback () {
      super.connectedCallback && super.connectedCallback()
      const renderWait = this.updateComplete || resolved
      renderWait.then(() => {
        this[unbindRouterLinks] = bindRouterLinks(this, options)
      })
    }

    disconnectedCallback () {
      super.disconnectedCallback && super.disconnectedCallback()
      if (this[unbindRouterLinks]) {
        this[unbindRouterLinks]()
      }
    }
  }
}

export const withRouterLinks = (optionsOrCtorOrDescriptor, options) => {
  // current state of decorators sucks. Lets abuse of duck typing
  if (typeof optionsOrCtorOrDescriptor === 'function') {
    // constructor -> typescript decorator or class mixin
    return createClass(optionsOrCtorOrDescriptor, options)
  }
  if (optionsOrCtorOrDescriptor.kind === 'class') {
    // descriptor -> spec decorator
    const { kind, elements } = optionsOrCtorOrDescriptor
    return {
      kind,
      elements,
      finisher (ctor) {
        return createClass(ctor, options)
      }
    }
  }
  // optionsOrCtorOrDescriptor === options
  return (ctorOrDescriptor) => {
    return withRouterLinks(ctorOrDescriptor, optionsOrCtorOrDescriptor)
  }
}

function create (instance) {
  router = instance
}

function done () {
  linkContainers.forEach(ownerEl => {
    const data = ownerEl[routerLinksData]
    data.rootEls.forEach(rootEl => {
      rootEl.querySelectorAll('[route]').forEach(el => {
        const routeName = el.getAttribute('route')
        if (!routeName) return
        const params = getRouteProp(ownerEl, routeName, el, 'params', 'param-')
        const query = getRouteProp(ownerEl, routeName, el, 'query', 'query-')
        updateActiveClass(el, routeName, params, query)
      })
    })
  })
}

export const routerLinks = {
  create,
  done
}
