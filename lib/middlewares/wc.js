const resolved = Promise.resolve()
let routeElMap = Object.create(null)
let routeComponentMap = Object.create(null)
let router, rootOutlet, rootOutletEl

function parseNumber (value) {
  const n = parseFloat(value)
  const isNumeric = value == n // eslint-disable-line eqeqeq
  return isNumeric ? n : value
}

class TransitionValue {
  constructor (key, format) {
    this.key = key
    this.format = format
  }

  value (transition) {
    let result = this.getValue(transition)
    if (result !== undefined) {
      const format = this.format
      if (format === 'number') {
        result = parseNumber(result)
      } else if (typeof format === 'function') {
        result = format(result)
      }
    }
    return result
  }
}

class ParamValue extends TransitionValue {
  getValue (transition) {
    return transition.params[this.key]
  }
}

class QueryValue extends TransitionValue {
  getValue (transition) {
    return transition.query[this.key]
  }
}

export function paramValue (key, format) {
  return new ParamValue(key, format)
}

export function queryValue (key, format) {
  return new QueryValue(key, format)
}

function create (instance) {
  router = instance
  rootOutlet = instance.options.outlet
}

function destroy () {
  router = null
  routeElMap = Object.create(null)
  routeComponentMap = Object.create(null)
  rootOutletEl = null
}

function isEqual (obj1, obj2) {
  const keys1 = Object.keys(obj1)
  return keys1.length === Object.keys(obj2).length &&
    keys1.every(key => obj2[key] === obj1[key])
}

function getOutlet (el) {
  const renderRoot = el.shadowRoot || el
  return renderRoot.querySelector(el.constructor.outlet || 'router-outlet')
}

function resolveRootOutlet () {
  if (rootOutletEl) return rootOutletEl
  if (!rootOutlet) return document.body
  rootOutletEl = typeof rootOutlet === 'string' ? document.querySelector(rootOutlet) : rootOutlet
  if (!rootOutletEl) {
    throw new Error(`slick-router(wc): Invalid outlet option ${rootOutlet}`)
  }
  return rootOutletEl
}

function getParentEl (transition, parentIndex) {
  let parent = transition.routes[parentIndex]
  while (parent) {
    if (parent.options.component) {
      return routeElMap[parent.name]
    }
    parent = transition.routes[--parentIndex]
  }
}

function getChangingIndex (prevRoutes, currentRoutes) {
  let index, prev, current
  const count = Math.max(prevRoutes.length, currentRoutes.length)
  for (index = 0; index < count; index++) {
    prev = prevRoutes[index]
    current = currentRoutes[index]
    if (!(prev && current) || (prev.name !== current.name) || !isEqual(prev.params, current.params)) {
      break
    }
  }
  return index
}

async function runLifeCycle (transition, routes, prefix, suffix) {
  for (let i = 0; i < routes.length; i++) {
    let result
    const { route, el } = routes[i]
    const routeMethod = route.options[`${prefix}${suffix}`]
    if (typeof routeMethod === 'function') {
      result = await routeMethod(transition)
      if (result === false) {
        transition.cancel()
      }
    }
    if (transition.isCancelled) break
    const elMethod = el && el[`${prefix}Route${suffix}`]
    if (typeof elMethod === 'function') {
      result = await elMethod.call(el, transition)
      if (result === false) {
        transition.cancel()
      }
    }
    if (transition.isCancelled) break
  }
}

function resolveModule (value) {
  return value && value.__esModule ? value.default : value
}

async function resolveComponents (routes) {
  const result = []

  for (const route of routes) {
    let el
    let Component = route.options.component
    if (Component) {
      if (typeof Component === 'function' && !(Component.prototype instanceof HTMLElement)) {
        Component = routeComponentMap[route.name] || (routeComponentMap[route.name] = resolveModule(await Component(route)))
      }
      el = typeof Component === 'string' ? document.createElement(Component) : new Component()
      routeElMap[route.name] = el
      el.$router = router
    }
    result.push({ el, route })
  }
  return result
}

function applyProperties (transition, el, properties) {
  if (properties) {
    Object.keys(properties).forEach(key => {
      const value = properties[key]
      el[key] = value instanceof TransitionValue ? value.value(transition) : value
    })
  }
}

async function renderElements (transition, activated, changingIndex) {
  // set properties of not activated elements
  const { path, pathname, routes, params, query } = transition
  const routeState = { path, pathname, routes, params, query }
  for (let k = 0; k < changingIndex; k++) {
    const route = transition.routes[k]
    const el = routeElMap[route.name]
    if (el) {
      el.$route = routeState
      applyProperties(transition, el, route.options.properties)
    }
  }
  for (let i = 0; i < activated.length; i++) {
    const { el, route } = activated[i]
    if (el) {
      const parentEl = getParentEl(transition, changingIndex + i - 1)
      const outletEl = parentEl ? getOutlet(parentEl) : resolveRootOutlet()
      if (outletEl) {
        while (outletEl.firstChild) {
          outletEl.removeChild(outletEl.firstChild)
        }
        el.$route = routeState
        applyProperties(transition, el, route.options.properties)
        outletEl.appendChild(el)
        await (el.updateComplete || resolved)
      }
    }
  }
}

async function resolve (transition) {
  const prevRoutes = transition.prev.routes
  const changingIndex = getChangingIndex(prevRoutes, transition.routes)
  const deactivated = []

  // deactivate previous routes from child to parent
  for (let routeIndex = prevRoutes.length - 1; routeIndex >= changingIndex; routeIndex--) {
    const route = prevRoutes[routeIndex]
    const el = routeElMap[route.name]
    if (el) {
      deactivated.push({ el, route })
    }
  }

  await runLifeCycle(transition, deactivated, 'before', 'Leave')

  if (transition.isCancelled) return

  const activated = await resolveComponents(transition.routes.slice(changingIndex))

  await runLifeCycle(transition, activated, 'before', 'Enter')

  if (transition.isCancelled) return

  await renderElements(transition, activated, changingIndex)

  deactivated.forEach(({ route }) => {
    if (!activated.some(({ route: activeRoute }) => activeRoute.name === route.name)) {
      routeElMap[route.name] = undefined
    }
  })

  transition.activated = activated
  transition.deactivated = deactivated
}

function done (transition) {
  runLifeCycle(transition, transition.deactivated, 'after', 'Leave')
  runLifeCycle(transition, transition.activated, 'after', 'Enter')
}

export const wc = {
  create,
  destroy,
  resolve,
  done
}
