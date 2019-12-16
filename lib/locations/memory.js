import { extend } from '../dash'

class MemoryLocation {
  constructor ({ path }) {
    this.path = path || ''
  }

  getURL () {
    return this.path
  }

  setURL (path, options) {
    if (this.path !== path) {
      this.path = path
      this.handleURL(this.getURL(), options)
    }
  }

  replaceURL (path, options) {
    if (this.path !== path) {
      this.setURL(path, options)
    }
  }

  onChange (callback) {
    this.changeCallback = callback
  }

  handleURL (url, options = {}) {
    this.path = url
    options = extend({ trigger: true }, options)
    if (this.changeCallback && options.trigger) {
      this.changeCallback(url)
    }
  }

  usesPushState () {
    return false
  }

  removeRoot (url) {
    return url
  }

  formatURL (url) {
    return url
  }
}

export default MemoryLocation
