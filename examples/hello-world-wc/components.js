import { withRouterLinks } from 'slick-router/middlewares/router-links.js'

class ApplicationView extends withRouterLinks(HTMLElement) {
  static get outlet() {
    return '.Container'
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
        <div class='Container'></div>
      </div>
  `
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
