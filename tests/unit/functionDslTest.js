import { assert } from '@sinonjs/referee'
import functionDsl from '../../lib/function-dsl'

const { suite, test } = window

suite('function-dsl')

test('simple route map', () => {
  const routes = functionDsl(route => {
    route('application')
  })
  assert.equals(routes, [
    {
      name: 'application',
      path: 'application',
      options: { path: 'application' },
      routes: []
    }
  ])
})

test('simple route map with options', () => {
  const routes = functionDsl(route => {
    route('application', { path: '/', foo: 'bar' })
  })
  assert.equals(routes, [
    {
      name: 'application',
      path: '/',
      options: { foo: 'bar', path: '/' },
      routes: []
    }
  ])
})

test('simple nested route map', () => {
  const routes = functionDsl(route => {
    route('application', () => {
      route('child')
    })
  })
  assert.equals(routes, [
    {
      name: 'application',
      path: 'application',
      options: { path: 'application' },
      routes: [
        {
          name: 'child',
          path: 'child',
          options: { path: 'child' },
          routes: []
        }
      ]
    }
  ])
})

test('route with dot names and no path', () => {
  const routes = functionDsl(route => {
    route('application', () => {
      route('application.child')
    })
  })
  assert.equals(routes, [
    {
      name: 'application',
      path: 'application',
      options: { path: 'application' },
      routes: [
        {
          name: 'application.child',
          path: 'child',
          options: { path: 'child' },
          routes: []
        }
      ]
    }
  ])
})

test('complex example', () => {
  const routes = functionDsl((route) => {
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
  assert.equals(routes, [
    {
      name: 'application',
      path: 'application',
      options: { path: 'application', abstract: true },
      routes: [
        {
          name: 'notifications',
          path: 'notifications',
          options: { path: 'notifications' },
          routes: []
        },
        {
          name: 'messages',
          path: 'messages',
          options: { path: 'messages' },
          routes: [
            {
              name: 'unread',
              path: 'unread',
              options: { path: 'unread' },
              routes: [
                {
                  name: 'priority',
                  path: 'priority',
                  options: { path: 'priority' },
                  routes: []
                }
              ]
            },
            {
              name: 'read',
              path: 'read',
              options: { path: 'read' },
              routes: []
            },
            {
              name: 'draft',
              path: 'draft',
              options: { path: 'draft', abstract: true },
              routes: [
                {
                  name: 'recent',
                  path: 'recent',
                  options: { path: 'recent' },
                  routes: []
                }
              ]
            }
          ]
        },
        {
          name: 'status',
          path: ':user/status/:id',
          options: { path: ':user/status/:id' },
          routes: []
        }
      ]
    },
    {
      name: 'anotherTopLevel',
      path: 'anotherTopLevel',
      options: { path: 'anotherTopLevel' },
      routes: [
        {
          name: 'withChildren',
          path: 'withChildren',
          options: { path: 'withChildren' },
          routes: []
        }
      ]
    }
  ])
})
