# animated-outlet component

Enable animation on web component swapping triggered by route transitions.
    
## Usage

1) Register a `AnimatedOutlet` web component to the tag to be used as router outlet. wc middleware uses 'router-outlet' tag as default, but any tag can be used.

```javascript
import { AnimatedOutlet } from 'slick-router/components/animated-outlet'

customElements.define('router-outlet', AnimatedOutlet)
```

2) Add an 'animation' attribute to the outlet that will be animated

```html
<router-outlet animation></router-outlet>
```

3) Write the animation using CSS transition or animation

```css
.outlet-enter-active,
.outlet-leave-active {
  transition: opacity 0.5s;
}

.outlet-enter, .outlet-leave-to {
  opacity: 0;
}
```

The above example adds a fading effect to the element that is entering and the one which is leaving

> The API is based on [Vue one](https://vuejs.org/v2/guide/transitions.html#Transition-Classes) and most of the Vue animations can be converted with little changes

Is possible to configure the CSS classes prefix through animation attribute, allowing to create more than one animation in same app:

```html
<router-outlet animation="bounce"></router-outlet>
```

```css
.bounce-enter {
  opacity: 0;
}

.bounce-enter-active {
  animation: bounce-in 0.5s;
}

.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}
```

The example above uses classes prefixed with 'bounce-' instead of 'outlet-'

[Live Demo](https://codesandbox.io/s/slick-router-css-animations-q0fzs)

## Customization

Is possible to customize how animation is done by creating and registering animation hook classes. It must extend from AnimationHook:

```js
import { AnimationHook } from 'slick-router/components/animated-outlet.js'

class MyAnimation extends AnimationHook {  
  beforeEnter (outlet, el) {
    // prepare element before is connected
  }

  enter (outlet, el) {
    // run enter animation
  }

  leave (outlet, el, done) {
    // run leave animation and call done on finish
    done()
  }
}
```

The hook class can be registered as default with `setDefaultAnimation` or to predefined animations using `registerAnimation`

Out of box, is provided the `AnimateCSS` class that allows to use [animate.css](https://github.com/daneden/animate.css)

```js
import {
  AnimatedOutlet,
  AnimateCSS,
  setDefaultAnimation,
  registerAnimation
} from 'slick-router/components/animated-outlet.js'

setDefaultAnimation(AnimateCSS, { enter: 'fadeIn', leave: 'fadeOut' })

registerAnimation('funky', AnimateCSS, { enter: 'rotateInDownRight', leave: 'hinge' })
```

```html
<router-outlet animation></router-outlet> <!-- the default animate.css fade -->

<router-outlet animation enter="zoomIn" leave="zoomOut"></router-outlet> <!-- override animation using enter and leave attrs -->

<router-outlet animation="funky"></router-outlet> <!-- use the predefined funky animation -->
```

[Live demo](https://codesandbox.io/s/slick-router-animate-css-zpg96)

It's possible to use JS animation libraries like [GSAP](https://codesandbox.io/s/slick-router-gsap-animations-oqbp5) or even as [standalone component](https://codesandbox.io/s/animated-outlet-page-transitions-7vgcy) (without routing envolved)


