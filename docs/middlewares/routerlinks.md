# routerLinks middleware

Automatically setup route links and monitor the router transitions. When the corresponding route
is active, the 'active' class will be added to the element  
    
## Usage

Decorate a web component class using class mixin or decorator syntax

```javascript
import { withRouterLinks } from 'slick-router/middlewares/router-links'

@withRouterLinks
class MyView extends HTMLElement {}

// or

class MyView extends withRouterLinks(HTMLElement) {}
```

Manually bind a dom element:

```js
import { bindRouterLinks } from 'slick-router/middlewares/router-links'

const navEl = document.getElementById('main-nav') 
const unbind = bindRouterLinks(navEl)

// call unbind when (if) navEl element is removed from DOM 
```

## Options

Both `withRouterLinks` and `bindRouterLinks` can be configured with an options argument

### `selector`

Defines the selector that is used to search elements that holds router links.

Defaults to '[routerlinks]' 

### `query` and `params`

Returns default values to `query` or `params`

It can be defined as a hash or a function that returns a hash. 

The function is called with the onwner element as `this` and route name and link element as arguments


```javascript
const hashOptions = {
  params: {
    id: 3
  },
  query: {
    foo: 'bar'
  }
}

@withRouterLinks(hashOptions)
class MyView extends LitElement {}
```


```javascript
const dynOptions = {
  params: function (route) {
    if (route === 'root') return { id: this.rootId }
  },
  query: function (route, el) {
    if (route === 'child') return { foo: 'bar' }
    if (el.id === 'my-link') return { tag: el.tagName }
  }

class MyView extends withRouterLinks(LitElement, dynOptions) {
  rootId = 3
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
If is set to an empty string, no class is added
 
Examples:
```html
<div class="nav" routerlinks>
  
  <!-- a.href will be expanded to the contacts path -->
  <a route="contacts">All contacts</a>
  
  <!-- a.href will be expanded to the contacts path using {contactid: '1'} as params -->
  <a route="contact" param-contactid="1">First Contact</a>
  
  <!-- a click event handler will be added to the div, calling router.transitionTo('home') -->
  <div route="home">Home</div>
  
  <!-- a.href will be expanded to the about path and active class will be added to div. Useful for Bootstrao list-group -->
  <div route="about">
    <a>About</a>
  </div>  
</div>
```