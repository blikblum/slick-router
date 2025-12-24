import qs from '../../lib/qs'
import * as Path from '../../lib/path'

import { patternCompiler as defaultPatternCompiler } from '../../lib/patternCompiler.js'
import { patternCompiler as pathToRegexPatternCompiler } from './pathToRegexPatternCompiler.js'

import { assert } from 'chai'

function testExtractParamNames(patternCompiler) {
  assert.deepEqual(Path.extractParamNames('a/b/c', patternCompiler), [])
  assert.deepEqual(Path.extractParamNames('/comments/:a/:b/edit', patternCompiler), ['a', 'b'])
  assert.deepEqual(Path.extractParamNames('/files/:path*.jpg', patternCompiler), ['path'])
}

function testExtractParams(patternCompiler, edgeCases) {
  assert.deepEqual(Path.extractParams('/a/b/c', '/a/b/c', patternCompiler), {})
  assert.deepEqual(Path.extractParams('/a/b/c', '/d/e/f', patternCompiler), null)

  assert.deepEqual(
    Path.extractParams('/comments/:id?/edit', '/comments/123/edit', patternCompiler),
    { id: '123' },
  )
  assert.deepEqual(
    Path.extractParams('/comments/:id?/edit', '/comments/the%2Fid/edit', patternCompiler),
    { id: 'the/id' },
  )
  assert.deepEqual(
    Path.extractParams('/comments/:id?/edit', '/comments//edit', patternCompiler),
    null,
  )
  assert.deepEqual(Path.extractParams('/comments/:id?/edit', '/users/123', patternCompiler), null)

  assert.deepEqual(Path.extractParams('/one, two', '/one, two', patternCompiler), {})
  assert.deepEqual(Path.extractParams('/one, two', '/one two', patternCompiler), null)

  assert.deepEqual(
    Path.extractParams('/comments/:id/edit now', '/comments/abc/edit now', patternCompiler),
    { id: 'abc' },
  )
  assert.deepEqual(
    Path.extractParams('/comments/:id/edit now', '/users/123', patternCompiler),
    null,
  )

  assert.deepEqual(Path.extractParams('/files/:path*', '/files/my/photo.jpg', patternCompiler), {
    path: 'my/photo.jpg',
  })
  assert.deepEqual(
    Path.extractParams('/files/:path*', '/files/my/photo.jpg.zip', patternCompiler),
    { path: 'my/photo.jpg.zip' },
  )

  assert.deepEqual(Path.extractParams('/archive/:name?', '/archive', patternCompiler), {
    name: undefined,
  })
  assert.deepEqual(Path.extractParams('/archive/:name?', '/archive/', patternCompiler), {
    name: undefined,
  })
  assert.deepEqual(Path.extractParams('/archive/:name?', '/archive/foo', patternCompiler), {
    name: 'foo',
  })
  assert.deepEqual(Path.extractParams('/archive/:name?', '/archivefoo', patternCompiler), null)
  assert.deepEqual(Path.extractParams('/archive/:name?', '/archiv', patternCompiler), null)

  assert.deepEqual(
    Path.extractParams('/:query/with/:domain', '/foo/with/foo.app', patternCompiler),
    { query: 'foo', domain: 'foo.app' },
  )
  assert.deepEqual(
    Path.extractParams('/:query/with/:domain', '/foo.ap/with/foo', patternCompiler),
    { query: 'foo.ap', domain: 'foo' },
  )
  assert.deepEqual(
    Path.extractParams('/:query/with/:domain', '/foo.ap/with/foo.app', patternCompiler),
    { query: 'foo.ap', domain: 'foo.app' },
  )
  assert.deepEqual(Path.extractParams('/:query/with/:domain', '/foo.ap', patternCompiler), null)

  if (edgeCases) {
    assert.deepEqual(
      Path.extractParams('/comments/:id.:ext/edit', '/comments/abc.js/edit', patternCompiler),
      { id: 'abc', ext: 'js' },
    )
    assert.deepEqual(
      Path.extractParams('/files/:path*.jpg', '/files/my%2Fphoto.jpg', patternCompiler),
      { path: 'my/photo' },
    )
    assert.deepEqual(Path.extractParams('/files/:path*', '/files', patternCompiler), {
      path: undefined,
    })
    assert.deepEqual(Path.extractParams('/files/:path*', '/files/', patternCompiler), {
      path: undefined,
    })
    assert.deepEqual(
      Path.extractParams('/files/:path*.jpg', '/files/my/photo.png', patternCompiler),
      null,
    )

    // splat with named
    assert.deepEqual(
      Path.extractParams('/files/:path*.:ext', '/files/my/photo.jpg', patternCompiler),
      { path: 'my/photo', ext: 'jpg' },
    )

    // multiple splats
    // this is not supported by latest path-to-regexp https://github.com/pillarjs/path-to-regexp/issues/214
    // also not supported by URLPattern https://github.com/whatwg/urlpattern/issues/163
    // assert.deepEqual(Path.extractParams('/files/:path*\\.:ext*', '/files/my/photo.jpg/gif', patternCompiler), { path: 'my/photo', ext: 'jpg/gif' })

    // one more more segments
    assert.deepEqual(Path.extractParams('/files/:path+', '/files/my/photo.jpg', patternCompiler), {
      path: 'my/photo.jpg',
    })
    assert.deepEqual(
      Path.extractParams('/files/:path+', '/files/my/photo.jpg.zip', patternCompiler),
      { path: 'my/photo.jpg.zip' },
    )
    assert.deepEqual(
      Path.extractParams('/files/:path+.jpg', '/files/my/photo.jpg', patternCompiler),
      { path: 'my/photo' },
    )
    assert.deepEqual(Path.extractParams('/files/:path+', '/files', patternCompiler), null)
    assert.deepEqual(Path.extractParams('/files/:path+', '/files/', patternCompiler), null)
    assert.deepEqual(
      Path.extractParams('/files/:path+.jpg', '/files/my/photo.png', patternCompiler),
      null,
    )

    // advanced use case of making params in the middle of the url optional
    assert.deepEqual(
      Path.extractParams('/comments/:id(.*/?edit)', '/comments/123/edit', patternCompiler),
      { id: '123/edit' },
    )
    assert.deepEqual(
      Path.extractParams('/comments/:id(.*/?edit)', '/comments/edit', patternCompiler),
      { id: 'edit' },
    )
    assert.deepEqual(
      Path.extractParams('/comments/:id(.*/?edit)', '/comments/editor', patternCompiler),
      null,
    )
    assert.deepEqual(
      Path.extractParams('/comments/:id(.*/?edit)', '/comments/123', patternCompiler),
      null,
    )
  }
}

describe('Path', () => {
  describe('Path.extractParamNames', () => {
    it('with default patternCompiler', () => {
      Path.clearPatternCompilerCache()
      testExtractParamNames(defaultPatternCompiler)
    })

    it('with pathToRegex patternCompiler', () => {
      Path.clearPatternCompilerCache()
      testExtractParamNames(pathToRegexPatternCompiler)
    })
  })

  describe('Path.extractParams', () => {
    it('with default patternCompiler', () => {
      Path.clearPatternCompilerCache()
      testExtractParams(defaultPatternCompiler, false)
    })

    it('with pathToRegex patternCompiler', () => {
      Path.clearPatternCompilerCache()
      testExtractParams(pathToRegexPatternCompiler, true)
    })
  })

  it('Path.injectParams', () => {
    assert.equal(Path.injectParams('/a/b/c', {}), '/a/b/c')

    assert.throws(() => Path.injectParams('comments/:id/edit', {}))

    assert.equal(Path.injectParams('comments/:id?/edit', { id: '123' }), 'comments/123/edit')
    assert.equal(Path.injectParams('comments/:id?/edit', {}), 'comments//edit')
    assert.equal(Path.injectParams('comments/:id?/edit', { id: 'abc' }), 'comments/abc/edit')
    assert.equal(Path.injectParams('comments/:id?/edit', { id: 0 }), 'comments/0/edit')
    assert.equal(
      Path.injectParams('comments/:id?/edit', { id: 'one, two' }),
      'comments/one%2C%20two/edit',
    )
    assert.equal(
      Path.injectParams('comments/:id?/edit', { id: 'the/id' }),
      'comments/the%2Fid/edit',
    )
    assert.equal(
      Path.injectParams('comments/:id?/edit', { id: 'alt.black.helicopter' }),
      'comments/alt.black.helicopter/edit',
    )

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
    assert.equal(
      Path.withQuery(qs, '/a/b/c', { id: 'def', foo: 'bar', baz: undefined }),
      '/a/b/c?id=def&foo=bar',
    )
    assert.equal(Path.withQuery(qs, '/path?a=b', { c: 'f&a=i#j+k' }), '/path?c=f%26a%3Di%23j%2Bk')
  })
})
