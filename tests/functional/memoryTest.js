import $ from './nanodom'
import TestApp from './testApp'
import 'chai/chai.js'

const { assert } = window.chai
const { describe, it, beforeEach, afterEach } = window

let app, router

describe('app using memory', () => {
  beforeEach(() => {
    window.location.hash = ''
    app = new TestApp({
      location: 'memory'
    })
    router = app.router
    return app.start()
  })

  afterEach(() => {
    app.destroy()
  })

  it('transition occurs when setURL', (done) => {
    router.use((transition) => {
      transition.then(() => {
        assert.equal(transition.path, '/about')
        assert.equal($('.application .outlet').html(), 'This is about page')
        done()
      }).catch(done, done)
    })

    router.location.setURL('/about')
  })

  it('programmatic transition via url and route names', async function () {
    await router.transitionTo('about')
    assert.equal(router.location.getURL(), '/about')
    await router.transitionTo('/faq?sortBy=date')
    assert.equal(router.location.getURL(), '/faq?sortBy=date')
    assert.equal($('.application .outlet').html(), 'FAQ. Sorted By: date')
    await router.transitionTo('faq', {}, { sortBy: 'user' })
    assert.equal($('.application .outlet').html(), 'FAQ. Sorted By: user')
  })
})
