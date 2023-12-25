const _ = require('lodash')
const template = require('./templates/show.html')
const BaseHandler = require('base_handler')

module.exports = _.extend({}, BaseHandler, {
  template,
  willTransition: function (transition) {
    // if (this.postId === '2') {
    //   transition.cancel()
    // }
  },
  model: function (params, context) {
    if (!this.sessionStore) {
      this.sessionStore = 1
    } else {
      this.sessionStore++
    }
    const self = this
    return context.then(function (context) {
      self.postId = params.id
      return new Promise(function (resolve) {
        resolve({ title: 'Blog ' + params.id, subtitle: context.allPostsData[0] + context.appRnd })
      })
    })
  },
  templateData: function (context) {
    return {
      title: 'Blog post #' + context.title + ' (' + context.subtitle + ')'
    }
  }
})
