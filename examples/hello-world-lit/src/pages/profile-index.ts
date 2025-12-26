import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('profile-index-view')
export class ProfileIndexView extends LitElement {
  @property({ attribute: false })
  $route: any

  render() {
    return html`
      <div class="ProfileIndex">
        <h2>${this.$route?.params?.user} profile</h2>
      </div>
    `
  }

  createRenderRoot() {
    return this
  }
}
