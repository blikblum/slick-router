# wc middleware

Render web components according to router state. Provides advanced funcionality like lazy loading, nested components and routing control though lifecycle hooks.

## Route Configuration

### `component`

Can be configured as a string with the web component tag name, as an class constructor (HTMLElement descendant) or as a function which must resolves to an tag name or constructor. 

> The function is called with route configuration as argument and is only executed when the route is entered. If is async, it waits to be resolved. 


```js
import './components/home-view.js'
import LoginView from './components/login-view.js'

function AboutView () {
  return import('./components/about-view.js')
}

const routes = [
  {
    name: 'home',
    component: 'home-view'
  },
  {
    name: 'login',
    component: LoginView
  },
  {
    name: 'about',
    component: AboutView
  }
]
```

> When using [dynamic import](https://javascript.info/modules-dynamic-imports) with a tool like [webpack](webpack.js.org) the corresponding code is split from main bundle and lazy loaded

### `reuse`

By default, the routes elements are created each navigation even when the same route is matched.

Setting `reuse` to true will make the router reuse the same element instance when the same route is matched

```js
const routes = [
  {
    name: 'person',
    component: 'person-view',
    path: 'person/:id',
    reuse: true
  }
]
```

In the above example transitioning from 'person/1' to 'person/2' will not create a new 'person-view' element.
The lifecycle hooks will be fired and `$route` property will be updated

### `properties`

Defines the properties that are set to route element each time a transition occurs.

```js
const routes = [
  {
    name: 'hello',
    component: 'message-view',
    properties: {
      message: 'Hello'
    }
  },
  {
    name: 'goodbye',
    component: 'message-view',
    properties: {
      message: 'Goodbye'
    }
  }
]
```

By using `paramValue` and `queryValue` is possible to map dynamic route values to the route element. 
Both accepts a `key` parameter to define the query or param to retrieve from, a `format` that can be 'number' to convert to number or a function to do custom formatting

```js
import { paramValue, queryValue } from 'slick-router/middlewares/wc'

const routes = [
  {
    name: 'person',
    component: 'person-view',
    path: '/person/:id'
    properties: {
      personId: paramValue('id', 'number')
    }
  },
  {
    name: 'people',
    component: 'people-view',
    properties: {
      sort: queryValue('sort', value => value.toUpperCase())
    }
  }
]
```

In the above example, when path is 'person/2' the rendered element of person route will have personId set to 2.
When path is 'people?sort=asc' the people route element will have sort set to 'ASC'

### `beforeEnter`

Function that is called before the route is entered. A `transition` instance is passed as argument allowing to manipulate it, e.g., cancel or redirect. 

In nested routes, is called from parent to child

It can be an async function in which case is awaited before proceeding.

```js
const routes = [  
  {
    name: 'settings',
    beforeEnter: (transition) => {
      if !isLogged() {
        transition.redirectTo('login')
      }
    }
  }
]
```

> If `beforeEnter` returns false, the transition is cancelled

### `afterEnter`

Function that is called after the route is entered. A `transition` instance is passed as argument but trying to manipulate it, e.g., cancel or redirect will not have effect 

In nested routes, is called from parent to child

Even if is an async function it will not be awaited before proceeding.

### `beforeLeave`

Function that is called before the route is about to leave. A `transition` instance is passed as argument allowing to manipulate it, e.g., cancel or redirect. 

In nested routes, is called from child to parent

It can be an async function in which case is awaited before proceeding.

```js
const routes = [  
  {
    name: 'settings',
    beforeLeave: async (transition) => {
      return await asyncDialog('Are you sure you want to leave?')
    }
  }
]
```

> If `beforeLeave` returns false, the transition is cancelled

### `afterLeave`

Function that is called after the route is leave. A `transition` instance is passed as argument but trying to manipulate it, e.g., cancel or redirect will not have effect 

In nested routes, is called from child to parent

Even if is an async function it will not be awaited before proceeding.

## Component Lifecycle Methods

Routing state can be acessed in component instance methods

### `beforeRouteEnter`

Called with `transition` instance as argument before is inserted in the dom tree. Exhibits same behavior as [`beforeEnter`](#beforeenter)

```js
class HomeView extends HTMLElement {
  beforeRouteEnter(transition) {
    console.log('Before entering in home')
  }
}
```

### `afterRouteEnter`

Called with `transition` instance as argument before is inserted in the dom tree. Exhibits same behavior as [`afterEnter`](#afterenter)


### `beforeRouteLeave`

Called with `transition` instance as argument before is removed from the dom tree. Exhibits same behavior as [`beforeLeave`](#beforeleave)

```js
class FormView extends HTMLElement {
  async beforeRouteLeave(transition) {
    if (!this.dataIsSaved()) {
      return await asyncDialog('Data not saved. Are you sure to leave?')
    }
  }
}
```

### `afterRouteLeave`

Called with `transition` instance as argument after is removed in the dom tree. Exhibits same behavior as [`afterLeave`](#afterleave)


## Component Properties

Routing related properties set to components

### `$router`

Associated router instance

### `$route`

Object holding active route state:

```js
{
  routes, // matched routes
  path,
  pathname,
  params,
  query
}
```