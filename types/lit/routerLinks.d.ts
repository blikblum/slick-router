import { DirectiveResult } from 'lit/directive.js'
import type { RouterLinksOptions } from '../middlewares/router-links.js'

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
 *
 * @param options - Configuration options
 * @returns A directive result
 */
export function routerLinks(options?: RouterLinksOptions): DirectiveResult
