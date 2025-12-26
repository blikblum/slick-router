import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { router } from './router'
import './pages/application'
import './pages/home'
import './pages/messages'
import './pages/profile'
import './pages/profile-index'

@customElement('lit-demo-app')
export class LitDemoApp extends LitElement {
  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this
  }

  protected firstUpdated(): void {
    router.listen()
  }

  protected render() {
    return html`<application-view></application-view>`
  }
}
