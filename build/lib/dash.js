'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var toString = Object.prototype.toString;
var keys = Object.keys;
var assoc = function assoc(obj, attr, val) {
  obj[attr] = val;return obj;
};
var isArray = function isArray(obj) {
  return toString.call(obj) === '[object Array]';
};

var clone = exports.clone = function clone(obj) {
  return obj ? isArray(obj) ? obj.slice(0) : extend({}, obj) : obj;
};

var pick = exports.pick = function pick(obj, attrs) {
  return attrs.reduce(function (acc, attr) {
    return obj[attr] === undefined ? acc : assoc(acc, attr, obj[attr]);
  }, {});
};

var isEqual = exports.isEqual = function isEqual(obj1, obj2) {
  return keys(obj1).length === keys(obj2).length && keys(obj1).reduce(function (acc, key) {
    return acc && obj2[key] === obj1[key];
  }, true);
};

var extend = exports.extend = function extend(obj) {
  for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
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

var find = exports.find = function find(list, pred) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var x = _step.value;
      if (pred(x)) return x;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
};

var isString = exports.isString = function isString(obj) {
  return Object.prototype.toString.call(obj) === '[object String]';
};