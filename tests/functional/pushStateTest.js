import $ from './nanodom'
import fakeHistory from '../lib/fakeHistory'
import TestApp from './testApp'

import { assert } from 'chai'

let app, router, history

describe('app using pushState', () => {
  beforeEach(() => {
    window.location.hash = ''
    app = new TestApp({
      pushState: true,
      root: '/app',
    })
    router = app.router
    // eslint-disable-next-line no-return-assign
    return app.start().then(() => (history = fakeHistory(router.location)))
  })

  afterEach(() => {
    app.destroy()
    history.restore()
  })

  it('transition occurs when location.hash changes', (done) => {
    router.use((transition) => {
      transition
        .then(() => {
          assert.equal(transition.path, '/about')
          assert.equal($('.application .outlet').html(), 'This is about page')
          done()
        })
        .catch(done, done)
    })

    history.setURL('/app/about')
  })

  it('programmatic transition via url and route names', async function () {
    await router.transitionTo('about')
    assert.equal(history.getURL(), '/app/about')
    await router.transitionTo('/faq?sortBy=date')
    assert.equal(history.getURL(), '/app/faq?sortBy=date')
    assert.equal($('.application .outlet').html(), 'FAQ. Sorted By: date')
    await router.transitionTo('faq', {}, { sortBy: 'user' })
    assert.equal($('.application .outlet').html(), 'FAQ. Sorted By: user')
  })
})
