import { assert } from '@sinonjs/referee'
import dsl from '../../lib/dsl'

let { suite, test } = window

suite('dsl')

test('simple route map', () => {
  const routes = dsl(route => {
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
  const routes = dsl(route => {
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
  const routes = dsl(route => {
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
