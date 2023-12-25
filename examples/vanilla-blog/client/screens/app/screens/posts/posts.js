const _ = require('lodash')
const BaseHandler = require('base_handler')
const template = require('./templates/posts.html')

module.exports = _.extend({}, BaseHandler, {
  template,
  model: function (params, context) {
    return context.then(function (context) {
      return new Promise(function (resolve) {
        resolve(_.extend(context, {
          allPostsData: ['foo', 'bar']
        }))
      })
    })
  }
})
