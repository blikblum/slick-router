import dsl from '../../lib/array-dsl'
import 'chai/chai.js'

const { assert } = window.chai
const { describe, it } = window

describe('array-dsl', () => {
  it('simple route map', () => {
    const routes = dsl([{ name: 'application' }])
    assert.deepEqual(routes, [
      {
        name: 'application',
        path: 'application',
        options: { path: 'application' },
        routes: [],
      },
    ])
  })

  it('simple route map with options', () => {
    const routes = dsl([
      {
        name: 'application',
        path: '/',
        foo: 'bar',
      },
    ])

    assert.deepEqual(routes, [
      {
        name: 'application',
        path: '/',
        options: { foo: 'bar', path: '/' },
        routes: [],
      },
    ])
  })

  it('simple nested route map', () => {
    const routes = dsl([
      {
        name: 'application',
        children: [
          {
            name: 'child',
          },
        ],
      },
    ])

    assert.deepEqual(routes, [
      {
        name: 'application',
        path: 'application',
        options: { path: 'application' },
        routes: [
          {
            name: 'child',
            path: 'child',
            options: { path: 'child' },
            routes: [],
          },
        ],
      },
    ])
  })

  it('route with dot names and no path', () => {
    const routes = dsl([
      {
        name: 'application',
        children: [
          {
            name: 'application.child',
          },
        ],
      },
    ])

    assert.deepEqual(routes, [
      {
        name: 'application',
        path: 'application',
        options: { path: 'application' },
        routes: [
          {
            name: 'application.child',
            path: 'child',
            options: { path: 'child' },
            routes: [],
          },
        ],
      },
    ])
  })

  it('complex example', () => {
    const routes = dsl([
      {
        name: 'application',
        abstract: true,
        children: [
          {
            name: 'notifications',
          },
          {
            name: 'messages',
            children: [
              {
                name: 'unread',
                children: [
                  {
                    name: 'priority',
                  },
                ],
              },
              {
                name: 'read',
              },
              {
                name: 'draft',
                abstract: true,
                children: [
                  {
                    name: 'recent',
                  },
                ],
              },
            ],
          },
          {
            name: 'status',
            path: ':user/status/:id',
          },
        ],
      },
      {
        name: 'anotherTopLevel',
        children: [
          {
            name: 'withChildren',
          },
        ],
      },
    ])

    assert.deepEqual(routes, [
      {
        name: 'application',
        path: 'application',
        options: { path: 'application', abstract: true },
        routes: [
          {
            name: 'notifications',
            path: 'notifications',
            options: { path: 'notifications' },
            routes: [],
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
                    routes: [],
                  },
                ],
              },
              {
                name: 'read',
                path: 'read',
                options: { path: 'read' },
                routes: [],
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
                    routes: [],
                  },
                ],
              },
            ],
          },
          {
            name: 'status',
            path: ':user/status/:id',
            options: { path: ':user/status/:id' },
            routes: [],
          },
        ],
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
            routes: [],
          },
        ],
      },
    ])
  })
})
