# Route Transition

Slick Router defines route transition as the process of changing from a route state, generally represented by an URL, to another one. It provides tools to control with great granularity the transition like cancel, redirect, stop or retry.

#### transition object

The transition object is itself a promise. It also contains the following attributes

* `id`: the transition id
* `routes`: the matched routes
* `path`: the matched path
* `pathname`: the matched path without query params
* `params`: a hash with path params
* `query`: a hash with the query
* `prev`: the previous matched info
  * `routes`
  * `path`
  * `pathname`
  * `params`
  * `query`

And the following methods

* `then`
* `catch`
* `cancel`
* `retry`
* `followRedirects`
* `redirectTo`

#### route

During every transition, you can inspect `transition.routes` and `transition.prev.routes` to see where the router is transitioning to. These are arrays that contain a list of route descriptors. Each route descriptor has the following attributes

* `name` - e.g. `'message'`
* `path` - the path segment, e.g. `'message/:id'`
* `params` - a list of params specifically for this route, e.g `{id: 1}`
* `options` - the options object that was passed to the `route` function in the `map`


## Errors

Transitions can fail, in which case the transition promise is rejected with the error object. This could happen, for example, if some middleware throws or returns a rejected promise.

There are also two special errors that can be thrown when a redirect happens or when transition is cancelled completely.

In case of redirect (someone initiating a router.transitionTo() while another transition was active) and error object will have a `type` attribute set to 'TransitionRedirected' and `nextPath` attribute set to the path of the new transition.

In case of cancelling (someone calling transition.cancel()) the error object will have a `type` attribute set to 'TransitionCancelled'.

If you have some error handling middleware - you most likely want to check for these two special errors, because they're normal to the functioning of the router, it's common to perform redirects.

