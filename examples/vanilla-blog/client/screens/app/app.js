const $ = require('jquery')
const _ = require('lodash')
const template = require('./templates/app.html')
const BaseHandler = require('base_handler')

module.exports = _.extend({}, BaseHandler, {
  template,
  model: function () {
    const context = {
      appRnd: Math.random()
    }
    // activate eagerly - we want to render this route
    // right while the other routes might be loading
    this.activate(context)
    return context
  },
  templateData: function (context) {
    return {
      rnd: context.appRnd
    }
  },
  outlet: function () {
    return $(document.body)
  }
})
