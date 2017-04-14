'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = dsl;

var _dash = require('./dash');

var _invariant = require('./invariant');

var _invariant2 = _interopRequireDefault(_invariant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function dsl(callback) {
  var ancestors = [];
  var matches = {};
  var names = {};

  callback(function route(name, options, callback) {
    var routes = void 0;

    (0, _invariant2.default)(!names[name], 'Route names must be unique, but route "%s" is declared multiple times', name);

    names[name] = true;

    if (arguments.length === 1) {
      options = {};
    }

    if (arguments.length === 2 && typeof options === 'function') {
      callback = options;
      options = {};
    }

    if (typeof options.path !== 'string') {
      var parts = name.split('.');
      options.path = parts[parts.length - 1];
    }

    // go to the next level
    if (callback) {
      ancestors = ancestors.concat(name);
      callback();
      routes = pop();
      ancestors.splice(-1);
    }

    // add the node to the tree
    push({
      name: name,
      path: options.path,
      routes: routes || [],
      options: options,
      ancestors: (0, _dash.clone)(ancestors)
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