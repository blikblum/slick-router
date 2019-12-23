const resolved = Promise.resolve()
let routeElMap = Object.create(null)
let router, rootOutlet

function create (instance) {
  router = instance
  rootOutlet = instance.options.outlet || document.body
}

function destroy (instance) {
  router = null
  routeElMap = Object.create(null)
}

function isEqual (obj1, obj2) {
  const keys1 = Object.keys(obj1)
  return keys1.length === Object.keys(obj2).length &&
    keys1.every(key => obj2[key] === obj1[key])
}

function upperCaseFirst (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
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

async function runAsyncMethod (transition, routes, method) {
  for (let i = 0; i < routes.length; i++) {
    let result
    const { route, el } = routes[i]
    const routeMethod = route.options[method]
    if (typeof routeMethod === 'function') {
      result = await routeMethod(transition)
      if (result === false) {
        transition.cancel()
      }
    }
    if (transition.isCancelled) break
    const elMethod = el && el[`route${upperCaseFirst(method)}`]
    if (typeof elMethod === 'function') {
      result = await elMethod.call(el, transition)
      if (result === false) {
        transition.cancel()
      }
    }
    if (transition.isCancelled) break
  }
}

async function renderElements (transition, activated, changingIndex) {
  for (let i = 0; i < activated.length; i++) {
    let { route, el } = activated[i]
    const tagName = route.options.component
    if (tagName) {
      const parent = transition.routes[changingIndex + i - 1]
      const parentEl = parent && routeElMap[parent.name]
      const outletEl = parent ? parentEl && getOutlet(parentEl) : rootOutlet
      if (outletEl) {
        if (el) {
          el.$router = router
          el.$routeParams = transition.params
        } else {
          el = document.createElement(tagName)
          routeElMap[route.name] = el
          el.$router = router
          el.$routeParams = transition.params
          while (outletEl.firstChild) {
            outletEl.removeChild(outletEl.firstChild)
          }
          outletEl.appendChild(el)
          await (el.updateComplete || resolved)
        }
      }
    }
  }
}

async function next (transition) {
  const prevRoutes = transition.prev.routes
  const changingIndex = getChangingIndex(prevRoutes, transition.routes)
  const deactivated = []

  // deactivate previous routes
  for (let routeIndex = prevRoutes.length - 1; routeIndex >= changingIndex; routeIndex--) {
    const route = prevRoutes[routeIndex]
    const el = routeElMap[route.name]
    if (el) {
      deactivated.push({ el, route })
    }
  }

  await runAsyncMethod(transition, deactivated, 'beforeLeave')

  if (transition.isCancelled) return

  const activated = transition.routes
    .slice(changingIndex)
    .map(route => ({ el: routeElMap[route.name], route }))

  await runAsyncMethod(transition, activated, 'beforeEnter')

  if (transition.isCancelled) return

  await renderElements(transition, activated, changingIndex)
}

export const wc = {
  create,
  destroy,
  next
}
