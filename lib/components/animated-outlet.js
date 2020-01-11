export class AnimatedOutlet extends HTMLElement {
  runShowAnimation (el) {
    console.log('runShowAnimation')
    el.style.display = 'block'
    el.classList.add('animated', 'rotateInDownRight')
    el.addEventListener(
      'animationend',
      () => {
        el.classList.remove('animated', 'rotateInDownRight')
      },
      { once: true }
    )
  }

  appendChild (el) {
    console.log('appendChild')
    if (this.appending) {
      console.warn('delayed append', el.tagName)
      this.nextEl = el
      return
    }
    el.style.display = 'none'
    super.appendChild(el)
    if (this.isRemovingEl) {
      // when removing a previous el, append animation is run after remove one
      this.appending = el
    } else {
      this.runShowAnimation(el)
    }
  }

  removeChild (el) {
    console.log('removeChild')
    if (this.contains(el)) {
      // empty
      console.log('removeChild:isRemoving')
      this.isRemovingEl = true
      el.classList.add('animated', 'hinge')
      el.addEventListener(
        'animationend',
        () => {
          console.log('removeChild:animationEnd')
          if (el.parentNode === this) {
            super.removeChild(el)
          }
          if (this.appending) this.runShowAnimation(this.appending)
          this.appending = null
          this.isRemovingEl = false
          const nextEl = this.nextEl
          if (nextEl) {
            this.nextEl = null
            this.appendChild(nextEl)
          }
        },
        { once: true }
      )
    }
  }
}
