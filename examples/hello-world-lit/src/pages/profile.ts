import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('profile-view')
export class ProfileView extends LitElement {
  static get outlet() {
    return '.Container'
  }

  render() {
    return html`
      <div class="Profile">
        <div class="Container"></div>
      </div>
    `
  }

  createRenderRoot() {
    return this
  }
}
