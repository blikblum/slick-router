let toString = Object.prototype.toString
let keys = Object.keys
let assoc = (obj, attr, val) => { obj[attr] = val; return obj }
let isArray = Array.isArray

export let clone = obj =>
  obj
    ? isArray(obj)
      ? obj.slice(0)
      : Object.assign({}, obj)
    : obj

export let pick = (obj, attrs) =>
  attrs.reduce((acc, attr) =>
    obj[attr] === undefined
      ? acc
      : assoc(acc, attr, obj[attr]), {})

export let isEqual = (obj1, obj2) => {
  const keys1 = keys(obj1)
  return keys1.length === keys(obj2).length &&
    keys1.every(key => obj2[key] === obj1[key])
}

export let extend = (obj, ...rest) => {
  rest.forEach(source => {
    if (source) {
      for (let prop in source) {
        obj[prop] = source[prop]
      }
    }
  })
  return obj
}

export let isString = obj =>
  toString.call(obj) === '[object String]'
