function Dom () {}
Dom.prototype = new Array() // eslint-disable-line
Dom.prototype.append = function (element) { element.forEach(function (e) { this[0].appendChild(e) }.bind(this)); return this }
Dom.prototype.remove = function () { this.forEach(function (e) { e.parentNode.removeChild(e) }); return this }
Dom.prototype.prepend = function (element) { element.forEach(function (e) { this[0].insertBefore(e, (this[0].hasChildNodes()) ? this[0].childNodes[0] : null) }.bind(this)); return this }
Dom.prototype.each = function (fn) { this.forEach(fn); return this }

function stringify (dom) {
  return dom.map(function (el) {
    return el.innerHTML
  }).join()
}

Dom.prototype.html = function (content) {
  if (content === undefined) {
    return stringify(this)
  }
  if (content instanceof Dom) {
    return this.empty().append(content)
  }
  this.forEach(function (e) { e.innerHTML = content })
  return this
}

Dom.prototype.find = function (selector) {
  const result = new Dom()
  this.forEach(function (el) {
    [].slice.call(el.querySelectorAll(selector)).forEach(function (e) { result.push(e) })
  })
  return result
}

Dom.prototype.empty = function () {
  this.forEach(function (el) {
    el.innerHTML = ''
  })
  return this
}

Dom.prototype.appendTo = function (target) {
  nanodom(target).append(this)
  return this
}

Dom.prototype.get = function (index) {
  return this[index]
}

function domify (str) { const d = document.createElement('div'); d.innerHTML = str; return d.childNodes }

const nanodom = function (selector) {
  let d
  if (selector instanceof Dom) return selector
  if (selector instanceof HTMLElement) { d = new Dom(); d.push(selector); return d }
  if (typeof selector !== 'string') return
  d = new Dom()
  const c = (selector.indexOf('<') === 0)
  const s = c ? domify(selector) : document.querySelectorAll(selector);
  [].slice.call(s).forEach(function (e) { d.push(e) })
  return d
}

export default nanodom
