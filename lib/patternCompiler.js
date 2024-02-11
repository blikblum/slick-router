import { parse } from 'regexparam'

const splatRegex = /:(\w+)\*/

export function patternCompiler(pattern) {
  // hack to add (partial) named splat support
  const splatMatch = splatRegex.exec(pattern)
  const normalizedPattern = splatMatch ? pattern.replace(splatRegex, '*') : pattern

  const { pattern: matcher, keys } = parse(normalizedPattern)

  const paramNames = splatMatch ? keys.map((key) => (key === '*' ? splatMatch[1] : key)) : keys

  return {
    matcher,
    paramNames,
  }
}
