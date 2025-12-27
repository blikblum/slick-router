import { extend } from '../utils.js'
import { History } from './location-bar.js'

/**
 * @typedef BrowserLocationOptions
 * @property {boolean} [pushState=false] Whether to use pushState or hashchange
 * @property {string} [root='/'] The root URL path to use when using pushState
 */

class BrowserLocation {
  /**
   * @param {BrowserLocationOptions} options
   */
  constructor(options = {}) {
    this.path = ''

    this.options = extend(
      {
        pushState: false,
        root: '/',
      },
      options,
    )

    // we're using the location-bar module for actual
    // URL management
    this.history = new History()
  }

  /**
   * Get the current URL
   */

  getURL() {
    return this.path
  }

  /**
   * Set the current URL without triggering any events
   * back to the router. Add a new entry in browser's history.
   */

  /**
   * @param {string} path
   * @param {object} options
   * @param {boolean} options.trigger Whether to trigger route handling
   * @param {boolean} [options.replace] Whether to replace the current history entry
   */
  setURL(path, options) {
    if (this.path !== path) {
      this.path = path
      this.history.update(path, options)
    }
  }

  /**
   * Set the current URL without triggering any events
   * back to the router. Replace the latest entry in broser's history.
   */

  /**
   * @param {string} path
   * @param {object} options
   * @param {boolean} options.trigger Whether to trigger route handling
   */
  replaceURL(path, options) {
    this.setURL(path, { ...options, replace: true })
  }

  /**
   * Setup a URL change handler
   * @param  {(url: string) => void} callback
   */
  onChange(callback) {
    this.callback = callback
  }

  /**
   * Given a path, generate a URL appending root
   * if pushState is used and # if hash state is used
   */
  formatURL(path) {
    const { root, pushState } = this.options
    if (pushState) {
      let rootURL = root
      if (path !== '') {
        rootURL = rootURL.replace(/\/$/, '')
      }
      return rootURL + path
    } else {
      if (path[0] === '/') {
        path = path.substr(1)
      }
      return `#${path}`
    }
  }

  /**
   * When we use pushState with a custom root option,
   * we need to take care of removingRoot at certain points.
   * Specifically
   * - browserLocation.update() can be called with the full URL by router
   * - LocationBar expects all .update() calls to be called without root
   * - this method is public so that we could dispatch URLs without root in router
   */
  removeRoot(url) {
    const { root, pushState } = this.options
    if (pushState && root && root !== '/') {
      return url.replace(root, '')
    } else {
      return url
    }
  }

  /**
   * Stop listening to URL changes and link clicks
   */
  destroy() {
    this.history.stop()
  }

  start(path) {
    this.path = path
    // a generic route for any changes
    this.history.onLoad = (path) => {
      const url = `/${path}`
      this.path = url
      if (this.callback) {
        this.callback(url)
      }
    }

    this.history.start(this.options)
  }
}

export default BrowserLocation
