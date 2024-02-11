/* eslint-disable no-return-assign */
import $ from './nanodom'
import TestApp from './testApp'
import 'chai/chai.js'

const { assert } = window.chai
const { describe, it, beforeEach, afterEach } = window
let app, router

describe('app', () => {
  beforeEach(() => {
    window.location.hash = '/'
    app = new TestApp()
    router = app.router
    return app.start()
  })

  afterEach(() => {
    app.destroy()
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

    window.location.hash = '#about'
  })

  it('programmatic transition via url and route names', async function () {
    await router.transitionTo('about')
    await router.transitionTo('/faq?sortBy=date')
    assert.equal($('.application .outlet').html(), 'FAQ. Sorted By: date')
    await router.transitionTo('faq', {}, { sortBy: 'user' })
    assert.equal($('.application .outlet').html(), 'FAQ. Sorted By: user')
  })

  it('cancelling and retrying transitions', async function () {
    await router.transitionTo('/posts/filter/foo')
    assert.equal(router.location.getURL(), '/posts/filter/foo')
    const transition = router.transitionTo('about')
    transition.cancel()
    await transition.catch(() => {})
    assert.equal(router.location.getURL(), '/posts/filter/foo')

    await transition.retry()
    assert.equal(router.location.getURL(), '/about')
  })

  it('transition.followRedirects resolves when all of the redirects have finished', async function () {
    await router.transitionTo('application')
    // initiate a transition
    const transition = router.transitionTo('/posts/filter/foo')
    // and a redirect
    router.transitionTo('/about')

    // if followRedirects is not used - the original transition is rejected
    let rejected = false
    await transition.catch(() => (rejected = true))
    assert(rejected)

    await router.transitionTo('application')
    // initiate a transition
    const t = router.transitionTo('/posts/filter/foo')
    // and a redirect, this time using `redirectTo`
    t.redirectTo('/about')

    // when followRedirects is used - the promise is only
    // resolved when both transitions finish
    await transition.followRedirects()
    assert.equal(router.location.getURL(), '/about')
  })

  it('transition.followRedirects is rejected if transition fails', async function () {
    // silence the errors for the tests
    router.logError = () => {}

    // initiate a transition
    const transition = router.transitionTo('/posts/filter/foo')
    // install a breaking middleware
    router.use(() => {
      throw new Error('middleware error')
    })
    // and a redirect
    router.transitionTo('/about')

    let rejected = false
    await transition.followRedirects().catch((err) => (rejected = err.message))
    assert.equal(rejected, 'middleware error')
  })

  it('transition.followRedirects is rejected if transition fails asynchronously', async function () {
    // silence the errors for the tests
    router.logError = () => {}

    // initiate a transition
    const transition = router.transitionTo('/posts/filter/foo')
    // install a breaking middleware
    router.use(() => {
      return Promise.reject(new Error('middleware promise error'))
    })
    // and a redirect
    router.transitionTo('/about')

    let rejected = false
    await transition.followRedirects().catch((err) => (rejected = err.message))
    assert.equal(rejected, 'middleware promise error')
  })

  it.skip('cancelling transition does not add a history entry', async function () {
    // we start of at faq
    await router.transitionTo('faq')
    // then go to posts.filter
    await router.transitionTo('posts.filter', { filterId: 'foo' })
    assert.equal(window.location.hash, '#posts/filter/foo')

    // now attempt to transition to about and cancel
    const transition = router.transitionTo('/about')
    transition.cancel()
    await transition.catch(() => {})

    // the url is still posts.filter
    assert.equal(window.location.hash, '#posts/filter/foo')

    // at first look going back now should take to #faq but it does not:
    // the initial steps creates this history: #faq > #posts/filter/foo > #about
    // calling cancel replaces #about by #posts/filter/foo so the history is now
    // #faq > #posts/filter/foo > #posts/filter/foo
    // calling history.back goes from #posts/filter/foo to #posts/filter/foo which is ignored
    // the native history API does not provide a way to cancel a navigation
    // or to go back synchronously and without triggering the events
    // the solution would be to handle router own history
    await new Promise((resolve, reject) => {
      router.use((transition) => {
        transition
          .then(() => {
            assert.equal(window.location.hash, '#faq')
            resolve()
          })
          .catch(reject)
      })
      window.history.back()
    })
  })

  it('navigating around the app', async function () {
    assert.equal($('.application .outlet').html(), 'Welcome to this application')

    await router.transitionTo('about')
    assert.equal($('.application .outlet').html(), 'This is about page')

    await router.transitionTo('/faq?sortBy=date')
    assert.equal($('.application .outlet').html(), 'FAQ. Sorted By: date')

    await router.transitionTo('faq', {}, { sortBy: 'user' })
    assert.equal($('.application .outlet').html(), 'FAQ. Sorted By: user')

    // we can also change the url directly to cause another transition to happen
    await new Promise(function (resolve) {
      router.use(resolve)
      window.location.hash = '#posts/filter/mine'
    })
    assert.equal($('.application .outlet').html(), 'My posts...')

    await new Promise(function (resolve) {
      router.use(resolve)
      window.location.hash = '#posts/filter/foo'
    })
    assert.equal($('.application .outlet').html(), 'Filter not found')
  })

  it('url behaviour during transitions', async function () {
    assert.equal(window.location.hash, '#/')
    const transition = router.transitionTo('about')
    assert.equal(window.location.hash, '#about')
    await transition
    assert.equal(window.location.hash, '#about')
    // would be cool to it history.back() here
    // but in IE it reloads the karma iframe, so let's
    // use a regular location.hash assignment instead
    // window.history.back()
    window.location.hash = '#/'
    await new Promise((resolve) => {
      router.use((transition) => {
        assert.equal(window.location.hash, '#/')
        resolve()
      })
    })
  })

  it('url behaviour during failed transitions', async function () {
    router.logError = () => {}
    await router.transitionTo('about')
    await new Promise((resolve, reject) => {
      // setup a middleware that will fail
      router.use((transition) => {
        // but catch the error
        transition
          .catch((err) => {
            assert.equal(err.message, 'failed')
            assert.equal(window.location.hash, '#faq')
            resolve()
          })
          .catch(reject)
        throw new Error('failed')
      })
      router.transitionTo('faq')
    })
  })
})
