# Programmatic Navigation and Link Handling

### router.transitionTo(name, params, query)

Transition to a route, e.g.

```js
router.transitionTo('about')
router.transitionTo('posts.show', {postId: 1})
router.transitionTo('posts.show', {postId: 2}, {commentId: 2})
```

### router.replaceWith(name, params, query)

Same as transitionTo, but doesn't add an entry in browser's history, instead replaces the current entry. Useful if you don't want this transition to be accessible via browser's Back button, e.g. if you're redirecting, or if you're navigating upon clicking tabs in the UI, etc.

### router.generate(name, params, query)

Generate a URL for a route, e.g.

```js
router.generate('about')
router.generate('posts.show', {postId: 1})
router.generate('posts.show', {postId: 2}, {commentId: 2})
```

It generates a URL with # if router is in hashChange mode and with no # if router is in pushState mode.

### router.isActive(name, params, query, exact)

Check if a given route, params and query is active.

```js
router.isActive('status')
router.isActive('status', {user: 'me'})
router.isActive('status', {user: 'me'}, {commentId: 2})
router.isActive('status', null, {commentId: 2})
```

When optional exact argument is truthy, the route is marked as active only if the path match exactly, e.g.,

```js
const routes = [
  name: 'app',
  children: [
    {
      name: 'dashboard'
    }
  ]
]

// path = /app
router.isActive('app', null, null) // true
router.isActive('app', null, null, true) // true

// path = /app/dashboard
router.isActive('app', null, null) // true
router.isActive('app', null, null, true) // false
```

### router.state

The state of the route is always available on the `router.state` object. It contains `activeTransition`, `routes`, `path`, `pathname`, `params` and `query`.

### router.matchers

Use this to inspect all the routes and their URL patterns that exist in your application. It's an array of:

```js
{
  name,
  path,
  routes
}
```

listed in the order that they will be matched against the URL.
