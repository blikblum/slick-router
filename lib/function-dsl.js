/* eslint-disable node/no-callback-literal */
import invariant from './invariant'

export default function functionDsl (callback) {
  let ancestors = []
  const matches = {}
  const names = {}

  callback(function route (name, options, childrenCallback) {
    let routes

    invariant(!names[name], 'Route names must be unique, but route "%s" is declared multiple times', name)

    names[name] = true

    if (arguments.length === 1) {
      options = {}
    }

    if (arguments.length === 2 && typeof options === 'function') {
      childrenCallback = options
      options = {}
    }

    if (typeof options.path !== 'string') {
      const parts = name.split('.')
      options.path = parts[parts.length - 1]
    }

    // go to the next level
    if (childrenCallback) {
      ancestors = ancestors.concat(name)
      childrenCallback()
      routes = pop()
      ancestors.splice(-1)
    }

    // add the node to the tree
    push({
      name: name,
      path: options.path,
      routes: routes || [],
      options: options
    })
  })

  function pop () {
    return matches[currentLevel()] || []
  }

  function push (route) {
    const level = currentLevel()
    matches[level] = matches[level] || []
    matches[level].push(route)
  }

  function currentLevel () {
    return ancestors.join('.')
  }

  return pop()
}
