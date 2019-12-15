import $ from '../functional/nanodom'
import { assert } from '@sinonjs/referee'
import { intercept } from '../../lib/links'

const { suite, test, beforeEach, afterEach } = window
let $container
let clickHandler

suite('links')

beforeEach(() => {
  $container = $('<div/>').appendTo('body')
})
afterEach(() => {
  $container.empty().remove()
  document.removeEventListener('click', clickHandler)
})

test('intercepts link clicks', () => {
  const $a = $('<a href="/foo">foo</a>').appendTo($container)
  // prevent navigation

  const calledWith = []
  const cb = (event, el) => calledWith.push({ event, el })

  // proxy all clicks via this callback
  const dispose = intercept(cb)

  // install another click handler that will prevent
  // the navigation, we must install this after the
  // link.intercept has been already called
  let navPreventedCount = 0
  clickHandler = e => {
    navPreventedCount++
    e.preventDefault()
  }
  document.addEventListener('click', clickHandler)

  // now test that when clicking the link, the calledWith
  $a.get(0).click()
  // it calls back with event and el
  assert.equals(calledWith[0].event.target, calledWith[0].el)
  // and the el is the link that was clicked
  assert.equals(calledWith[0].el, $a.get(0))
  assert.equals(navPreventedCount, 1)

  // test that cleanup works
  dispose()
  // clicking this time
  $a.get(0).click()
  // should not call the cb again
  assert.equals(calledWith.length, 1)
  // only the nav prevention should kick in
  assert.equals(navPreventedCount, 2)
})
