# events middleware

Trigger router events on window instance  
    
## Usage

Listen to events on window:

```javascript
window.addEventListener('router-transition', (e) => {
  const { transition } = e.detail
  console.log(`Route transitioned from ${transition.prev.path} to from ${transition.path}`)
})
```

## Options

### `eventPrefix`

Defines the events prefix.

Defaults to 'router-' 

## Events

### before:transition

Fired before a route transition is run
  
### transition

Fired after a successful route transition is completed

### error  
  
Fired when an error occurs while running a route transition

### abort

Fired when an error occurs or when a route transition is cancelled
