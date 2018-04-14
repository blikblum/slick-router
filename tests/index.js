const referee = require('@sinonjs/referee')
const sinon = require('sinon')

// add the assertions to referee
require('@sinonjs/referee-sinon')(referee, sinon)

// do the webpack thing
let testsContext = require.context('.', true, /Test$/)
testsContext.keys().forEach(testsContext)
