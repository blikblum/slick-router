
import { clone, pick, isEqual, extend } from '../../lib/utils'
import 'chai/chai.js'

const { assert } = window.chai
const { describe, it } = window

describe('dash', () => {
  it('clone arrays', () => {
    const a = [1, 2, 3]
    const b = clone(a)
    b.push(4)
    assert.deepEqual(a, [1, 2, 3])
    assert.deepEqual(b, [1, 2, 3, 4])
  })

  it('clone objects', () => {
    const a = { a: 1, b: 2 }
    const b = clone(a)
    b.c = 3
    assert.deepEqual(a, { a: 1, b: 2 })
    assert.deepEqual(b, { a: 1, b: 2, c: 3 })
  })

  it('clone falsy values', () => {
    assert.equal(clone(undefined), undefined)
    assert.equal(clone(null), null)
    assert.equal(clone(false), false)
    assert.equal(clone(0), 0)
  })

  it('pick', () => {
    assert.deepEqual(pick({ a: 1, b: 2, c: 3 }, ['a', 'c']), { a: 1, c: 3 })
    assert.deepEqual(pick({ a: 1 }, ['a', 'c']), { a: 1 })
  })

  it('isEqual', () => {
    const arr = []
    assert(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 }))
    assert(isEqual({ a: 1, b: arr }, { a: 1, b: arr }))
    assert.isNotOk(isEqual({ a: 1, b: 2 }, { a: 1, b: '2' }))
    assert.isNotOk(isEqual({ a: 1, b: 2 }, { a: 1 }))
    assert.isNotOk(isEqual({ a: 1, b: { c: 3 } }, { a: 1, b: { c: 3 } }))
  })

  it('extend', () => {
    assert.deepEqual(extend({}, { a: 1, b: 2 }, null, { c: 3 }), { a: 1, b: 2, c: 3 })

    const obj = { d: 4 }
    const target = {}
    extend(target, obj)
    target.a = 1
    obj.b = 2
    assert.deepEqual(obj, { b: 2, d: 4 })
    assert.deepEqual(target, { a: 1, d: 4 })
  })
})
