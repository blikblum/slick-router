import { withRouterLinks } from 'slick-router/middlewares/router-links.js'
import { AnimatedOutlet, registerAnimation, animateCSSHandler } from '../../lib/components/animated-outlet.js'

registerAnimation('main', animateCSSHandler, {enter: 'rotateInDownRight', leave: 'hinge'})

customElements.define('router-outlet', AnimatedOutlet)

const enterAnimationSelect = `<select id="enter-animation" name="enter-animation">
  <option value="none">none</option>
  
  <optgroup label="Attention Seekers">
    <option value="bounce">bounce</option>
    <option value="flash">flash</option>
    <option value="pulse">pulse</option>
    <option value="rubberBand">rubberBand</option>
    <option value="shake">shake</option>
    <option value="swing">swing</option>
    <option value="tada">tada</option>
    <option value="wobble">wobble</option>
    <option value="jello">jello</option>
  </optgroup>

  <optgroup label="Bouncing Entrances">
    <option value="bounceIn">bounceIn</option>
    <option value="bounceInDown">bounceInDown</option>
    <option value="bounceInLeft">bounceInLeft</option>
    <option value="bounceInRight">bounceInRight</option>
    <option value="bounceInUp">bounceInUp</option>
  </optgroup>        

  <optgroup label="Fading Entrances">
    <option value="fadeIn">fadeIn</option>
    <option value="fadeInDown">fadeInDown</option>
    <option value="fadeInDownBig">fadeInDownBig</option>
    <option value="fadeInLeft">fadeInLeft</option>
    <option value="fadeInLeftBig">fadeInLeftBig</option>
    <option value="fadeInRight">fadeInRight</option>
    <option value="fadeInRightBig">fadeInRightBig</option>
    <option value="fadeInUp">fadeInUp</option>
    <option value="fadeInUpBig">fadeInUpBig</option>
  </optgroup>

  <optgroup label="Flippers">
    <option value="flip">flip</option>
    <option value="flipInX">flipInX</option>
    <option value="flipInY">flipInY</option>          
  </optgroup>

  <optgroup label="Lightspeed">
    <option value="lightSpeedIn">lightSpeedIn</option>
  </optgroup>

  <optgroup label="Rotating Entrances">
    <option value="rotateIn">rotateIn</option>
    <option value="rotateInDownLeft">rotateInDownLeft</option>
    <option value="rotateInDownRight" selected>rotateInDownRight</option>
    <option value="rotateInUpLeft">rotateInUpLeft</option>
    <option value="rotateInUpRight">rotateInUpRight</option>
  </optgroup>

  <optgroup label="Sliding Entrances">
    <option value="slideInUp">slideInUp</option>
    <option value="slideInDown">slideInDown</option>
    <option value="slideInLeft">slideInLeft</option>
    <option value="slideInRight">slideInRight</option>
  </optgroup>

  <optgroup label="Zoom Entrances">
    <option value="zoomIn">zoomIn</option>
    <option value="zoomInDown">zoomInDown</option>
    <option value="zoomInLeft">zoomInLeft</option>
    <option value="zoomInRight">zoomInRight</option>
    <option value="zoomInUp">zoomInUp</option>
  </optgroup>

  <optgroup label="Specials">
    <option value="hinge">hinge</option>
    <option value="rollIn">rollIn</option>          
  </optgroup>      
</select>
`

const leaveAnimationSelect = `<select id="leave-animation" name="leave-animation">
  <option value="none">none</option>            
  
  <optgroup label="Attention Seekers">
    <option value="bounce">bounce</option>
    <option value="flash">flash</option>
    <option value="pulse">pulse</option>
    <option value="rubberBand">rubberBand</option>
    <option value="shake">shake</option>
    <option value="swing">swing</option>
    <option value="tada">tada</option>
    <option value="wobble">wobble</option>
    <option value="jello">jello</option>
  </optgroup>

  <optgroup label="Bouncing Exits">
    <option value="bounceOut">bounceOut</option>
    <option value="bounceOutDown">bounceOutDown</option>
    <option value="bounceOutLeft">bounceOutLeft</option>
    <option value="bounceOutRight">bounceOutRight</option>
    <option value="bounceOutUp">bounceOutUp</option>
  </optgroup>

  <optgroup label="Fading Exits">
    <option value="fadeOut">fadeOut</option>
    <option value="fadeOutDown">fadeOutDown</option>
    <option value="fadeOutDownBig">fadeOutDownBig</option>
    <option value="fadeOutLeft">fadeOutLeft</option>
    <option value="fadeOutLeftBig">fadeOutLeftBig</option>
    <option value="fadeOutRight">fadeOutRight</option>
    <option value="fadeOutRightBig">fadeOutRightBig</option>
    <option value="fadeOutUp">fadeOutUp</option>
    <option value="fadeOutUpBig">fadeOutUpBig</option>
  </optgroup>

  <optgroup label="Flippers">
    <option value="flip">flip</option>
    <option value="flipOutX">flipOutX</option>
    <option value="flipOutY">flipOutY</option>
  </optgroup>

  <optgroup label="Lightspeed">       
    <option value="lightSpeedOut">lightSpeedOut</option>
  </optgroup>

  <optgroup label="Rotating Exits">
    <option value="rotateOut">rotateOut</option>
    <option value="rotateOutDownLeft">rotateOutDownLeft</option>
    <option value="rotateOutDownRight">rotateOutDownRight</option>
    <option value="rotateOutUpLeft">rotateOutUpLeft</option>
    <option value="rotateOutUpRight">rotateOutUpRight</option>
  </optgroup>

  <optgroup label="Sliding Exits">
    <option value="slideOutUp">slideOutUp</option>
    <option value="slideOutDown">slideOutDown</option>
    <option value="slideOutLeft">slideOutLeft</option>
    <option value="slideOutRight">slideOutRight</option>
  </optgroup>


  <optgroup label="Zoom Exits">
    <option value="zoomOut">zoomOut</option>
    <option value="zoomOutDown">zoomOutDown</option>
    <option value="zoomOutLeft">zoomOutLeft</option>
    <option value="zoomOutRight">zoomOutRight</option>
    <option value="zoomOutUp">zoomOutUp</option>
  </optgroup>

  <optgroup label="Specials">
    <option value="hinge" selected>hinge</option>          
    <option value="rollOut">rollOut</option>
  </optgroup>
</select>`

class ApplicationView extends withRouterLinks(HTMLElement) {
  constructor() {
    super()
    this.addEventListener('change', (e) => {
      if (e.target.matches('#leave-animation')) {
        this.outlet.setAttribute('leave', e.target.value)
      }
      if (e.target.matches('#enter-animation')) {
        this.outlet.setAttribute('enter', e.target.value)
      }
    })
  }

  connectedCallback() {
    super.connectedCallback()
    this.innerHTML = `
      <div class='App'>
        <div class='App-header'>
          <h1>Application</h1>
          <ul class='Nav' routerlinks>
            <li class='Nav-item'><a route="home">Home</a></li>
            <li class='Nav-item'><a route="messages">Messages</a></li>
            <li class='Nav-item'><a route="profile.index" param-user="scrobblemuch">Profile</a></li>
          </ul>
        </div>
        <router-outlet animation="main"></router-outlet>
        
        <div class="App-footer">
          Enter Animation
          ${enterAnimationSelect}
          Leave Animation
          ${leaveAnimationSelect}
        </div>  
      </div>
    `
    this.outlet = this.querySelector('router-outlet')
  }
}

customElements.define('application-view', ApplicationView)

class HomeView extends withRouterLinks(HTMLElement) {
  connectedCallback() {
    super.connectedCallback()
    this.innerHTML = `
      <div class='Home' routerlinks>
        <h2>Tweets</h2>
        <div class='Tweet'>
          <div class='Tweet-author'>
          <a route="profile.index" param-user="dan_abramov">Dan Abramov ‏@dan_abramov</a>
          </div>
          <div class='Tweet-time'>12m12 minutes ago</div>
          <div class='Tweet-content'>Another use case for \`this.context\` I think might be valid: forms. They're too painful right now.</div>
        </div>
        <div class='Tweet'>
          <div class='Tweet-author'>
            <a route="profile.index" param-user="afanasjevas">Eduardas Afanasjevas ‏@afanasjevas</a>
          </div>
          <div class='Tweet-time'>12m12 minutes ago</div>
          <div class='Tweet-content'>I just published “What will Datasmoothie bring to the analytics startup landscape?” https://medium.com/@afanasjevas/what-will-datasmoothie-bring-to-the-analytics-startup-landscape-f7dab70d75c3?source=tw-81c4e81fe6f8-1427630532296</div>
        </div>
        <div class='Tweet'>
          <div class='Tweet-author'>
            <a route="profile.index" param-user="LNUGorg">LNUG ‏@LNUGorg</a>
          </div>
          <div class='Tweet-time'>52m52 minutes ago</div>
          <div class='Tweet-content'> new talks uploaded on our YouTube page - check them out http://bit.ly/1yoXSAO</div>
        </div>
      </div>
    `
  }
}

customElements.define('home-view', HomeView)

class MessagesView extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class='Messages'>
        <h2>Messages</h2>
        <p>You have no direct messages</p>
      </div>
    `
  }
}

customElements.define('messages-view', MessagesView)

class ProfileView extends HTMLElement {
  static get outlet() {
    return '.Container'
  }

  connectedCallback() {
    this.innerHTML = `
      <div class='Profile'>
        <div class='Container'></div>
      </div>
    `
  }
}

customElements.define('profile-view', ProfileView)


class ProfileIndexView extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class='ProfileIndex'>
        <h2>${this.$route.params.user} profile</h2>
      </div>
    `
  }
}

customElements.define('profile-index-view', ProfileIndexView)
