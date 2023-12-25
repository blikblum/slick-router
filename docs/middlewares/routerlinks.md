# routerLinks middleware

Automatically setup route links and monitor the router transitions. When the corresponding route
is active, the 'active' class will be added to the element  
    
## Usage

Wrap router links elements with `router-links` web component

```javascript
import 'slick-router/components/router-links'

class MyView extends LitElement {
  render() {
    return html`
      <router-links>
        <a route="home">Home</a>
        <a route="about">About</a>
      </router-links>
    `
  }
}
```

Manually bind a dom element:

```js
import { bindRouterLinks } from 'slick-router/middlewares/router-links'

const navEl = document.getElementById('main-nav') 
const unbind = bindRouterLinks(navEl)

// call unbind when (if) navEl element is removed from DOM 
```

## Options

Both `router-links` and `bindRouterLinks` can be configured


### `query` and `params`

Returns default values to `query` or `params`

It can be defined as a hash or a function that returns a hash. 

The function is called with the onwner element as `this` and route name and link element as arguments


```javascript
const routeParams = {
  id: 3
}
 
const routeQuery = {
  foo: 'bar'
}
 

const unbind = bindRouterLinks(navEl, { params: routeParams, query: routeQuery })

// or
class MyView extends LitElement {
  render() {
    return html`
      <router-links .params=${routeParams} .query=${routeQuery}>
        <a route="home">Home</a>
        <a route="about">About</a>
      </router-links>
    `
  }
}
```


```javascript
function getRouteParams(route, el) {
  if (route === 'home') return { id: this.rootId }
}

function getRouteQuery(route, el) {
  if (route === 'child') return { foo: 'bar' }
  if (el.id === 'my-link') return { tag: el.tagName }
}

const unbind = bindRouterLinks(navEl, { params: getRouteParams, query: getRouteQuery })

// or
class MyView extends LitElement {
  render() {
    return html`
      <router-links .rootId=${5} .params=${getRouteParams} .query=${getRouteQuery}>
        <a route="home">Home</a>
        <a route="about">About</a>
      </router-links>
    `
  }
}
```


## Markup

The router links are configured with HTML attributes

They must be child, direct or not, of an element with 'routerlinks' attribute or the one defined in [selector option](#selector).

### route

Defines the route be transitioned to. Should be the name of a route configured in the router map.
When the element is an anchor (<code>a</code>), its href will be expanded to the route path.

Adding a route attribute to a non anchor element will setup a click event handler that calls `router.transitionTo`
with the appropriate arguments. The exception is when the element has an anchor child. In this case the anchor href
will be expanded.
  
### param-*  
  
Defines a param value where the param name is the substring after `param-` prefix

### query-*  
  
Defines a query value where the query name is the substring after `query-` prefix

### active-class

Defines the class to be toggled in the element with route attribute according to the route active state. By default is 'active'.
If is set to an empty string, no class is added.

### exact

When present the active class will be set only the route path matches exactly with the one being transitioned.

### replace

When present it will use `replaceWith` instead of `transitionTo` thus not adding a history entry

Example:

```html
<div class="nav">  
  <!-- a.href will be expanded to the contacts path -->
  <a route="contacts">All contacts</a>
  
  <!-- a.href will be expanded to the contacts path using {contactid: '1'} as params -->
  <a route="contact" param-contactid="1">First Contact</a>
  
  <!-- a click event handler will be added to the div, calling router.transitionTo('home') -->
  <div route="home">Home</div>
  
  <!-- uses active-link class when route is active -->
  <div route="home" active-class="active-link">Home</div>

  <!-- it will get the active class only when path is /contacts but not when is /contacts/1 -->
  <div route="contacts" exact>Contacts</div>

  <!-- it will use router.replaceWith instead of router.transitionTo -->
  <div route="contacts" replace>Contacts</div>

  <!-- a.href will be expanded to the about path and active class will be added to div. Useful for Bootstrao list-group layout -->
  <div route="about">
    <a>About</a>
  </div>  
</div>
```