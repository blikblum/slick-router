class MemoryLocation {
  constructor() {
    this.path = ''
  }

  getURL() {
    return this.path
  }

  setURL(path, options) {
    if (this.path !== path) {
      this.path = path
      this.handleURL(this.getURL(), options)
    }
  }

  replaceURL(path, options) {
    if (this.path !== path) {
      this.setURL(path, options)
    }
  }

  onChange(callback) {
    this.callback = callback
  }

  handleURL(url, options) {
    this.path = url
    const shouldTrigger = options?.trigger !== false
    if (this.callback && shouldTrigger) {
      this.callback(url)
    }
  }

  removeRoot(url) {
    return url
  }

  formatURL(url) {
    return url
  }

  start(path) {
    this.path = path
  }
}

export default MemoryLocation
