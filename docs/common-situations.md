


# Common Situations 

## Handling 404

There are a couple of ways to handle URLs that don't match any routes.

You can create a middleware to detects when `transition.routes.length` is 0 and render a 404 page.

Alternatively, you can also declare a catch all path in your route map:

```js
router.map(function (route) {
  route('application', {path: '/'}, function () {
    route('blog')
    route('missing', {path: ':path*'})
  })
})
```

In this case, when nothing else matches, a transition to the `missing` route will be initiated with `transition.routes` as ['application', 'missing']. This gives you a chance to activate and render the `application` route before rendering a 404 page.
