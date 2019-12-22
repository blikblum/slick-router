/* eslint-disable no-return-assign */
import BrowserLocation from '../../lib/locations/browser'
import { extend } from '../../lib/dash'
import { Router, interceptLinks } from '../../lib/router'
import sinon from 'sinon'
import 'chai/chai.js'

const { assert } = window.chai
const { describe, it, beforeEach, afterEach } = window

const delay = (t) => new Promise((resolve) => setTimeout(resolve, t))

describe('Slick Router', () => {
  let router

  const routes = (route) => {
    route('application', () => {
      route('notifications')
      route('messages')
      route('status', { path: ':user/status/:id' })
    })
  }

  beforeEach(() => {
    window.location.hash = ''
    router = new Router()
  })

  afterEach(() => {
    router.destroy()
  })

  // @api public

  it('#use registers function middleware', () => {
    const m = () => {}
    router.use(m)
    assert(router.middleware.length === 1)
    assert(router.middleware[0].next === m)
  })

  it('#use registers object middleware', () => {
    const m = {
      next: function () {},
      done: function () {},
      error: function () {}
    }
    router.use(m)
    assert(router.middleware.length === 1)
    assert(router.middleware[0] === m)
  })

  it('#use accepts at option', () => {
    const m1 = () => {}
    const m2 = {
      next: function () {},
      done: function () {},
      error: function () {}
    }
    router.use(m1)
    router.use(m2, { at: 0 })
    assert(router.middleware.length === 2)
    assert(router.middleware[0] === m2)
    assert(router.middleware[1].next === m1)
  })

  it('#use middleware gets passed a transition object', (done) => {
    const m = (transition) => {
      const t = extend({}, transition)
      ;['catch', 'then', 'redirectTo', 'cancel', 'retry', 'followRedirects'].forEach(attr => delete t[attr])
      const et = {
        id: 3,
        prev: {
          routes: [{
            name: 'application',
            path: 'application',
            params: {},
            options: {
              path: 'application'
            }
          }],
          path: '/application',
          pathname: '/application',
          params: {},
          query: {}
        },
        routes: [{
          name: 'application',
          path: 'application',
          params: {},
          options: {
            path: 'application'
          }
        }, {
          name: 'status',
          path: ':user/status/:id',
          params: {
            user: '1',
            id: '2'
          },
          options: {
            path: ':user/status/:id'
          }
        }],
        path: '/application/1/status/2?withReplies=true',
        pathname: '/application/1/status/2',
        params: {
          user: '1',
          id: '2'
        },
        query: {
          withReplies: 'true'
        }
      }
      assert.deepEqual(t, et)

      done()
    }

    // first navigate to 'application'
    router.map(routes)
    router.listen()
      .then(() => router.transitionTo('application'))
      .then(() => {
        // then install the middleware and navigate to status page
        // this is so that we have a richer transition object
        // to assert
        router.use(m)
        return router.transitionTo('status', { user: 1, id: 2 }, { withReplies: true })
      }).catch(done)
  })

  it('#use middleware next and done hooks are called on successful transition', (done) => {
    router.map(routes)
    var m = {
      next: sinon.spy(),
      done: sinon.spy()
    }
    router.use(m)
    router.listen()
    router.transitionTo('messages').then(() => {
      sinon.assert.calledOnce(m.next)
      sinon.assert.calledOnce(m.done)
      sinon.assert.callOrder(m.next, m.done)
      done()
    })
  })

  it('#use middleware error hook is called on failed transition', (done) => {
    router.map(routes)
    var m = {
      error: sinon.spy()
    }
    router.use(m)
    router.use(() => { throw new Error('fail') })
    router.listen()
    router.transitionTo('messages').catch(() => {
      sinon.assert.calledOnce(m.error)
      done()
    })
  })

  it('#use middleware cancel hook is called on cancelled transition', (done) => {
    router.map(routes)
    var m = {
      cancel: sinon.spy()
    }
    router.listen().then(() => {
      router.use(m)
      router.use((transition) => { transition.cancel() })
      router.transitionTo('messages').catch(() => {
        sinon.assert.calledOnce(m.cancel)
        done()
      })
    })
  })

  it('#use middleware cancel hook is called on redirected transition', (done) => {
    router.map(routes)
    var m = {
      cancel: sinon.spy()
    }
    router.listen().then(() => {
      router.use(m)
      router.use((transition) => { transition.redirectTo('notifications') })
      router.transitionTo('messages').catch(() => {
        sinon.assert.calledOnce(m.cancel)
        done()
      })
    })
  })

  it('#map registers the routes defined with a callback', () => {
    router.map(routes)
    // check that the internal matchers object is created
    assert.deepEqual(router.matchers.map(m => m.path), [
      '/application',
      '/application/notifications',
      '/application/messages',
      '/application/:user/status/:id'
    ])
    // check that the internal routes object is created
    assert.equal(router.routes[0].name, 'application')
    assert.equal(router.routes[0].routes[2].options.path, ':user/status/:id')
  })

  it('#map registers the routes defined with an array', () => {
    router.map([
      {
        name: 'application',
        children: [
          {
            name: 'notifications'
          },
          {
            name: 'messages'
          },
          {
            name: 'status',
            path: ':user/status/:id'
          }
        ]
      }
    ])
    // check that the internal matchers object is created
    assert.deepEqual(router.matchers.map(m => m.path), [
      '/application',
      '/application/notifications',
      '/application/messages',
      '/application/:user/status/:id'
    ])
    // check that the internal routes object is created
    assert.equal(router.routes[0].name, 'application')
    assert.equal(router.routes[0].routes[2].options.path, ':user/status/:id')
  })

  it('routes can be registered using routes option', () => {
    const localRouter = new Router({
      routes
    })

    // check that the internal matchers object is created
    assert.deepEqual(localRouter.matchers.map(m => m.path), [
      '/application',
      '/application/notifications',
      '/application/messages',
      '/application/:user/status/:id'
    ])
    // check that the internal routes object is created
    assert.equal(localRouter.routes[0].name, 'application')
    assert.equal(localRouter.routes[0].routes[2].options.path, ':user/status/:id')
  })

  it('#generate generates urls given route name and params as object', () => {
    router.map(routes).listen()
    var url = router.generate('status', { user: 'foo', id: 1 }, { withReplies: true })
    assert.equal(url, '#application/foo/status/1?withReplies=true')
  })

  if (window.history && window.history.pushState) {
    it('#generate when pushState: true and root != "/" in modern browsers', () => {
      router.options.pushState = true
      router.options.root = '/foo/bar'
      router.map(routes).listen()
      var url = router.generate('status', { user: 'usr', id: 1 }, { withReplies: true })
      assert.equal(url, '/foo/bar/application/usr/status/1?withReplies=true')
    })
  }

  if (window.history && !window.history.pushState) {
    it('#generate when pushState: true and root != "/" in old browsers', () => {
      let browserRedirectedTo
      router.options.location = new BrowserLocation({
        pushState: true,
        root: '/foo/bar',
        location: {
          href: '/different/#location',
          pathname: '/different',
          hash: '#location',
          search: '',
          replace: function (path) {
            browserRedirectedTo = path
          }
        }
      })

      router.map(routes).listen()
      var url = router.generate('status', { user: 'usr', id: 1 }, { withReplies: true })
      assert.equal(browserRedirectedTo, '/foo/bar/#different')
      assert.equal(url, '#application/usr/status/1?withReplies=true')
    })
  }

  it('#generate throws a useful error when listen has not been called', () => {
    router.map(routes)
    try {
      router.generate('messages')
    } catch (err) {
      assert.equal(err.message, 'Invariant Violation: call .listen() before using .generate()')
    }
  })

  it('#generate throws a useful error when called with an abstract route', () => {
    router.map((route) => {
      route('foo', { abstract: true })
    }).listen()

    assert.throws(function () {
      router.generate('foo')
    }, Error, 'No route is named foo')
  })

  it('#generate succeeds when called with an abstract route that has a child index route', () => {
    router.map((route) => {
      route('foo', { abstract: true }, () => {
        route('bar', { path: '' })
      })
    }).listen()
    const url = router.generate('foo')
    assert.equal(url, '#foo')
  })

  it('#use middleware can not modify routers internal state by changing transition.routes', (done) => {
    window.location.hash = '/application/messages'
    router.map(routes)
    router.use((transition) => {
      assert.equal(transition.routes[0].name, 'application')
      transition.routes[0].foo = 1
      transition.routes[0].options.bar = 2
    })
    router.use((transition) => {
      assert.equal(transition.routes[0].name, 'application')
      assert.equal(transition.routes[0].foo, 1)
      assert.equal(transition.routes[0].options.bar, 2)

      assert.equal(router.routes[0].name, 'application')
      assert.equal(router.routes[0].foo, undefined)
      assert.equal(router.routes[0].options.foo, undefined)
      done()
    })
    router.listen()
  })

  it('#use transition fails if a middleware returns a transition', (done) => {
    window.location.hash = '/application/messages'
    router.map(routes)
    router.logError = function () {}
    router.use((transition) => {
      transition.catch((err) => {
        assert.equal(err.message, 'Invariant Violation: Middleware anonymous returned a transition which resulted in a deadlock')
      }).then(done).catch(done)
    })
    router.use((transition) => transition)
    router.listen()
  })

  // @api private

  it('#match matches a path against the routes', () => {
    router.map(routes)
    const match = router.match('/application/KidkArolis/status/42')
    assert.deepEqual(match.params, {
      user: 'KidkArolis',
      id: '42'
    })
    assert.deepEqual(match.routes.map(r => r.name), ['application', 'status'])
  })

  it('#match matches a path with query params', () => {
    router.map(routes)
    const match = router.match('/application/KidkArolis/status/42?withReplies=true&foo=bar')
    assert.deepEqual(match.params, {
      user: 'KidkArolis',
      id: '42'
    })
    assert.deepEqual(match.query, {
      withReplies: 'true',
      foo: 'bar'
    })
  })

  it('#match returns an array of route descriptors', () => {
    router.map((route) => {
      route('foo', { customData: 1 }, () => {
        route('bar', { customData: 2 })
      })
    })
    const match = router.match('/foo/bar')
    assert.deepEqual(match.routes, [{
      name: 'foo',
      path: 'foo',
      params: {},
      options: {
        customData: 1,
        path: 'foo'
      }
    }, {
      name: 'bar',
      path: 'bar',
      params: {},
      options: {
        customData: 2,
        path: 'bar'
      }
    }])
  })

  it('#match ignores the trailing slash', () => {
    router.map(routes)
    assert(router.match('/application/messages').routes.length)
    assert(router.match('/application/messages/').routes.length)
  })

  it('#match returns an empty route array if nothing matches', () => {
    router.map(routes)
    const match = router.match('/foo/bar')
    assert.deepEqual(match, { routes: [], params: {}, pathname: '/foo/bar', query: {} })
  })

  it('#match always parses query parameters even if a route does not match', () => {
    router.map(routes)
    const match = router.match('/foo/bar?hello=world')
    assert.deepEqual(match, { routes: [], params: {}, pathname: '/foo/bar', query: { hello: 'world' } })
  })

  it('#transitionTo called multiple times reuses the active transition', (done) => {
    router.map(routes)
    router.listen().then(() => {
      router.use(() => delay(500))
      assert.equal(router.transitionTo('status', { user: 'me', id: 1 }).id, 2)
      assert.equal(router.transitionTo('status', { user: 'me', id: 1 }).id, 2)
      done()
    }).catch(done)
  })

  it('#transitionTo called on the same route, returns a completed transition', (done) => {
    let called = false
    router.map(routes)
    router.listen().then(() => {
      return router.transitionTo('status', { user: 'me', id: 1 })
    }).then(() => {
      router.use(() => called = true)
      const t = router.transitionTo('status', { user: 'me', id: 1 })
      assert.equal(t.noop, true)
      return t
    }).then(() => {
      assert.equal(called, false)
      done()
    }).catch(done)
  })

  it('#transitionTo throws an useful error when called with an abstract route', () => {
    router.map((route) => {
      route('foo', { abstract: true })
    }).listen()

    assert.throws(function () {
      router.transitionTo('foo')
    }, Error, 'No route is named foo')
  })

  it('#transitionTo called on an abstract route with a child index route should activate the index route', async () => {
    router.map((route) => {
      route('foo', { abstract: true }, () => {
        route('bar', { path: '' })
      })
    }).listen()
    await router.transitionTo('foo')
    assert.equal(router.isActive('foo'), true)
    assert.equal(router.isActive('bar'), true)
    assert.equal(router.state.routes.length, 2)
    assert.equal(router.state.path, '/foo')
  })

  it('#transitionTo called on an route with a child index route should activate the index route', async () => {
    router.map((route) => {
      route('foo', () => {
        route('bar', { path: '' })
      })
    }).listen()
    await router.transitionTo('foo')
    assert.equal(router.isActive('foo'), true)
    assert.equal(router.isActive('bar'), true)
    assert.equal(router.state.routes.length, 2)
    assert.equal(router.state.path, '/foo')
  })

  it('#isActive returns true if arguments match current state and false if not', async () => {
    router.map(routes)
    await router.listen()
    await router.transitionTo('notifications')
    assert.equal(router.isActive('notifications'), true)
    assert.equal(router.isActive('messages'), false)
    await router.transitionTo('status', { user: 'me', id: 1 })
    assert.equal(router.isActive('status', { user: 'me' }), true)
    assert.equal(router.isActive('status', { user: 'notme' }), false)
    await router.transitionTo('messages', null, { foo: 'bar' })
    assert.equal(router.isActive('messages', null, { foo: 'bar' }), true)
    assert.equal(router.isActive('messages', null, { foo: 'baz' }), false)
  })

  it('#location URL is reset to previous one when a transition started programatically is cancelled', (done) => {
    let beforeCancelHash
    let beforeTransitionHash

    router.map(routes)
    router.use((transition) => {
      if (transition.path === '/application/notifications') {
        beforeCancelHash = router.location.getURL()
        transition.cancel()
      }
    })

    router.listen().then(() => {
      router.transitionTo('messages').then(() => {
        beforeTransitionHash = router.location.getURL()
        router.transitionTo('notifications').catch(() => {
          assert.equal(beforeTransitionHash, router.location.getURL())
          assert.notEqual(beforeCancelHash, router.location.getURL())
          done()
        })
      })
    })
  })

  it('#location URL is reset to previous one when a transition started by URL interation is cancelled', (done) => {
    let beforeCancelHash
    let beforeTransitionHash

    router.map(routes)
    router.use((transition) => {
      if (transition.path === '/application/notifications') {
        beforeCancelHash = router.location.getURL()
        transition.cancel()
      }
    })

    router.listen().then(() => {
      router.transitionTo('messages').then(() => {
        beforeTransitionHash = router.location.getURL()
        router.use({
          cancel: function (transition) {
            transition.catch(() => {
              assert.equal(beforeTransitionHash, router.location.getURL())
              assert.notEqual(beforeCancelHash, router.location.getURL())
              done()
            })
          }
        })
        window.location.hash = '#application/notifications'
      })
    })
  })

  describe('route maps', () => {
    it('a complex route map', () => {
      router.map((route) => {
        route('application', () => {
          route('notifications')
          route('messages', () => {
            route('unread', () => {
              route('priority')
            })
            route('read')
            route('draft', () => {
              route('recent')
            })
          })
          route('status', { path: ':user/status/:id' })
        })
        route('anotherTopLevel', () => {
          route('withChildren')
        })
      })
      // check that the internal matchers object is created
      assert.deepEqual(router.matchers.map(m => m.path), [
        '/application',
        '/application/notifications',
        '/application/messages',
        '/application/messages/unread',
        '/application/messages/unread/priority',
        '/application/messages/read',
        '/application/messages/draft',
        '/application/messages/draft/recent',
        '/application/:user/status/:id',
        '/anotherTopLevel',
        '/anotherTopLevel/withChildren'
      ])
    })

    it('a parent route can be excluded from the route map by setting abstract to true', () => {
      router.map((route) => {
        route('application', { abstract: true }, () => {
          route('notifications')
          route('messages', () => {
            route('unread', () => {
              route('priority')
            })
            route('read')
            route('draft', { abstract: true }, () => {
              route('recent')
            })
          })
          route('status', { path: ':user/status/:id' })
        })
        route('anotherTopLevel', () => {
          route('withChildren')
        })
      })

      assert.deepEqual(router.matchers.map(m => m.path), [
        '/application/notifications',
        '/application/messages',
        '/application/messages/unread',
        '/application/messages/unread/priority',
        '/application/messages/read',
        '/application/messages/draft/recent',
        '/application/:user/status/:id',
        '/anotherTopLevel',
        '/anotherTopLevel/withChildren'
      ])
    })

    it('routes with duplicate names throw a useful error', () => {
      try {
        router.map((route) => {
          route('foo', () => {
            route('foo')
          })
        })
      } catch (e) {
        assert.equal(e.message, 'Invariant Violation: Route names must be unique, but route "foo" is declared multiple times')
        return
      }
      assert(false, 'Should not reach this')
    })

    it('modifying params or query in middleware does not affect the router state', async function () {
      router.map(routes)
      await router.listen()
      router.use(transition => {
        transition.params.foo = 1
        transition.query.bar = 2
        transition.routes.push({})
        transition.routes[0].foobar = 123
      })
      await router.transitionTo('status', { user: 'me', id: 42 }, { q: 'abc' })
      // none of the modifications to params, query or routes
      // array are persisted to the router state
      assert.deepEqual(router.state.params, { user: 'me', id: '42' })
      assert.deepEqual(router.state.query, { q: 'abc' })
      assert.equal(router.state.routes.length, 2)
    })

    if (window.history && window.history.pushState) {
      it('custom link intercept click handler', async function () {
        let interceptCalledWith = false
        router.options.pushState = true
        const clickHandler = function (event, link) {
          event.preventDefault()
          interceptCalledWith = link.getAttribute('href')
        }
        router.map(routes)
        interceptLinks(router, document, clickHandler)
        await router.listen('foobar')
        const a = document.createElement('a')
        a.href = '/hello/world'
        a.innerHTML = 'hello'
        document.body.appendChild(a)
        a.click()
        assert.equal(interceptCalledWith, '/hello/world')
        document.body.removeChild(a)
      })
    }
  })
})
