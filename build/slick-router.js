import pathToRegexp from 'path-to-regexp';

var toString = Object.prototype.toString;
var keys = Object.keys;

var assoc = function assoc(obj, attr, val) {
  obj[attr] = val;
  return obj;
};

var isArray = Array.isArray;
var clone = function clone(obj) {
  return obj ? isArray(obj) ? obj.slice(0) : Object.assign({}, obj) : obj;
};
var pick = function pick(obj, attrs) {
  return attrs.reduce(function (acc, attr) {
    return obj[attr] === undefined ? acc : assoc(acc, attr, obj[attr]);
  }, {});
};
var isEqual = function isEqual(obj1, obj2) {
  var keys1 = keys(obj1);
  return keys1.length === keys(obj2).length && keys1.every(function (key) {
    return obj2[key] === obj1[key];
  });
};
var extend = function extend(obj) {
  for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    rest[_key - 1] = arguments[_key];
  }

  rest.forEach(function (source) {
    if (source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
};
var isString = function isString(obj) {
  return toString.call(obj) === '[object String]';
};

function invariant(condition, format, a, b, c, d, e, f) {
  if (!condition) {
    var args = [a, b, c, d, e, f];
    var argIndex = 0;
    var error = new Error('Invariant Violation: ' + format.replace(/%s/g, function () {
      return args[argIndex++];
    }));
    error.framesToPop = 1; // we don't care about invariant's own frame

    throw error;
  }
}

/* eslint-disable standard/no-callback-literal */
function functionDsl(callback) {
  var ancestors = [];
  var matches = {};
  var names = {};
  callback(function route(name, options, childrenCallback) {
    var routes;
    invariant(!names[name], 'Route names must be unique, but route "%s" is declared multiple times', name);
    names[name] = true;

    if (arguments.length === 1) {
      options = {};
    }

    if (arguments.length === 2 && typeof options === 'function') {
      childrenCallback = options;
      options = {};
    }

    if (typeof options.path !== 'string') {
      var parts = name.split('.');
      options.path = parts[parts.length - 1];
    } // go to the next level


    if (childrenCallback) {
      ancestors = ancestors.concat(name);
      childrenCallback();
      routes = pop();
      ancestors.splice(-1);
    } // add the node to the tree


    push({
      name: name,
      path: options.path,
      routes: routes || [],
      options: options
    });
  });

  function pop() {
    return matches[currentLevel()] || [];
  }

  function push(route) {
    var level = currentLevel();
    matches[level] = matches[level] || [];
    matches[level].push(route);
  }

  function currentLevel() {
    return ancestors.join('.');
  }

  return pop();
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function arrayDsl(routes) {
  var result = [];
  routes.forEach(function (_ref) {
    var name = _ref.name,
        children = _ref.children,
        options = _objectWithoutProperties(_ref, ["name", "children"]);

    if (typeof options.path !== 'string') {
      var parts = name.split('.');
      options.path = parts[parts.length - 1];
    }

    result.push({
      name: name,
      path: options.path,
      options: options,
      routes: children ? arrayDsl(children) : []
    });
  });
  return result;
}

var paramInjectMatcher = /:([a-zA-Z_$][a-zA-Z0-9_$?]*[?+*]?)/g;
var specialParamChars = /[+*?]$/g;
var queryMatcher = /\?(.+)/;
var _compiledPatterns = {};

function compilePattern(pattern) {
  if (!(pattern in _compiledPatterns)) {
    var paramNames = [];
    var re = pathToRegexp(pattern, paramNames);
    _compiledPatterns[pattern] = {
      matcher: re,
      paramNames: paramNames.map(function (p) {
        return p.name;
      })
    };
  }

  return _compiledPatterns[pattern];
}
/**
 * Returns an array of the names of all parameters in the given pattern.
 */


function extractParamNames(pattern) {
  return compilePattern(pattern).paramNames;
}
/**
 * Extracts the portions of the given URL path that match the given pattern
 * and returns an object of param name => value pairs. Returns null if the
 * pattern does not match the given path.
 */

function extractParams(pattern, path) {
  var cp = compilePattern(pattern);
  var matcher = cp.matcher;
  var paramNames = cp.paramNames;
  var match = path.match(matcher);

  if (!match) {
    return null;
  }

  var params = {};
  paramNames.forEach(function (paramName, index) {
    params[paramName] = match[index + 1] && decodeURIComponent(match[index + 1]);
  });
  return params;
}
/**
 * Returns a version of the given route path with params interpolated. Throws
 * if there is a dynamic segment of the route path for which there is no param.
 */

function injectParams(pattern, params) {
  params = params || {};
  return pattern.replace(paramInjectMatcher, function (match, param) {
    var paramName = param.replace(specialParamChars, '');
    var lastChar = param.slice(-1); // If param is optional don't check for existence

    if (lastChar === '?' || lastChar === '*') {
      if (params[paramName] == null) {
        return '';
      }
    } else {
      invariant(params[paramName] != null, "Missing '%s' parameter for path '%s'", paramName, pattern);
    }

    var paramValue = encodeURIComponent(params[paramName]);

    if (lastChar === '*' || lastChar === '+') {
      // restore / for splats
      paramValue = paramValue.replace('%2F', '/');
    }

    return paramValue;
  });
}
/**
 * Returns an object that is the result of parsing any query string contained
 * in the given path, null if the path contains no query string.
 */

function extractQuery(qs, path) {
  var match = path.match(queryMatcher);
  return match && qs.parse(match[1]);
}
/**
 * Returns a version of the given path with the parameters in the given
 * query merged into the query string.
 */

function withQuery(qs, path, query) {
  var queryString = qs.stringify(query, {
    indices: false
  });

  if (queryString) {
    return withoutQuery(path) + '?' + queryString;
  }

  return path;
}
/**
 * Returns a version of the given path without the query string.
 */

function withoutQuery(path) {
  return path.replace(queryMatcher, '');
}

var events = {
  /**
  * Bind `el` event `type` to `fn`.
  *
  * @param {Element} el
  * @param {String} type
  * @param {Function} fn
  * @return {Function}
  * @api public
  */
  bind: function bind(el, type, fn) {
    el.addEventListener(type, fn);
    return fn;
  },

  /**
  * Unbind `el` event `type`'s callback `fn`.
  *
  * @param {Element} el
  * @param {String} type
  * @param {Function} fn
  * @return {Function}
  * @api public
  */
  unbind: function unbind(el, type, fn) {
    el.removeEventListener(type, fn);
    return fn;
  }
};

/* eslint-disable */
// to avoid dependency on 3rd party libraries
//
// Backbone.History
// ----------------
// Handles cross-browser history management, based on either
// [pushState](http://diveintohtml5.info/history.html) and real URLs, or
// [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
// and URL fragments.

var History = function History() {
  this.handlers = [];
  this.checkUrl = this.checkUrl.bind(this); // Ensure that `History` can be used outside of the browser.

  if (typeof window !== 'undefined') {
    this.location = window.location;
    this.history = window.history;
  }
}; // Cached regex for stripping a leading hash/slash and trailing space.


var routeStripper = /^[#\/]|\s+$/g; // Cached regex for stripping leading and trailing slashes.

var rootStripper = /^\/+|\/+$/g; // Cached regex for removing a trailing slash.

var trailingSlash = /\/$/; // Cached regex for stripping urls of hash.

var pathStripper = /#.*$/; // Set up all inheritable **Backbone.History** properties and methods.

extend(History.prototype, {
  // Are we at the app root?
  atRoot: function atRoot() {
    return this.location.pathname.replace(/[^\/]$/, '$&/') === this.root;
  },
  // Gets the true hash value. Cannot use location.hash directly due to bug
  // in Firefox where location.hash will always be decoded.
  getHash: function getHash() {
    var match = this.location.href.match(/#(.*)$/);
    return match ? match[1] : '';
  },
  // Get the cross-browser normalized URL fragment, either from the URL,
  // the hash, or the override.
  getFragment: function getFragment(fragment, forcePushState) {
    if (fragment == null) {
      if (this._hasPushState || !this._wantsHashChange || forcePushState) {
        fragment = decodeURI(this.location.pathname + this.location.search);
        var root = this.root.replace(trailingSlash, '');
        if (!fragment.indexOf(root)) fragment = fragment.slice(root.length);
      } else {
        fragment = this.getHash();
      }
    }

    return fragment.replace(routeStripper, '');
  },
  // Start the hash change handling, returning `true` if the current URL matches
  // an existing route, and `false` otherwise.
  start: function start(options) {
    // MODIFICATION OF ORIGINAL BACKBONE.HISTORY
    // if (History.started) throw new Error("LocationBar has already been started");
    // History.started = true;
    this.started = true; // Figure out the initial configuration.
    // Is pushState desired ... is it available?

    this.options = extend({
      root: '/'
    }, options);
    this.location = this.options.location || this.location;
    this.history = this.options.history || this.history;
    this.root = this.options.root;
    this._wantsHashChange = this.options.hashChange !== false;
    this._wantsPushState = !!this.options.pushState;
    this._hasPushState = !!(this.options.pushState && this.history && this.history.pushState);
    var fragment = this.getFragment(); // Normalize root to always include a leading and trailing slash.

    this.root = ('/' + this.root + '/').replace(rootStripper, '/'); // Depending on whether we're using pushState or hashes, and whether
    // 'onhashchange' is supported, determine how we check the URL state.

    events.bind(window, this._hasPushState ? 'popstate' : 'hashchange', this.checkUrl); // Determine if we need to change the base url, for a pushState link
    // opened by a non-pushState browser.

    this.fragment = fragment;
    var loc = this.location; // Transition from hashChange to pushState or vice versa if both are
    // requested.

    if (this._wantsHashChange && this._wantsPushState) {
      // If we've started off with a route from a `pushState`-enabled
      // browser, but we're currently in a browser that doesn't support it...
      if (!this._hasPushState && !this.atRoot()) {
        this.fragment = this.getFragment(null, true);
        this.location.replace(this.root + '#' + this.fragment); // Return immediately as browser will do redirect to new url

        return true; // Or if we've started out with a hash-based route, but we're currently
        // in a browser where it could be `pushState`-based instead...
      } else if (this._hasPushState && this.atRoot() && loc.hash) {
        this.fragment = this.getHash().replace(routeStripper, '');
        this.history.replaceState({}, document.title, this.root + this.fragment);
      }
    }

    if (!this.options.silent) return this.loadUrl();
  },
  // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
  // but possibly useful for unit testing Routers.
  stop: function stop() {
    events.unbind(window, this._hasPushState ? 'popstate' : 'hashchange', this.checkUrl);
    this.started = false;
  },
  // Add a route to be tested when the fragment changes. Routes added later
  // may override previous routes.
  route: function route(_route, callback) {
    this.handlers.unshift({
      route: _route,
      callback: callback
    });
  },
  // Checks the current URL to see if it has changed, and if it has,
  // calls `loadUrl`.
  checkUrl: function checkUrl() {
    var current = this.getFragment();
    if (current === this.fragment) return false;
    this.loadUrl();
  },
  // Attempt to load the current URL fragment. If a route succeeds with a
  // match, returns `true`. If no defined routes matches the fragment,
  // returns `false`.
  loadUrl: function loadUrl(fragment) {
    fragment = this.fragment = this.getFragment(fragment);
    return this.handlers.some(function (handler) {
      if (handler.route.test(fragment)) {
        handler.callback(fragment);
        return true;
      }
    });
  },
  // Save a fragment into the hash history, or replace the URL state if the
  // 'replace' option is passed. You are responsible for properly URL-encoding
  // the fragment in advance.
  //
  // The options object can contain `trigger: true` if you wish to have the
  // route callback be fired (not usually desirable), or `replace: true`, if
  // you wish to modify the current URL without adding an entry to the history.
  navigate: function navigate(fragment, options) {
    if (!this.started) return false;
    if (!options || options === true) options = {
      trigger: !!options
    };
    var url = this.root + (fragment = this.getFragment(fragment || '')); // Strip the hash for matching.

    fragment = fragment.replace(pathStripper, '');
    if (this.fragment === fragment) return;
    this.fragment = fragment; // Don't include a trailing slash on the root.

    if (fragment === '' && url !== '/') url = url.slice(0, -1); // If pushState is available, we use it to set the fragment as a real URL.

    if (this._hasPushState) {
      this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url); // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
    } else if (this._wantsHashChange) {
      this._updateHash(this.location, fragment, options.replace); // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.

    } else {
      return this.location.assign(url);
    }

    if (options.trigger) return this.loadUrl(fragment);
  },
  // Update the hash location, either replacing the current entry, or adding
  // a new one to the browser history.
  _updateHash: function _updateHash(location, fragment, replace) {
    if (replace) {
      var href = location.href.replace(/(javascript:|#).*$/, '');
      location.replace(href + '#' + fragment);
    } else {
      // Some browsers require that `hash` contains a leading #.
      location.hash = '#' + fragment;
    }
  }
}); // add some features to History
// a more intuitive alias for navigate

History.prototype.update = function () {
  this.navigate.apply(this, arguments);
}; // a generic callback for any changes


History.prototype.onChange = function (callback) {
  this.route(/^(.*?)$/, callback);
}; // checks if the browser has pushstate support


History.prototype.hasPushState = function () {
  // MODIFICATION OF ORIGINAL BACKBONE.HISTORY
  if (!this.started) {
    throw new Error("only available after LocationBar.start()");
  }

  return this._hasPushState;
}; // export

function BrowserLocation(options) {
  this.path = options.path || '';
  this.options = extend({
    pushState: false,
    root: '/'
  }, options); // we're using the location-bar module for actual
  // URL management

  var self = this;
  this.locationBar = new History();
  this.locationBar.onChange(function (path) {
    self.handleURL('/' + (path || ''));
  });
  this.locationBar.start(extend({}, options));
}
/**
 * Check if we're actually using pushState. For browsers
 * that don't support it this would return false since
 * it would fallback to using hashState / polling
 * @return {Bool}
 */


BrowserLocation.prototype.usesPushState = function () {
  return this.options.pushState && this.locationBar.hasPushState();
};
/**
 * Get the current URL
 */


BrowserLocation.prototype.getURL = function () {
  return this.path;
};
/**
 * Set the current URL without triggering any events
 * back to the router. Add a new entry in browser's history.
 */


BrowserLocation.prototype.setURL = function (path, options) {
  if (this.path !== path) {
    this.path = path;
    this.locationBar.update(path, extend({
      trigger: true
    }, options));
  }
};
/**
 * Set the current URL without triggering any events
 * back to the router. Replace the latest entry in broser's history.
 */


BrowserLocation.prototype.replaceURL = function (path, options) {
  if (this.path !== path) {
    this.path = path;
    this.locationBar.update(path, extend({
      trigger: true,
      replace: true
    }, options));
  }
};
/**
 * Setup a URL change handler
 * @param  {Function} callback
 */


BrowserLocation.prototype.onChange = function (callback) {
  this.changeCallback = callback;
};
/**
 * Given a path, generate a URL appending root
 * if pushState is used and # if hash state is used
 */


BrowserLocation.prototype.formatURL = function (path) {
  if (this.locationBar.hasPushState()) {
    var rootURL = this.options.root;

    if (path !== '') {
      rootURL = rootURL.replace(/\/$/, '');
    }

    return rootURL + path;
  } else {
    if (path[0] === '/') {
      path = path.substr(1);
    }

    return '#' + path;
  }
};
/**
 * When we use pushState with a custom root option,
 * we need to take care of removingRoot at certain points.
 * Specifically
 * - browserLocation.update() can be called with the full URL by router
 * - LocationBar expects all .update() calls to be called without root
 * - this method is public so that we could dispatch URLs without root in router
 */


BrowserLocation.prototype.removeRoot = function (url) {
  if (this.options.pushState && this.options.root && this.options.root !== '/') {
    return url.replace(this.options.root, '');
  } else {
    return url;
  }
};
/**
 * Stop listening to URL changes and link clicks
 */


BrowserLocation.prototype.destroy = function () {
  this.locationBar.stop();
};
/**
  initially, the changeCallback won't be defined yet, but that's good
  because we dont' want to kick off routing right away, the router
  does that later by manually calling this handleURL method with the
  url it reads of the location. But it's important this is called
  first by Backbone, because we wanna set a correct this.path value

  @private
 */


BrowserLocation.prototype.handleURL = function (url) {
  this.path = url;

  if (this.changeCallback) {
    this.changeCallback(url);
  }
};

function MemoryLocation(options) {
  this.path = options.path || '';
}

MemoryLocation.prototype.getURL = function () {
  return this.path;
};

MemoryLocation.prototype.setURL = function (path, options) {
  if (this.path !== path) {
    this.path = path;
    this.handleURL(this.getURL(), options);
  }
};

MemoryLocation.prototype.replaceURL = function (path, options) {
  if (this.path !== path) {
    this.setURL(path, options);
  }
};

MemoryLocation.prototype.onChange = function (callback) {
  this.changeCallback = callback;
};

MemoryLocation.prototype.handleURL = function (url, options) {
  this.path = url;
  options = extend({
    trigger: true
  }, options);

  if (this.changeCallback && options.trigger) {
    this.changeCallback(url);
  }
};

MemoryLocation.prototype.usesPushState = function () {
  return false;
};

MemoryLocation.prototype.removeRoot = function (url) {
  return url;
};

MemoryLocation.prototype.formatURL = function (url) {
  return url;
};

var TRANSITION_REDIRECTED = 'TransitionRedirected';
var TRANSITION_CANCELLED = 'TransitionCancelled';

/* eslint-disable promise/param-names */

function runError(router, transition, err) {
  router.middleware.forEach(function (m) {
    m.error && m.error(transition, err);
  });
}

function transition(options) {
  options = options || {};
  var router = options.router;
  var log = router.log;
  var logError = router.logError;
  var path = options.path;
  var match = options.match;
  var routes = match.routes;
  var params = match.params;
  var pathname = match.pathname;
  var query = match.query;
  var id = options.id;
  var startTime = Date.now();
  log('---');
  log('Transition #' + id, 'to', path);
  log('Transition #' + id, 'routes:', routes.map(function (r) {
    return r.name;
  }));
  log('Transition #' + id, 'params:', params);
  log('Transition #' + id, 'query:', query); // create the transition promise

  var resolve, reject;
  var promise = new Promise(function (res, rej) {
    resolve = res;
    reject = rej;
  }); // 1. make transition errors loud
  // 2. by adding this handler we make sure
  //    we don't trigger the default 'Potentially
  //    unhandled rejection' for cancellations

  promise.then(function () {
    log('Transition #' + id, 'completed in', Date.now() - startTime + 'ms');
  }).catch(function (err) {
    if (err.type !== TRANSITION_REDIRECTED && err.type !== TRANSITION_CANCELLED) {
      log('Transition #' + id, 'FAILED');
      logError(err.message || err);
    }
  });
  var cancelled = false;
  var transition = {
    id: id,
    prev: {
      routes: clone(router.state.routes) || [],
      path: router.state.path || '',
      pathname: router.state.pathname || '',
      params: clone(router.state.params) || {},
      query: clone(router.state.query) || {}
    },
    routes: clone(routes),
    path: path,
    pathname: pathname,
    params: clone(params),
    query: clone(query),
    redirectTo: function redirectTo() {
      return router.transitionTo.apply(router, arguments);
    },
    retry: function retry() {
      return router.transitionTo(path);
    },
    cancel: function cancel(err) {
      if (router.state.activeTransition !== transition) {
        return;
      }

      if (transition.isCancelled) {
        return;
      }

      router.state.activeTransition = null;
      transition.isCancelled = true;
      cancelled = true;

      if (!err) {
        err = new Error(TRANSITION_CANCELLED);
        err.type = TRANSITION_CANCELLED;
      }

      if (err.type === TRANSITION_CANCELLED) {
        log('Transition #' + id, 'cancelled');
      }

      if (err.type === TRANSITION_REDIRECTED) {
        log('Transition #' + id, 'redirected');
      }

      router.middleware.forEach(function (m) {
        m.cancel && m.cancel(transition, err);
      });
      reject(err);
    },
    followRedirects: function followRedirects() {
      return promise['catch'](function (reason) {
        if (router.state.activeTransition) {
          return router.state.activeTransition.followRedirects();
        }

        return Promise.reject(reason);
      });
    },
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise) // here we handle calls to all of the middlewares

  };

  function callNext(i, prevResult) {
    var middleware;
    var middlewareName; // if transition has been cancelled - nothing left to do

    if (cancelled) {
      return;
    } // done


    if (i < router.middleware.length) {
      middleware = router.middleware[i];
      middlewareName = middleware.name || 'anonymous';
      log('Transition #' + id, 'resolving middleware:', middlewareName);
      var middlewarePromise;

      try {
        middlewarePromise = middleware.next ? middleware.next(transition, prevResult) : prevResult;
        invariant(transition !== middlewarePromise, 'Middleware %s returned a transition which resulted in a deadlock', middlewareName);
      } catch (err) {
        router.state.activeTransition = null;
        runError(router, transition, err);
        return reject(err);
      }

      Promise.resolve(middlewarePromise).then(function (result) {
        callNext(i + 1, result);
      }).catch(function (err) {
        log('Transition #' + id, 'resolving middleware:', middlewareName, 'FAILED');
        router.state.activeTransition = null;
        runError(router, transition, err);
        reject(err);
      });
    } else {
      router.state = {
        activeTransition: null,
        routes: routes,
        path: path,
        pathname: pathname,
        params: params,
        query: query
      };
      router.middleware.forEach(function (m) {
        m.done && m.done(transition);
      });
      resolve();
    }
  }

  if (!options.noop) {
    Promise.resolve().then(function () {
      return callNext(0);
    });
  } else {
    resolve();
  }

  if (options.noop) {
    transition.noop = true;
  }

  return transition;
}

/**
 * Handle link delegation on `el` or the document,
 * and invoke `fn(e)` when clickable.
 *
 * @param {Element|Function} el or fn
 * @param {Function} [fn]
 * @api public
 */

function intercept(el, fn) {
  // default to document
  if (typeof el === 'function') {
    fn = el;
    el = document;
  }

  var cb = delegate(el, 'click', function (e, el) {
    if (clickable(e, el)) fn(e, el);
  });
  return function dispose() {
    undelegate(el, 'click', cb);
  };
}

function link(element) {
  element = {
    parentNode: element
  };
  var root = document; // Make sure `element !== document` and `element != null`
  // otherwise we get an illegal invocation

  while ((element = element.parentNode) && element !== document) {
    if (element.tagName.toLowerCase() === 'a') {
      return element;
    } // After `matches` on the edge case that
    // the selector matches the root
    // (when the root is not the document)


    if (element === root) {
      return;
    }
  }
}
/**
 * Delegate event `type` to links
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */


function delegate(el, type, fn) {
  return events.bind(el, type, function (e) {
    var target = e.target || e.srcElement;
    var el = link(target);

    if (el) {
      fn(e, el);
    }
  });
}
/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */


function undelegate(el, type, fn) {
  events.unbind(el, type, fn);
}
/**
 * Check if `e` is clickable.
 */


function clickable(e, el) {
  if (which(e) !== 1) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey) return;
  if (e.defaultPrevented) return; // check target

  if (el.target) return; // check for data-bypass attribute

  if (el.getAttribute('data-bypass') !== null) return; // inspect the href

  var href = el.getAttribute('href');
  if (!href || href.length === 0) return; // don't handle hash links

  if (href[0] === '#') return; // external/absolute links

  if (href.indexOf('http://') === 0 || href.indexOf('https://') === 0) return; // email links

  if (href.indexOf('mailto:') === 0) return; // don't intercept javascript links

  /* eslint-disable no-script-url */

  if (href.indexOf('javascript:') === 0) return;
  /* eslint-enable no-script-url */

  return true;
}
/**
 * Event button.
 */


function which(e) {
  e = e || window.event;
  return e.which === null ? e.button : e.which;
}

function createLogger(log, options) {
  options = options || {}; // falsy means no logging

  if (!log) return function () {}; // custom logging function

  if (log !== true) return log; // true means use the default logger - console

  var fn = options.error ? console.error : console.info;
  return function () {
    fn.apply(console, arguments);
  };
}

var qs = {
  parse: function parse(querystring) {
    return querystring.split('&').reduce(function (acc, pair) {
      var parts = pair.split('=');
      acc[parts[0]] = decodeURIComponent(parts[1]);
      return acc;
    }, {});
  },
  stringify: function stringify(params) {
    return Object.keys(params).reduce(function (acc, key) {
      if (params[key] !== undefined) {
        acc.push(key + '=' + encodeURIComponent(params[key]));
      }

      return acc;
    }, []).join('&');
  }
};

function Cherrytree() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  this.nextId = 1;
  this.state = {};
  this.middleware = [];
  this.options = extend({
    location: 'browser',
    interceptLinks: true,
    logError: true,
    qs: qs
  }, options);
  this.log = createLogger(this.options.log);
  this.logError = createLogger(this.options.logError, {
    error: true
  });

  if (options.routes) {
    this.map(options.routes);
  }
}
/**
 * Add a middleware
 * @param  {Function} middleware
 * @return {Object}   router
 * @api public
 */


Cherrytree.prototype.use = function (middleware) {
  var m = typeof middleware === 'function' ? {
    next: middleware
  } : middleware;
  this.middleware.push(m);
  return this;
};
/**
 * Add the route map
 * @param  {Function} routes
 * @return {Object}   router
 * @api public
 */


Cherrytree.prototype.map = function (routes) {
  // create the route tree
  this.routes = Array.isArray(routes) ? arrayDsl(routes) : functionDsl(routes); // create the matcher list, which is like a flattened
  // list of routes = a list of all branches of the route tree

  var matchers = this.matchers = []; // keep track of whether duplicate paths have been created,
  // in which case we'll warn the dev

  var dupes = {}; // keep track of abstract routes to build index route forwarding

  var abstracts = {};
  eachBranch({
    routes: this.routes
  }, [], function (routes) {
    // concatenate the paths of the list of routes
    var path = routes.reduce(function (memo, r) {
      // reset if there's a leading slash, otherwise concat
      // and keep resetting the trailing slash
      return (r.path[0] === '/' ? r.path : memo + '/' + r.path).replace(/\/$/, '');
    }, ''); // ensure we have a leading slash

    if (path === '') {
      path = '/';
    }

    var lastRoute = routes[routes.length - 1];

    if (lastRoute.options.abstract) {
      abstracts[path] = lastRoute.name;
      return;
    } // register routes


    matchers.push({
      routes: routes,
      name: lastRoute.name,
      path: path
    }); // dupe detection

    if (dupes[path]) {
      throw new Error('Routes ' + dupes[path] + ' and ' + lastRoute.name + ' have the same url path \'' + path + '\'');
    }

    dupes[path] = lastRoute.name;
  }); // check if there is an index route for each abstract route

  Object.keys(abstracts).forEach(function (path) {
    var matcher;
    if (!dupes[path]) return;
    matchers.some(function (m) {
      if (m.path === path) {
        matcher = m;
        return true;
      }
    });
    matchers.push({
      routes: matcher.routes,
      name: abstracts[path],
      path: path
    });
  });

  function eachBranch(node, memo, fn) {
    node.routes.forEach(function (route) {
      fn(memo.concat(route));

      if (route.routes.length) {
        eachBranch(route, memo.concat(route), fn);
      }
    });
  }

  return this;
};
/**
 * Starts listening to the location changes.
 * @param  {Object}  location (optional)
 * @return {Promise} initial transition
 *
 * @api public
 */


Cherrytree.prototype.listen = function (path) {
  var _this = this;

  var location = this.location = this.createLocation(path || ''); // setup the location onChange handler

  location.onChange(function (url) {
    var previousUrl = _this.state.path;

    _this.dispatch(url).catch(function (err) {
      if (err && err.type === TRANSITION_CANCELLED) {
        // reset the URL in case the transition has been cancelled
        _this.location.replaceURL(previousUrl, {
          trigger: false
        });
      }

      return err;
    });
  }); // start intercepting links

  if (this.options.interceptLinks && location.usesPushState()) {
    this.interceptLinks();
  } // and also kick off the initial transition


  return this.dispatch(location.getURL());
};
/**
 * Transition to a different route. Passe in url or a route name followed by params and query
 * @param  {String} url     url or route name
 * @param  {Object} params  Optional
 * @param  {Object} query   Optional
 * @return {Object}         transition
 *
 * @api public
 */


Cherrytree.prototype.transitionTo = function () {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  if (this.state.activeTransition) {
    return this.replaceWith.apply(this, args);
  }

  return this.doTransition('setURL', args);
};
/**
 * Like transitionTo, but doesn't leave an entry in the browser's history,
 * so clicking back will skip this route
 * @param  {String} url     url or route name followed by params and query
 * @param  {Object} params  Optional
 * @param  {Object} query   Optional
 * @return {Object}         transition
 *
 * @api public
 */


Cherrytree.prototype.replaceWith = function () {
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return this.doTransition('replaceURL', args);
};
/**
 * Create an href
 * @param  {String} name   target route name
 * @param  {Object} params
 * @param  {Object} query
 * @return {String}        href
 *
 * @api public
 */


Cherrytree.prototype.generate = function (name, params, query) {
  invariant(this.location, 'call .listen() before using .generate()');
  var matcher;
  query = query || {};
  this.matchers.forEach(function (m) {
    if (m.name === name) {
      matcher = m;
    }
  });

  if (!matcher) {
    throw new Error('No route is named ' + name);
  }

  var url = withQuery(this.options.qs, injectParams(matcher.path, params), query);
  return this.location.formatURL(url);
};
/**
 * Stop listening to URL changes
 * @api public
 */


Cherrytree.prototype.destroy = function () {
  if (this.location && this.location.destroy) {
    this.location.destroy();
  }

  if (this.disposeIntercept) {
    this.disposeIntercept();
  }

  if (this.state.activeTransition) {
    this.state.activeTransition.cancel();
  }

  this.state = {};
};
/**
 * Check if the given route/params/query combo is active
 * @param  {String} name   target route name
 * @param  {Object} params
 * @param  {Object} query
 * @return {Boolean}
 *
 * @api public
 */


Cherrytree.prototype.isActive = function (name, params, query) {
  params = params || {};
  query = query || {};
  var activeRoutes = this.state.routes || [];
  var activeParams = this.state.params || {};
  var activeQuery = this.state.query || {};
  var isActive = activeRoutes.some(function (route) {
    return route.name === name;
  });
  isActive = isActive && Object.keys(params).every(function (key) {
    return activeParams[key] === params[key];
  });
  isActive = isActive && Object.keys(query).every(function (key) {
    return activeQuery[key] === query[key];
  });
  return isActive;
};
/**
 * @api private
 */


Cherrytree.prototype.doTransition = function (method, params) {
  var _this2 = this;

  var previousUrl = this.location.getURL();
  var url = params[0];

  if (url[0] !== '/') {
    url = this.generate.apply(this, params);
    url = url.replace(/^#/, '/');
  }

  if (this.options.pushState) {
    url = this.location.removeRoot(url);
  }

  var transition = this.dispatch(url);
  transition.catch(function (err) {
    if (err && err.type === TRANSITION_CANCELLED) {
      // reset the URL in case the transition has been cancelled
      _this2.location.replaceURL(previousUrl, {
        trigger: false
      });
    }

    return err;
  });
  this.location[method](url, {
    trigger: false
  });
  return transition;
};
/**
 * Match the path against the routes
 * @param  {String} path
 * @return {Object} the list of matching routes and params
 *
 * @api private
 */


Cherrytree.prototype.match = function (path) {
  path = (path || '').replace(/\/$/, '') || '/';
  var params;
  var routes = [];
  var pathWithoutQuery = withoutQuery(path);
  var qs = this.options.qs;
  this.matchers.some(function (matcher) {
    params = extractParams(matcher.path, pathWithoutQuery);

    if (params) {
      routes = matcher.routes;
      return true;
    }
  });
  return {
    routes: routes.map(descriptor),
    params: params || {},
    pathname: pathWithoutQuery,
    query: extractQuery(qs, path) || {} // clone the data (only a shallow clone of options)
    // to make sure the internal route store is not mutated
    // by the middleware. The middleware can mutate data
    // before it gets passed into the next middleware, but
    // only within the same transition. New transitions
    // will get to use pristine data.

  };

  function descriptor(route) {
    return {
      name: route.name,
      path: route.path,
      params: pick(params, extractParamNames(route.path)),
      options: clone(route.options)
    };
  }
};

Cherrytree.prototype.dispatch = function (path) {
  var match = this.match(path);
  var query = match.query;
  var pathname = match.pathname;
  var activeTransition = this.state.activeTransition; // if we already have an active transition with all the same
  // params - return that and don't do anything else

  if (activeTransition && activeTransition.pathname === pathname && isEqual(activeTransition.query, query)) {
    return activeTransition;
  } // otherwise, cancel the active transition since we're
  // redirecting (or initiating a brand new transition)


  if (activeTransition) {
    var err = new Error(TRANSITION_REDIRECTED);
    err.type = TRANSITION_REDIRECTED;
    err.nextPath = path;
    activeTransition.cancel(err);
  } // if there is no active transition, check if
  // this is a noop transition, in which case, return
  // a transition to respect the function signature,
  // but don't actually run any of the middleware


  if (!activeTransition) {
    if (this.state.pathname === pathname && isEqual(this.state.query, query)) {
      return transition({
        id: this.nextId++,
        path: path,
        match: match,
        noop: true,
        router: this
      });
    }
  }

  var t = transition({
    id: this.nextId++,
    path: path,
    match: match,
    router: this
  });
  this.state.activeTransition = t;
  return t;
};
/**
 * Create the default location.
 * This is used when no custom location is passed to
 * the listen call.
 * @return {Object} location
 *
 * @api private
 */


Cherrytree.prototype.createLocation = function (path) {
  var location = this.options.location;

  if (!isString(location)) {
    return location;
  }

  if (location === 'browser') {
    return new BrowserLocation(pick(this.options, ['pushState', 'root']));
  } else if (location === 'memory') {
    return new MemoryLocation({
      path: path
    });
  } else {
    throw new Error('Location can be `browser`, `memory` or a custom implementation');
  }
};
/**
 * When using pushState, it's important to setup link interception
 * because all link clicks should be handled via the router instead of
 * browser reloading the page
 */


Cherrytree.prototype.interceptLinks = function () {
  var _this3 = this;

  var clickHandler = typeof this.options.interceptLinks === 'function' ? this.options.interceptLinks : defaultClickHandler;
  this.disposeIntercept = intercept(function (event, link) {
    return clickHandler(event, link, _this3);
  });

  function defaultClickHandler(event, link, router) {
    event.preventDefault();
    router.transitionTo(router.location.removeRoot(link.getAttribute('href')));
  }
};

export default Cherrytree;
//# sourceMappingURL=slick-router.js.map
