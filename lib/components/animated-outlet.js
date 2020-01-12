const handler = {
  beforeAdd (outlet, el) {
    el.style.display = 'none'
  },

  enter (outlet, el) {
    console.log('runAdd')
    el.style.display = 'block'
    el.classList.add('animated', 'rotateInDownRight')
    el.addEventListener(
      'animationend',
      () => {
        el.classList.remove('animated', 'rotateInDownRight')
      },
      { once: true }
    )
  },

  leave (outlet, el, done) {
    el.classList.add('animated', 'hinge')
    el.addEventListener(
      'animationend',
      done,
      { once: true }
    )
  }
}

export class AnimatedOutlet extends HTMLElement {
  appendChild (el) {
    console.log('appendChild')
    handler.beforeAdd(this, el)
    super.appendChild(el)
    if (this.removing) {
      // when removing a previous el, append animation is run after remove one
      this.appending = el
    } else {
      handler.enter(this, el)
    }
  }

  removeChild (el) {
    console.log('removeChild', el, 'removing', this.removing)
    if (this.removing && this.removing.parentNode === this) {
      super.removeChild(this.removing)
    }

    if (el === this.appending) {
      console.log('removing while appending')
      if (el.parentNode === this) {
        super.removeChild(el)
      }
      this.removing = null
      return
    }

    this.removing = el
    handler.leave(this, el, () => {
      console.log('removeChild:animationEnd')
      if (this.removing.parentNode === this) {
        super.removeChild(this.removing)
      }
      if (this.appending) handler.enter(this, this.appending)
      this.appending = null
      this.removing = null
    })
  }
}
