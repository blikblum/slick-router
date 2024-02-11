import invariant from './invariant.js'

const paramInjectMatcher = /:([a-zA-Z_$][a-zA-Z0-9_$?]*[?+*]?)/g
const specialParamChars = /[+*?]$/g
const queryMatcher = /\?(.+)/

const _compiledPatterns = {}

function compilePattern(pattern, compiler) {
  if (!(pattern in _compiledPatterns)) {
    _compiledPatterns[pattern] = compiler(pattern)
  }

  return _compiledPatterns[pattern]
}

export function clearPatternCompilerCache() {
  for (const x in _compiledPatterns) {
    delete _compiledPatterns[x]
  }
}

/**
 * Returns an array of the names of all parameters in the given pattern.
 */
export function extractParamNames(pattern, compiler) {
  return compilePattern(pattern, compiler).paramNames
}

/**
 * Extracts the portions of the given URL path that match the given pattern
 * and returns an object of param name => value pairs. Returns null if the
 * pattern does not match the given path.
 */
export function extractParams(pattern, path, compiler) {
  const cp = compilePattern(pattern, compiler)
  const matcher = cp.matcher
  const paramNames = cp.paramNames
  const match = path.match(matcher)

  if (!match) {
    return null
  }

  const params = {}

  paramNames.forEach(function (paramName, index) {
    params[paramName] = match[index + 1] && decodeURIComponent(match[index + 1])
  })

  return params
}

/**
 * Returns a version of the given route path with params interpolated. Throws
 * if there is a dynamic segment of the route path for which there is no param.
 */
export function injectParams(pattern, params) {
  params = params || {}

  return pattern.replace(paramInjectMatcher, function (match, param) {
    const paramName = param.replace(specialParamChars, '')
    const lastChar = param.slice(-1)

    // If param is optional don't check for existence
    if (lastChar === '?' || lastChar === '*') {
      if (params[paramName] == null) {
        return ''
      }
    } else {
      invariant(
        params[paramName] != null,
        "Missing '%s' parameter for path '%s'",
        paramName,
        pattern,
      )
    }

    let paramValue = encodeURIComponent(params[paramName])
    if (lastChar === '*' || lastChar === '+') {
      // restore / for splats
      paramValue = paramValue.replace('%2F', '/')
    }
    return paramValue
  })
}

/**
 * Returns an object that is the result of parsing any query string contained
 * in the given path, null if the path contains no query string.
 */
export function extractQuery(qs, path) {
  const match = path.match(queryMatcher)
  return match && qs.parse(match[1])
}

/**
 * Returns a version of the given path with the parameters in the given
 * query merged into the query string.
 */
export function withQuery(qs, path, query) {
  const queryString = qs.stringify(query, { indices: false })

  if (queryString) {
    return withoutQuery(path) + '?' + queryString
  }

  return path
}

/**
 * Returns a version of the given path without the query string.
 */
export function withoutQuery(path) {
  return path.replace(queryMatcher, '')
}
