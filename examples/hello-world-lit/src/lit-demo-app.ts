import { html, LitElement } from 'lit'
import { routerLinks } from 'slick-router/lit/routerLinks.js'
import { router } from './router'

class LitDemoApp extends LitElement {
  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this
  }

  protected firstUpdated(): void {
    router.listen()
  }

  protected render() {
    return html`<div class="App">
      <div class="App-header">
        <h1>Application</h1>

        <ul class="Nav" ${routerLinks()}>
          <li class="Nav-item"><a route="home">Home</a></li>
          <li class="Nav-item"><a route="messages">Messages</a></li>
          <li class="Nav-item"><a route="profile.index" param-user="scrobblemuch">Profile</a></li>
        </ul>
      </div>
      <router-outlet animation></router-outlet>

      <div class="App-footer">
        Enter Animation {enterAnimationSelect} Leave Animation {leaveAnimationSelect}
      </div>
    </div>`
  }
}

customElements.define('lit-demo-app', LitDemoApp)
