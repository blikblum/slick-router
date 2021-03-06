import qs from '../../lib/qs'
import * as Path from '../../lib/path'
import 'chai/chai.js'

const { assert } = window.chai
const { describe, it } = window

describe('Path', () => {
  it('Path.extractParamNames', () => {
    assert.deepEqual(Path.extractParamNames('a/b/c'), [])
    assert.deepEqual(Path.extractParamNames('/comments/:a/:b/edit'), ['a', 'b'])
    assert.deepEqual(Path.extractParamNames('/files/:path*.jpg'), ['path'])
  })

  it('Path.extractParams', () => {
    assert.deepEqual(Path.extractParams('a/b/c', 'a/b/c'), {})
    assert.deepEqual(Path.extractParams('a/b/c', 'd/e/f'), null)

    assert.deepEqual(Path.extractParams('comments/:id.:ext/edit', 'comments/abc.js/edit'), { id: 'abc', ext: 'js' })

    assert.deepEqual(Path.extractParams('comments/:id?/edit', 'comments/123/edit'), { id: '123' })
    assert.deepEqual(Path.extractParams('comments/:id?/edit', 'comments/the%2Fid/edit'), { id: 'the/id' })
    assert.deepEqual(Path.extractParams('comments/:id?/edit', 'comments//edit'), null)
    assert.deepEqual(Path.extractParams('comments/:id?/edit', 'users/123'), null)

    assert.deepEqual(Path.extractParams('one, two', 'one, two'), {})
    assert.deepEqual(Path.extractParams('one, two', 'one two'), null)

    assert.deepEqual(Path.extractParams('/comments/:id/edit now', '/comments/abc/edit now'), { id: 'abc' })
    assert.deepEqual(Path.extractParams('/comments/:id/edit now', '/users/123'), null)

    assert.deepEqual(Path.extractParams('/files/:path*', '/files/my/photo.jpg'), { path: 'my/photo.jpg' })
    assert.deepEqual(Path.extractParams('/files/:path*', '/files/my/photo.jpg.zip'), { path: 'my/photo.jpg.zip' })
    assert.deepEqual(Path.extractParams('/files/:path*.jpg', '/files/my%2Fphoto.jpg'), { path: 'my/photo' })
    assert.deepEqual(Path.extractParams('/files/:path*', '/files'), { path: undefined })
    assert.deepEqual(Path.extractParams('/files/:path*', '/files/'), { path: undefined })
    assert.deepEqual(Path.extractParams('/files/:path*.jpg', '/files/my/photo.png'), null)

    // splat with named
    assert.deepEqual(Path.extractParams('/files/:path*.:ext', '/files/my/photo.jpg'), { path: 'my/photo', ext: 'jpg' })

    // multiple splats
    assert.deepEqual(Path.extractParams('/files/:path*\\.:ext*', '/files/my/photo.jpg/gif'), { path: 'my/photo', ext: 'jpg/gif' })

    // one more more segments
    assert.deepEqual(Path.extractParams('/files/:path+', '/files/my/photo.jpg'), { path: 'my/photo.jpg' })
    assert.deepEqual(Path.extractParams('/files/:path+', '/files/my/photo.jpg.zip'), { path: 'my/photo.jpg.zip' })
    assert.deepEqual(Path.extractParams('/files/:path+.jpg', '/files/my/photo.jpg'), { path: 'my/photo' })
    assert.deepEqual(Path.extractParams('/files/:path+', '/files'), null)
    assert.deepEqual(Path.extractParams('/files/:path+', '/files/'), null)
    assert.deepEqual(Path.extractParams('/files/:path+.jpg', '/files/my/photo.png'), null)

    assert.deepEqual(Path.extractParams('/archive/:name?', '/archive'), { name: undefined })
    assert.deepEqual(Path.extractParams('/archive/:name?', '/archive/'), { name: undefined })
    assert.deepEqual(Path.extractParams('/archive/:name?', '/archive/foo'), { name: 'foo' })
    assert.deepEqual(Path.extractParams('/archive/:name?', '/archivefoo'), null)
    assert.deepEqual(Path.extractParams('/archive/:name?', '/archiv'), null)

    assert.deepEqual(Path.extractParams('/:query/with/:domain', '/foo/with/foo.app'), { query: 'foo', domain: 'foo.app' })
    assert.deepEqual(Path.extractParams('/:query/with/:domain', '/foo.ap/with/foo'), { query: 'foo.ap', domain: 'foo' })
    assert.deepEqual(Path.extractParams('/:query/with/:domain', '/foo.ap/with/foo.app'), { query: 'foo.ap', domain: 'foo.app' })
    assert.deepEqual(Path.extractParams('/:query/with/:domain', '/foo.ap'), null)

    // advanced use case of making params in the middle of the url optional
    assert.deepEqual(Path.extractParams('/comments/:id(.*/?edit)', '/comments/123/edit'), { id: '123/edit' })
    assert.deepEqual(Path.extractParams('/comments/:id(.*/?edit)', '/comments/edit'), { id: 'edit' })
    assert.deepEqual(Path.extractParams('/comments/:id(.*/?edit)', '/comments/editor'), null)
    assert.deepEqual(Path.extractParams('/comments/:id(.*/?edit)', '/comments/123'), null)
  })

  it('Path.injectParams', () => {
    assert.equal(Path.injectParams('/a/b/c', {}), '/a/b/c')

    assert.throws(() => Path.injectParams('comments/:id/edit', {}))

    assert.equal(Path.injectParams('comments/:id?/edit', { id: '123' }), 'comments/123/edit')
    assert.equal(Path.injectParams('comments/:id?/edit', {}), 'comments//edit')
    assert.equal(Path.injectParams('comments/:id?/edit', { id: 'abc' }), 'comments/abc/edit')
    assert.equal(Path.injectParams('comments/:id?/edit', { id: 0 }), 'comments/0/edit')
    assert.equal(Path.injectParams('comments/:id?/edit', { id: 'one, two' }), 'comments/one%2C%20two/edit')
    assert.equal(Path.injectParams('comments/:id?/edit', { id: 'the/id' }), 'comments/the%2Fid/edit')
    assert.equal(Path.injectParams('comments/:id?/edit', { id: 'alt.black.helicopter' }), 'comments/alt.black.helicopter/edit')

    assert.equal(Path.injectParams('/a/:foo*/d', { foo: 'b/c' }), '/a/b/c/d')
    assert.equal(Path.injectParams('/a/:foo*/c/:bar*', { foo: 'b', bar: 'd' }), '/a/b/c/d')
    assert.equal(Path.injectParams('/a/:foo*/c/:bar*', { foo: 'b' }), '/a/b/c/')

    assert.equal(Path.injectParams('/a/:foo+/d', { foo: 'b/c' }), '/a/b/c/d')
    assert.equal(Path.injectParams('/a/:foo+/c/:bar+', { foo: 'b?', bar: 'd ' }), '/a/b%3F/c/d%20')
    assert.throws(() => Path.injectParams('/a/:foo+/c/:bar+', { foo: 'b' }))

    assert.equal(Path.injectParams('/foo.bar.baz'), '/foo.bar.baz')
  })

  it('Path.extractQuery', () => {
    assert.deepEqual(Path.extractQuery(qs, '/?id=def&show=true'), { id: 'def', show: 'true' })
    assert.deepEqual(Path.extractQuery(qs, '/?id=a%26b'), { id: 'a&b' })
    assert.deepEqual(Path.extractQuery(qs, '/a/b/c'), null)
  })

  it('Path.withoutQuery', () => {
    assert.equal(Path.withoutQuery('/a/b/c?id=def'), '/a/b/c')
  })

  it('Path.withQuery', () => {
    assert.equal(Path.withQuery(qs, '/a/b/c', { id: 'def' }), '/a/b/c?id=def')
    assert.equal(Path.withQuery(qs, '/a/b/c', { id: 'def', foo: 'bar', baz: undefined }), '/a/b/c?id=def&foo=bar')
    assert.equal(Path.withQuery(qs, '/path?a=b', { c: 'f&a=i#j+k' }), '/path?c=f%26a%3Di%23j%2Bk')
  })
})
