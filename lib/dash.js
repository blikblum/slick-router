const toString = Object.prototype.toString
const keys = Object.keys
const assoc = (obj, attr, val) => { obj[attr] = val; return obj }
const isArray = Array.isArray

export const clone = obj =>
  obj
    ? isArray(obj)
      ? obj.slice(0)
      : Object.assign({}, obj)
    : obj

export const pick = (obj, attrs) =>
  attrs.reduce((acc, attr) =>
    obj[attr] === undefined
      ? acc
      : assoc(acc, attr, obj[attr]), {})

export const isEqual = (obj1, obj2) => {
  const keys1 = keys(obj1)
  return keys1.length === keys(obj2).length &&
    keys1.every(key => obj2[key] === obj1[key])
}

export const extend = Object.assign

export const isString = obj =>
  toString.call(obj) === '[object String]'
