export class AnimationHook {
  constructor (options = {}) {
    this.options = options
  }

  getOption (outlet, name) {
    return outlet.hasAttribute(name) ? outlet.getAttribute(name) : this.options[name]
  }

  hasOption (outlet, name) {
    return outlet.hasAttribute(name) || this.options[name]
  }

  beforeAdd (outlet, el) {

  }

  enter (outlet, el) {

  }

  leave (outlet, el, done) {
    done()
  }
}

// code extracted from vue
var raf = window.requestAnimationFrame
var TRANSITION = 'transition'
var ANIMATION = 'animation'

// Transition property/event sniffing
var transitionProp = 'transition'
var transitionEndEvent = 'transitionend'
var animationProp = 'animation'
var animationEndEvent = 'animationend'

function nextFrame (fn) {
  raf(function () {
    raf(fn)
  })
}

function whenTransitionEnds (
  el,
  expectedType,
  cb
) {
  var ref = getTransitionInfo(el, expectedType)
  var type = ref.type
  var timeout = ref.timeout
  var propCount = ref.propCount
  if (!type) { return cb() }
  var event = type === TRANSITION ? transitionEndEvent : animationEndEvent
  var ended = 0
  var end = function () {
    el.removeEventListener(event, onEnd)
    cb()
  }
  var onEnd = function (e) {
    if (e.target === el) {
      if (++ended >= propCount) {
        end()
      }
    }
  }
  setTimeout(function () {
    if (ended < propCount) {
      end()
    }
  }, timeout + 1)
  el.addEventListener(event, onEnd)
}

var transformRE = /\b(transform|all)(,|$)/

function getTransitionInfo (el, expectedType) {
  var styles = window.getComputedStyle(el)
  // JSDOM may return undefined for transition properties
  var transitionDelays = (styles[transitionProp + 'Delay'] || '').split(', ')
  var transitionDurations = (styles[transitionProp + 'Duration'] || '').split(', ')
  var transitionTimeout = getTimeout(transitionDelays, transitionDurations)
  var animationDelays = (styles[animationProp + 'Delay'] || '').split(', ')
  var animationDurations = (styles[animationProp + 'Duration'] || '').split(', ')
  var animationTimeout = getTimeout(animationDelays, animationDurations)

  var type
  var timeout = 0
  var propCount = 0
  /* istanbul ignore if */
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION
      timeout = transitionTimeout
      propCount = transitionDurations.length
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION
      timeout = animationTimeout
      propCount = animationDurations.length
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout)
    type = timeout > 0
      ? transitionTimeout > animationTimeout
        ? TRANSITION
        : ANIMATION
      : null
    propCount = type
      ? type === TRANSITION
        ? transitionDurations.length
        : animationDurations.length
      : 0
  }
  var hasTransform =
    type === TRANSITION &&
    transformRE.test(styles[transitionProp + 'Property'])
  return {
    type: type,
    timeout: timeout,
    propCount: propCount,
    hasTransform: hasTransform
  }
}

function getTimeout (delays, durations) {
  /* istanbul ignore next */
  while (delays.length < durations.length) {
    delays = delays.concat(delays)
  }

  return Math.max.apply(null, durations.map(function (d, i) {
    return toMs(d) + toMs(delays[i])
  }))
}

// Old versions of Chromium (below 61.0.3163.100) formats floating pointer numbers
// in a locale-dependent way, using a comma instead of a dot.
// If comma is not replaced with a dot, the input will be rounded down (i.e. acting
// as a floor function) causing unexpected behaviors
function toMs (s) {
  return Number(s.slice(0, -1).replace(',', '.')) * 1000
}

class GenericCSS extends AnimationHook {
  beforeAdd (outlet, el) {
    const name = outlet.getAttribute('animation') || 'outlet'
    el.classList.add(`${name}-enter`)
  }

  enter (outlet, el) {
    const name = outlet.getAttribute('animation') || 'outlet'
    el.classList.add(`${name}-enter-active`)
    nextFrame(function () {
      el.classList.remove(`${name}-enter`)
      el.classList.add(`${name}-enter-to`)
      whenTransitionEnds(el, undefined, function () {
        el.classList.remove(`${name}-enter-active`, `${name}-enter-to`)
      })
    })
  }

  leave (outlet, el, done) {
    const name = outlet.getAttribute('animation') || 'outlet'
    el.classList.add(`${name}-leave`)
    el.classList.add(`${name}-leave-active`)
    nextFrame(function () {
      el.classList.remove(`${name}-leave`)
      el.classList.add(`${name}-leave-to`)
      whenTransitionEnds(el, undefined, function () {
        el.classList.remove(`${name}-leave-active`, `${name}-leave-to`)
        done()
      })
    })
  }
}

export class AnimateCSS extends AnimationHook {
  beforeAdd (outlet, el) {
    const enter = this.getOption(outlet, 'enter')
    if (enter) {
      el.style.display = 'none'
    }
  }

  enter (outlet, el) {
    const enter = this.getOption(outlet, 'enter')
    if (!enter) return
    el.style.display = 'block'
    el.classList.add('animated', enter)
    el.addEventListener(
      'animationend',
      () => {
        el.classList.remove('animated', enter)
      },
      { once: true }
    )
  }

  leave (outlet, el, done) {
    const leave = this.getOption(outlet, 'leave')
    if (!leave) {
      done()
      return
    }
    el.classList.add('animated', leave)
    el.addEventListener(
      'animationend',
      done,
      { once: true }
    )
  }
}

const animationRegistry = {}
let defaultHook

export function registerAnimation (name, AnimationHookClass, options = {}) {
  animationRegistry[name] = new AnimationHookClass(options)
}

function getAnimationHook (name) {
  return animationRegistry[name] || defaultHook || (defaultHook = new GenericCSS())
}

export class AnimatedOutlet extends HTMLElement {
  appendChild (el) {
    if (!this.hasAttribute('animation')) {
      super.appendChild(el)
      return
    }
    const hook = getAnimationHook(this.getAttribute('animation'))

    hook.beforeAdd(this, el)
    super.appendChild(el)
    if (this.removing) {
      // when removing a previous el, append animation is run after remove one
      this.appending = el
    } else {
      hook.enter(this, el)
    }
  }

  removeChild (el) {
    if (!this.hasAttribute('animation')) {
      super.removeChild(el)
      return
    }
    const hook = getAnimationHook(this.getAttribute('animation'))

    if (this.removing && this.removing.parentNode === this) {
      super.removeChild(this.removing)
    }

    if (el === this.appending) {
      if (el.parentNode === this) {
        super.removeChild(el)
      }
      this.removing = null
      return
    }

    this.removing = el
    hook.leave(this, el, () => {
      if (this.removing && this.removing.parentNode === this) {
        super.removeChild(this.removing)
      }
      if (this.appending) hook.enter(this, this.appending)
      this.appending = null
      this.removing = null
    })
  }
}
