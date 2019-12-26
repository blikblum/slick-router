# wc middleware

## Introduction

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