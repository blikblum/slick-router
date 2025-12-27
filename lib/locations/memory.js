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
      const shouldTrigger = options?.trigger !== false
      if (this.callback && shouldTrigger) {
        this.callback(path)
      }
    }
  }

  replaceURL(path, options) {
    this.setURL(path, options)
  }

  onChange(callback) {
    this.callback = callback
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
