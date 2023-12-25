const _ = require('lodash')
const template = require('./templates/home.html')
const BaseHandler = require('base_handler')

module.exports = _.extend({}, BaseHandler, {
  template
})
