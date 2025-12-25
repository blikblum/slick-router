/* eslint-disable */
// LocationBar module extracted from Backbone.js 1.1.0
//
// the dependency on backbone, underscore and jquery have been removed to turn
// this into a small standalone library for handling browser's history API
// cross browser and with a fallback to hashchange events or polling.

import {bindEvent, unbindEvent} from '../events.js'

// this is mostly original code with minor modifications
// to avoid dependency on 3rd party libraries
//
// Backbone.History
// ----------------

// Handles cross-browser history management, based on either
// [pushState](http://diveintohtml5.info/history.html) and real URLs, or
// [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
// and URL fragments.
export class History {
  constructor() {
    this.handlers = [];
    this.checkUrl = this.checkUrl.bind(this);
    this.location = window.location;
    this.history = window.history;
  }

  // Set up all inheritable **Backbone.History** properties and methods.
  // Are we at the app root?
  atRoot() {
    return this.location.pathname.replace(/[^\/]$/, '$&/') === this.root;
  }

  // Gets the true hash value. Cannot use location.hash directly due to bug
  // in Firefox where location.hash will always be decoded.
  getHash() {
    const match = this.location.href.match(/#(.*)$/);
    return match ? match[1] : '';
  }

  // Get the cross-browser normalized URL fragment, either from the URL,
  // the hash, or the override.
  getFragment(fragment, forcePushState) {
    if (fragment == null) {
      if (this._hasPushState || !this._wantsHashChange || forcePushState) {
        fragment = decodeURI(this.location.pathname + this.location.search);
        const root = this.root.replace(trailingSlash, '');
        if (!fragment.indexOf(root)) fragment = fragment.slice(root.length);
      } else {
        fragment = this.getHash();
      }
    }
    return fragment.replace(routeStripper, '');
  }

  // Start the hash change handling, returning `true` if the current URL matches
  // an existing route, and `false` otherwise.
  start(options) {
    // MODIFICATION OF ORIGINAL BACKBONE.HISTORY
    // if (History.started) throw new Error("LocationBar has already been started");
    // History.started = true;
    this.started = true;

    // Figure out the initial configuration.
       
    const _wantsPushState  = !!options.pushState;
    this.location         = options.location || this.location;
    this.history          = options.history || this.history;
    this.root             = options.root;
    this._wantsHashChange = options.hashChange !== false;    
    this._hasPushState    = _wantsPushState;
    const fragment        = this.getFragment();

    // Normalize root to always include a leading and trailing slash.
    this.root = (`/${this.root}/`).replace(rootStripper, '/');

    // Depending on whether we're using pushState or hashes, and whether
    // 'onhashchange' is supported, determine how we check the URL state.
    bindEvent(window, this._hasPushState ? 'popstate' : 'hashchange', this.checkUrl);

    // Determine if we need to change the base url, for a pushState link
    // opened by a non-pushState browser.
    this.fragment = fragment;
    const loc = this.location;

    // Transition from hashChange to pushState or vice versa if both are
    // requested.
    if (this._wantsHashChange && _wantsPushState) {

      // If we've started off with a route from a `pushState`-enabled
      // browser, but we're currently in a browser that doesn't support it...
      if (!this._hasPushState && !this.atRoot()) {
        this.fragment = this.getFragment(null, true);
        this.location.replace(`${this.root}#${this.fragment}`);
        // Return immediately as browser will do redirect to new url
        return true;

      // Or if we've started out with a hash-based route, but we're currently
      // in a browser where it could be `pushState`-based instead...
      } else if (this._hasPushState && this.atRoot() && loc.hash) {
        this.fragment = this.getHash().replace(routeStripper, '');
        this.history.replaceState({}, document.title, this.root + this.fragment);
      }

    }

    if (!options.silent) return this.loadUrl();
  }

  // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
  // but possibly useful for unit testing Routers.
  stop() {
    unbindEvent(window, this._hasPushState ? 'popstate' : 'hashchange', this.checkUrl);
    this.started = false;
  }

  // Add a route to be tested when the fragment changes. Routes added later
  // may override previous routes.
  route(route, callback) {
    this.handlers.unshift({route, callback});
  }

  // Checks the current URL to see if it has changed, and if it has,
  // calls `loadUrl`.
  checkUrl() {
    const current = this.getFragment();
    if (current === this.fragment) return false;
    this.loadUrl();
  }

  // Attempt to load the current URL fragment. If a route succeeds with a
  // match, returns `true`. If no defined routes matches the fragment,
  // returns `false`.
  loadUrl(fragment) {
    fragment = this.fragment = this.getFragment(fragment);
    return this.handlers.some(handler => {
      if (handler.route.test(fragment)) {
        handler.callback(fragment);
        return true;
      }
    });
  }

  // Save a fragment into the hash history, or replace the URL state if the
  // 'replace' option is passed. You are responsible for properly URL-encoding
  // the fragment in advance.
  //
  // The options object can contain `trigger: true` if you wish to have the
  // route callback be fired (not usually desirable), or `replace: true`, if
  // you wish to modify the current URL without adding an entry to the history.
  update(fragment, options) {
    if (!this.started) return false;
    if (!options || options === true) options = {trigger: !!options};

    let url = this.root + (fragment = this.getFragment(fragment || ''));

    // Strip the hash for matching.
    fragment = fragment.replace(pathStripper, '');

    if (this.fragment === fragment) return;
    this.fragment = fragment;

    // Don't include a trailing slash on the root.
    if (fragment === '' && url !== '/') url = url.slice(0, -1);

    // If pushState is available, we use it to set the fragment as a real URL.
    if (this._hasPushState) {
      this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

    // If hash changes haven't been explicitly disabled, update the hash
    // fragment to store history.
    } else if (this._wantsHashChange) {
      this._updateHash(this.location, fragment, options.replace);
    // If you've told us that you explicitly don't want fallback hashchange-
    // based history, then `update` becomes a page refresh.
    } else {
      return this.location.assign(url);
    }
    if (options.trigger) return this.loadUrl(fragment);
  }

  // Update the hash location, either replacing the current entry, or adding
  // a new one to the browser history.
  _updateHash(location, fragment, replace) {
    if (replace) {
      const href = location.href.replace(/(javascript:|#).*$/, '');
      location.replace(`${href}#${fragment}`);
    } else {
      // Some browsers require that `hash` contains a leading #.
      location.hash = `#${fragment}`;
    }
  }

  // add some features to History

  // a generic callback for any changes
  onChange(callback) {
    this.route(/^(.*?)$/, callback);
  }  
}

// Cached regex for stripping a leading hash/slash and trailing space.
const routeStripper = /^[#\/]|\s+$/g;

// Cached regex for stripping leading and trailing slashes.
const rootStripper = /^\/+|\/+$/g;

// Cached regex for removing a trailing slash.
const trailingSlash = /\/$/;

// Cached regex for stripping urls of hash.
const pathStripper = /#.*$/;