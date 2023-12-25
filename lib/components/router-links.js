import { bindRouterLinks } from '../middlewares/router-links.js'

class RouterLinks extends HTMLElement {
  connectedCallback () {
    // Register the web component using bindRouterLinks
    this.unbindRouterLinks = bindRouterLinks(this, {
      params: this.params,
      query: this.query
    })
  }

  disconnectedCallback () {
    // Call the return of bindRouterLinks when disconnected
    if (typeof this.unbindRouterLinks === 'function') {
      this.unbindRouterLinks()
      this.unbindRouterLinks = undefined
    }
  }
}

customElements.define('router-links', RouterLinks)
