import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { routerLinks } from 'slick-router/lit/routerLinks.js'

@customElement('home-view')
export class HomeView extends LitElement {
  render() {
    return html`
      <div class="Home" ${routerLinks()}>
        <h2>Tweets</h2>
        <div class="Tweet">
          <div class="Tweet-author">
            <a route="profile.index" param-user="dan_abramov">Dan Abramov ‏@dan_abramov</a>
          </div>
          <div class="Tweet-time">12m12 minutes ago</div>
          <div class="Tweet-content">
            Another use case for \`this.context\` I think might be valid: forms. They're too painful
            right now.
          </div>
        </div>
        <div class="Tweet">
          <div class="Tweet-author">
            <a route="profile.index" param-user="afanasjevas">Eduardas Afanasjevas ‏@afanasjevas</a>
          </div>
          <div class="Tweet-time">12m12 minutes ago</div>
          <div class="Tweet-content">
            I just published “What will Datasmoothie bring to the analytics startup landscape?”
            https://medium.com/@afanasjevas/what-will-datasmoothie-bring-to-the-analytics-startup-landscape-f7dab70d75c3?source=tw-81c4e81fe6f8-1427630532296
          </div>
        </div>
        <div class="Tweet">
          <div class="Tweet-author">
            <a route="profile.index" param-user="LNUGorg">LNUG ‏@LNUGorg</a>
          </div>
          <div class="Tweet-time">52m52 minutes ago</div>
          <div class="Tweet-content">
            new talks uploaded on our YouTube page - check them out http://bit.ly/1yoXSAO
          </div>
        </div>
      </div>
    `
  }

  createRenderRoot() {
    return this
  }
}
