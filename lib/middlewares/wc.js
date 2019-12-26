const resolved = Promise.resolve()
let routeElMap = Object.create(null)
let routeComponentMap = Object.create(null)
let router, rootOutlet

function create (instance) {
  router = instance
  rootOutlet = instance.options.outlet || document.body
}

function destroy () {
  router = null
  routeElMap = Object.create(null)
  routeComponentMap = Object.create(null)
}

function isEqual (obj1, obj2) {
  const keys1 = Object.keys(obj1)
  return keys1.length === Object.keys(obj2).length &&
    keys1.every(key => obj2[key] === obj1[key])
}

function getOutlet (el) {
  const renderRoot = el.shadowRoot || el
  return renderRoot.querySelector('router-outlet')
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

async function renderElements (transition, activated, changingIndex) {
  for (let i = 0; i < activated.length; i++) {
    const { el } = activated[i]
    if (el) {
      const parent = transition.routes[changingIndex + i - 1]
      const parentEl = parent && routeElMap[parent.name]
      const outletEl = parent ? parentEl && getOutlet(parentEl) : rootOutlet
      if (outletEl) {
        while (outletEl.firstChild) {
          outletEl.removeChild(outletEl.firstChild)
        }
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
  transition.routes.forEach(route => {
    const el = routeElMap[route.name]
    if (el) {
      el.$route = router.state
    }
  })
}

export const wc = {
  create,
  destroy,
  resolve,
  done
}
