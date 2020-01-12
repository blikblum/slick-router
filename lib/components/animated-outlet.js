const defaultHandler = {
  beforeAdd (outlet, el) {

  },

  enter (outlet, el) {

  },

  leave (outlet, el, done) {
    done()
  }
}

export const animateCSSHandler = {
  beforeAdd (outlet, el, options) {
    const enter = outlet.getAttribute('enter') || options.enter
    if (enter) {
      el.style.display = 'none'
    }
  },

  enter (outlet, el, options) {
    const enter = outlet.getAttribute('enter') || options.enter
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
  },

  leave (outlet, el, done, options) {
    const leave = outlet.getAttribute('leave') || options.leave
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

export function registerAnimation (name, handler, options = {}) {
  animationRegistry[name] = { handler, options }
}

function getAnimationConfig (name) {
  return animationRegistry[name] || { handler: defaultHandler, options: {} }
}

export class AnimatedOutlet extends HTMLElement {
  appendChild (el) {
    if (!this.hasAttribute('animation')) {
      super.appendChild(el)
      return
    }
    const config = getAnimationConfig(this.getAttribute('animation'))

    config.handler.beforeAdd(this, el, config.options)
    super.appendChild(el)
    if (this.removing) {
      // when removing a previous el, append animation is run after remove one
      this.appending = el
    } else {
      config.handler.enter(this, el, config.options)
    }
  }

  removeChild (el) {
    if (!this.hasAttribute('animation')) {
      super.removeChild(el)
      return
    }
    const config = getAnimationConfig(this.getAttribute('animation'))

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
    config.handler.leave(this, el, () => {
      if (this.removing.parentNode === this) {
        super.removeChild(this.removing)
      }
      if (this.appending) config.handler.enter(this, this.appending, config.options)
      this.appending = null
      this.removing = null
    }, config.options)
  }
}
