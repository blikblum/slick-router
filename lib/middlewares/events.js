let eventPrefix

function trigger (name, detail) {
  window.dispatchEvent(new CustomEvent(`${eventPrefix}${name}`, { detail }))
}

export const events = {
  create: function (router) {
    eventPrefix = router.options.eventPrefix || 'router-'
  },

  before: function (transition) {
    trigger('before:transition', { transition })
  },

  done: function (transition) {
    trigger('transition', { transition })
  },

  cancel: function (transition, error) {
    if (error.type !== 'TransitionRedirected') {
      trigger('abort', { transition, error })
    }
  },

  error: function (transition, error) {
    trigger('abort', { transition, error })
    trigger('error', { transition, error })
  }
}
