import { noChange } from 'lit'
import { AsyncDirective, directive } from 'lit/async-directive.js'
import { bindRouterLinks } from '../middlewares/router-links.js'

/**
 * @import { ElementPart } from 'lit/async-directive.js';
 * @import { RouterLinksOptions } from '../middlewares/router-links.js';
 */

class RouterLinksDirective extends AsyncDirective {
  /**
   * @param {RouterLinksOptions} options
   * @returns {string}
   */
  render(options) {
    return noChange
  }

  /**
   * @param {ElementPart} part
   * @param {RouterLinksOptions[]} param1
   * @returns
   */
  update(part, [options]) {
    if (!this.unbindRouterLinks) {
      this.options = options
      this.unbindRouterLinks = bindRouterLinks(part.element, options)
    }
    return this.render(options)
  }

  reconnected() {
    // Re-bind when the directive reconnects
    if (this.element && !this.unbindRouterLinks) {
      this.unbindRouterLinks = bindRouterLinks(this.element, this.options)
    }
  }

  disconnected() {
    // Unbind when the directive disconnects
    if (typeof this.unbindRouterLinks === 'function') {
      this.unbindRouterLinks()
      this.unbindRouterLinks = undefined
    }
  }
}

/**
 * A Lit async directive that binds router link functionality to an element.
 *
 * This directive provides the same functionality as the router-links web component,
 * allowing links with `route` attributes to be automatically updated with generated
 * URLs and handle click events for navigation.
 *
 * @example
 * ```js
 * import { html } from 'lit';
 * import { routerLinks } from 'slick-router/lit/routerLinks.js';
 *
 * class MyElement extends LitElement {
 *   render() {
 *     return html`
 *       <div ${routerLinks({ params: { id: 123 } })}>
 *         <a route="home">Home</a>
 *         <a route="user" param-id="456">User</a>
 *       </div>
 *     `;
 *   }
 * }
 * ```
 */
export const routerLinks = directive(RouterLinksDirective)
