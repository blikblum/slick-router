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
let noopHook

export function registerAnimation (name, AnimationHookClass, options = {}) {
  animationRegistry[name] = new AnimationHookClass(options)
}

function getAnimationHook (name) {
  return animationRegistry[name] || noopHook || (noopHook = new AnimationHook())
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
      if (this.removing.parentNode === this) {
        super.removeChild(this.removing)
      }
      if (this.appending) hook.enter(this, this.appending)
      this.appending = null
      this.removing = null
    })
  }
}
