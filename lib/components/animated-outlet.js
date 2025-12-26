export class AnimationHook {
  constructor(options = {}) {
    this.options = options
  }

  getOption(outlet, name) {
    return outlet.hasAttribute(name) ? outlet.getAttribute(name) : this.options[name]
  }

  hasOption(outlet, name) {
    return outlet.hasAttribute(name) || this.options[name]
  }

  runParallel(outlet) {
    return this.hasOption(outlet, 'parallel')
  }

  beforeEnter(outlet, el) {}

  enter(outlet, el) {}

  leave(outlet, el, done) {
    done()
  }
}

// code extracted from vue
const raf = window.requestAnimationFrame
const TRANSITION = 'transition'
const ANIMATION = 'animation'

// Transition property/event sniffing
const transitionProp = 'transition'
const transitionEndEvent = 'transitionend'
const animationProp = 'animation'
const animationEndEvent = 'animationend'

function nextFrame(fn) {
  raf(function () {
    raf(fn)
  })
}

function whenTransitionEnds(el, cb) {
  const ref = getTransitionInfo(el)
  const type = ref.type
  const timeout = ref.timeout
  const propCount = ref.propCount
  if (!type) {
    return cb()
  }
  const event = type === TRANSITION ? transitionEndEvent : animationEndEvent
  let ended = 0
  const end = function () {
    el.removeEventListener(event, onEnd)
    cb()
  }
  const onEnd = function (e) {
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

function getTransitionInfo(el) {
  const styles = window.getComputedStyle(el)
  // JSDOM may return undefined for transition properties
  const transitionDelays = (styles[transitionProp + 'Delay'] || '').split(', ')
  const transitionDurations = (styles[transitionProp + 'Duration'] || '').split(', ')
  const transitionTimeout = getTimeout(transitionDelays, transitionDurations)
  const animationDelays = (styles[animationProp + 'Delay'] || '').split(', ')
  const animationDurations = (styles[animationProp + 'Duration'] || '').split(', ')
  const animationTimeout = getTimeout(animationDelays, animationDurations)

  const timeout = Math.max(transitionTimeout, animationTimeout)
  const type = timeout > 0 ? (transitionTimeout > animationTimeout ? TRANSITION : ANIMATION) : null
  const propCount = type
    ? type === TRANSITION
      ? transitionDurations.length
      : animationDurations.length
    : 0

  return {
    type,
    timeout,
    propCount,
  }
}

function getTimeout(delays, durations) {
  /* istanbul ignore next */
  while (delays.length < durations.length) {
    delays = delays.concat(delays)
  }

  return Math.max.apply(
    null,
    durations.map(function (d, i) {
      return toMs(d) + toMs(delays[i])
    }),
  )
}

// Old versions of Chromium (below 61.0.3163.100) formats floating pointer numbers
// in a locale-dependent way, using a comma instead of a dot.
// If comma is not replaced with a dot, the input will be rounded down (i.e. acting
// as a floor function) causing unexpected behaviors
function toMs(s) {
  return Number(s.slice(0, -1).replace(',', '.')) * 1000
}

function runTransition(el, name, type, cb) {
  el.classList.add(`${name}-${type}-active`)
  nextFrame(function () {
    el.classList.remove(`${name}-${type}`)
    el.classList.add(`${name}-${type}-to`)
    whenTransitionEnds(el, function () {
      el.classList.remove(`${name}-${type}-active`, `${name}-${type}-to`)
      if (cb) cb()
    })
  })
}

export class GenericCSS extends AnimationHook {
  beforeEnter(outlet, el) {
    const name = outlet.getAttribute('animation') || 'outlet'
    el.classList.add(`${name}-enter`)
  }

  enter(outlet, el) {
    const name = outlet.getAttribute('animation') || 'outlet'
    runTransition(el, name, 'enter')
  }

  leave(outlet, el, done) {
    const name = outlet.getAttribute('animation') || 'outlet'
    el.classList.add(`${name}-leave`)
    runTransition(el, name, 'leave', done)
  }
}

export class AnimateCSS extends AnimationHook {
  beforeEnter(outlet, el) {
    const enter = this.getOption(outlet, 'enter')
    if (enter) {
      el.style.display = 'none'
    }
  }

  enter(outlet, el) {
    const enter = this.getOption(outlet, 'enter')
    if (!enter) return
    el.style.display = 'block'
    el.classList.add('animated', enter)
    el.addEventListener(
      'animationend',
      () => {
        el.classList.remove('animated', enter)
      },
      { once: true },
    )
  }

  leave(outlet, el, done) {
    const leave = this.getOption(outlet, 'leave')
    if (!leave) {
      done()
      return
    }
    el.classList.add('animated', leave)
    el.addEventListener('animationend', done, { once: true })
  }
}

const animationRegistry = {}
let defaultHook

export function registerAnimation(name, AnimationHookClass, options = {}) {
  animationRegistry[name] = new AnimationHookClass(options)
}

export function setDefaultAnimation(AnimationHookClass, options = {}) {
  defaultHook = new AnimationHookClass(options)
}

function getAnimationHook(name) {
  return animationRegistry[name] || defaultHook || (defaultHook = new GenericCSS())
}

export class AnimatedOutlet extends HTMLElement {
  /**
   * @template {Node} T
   * @param {T} el
   * @returns {T}
   */
  appendChild(el) {
    if (!this.hasAttribute('animation')) {
      return super.appendChild(el)
    }
    const hook = getAnimationHook(this.getAttribute('animation'))
    const runParallel = hook.runParallel(this)

    hook.beforeEnter(this, el)
    super.appendChild(el)
    if (!runParallel && this.removing) {
      // when removing a previous el, append animation is run after remove one
      this.appending = el
    } else {
      hook.enter(this, el)
    }
    return el
  }

  /**
   * @template {Node} T
   * @param {T} el
   * @returns {T}
   */
  removeChild(el) {
    if (!this.hasAttribute('animation')) {
      return super.removeChild(el)
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
      return el
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
    return el
  }
}
