import $ from '../functional/nanodom'
import { intercept } from '../../lib/links'
import 'chai/chai.js'

const { assert } = window.chai
const { describe, it, beforeEach, afterEach } = window
let $container
let clickHandler

describe('links', () => {
  beforeEach(() => {
    $container = $('<div/>').appendTo('body')
  })
  afterEach(() => {
    $container.empty().remove()
    document.removeEventListener('click', clickHandler)
  })

  it('intercepts link clicks', () => {
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

    // now it that when clicking the link, the calledWith
    $a.get(0).click()
    // it calls back with event and el
    assert.equal(calledWith[0].event.target, calledWith[0].el)
    // and the el is the link that was clicked
    assert.equal(calledWith[0].el, $a.get(0))
    assert.equal(navPreventedCount, 1)

    // it that cleanup works
    dispose()
    // clicking this time
    $a.get(0).click()
    // should not call the cb again
    assert.equal(calledWith.length, 1)
    // only the nav prevention should kick in
    assert.equal(navPreventedCount, 2)
  })
})
