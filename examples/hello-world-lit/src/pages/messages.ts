import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('messages-view')
export class MessagesView extends LitElement {
  render() {
    return html`
      <div class="Messages">
        <h2>Messages</h2>
        <p>You have no direct messages</p>
      </div>
    `
  }

  createRenderRoot() {
    return this
  }
}
