import { pathToRegexp } from 'path-to-regexp'

export function patternCompiler (pattern) {
  const paramNames = []
  const re = pathToRegexp(pattern, paramNames)

  return {
    matcher: re,
    paramNames: paramNames.map(p => p.name)
  }
}
