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
    this.path = options.path || ''

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

  setURL(path, options = {}) {
    if (this.path !== path) {
      this.path = path
      this.history.update(path, extend({ trigger: true }, options))
    }
  }

  /**
   * Set the current URL without triggering any events
   * back to the router. Replace the latest entry in broser's history.
   */

  replaceURL(path, options = {}) {
    if (this.path !== path) {
      this.path = path
      this.history.update(path, extend({ trigger: true, replace: true }, options))
    }
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

  /**
    initially, the changeCallback won't be defined yet, but that's good
    because we dont' want to kick off routing right away, the router
    does that later by manually calling this handleURL method with the
    url it reads of the location. But it's important this is called
    first by Backbone, because we wanna set a correct this.path value

    @private
   */
  handleURL(url) {
    this.path = url
    if (this.callback) {
      this.callback(url)
    }
  }

  start(path) {
    this.path = path
    this.history.onChange((path) => {
      this.handleURL(`/${path || ''}`)
    })

    this.history.start(this.options)
  }
}

export default BrowserLocation
