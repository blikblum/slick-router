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

Defines the properties that are set to the route element.

Its a hash where the key is the property name and the value is either a primitive a value (string, number) or a property hook (see below)

```js
// navigating to 'hello' will render a message-view element with message set to 'Hello'
// navigating to 'goodbye' will render a message-view element with message set to 'Goodbye' 
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


#### Property hooks

Property hooks provides a way to intercept routing lifecycle and set properties dynamically

Its a object with the following methods:
 - `init` - called first time the route is entered. Its called with a setter function
 - `enter` - called after the route is entered. Its called with the current transition and a setter function
 - `leave` - called after the route is leave. Its called with the current transition and a setter function
 - `update` - called when the property value is updated by one of the other methods. Its called with the new value and element instance


The following builtin hook factories are provided:
 - `fromParam`: sets the property from a route param. Accepts a `key` parameter to define the param to retrieve from and a optional `format` parameter to convert the value 
 - `fromQuery`: sets the property from a route query. Accepts a `key` parameter to define the query to retrieve from and a optional `format` parameter to convert the value
 - `fromValue`: sets the property from a value. Accepts a `value` parameter to define the value to set

The `format` parameter can be 'number' to convert to number or a function to do custom formatting

```js
import { fromParam, fromQuery } from 'slick-router/middlewares/wc'

const routes = [
  {
    name: 'person',
    component: 'person-view',
    path: '/person/:id'
    properties: {
      personId: fromParam('id', 'number')
    }
  },
  {
    name: 'people',
    component: 'people-view',
    properties: {
      sort: fromQuery('sort', value => value.toUpperCase())
    }
  }
]
```

In the above example, when path is 'person/2' the rendered element of person route will have personId set to 2.
When path is 'people?sort=asc' the people route element will have sort set to 'ASC'

** Custom property hooks **

```js

// reads a value from local storage each time the route is entered
function fromLocalStorage(key) {
  return {
    enter(transition, set) {
      set(localStorage.getItem(key))
    }
  }
}

// reads a value from a DI container first time the route is entered 
function fromService(service) {
  return {
    init(set) {
      const value = someServiceContainer[service]
      set(value)
    }
  }
}

// reads a value from a store and updates the element property when the store changes
// useful for libraries like reatom or nanostores
function fromDataStore(store) {
  return {
    enter(transition, set) {
      this.unsubscribe = store.subscribe(value => set(value))
    }

    leave() {
      this.unsubscribe && this.unsubscribe()
    }
  }
}


const routes = [
  {
    name: 'person',
    component: 'person-view',
    path: '/person'
    properties: {
      personId: fromLocalStorage('personId'),
      dbApi: fromService('dbApi'),
      appUser: fromDataStore(appUserStore)
    }
  }
]
```

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