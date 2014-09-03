(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/editor/main.js":[function(require,module,exports){
'use strict';

var domready = require('domready');
var amgui = require('./amgui');
var EventEmitter = require('events').EventEmitter;
var Transhand = require('./transhand');
var Timeline = require('./timeline');
var Toolbar = require('./toolbar');
var Windooman = require('./windooman');
var Warehouseman = require('./warehouseman');
var modules = {
    css: require('./modules/css')
};
var externalStylesheets = [
    // require('./assets/fontello/css/amgui.css'),
    // require('./assets/dialog-polyfill.css'),
];



var handlerBuff = [];


var am = window.am = module.exports = _.extend(new EventEmitter(), {

    sequenceTypes: {},

    selectedElement: undefined,

    registerSequenceType: function (Sequence, type) {

        this.sequenceTypes[type] = Sequence;
    }
});

am.getHandler = function () {

    if (handlerBuff.length) {

        return handlerBuff.pop();
    }
    else {
        return new Transhand();
    }
};

am.throwHandler = function (handler) {

    handlerBuff.push(handler);
};

domready(function () {

    am.workspace = new Windooman();
    am.workspace.loadWorkspaces({
        base: getBaseWorkspace()
    });
    am.workspace.load('base');

    am.storage = new Warehouseman();

    am.domElem = createAmRoot();
    am.deHandlerCont = createAmLayer();
    am.deGuiCont = createAmLayer();
    am.deDialogCont = createAmLayer();


    amgui.deOverlayCont = am.deDialogCont;

    am.deGuiCont.appendChild(am.workspace.domElem);

    am.deRoot = document.body;
    am.toolbar = new Toolbar();
    am.toolbar.domElem.style.top = '0px';
    am.workspace.fillTab('tools', am.toolbar.domElem);
    am.timeline = new Timeline(am);

    am.toolbar.addIcon({
        icon: 'upload-cloud',
        onClick: function () {
            var data = {
                timelineSave: am.timeline.getScript()
            };
            am.storage.showSaveDialog('filename', {

                getSave: function () {
                    
                    var opt = am.storage.getSaveOptions();

                    return am.timeline.getScript(opt);
                }
            });
        }
    });

    am.toolbar.addIcon({
        icon: 'download-cloud',
        onClick: function () {
            am.storage.showOpenDialog({

                onOpen: function (save) {

                    if (typeog(save) === 'string') {
                        save = JSON.parse(save);
                    }

                    am.timeline.clear();
                    am.timeline.useSave(save);
                }
            });
        }
    });


    am.toolbar.addIcon({
        icon: 'blank',
        onClick: function () {
            am.timeline.useSave({
                "currTime": 1100,
                "timescale": 0.05,
                "sequences": [{
                    "type": "css_sequ_type",
                    "data": {
                        "selectors": ["#boxX5"],
                        "parameters": [{
                            "name": "",
                            "keys": []
                        }, {
                            "name": "transform",
                            "keys": [{
                                "value": {
                                    "tx": 0,
                                    "ty": 0,
                                    "tz": 0,
                                    "rx": 0,
                                    "ry": 0,
                                    "rz": 0,
                                    "sx": 1,
                                    "sy": 2.20250521920668,
                                    "sz": 1,
                                    "skewX": 0,
                                    "skewY": 0,
                                    "perspective": 0
                                },
                                "time": 0
                            }, {
                                "value": {
                                    "tx": 0,
                                    "ty": 0,
                                    "tz": 0,
                                    "rx": 0,
                                    "ry": 0,
                                    "rz": 0,
                                    "sx": 3.4274496158006964,
                                    "sy": 1.0196644138403999,
                                    "sz": 1,
                                    "skewX": 0,
                                    "skewY": 0,
                                    "perspective": 0
                                },
                                "time": 1380
                            }]
                        }]
                    }
                }]
            })
        }
    });

    am.timeline.domElem.style.position = 'fixed';
    am.timeline.domElem.style.width = '100%';
    am.timeline.domElem.style.height = '230px';
    am.timeline.domElem.style.bottom = '0px';
    am.workspace.fillTab('timeline', am.timeline.domElem);

    document.body.addEventListener('click', onClickRoot);

    modules.css.init(am);
});

function onClickRoot(e) {

    e.stopPropagation();

    var de = e.target;

    if (am.selectedElement !== de && isPickable(de)) {
        am.selectedElement = de;
        
        am.emit('selectDomElement', am.selectedElement);
    }
}

function isPickable(deTest) {

    var editors = [am.domElem];

    return step(deTest);

    function step(de) {

        if (de === document.body) {
            return true;
        }
        else if (editors.indexOf(de) !== -1) {
            return false;
        }
        else if (de) {
            return step(de.parentNode);
        }
    }
}

function createAmRoot() {
    
    var de = document.createElement('div');
    de.style.position = 'fixed';
    de.style.left = '0px';
    de.style.top = '0px';
    de.style.width = '100%';
    de.style.height = '100%';
    de.style.pointerEvents = 'none';
    de.style.userSelect = 'none';
    de.style.webktUserSelect = 'none';
    de.style.fontFamily = amgui.FONT_FAMILY;
    de.style.color = amgui.color.text;

    var zIndex = getMaxZIndex();
    if (zIndex) {
        de.style.zIndex = zIndex + 1000;
    }

    document.body.appendChild(de);

    de.addEventListener('mousedown', function (e) {

        e.preventDefault();
    });

    var sr = de.createShadowRoot();
        
    sr.appendChild(amgui.getStyleSheet());

    externalStylesheets.forEach(function (css) {

        var style = document.createElement('style');
        style.innerHTML = css;
        //TODO
        // sr.appendChild(style);
        // document.head.appendChild(style);
    });

    return sr;
    // return de;
}

function createAmLayer() {

    var de = document.createElement('div');
    de.style.position = 'fixed';
    de.style.width = '100%';
    de.style.height = '100%';
    am.domElem.appendChild(de);
    return de;
}




function getMaxZIndex() {

    var zIndex = 0, els, x, xLen, el, val;

    els = document.querySelectorAll('*');
    for (x = 0, xLen = els.length; x < xLen; x += 1) {
      el = els[x];
      if (window.getComputedStyle(el).getPropertyValue('position') !== 'static') {
        val = window.getComputedStyle(el).getPropertyValue('z-index');
        if (val) {
          val = +val;
          if (val > zIndex) {
            zIndex = val;
          }
        }
      }
    }
    return zIndex;    
}


function getBaseWorkspace() {

    return {
        type: 'container',
        direction: 'column',
        children: [{
                type: 'panel',
                mode: 'tab',
                size: 23,
                scaleMode: 'fix',
                showHead: false,
                tabs: [{name: 'tools'}],
            },{
                type: 'container',
                direction: 'row',
                size: 10,
                scaleMode: 'flex',
                children: [{                    
                    type: 'panel',
                    mode: 'tab',
                    size: 3,
                    scaleMode: 'flex',
                    tabs: [
                        {name: 'Css Style'},
                        {name: 'Dom Tree'}
                    ]
                }, {                    
                    type: 'panel',
                    mode: 'empty',
                    size: 12,
                    scaleMode: 'flex'
                }]
            }, {
                type: 'panel',
                mode: 'tab',
                size: 4,
                scaleMode: 'flex',
                showHead: false,
                tabs: [{name: 'timeline'}],
            }]
    };
}

///polyfills
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(predicate) {
      if (this == null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = list.length >>> 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        if (i in list) {
          value = list[i];
          if (predicate.call(thisArg, value, i, list)) {
            return value;
          }
        }
      }
      return undefined;
    }
  });
}
},{"./amgui":"/home/azazdeaz/repos/animachine/src/editor/amgui/amgui.js","./modules/css":"/home/azazdeaz/repos/animachine/src/editor/modules/css/cssModule.js","./timeline":"/home/azazdeaz/repos/animachine/src/editor/timeline/Timeline.js","./toolbar":"/home/azazdeaz/repos/animachine/src/editor/toolbar/Toolbar.js","./transhand":"/home/azazdeaz/repos/animachine/src/editor/transhand/Transhand.js","./warehouseman":"/home/azazdeaz/repos/animachine/src/editor/warehouseman/Warehouseman.js","./windooman":"/home/azazdeaz/repos/animachine/src/editor/windooman/Windooman.js","domready":"/home/azazdeaz/repos/animachine/node_modules/domready/ready.js","events":"/home/azazdeaz/repos/animachine/node_modules/events/events.js"}],"/home/azazdeaz/repos/animachine/node_modules/domready/ready.js":[function(require,module,exports){
/*!
  * domready (c) Dustin Diaz 2014 - License MIT
  */
!function (name, definition) {

  if (typeof module != 'undefined') module.exports = definition()
  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
  else this[name] = definition()

}('domready', function () {

  var fns = [], listener
    , doc = document
    , domContentLoaded = 'DOMContentLoaded'
    , loaded = /^loaded|^c/.test(doc.readyState)

  if (!loaded)
  doc.addEventListener(domContentLoaded, listener = function () {
    doc.removeEventListener(domContentLoaded, listener)
    loaded = 1
    while (listener = fns.shift()) listener()
  })

  return function (fn) {
    loaded ? fn() : fns.push(fn)
  }

});

},{}],"/home/azazdeaz/repos/animachine/node_modules/events/events.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],"/home/azazdeaz/repos/animachine/node_modules/inherits/inherits_browser.js":[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],"/home/azazdeaz/repos/animachine/node_modules/lodash/dist/lodash.js":[function(require,module,exports){
(function (global){
/**
 * @license
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modern -o ./dist/lodash.js`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
;(function() {

  /** Used as a safe reference for `undefined` in pre ES5 environments */
  var undefined;

  /** Used to pool arrays and objects used internally */
  var arrayPool = [],
      objectPool = [];

  /** Used to generate unique IDs */
  var idCounter = 0;

  /** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */
  var keyPrefix = +new Date + '';

  /** Used as the size when optimizations are enabled for large arrays */
  var largeArraySize = 75;

  /** Used as the max size of the `arrayPool` and `objectPool` */
  var maxPoolSize = 40;

  /** Used to detect and test whitespace */
  var whitespace = (
    // whitespace
    ' \t\x0B\f\xA0\ufeff' +

    // line terminators
    '\n\r\u2028\u2029' +

    // unicode category "Zs" space separators
    '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000'
  );

  /** Used to match empty string literals in compiled template source */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /**
   * Used to match ES6 template delimiters
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-literals-string-literals
   */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to match regexp flags from their coerced string values */
  var reFlags = /\w*$/;

  /** Used to detected named functions */
  var reFuncName = /^\s*function[ \n\r\t]+\w/;

  /** Used to match "interpolate" template delimiters */
  var reInterpolate = /<%=([\s\S]+?)%>/g;

  /** Used to match leading whitespace and zeros to be removed */
  var reLeadingSpacesAndZeros = RegExp('^[' + whitespace + ']*0+(?=.$)');

  /** Used to ensure capturing order of template delimiters */
  var reNoMatch = /($^)/;

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /** Used to match unescaped characters in compiled string literals */
  var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

  /** Used to assign default `context` object properties */
  var contextProps = [
    'Array', 'Boolean', 'Date', 'Function', 'Math', 'Number', 'Object',
    'RegExp', 'String', '_', 'attachEvent', 'clearTimeout', 'isFinite', 'isNaN',
    'parseInt', 'setTimeout'
  ];

  /** Used to make template sourceURLs easier to identify */
  var templateCounter = 0;

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
      arrayClass = '[object Array]',
      boolClass = '[object Boolean]',
      dateClass = '[object Date]',
      funcClass = '[object Function]',
      numberClass = '[object Number]',
      objectClass = '[object Object]',
      regexpClass = '[object RegExp]',
      stringClass = '[object String]';

  /** Used to identify object classifications that `_.clone` supports */
  var cloneableClasses = {};
  cloneableClasses[funcClass] = false;
  cloneableClasses[argsClass] = cloneableClasses[arrayClass] =
  cloneableClasses[boolClass] = cloneableClasses[dateClass] =
  cloneableClasses[numberClass] = cloneableClasses[objectClass] =
  cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;

  /** Used as an internal `_.debounce` options object */
  var debounceOptions = {
    'leading': false,
    'maxWait': 0,
    'trailing': false
  };

  /** Used as the property descriptor for `__bindData__` */
  var descriptor = {
    'configurable': false,
    'enumerable': false,
    'value': null,
    'writable': false
  };

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  /** Used to escape characters for inclusion in compiled string literals */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /** Used as a reference to the global object */
  var root = (objectTypes[typeof window] && window) || this;

  /** Detect free variable `exports` */
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  /** Detect free variable `module` */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports` */
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
  var freeGlobal = objectTypes[typeof global] && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    root = freeGlobal;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The base implementation of `_.indexOf` without support for binary searches
   * or `fromIndex` constraints.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {number} Returns the index of the matched value or `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    var index = (fromIndex || 0) - 1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  /**
   * An implementation of `_.contains` for cache objects that mimics the return
   * signature of `_.indexOf` by returning `0` if the value is found, else `-1`.
   *
   * @private
   * @param {Object} cache The cache object to inspect.
   * @param {*} value The value to search for.
   * @returns {number} Returns `0` if `value` is found, else `-1`.
   */
  function cacheIndexOf(cache, value) {
    var type = typeof value;
    cache = cache.cache;

    if (type == 'boolean' || value == null) {
      return cache[value] ? 0 : -1;
    }
    if (type != 'number' && type != 'string') {
      type = 'object';
    }
    var key = type == 'number' ? value : keyPrefix + value;
    cache = (cache = cache[type]) && cache[key];

    return type == 'object'
      ? (cache && baseIndexOf(cache, value) > -1 ? 0 : -1)
      : (cache ? 0 : -1);
  }

  /**
   * Adds a given value to the corresponding cache object.
   *
   * @private
   * @param {*} value The value to add to the cache.
   */
  function cachePush(value) {
    var cache = this.cache,
        type = typeof value;

    if (type == 'boolean' || value == null) {
      cache[value] = true;
    } else {
      if (type != 'number' && type != 'string') {
        type = 'object';
      }
      var key = type == 'number' ? value : keyPrefix + value,
          typeCache = cache[type] || (cache[type] = {});

      if (type == 'object') {
        (typeCache[key] || (typeCache[key] = [])).push(value);
      } else {
        typeCache[key] = true;
      }
    }
  }

  /**
   * Used by `_.max` and `_.min` as the default callback when a given
   * collection is a string value.
   *
   * @private
   * @param {string} value The character to inspect.
   * @returns {number} Returns the code unit of given character.
   */
  function charAtCallback(value) {
    return value.charCodeAt(0);
  }

  /**
   * Used by `sortBy` to compare transformed `collection` elements, stable sorting
   * them in ascending order.
   *
   * @private
   * @param {Object} a The object to compare to `b`.
   * @param {Object} b The object to compare to `a`.
   * @returns {number} Returns the sort order indicator of `1` or `-1`.
   */
  function compareAscending(a, b) {
    var ac = a.criteria,
        bc = b.criteria,
        index = -1,
        length = ac.length;

    while (++index < length) {
      var value = ac[index],
          other = bc[index];

      if (value !== other) {
        if (value > other || typeof value == 'undefined') {
          return 1;
        }
        if (value < other || typeof other == 'undefined') {
          return -1;
        }
      }
    }
    // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
    // that causes it, under certain circumstances, to return the same value for
    // `a` and `b`. See https://github.com/jashkenas/underscore/pull/1247
    //
    // This also ensures a stable sort in V8 and other engines.
    // See http://code.google.com/p/v8/issues/detail?id=90
    return a.index - b.index;
  }

  /**
   * Creates a cache object to optimize linear searches of large arrays.
   *
   * @private
   * @param {Array} [array=[]] The array to search.
   * @returns {null|Object} Returns the cache object or `null` if caching should not be used.
   */
  function createCache(array) {
    var index = -1,
        length = array.length,
        first = array[0],
        mid = array[(length / 2) | 0],
        last = array[length - 1];

    if (first && typeof first == 'object' &&
        mid && typeof mid == 'object' && last && typeof last == 'object') {
      return false;
    }
    var cache = getObject();
    cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;

    var result = getObject();
    result.array = array;
    result.cache = cache;
    result.push = cachePush;

    while (++index < length) {
      result.push(array[index]);
    }
    return result;
  }

  /**
   * Used by `template` to escape characters for inclusion in compiled
   * string literals.
   *
   * @private
   * @param {string} match The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeStringChar(match) {
    return '\\' + stringEscapes[match];
  }

  /**
   * Gets an array from the array pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Array} The array from the pool.
   */
  function getArray() {
    return arrayPool.pop() || [];
  }

  /**
   * Gets an object from the object pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Object} The object from the pool.
   */
  function getObject() {
    return objectPool.pop() || {
      'array': null,
      'cache': null,
      'criteria': null,
      'false': false,
      'index': 0,
      'null': false,
      'number': null,
      'object': null,
      'push': null,
      'string': null,
      'true': false,
      'undefined': false,
      'value': null
    };
  }

  /**
   * Releases the given array back to the array pool.
   *
   * @private
   * @param {Array} [array] The array to release.
   */
  function releaseArray(array) {
    array.length = 0;
    if (arrayPool.length < maxPoolSize) {
      arrayPool.push(array);
    }
  }

  /**
   * Releases the given object back to the object pool.
   *
   * @private
   * @param {Object} [object] The object to release.
   */
  function releaseObject(object) {
    var cache = object.cache;
    if (cache) {
      releaseObject(cache);
    }
    object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
    if (objectPool.length < maxPoolSize) {
      objectPool.push(object);
    }
  }

  /**
   * Slices the `collection` from the `start` index up to, but not including,
   * the `end` index.
   *
   * Note: This function is used instead of `Array#slice` to support node lists
   * in IE < 9 and to ensure dense arrays are returned.
   *
   * @private
   * @param {Array|Object|string} collection The collection to slice.
   * @param {number} start The start index.
   * @param {number} end The end index.
   * @returns {Array} Returns the new array.
   */
  function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1,
        length = end - start || 0,
        result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Create a new `lodash` function using the given context object.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Object} [context=root] The context object.
   * @returns {Function} Returns the `lodash` function.
   */
  function runInContext(context) {
    // Avoid issues with some ES3 environments that attempt to use values, named
    // after built-in constructors like `Object`, for the creation of literals.
    // ES5 clears this up by stating that literals must use built-in constructors.
    // See http://es5.github.io/#x11.1.5.
    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;

    /** Native constructor references */
    var Array = context.Array,
        Boolean = context.Boolean,
        Date = context.Date,
        Function = context.Function,
        Math = context.Math,
        Number = context.Number,
        Object = context.Object,
        RegExp = context.RegExp,
        String = context.String,
        TypeError = context.TypeError;

    /**
     * Used for `Array` method references.
     *
     * Normally `Array.prototype` would suffice, however, using an array literal
     * avoids issues in Narwhal.
     */
    var arrayRef = [];

    /** Used for native method references */
    var objectProto = Object.prototype;

    /** Used to restore the original `_` reference in `noConflict` */
    var oldDash = context._;

    /** Used to resolve the internal [[Class]] of values */
    var toString = objectProto.toString;

    /** Used to detect if a method is native */
    var reNative = RegExp('^' +
      String(toString)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/toString| for [^\]]+/g, '.*?') + '$'
    );

    /** Native method shortcuts */
    var ceil = Math.ceil,
        clearTimeout = context.clearTimeout,
        floor = Math.floor,
        fnToString = Function.prototype.toString,
        getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,
        hasOwnProperty = objectProto.hasOwnProperty,
        push = arrayRef.push,
        setTimeout = context.setTimeout,
        splice = arrayRef.splice,
        unshift = arrayRef.unshift;

    /** Used to set meta data on functions */
    var defineProperty = (function() {
      // IE 8 only accepts DOM elements
      try {
        var o = {},
            func = isNative(func = Object.defineProperty) && func,
            result = func(o, o, o) && func;
      } catch(e) { }
      return result;
    }());

    /* Native method shortcuts for methods with the same name as other `lodash` methods */
    var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate,
        nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,
        nativeIsFinite = context.isFinite,
        nativeIsNaN = context.isNaN,
        nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys,
        nativeMax = Math.max,
        nativeMin = Math.min,
        nativeParseInt = context.parseInt,
        nativeRandom = Math.random;

    /** Used to lookup a built-in constructor by [[Class]] */
    var ctorByClass = {};
    ctorByClass[arrayClass] = Array;
    ctorByClass[boolClass] = Boolean;
    ctorByClass[dateClass] = Date;
    ctorByClass[funcClass] = Function;
    ctorByClass[objectClass] = Object;
    ctorByClass[numberClass] = Number;
    ctorByClass[regexpClass] = RegExp;
    ctorByClass[stringClass] = String;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object which wraps the given value to enable intuitive
     * method chaining.
     *
     * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
     * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
     * and `unshift`
     *
     * Chaining is supported in custom builds as long as the `value` method is
     * implicitly or explicitly included in the build.
     *
     * The chainable wrapper functions are:
     * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,
     * `compose`, `concat`, `countBy`, `create`, `createCallback`, `curry`,
     * `debounce`, `defaults`, `defer`, `delay`, `difference`, `filter`, `flatten`,
     * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
     * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
     * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,
     * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `pull`, `push`,
     * `range`, `reject`, `remove`, `rest`, `reverse`, `shuffle`, `slice`, `sort`,
     * `sortBy`, `splice`, `tap`, `throttle`, `times`, `toArray`, `transform`,
     * `union`, `uniq`, `unshift`, `unzip`, `values`, `where`, `without`, `wrap`,
     * and `zip`
     *
     * The non-chainable wrapper functions are:
     * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `findIndex`,
     * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `has`, `identity`,
     * `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
     * `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`, `isNull`, `isNumber`,
     * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `join`,
     * `lastIndexOf`, `mixin`, `noConflict`, `parseInt`, `pop`, `random`, `reduce`,
     * `reduceRight`, `result`, `shift`, `size`, `some`, `sortedIndex`, `runInContext`,
     * `template`, `unescape`, `uniqueId`, and `value`
     *
     * The wrapper functions `first` and `last` return wrapped values when `n` is
     * provided, otherwise they return unwrapped values.
     *
     * Explicit chaining can be enabled by using the `_.chain` method.
     *
     * @name _
     * @constructor
     * @category Chaining
     * @param {*} value The value to wrap in a `lodash` instance.
     * @returns {Object} Returns a `lodash` instance.
     * @example
     *
     * var wrapped = _([1, 2, 3]);
     *
     * // returns an unwrapped value
     * wrapped.reduce(function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * // returns a wrapped value
     * var squares = wrapped.map(function(num) {
     *   return num * num;
     * });
     *
     * _.isArray(squares);
     * // => false
     *
     * _.isArray(squares.value());
     * // => true
     */
    function lodash(value) {
      // don't wrap if already wrapped, even if wrapped by a different `lodash` constructor
      return (value && typeof value == 'object' && !isArray(value) && hasOwnProperty.call(value, '__wrapped__'))
       ? value
       : new lodashWrapper(value);
    }

    /**
     * A fast path for creating `lodash` wrapper objects.
     *
     * @private
     * @param {*} value The value to wrap in a `lodash` instance.
     * @param {boolean} chainAll A flag to enable chaining for all methods
     * @returns {Object} Returns a `lodash` instance.
     */
    function lodashWrapper(value, chainAll) {
      this.__chain__ = !!chainAll;
      this.__wrapped__ = value;
    }
    // ensure `new lodashWrapper` is an instance of `lodash`
    lodashWrapper.prototype = lodash.prototype;

    /**
     * An object used to flag environments features.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    var support = lodash.support = {};

    /**
     * Detect if functions can be decompiled by `Function#toString`
     * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcDecomp = !isNative(context.WinRTError) && reThis.test(runInContext);

    /**
     * Detect if `Function#name` is supported (all but IE).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcNames = typeof Function.name == 'string';

    /**
     * By default, the template delimiters used by Lo-Dash are similar to those in
     * embedded Ruby (ERB). Change the following template settings to use alternative
     * delimiters.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    lodash.templateSettings = {

      /**
       * Used to detect `data` property values to be HTML-escaped.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'escape': /<%-([\s\S]+?)%>/g,

      /**
       * Used to detect code to be evaluated.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'evaluate': /<%([\s\S]+?)%>/g,

      /**
       * Used to detect `data` property values to inject.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'interpolate': reInterpolate,

      /**
       * Used to reference the data object in the template text.
       *
       * @memberOf _.templateSettings
       * @type string
       */
      'variable': '',

      /**
       * Used to import variables into the compiled template.
       *
       * @memberOf _.templateSettings
       * @type Object
       */
      'imports': {

        /**
         * A reference to the `lodash` function.
         *
         * @memberOf _.templateSettings.imports
         * @type Function
         */
        '_': lodash
      }
    };

    /*--------------------------------------------------------------------------*/

    /**
     * The base implementation of `_.bind` that creates the bound function and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new bound function.
     */
    function baseBind(bindData) {
      var func = bindData[0],
          partialArgs = bindData[2],
          thisArg = bindData[4];

      function bound() {
        // `Function#bind` spec
        // http://es5.github.io/#x15.3.4.5
        if (partialArgs) {
          // avoid `arguments` object deoptimizations by using `slice` instead
          // of `Array.prototype.slice.call` and not assigning `arguments` to a
          // variable as a ternary expression
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        // mimic the constructor's `return` behavior
        // http://es5.github.io/#x13.2.2
        if (this instanceof bound) {
          // ensure `new bound` is an instance of `func`
          var thisBinding = baseCreate(func.prototype),
              result = func.apply(thisBinding, args || arguments);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisArg, args || arguments);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.clone` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates clones with source counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, isDeep, callback, stackA, stackB) {
      if (callback) {
        var result = callback(value);
        if (typeof result != 'undefined') {
          return result;
        }
      }
      // inspect [[Class]]
      var isObj = isObject(value);
      if (isObj) {
        var className = toString.call(value);
        if (!cloneableClasses[className]) {
          return value;
        }
        var ctor = ctorByClass[className];
        switch (className) {
          case boolClass:
          case dateClass:
            return new ctor(+value);

          case numberClass:
          case stringClass:
            return new ctor(value);

          case regexpClass:
            result = ctor(value.source, reFlags.exec(value));
            result.lastIndex = value.lastIndex;
            return result;
        }
      } else {
        return value;
      }
      var isArr = isArray(value);
      if (isDeep) {
        // check for circular references and return corresponding clone
        var initedStack = !stackA;
        stackA || (stackA = getArray());
        stackB || (stackB = getArray());

        var length = stackA.length;
        while (length--) {
          if (stackA[length] == value) {
            return stackB[length];
          }
        }
        result = isArr ? ctor(value.length) : {};
      }
      else {
        result = isArr ? slice(value) : assign({}, value);
      }
      // add array properties assigned by `RegExp#exec`
      if (isArr) {
        if (hasOwnProperty.call(value, 'index')) {
          result.index = value.index;
        }
        if (hasOwnProperty.call(value, 'input')) {
          result.input = value.input;
        }
      }
      // exit for shallow clone
      if (!isDeep) {
        return result;
      }
      // add the source value to the stack of traversed objects
      // and associate it with its clone
      stackA.push(value);
      stackB.push(result);

      // recursively populate clone (susceptible to call stack limits)
      (isArr ? forEach : forOwn)(value, function(objValue, key) {
        result[key] = baseClone(objValue, isDeep, callback, stackA, stackB);
      });

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} prototype The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    function baseCreate(prototype, properties) {
      return isObject(prototype) ? nativeCreate(prototype) : {};
    }
    // fallback for browsers without `Object.create`
    if (!nativeCreate) {
      baseCreate = (function() {
        function Object() {}
        return function(prototype) {
          if (isObject(prototype)) {
            Object.prototype = prototype;
            var result = new Object;
            Object.prototype = null;
          }
          return result || context.Object();
        };
      }());
    }

    /**
     * The base implementation of `_.createCallback` without support for creating
     * "_.pluck" or "_.where" style callbacks.
     *
     * @private
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     */
    function baseCreateCallback(func, thisArg, argCount) {
      if (typeof func != 'function') {
        return identity;
      }
      // exit early for no `thisArg` or already bound by `Function#bind`
      if (typeof thisArg == 'undefined' || !('prototype' in func)) {
        return func;
      }
      var bindData = func.__bindData__;
      if (typeof bindData == 'undefined') {
        if (support.funcNames) {
          bindData = !func.name;
        }
        bindData = bindData || !support.funcDecomp;
        if (!bindData) {
          var source = fnToString.call(func);
          if (!support.funcNames) {
            bindData = !reFuncName.test(source);
          }
          if (!bindData) {
            // checks if `func` references the `this` keyword and stores the result
            bindData = reThis.test(source);
            setBindData(func, bindData);
          }
        }
      }
      // exit early if there are no `this` references or `func` is bound
      if (bindData === false || (bindData !== true && bindData[1] & 1)) {
        return func;
      }
      switch (argCount) {
        case 1: return function(value) {
          return func.call(thisArg, value);
        };
        case 2: return function(a, b) {
          return func.call(thisArg, a, b);
        };
        case 3: return function(value, index, collection) {
          return func.call(thisArg, value, index, collection);
        };
        case 4: return function(accumulator, value, index, collection) {
          return func.call(thisArg, accumulator, value, index, collection);
        };
      }
      return bind(func, thisArg);
    }

    /**
     * The base implementation of `createWrapper` that creates the wrapper and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new function.
     */
    function baseCreateWrapper(bindData) {
      var func = bindData[0],
          bitmask = bindData[1],
          partialArgs = bindData[2],
          partialRightArgs = bindData[3],
          thisArg = bindData[4],
          arity = bindData[5];

      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          key = func;

      function bound() {
        var thisBinding = isBind ? thisArg : this;
        if (partialArgs) {
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        if (partialRightArgs || isCurry) {
          args || (args = slice(arguments));
          if (partialRightArgs) {
            push.apply(args, partialRightArgs);
          }
          if (isCurry && args.length < arity) {
            bitmask |= 16 & ~32;
            return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
          }
        }
        args || (args = arguments);
        if (isBindKey) {
          func = thisBinding[key];
        }
        if (this instanceof bound) {
          thisBinding = baseCreate(func.prototype);
          var result = func.apply(thisBinding, args);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisBinding, args);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.difference` that accepts a single array
     * of values to exclude.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {Array} [values] The array of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     */
    function baseDifference(array, values) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          isLarge = length >= largeArraySize && indexOf === baseIndexOf,
          result = [];

      if (isLarge) {
        var cache = createCache(values);
        if (cache) {
          indexOf = cacheIndexOf;
          values = cache;
        } else {
          isLarge = false;
        }
      }
      while (++index < length) {
        var value = array[index];
        if (indexOf(values, value) < 0) {
          result.push(value);
        }
      }
      if (isLarge) {
        releaseObject(values);
      }
      return result;
    }

    /**
     * The base implementation of `_.flatten` without support for callback
     * shorthands or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.
     * @param {number} [fromIndex=0] The index to start from.
     * @returns {Array} Returns a new flattened array.
     */
    function baseFlatten(array, isShallow, isStrict, fromIndex) {
      var index = (fromIndex || 0) - 1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];

        if (value && typeof value == 'object' && typeof value.length == 'number'
            && (isArray(value) || isArguments(value))) {
          // recursively flatten arrays (susceptible to call stack limits)
          if (!isShallow) {
            value = baseFlatten(value, isShallow, isStrict);
          }
          var valIndex = -1,
              valLength = value.length,
              resIndex = result.length;

          result.length += valLength;
          while (++valIndex < valLength) {
            result[resIndex++] = value[valIndex];
          }
        } else if (!isStrict) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.isEqual`, without support for `thisArg` binding,
     * that allows partial "_.where" style comparisons.
     *
     * @private
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
     * @param {Array} [stackA=[]] Tracks traversed `a` objects.
     * @param {Array} [stackB=[]] Tracks traversed `b` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
      // used to indicate that when comparing objects, `a` has at least the properties of `b`
      if (callback) {
        var result = callback(a, b);
        if (typeof result != 'undefined') {
          return !!result;
        }
      }
      // exit early for identical values
      if (a === b) {
        // treat `+0` vs. `-0` as not equal
        return a !== 0 || (1 / a == 1 / b);
      }
      var type = typeof a,
          otherType = typeof b;

      // exit early for unlike primitive values
      if (a === a &&
          !(a && objectTypes[type]) &&
          !(b && objectTypes[otherType])) {
        return false;
      }
      // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
      // http://es5.github.io/#x15.3.4.4
      if (a == null || b == null) {
        return a === b;
      }
      // compare [[Class]] names
      var className = toString.call(a),
          otherClass = toString.call(b);

      if (className == argsClass) {
        className = objectClass;
      }
      if (otherClass == argsClass) {
        otherClass = objectClass;
      }
      if (className != otherClass) {
        return false;
      }
      switch (className) {
        case boolClass:
        case dateClass:
          // coerce dates and booleans to numbers, dates to milliseconds and booleans
          // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
          return +a == +b;

        case numberClass:
          // treat `NaN` vs. `NaN` as equal
          return (a != +a)
            ? b != +b
            // but treat `+0` vs. `-0` as not equal
            : (a == 0 ? (1 / a == 1 / b) : a == +b);

        case regexpClass:
        case stringClass:
          // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
          // treat string primitives and their corresponding object instances as equal
          return a == String(b);
      }
      var isArr = className == arrayClass;
      if (!isArr) {
        // unwrap any `lodash` wrapped values
        var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
            bWrapped = hasOwnProperty.call(b, '__wrapped__');

        if (aWrapped || bWrapped) {
          return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
        }
        // exit for functions and DOM nodes
        if (className != objectClass) {
          return false;
        }
        // in older versions of Opera, `arguments` objects have `Array` constructors
        var ctorA = a.constructor,
            ctorB = b.constructor;

        // non `Object` object instances with different constructors are not equal
        if (ctorA != ctorB &&
              !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
              ('constructor' in a && 'constructor' in b)
            ) {
          return false;
        }
      }
      // assume cyclic structures are equal
      // the algorithm for detecting cyclic structures is adapted from ES 5.1
      // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
      var initedStack = !stackA;
      stackA || (stackA = getArray());
      stackB || (stackB = getArray());

      var length = stackA.length;
      while (length--) {
        if (stackA[length] == a) {
          return stackB[length] == b;
        }
      }
      var size = 0;
      result = true;

      // add `a` and `b` to the stack of traversed objects
      stackA.push(a);
      stackB.push(b);

      // recursively compare objects and arrays (susceptible to call stack limits)
      if (isArr) {
        // compare lengths to determine if a deep comparison is necessary
        length = a.length;
        size = b.length;
        result = size == length;

        if (result || isWhere) {
          // deep compare the contents, ignoring non-numeric properties
          while (size--) {
            var index = length,
                value = b[size];

            if (isWhere) {
              while (index--) {
                if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
                  break;
                }
              }
            } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
              break;
            }
          }
        }
      }
      else {
        // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
        // which, in this case, is more costly
        forIn(b, function(value, key, b) {
          if (hasOwnProperty.call(b, key)) {
            // count the number of properties.
            size++;
            // deep compare each property value.
            return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
          }
        });

        if (result && !isWhere) {
          // ensure both objects have the same number of properties
          forIn(a, function(value, key, a) {
            if (hasOwnProperty.call(a, key)) {
              // `size` will be `-1` if `a` has more properties than `b`
              return (result = --size > -1);
            }
          });
        }
      }
      stackA.pop();
      stackB.pop();

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.merge` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates values with source counterparts.
     */
    function baseMerge(object, source, callback, stackA, stackB) {
      (isArray(source) ? forEach : forOwn)(source, function(source, key) {
        var found,
            isArr,
            result = source,
            value = object[key];

        if (source && ((isArr = isArray(source)) || isPlainObject(source))) {
          // avoid merging previously merged cyclic sources
          var stackLength = stackA.length;
          while (stackLength--) {
            if ((found = stackA[stackLength] == source)) {
              value = stackB[stackLength];
              break;
            }
          }
          if (!found) {
            var isShallow;
            if (callback) {
              result = callback(value, source);
              if ((isShallow = typeof result != 'undefined')) {
                value = result;
              }
            }
            if (!isShallow) {
              value = isArr
                ? (isArray(value) ? value : [])
                : (isPlainObject(value) ? value : {});
            }
            // add `source` and associated `value` to the stack of traversed objects
            stackA.push(source);
            stackB.push(value);

            // recursively merge objects and arrays (susceptible to call stack limits)
            if (!isShallow) {
              baseMerge(value, source, callback, stackA, stackB);
            }
          }
        }
        else {
          if (callback) {
            result = callback(value, source);
            if (typeof result == 'undefined') {
              result = source;
            }
          }
          if (typeof result != 'undefined') {
            value = result;
          }
        }
        object[key] = value;
      });
    }

    /**
     * The base implementation of `_.random` without argument juggling or support
     * for returning floating-point numbers.
     *
     * @private
     * @param {number} min The minimum possible value.
     * @param {number} max The maximum possible value.
     * @returns {number} Returns a random number.
     */
    function baseRandom(min, max) {
      return min + floor(nativeRandom() * (max - min + 1));
    }

    /**
     * The base implementation of `_.uniq` without support for callback shorthands
     * or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function} [callback] The function called per iteration.
     * @returns {Array} Returns a duplicate-value-free array.
     */
    function baseUniq(array, isSorted, callback) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          result = [];

      var isLarge = !isSorted && length >= largeArraySize && indexOf === baseIndexOf,
          seen = (callback || isLarge) ? getArray() : result;

      if (isLarge) {
        var cache = createCache(seen);
        indexOf = cacheIndexOf;
        seen = cache;
      }
      while (++index < length) {
        var value = array[index],
            computed = callback ? callback(value, index, array) : value;

        if (isSorted
              ? !index || seen[seen.length - 1] !== computed
              : indexOf(seen, computed) < 0
            ) {
          if (callback || isLarge) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
      if (isLarge) {
        releaseArray(seen.array);
        releaseObject(seen);
      } else if (callback) {
        releaseArray(seen);
      }
      return result;
    }

    /**
     * Creates a function that aggregates a collection, creating an object composed
     * of keys generated from the results of running each element of the collection
     * through a callback. The given `setter` function sets the keys and values
     * of the composed object.
     *
     * @private
     * @param {Function} setter The setter function.
     * @returns {Function} Returns the new aggregator function.
     */
    function createAggregator(setter) {
      return function(collection, callback, thisArg) {
        var result = {};
        callback = lodash.createCallback(callback, thisArg, 3);

        var index = -1,
            length = collection ? collection.length : 0;

        if (typeof length == 'number') {
          while (++index < length) {
            var value = collection[index];
            setter(result, value, callback(value, index, collection), collection);
          }
        } else {
          forOwn(collection, function(value, key, collection) {
            setter(result, value, callback(value, key, collection), collection);
          });
        }
        return result;
      };
    }

    /**
     * Creates a function that, when called, either curries or invokes `func`
     * with an optional `this` binding and partially applied arguments.
     *
     * @private
     * @param {Function|string} func The function or method name to reference.
     * @param {number} bitmask The bitmask of method flags to compose.
     *  The bitmask may be composed of the following flags:
     *  1 - `_.bind`
     *  2 - `_.bindKey`
     *  4 - `_.curry`
     *  8 - `_.curry` (bound)
     *  16 - `_.partial`
     *  32 - `_.partialRight`
     * @param {Array} [partialArgs] An array of arguments to prepend to those
     *  provided to the new function.
     * @param {Array} [partialRightArgs] An array of arguments to append to those
     *  provided to the new function.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {number} [arity] The arity of `func`.
     * @returns {Function} Returns the new function.
     */
    function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          isPartial = bitmask & 16,
          isPartialRight = bitmask & 32;

      if (!isBindKey && !isFunction(func)) {
        throw new TypeError;
      }
      if (isPartial && !partialArgs.length) {
        bitmask &= ~16;
        isPartial = partialArgs = false;
      }
      if (isPartialRight && !partialRightArgs.length) {
        bitmask &= ~32;
        isPartialRight = partialRightArgs = false;
      }
      var bindData = func && func.__bindData__;
      if (bindData && bindData !== true) {
        // clone `bindData`
        bindData = slice(bindData);
        if (bindData[2]) {
          bindData[2] = slice(bindData[2]);
        }
        if (bindData[3]) {
          bindData[3] = slice(bindData[3]);
        }
        // set `thisBinding` is not previously bound
        if (isBind && !(bindData[1] & 1)) {
          bindData[4] = thisArg;
        }
        // set if previously bound but not currently (subsequent curried functions)
        if (!isBind && bindData[1] & 1) {
          bitmask |= 8;
        }
        // set curried arity if not yet set
        if (isCurry && !(bindData[1] & 4)) {
          bindData[5] = arity;
        }
        // append partial left arguments
        if (isPartial) {
          push.apply(bindData[2] || (bindData[2] = []), partialArgs);
        }
        // append partial right arguments
        if (isPartialRight) {
          unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
        }
        // merge flags
        bindData[1] |= bitmask;
        return createWrapper.apply(null, bindData);
      }
      // fast path for `_.bind`
      var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
      return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
    }

    /**
     * Used by `escape` to convert characters to HTML entities.
     *
     * @private
     * @param {string} match The matched character to escape.
     * @returns {string} Returns the escaped character.
     */
    function escapeHtmlChar(match) {
      return htmlEscapes[match];
    }

    /**
     * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
     * customized, this method returns the custom method, otherwise it returns
     * the `baseIndexOf` function.
     *
     * @private
     * @returns {Function} Returns the "indexOf" function.
     */
    function getIndexOf() {
      var result = (result = lodash.indexOf) === indexOf ? baseIndexOf : result;
      return result;
    }

    /**
     * Checks if `value` is a native function.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
     */
    function isNative(value) {
      return typeof value == 'function' && reNative.test(value);
    }

    /**
     * Sets `this` binding data on a given function.
     *
     * @private
     * @param {Function} func The function to set data on.
     * @param {Array} value The data array to set.
     */
    var setBindData = !defineProperty ? noop : function(func, value) {
      descriptor.value = value;
      defineProperty(func, '__bindData__', descriptor);
    };

    /**
     * A fallback implementation of `isPlainObject` which checks if a given value
     * is an object created by the `Object` constructor, assuming objects created
     * by the `Object` constructor have no inherited enumerable properties and that
     * there are no `Object.prototype` extensions.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     */
    function shimIsPlainObject(value) {
      var ctor,
          result;

      // avoid non Object objects, `arguments` objects, and DOM elements
      if (!(value && toString.call(value) == objectClass) ||
          (ctor = value.constructor, isFunction(ctor) && !(ctor instanceof ctor))) {
        return false;
      }
      // In most environments an object's own properties are iterated before
      // its inherited properties. If the last iterated property is an object's
      // own property then there are no inherited enumerable properties.
      forIn(value, function(value, key) {
        result = key;
      });
      return typeof result == 'undefined' || hasOwnProperty.call(value, result);
    }

    /**
     * Used by `unescape` to convert HTML entities to characters.
     *
     * @private
     * @param {string} match The matched character to unescape.
     * @returns {string} Returns the unescaped character.
     */
    function unescapeHtmlChar(match) {
      return htmlUnescapes[match];
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Checks if `value` is an `arguments` object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
     * @example
     *
     * (function() { return _.isArguments(arguments); })(1, 2, 3);
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    function isArguments(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == argsClass || false;
    }

    /**
     * Checks if `value` is an array.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
     * @example
     *
     * (function() { return _.isArray(arguments); })();
     * // => false
     *
     * _.isArray([1, 2, 3]);
     * // => true
     */
    var isArray = nativeIsArray || function(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == arrayClass || false;
    };

    /**
     * A fallback implementation of `Object.keys` which produces an array of the
     * given object's own enumerable property names.
     *
     * @private
     * @type Function
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     */
    var shimKeys = function(object) {
      var index, iterable = object, result = [];
      if (!iterable) return result;
      if (!(objectTypes[typeof object])) return result;
        for (index in iterable) {
          if (hasOwnProperty.call(iterable, index)) {
            result.push(index);
          }
        }
      return result
    };

    /**
     * Creates an array composed of the own enumerable property names of an object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     * @example
     *
     * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
     * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
     */
    var keys = !nativeKeys ? shimKeys : function(object) {
      if (!isObject(object)) {
        return [];
      }
      return nativeKeys(object);
    };

    /**
     * Used to convert characters to HTML entities:
     *
     * Though the `>` character is escaped for symmetry, characters like `>` and `/`
     * don't require escaping in HTML and have no special meaning unless they're part
     * of a tag or an unquoted attribute value.
     * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
     */
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    /** Used to convert HTML entities to characters */
    var htmlUnescapes = invert(htmlEscapes);

    /** Used to match HTML entities and HTML characters */
    var reEscapedHtml = RegExp('(' + keys(htmlUnescapes).join('|') + ')', 'g'),
        reUnescapedHtml = RegExp('[' + keys(htmlEscapes).join('') + ']', 'g');

    /*--------------------------------------------------------------------------*/

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object. Subsequent sources will overwrite property assignments of previous
     * sources. If a callback is provided it will be executed to produce the
     * assigned values. The callback is bound to `thisArg` and invoked with two
     * arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @type Function
     * @alias extend
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize assigning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
     * // => { 'name': 'fred', 'employer': 'slate' }
     *
     * var defaults = _.partialRight(_.assign, function(a, b) {
     *   return typeof a == 'undefined' ? b : a;
     * });
     *
     * var object = { 'name': 'barney' };
     * defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var assign = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {
        var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);
      } else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {
        callback = args[--argsLength];
      }
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          result[index] = callback ? callback(result[index], iterable[index]) : iterable[index];
        }
        }
      }
      return result
    };

    /**
     * Creates a clone of `value`. If `isDeep` is `true` nested objects will also
     * be cloned, otherwise they will be assigned by reference. If a callback
     * is provided it will be executed to produce the cloned values. If the
     * callback returns `undefined` cloning will be handled by the method instead.
     * The callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var shallow = _.clone(characters);
     * shallow[0] === characters[0];
     * // => true
     *
     * var deep = _.clone(characters, true);
     * deep[0] === characters[0];
     * // => false
     *
     * _.mixin({
     *   'clone': _.partialRight(_.clone, function(value) {
     *     return _.isElement(value) ? value.cloneNode(false) : undefined;
     *   })
     * });
     *
     * var clone = _.clone(document.body);
     * clone.childNodes.length;
     * // => 0
     */
    function clone(value, isDeep, callback, thisArg) {
      // allows working with "Collections" methods without using their `index`
      // and `collection` arguments for `isDeep` and `callback`
      if (typeof isDeep != 'boolean' && isDeep != null) {
        thisArg = callback;
        callback = isDeep;
        isDeep = false;
      }
      return baseClone(value, isDeep, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates a deep clone of `value`. If a callback is provided it will be
     * executed to produce the cloned values. If the callback returns `undefined`
     * cloning will be handled by the method instead. The callback is bound to
     * `thisArg` and invoked with one argument; (value).
     *
     * Note: This method is loosely based on the structured clone algorithm. Functions
     * and DOM nodes are **not** cloned. The enumerable properties of `arguments` objects and
     * objects created by constructors other than `Object` are cloned to plain `Object` objects.
     * See http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the deep cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var deep = _.cloneDeep(characters);
     * deep[0] === characters[0];
     * // => false
     *
     * var view = {
     *   'label': 'docs',
     *   'node': element
     * };
     *
     * var clone = _.cloneDeep(view, function(value) {
     *   return _.isElement(value) ? value.cloneNode(true) : undefined;
     * });
     *
     * clone.node == view.node;
     * // => false
     */
    function cloneDeep(value, callback, thisArg) {
      return baseClone(value, true, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates an object that inherits from the given `prototype` object. If a
     * `properties` object is provided its own enumerable properties are assigned
     * to the created object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} prototype The object to inherit from.
     * @param {Object} [properties] The properties to assign to the object.
     * @returns {Object} Returns the new object.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * function Circle() {
     *   Shape.call(this);
     * }
     *
     * Circle.prototype = _.create(Shape.prototype, { 'constructor': Circle });
     *
     * var circle = new Circle;
     * circle instanceof Circle;
     * // => true
     *
     * circle instanceof Shape;
     * // => true
     */
    function create(prototype, properties) {
      var result = baseCreate(prototype);
      return properties ? assign(result, properties) : result;
    }

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object for all destination properties that resolve to `undefined`. Once a
     * property is set, additional defaults of the same property will be ignored.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param- {Object} [guard] Allows working with `_.reduce` without using its
     *  `key` and `object` arguments as sources.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var object = { 'name': 'barney' };
     * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var defaults = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (typeof result[index] == 'undefined') result[index] = iterable[index];
        }
        }
      }
      return result
    };

    /**
     * This method is like `_.findIndex` except that it returns the key of the
     * first element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': false },
     *   'fred': {    'age': 40, 'blocked': true },
     *   'pebbles': { 'age': 1,  'blocked': false }
     * };
     *
     * _.findKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => 'barney' (property order is not guaranteed across environments)
     *
     * // using "_.where" callback shorthand
     * _.findKey(characters, { 'age': 1 });
     * // => 'pebbles'
     *
     * // using "_.pluck" callback shorthand
     * _.findKey(characters, 'blocked');
     * // => 'fred'
     */
    function findKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwn(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * This method is like `_.findKey` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': true },
     *   'fred': {    'age': 40, 'blocked': false },
     *   'pebbles': { 'age': 1,  'blocked': true }
     * };
     *
     * _.findLastKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => returns `pebbles`, assuming `_.findKey` returns `barney`
     *
     * // using "_.where" callback shorthand
     * _.findLastKey(characters, { 'age': 40 });
     * // => 'fred'
     *
     * // using "_.pluck" callback shorthand
     * _.findLastKey(characters, 'blocked');
     * // => 'pebbles'
     */
    function findLastKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwnRight(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over own and inherited enumerable properties of an object,
     * executing the callback for each property. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, key, object). Callbacks may exit
     * iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forIn(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
     */
    var forIn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        for (index in iterable) {
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forIn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forInRight(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'move', 'y', and 'x' assuming `_.forIn ` logs 'x', 'y', and 'move'
     */
    function forInRight(object, callback, thisArg) {
      var pairs = [];

      forIn(object, function(value, key) {
        pairs.push(key, value);
      });

      var length = pairs.length;
      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(pairs[length--], pairs[length], object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Iterates over own enumerable properties of an object, executing the callback
     * for each property. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, key, object). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
     */
    var forOwn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forOwn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwnRight({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs 'length', '1', and '0' assuming `_.forOwn` logs '0', '1', and 'length'
     */
    function forOwnRight(object, callback, thisArg) {
      var props = keys(object),
          length = props.length;

      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        var key = props[length];
        if (callback(object[key], key, object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Creates a sorted array of property names of all enumerable properties,
     * own and inherited, of `object` that have function values.
     *
     * @static
     * @memberOf _
     * @alias methods
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names that have function values.
     * @example
     *
     * _.functions(_);
     * // => ['all', 'any', 'bind', 'bindAll', 'clone', 'compact', 'compose', ...]
     */
    function functions(object) {
      var result = [];
      forIn(object, function(value, key) {
        if (isFunction(value)) {
          result.push(key);
        }
      });
      return result.sort();
    }

    /**
     * Checks if the specified property name exists as a direct property of `object`,
     * instead of an inherited property.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to check.
     * @returns {boolean} Returns `true` if key is a direct property, else `false`.
     * @example
     *
     * _.has({ 'a': 1, 'b': 2, 'c': 3 }, 'b');
     * // => true
     */
    function has(object, key) {
      return object ? hasOwnProperty.call(object, key) : false;
    }

    /**
     * Creates an object composed of the inverted keys and values of the given object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to invert.
     * @returns {Object} Returns the created inverted object.
     * @example
     *
     * _.invert({ 'first': 'fred', 'second': 'barney' });
     * // => { 'fred': 'first', 'barney': 'second' }
     */
    function invert(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = {};

      while (++index < length) {
        var key = props[index];
        result[object[key]] = key;
      }
      return result;
    }

    /**
     * Checks if `value` is a boolean value.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a boolean value, else `false`.
     * @example
     *
     * _.isBoolean(null);
     * // => false
     */
    function isBoolean(value) {
      return value === true || value === false ||
        value && typeof value == 'object' && toString.call(value) == boolClass || false;
    }

    /**
     * Checks if `value` is a date.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a date, else `false`.
     * @example
     *
     * _.isDate(new Date);
     * // => true
     */
    function isDate(value) {
      return value && typeof value == 'object' && toString.call(value) == dateClass || false;
    }

    /**
     * Checks if `value` is a DOM element.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a DOM element, else `false`.
     * @example
     *
     * _.isElement(document.body);
     * // => true
     */
    function isElement(value) {
      return value && value.nodeType === 1 || false;
    }

    /**
     * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a
     * length of `0` and objects with no own enumerable properties are considered
     * "empty".
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object|string} value The value to inspect.
     * @returns {boolean} Returns `true` if the `value` is empty, else `false`.
     * @example
     *
     * _.isEmpty([1, 2, 3]);
     * // => false
     *
     * _.isEmpty({});
     * // => true
     *
     * _.isEmpty('');
     * // => true
     */
    function isEmpty(value) {
      var result = true;
      if (!value) {
        return result;
      }
      var className = toString.call(value),
          length = value.length;

      if ((className == arrayClass || className == stringClass || className == argsClass ) ||
          (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {
        return !length;
      }
      forOwn(value, function() {
        return (result = false);
      });
      return result;
    }

    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent to each other. If a callback is provided it will be executed
     * to compare values. If the callback returns `undefined` comparisons will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (a, b).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var copy = { 'name': 'fred' };
     *
     * object == copy;
     * // => false
     *
     * _.isEqual(object, copy);
     * // => true
     *
     * var words = ['hello', 'goodbye'];
     * var otherWords = ['hi', 'goodbye'];
     *
     * _.isEqual(words, otherWords, function(a, b) {
     *   var reGreet = /^(?:hello|hi)$/i,
     *       aGreet = _.isString(a) && reGreet.test(a),
     *       bGreet = _.isString(b) && reGreet.test(b);
     *
     *   return (aGreet || bGreet) ? (aGreet == bGreet) : undefined;
     * });
     * // => true
     */
    function isEqual(a, b, callback, thisArg) {
      return baseIsEqual(a, b, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 2));
    }

    /**
     * Checks if `value` is, or can be coerced to, a finite number.
     *
     * Note: This is not the same as native `isFinite` which will return true for
     * booleans and empty strings. See http://es5.github.io/#x15.1.2.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is finite, else `false`.
     * @example
     *
     * _.isFinite(-101);
     * // => true
     *
     * _.isFinite('10');
     * // => true
     *
     * _.isFinite(true);
     * // => false
     *
     * _.isFinite('');
     * // => false
     *
     * _.isFinite(Infinity);
     * // => false
     */
    function isFinite(value) {
      return nativeIsFinite(value) && !nativeIsNaN(parseFloat(value));
    }

    /**
     * Checks if `value` is a function.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     */
    function isFunction(value) {
      return typeof value == 'function';
    }

    /**
     * Checks if `value` is the language type of Object.
     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(1);
     * // => false
     */
    function isObject(value) {
      // check if the value is the ECMAScript language type of Object
      // http://es5.github.io/#x8
      // and avoid a V8 bug
      // http://code.google.com/p/v8/issues/detail?id=2291
      return !!(value && objectTypes[typeof value]);
    }

    /**
     * Checks if `value` is `NaN`.
     *
     * Note: This is not the same as native `isNaN` which will return `true` for
     * `undefined` and other non-numeric values. See http://es5.github.io/#x15.1.2.4.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `NaN`, else `false`.
     * @example
     *
     * _.isNaN(NaN);
     * // => true
     *
     * _.isNaN(new Number(NaN));
     * // => true
     *
     * isNaN(undefined);
     * // => true
     *
     * _.isNaN(undefined);
     * // => false
     */
    function isNaN(value) {
      // `NaN` as a primitive is the only value that is not equal to itself
      // (perform the [[Class]] check first to avoid errors with some host objects in IE)
      return isNumber(value) && value != +value;
    }

    /**
     * Checks if `value` is `null`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `null`, else `false`.
     * @example
     *
     * _.isNull(null);
     * // => true
     *
     * _.isNull(undefined);
     * // => false
     */
    function isNull(value) {
      return value === null;
    }

    /**
     * Checks if `value` is a number.
     *
     * Note: `NaN` is considered a number. See http://es5.github.io/#x8.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a number, else `false`.
     * @example
     *
     * _.isNumber(8.4 * 5);
     * // => true
     */
    function isNumber(value) {
      return typeof value == 'number' ||
        value && typeof value == 'object' && toString.call(value) == numberClass || false;
    }

    /**
     * Checks if `value` is an object created by the `Object` constructor.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * _.isPlainObject(new Shape);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     */
    var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
      if (!(value && toString.call(value) == objectClass)) {
        return false;
      }
      var valueOf = value.valueOf,
          objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

      return objProto
        ? (value == objProto || getPrototypeOf(value) == objProto)
        : shimIsPlainObject(value);
    };

    /**
     * Checks if `value` is a regular expression.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a regular expression, else `false`.
     * @example
     *
     * _.isRegExp(/fred/);
     * // => true
     */
    function isRegExp(value) {
      return value && typeof value == 'object' && toString.call(value) == regexpClass || false;
    }

    /**
     * Checks if `value` is a string.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
     * @example
     *
     * _.isString('fred');
     * // => true
     */
    function isString(value) {
      return typeof value == 'string' ||
        value && typeof value == 'object' && toString.call(value) == stringClass || false;
    }

    /**
     * Checks if `value` is `undefined`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `undefined`, else `false`.
     * @example
     *
     * _.isUndefined(void 0);
     * // => true
     */
    function isUndefined(value) {
      return typeof value == 'undefined';
    }

    /**
     * Creates an object with the same keys as `object` and values generated by
     * running each own enumerable property of `object` through the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new object with values of the results of each `callback` execution.
     * @example
     *
     * _.mapValues({ 'a': 1, 'b': 2, 'c': 3} , function(num) { return num * 3; });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     *
     * var characters = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // using "_.pluck" callback shorthand
     * _.mapValues(characters, 'age');
     * // => { 'fred': 40, 'pebbles': 1 }
     */
    function mapValues(object, callback, thisArg) {
      var result = {};
      callback = lodash.createCallback(callback, thisArg, 3);

      forOwn(object, function(value, key, object) {
        result[key] = callback(value, key, object);
      });
      return result;
    }

    /**
     * Recursively merges own enumerable properties of the source object(s), that
     * don't resolve to `undefined` into the destination object. Subsequent sources
     * will overwrite property assignments of previous sources. If a callback is
     * provided it will be executed to produce the merged values of the destination
     * and source properties. If the callback returns `undefined` merging will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var names = {
     *   'characters': [
     *     { 'name': 'barney' },
     *     { 'name': 'fred' }
     *   ]
     * };
     *
     * var ages = {
     *   'characters': [
     *     { 'age': 36 },
     *     { 'age': 40 }
     *   ]
     * };
     *
     * _.merge(names, ages);
     * // => { 'characters': [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred', 'age': 40 }] }
     *
     * var food = {
     *   'fruits': ['apple'],
     *   'vegetables': ['beet']
     * };
     *
     * var otherFood = {
     *   'fruits': ['banana'],
     *   'vegetables': ['carrot']
     * };
     *
     * _.merge(food, otherFood, function(a, b) {
     *   return _.isArray(a) ? a.concat(b) : undefined;
     * });
     * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot] }
     */
    function merge(object) {
      var args = arguments,
          length = 2;

      if (!isObject(object)) {
        return object;
      }
      // allows working with `_.reduce` and `_.reduceRight` without using
      // their `index` and `collection` arguments
      if (typeof args[2] != 'number') {
        length = args.length;
      }
      if (length > 3 && typeof args[length - 2] == 'function') {
        var callback = baseCreateCallback(args[--length - 1], args[length--], 2);
      } else if (length > 2 && typeof args[length - 1] == 'function') {
        callback = args[--length];
      }
      var sources = slice(arguments, 1, length),
          index = -1,
          stackA = getArray(),
          stackB = getArray();

      while (++index < length) {
        baseMerge(object, sources[index], callback, stackA, stackB);
      }
      releaseArray(stackA);
      releaseArray(stackB);
      return object;
    }

    /**
     * Creates a shallow clone of `object` excluding the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` omitting the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The properties to omit or the
     *  function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object without the omitted properties.
     * @example
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, 'age');
     * // => { 'name': 'fred' }
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, function(value) {
     *   return typeof value == 'number';
     * });
     * // => { 'name': 'fred' }
     */
    function omit(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var props = [];
        forIn(object, function(value, key) {
          props.push(key);
        });
        props = baseDifference(props, baseFlatten(arguments, true, false, 1));

        var index = -1,
            length = props.length;

        while (++index < length) {
          var key = props[index];
          result[key] = object[key];
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (!callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * Creates a two dimensional array of an object's key-value pairs,
     * i.e. `[[key1, value1], [key2, value2]]`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns new array of key-value pairs.
     * @example
     *
     * _.pairs({ 'barney': 36, 'fred': 40 });
     * // => [['barney', 36], ['fred', 40]] (property order is not guaranteed across environments)
     */
    function pairs(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        var key = props[index];
        result[index] = [key, object[key]];
      }
      return result;
    }

    /**
     * Creates a shallow clone of `object` composed of the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` picking the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The function called per
     *  iteration or property names to pick, specified as individual property
     *  names or arrays of property names.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object composed of the picked properties.
     * @example
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, 'name');
     * // => { 'name': 'fred' }
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, function(value, key) {
     *   return key.charAt(0) != '_';
     * });
     * // => { 'name': 'fred' }
     */
    function pick(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var index = -1,
            props = baseFlatten(arguments, true, false, 1),
            length = isObject(object) ? props.length : 0;

        while (++index < length) {
          var key = props[index];
          if (key in object) {
            result[key] = object[key];
          }
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * An alternative to `_.reduce` this method transforms `object` to a new
     * `accumulator` object which is the result of running each of its own
     * enumerable properties through a callback, with each callback execution
     * potentially mutating the `accumulator` object. The callback is bound to
     * `thisArg` and invoked with four arguments; (accumulator, value, key, object).
     * Callbacks may exit iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] The custom accumulator value.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var squares = _.transform([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(result, num) {
     *   num *= num;
     *   if (num % 2) {
     *     return result.push(num) < 3;
     *   }
     * });
     * // => [1, 9, 25]
     *
     * var mapped = _.transform({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     * });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function transform(object, callback, accumulator, thisArg) {
      var isArr = isArray(object);
      if (accumulator == null) {
        if (isArr) {
          accumulator = [];
        } else {
          var ctor = object && object.constructor,
              proto = ctor && ctor.prototype;

          accumulator = baseCreate(proto);
        }
      }
      if (callback) {
        callback = lodash.createCallback(callback, thisArg, 4);
        (isArr ? forEach : forOwn)(object, function(value, index, object) {
          return callback(accumulator, value, index, object);
        });
      }
      return accumulator;
    }

    /**
     * Creates an array composed of the own enumerable property values of `object`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property values.
     * @example
     *
     * _.values({ 'one': 1, 'two': 2, 'three': 3 });
     * // => [1, 2, 3] (property order is not guaranteed across environments)
     */
    function values(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        result[index] = object[props[index]];
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array of elements from the specified indexes, or keys, of the
     * `collection`. Indexes may be specified as individual arguments or as arrays
     * of indexes.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {...(number|number[]|string|string[])} [index] The indexes of `collection`
     *   to retrieve, specified as individual indexes or arrays of indexes.
     * @returns {Array} Returns a new array of elements corresponding to the
     *  provided indexes.
     * @example
     *
     * _.at(['a', 'b', 'c', 'd', 'e'], [0, 2, 4]);
     * // => ['a', 'c', 'e']
     *
     * _.at(['fred', 'barney', 'pebbles'], 0, 2);
     * // => ['fred', 'pebbles']
     */
    function at(collection) {
      var args = arguments,
          index = -1,
          props = baseFlatten(args, true, false, 1),
          length = (args[2] && args[2][args[1]] === collection) ? 1 : props.length,
          result = Array(length);

      while(++index < length) {
        result[index] = collection[props[index]];
      }
      return result;
    }

    /**
     * Checks if a given value is present in a collection using strict equality
     * for comparisons, i.e. `===`. If `fromIndex` is negative, it is used as the
     * offset from the end of the collection.
     *
     * @static
     * @memberOf _
     * @alias include
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {*} target The value to check for.
     * @param {number} [fromIndex=0] The index to search from.
     * @returns {boolean} Returns `true` if the `target` element is found, else `false`.
     * @example
     *
     * _.contains([1, 2, 3], 1);
     * // => true
     *
     * _.contains([1, 2, 3], 1, 2);
     * // => false
     *
     * _.contains({ 'name': 'fred', 'age': 40 }, 'fred');
     * // => true
     *
     * _.contains('pebbles', 'eb');
     * // => true
     */
    function contains(collection, target, fromIndex) {
      var index = -1,
          indexOf = getIndexOf(),
          length = collection ? collection.length : 0,
          result = false;

      fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
      if (isArray(collection)) {
        result = indexOf(collection, target, fromIndex) > -1;
      } else if (typeof length == 'number') {
        result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;
      } else {
        forOwn(collection, function(value) {
          if (++index >= fromIndex) {
            return !(result = value === target);
          }
        });
      }
      return result;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` through the callback. The corresponding value
     * of each key is the number of times the key was returned by the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy(['one', 'two', 'three'], 'length');
     * // => { '3': 2, '5': 1 }
     */
    var countBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key]++ : result[key] = 1);
    });

    /**
     * Checks if the given callback returns truey value for **all** elements of
     * a collection. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias all
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if all elements passed the callback check,
     *  else `false`.
     * @example
     *
     * _.every([true, 1, null, 'yes']);
     * // => false
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.every(characters, 'age');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.every(characters, { 'age': 36 });
     * // => false
     */
    function every(collection, callback, thisArg) {
      var result = true;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if (!(result = !!callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return (result = !!callback(value, index, collection));
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning an array of all elements
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias select
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that passed the callback check.
     * @example
     *
     * var evens = _.filter([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [2, 4, 6]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.filter(characters, 'blocked');
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     *
     * // using "_.where" callback shorthand
     * _.filter(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     */
    function filter(collection, callback, thisArg) {
      var result = [];
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            result.push(value);
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result.push(value);
          }
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning the first element that
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias detect, findWhere
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.find(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => { 'name': 'barney', 'age': 36, 'blocked': false }
     *
     * // using "_.where" callback shorthand
     * _.find(characters, { 'age': 1 });
     * // =>  { 'name': 'pebbles', 'age': 1, 'blocked': false }
     *
     * // using "_.pluck" callback shorthand
     * _.find(characters, 'blocked');
     * // => { 'name': 'fred', 'age': 40, 'blocked': true }
     */
    function find(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            return value;
          }
        }
      } else {
        var result;
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result = value;
            return false;
          }
        });
        return result;
      }
    }

    /**
     * This method is like `_.find` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * _.findLast([1, 2, 3, 4], function(num) {
     *   return num % 2 == 1;
     * });
     * // => 3
     */
    function findLast(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forEachRight(collection, function(value, index, collection) {
        if (callback(value, index, collection)) {
          result = value;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over elements of a collection, executing the callback for each
     * element. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * Note: As with other "Collections" methods, objects with a `length` property
     * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
     * may be used for object iteration.
     *
     * @static
     * @memberOf _
     * @alias each
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
     * // => logs each number and returns '1,2,3'
     *
     * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
     * // => logs each number and returns the object (property order is not guaranteed across environments)
     */
    function forEach(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (++index < length) {
          if (callback(collection[index], index, collection) === false) {
            break;
          }
        }
      } else {
        forOwn(collection, callback);
      }
      return collection;
    }

    /**
     * This method is like `_.forEach` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias eachRight
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEachRight(function(num) { console.log(num); }).join(',');
     * // => logs each number from right to left and returns '3,2,1'
     */
    function forEachRight(collection, callback, thisArg) {
      var length = collection ? collection.length : 0;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (length--) {
          if (callback(collection[length], length, collection) === false) {
            break;
          }
        }
      } else {
        var props = keys(collection);
        length = props.length;
        forOwn(collection, function(value, key, collection) {
          key = props ? props[--length] : --length;
          return callback(collection[key], key, collection);
        });
      }
      return collection;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of a collection through the callback. The corresponding value
     * of each key is an array of the elements responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * // using "_.pluck" callback shorthand
     * _.groupBy(['one', 'two', 'three'], 'length');
     * // => { '3': ['one', 'two'], '5': ['three'] }
     */
    var groupBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(value);
    });

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of the collection through the given callback. The corresponding
     * value of each key is the last element responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * var keys = [
     *   { 'dir': 'left', 'code': 97 },
     *   { 'dir': 'right', 'code': 100 }
     * ];
     *
     * _.indexBy(keys, 'dir');
     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(keys, function(key) { return String.fromCharCode(key.code); });
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(characters, function(key) { this.fromCharCode(key.code); }, String);
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     */
    var indexBy = createAggregator(function(result, value, key) {
      result[key] = value;
    });

    /**
     * Invokes the method named by `methodName` on each element in the `collection`
     * returning an array of the results of each invoked method. Additional arguments
     * will be provided to each invoked method. If `methodName` is a function it
     * will be invoked for, and `this` bound to, each element in the `collection`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|string} methodName The name of the method to invoke or
     *  the function invoked per iteration.
     * @param {...*} [arg] Arguments to invoke the method with.
     * @returns {Array} Returns a new array of the results of each invoked method.
     * @example
     *
     * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
     * // => [[1, 5, 7], [1, 2, 3]]
     *
     * _.invoke([123, 456], String.prototype.split, '');
     * // => [['1', '2', '3'], ['4', '5', '6']]
     */
    function invoke(collection, methodName) {
      var args = slice(arguments, 2),
          index = -1,
          isFunc = typeof methodName == 'function',
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        result[++index] = (isFunc ? methodName : value[methodName]).apply(value, args);
      });
      return result;
    }

    /**
     * Creates an array of values by running each element in the collection
     * through the callback. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias collect
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of the results of each `callback` execution.
     * @example
     *
     * _.map([1, 2, 3], function(num) { return num * 3; });
     * // => [3, 6, 9]
     *
     * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
     * // => [3, 6, 9] (property order is not guaranteed across environments)
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(characters, 'name');
     * // => ['barney', 'fred']
     */
    function map(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        var result = Array(length);
        while (++index < length) {
          result[index] = callback(collection[index], index, collection);
        }
      } else {
        result = [];
        forOwn(collection, function(value, key, collection) {
          result[++index] = callback(value, key, collection);
        });
      }
      return result;
    }

    /**
     * Retrieves the maximum value of a collection. If the collection is empty or
     * falsey `-Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the maximum value.
     * @example
     *
     * _.max([4, 2, 8, 6]);
     * // => 8
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.max(characters, function(chr) { return chr.age; });
     * // => { 'name': 'fred', 'age': 40 };
     *
     * // using "_.pluck" callback shorthand
     * _.max(characters, 'age');
     * // => { 'name': 'fred', 'age': 40 };
     */
    function max(collection, callback, thisArg) {
      var computed = -Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value > result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current > computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the minimum value of a collection. If the collection is empty or
     * falsey `Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the minimum value.
     * @example
     *
     * _.min([4, 2, 8, 6]);
     * // => 2
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.min(characters, function(chr) { return chr.age; });
     * // => { 'name': 'barney', 'age': 36 };
     *
     * // using "_.pluck" callback shorthand
     * _.min(characters, 'age');
     * // => { 'name': 'barney', 'age': 36 };
     */
    function min(collection, callback, thisArg) {
      var computed = Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value < result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current < computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the value of a specified property from all elements in the collection.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {string} property The name of the property to pluck.
     * @returns {Array} Returns a new array of property values.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.pluck(characters, 'name');
     * // => ['barney', 'fred']
     */
    var pluck = map;

    /**
     * Reduces a collection to a value which is the accumulated result of running
     * each element in the collection through the callback, where each successive
     * callback execution consumes the return value of the previous execution. If
     * `accumulator` is not provided the first element of the collection will be
     * used as the initial `accumulator` value. The callback is bound to `thisArg`
     * and invoked with four arguments; (accumulator, value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @alias foldl, inject
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var sum = _.reduce([1, 2, 3], function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * var mapped = _.reduce({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     *   return result;
     * }, {});
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function reduce(collection, callback, accumulator, thisArg) {
      if (!collection) return accumulator;
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);

      var index = -1,
          length = collection.length;

      if (typeof length == 'number') {
        if (noaccum) {
          accumulator = collection[++index];
        }
        while (++index < length) {
          accumulator = callback(accumulator, collection[index], index, collection);
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          accumulator = noaccum
            ? (noaccum = false, value)
            : callback(accumulator, value, index, collection)
        });
      }
      return accumulator;
    }

    /**
     * This method is like `_.reduce` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias foldr
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var list = [[0, 1], [2, 3], [4, 5]];
     * var flat = _.reduceRight(list, function(a, b) { return a.concat(b); }, []);
     * // => [4, 5, 2, 3, 0, 1]
     */
    function reduceRight(collection, callback, accumulator, thisArg) {
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);
      forEachRight(collection, function(value, index, collection) {
        accumulator = noaccum
          ? (noaccum = false, value)
          : callback(accumulator, value, index, collection);
      });
      return accumulator;
    }

    /**
     * The opposite of `_.filter` this method returns the elements of a
     * collection that the callback does **not** return truey for.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that failed the callback check.
     * @example
     *
     * var odds = _.reject([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [1, 3, 5]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.reject(characters, 'blocked');
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     *
     * // using "_.where" callback shorthand
     * _.reject(characters, { 'age': 36 });
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     */
    function reject(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);
      return filter(collection, function(value, index, collection) {
        return !callback(value, index, collection);
      });
    }

    /**
     * Retrieves a random element or `n` random elements from a collection.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to sample.
     * @param {number} [n] The number of elements to sample.
     * @param- {Object} [guard] Allows working with functions like `_.map`
     *  without using their `index` arguments as `n`.
     * @returns {Array} Returns the random sample(s) of `collection`.
     * @example
     *
     * _.sample([1, 2, 3, 4]);
     * // => 2
     *
     * _.sample([1, 2, 3, 4], 2);
     * // => [3, 1]
     */
    function sample(collection, n, guard) {
      if (collection && typeof collection.length != 'number') {
        collection = values(collection);
      }
      if (n == null || guard) {
        return collection ? collection[baseRandom(0, collection.length - 1)] : undefined;
      }
      var result = shuffle(collection);
      result.length = nativeMin(nativeMax(0, n), result.length);
      return result;
    }

    /**
     * Creates an array of shuffled values, using a version of the Fisher-Yates
     * shuffle. See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to shuffle.
     * @returns {Array} Returns a new shuffled collection.
     * @example
     *
     * _.shuffle([1, 2, 3, 4, 5, 6]);
     * // => [4, 1, 6, 3, 5, 2]
     */
    function shuffle(collection) {
      var index = -1,
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        var rand = baseRandom(0, ++index);
        result[index] = result[rand];
        result[rand] = value;
      });
      return result;
    }

    /**
     * Gets the size of the `collection` by returning `collection.length` for arrays
     * and array-like objects or the number of own enumerable properties for objects.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to inspect.
     * @returns {number} Returns `collection.length` or number of own enumerable properties.
     * @example
     *
     * _.size([1, 2]);
     * // => 2
     *
     * _.size({ 'one': 1, 'two': 2, 'three': 3 });
     * // => 3
     *
     * _.size('pebbles');
     * // => 7
     */
    function size(collection) {
      var length = collection ? collection.length : 0;
      return typeof length == 'number' ? length : keys(collection).length;
    }

    /**
     * Checks if the callback returns a truey value for **any** element of a
     * collection. The function returns as soon as it finds a passing value and
     * does not iterate over the entire collection. The callback is bound to
     * `thisArg` and invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias any
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if any element passed the callback check,
     *  else `false`.
     * @example
     *
     * _.some([null, 0, 'yes', false], Boolean);
     * // => true
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.some(characters, 'blocked');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.some(characters, { 'age': 1 });
     * // => false
     */
    function some(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if ((result = callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return !(result = callback(value, index, collection));
        });
      }
      return !!result;
    }

    /**
     * Creates an array of elements, sorted in ascending order by the results of
     * running each element in a collection through the callback. This method
     * performs a stable sort, that is, it will preserve the original sort order
     * of equal elements. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an array of property names is provided for `callback` the collection
     * will be sorted by each property value.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Array|Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of sorted elements.
     * @example
     *
     * _.sortBy([1, 2, 3], function(num) { return Math.sin(num); });
     * // => [3, 1, 2]
     *
     * _.sortBy([1, 2, 3], function(num) { return this.sin(num); }, Math);
     * // => [3, 1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'barney',  'age': 26 },
     *   { 'name': 'fred',    'age': 30 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(_.sortBy(characters, 'age'), _.values);
     * // => [['barney', 26], ['fred', 30], ['barney', 36], ['fred', 40]]
     *
     * // sorting by multiple properties
     * _.map(_.sortBy(characters, ['name', 'age']), _.values);
     * // = > [['barney', 26], ['barney', 36], ['fred', 30], ['fred', 40]]
     */
    function sortBy(collection, callback, thisArg) {
      var index = -1,
          isArr = isArray(callback),
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      if (!isArr) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      forEach(collection, function(value, key, collection) {
        var object = result[++index] = getObject();
        if (isArr) {
          object.criteria = map(callback, function(key) { return value[key]; });
        } else {
          (object.criteria = getArray())[0] = callback(value, key, collection);
        }
        object.index = index;
        object.value = value;
      });

      length = result.length;
      result.sort(compareAscending);
      while (length--) {
        var object = result[length];
        result[length] = object.value;
        if (!isArr) {
          releaseArray(object.criteria);
        }
        releaseObject(object);
      }
      return result;
    }

    /**
     * Converts the `collection` to an array.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to convert.
     * @returns {Array} Returns the new converted array.
     * @example
     *
     * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);
     * // => [2, 3, 4]
     */
    function toArray(collection) {
      if (collection && typeof collection.length == 'number') {
        return slice(collection);
      }
      return values(collection);
    }

    /**
     * Performs a deep comparison of each element in a `collection` to the given
     * `properties` object, returning an array of all elements that have equivalent
     * property values.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Object} props The object of property values to filter by.
     * @returns {Array} Returns a new array of elements that have the given properties.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * _.where(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'pets': ['hoppy'] }]
     *
     * _.where(characters, { 'pets': ['dino'] });
     * // => [{ 'name': 'fred', 'age': 40, 'pets': ['baby puss', 'dino'] }]
     */
    var where = filter;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array with all falsey values removed. The values `false`, `null`,
     * `0`, `""`, `undefined`, and `NaN` are all falsey.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to compact.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.compact([0, 1, false, 2, '', 3]);
     * // => [1, 2, 3]
     */
    function compact(array) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (value) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * Creates an array excluding all values of the provided arrays using strict
     * equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {...Array} [values] The arrays of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.difference([1, 2, 3, 4, 5], [5, 2, 10]);
     * // => [1, 3, 4]
     */
    function difference(array) {
      return baseDifference(array, baseFlatten(arguments, true, true, 1));
    }

    /**
     * This method is like `_.find` except that it returns the index of the first
     * element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.findIndex(characters, function(chr) {
     *   return chr.age < 20;
     * });
     * // => 2
     *
     * // using "_.where" callback shorthand
     * _.findIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findIndex(characters, 'blocked');
     * // => 1
     */
    function findIndex(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        if (callback(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * This method is like `_.findIndex` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': true },
     *   { 'name': 'fred',    'age': 40, 'blocked': false },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': true }
     * ];
     *
     * _.findLastIndex(characters, function(chr) {
     *   return chr.age > 30;
     * });
     * // => 1
     *
     * // using "_.where" callback shorthand
     * _.findLastIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findLastIndex(characters, 'blocked');
     * // => 2
     */
    function findLastIndex(array, callback, thisArg) {
      var length = array ? array.length : 0;
      callback = lodash.createCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(array[length], length, array)) {
          return length;
        }
      }
      return -1;
    }

    /**
     * Gets the first element or first `n` elements of an array. If a callback
     * is provided elements at the beginning of the array are returned as long
     * as the callback returns truey. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias head, take
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the first element(s) of `array`.
     * @example
     *
     * _.first([1, 2, 3]);
     * // => 1
     *
     * _.first([1, 2, 3], 2);
     * // => [1, 2]
     *
     * _.first([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false, 'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.first(characters, 'blocked');
     * // => [{ 'name': 'barney', 'blocked': true, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.first(characters, { 'employer': 'slate' }), 'name');
     * // => ['barney', 'fred']
     */
    function first(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = -1;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[0] : undefined;
        }
      }
      return slice(array, 0, nativeMin(nativeMax(0, n), length));
    }

    /**
     * Flattens a nested array (the nesting can be to any depth). If `isShallow`
     * is truey, the array will only be flattened a single level. If a callback
     * is provided each element of the array is passed through the callback before
     * flattening. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new flattened array.
     * @example
     *
     * _.flatten([1, [2], [3, [[4]]]]);
     * // => [1, 2, 3, 4];
     *
     * _.flatten([1, [2], [3, [[4]]]], true);
     * // => [1, 2, 3, [[4]]];
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 30, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.flatten(characters, 'pets');
     * // => ['hoppy', 'baby puss', 'dino']
     */
    function flatten(array, isShallow, callback, thisArg) {
      // juggle arguments
      if (typeof isShallow != 'boolean' && isShallow != null) {
        thisArg = callback;
        callback = (typeof isShallow != 'function' && thisArg && thisArg[isShallow] === array) ? null : isShallow;
        isShallow = false;
      }
      if (callback != null) {
        array = map(array, callback, thisArg);
      }
      return baseFlatten(array, isShallow);
    }

    /**
     * Gets the index at which the first occurrence of `value` is found using
     * strict equality for comparisons, i.e. `===`. If the array is already sorted
     * providing `true` for `fromIndex` will run a faster binary search.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {boolean|number} [fromIndex=0] The index to search from or `true`
     *  to perform a binary search on a sorted array.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 1
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 4
     *
     * _.indexOf([1, 1, 2, 2, 3, 3], 2, true);
     * // => 2
     */
    function indexOf(array, value, fromIndex) {
      if (typeof fromIndex == 'number') {
        var length = array ? array.length : 0;
        fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex || 0);
      } else if (fromIndex) {
        var index = sortedIndex(array, value);
        return array[index] === value ? index : -1;
      }
      return baseIndexOf(array, value, fromIndex);
    }

    /**
     * Gets all but the last element or last `n` elements of an array. If a
     * callback is provided elements at the end of the array are excluded from
     * the result as long as the callback returns truey. The callback is bound
     * to `thisArg` and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.initial([1, 2, 3]);
     * // => [1, 2]
     *
     * _.initial([1, 2, 3], 2);
     * // => [1]
     *
     * _.initial([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [1]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.initial(characters, 'blocked');
     * // => [{ 'name': 'barney',  'blocked': false, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.initial(characters, { 'employer': 'na' }), 'name');
     * // => ['barney', 'fred']
     */
    function initial(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : callback || n;
      }
      return slice(array, 0, nativeMin(nativeMax(0, length - n), length));
    }

    /**
     * Creates an array of unique values present in all provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of shared values.
     * @example
     *
     * _.intersection([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2]
     */
    function intersection() {
      var args = [],
          argsIndex = -1,
          argsLength = arguments.length,
          caches = getArray(),
          indexOf = getIndexOf(),
          trustIndexOf = indexOf === baseIndexOf,
          seen = getArray();

      while (++argsIndex < argsLength) {
        var value = arguments[argsIndex];
        if (isArray(value) || isArguments(value)) {
          args.push(value);
          caches.push(trustIndexOf && value.length >= largeArraySize &&
            createCache(argsIndex ? args[argsIndex] : seen));
        }
      }
      var array = args[0],
          index = -1,
          length = array ? array.length : 0,
          result = [];

      outer:
      while (++index < length) {
        var cache = caches[0];
        value = array[index];

        if ((cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {
          argsIndex = argsLength;
          (cache || seen).push(value);
          while (--argsIndex) {
            cache = caches[argsIndex];
            if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {
              continue outer;
            }
          }
          result.push(value);
        }
      }
      while (argsLength--) {
        cache = caches[argsLength];
        if (cache) {
          releaseObject(cache);
        }
      }
      releaseArray(caches);
      releaseArray(seen);
      return result;
    }

    /**
     * Gets the last element or last `n` elements of an array. If a callback is
     * provided elements at the end of the array are returned as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the last element(s) of `array`.
     * @example
     *
     * _.last([1, 2, 3]);
     * // => 3
     *
     * _.last([1, 2, 3], 2);
     * // => [2, 3]
     *
     * _.last([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [2, 3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.last(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.last(characters, { 'employer': 'na' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function last(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[length - 1] : undefined;
        }
      }
      return slice(array, nativeMax(0, length - n));
    }

    /**
     * Gets the index at which the last occurrence of `value` is found using strict
     * equality for comparisons, i.e. `===`. If `fromIndex` is negative, it is used
     * as the offset from the end of the collection.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=array.length-1] The index to search from.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 4
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 1
     */
    function lastIndexOf(array, value, fromIndex) {
      var index = array ? array.length : 0;
      if (typeof fromIndex == 'number') {
        index = (fromIndex < 0 ? nativeMax(0, index + fromIndex) : nativeMin(fromIndex, index - 1)) + 1;
      }
      while (index--) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * Removes all provided values from the given array using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {...*} [value] The values to remove.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [1, 2, 3, 1, 2, 3];
     * _.pull(array, 2, 3);
     * console.log(array);
     * // => [1, 1]
     */
    function pull(array) {
      var args = arguments,
          argsIndex = 0,
          argsLength = args.length,
          length = array ? array.length : 0;

      while (++argsIndex < argsLength) {
        var index = -1,
            value = args[argsIndex];
        while (++index < length) {
          if (array[index] === value) {
            splice.call(array, index--, 1);
            length--;
          }
        }
      }
      return array;
    }

    /**
     * Creates an array of numbers (positive and/or negative) progressing from
     * `start` up to but not including `end`. If `start` is less than `stop` a
     * zero-length range is created unless a negative `step` is specified.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @param {number} [step=1] The value to increment or decrement by.
     * @returns {Array} Returns a new range array.
     * @example
     *
     * _.range(4);
     * // => [0, 1, 2, 3]
     *
     * _.range(1, 5);
     * // => [1, 2, 3, 4]
     *
     * _.range(0, 20, 5);
     * // => [0, 5, 10, 15]
     *
     * _.range(0, -4, -1);
     * // => [0, -1, -2, -3]
     *
     * _.range(1, 4, 0);
     * // => [1, 1, 1]
     *
     * _.range(0);
     * // => []
     */
    function range(start, end, step) {
      start = +start || 0;
      step = typeof step == 'number' ? step : (+step || 1);

      if (end == null) {
        end = start;
        start = 0;
      }
      // use `Array(length)` so engines like Chakra and V8 avoid slower modes
      // http://youtu.be/XAqIpGU8ZZk#t=17m25s
      var index = -1,
          length = nativeMax(0, ceil((end - start) / (step || 1))),
          result = Array(length);

      while (++index < length) {
        result[index] = start;
        start += step;
      }
      return result;
    }

    /**
     * Removes all elements from an array that the callback returns truey for
     * and returns an array of removed elements. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of removed elements.
     * @example
     *
     * var array = [1, 2, 3, 4, 5, 6];
     * var evens = _.remove(array, function(num) { return num % 2 == 0; });
     *
     * console.log(array);
     * // => [1, 3, 5]
     *
     * console.log(evens);
     * // => [2, 4, 6]
     */
    function remove(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        var value = array[index];
        if (callback(value, index, array)) {
          result.push(value);
          splice.call(array, index--, 1);
          length--;
        }
      }
      return result;
    }

    /**
     * The opposite of `_.initial` this method gets all but the first element or
     * first `n` elements of an array. If a callback function is provided elements
     * at the beginning of the array are excluded from the result as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias drop, tail
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.rest([1, 2, 3]);
     * // => [2, 3]
     *
     * _.rest([1, 2, 3], 2);
     * // => [3]
     *
     * _.rest([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true, 'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.rest(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.rest(characters, { 'employer': 'slate' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function rest(array, callback, thisArg) {
      if (typeof callback != 'number' && callback != null) {
        var n = 0,
            index = -1,
            length = array ? array.length : 0;

        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : nativeMax(0, callback);
      }
      return slice(array, n);
    }

    /**
     * Uses a binary search to determine the smallest index at which a value
     * should be inserted into a given sorted array in order to maintain the sort
     * order of the array. If a callback is provided it will be executed for
     * `value` and each element of `array` to compute their sort ranking. The
     * callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * _.sortedIndex([20, 30, 50], 40);
     * // => 2
     *
     * // using "_.pluck" callback shorthand
     * _.sortedIndex([{ 'x': 20 }, { 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
     * // => 2
     *
     * var dict = {
     *   'wordToNumber': { 'twenty': 20, 'thirty': 30, 'fourty': 40, 'fifty': 50 }
     * };
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return dict.wordToNumber[word];
     * });
     * // => 2
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return this.wordToNumber[word];
     * }, dict);
     * // => 2
     */
    function sortedIndex(array, value, callback, thisArg) {
      var low = 0,
          high = array ? array.length : low;

      // explicitly reference `identity` for better inlining in Firefox
      callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity;
      value = callback(value);

      while (low < high) {
        var mid = (low + high) >>> 1;
        (callback(array[mid]) < value)
          ? low = mid + 1
          : high = mid;
      }
      return low;
    }

    /**
     * Creates an array of unique values, in order, of the provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of combined values.
     * @example
     *
     * _.union([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2, 3, 5, 4]
     */
    function union() {
      return baseUniq(baseFlatten(arguments, true, true));
    }

    /**
     * Creates a duplicate-value-free version of an array using strict equality
     * for comparisons, i.e. `===`. If the array is sorted, providing
     * `true` for `isSorted` will use a faster algorithm. If a callback is provided
     * each element of `array` is passed through the callback before uniqueness
     * is computed. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias unique
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a duplicate-value-free array.
     * @example
     *
     * _.uniq([1, 2, 1, 3, 1]);
     * // => [1, 2, 3]
     *
     * _.uniq([1, 1, 2, 2, 3], true);
     * // => [1, 2, 3]
     *
     * _.uniq(['A', 'b', 'C', 'a', 'B', 'c'], function(letter) { return letter.toLowerCase(); });
     * // => ['A', 'b', 'C']
     *
     * _.uniq([1, 2.5, 3, 1.5, 2, 3.5], function(num) { return this.floor(num); }, Math);
     * // => [1, 2.5, 3]
     *
     * // using "_.pluck" callback shorthand
     * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 1 }, { 'x': 2 }]
     */
    function uniq(array, isSorted, callback, thisArg) {
      // juggle arguments
      if (typeof isSorted != 'boolean' && isSorted != null) {
        thisArg = callback;
        callback = (typeof isSorted != 'function' && thisArg && thisArg[isSorted] === array) ? null : isSorted;
        isSorted = false;
      }
      if (callback != null) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      return baseUniq(array, isSorted, callback);
    }

    /**
     * Creates an array excluding all provided values using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to filter.
     * @param {...*} [value] The values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.without([1, 2, 1, 0, 3, 1, 4], 0, 1);
     * // => [2, 3, 4]
     */
    function without(array) {
      return baseDifference(array, slice(arguments, 1));
    }

    /**
     * Creates an array that is the symmetric difference of the provided arrays.
     * See http://en.wikipedia.org/wiki/Symmetric_difference.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of values.
     * @example
     *
     * _.xor([1, 2, 3], [5, 2, 1, 4]);
     * // => [3, 5, 4]
     *
     * _.xor([1, 2, 5], [2, 3, 5], [3, 4, 5]);
     * // => [1, 4, 5]
     */
    function xor() {
      var index = -1,
          length = arguments.length;

      while (++index < length) {
        var array = arguments[index];
        if (isArray(array) || isArguments(array)) {
          var result = result
            ? baseUniq(baseDifference(result, array).concat(baseDifference(array, result)))
            : array;
        }
      }
      return result || [];
    }

    /**
     * Creates an array of grouped elements, the first of which contains the first
     * elements of the given arrays, the second of which contains the second
     * elements of the given arrays, and so on.
     *
     * @static
     * @memberOf _
     * @alias unzip
     * @category Arrays
     * @param {...Array} [array] Arrays to process.
     * @returns {Array} Returns a new array of grouped elements.
     * @example
     *
     * _.zip(['fred', 'barney'], [30, 40], [true, false]);
     * // => [['fred', 30, true], ['barney', 40, false]]
     */
    function zip() {
      var array = arguments.length > 1 ? arguments : arguments[0],
          index = -1,
          length = array ? max(pluck(array, 'length')) : 0,
          result = Array(length < 0 ? 0 : length);

      while (++index < length) {
        result[index] = pluck(array, index);
      }
      return result;
    }

    /**
     * Creates an object composed from arrays of `keys` and `values`. Provide
     * either a single two dimensional array, i.e. `[[key1, value1], [key2, value2]]`
     * or two arrays, one of `keys` and one of corresponding `values`.
     *
     * @static
     * @memberOf _
     * @alias object
     * @category Arrays
     * @param {Array} keys The array of keys.
     * @param {Array} [values=[]] The array of values.
     * @returns {Object} Returns an object composed of the given keys and
     *  corresponding values.
     * @example
     *
     * _.zipObject(['fred', 'barney'], [30, 40]);
     * // => { 'fred': 30, 'barney': 40 }
     */
    function zipObject(keys, values) {
      var index = -1,
          length = keys ? keys.length : 0,
          result = {};

      if (!values && length && !isArray(keys[0])) {
        values = [];
      }
      while (++index < length) {
        var key = keys[index];
        if (values) {
          result[key] = values[index];
        } else if (key) {
          result[key[0]] = key[1];
        }
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that executes `func`, with  the `this` binding and
     * arguments of the created function, only after being called `n` times.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {number} n The number of times the function must be called before
     *  `func` is executed.
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var saves = ['profile', 'settings'];
     *
     * var done = _.after(saves.length, function() {
     *   console.log('Done saving!');
     * });
     *
     * _.forEach(saves, function(type) {
     *   asyncSave({ 'type': type, 'complete': done });
     * });
     * // => logs 'Done saving!', after all saves have completed
     */
    function after(n, func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (--n < 1) {
          return func.apply(this, arguments);
        }
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with the `this`
     * binding of `thisArg` and prepends any additional `bind` arguments to those
     * provided to the bound function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to bind.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var func = function(greeting) {
     *   return greeting + ' ' + this.name;
     * };
     *
     * func = _.bind(func, { 'name': 'fred' }, 'hi');
     * func();
     * // => 'hi fred'
     */
    function bind(func, thisArg) {
      return arguments.length > 2
        ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
        : createWrapper(func, 1, null, null, thisArg);
    }

    /**
     * Binds methods of an object to the object itself, overwriting the existing
     * method. Method names may be specified as individual arguments or as arrays
     * of method names. If no method names are provided all the function properties
     * of `object` will be bound.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object to bind and assign the bound methods to.
     * @param {...string} [methodName] The object method names to
     *  bind, specified as individual method names or arrays of method names.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var view = {
     *   'label': 'docs',
     *   'onClick': function() { console.log('clicked ' + this.label); }
     * };
     *
     * _.bindAll(view);
     * jQuery('#docs').on('click', view.onClick);
     * // => logs 'clicked docs', when the button is clicked
     */
    function bindAll(object) {
      var funcs = arguments.length > 1 ? baseFlatten(arguments, true, false, 1) : functions(object),
          index = -1,
          length = funcs.length;

      while (++index < length) {
        var key = funcs[index];
        object[key] = createWrapper(object[key], 1, null, null, object);
      }
      return object;
    }

    /**
     * Creates a function that, when called, invokes the method at `object[key]`
     * and prepends any additional `bindKey` arguments to those provided to the bound
     * function. This method differs from `_.bind` by allowing bound functions to
     * reference methods that will be redefined or don't yet exist.
     * See http://michaux.ca/articles/lazy-function-definition-pattern.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object the method belongs to.
     * @param {string} key The key of the method.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var object = {
     *   'name': 'fred',
     *   'greet': function(greeting) {
     *     return greeting + ' ' + this.name;
     *   }
     * };
     *
     * var func = _.bindKey(object, 'greet', 'hi');
     * func();
     * // => 'hi fred'
     *
     * object.greet = function(greeting) {
     *   return greeting + 'ya ' + this.name + '!';
     * };
     *
     * func();
     * // => 'hiya fred!'
     */
    function bindKey(object, key) {
      return arguments.length > 2
        ? createWrapper(key, 19, slice(arguments, 2), null, object)
        : createWrapper(key, 3, null, null, object);
    }

    /**
     * Creates a function that is the composition of the provided functions,
     * where each function consumes the return value of the function that follows.
     * For example, composing the functions `f()`, `g()`, and `h()` produces `f(g(h()))`.
     * Each function is executed with the `this` binding of the composed function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {...Function} [func] Functions to compose.
     * @returns {Function} Returns the new composed function.
     * @example
     *
     * var realNameMap = {
     *   'pebbles': 'penelope'
     * };
     *
     * var format = function(name) {
     *   name = realNameMap[name.toLowerCase()] || name;
     *   return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
     * };
     *
     * var greet = function(formatted) {
     *   return 'Hiya ' + formatted + '!';
     * };
     *
     * var welcome = _.compose(greet, format);
     * welcome('pebbles');
     * // => 'Hiya Penelope!'
     */
    function compose() {
      var funcs = arguments,
          length = funcs.length;

      while (length--) {
        if (!isFunction(funcs[length])) {
          throw new TypeError;
        }
      }
      return function() {
        var args = arguments,
            length = funcs.length;

        while (length--) {
          args = [funcs[length].apply(this, args)];
        }
        return args[0];
      };
    }

    /**
     * Creates a function which accepts one or more arguments of `func` that when
     * invoked either executes `func` returning its result, if all `func` arguments
     * have been provided, or returns a function that accepts one or more of the
     * remaining `func` arguments, and so on. The arity of `func` can be specified
     * if `func.length` is not sufficient.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to curry.
     * @param {number} [arity=func.length] The arity of `func`.
     * @returns {Function} Returns the new curried function.
     * @example
     *
     * var curried = _.curry(function(a, b, c) {
     *   console.log(a + b + c);
     * });
     *
     * curried(1)(2)(3);
     * // => 6
     *
     * curried(1, 2)(3);
     * // => 6
     *
     * curried(1, 2, 3);
     * // => 6
     */
    function curry(func, arity) {
      arity = typeof arity == 'number' ? arity : (+arity || func.length);
      return createWrapper(func, 4, null, null, null, arity);
    }

    /**
     * Creates a function that will delay the execution of `func` until after
     * `wait` milliseconds have elapsed since the last time it was invoked.
     * Provide an options object to indicate that `func` should be invoked on
     * the leading and/or trailing edge of the `wait` timeout. Subsequent calls
     * to the debounced function will return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the debounced function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to debounce.
     * @param {number} wait The number of milliseconds to delay.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=false] Specify execution on the leading edge of the timeout.
     * @param {number} [options.maxWait] The maximum time `func` is allowed to be delayed before it's called.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new debounced function.
     * @example
     *
     * // avoid costly calculations while the window size is in flux
     * var lazyLayout = _.debounce(calculateLayout, 150);
     * jQuery(window).on('resize', lazyLayout);
     *
     * // execute `sendMail` when the click event is fired, debouncing subsequent calls
     * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * });
     *
     * // ensure `batchLog` is executed once after 1 second of debounced calls
     * var source = new EventSource('/stream');
     * source.addEventListener('message', _.debounce(batchLog, 250, {
     *   'maxWait': 1000
     * }, false);
     */
    function debounce(func, wait, options) {
      var args,
          maxTimeoutId,
          result,
          stamp,
          thisArg,
          timeoutId,
          trailingCall,
          lastCalled = 0,
          maxWait = false,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      wait = nativeMax(0, wait) || 0;
      if (options === true) {
        var leading = true;
        trailing = false;
      } else if (isObject(options)) {
        leading = options.leading;
        maxWait = 'maxWait' in options && (nativeMax(wait, options.maxWait) || 0);
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      var delayed = function() {
        var remaining = wait - (now() - stamp);
        if (remaining <= 0) {
          if (maxTimeoutId) {
            clearTimeout(maxTimeoutId);
          }
          var isCalled = trailingCall;
          maxTimeoutId = timeoutId = trailingCall = undefined;
          if (isCalled) {
            lastCalled = now();
            result = func.apply(thisArg, args);
            if (!timeoutId && !maxTimeoutId) {
              args = thisArg = null;
            }
          }
        } else {
          timeoutId = setTimeout(delayed, remaining);
        }
      };

      var maxDelayed = function() {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        maxTimeoutId = timeoutId = trailingCall = undefined;
        if (trailing || (maxWait !== wait)) {
          lastCalled = now();
          result = func.apply(thisArg, args);
          if (!timeoutId && !maxTimeoutId) {
            args = thisArg = null;
          }
        }
      };

      return function() {
        args = arguments;
        stamp = now();
        thisArg = this;
        trailingCall = trailing && (timeoutId || !leading);

        if (maxWait === false) {
          var leadingCall = leading && !timeoutId;
        } else {
          if (!maxTimeoutId && !leading) {
            lastCalled = stamp;
          }
          var remaining = maxWait - (stamp - lastCalled),
              isCalled = remaining <= 0;

          if (isCalled) {
            if (maxTimeoutId) {
              maxTimeoutId = clearTimeout(maxTimeoutId);
            }
            lastCalled = stamp;
            result = func.apply(thisArg, args);
          }
          else if (!maxTimeoutId) {
            maxTimeoutId = setTimeout(maxDelayed, remaining);
          }
        }
        if (isCalled && timeoutId) {
          timeoutId = clearTimeout(timeoutId);
        }
        else if (!timeoutId && wait !== maxWait) {
          timeoutId = setTimeout(delayed, wait);
        }
        if (leadingCall) {
          isCalled = true;
          result = func.apply(thisArg, args);
        }
        if (isCalled && !timeoutId && !maxTimeoutId) {
          args = thisArg = null;
        }
        return result;
      };
    }

    /**
     * Defers executing the `func` function until the current call stack has cleared.
     * Additional arguments will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to defer.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.defer(function(text) { console.log(text); }, 'deferred');
     * // logs 'deferred' after one or more milliseconds
     */
    function defer(func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 1);
      return setTimeout(function() { func.apply(undefined, args); }, 1);
    }

    /**
     * Executes the `func` function after `wait` milliseconds. Additional arguments
     * will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay execution.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.delay(function(text) { console.log(text); }, 1000, 'later');
     * // => logs 'later' after one second
     */
    function delay(func, wait) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 2);
      return setTimeout(function() { func.apply(undefined, args); }, wait);
    }

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided it will be used to determine the cache key for storing the result
     * based on the arguments provided to the memoized function. By default, the
     * first argument provided to the memoized function is used as the cache key.
     * The `func` is executed with the `this` binding of the memoized function.
     * The result cache is exposed as the `cache` property on the memoized function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] A function used to resolve the cache key.
     * @returns {Function} Returns the new memoizing function.
     * @example
     *
     * var fibonacci = _.memoize(function(n) {
     *   return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
     * });
     *
     * fibonacci(9)
     * // => 34
     *
     * var data = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // modifying the result cache
     * var get = _.memoize(function(name) { return data[name]; }, _.identity);
     * get('pebbles');
     * // => { 'name': 'pebbles', 'age': 1 }
     *
     * get.cache.pebbles.name = 'penelope';
     * get('pebbles');
     * // => { 'name': 'penelope', 'age': 1 }
     */
    function memoize(func, resolver) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var memoized = function() {
        var cache = memoized.cache,
            key = resolver ? resolver.apply(this, arguments) : keyPrefix + arguments[0];

        return hasOwnProperty.call(cache, key)
          ? cache[key]
          : (cache[key] = func.apply(this, arguments));
      }
      memoized.cache = {};
      return memoized;
    }

    /**
     * Creates a function that is restricted to execute `func` once. Repeat calls to
     * the function will return the value of the first call. The `func` is executed
     * with the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var initialize = _.once(createApplication);
     * initialize();
     * initialize();
     * // `initialize` executes `createApplication` once
     */
    function once(func) {
      var ran,
          result;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (ran) {
          return result;
        }
        ran = true;
        result = func.apply(this, arguments);

        // clear the `func` variable so the function may be garbage collected
        func = null;
        return result;
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with any additional
     * `partial` arguments prepended to those provided to the new function. This
     * method is similar to `_.bind` except it does **not** alter the `this` binding.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var greet = function(greeting, name) { return greeting + ' ' + name; };
     * var hi = _.partial(greet, 'hi');
     * hi('fred');
     * // => 'hi fred'
     */
    function partial(func) {
      return createWrapper(func, 16, slice(arguments, 1));
    }

    /**
     * This method is like `_.partial` except that `partial` arguments are
     * appended to those provided to the new function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var defaultsDeep = _.partialRight(_.merge, _.defaults);
     *
     * var options = {
     *   'variable': 'data',
     *   'imports': { 'jq': $ }
     * };
     *
     * defaultsDeep(options, _.templateSettings);
     *
     * options.variable
     * // => 'data'
     *
     * options.imports
     * // => { '_': _, 'jq': $ }
     */
    function partialRight(func) {
      return createWrapper(func, 32, null, slice(arguments, 1));
    }

    /**
     * Creates a function that, when executed, will only call the `func` function
     * at most once per every `wait` milliseconds. Provide an options object to
     * indicate that `func` should be invoked on the leading and/or trailing edge
     * of the `wait` timeout. Subsequent calls to the throttled function will
     * return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the throttled function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to throttle.
     * @param {number} wait The number of milliseconds to throttle executions to.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=true] Specify execution on the leading edge of the timeout.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new throttled function.
     * @example
     *
     * // avoid excessively updating the position while scrolling
     * var throttled = _.throttle(updatePosition, 100);
     * jQuery(window).on('scroll', throttled);
     *
     * // execute `renewToken` when the click event is fired, but not more than once every 5 minutes
     * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
     *   'trailing': false
     * }));
     */
    function throttle(func, wait, options) {
      var leading = true,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      if (options === false) {
        leading = false;
      } else if (isObject(options)) {
        leading = 'leading' in options ? options.leading : leading;
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      debounceOptions.leading = leading;
      debounceOptions.maxWait = wait;
      debounceOptions.trailing = trailing;

      return debounce(func, wait, debounceOptions);
    }

    /**
     * Creates a function that provides `value` to the wrapper function as its
     * first argument. Additional arguments provided to the function are appended
     * to those provided to the wrapper function. The wrapper is executed with
     * the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {*} value The value to wrap.
     * @param {Function} wrapper The wrapper function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var p = _.wrap(_.escape, function(func, text) {
     *   return '<p>' + func(text) + '</p>';
     * });
     *
     * p('Fred, Wilma, & Pebbles');
     * // => '<p>Fred, Wilma, &amp; Pebbles</p>'
     */
    function wrap(value, wrapper) {
      return createWrapper(wrapper, 16, [value]);
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var getter = _.constant(object);
     * getter() === object;
     * // => true
     */
    function constant(value) {
      return function() {
        return value;
      };
    }

    /**
     * Produces a callback bound to an optional `thisArg`. If `func` is a property
     * name the created callback will return the property value for a given element.
     * If `func` is an object the created callback will return `true` for elements
     * that contain the equivalent object properties, otherwise it will return `false`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // wrap to create custom callback shorthands
     * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
     *   return !match ? func(callback, thisArg) : function(object) {
     *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
     *   };
     * });
     *
     * _.filter(characters, 'age__gt38');
     * // => [{ 'name': 'fred', 'age': 40 }]
     */
    function createCallback(func, thisArg, argCount) {
      var type = typeof func;
      if (func == null || type == 'function') {
        return baseCreateCallback(func, thisArg, argCount);
      }
      // handle "_.pluck" style callback shorthands
      if (type != 'object') {
        return property(func);
      }
      var props = keys(func),
          key = props[0],
          a = func[key];

      // handle "_.where" style callback shorthands
      if (props.length == 1 && a === a && !isObject(a)) {
        // fast path the common case of providing an object with a single
        // property containing a primitive value
        return function(object) {
          var b = object[key];
          return a === b && (a !== 0 || (1 / a == 1 / b));
        };
      }
      return function(object) {
        var length = props.length,
            result = false;

        while (length--) {
          if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
            break;
          }
        }
        return result;
      };
    }

    /**
     * Converts the characters `&`, `<`, `>`, `"`, and `'` in `string` to their
     * corresponding HTML entities.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * _.escape('Fred, Wilma, & Pebbles');
     * // => 'Fred, Wilma, &amp; Pebbles'
     */
    function escape(string) {
      return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);
    }

    /**
     * This method returns the first argument provided to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.identity(object) === object;
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * Adds function properties of a source object to the destination object.
     * If `object` is a function methods will be added to its prototype as well.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Function|Object} [object=lodash] object The destination object.
     * @param {Object} source The object of functions to add.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.chain=true] Specify whether the functions added are chainable.
     * @example
     *
     * function capitalize(string) {
     *   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
     * }
     *
     * _.mixin({ 'capitalize': capitalize });
     * _.capitalize('fred');
     * // => 'Fred'
     *
     * _('fred').capitalize().value();
     * // => 'Fred'
     *
     * _.mixin({ 'capitalize': capitalize }, { 'chain': false });
     * _('fred').capitalize();
     * // => 'Fred'
     */
    function mixin(object, source, options) {
      var chain = true,
          methodNames = source && functions(source);

      if (!source || (!options && !methodNames.length)) {
        if (options == null) {
          options = source;
        }
        ctor = lodashWrapper;
        source = object;
        object = lodash;
        methodNames = functions(source);
      }
      if (options === false) {
        chain = false;
      } else if (isObject(options) && 'chain' in options) {
        chain = options.chain;
      }
      var ctor = object,
          isFunc = isFunction(ctor);

      forEach(methodNames, function(methodName) {
        var func = object[methodName] = source[methodName];
        if (isFunc) {
          ctor.prototype[methodName] = function() {
            var chainAll = this.__chain__,
                value = this.__wrapped__,
                args = [value];

            push.apply(args, arguments);
            var result = func.apply(object, args);
            if (chain || chainAll) {
              if (value === result && isObject(result)) {
                return this;
              }
              result = new ctor(result);
              result.__chain__ = chainAll;
            }
            return result;
          };
        }
      });
    }

    /**
     * Reverts the '_' variable to its previous value and returns a reference to
     * the `lodash` function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @returns {Function} Returns the `lodash` function.
     * @example
     *
     * var lodash = _.noConflict();
     */
    function noConflict() {
      context._ = oldDash;
      return this;
    }

    /**
     * A no-operation function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.noop(object) === undefined;
     * // => true
     */
    function noop() {
      // no operation performed
    }

    /**
     * Gets the number of milliseconds that have elapsed since the Unix epoch
     * (1 January 1970 00:00:00 UTC).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var stamp = _.now();
     * _.defer(function() { console.log(_.now() - stamp); });
     * // => logs the number of milliseconds it took for the deferred function to be called
     */
    var now = isNative(now = Date.now) && now || function() {
      return new Date().getTime();
    };

    /**
     * Converts the given value into an integer of the specified radix.
     * If `radix` is `undefined` or `0` a `radix` of `10` is used unless the
     * `value` is a hexadecimal, in which case a `radix` of `16` is used.
     *
     * Note: This method avoids differences in native ES3 and ES5 `parseInt`
     * implementations. See http://es5.github.io/#E.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} value The value to parse.
     * @param {number} [radix] The radix used to interpret the value to parse.
     * @returns {number} Returns the new integer value.
     * @example
     *
     * _.parseInt('08');
     * // => 8
     */
    var parseInt = nativeParseInt(whitespace + '08') == 8 ? nativeParseInt : function(value, radix) {
      // Firefox < 21 and Opera < 15 follow the ES3 specified implementation of `parseInt`
      return nativeParseInt(isString(value) ? value.replace(reLeadingSpacesAndZeros, '') : value, radix || 0);
    };

    /**
     * Creates a "_.pluck" style function, which returns the `key` value of a
     * given object.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} key The name of the property to retrieve.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var characters = [
     *   { 'name': 'fred',   'age': 40 },
     *   { 'name': 'barney', 'age': 36 }
     * ];
     *
     * var getName = _.property('name');
     *
     * _.map(characters, getName);
     * // => ['barney', 'fred']
     *
     * _.sortBy(characters, getName);
     * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]
     */
    function property(key) {
      return function(object) {
        return object[key];
      };
    }

    /**
     * Produces a random number between `min` and `max` (inclusive). If only one
     * argument is provided a number between `0` and the given number will be
     * returned. If `floating` is truey or either `min` or `max` are floats a
     * floating-point number will be returned instead of an integer.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} [min=0] The minimum possible value.
     * @param {number} [max=1] The maximum possible value.
     * @param {boolean} [floating=false] Specify returning a floating-point number.
     * @returns {number} Returns a random number.
     * @example
     *
     * _.random(0, 5);
     * // => an integer between 0 and 5
     *
     * _.random(5);
     * // => also an integer between 0 and 5
     *
     * _.random(5, true);
     * // => a floating-point number between 0 and 5
     *
     * _.random(1.2, 5.2);
     * // => a floating-point number between 1.2 and 5.2
     */
    function random(min, max, floating) {
      var noMin = min == null,
          noMax = max == null;

      if (floating == null) {
        if (typeof min == 'boolean' && noMax) {
          floating = min;
          min = 1;
        }
        else if (!noMax && typeof max == 'boolean') {
          floating = max;
          noMax = true;
        }
      }
      if (noMin && noMax) {
        max = 1;
      }
      min = +min || 0;
      if (noMax) {
        max = min;
        min = 0;
      } else {
        max = +max || 0;
      }
      if (floating || min % 1 || max % 1) {
        var rand = nativeRandom();
        return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand +'').length - 1)))), max);
      }
      return baseRandom(min, max);
    }

    /**
     * Resolves the value of property `key` on `object`. If `key` is a function
     * it will be invoked with the `this` binding of `object` and its result returned,
     * else the property value is returned. If `object` is falsey then `undefined`
     * is returned.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to resolve.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = {
     *   'cheese': 'crumpets',
     *   'stuff': function() {
     *     return 'nonsense';
     *   }
     * };
     *
     * _.result(object, 'cheese');
     * // => 'crumpets'
     *
     * _.result(object, 'stuff');
     * // => 'nonsense'
     */
    function result(object, key) {
      if (object) {
        var value = object[key];
        return isFunction(value) ? object[key]() : value;
      }
    }

    /**
     * A micro-templating method that handles arbitrary delimiters, preserves
     * whitespace, and correctly escapes quotes within interpolated code.
     *
     * Note: In the development build, `_.template` utilizes sourceURLs for easier
     * debugging. See http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
     *
     * For more information on precompiling templates see:
     * http://lodash.com/custom-builds
     *
     * For more information on Chrome extension sandboxes see:
     * http://developer.chrome.com/stable/extensions/sandboxingEval.html
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} text The template text.
     * @param {Object} data The data object used to populate the text.
     * @param {Object} [options] The options object.
     * @param {RegExp} [options.escape] The "escape" delimiter.
     * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
     * @param {Object} [options.imports] An object to import into the template as local variables.
     * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
     * @param {string} [sourceURL] The sourceURL of the template's compiled source.
     * @param {string} [variable] The data object variable name.
     * @returns {Function|string} Returns a compiled function when no `data` object
     *  is given, else it returns the interpolated text.
     * @example
     *
     * // using the "interpolate" delimiter to create a compiled template
     * var compiled = _.template('hello <%= name %>');
     * compiled({ 'name': 'fred' });
     * // => 'hello fred'
     *
     * // using the "escape" delimiter to escape HTML in data property values
     * _.template('<b><%- value %></b>', { 'value': '<script>' });
     * // => '<b>&lt;script&gt;</b>'
     *
     * // using the "evaluate" delimiter to generate HTML
     * var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the ES6 delimiter as an alternative to the default "interpolate" delimiter
     * _.template('hello ${ name }', { 'name': 'pebbles' });
     * // => 'hello pebbles'
     *
     * // using the internal `print` function in "evaluate" delimiters
     * _.template('<% print("hello " + name); %>!', { 'name': 'barney' });
     * // => 'hello barney!'
     *
     * // using a custom template delimiters
     * _.templateSettings = {
     *   'interpolate': /{{([\s\S]+?)}}/g
     * };
     *
     * _.template('hello {{ name }}!', { 'name': 'mustache' });
     * // => 'hello mustache!'
     *
     * // using the `imports` option to import jQuery
     * var list = '<% jq.each(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] }, { 'imports': { 'jq': jQuery } });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the `sourceURL` option to specify a custom sourceURL for the template
     * var compiled = _.template('hello <%= name %>', null, { 'sourceURL': '/basic/greeting.jst' });
     * compiled(data);
     * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
     *
     * // using the `variable` option to ensure a with-statement isn't used in the compiled template
     * var compiled = _.template('hi <%= data.name %>!', null, { 'variable': 'data' });
     * compiled.source;
     * // => function(data) {
     *   var __t, __p = '', __e = _.escape;
     *   __p += 'hi ' + ((__t = ( data.name )) == null ? '' : __t) + '!';
     *   return __p;
     * }
     *
     * // using the `source` property to inline compiled templates for meaningful
     * // line numbers in error messages and a stack trace
     * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
     *   var JST = {\
     *     "main": ' + _.template(mainText).source + '\
     *   };\
     * ');
     */
    function template(text, data, options) {
      // based on John Resig's `tmpl` implementation
      // http://ejohn.org/blog/javascript-micro-templating/
      // and Laura Doktorova's doT.js
      // https://github.com/olado/doT
      var settings = lodash.templateSettings;
      text = String(text || '');

      // avoid missing dependencies when `iteratorTemplate` is not defined
      options = defaults({}, options, settings);

      var imports = defaults({}, options.imports, settings.imports),
          importsKeys = keys(imports),
          importsValues = values(imports);

      var isEvaluating,
          index = 0,
          interpolate = options.interpolate || reNoMatch,
          source = "__p += '";

      // compile the regexp to match each delimiter
      var reDelimiters = RegExp(
        (options.escape || reNoMatch).source + '|' +
        interpolate.source + '|' +
        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
        (options.evaluate || reNoMatch).source + '|$'
      , 'g');

      text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
        interpolateValue || (interpolateValue = esTemplateValue);

        // escape characters that cannot be included in string literals
        source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);

        // replace delimiters with snippets
        if (escapeValue) {
          source += "' +\n__e(" + escapeValue + ") +\n'";
        }
        if (evaluateValue) {
          isEvaluating = true;
          source += "';\n" + evaluateValue + ";\n__p += '";
        }
        if (interpolateValue) {
          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
        }
        index = offset + match.length;

        // the JS engine embedded in Adobe products requires returning the `match`
        // string in order to produce the correct `offset` value
        return match;
      });

      source += "';\n";

      // if `variable` is not specified, wrap a with-statement around the generated
      // code to add the data object to the top of the scope chain
      var variable = options.variable,
          hasVariable = variable;

      if (!hasVariable) {
        variable = 'obj';
        source = 'with (' + variable + ') {\n' + source + '\n}\n';
      }
      // cleanup code by stripping empty strings
      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
        .replace(reEmptyStringMiddle, '$1')
        .replace(reEmptyStringTrailing, '$1;');

      // frame code as the function body
      source = 'function(' + variable + ') {\n' +
        (hasVariable ? '' : variable + ' || (' + variable + ' = {});\n') +
        "var __t, __p = '', __e = _.escape" +
        (isEvaluating
          ? ', __j = Array.prototype.join;\n' +
            "function print() { __p += __j.call(arguments, '') }\n"
          : ';\n'
        ) +
        source +
        'return __p\n}';

      // Use a sourceURL for easier debugging.
      // http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
      var sourceURL = '\n/*\n//# sourceURL=' + (options.sourceURL || '/lodash/template/source[' + (templateCounter++) + ']') + '\n*/';

      try {
        var result = Function(importsKeys, 'return ' + source + sourceURL).apply(undefined, importsValues);
      } catch(e) {
        e.source = source;
        throw e;
      }
      if (data) {
        return result(data);
      }
      // provide the compiled function's source by its `toString` method, in
      // supported environments, or the `source` property as a convenience for
      // inlining compiled templates during the build process
      result.source = source;
      return result;
    }

    /**
     * Executes the callback `n` times, returning an array of the results
     * of each callback execution. The callback is bound to `thisArg` and invoked
     * with one argument; (index).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} n The number of times to execute the callback.
     * @param {Function} callback The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns an array of the results of each `callback` execution.
     * @example
     *
     * var diceRolls = _.times(3, _.partial(_.random, 1, 6));
     * // => [3, 6, 4]
     *
     * _.times(3, function(n) { mage.castSpell(n); });
     * // => calls `mage.castSpell(n)` three times, passing `n` of `0`, `1`, and `2` respectively
     *
     * _.times(3, function(n) { this.cast(n); }, mage);
     * // => also calls `mage.castSpell(n)` three times
     */
    function times(n, callback, thisArg) {
      n = (n = +n) > -1 ? n : 0;
      var index = -1,
          result = Array(n);

      callback = baseCreateCallback(callback, thisArg, 1);
      while (++index < n) {
        result[index] = callback(index);
      }
      return result;
    }

    /**
     * The inverse of `_.escape` this method converts the HTML entities
     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to their
     * corresponding characters.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to unescape.
     * @returns {string} Returns the unescaped string.
     * @example
     *
     * _.unescape('Fred, Barney &amp; Pebbles');
     * // => 'Fred, Barney & Pebbles'
     */
    function unescape(string) {
      return string == null ? '' : String(string).replace(reEscapedHtml, unescapeHtmlChar);
    }

    /**
     * Generates a unique ID. If `prefix` is provided the ID will be appended to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} [prefix] The value to prefix the ID with.
     * @returns {string} Returns the unique ID.
     * @example
     *
     * _.uniqueId('contact_');
     * // => 'contact_104'
     *
     * _.uniqueId();
     * // => '105'
     */
    function uniqueId(prefix) {
      var id = ++idCounter;
      return String(prefix == null ? '' : prefix) + id;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object that wraps the given value with explicit
     * method chaining enabled.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to wrap.
     * @returns {Object} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'pebbles', 'age': 1 }
     * ];
     *
     * var youngest = _.chain(characters)
     *     .sortBy('age')
     *     .map(function(chr) { return chr.name + ' is ' + chr.age; })
     *     .first()
     *     .value();
     * // => 'pebbles is 1'
     */
    function chain(value) {
      value = new lodashWrapper(value);
      value.__chain__ = true;
      return value;
    }

    /**
     * Invokes `interceptor` with the `value` as the first argument and then
     * returns `value`. The purpose of this method is to "tap into" a method
     * chain in order to perform operations on intermediate results within
     * the chain.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to provide to `interceptor`.
     * @param {Function} interceptor The function to invoke.
     * @returns {*} Returns `value`.
     * @example
     *
     * _([1, 2, 3, 4])
     *  .tap(function(array) { array.pop(); })
     *  .reverse()
     *  .value();
     * // => [3, 2, 1]
     */
    function tap(value, interceptor) {
      interceptor(value);
      return value;
    }

    /**
     * Enables explicit method chaining on the wrapper object.
     *
     * @name chain
     * @memberOf _
     * @category Chaining
     * @returns {*} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // without explicit chaining
     * _(characters).first();
     * // => { 'name': 'barney', 'age': 36 }
     *
     * // with explicit chaining
     * _(characters).chain()
     *   .first()
     *   .pick('age')
     *   .value();
     * // => { 'age': 36 }
     */
    function wrapperChain() {
      this.__chain__ = true;
      return this;
    }

    /**
     * Produces the `toString` result of the wrapped value.
     *
     * @name toString
     * @memberOf _
     * @category Chaining
     * @returns {string} Returns the string result.
     * @example
     *
     * _([1, 2, 3]).toString();
     * // => '1,2,3'
     */
    function wrapperToString() {
      return String(this.__wrapped__);
    }

    /**
     * Extracts the wrapped value.
     *
     * @name valueOf
     * @memberOf _
     * @alias value
     * @category Chaining
     * @returns {*} Returns the wrapped value.
     * @example
     *
     * _([1, 2, 3]).valueOf();
     * // => [1, 2, 3]
     */
    function wrapperValueOf() {
      return this.__wrapped__;
    }

    /*--------------------------------------------------------------------------*/

    // add functions that return wrapped values when chaining
    lodash.after = after;
    lodash.assign = assign;
    lodash.at = at;
    lodash.bind = bind;
    lodash.bindAll = bindAll;
    lodash.bindKey = bindKey;
    lodash.chain = chain;
    lodash.compact = compact;
    lodash.compose = compose;
    lodash.constant = constant;
    lodash.countBy = countBy;
    lodash.create = create;
    lodash.createCallback = createCallback;
    lodash.curry = curry;
    lodash.debounce = debounce;
    lodash.defaults = defaults;
    lodash.defer = defer;
    lodash.delay = delay;
    lodash.difference = difference;
    lodash.filter = filter;
    lodash.flatten = flatten;
    lodash.forEach = forEach;
    lodash.forEachRight = forEachRight;
    lodash.forIn = forIn;
    lodash.forInRight = forInRight;
    lodash.forOwn = forOwn;
    lodash.forOwnRight = forOwnRight;
    lodash.functions = functions;
    lodash.groupBy = groupBy;
    lodash.indexBy = indexBy;
    lodash.initial = initial;
    lodash.intersection = intersection;
    lodash.invert = invert;
    lodash.invoke = invoke;
    lodash.keys = keys;
    lodash.map = map;
    lodash.mapValues = mapValues;
    lodash.max = max;
    lodash.memoize = memoize;
    lodash.merge = merge;
    lodash.min = min;
    lodash.omit = omit;
    lodash.once = once;
    lodash.pairs = pairs;
    lodash.partial = partial;
    lodash.partialRight = partialRight;
    lodash.pick = pick;
    lodash.pluck = pluck;
    lodash.property = property;
    lodash.pull = pull;
    lodash.range = range;
    lodash.reject = reject;
    lodash.remove = remove;
    lodash.rest = rest;
    lodash.shuffle = shuffle;
    lodash.sortBy = sortBy;
    lodash.tap = tap;
    lodash.throttle = throttle;
    lodash.times = times;
    lodash.toArray = toArray;
    lodash.transform = transform;
    lodash.union = union;
    lodash.uniq = uniq;
    lodash.values = values;
    lodash.where = where;
    lodash.without = without;
    lodash.wrap = wrap;
    lodash.xor = xor;
    lodash.zip = zip;
    lodash.zipObject = zipObject;

    // add aliases
    lodash.collect = map;
    lodash.drop = rest;
    lodash.each = forEach;
    lodash.eachRight = forEachRight;
    lodash.extend = assign;
    lodash.methods = functions;
    lodash.object = zipObject;
    lodash.select = filter;
    lodash.tail = rest;
    lodash.unique = uniq;
    lodash.unzip = zip;

    // add functions to `lodash.prototype`
    mixin(lodash);

    /*--------------------------------------------------------------------------*/

    // add functions that return unwrapped values when chaining
    lodash.clone = clone;
    lodash.cloneDeep = cloneDeep;
    lodash.contains = contains;
    lodash.escape = escape;
    lodash.every = every;
    lodash.find = find;
    lodash.findIndex = findIndex;
    lodash.findKey = findKey;
    lodash.findLast = findLast;
    lodash.findLastIndex = findLastIndex;
    lodash.findLastKey = findLastKey;
    lodash.has = has;
    lodash.identity = identity;
    lodash.indexOf = indexOf;
    lodash.isArguments = isArguments;
    lodash.isArray = isArray;
    lodash.isBoolean = isBoolean;
    lodash.isDate = isDate;
    lodash.isElement = isElement;
    lodash.isEmpty = isEmpty;
    lodash.isEqual = isEqual;
    lodash.isFinite = isFinite;
    lodash.isFunction = isFunction;
    lodash.isNaN = isNaN;
    lodash.isNull = isNull;
    lodash.isNumber = isNumber;
    lodash.isObject = isObject;
    lodash.isPlainObject = isPlainObject;
    lodash.isRegExp = isRegExp;
    lodash.isString = isString;
    lodash.isUndefined = isUndefined;
    lodash.lastIndexOf = lastIndexOf;
    lodash.mixin = mixin;
    lodash.noConflict = noConflict;
    lodash.noop = noop;
    lodash.now = now;
    lodash.parseInt = parseInt;
    lodash.random = random;
    lodash.reduce = reduce;
    lodash.reduceRight = reduceRight;
    lodash.result = result;
    lodash.runInContext = runInContext;
    lodash.size = size;
    lodash.some = some;
    lodash.sortedIndex = sortedIndex;
    lodash.template = template;
    lodash.unescape = unescape;
    lodash.uniqueId = uniqueId;

    // add aliases
    lodash.all = every;
    lodash.any = some;
    lodash.detect = find;
    lodash.findWhere = find;
    lodash.foldl = reduce;
    lodash.foldr = reduceRight;
    lodash.include = contains;
    lodash.inject = reduce;

    mixin(function() {
      var source = {}
      forOwn(lodash, function(func, methodName) {
        if (!lodash.prototype[methodName]) {
          source[methodName] = func;
        }
      });
      return source;
    }(), false);

    /*--------------------------------------------------------------------------*/

    // add functions capable of returning wrapped and unwrapped values when chaining
    lodash.first = first;
    lodash.last = last;
    lodash.sample = sample;

    // add aliases
    lodash.take = first;
    lodash.head = first;

    forOwn(lodash, function(func, methodName) {
      var callbackable = methodName !== 'sample';
      if (!lodash.prototype[methodName]) {
        lodash.prototype[methodName]= function(n, guard) {
          var chainAll = this.__chain__,
              result = func(this.__wrapped__, n, guard);

          return !chainAll && (n == null || (guard && !(callbackable && typeof n == 'function')))
            ? result
            : new lodashWrapper(result, chainAll);
        };
      }
    });

    /*--------------------------------------------------------------------------*/

    /**
     * The semantic version number.
     *
     * @static
     * @memberOf _
     * @type string
     */
    lodash.VERSION = '2.4.1';

    // add "Chaining" functions to the wrapper
    lodash.prototype.chain = wrapperChain;
    lodash.prototype.toString = wrapperToString;
    lodash.prototype.value = wrapperValueOf;
    lodash.prototype.valueOf = wrapperValueOf;

    // add `Array` functions that return unwrapped values
    forEach(['join', 'pop', 'shift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        var chainAll = this.__chain__,
            result = func.apply(this.__wrapped__, arguments);

        return chainAll
          ? new lodashWrapper(result, chainAll)
          : result;
      };
    });

    // add `Array` functions that return the existing wrapped value
    forEach(['push', 'reverse', 'sort', 'unshift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        func.apply(this.__wrapped__, arguments);
        return this;
      };
    });

    // add `Array` functions that return new wrapped values
    forEach(['concat', 'slice', 'splice'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        return new lodashWrapper(func.apply(this.__wrapped__, arguments), this.__chain__);
      };
    });

    return lodash;
  }

  /*--------------------------------------------------------------------------*/

  // expose Lo-Dash
  var _ = runInContext();

  // some AMD build optimizers like r.js check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose Lo-Dash to the global object even when an AMD loader is present in
    // case Lo-Dash is loaded with a RequireJS shim config.
    // See http://requirejs.org/docs/api.html#config-shim
    root._ = _;

    // define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module
    define(function() {
      return _;
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports && freeModule) {
    // in Node.js or RingoJS
    if (moduleExports) {
      (freeModule.exports = _)._ = _;
    }
    // in Narwhal or Rhino -require
    else {
      freeExports._ = _;
    }
  }
  else {
    // in a browser or Rhino
    root._ = _;
  }
}.call(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/home/azazdeaz/repos/animachine/src/editor/amgui/amgui.bezierEditor.js":[function(require,module,exports){
'use strict';

var amgui = {

    createBezierEditor: createBezierEditor,
};

module.exports = amgui;





function createBezierEditor(opt) {

    opt = opt || {};

    var p0 = {x: 0.3, y: 0},
        p1 = {x: 0.7, y: 1},
        w = opt.width || 312,
        h = opt.height || 312;

    var de = document.createElement('div');
    de.style.width = w + 'px';
    de.style.height = h + 'px';

    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    de.appendChild(c);

    var ctx = c.getContext('2d');
  
    var deCp0 = createCp(p0);
    var deCp1 = createCp(p1);

    de.getValue = function () {

        return 'cubic-bezier('+p0.x+','+p0.y+','+p1.x+','+p1.y+')';
    };

    de.setValue = function (points) {

        p0.x = points.cp0x;
        p0.y = points.cp0y;
        p1.x = points.cp1x;
        p1.y = points.cp1y;
        
        render();
    };
    
    render();
  
    return de;
  

  
  

    function render() {

        ctx.clearRect(0, 0, w, h);
        ctx.beginPath();
        ctx.moveTo(x(p0.x), y(p0.y));
        ctx.lineTo(0, y(0));
        ctx.bezierCurveTo(
            x(p0.x), y(p0.y),
            x(p1.x), y(p1.y),
            x(1), y(1));
        ctx.lineTo(x(p1.x), y(p1.y));
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.rect(x(0), y(0), x(1), y(1) - y(0));
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
      
        deCp0.refreshPosition();
        deCp1.refreshPosition();
    }

    function x (p) {
        return p * w;
    }

    function y (p) {

        var min = minY(),
            max = maxY(),
            full = max - min;

        return ((p - min) / full) * h;
    }
  
    function minY() {
    
        return Math.min(0, p0.y, p1.y);
    }
  
    function maxY() {
    
        return Math.max(1, p0.y, p1.y);
    }

    function createCp(point) {

        var r = 6, mdMinY, mdFullY;

        var deCp = document.createElement('div');
        deCp.style.position = 'absolute';
        deCp.style.cursor = 'grab';
        deCp.style.boxSizing = 'border-box';
        deCp.style.width = r*2 + 'px';
        deCp.style.height = r*2 + 'px';
        deCp.style.borderRadius = r + 'px';
        deCp.style.background = 'rgba(256, 256, 256, 1)';
        de.appendChild(deCp);
      
        deCp.addEventListener('mousedown', onDown);
      
        deCp.refreshPosition = function () {
            
            deCp.style.left = (x(point.x) ) + 'px';
            deCp.style.top = (y(point.y)) + 'px';
        };
        deCp.refreshPosition();
      
        return deCp;

        function onDown() {
          
            mdMinY = minY();
            mdFullY = maxY() - mdMinY;

            deCp.style.cursor = 'grabbing';

            window.addEventListener('mousemove', onDrag);
            window.addEventListener('mouseup', onUp);
            window.addEventListener('mouseleave', onUp);
        }

        function onDrag(e) {

            var br = de.getBoundingClientRect();

            point.x = Math.max(0, Math.min(1, (e.pageX - br.left) / w));
            point.y = (((e.pageY - br.top) / h) * mdFullY) - mdMinY;
          
            render();
          
            de.dispatchEvent(new CustomEvent('change', {detail: {value: de.getValue()}}));
        }

        function onUp() {

            deCp.style.cursor = 'grab';

            window.removeEventListener('mousemove', onDrag);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('mouseleave', onUp);
        }
    }
}
},{}],"/home/azazdeaz/repos/animachine/src/editor/amgui/amgui.js":[function(require,module,exports){
'use strict';

var EventEmitter = require('events').EventEmitter;
var fontelloConf = require('../assets/fontello/config.json');

WebFont.load({
    google: {
      families: ['Open Sans']
    }
});

var amgui = _.extend(
    new EventEmitter, 
    require('./amgui.bezierEditor'),
    {

    FONT_FAMILY: '"Open Sans", sans-serif',
    FONT_SIZE: '15px',

    color: {
        bg0: '#000',
        bg1: '#222',
        bg2: '#444',
        bg3: '#666',
        text: '#efe',
        overlay: 'rgba(0,0,0,.785)',
        bgHover: 'rgba(255,255,255,0.12)',
    },

    getStyleSheet: function () {

        var style = document.createElement('style');

        style.innerHTML = 'dialog::backdrop { background:'+amgui.color.bgHover+' }';

        return style;
    }, 

    createKeyline: function (opt) {

        var timescale = opt.timescale || 0.2,
            keys = [];

        var de = document.createElement('div');
        de.style.width = '100%';
        de.style.height = (opt.height || 21) + 'px';
        de.style.background = opt.background || 'grey';
        de.style.position = 'relative';

        de.addKey = function (opt) {

            var key = amgui.createKey(opt);
            keys.push(key);

            de.appendChild(key);

            return key;
        }

        return de;
    },

    createKey: function (opt) {

        var isUserSelected = false, 
            mdx, mDragged,
            time = opt.time || 0, 
            timescale = opt.timescale || 1;

        var de = document.createElement('div');
        de.style.position = 'absolute';

        var key = document.createElement('div');
        key.style.width = '0';
        key.style.height = '0';
        key.style.borderStyle = 'solid';
        key.style.borderWidth = '21px 4px 0 4px';
        key.style.borderColor = '#7700ff transparent transparent transparent';
        de.appendChild(key);

        setLeft();

        de.addEventListener('mousedown', function (e) {

            if (e.button !== 0) {

                return;
            }

            e.stopPropagation();
            e.preventDefault();

            mdx = e.pageX;
            mDragged = 0;

            if (!e.shiftKey && !e.ctrlKey) {
                amgui.emit('deselectAllKeys');
            }

            if (e.ctrlKey) {
                toggleUserSelected();
            }
            else {
                userSelect(true);
            }

            window.addEventListener('mousemove', drag);
            window.addEventListener('mouseup', dragEnd);
            window.addEventListener('mouseleave', dragEnd);

        });

        de.setTime = function(t) {

            if (time === t) return;

            time = t;
            setLeft();

            de.dispatchEvent(new CustomEvent('changeTime', {detail: {time: time}}));
        };

        de.setTimescale = function(ts) {

            if (timescale === ts) return;

            timescale = ts;
            setLeft();
        };

        amgui.on('deselectAllKeys', userSelect.bind(null, false));

        amgui.on('translateSelectedKeys', function (offset) {

            if (isUserSelected) {

                de.setTime(time + offset);
            }
        });

        return de;

        ///////////////////////////////////////////////////////

        function drag(e) {

            var diff = e.pageX - mdx,
                diffTime = (diff / timescale) - mDragged;

            mDragged += diffTime;

            amgui.emit('translateSelectedKeys', diffTime)
        }

        function dragEnd() {
            
            window.removeEventListener('mousemove', drag);
            window.removeEventListener('mouseup', dragEnd);
            window.removeEventListener('mouseleave', dragEnd);
        }

        function setLeft() {

            de.style.left = ((time * timescale) - 4) + 'px';
        }

        function toggleUserSelected() {

            userSelect(!isUserSelected);
        }

        function userSelect(on) {

            isUserSelected = on;
            de.style.background = isUserSelected ? 'white' : 'none';
        }
    },

    createDialog: function (opt) {

        var de = document.createElement('dialog');
        (opt.parent || document.body).appendChild(de);

        de.style.background = 'none';
        de.style.border = 'none';
        de.style.pointerEvents = 'auto';
        de.style.fontFamily = amgui.FONT_FAMILY;


        var deTitle = document.createElement('div');
        deTitle.style.display = 'inline-block';
        deTitle.style.padding = '0 18px';
        deTitle.style.height = '34px';
        deTitle.style.fontSize = '23px';
        deTitle.style.fontWeight = 'bold';
        deTitle.style.background = amgui.color.overlay;
        deTitle.style.color = amgui.color.text;
        de.appendChild(deTitle);

        var titleEnd = document.createElement('div');
        titleEnd.style.display = 'inline-block';
        titleEnd.style.width = '0';
        titleEnd.style.height = '0';
        titleEnd.style.verticalAlign = 'bottom';
        titleEnd.style.borderStyle = 'solid';
        titleEnd.style.borderWidth = '34px 0 0 8px';
        titleEnd.style.borderColor = 'transparent transparent transparent ' + amgui.color.overlay;;
        de.appendChild(titleEnd);

        

        var contentCont = document.createElement('div');
        contentCont.style.background = amgui.color.overlay;
        de.appendChild(contentCont);

        var buttonsCont = document.createElement('div');
        buttonsCont.style.background = amgui.color.overlay;
        buttonsCont.style.display = 'inline-block';
        buttonsCont.style.float = 'right';
        de.appendChild(buttonsCont);


        de.setTitle = function (title) {

            deTitle.textContent = title || 'Dialog';
        };

        de.setContent = function (content) {

            if (!content) {
                return;
            }

            contentCont.innerHTML = '';
            contentCont.appendChild(content);
        };

        de.setButtons = function (buttons) {

            if (!buttons) {
                return
            }

            buttonsCont.innerHTML = '';

            buttons.forEach(function (caption) {

                var btn = amgui.createBtn({caption: caption});
                btn.style.display = 'inline-block';
                btn.style.fontWeight = 'bold';
                btn.style.fontSize = '18px';
                buttonsCont.appendChild(btn);

                btn.addEventListener('click', function () {
                    de.dispatchEvent(new Event('click_' + caption.toLowerCase()));
                });
            });
        };

        de.setTitle(opt.title);
        de.setContent(opt.content);
        de.setButtons(opt.buttons);

        var buttonsEnd = document.createElement('div');
        buttonsEnd.style.display = 'inline-block';
        buttonsEnd.style.float = 'right';
        buttonsEnd.style.width = '0';
        buttonsEnd.style.height = '0';
        buttonsEnd.style.verticalAlign = 'top';
        buttonsEnd.style.borderStyle = 'solid';
        buttonsEnd.style.borderWidth = '0 6px 21px 0';
        buttonsEnd.style.borderColor = 'transparent '+amgui.color.bg0+' transparent transparent';
        de.appendChild(buttonsEnd);

        return de;
    },

    createBtn: function (opt) {

        opt.backgroundColor = opt.backgroundColor || amgui.color.bg0;

        var de = document.createElement('div');
        de.style.height = (opt.height || 21) + 'px';
        de.style.padding = '0 15px';
        de.style.cursor = 'pointer';
        de.style.color = amgui.color.text;
        de.style.backgroundColor = opt.backgroundColor;

        de.setCaption = function (caption) {

            de.textContent = caption;
        }
        
        de.setCaption(opt.caption || 'button');

        de.addEventListener('mouseenter', onMOver);
        de.addEventListener('mouseleave', onMOut);

        function onMOver() {

            this.style.background = amgui.color.bgHover;
        }

        function onMOut() {
            
            this.style.background = opt.backgroundColor;
        }

        if (opt.parent) {
            opt.parent.appendChild(de);
        }

        return de;
    },

    createIconBtn: function (opt) {

        var de = amgui.createIcon({size: opt.height, icon: opt.icon});
        de.style.width = (opt.width || 21) + 'px';
        de.style.cursor = 'pointer';
        de.style.color = 'white';
        de.style.overflow = 'hidden';
        de.style.display = opt.display || 'block';

        de.addEventListener('mouseenter', onMOver);
        de.addEventListener('mouseleave', onMOut);

        if (opt.onClick) {

            de.addEventListener('click', opt.onClick);
        }

        function onMOver() {

            this.style.background = amgui.color.bgHover;
        }

        function onMOut() {
            
            this.style.background = 'none';
        }

        if (opt.parent) {
            opt.parent.appendChild(de);
        }

        return de;
    },

    createToggleIconBtn: function (opt) {

        var isOn = false;
        var de = amgui.createIconBtn(opt);
        setIcon();

        de.addEventListener('click', onClick);

        de.setToggle = function (on) {

            on = !!on;
            if (on === isOn) {
                return;
            }
            isOn = on;
            setIcon();

            de.dispatchEvent(new CustomEvent('toggle', {detail: {state: isOn}}));
            de.dispatchEvent(new CustomEvent(isOn ? 'toggleOn' : 'toggleOff'));
        };

        de.state = function () {

            return isOn;
        }

        function onClick() {
            
            de.setToggle(!isOn);
        }

        function setIcon() {

            de.setIcon(isOn ? opt.iconOn : opt.iconOff);
        }

        return de;
    },

    createIcon: function (opt) {

        opt = opt || {};
        opt.size = opt.size || 23;
        
        var de = document.createElement('div');
        de.style.color = '#fff';
        de.style.width = opt.size + 'px';
        de.style.height = opt.size + 'px';
        de.style.lineHeight = opt.size + 'px';
        de.style.textAlign = 'center';
        de.style.fontFamily = 'amgui';
        de.style.fontSize = Math.round(opt.size * 0.72) + 'px';

        de.setIcon = function (icon) {

            var glyph = fontelloConf.glyphs.find(function (glyph) {

                return glyph.css === icon
            });

            var code = glyph ? glyph.code : 59407;
            de.textContent = String.fromCharCode(code);
        };

        de.setIcon(opt.icon);

        return de;
    },  

    createDropdown: function (opt) {

        var options = opt.options || [];

        var de = document.createElement('ul');
        de.style.listStyleType = 'none';
        de.style.margin = 0;
        de.style.padding = 0;

        options.forEach(function (text) {

            var li = document.createElement('li');
            li.textContent = text;
            li.style.textAlign = 'left';
            li.style.fontFamily = amgui.FONT_FAMILY;
            li.style.fontSize = '14px';
            li.style.padding = '0 3px';
            li.style.cursor = 'pointer';
            li.style.color = amgui.color.text;
            li.style.background = amgui.color.bg2;

            li.addEventListener('click', function (e) {

                e.stopPropagation();

                de.dispatchEvent(new CustomEvent('select', {detail: {selection: text}}));
            });
            de.appendChild(li);
        });

        if (opt.onSelect) {

            de.addEventListener('select', opt.onSelect);
        }

        return de;
    },

    bindDropdown: function(opt) {

        var isOpened = false;
        var deBtn = opt.deTarget;
        var deDropdown = opt.deMenu;

        if (opt.asContextMenu) {

            deBtn.addEventListener('contextmenu', function (e) {

                e.stopPropagation();
                e.preventDefault();
                isOpened ? close() : open();
            });
        }
        else {
            
            deBtn.addEventListener('click', function (e) {

                e.stopPropagation();
                isOpened ? close() : open();
            });
        }

        deDropdown.style.position = 'fixed';
        
        deDropdown.addEventListener('select', close);

        function open() {

            if (isOpened) return;
            isOpened = true;

            var bcr = deBtn.getBoundingClientRect();
            deDropdown.style.left = bcr.left + 'px';
            deDropdown.style.top = bcr.bottom + 'px';

            deBtn.appendChild(deDropdown);
            window.addEventListener('click', close);
        }

        function close() {

            if (!isOpened) return;
            isOpened = false;
            
            if (deDropdown.parentElement) {
                deDropdown.parentElement.removeChild(deDropdown);
            }
            window.removeEventListener('click', close);
        }
    },

    addTooltip: function (opt) {

        var showSetT, delay = 798, mx = 0, my = 0;

        var de = document.createElement('div');
        de.textContent = opt.text;
        de.style.position = 'fixed';
        de.style.padding = '12px';
        de.style.display = 'inline-block';
        de.style.background = amgui.color.overlay;
        de.style.color = amgui.color.text;

        opt.deTarget.addEventListener('mouseenter', onMEnter);
        opt.deTarget.addEventListener('mouseleave', onMLeave);

        function onMEnter(e) {

            opt.deTarget.addEventListener('mousemove', onMMove);
            onMMove(e);
        }

        function onMLeave(e) {

            opt.deTarget.removeEventListener('mousemove', onMMove);
            hide();
            clearShowSetT();
        }

        function onMMove(e) {

            hide();
            refreshShowSetT();
            mx = e.pageX;
            my = e.pageY;
        }

        function refreshShowSetT() {

            clearShowSetT();
            showSetT = setTimeout(show, delay);
        }

        function clearShowSetT() {

            clearTimeout(showSetT);
        }

        function show() {

            amgui.deOverlayCont.appendChild(de);
            amgui.placeToPoint(de, mx, my, opt.side);
        }

        function hide() {

            if (de.parentElement) {
                de.parentElement.removeChild(de);
            }
        }
    },

    createKeyValueInput: function (opt) {

        opt = opt || {};

        var de = document.createElement('div');
        de.style.margin = '0 1px';

        var keyOn = false;

        var oldKey, oldValue;

        var inpKey = createInput('parameter name');
        inpKey.addEventListener('keypress', onKeyPress);

        var divider = createDivider();

        var inpValue = createInput('value');
        // inpValue.style.color = 'lightblue';
        inpValue.style.textAlign = 'right';
        inpValue.style.right = '0px';

        showHideValue(keyOn);

        de.getKey = function () {
            return inpKey.value;
        };

        de.setKey = function (v) {
            
            if (v === oldKey) return;
            
            oldKey = v;
            inpKey.value = v;
            checkKeyOn();
        };

        de.getValue = function () {
            return inpValue.value;
        };

        de.setValue = function (v) {
            
            if (v === oldValue) return;

            oldValue = v;
            inpValue.value = v;
        };

        if (opt.parent) {
            opt.parent.appendChild(de);
        }

        if (opt.key) {
            de.setKey(opt.key);
        }

        if (opt.value) {
            de.setValue(opt.value);
        }

        if (opt.onChange) {
            de.addEventListener('change', opt.onChange);
        }

        function onChange(e) {

            e.preventDefault();
            e.stopPropagation();
            
            checkKeyOn();

            var detail = {};
            
            if (de.getKey() !== oldKey) {
                oldKey = detail.key = de.getKey();
            }
            if (de.getValue() !== oldValue) {
                oldValue = detail.value = de.getValue();
            }

            if ('value' in detail || 'key' in detail) {

                de.dispatchEvent(new CustomEvent('change', {detail: detail}));
            }
        }

        function onKeyPress(e) {
            
            if (e.keyCode === 13) {
                
                e.preventDefault();
                e.stopPropagation();

                inpValue.focus();
            }
        }

        function checkKeyOn() {

            var on = !!inpKey.value;

            if (on !== keyOn) {
                
                keyOn = on;
                showHideValue(keyOn);
            }
        }

        function showHideValue(show) {
            
            divider.style.display = show ? 'inline' : 'none';
            inpValue.style.display = show ? 'inline-block' : 'none';
            inpKey.style.width = show ? 'calc(50% - 5px)' : '100%';
        }

        function createInput(placeholder) {

            var inp = document.createElement('input');
            inp.type = 'text';
            inp.placeholder = placeholder;
            inp.style.width = '50%';
            inp.style.height = '100%';
            inp.style.fontSize = amgui.FONT_SIZE;
            inp.style.fontFamily = amgui.FONT_FAMILY;
            inp.style.border = 'none';
            inp.style.color = 'white';
            inp.style.background = 'none';
            inp.addEventListener('change', onChange);
            inp.addEventListener('keyup', onChange);
            // $(inp).autosizeInput({space: 0});
            de.appendChild(inp);
            return inp;
        }

        function createDivider () {

            var divider = document.createElement('span');
            divider.textContent = ':';
            divider.style.color = 'white';
            divider.style.width = '2px';
            divider.style.fontSize = amgui.FONT_SIZE;
            divider.style.fontFamily = amgui.FONT_FAMILY;
            de.appendChild(divider);

            return divider;
        }

        return de;
    },

    placeToPoint: function (de, mx, my, way) {

        var px = 0, py = 0,
            br = de.getBoundingClientRect(),
            w = br.width,
            h = br.height,
            ww = window.innerWidth,
            wh = window.innerHeight;

        way = way || 'left';

        switch (way) {

            case 'top':
                px = mx - (w / 2);
                py = my - h;
                break;

            case 'right':
                px = mx;
                py = my - (h / 2);
                break;

            case 'bottom':
                px = mx - (w / 2);
                py = my;
                break;

            case 'left':
            default:
                px = mx - w;
                py = my - (h / 2);
                break;
        }

        if (py < 0) py = 0;
        if (px + w > ww) px -= (px + w) - ww;
        if (py + h > wh) py -= (py + h) - wh;
        if (px < 0) px = 0;

        de.style.left = px + 'px';
        de.style.top = py + 'px';
    },

    callOnAdded: function (de, cb, thisArg) {

        var setI = setInterval(function () {

            if (check(de)) {

                clearInterval(setI);

                cb.call(thisArg);
            }
            
        }, 234);
        
        function check (node) {

            while (node.parentNode) {

                node = node.parentNode;
                
                if (node.nodeType === 9 || node.nodeType === 11) {

                    return true;
                }
            }
        }
    }
});


amgui.setMaxListeners(0);

module.exports = amgui;
},{"../assets/fontello/config.json":"/home/azazdeaz/repos/animachine/src/editor/assets/fontello/config.json","./amgui.bezierEditor":"/home/azazdeaz/repos/animachine/src/editor/amgui/amgui.bezierEditor.js","events":"/home/azazdeaz/repos/animachine/node_modules/events/events.js"}],"/home/azazdeaz/repos/animachine/src/editor/assets/fontello/config.json":[function(require,module,exports){
module.exports={
  "name": "amgui",
  "css_prefix_text": "icon-",
  "css_use_suffix": false,
  "hinting": true,
  "units_per_em": 1000,
  "ascent": 850,
  "glyphs": [
    {
      "uid": "53ed8570225581269cd7eff5795e8bea",
      "css": "emo-unhappy",
      "code": 59412,
      "src": "fontelico"
    },
    {
      "uid": "8ce732688587909ad0a9d8323eaca8ad",
      "css": "marquee",
      "code": 59413,
      "src": "fontelico"
    },
    {
      "uid": "1a5cfa186647e8c929c2b17b9fc4dac1",
      "css": "plus-squared",
      "code": 59398,
      "src": "fontawesome"
    },
    {
      "uid": "f5999a012fc3752386635ec02a858447",
      "css": "download-cloud",
      "code": 115,
      "src": "fontawesome"
    },
    {
      "uid": "de2fc7a5c986ab8c622f63455d7cf814",
      "css": "upload-cloud",
      "code": 117,
      "src": "fontawesome"
    },
    {
      "uid": "7034e4d22866af82bef811f52fb1ba46",
      "css": "code",
      "code": 59417,
      "src": "fontawesome"
    },
    {
      "uid": "f48ae54adfb27d8ada53d0fd9e34ee10",
      "css": "trash",
      "code": 59396,
      "src": "fontawesome"
    },
    {
      "uid": "1b5a5d7b7e3c71437f5a26befdd045ed",
      "css": "doc",
      "code": 59405,
      "src": "fontawesome"
    },
    {
      "uid": "26613a2e6bc41593c54bead46f8c8ee3",
      "css": "file-code",
      "code": 59400,
      "src": "fontawesome"
    },
    {
      "uid": "b091a8bd0fdade174951f17d936f51e4",
      "css": "folder-empty",
      "code": 59403,
      "src": "fontawesome"
    },
    {
      "uid": "6533bdc16ab201eb3f3b27ce989cab33",
      "css": "folder-open-empty",
      "code": 59404,
      "src": "fontawesome"
    },
    {
      "uid": "e99461abfef3923546da8d745372c995",
      "css": "cog",
      "code": 59393,
      "src": "fontawesome"
    },
    {
      "uid": "5bb103cd29de77e0e06a52638527b575",
      "css": "wrench",
      "code": 59415,
      "src": "fontawesome"
    },
    {
      "uid": "21b42d3c3e6be44c3cc3d73042faa216",
      "css": "sliders",
      "code": 59416,
      "src": "fontawesome"
    },
    {
      "uid": "c53068fe21c8410b0a098b4c52c3d37e",
      "css": "down-circled2",
      "code": 59414,
      "src": "fontawesome"
    },
    {
      "uid": "7bf14281af5633a597f85b061ef1cfb9",
      "css": "angle-right",
      "code": 59394,
      "src": "fontawesome"
    },
    {
      "uid": "e4dde1992f787163e2e2b534b8c8067d",
      "css": "angle-down",
      "code": 59395,
      "src": "fontawesome"
    },
    {
      "uid": "ce06b5805120d0c2f8d60cd3f1a4fdb5",
      "css": "play",
      "code": 59397,
      "src": "fontawesome"
    },
    {
      "uid": "0b28050bac9d3facf2f0226db643ece0",
      "css": "pause",
      "code": 59399,
      "src": "fontawesome"
    },
    {
      "uid": "f4445feb55521283572ee88bc304f928",
      "css": "floppy",
      "code": 59401,
      "src": "fontawesome"
    },
    {
      "uid": "795efd07cd5205b589c883916a76cff0",
      "css": "hdd",
      "code": 59411,
      "src": "fontawesome"
    },
    {
      "uid": "c92ad3028acce9d51bae0ac82f5de8a2",
      "css": "bullseye",
      "code": 59408,
      "src": "fontawesome"
    },
    {
      "uid": "9e34a047fee949eae9b6e613d790d6cf",
      "css": "dropbox",
      "code": 59409,
      "src": "fontawesome"
    },
    {
      "uid": "e7cb72a17f3b21e3576f35c3f0a7639b",
      "css": "git",
      "code": 59406,
      "src": "fontawesome"
    },
    {
      "uid": "2c2ca8a96b31781c9c8056d05c0a8980",
      "css": "blank",
      "code": 59407,
      "src": "fontawesome"
    },
    {
      "uid": "e536c80e011366046360f5ffe669dbfd",
      "css": "folder-add",
      "code": 59402,
      "src": "typicons"
    },
    {
      "uid": "366510ecfb08cd0110134b1ea907fb81",
      "css": "evernote",
      "code": 59410,
      "src": "zocial"
    },
    {
      "uid": "272e08e0e16226aadf94dcbf33aab2b2",
      "css": "key",
      "code": 59392,
      "src": "elusive"
    }
  ]
}
},{}],"/home/azazdeaz/repos/animachine/src/editor/modules/css/CssParameter.js":[function(require,module,exports){
'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var uncalc = require('./uncalc');
var Key = require('./Key');
var amgui = require('../../amgui');

function CssParameter (opt) {

    EventEmitter.call(this);
    
    this.name = opt.name || '';

    this._lineH = opt.lineH || 21;

    this._keys = [];

    this.deOptions = this._createParameterOptions();
    this.deKeyline = amgui.createKeyline({
        timescale: am.timeline.timescale
    });

    this._onChangeInput = this._onChangeInput.bind(this);
    this._onChangeTime = this._onChangeTime.bind(this);
    this._onChangeKeyTime = this._onChangeKeyTime.bind(this);
    this._onToggleKey = this._onToggleKey.bind(this);
    this._onDeleteKey = this._onDeleteKey.bind(this);

    if (!opt.skipKeyValueInput) {

        this._input = amgui.createKeyValueInput({
            parent: this.deOptions,
            key: this.name,
            value: opt.value,
            onChange: this._onChangeInput,
            height: this._lineH
        });
        this._input.style.flex = 1;
    }

    this._btnToggleKey = amgui.createIconBtn({
        icon: 'key',
        height: 21,
        parent: this.deOptions
    });
    this._btnToggleKey.addEventListener('click', this._onToggleKey);
    this._refreshBtnToggleKey();

    am.timeline.on('changeTime', this._onChangeTime);
}

inherits(CssParameter, EventEmitter);
var p = CssParameter.prototype;

p.getValue = function (time) {

    if (!_.isNumber(time)) {
        time = am.timeline.currTime;
    }

    var before, after, same;

    this._keys.forEach(function (key) {

        if (key.time === time) {
        
            same = key;
        }

        if (key.time < time && (!before || before.time < key.time)) {
        
            before = key;
        }

        if (key.time > time && (!after || after.time > key.time)) {
        
            after = key;
        }
    });

    if (same) {

        return same.value;
    }
    else {

        if (after && before) {

            var p = (time - before.time) / (after.time - before.time), 
                av = uncalc(after.value), bv = uncalc(before.value);

            return 'calc(' + bv + ' + (' + av + ' - ' + bv + ')*' + p + ')';
        }
        else if (before) {
            
            return before.value;
        }
        else if (after) {
            
            return after.value;
        }
    }
};

p.addKey = function (opt) {

    var key = this.getKey(opt.time);

    if (key) {

        if ('value' in opt) {

            key.value = opt.value;
        }
    }
    else {

        key = new Key(_.extend({deKeyline: this.deKeyline}, opt));

        key.on('changeTime', this._onChangeKeyTime);
        key.on('delete', this._onDeleteKey);

        this._keys.push(key);
    }

    this._refreshInput();
    this._refreshBtnToggleKey();

    this.emit('change');

    return key;
};

p.getKey = function (time) {

    return this._keys.find(function(key) {

        return key.time === time;
    });
};

p.getPrevKey = function (time) {

    var retKey;
    
    this._keys.forEach(function(key) {

        if (key.time < time && (!retKey || retKey.time < key.time)) {

            retKey = key;
        }
    });

    return retKey;
};

p.getNextKey = function (time) {

    var retKey;
    
    this._keys.forEach(function(key) {

        if (key.time > time && (!retKey || retKey.time > key.time)) {

            retKey = key;
        }
    });

    return retKey;
};

p.getKeyTimes = function () {

    var times = [];

    this._keys.forEach(function (key) {

        times.push(key.time);
    });

    return times;
};

p.getSave = function () {

    var save = {
        name: this.name,
        keys: [],
    }

    this._keys.forEach(function (key) {

        save.keys.push({
            value: key.value,
            time: key.time
        });
    });

    return save;
};

p.useSave = function(save) {

    this.name = save.name;

    save.keys.forEach(function (keyData) {

        this.addKey(keyData);
    }, this);
};

p._onChangeInput = function (e) {

    if ('key' in e.detail) {
        this.name = e.detail.key;
    }

    if ('value' in e.detail) {
        this.addKey({
            time: am.timeline.currTime,
            value: e.detail.value
        });
    }

    this.emit('change');
};

p._onChangeKeyTime = function () {

    this.emit('change');
};

p._onDeleteKey = function (key) {

    this.deleteKey(key);
};

p._onChangeTime = function () {

    this._refreshInput();
    this._refreshBtnToggleKey();
};

p._onToggleKey = function () {

    var key = this.getKey(am.timeline.currTime);

    if (key) {
        this.deleteKey(key);
    }
    else {
        this.addKey({time: am.timeline.currTime});
    }
};

p.deleteKey = function (key) {

    var idx = this._keys.indexOf(key);

    if (idx !== -1) {

        this._keys.splice(idx, 1);

        key.dispose();

        key.removeListener('changeTime', this._onChangeKeyTime);
        key.removeListener('delete', this._onDeleteKey);

        this._refreshBtnToggleKey();

        this.emit('change');
    }
};

p.isValid = function () {

    return !!(this.name && this._keys.length);
};

p._refreshInput = function () {

    this._input.setKey(this.name);
    this._input.setValue(this.getValue());
};

p._refreshBtnToggleKey = function () {

    var key = this.getKey(am.timeline.currTime);
    this._btnToggleKey.style.color = key ? amgui.color.text : 'rgba(255,255,255,.23)';
};

p._createParameterOptions = function () {

    var de = document.createElement('div');
    de.style.display = 'flex';
    de.style.width = '100%';
    de.style.height = this._lineH + 'px';
    de.style.background = 'linear-gradient(to bottom, #184F12 18%,#1B4417 96%)';

    return de;
};

module.exports = CssParameter;

},{"../../amgui":"/home/azazdeaz/repos/animachine/src/editor/amgui/amgui.js","./Key":"/home/azazdeaz/repos/animachine/src/editor/modules/css/Key.js","./uncalc":"/home/azazdeaz/repos/animachine/src/editor/modules/css/uncalc.js","events":"/home/azazdeaz/repos/animachine/node_modules/events/events.js","inherits":"/home/azazdeaz/repos/animachine/node_modules/inherits/inherits_browser.js"}],"/home/azazdeaz/repos/animachine/src/editor/modules/css/CssSequence.js":[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../../amgui');
var CssParameter = require('./CssParameter');
var CssTransformParameter = require('./CssTransformParameter');
var Key = require('./Key');
var Transhand = require('../../transhand/Transhand');
var mstPlayer = require('./script.player.mst');

function CssSequence(opt) {

    opt = opt || {};

    EventEmitter.call(this);

    CssSequence._instances.push(this);

    this._selectors = opt.selectors || [];
    this._parameters = [];

    this._opt = _.extend({baseH: 21}, opt);

    this._selectedElements = [];
    this._isOpened = false;
    this._headKeys = [];

    this._onSelectClick = this._onSelectClick.bind(this);
    this._onChangeHandler = this._onChangeHandler.bind(this);
    this._onChangeTime = this._onChangeTime.bind(this);
    this._onChangeParameter = this._onChangeParameter.bind(this);
    this._onChangeBlankParameter = this._onChangeBlankParameter.bind(this);
    this._onToggleKey = this._onToggleKey.bind(this);

    this.deOptions = document.createElement('div');
    this.deKeys = document.createElement('div');

    this._deHeadOptinos = this._createHeadOptions();
    this._deHeadKeyline = amgui.createKeyline({});
    this.deKeys.appendChild(this._deHeadKeyline);

    am.timeline.on('changeTime', this._onChangeTime);
    this.deOptions.addEventListener('click', this._onSelectClick);
    this.deKeys.addEventListener('click', this._onSelectClick);

    this._onChangeBlankParameter();
}

CssSequence._instances = [];

inherits(CssSequence, EventEmitter);
var p = CssSequence.prototype;

p.type = 'css_sequ_type';

p.select = function () {

    if (this._isSelected) return;
    this._isSelected = true;


    if (!this._handler) {
        this._handler = new Transhand();
    }

    this._handler.on('change', this._onChangeHandler);

    this.selectElements();

    if (this._selectedElements.length) {

        this._focusHandler(this._selectedElements[0]);
    }

    this.deHighlight.style.opacity = 1;

    this.emit('select', this);
};

p.deselect = function () {

    if (!this._isSelected) return;
    this._isSelected = false;

    this._blurHandler();

    this.deHighlight.style.opacity = 0;

    if (this._handler) {

        this._handler.removeListener('change', this._onChangeHandler);
    }
};

p.renderTime = function (time) {

    if (this._selectors.length === 0) {
        return;
    }

    var selection = _.toArray(am.deRoot.querySelectorAll(this._selectors.join(',')));

    this._parameters.forEach(function (param) {

        selection.forEach(function (de) {

            de.style[param.name] = param.getValue(time);
        });
    });
};

p.height = function () {

    return this._opt.baseH * (this._isOpened ? this._parameters.length + 1 : 1);
};

p._onPick = function (de) {

    var items = am.deRoot.querySelectorAll(this.selectors.join(','));

    if (items.indexOf(de)) {

        this.select();
    }
};

p._focusHandler = function (de) {

    de = de || this._currHandledDe;
    this._currHandledDe = de;

    if (!this._currHandledDe) return;

    var transformSave;
    if (de.style.transform) {
        transformSave = de.style.transform;
        de.style.transform = '';
    }

    var br = de.getBoundingClientRect();

    de.style.transform = transformSave;

    var handOpt = {
        type: 'transformer',
        base: {
            x: br.left,
            y: br.top,
            w: br.width,
            h: br.height,
        }
    };
    var transformParam = this.getParameter('transform');

    if (transformParam) {

        handOpt.params = transformParam.getRawValue();
    }

    this._handler.setup({
        hand: handOpt
    });
    this._handler.activate();

    am.deHandlerCont.appendChild(this._handler.domElem);
};

p._blurHandler = function () {

    // this._currHandledDe = undefined;

    if (this._handler && this._handler.domElem && this._handler.domElem.parentNode) {

        this._handler.deactivate();
        this._handler.domElem.parentNode.removeChild(this._handler.domElem);
    }
};

p._onSelectClick = function () {

    this.select();
};

p._onChangeHandler = function(params, type) {

    var time = am.timeline.currTime,
        name, prop, value;


    if (type === 'transform') {

        Object.keys(params).forEach(function (name) {

            if (name === 'tx' || name === 'ty' || name === 'tz' ||
                name === 'rx' || name === 'ry' || name === 'rz' ||
                name === 'sx' || name === 'sy' || name === 'sz')
            {
                value = {};
                value[name] = params[name];

                prop = this.addParameter({name: 'transform'});
                prop.addKey({
                    time: time,
                    name: name,
                    value: value
                });
            }
        }, this);

        if ('ox' in params && 'oy' in params) {

            prop = this.addParameter({name: 'transform-origin'});
            prop.addKey({
                time: time,
                name: name,
                value: (params.ox*100) + '% ' + (params.oy*100) + '%'
            });
        }
    }

    this.renderTime(time);
    this._focusHandler();
};

p._onChangeTime = function (time) {

    this._parameters.forEach(function (param) {

        this.renderTime(time);
        this._focusHandler();
        this._refreshBtnToggleKey();
    }, this);
};

p._onChangeParameter = function () {

    this.renderTime();
    this._focusHandler();
    this._refreshHeadKeyline();
    this._refreshBtnToggleKey();

    this.emit('change');
};

p._onChangeBlankParameter = function () {

    if (this._blankParameter) {

        this._blankParameter.removeListener('change', this._onChangeBlankParameter);
    };

    this._blankParameter = this.addParameter();
    this._blankParameter.on('change', this._onChangeBlankParameter);
};

p._onToggleKey = function () {

    var time = am.timeline.currTime;
        allHaveKey = this._isAllParamsHaveKey(time);

    this._parameters.forEach(function (param) {

        if (param.isValid()) {

            if (allHaveKey) {
                param.deleteKey(param.getKey(time));
            }
            else {
                param.addKey({time: time});
            }
        }
    });

    this._refreshBtnToggleKey();
};

p._isAllParamsHaveKey = function (time) {

    return this._parameters.every(function (param) {

        return param.getKey(time) || !param.isValid();
    });
};

p.getParameter = function (name) {

    return this._parameters.find(function(param) {

        return param.name === name;
    });
};

p.addParameter = function (opt) {

    opt = opt || {};

    var param = this.getParameter(opt.name);

    if (param) {

        return param
    }
    else {

        if (opt.name === 'transform') {

            param = new CssTransformParameter(opt);
        }
        else {

            param = new CssParameter(opt);
        }

        this._parameters.push(param);
        param.on('change', this._onChangeParameter);

        this.deOptions.appendChild(param.deOptions);
        this.deKeys.appendChild(param.deKeyline);
        this.emit('changeHeight');

        return param;
    }
};

p._refreshBtnToggleKey = function () {

    var allHaveKey = this._isAllParamsHaveKey(am.timeline.currTime);
    this._btnToggleKey.style.color = allHaveKey ? amgui.color.text : 'rgba(255,255,255,.23)';
};


p._refreshHeadKeyline = function () {

    var times = [], oldKeys = this._headKeys.splice(0);

    this._parameters.forEach(function (param) {

        times = times.concat(param.getKeyTimes());
    });

    times = _.uniq(times);

    times.forEach(function (time) {

        var key = oldKeys.pop() || new Key({
            deKeyline: this._deHeadKeyline
        });

        key.time = time;

        this._headKeys.push(key);
    }, this);

    _.invoke(_.difference(oldKeys, this._headKeys), 'dispose');
};

p.getScript = function () {

    var keys = [], code = '', options, selectors,
        longestOffset = 0;

    this._parameters.forEach(function (param) {

        param._keys.forEach(function (key) {

            var offset = key.time;
            getKey(offset)[param.name] = param.getValue(key.time);

            if (longestOffset < offset) longestOffset = offset;
        });
    });

    keys.forEach(function (key) {

        key.offset /= longestOffset;
    });

    keys.sort(function (a, b) {

        return a.offset - b.offset;
    });

    function getKey(time) {

        var key = keys.find(function (_key) {
            return time === _key.offset;
        });

        if (!key) {

            key = {offset: time};
            keys.push(key);
        }

        return key;
    }

    options = {
      direction: "normal",
      duration: longestOffset,
      iterations: 1
    };

    selectors = this._selectors.join(',').replace('\\','\\\\');

    code = Mustache.render(mstPlayer, {
        keys: JSON.stringify(keys),
        options: JSON.stringify(options),
        selectors: selectors
    });

    return code;
};

p.getSave = function () {

    var save = {
        selectors: _.clone(this._selectors),
        parameters: [],
    };

    this._parameters.forEach(function (param) {

        save.parameters.push(param.getSave());
    });

    return save;
};

p.useSave = function (save) {

    this._selectors = save.selectors;

    save.parameters.forEach(function (paramData) {
        //hack: give the 'name' on creating the param to have
        //  the 'CssTransformParameter' instance for the 'transform' parameter
        var param = this.addParameter({name: paramData.name});
        param.useSave(paramData);
    }, this);

    return save;
};

p.getMagnetPoints = function () {

    var times = [];

    this._headKeys.forEach(function (key) {

        times.push(key.time);
    });

    return times;
};



p._createHeadOptions = function (){

    var de = document.createElement('div');
    de.style.position = 'relative';
    de.style.width = '100%';
    de.style.height = this._opt.baseH + 'px';
    de.style.background = 'linear-gradient(to bottom, #063501 18%,#064100 96%)';
    this.deOptions.appendChild(de);

    this.deHighlight = document.createElement('div');
    this.deHighlight.style.display = 'inline-block';
    this.deHighlight.style.width = '2px';
    this.deHighlight.style.height = this._opt.baseH + 'px';
    this.deHighlight.style.background = 'gold';
    this.deHighlight.style.opacity = 0;
    de.appendChild(this.deHighlight);

    this._deToggleDropDown = amgui.createToggleIconBtn({
        iconOn: 'angle-down',
        iconOff: 'angle-right',
        height: this._opt.baseH,
    });
    this._deToggleDropDown.addEventListener('toggle', function (e) {
        this._isOpened = e.detail.state;
        this.emit('changeHeight', this.height());
    }.bind(this));
    this._deToggleDropDown.style.display = 'inline-block';
    de.appendChild(this._deToggleDropDown);

    this._deOptionsBtn = amgui.createIconBtn({icon: 'cog', height: this._opt.baseH});
    this._deOptionsBtn.style.position = 'absolute';
    this._deOptionsBtn.style.right = '21px';
    this._deOptionsBtn.style.top = '0px';
    de.appendChild(this._deOptionsBtn);

    this._btnToggleKey = amgui.createIconBtn({icon: 'key', height: this._opt.baseH});
    this._btnToggleKey.style.position = 'absolute';
    this._btnToggleKey.style.right = '0px';
    this._btnToggleKey.style.top = '0px';
    this._btnToggleKey.addEventListener('click', this._onToggleKey);
    de.appendChild(this._btnToggleKey);
    this._refreshBtnToggleKey();

    return de;
};

p.isOwnedDomElement = function (de) {

    return this._selectedElements.indexOf(de) !== -1;
};

p.selectElements = function () {

    var list = [];

    this._selectors.forEach(function (selector) {

        var items = am.deRoot.querySelectorAll(selector);
        items = Array.prototype.slice.call(items);
        list = list.concat(items);
    });

    this._selectedElements = list;
};

module.exports = CssSequence;





},{"../../amgui":"/home/azazdeaz/repos/animachine/src/editor/amgui/amgui.js","../../transhand/Transhand":"/home/azazdeaz/repos/animachine/src/editor/transhand/Transhand.js","./CssParameter":"/home/azazdeaz/repos/animachine/src/editor/modules/css/CssParameter.js","./CssTransformParameter":"/home/azazdeaz/repos/animachine/src/editor/modules/css/CssTransformParameter.js","./Key":"/home/azazdeaz/repos/animachine/src/editor/modules/css/Key.js","./script.player.mst":"/home/azazdeaz/repos/animachine/src/editor/modules/css/script.player.mst","events":"/home/azazdeaz/repos/animachine/node_modules/events/events.js","inherits":"/home/azazdeaz/repos/animachine/node_modules/inherits/inherits_browser.js"}],"/home/azazdeaz/repos/animachine/src/editor/modules/css/CssTransformParameter.js":[function(require,module,exports){
'use strict';

var inherits = require('inherits');
var CssParameter = require('./CssParameter');
var uncalc = require('./uncalc');
var Key = require('./Key');
var amgui = require('../../amgui');

var BASE_VALUES = {
    tx: 0, ty: 0, tz: 0,
    rx: 0, ry: 0, rz: 0,
    sx: 1, sy: 1, sz: 1,
    skewX: 0, skewY: 0,
    perspective: 0
};

function CssTransformParameter (opt) {

    CssParameter.call(this, _.extend({
        name: 'transform',
        skipKeyValueInput: true,
    }, opt));
}

inherits(CssTransformParameter, CssParameter);
var p = CssTransformParameter.prototype;

p.getValue = function (time) {

    return convertTransformValue(this.getRawValue(time));
};

p.getRawValue = function (time) {

    if (!_.isNumber(time)) {
        time = am.timeline.currTime;
    }

    var before, after, same;

    this._keys.forEach(function (key) {

        if (key.time === time) {
        
            same = key;
        }

        if (key.time < time && (!before || before.time < key.time)) {
        
            before = key;
        }

        if (key.time > time && (!after || after.time > key.time)) {
        
            after = key;
        }
    });

    if (same) {

        return same.value;
    }
    else {

        if (after && before) {

            var calculated = {},
                p = (time - before.time) / (after.time - before.time),
                av = after.value,
                bv = before.value;

            Object.keys(bv).forEach(function (name) {

                if (name in av) {

                    calculated[name] = bv[name] + (av[name] - bv[name]) * p;
                }
                else {
                    calculated[name] = bv[name];
                }
            });

            return calculated;
        }
        else if (before) {
            
            return _.clone(before.value);
        }
        else if (after) {
            
            return _.clone(after.value);
        }
        else {
            return _.clone(BASE_VALUES);
        }
    }
};

p.addKey = function (opt) {

    var key = this.getKey(opt.time);

    if (key) {

        if ('value' in opt) {

            key.value = _.extend(key.value, opt.value);
        }
    }
    else {
        key = new Key(_.extend({deKeyline: this.deKeyline}, opt));
        key.value = _.extend(this.getRawValue(opt.time), opt.value);

        key.on('changeTime', this._onChangeKeyTime);
        key.on('delete', this._onDeleteKey);

        this._keys.push(key);
    }

    this._refreshInput();
    this._refreshBtnToggleKey();

    this.emit('change');

    return key;
};

p._onChangeInput = function (e) {

    if ('key' in e.detail) {
        this.name = e.detail.key;
    }

    if ('paramName' in e.detail && 'value' in e.detail) {
        
        var key = this.addKey({
            time: am.timeline.currTime,
        });
        
        key.value[e.detail.paramName] = e.detail.value;
    }

    this.emit('change');
};

p._refreshInput = function () {

};

function convertTransformValue(v) {

    var tx = 'tx' in v && v.tx !== BASE_VALUES.tx,
        ty = 'ty' in v && v.ty !== BASE_VALUES.ty,
        tz = 'tz' in v && v.tz !== BASE_VALUES.tz,
        rx = 'rx' in v && v.rx !== BASE_VALUES.rx,
        ry = 'ry' in v && v.ry !== BASE_VALUES.ry,
        rz = 'rz' in v && v.rz !== BASE_VALUES.rz,
        sx = 'sx' in v && v.sx !== BASE_VALUES.sx,
        sy = 'sy' in v && v.sy !== BASE_VALUES.sy,
        sz = 'sz' in v && v.sz !== BASE_VALUES.sz,
        skewX = 'skeewX' in v && v.skewX !== BASE_VALUES.skewX,
        skewY = 'skeewY' in v && v.skewY !== BASE_VALUES.skewY,
        perspective = 'perspective' in v && v.perspective !== BASE_VALUES.perspective,
        ret = '';

    if (tx && ty && tz) ret += 'translate3d('+v.tx+'px,'+v.ty+'px,'+v.tz+'px) ';
    else if (tx && ty) ret += 'translate('+v.tx+'px,'+v.ty+'px) ';
    else {
        if (tx) ret += 'translateX('+v.tx+'px) ';
        if (ty) ret += 'translateY('+v.ty+'px) ';
        if (tz) ret += 'translateZ('+v.tz+'px) ';
    }

    if (rx && ry && rz) ret += 'rotate3d('+v.rx+'rad,'+v.ry+'rad,'+v.rz+'rad) ';
    else if (rx && ry) ret += 'rotate('+v.rx+'rad,'+v.ry+'rad) ';
    else {
        if (rx) ret += 'rotateX('+v.rx+'rad) ';
        if (ry) ret += 'rotateY('+v.ry+'rad) ';
        if (rz) ret += 'rotate('+v.rz+'rad) ';
    }

    if (sx && sy && sz) ret += 'scale3d('+v.sx+','+v.sy+','+v.sz+') ';
    else if (sx && sy) ret += 'scale('+v.sx+','+v.sy+') ';
    else {
        if (sx) ret += 'scaleX('+v.sx+') ';
        if (sy) ret += 'scaleY('+v.sy+') ';
        if (sz) ret += 'scaleZ('+v.sz+') ';
    }

    if (skewX && skewY) ret += 'skew('+v.skewx+'rad,'+v.skewY+'rad) ';
    else if (skewX) ret += 'skewX('+v.skewX+'rad) ';
    else if (skewY) ret += 'skewY('+v.skewY+'rad) ';

    if(perspective) ret += 'perspective('+v.perspective+') ';
console.log(ret)
    return ret;
}

module.exports = CssTransformParameter;

},{"../../amgui":"/home/azazdeaz/repos/animachine/src/editor/amgui/amgui.js","./CssParameter":"/home/azazdeaz/repos/animachine/src/editor/modules/css/CssParameter.js","./Key":"/home/azazdeaz/repos/animachine/src/editor/modules/css/Key.js","./uncalc":"/home/azazdeaz/repos/animachine/src/editor/modules/css/uncalc.js","inherits":"/home/azazdeaz/repos/animachine/node_modules/inherits/inherits_browser.js"}],"/home/azazdeaz/repos/animachine/src/editor/modules/css/Key.js":[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var dialogKeyOptions = require('./dialogKeyOptions');
var amgui = require('../../amgui');

function Key (opt) {

    EventEmitter.call(this);
    
    this._time = opt.time || 0,
    this._value = opt.value || '',
    this._deKeyline = opt.deKeyline,
    this.ease = 'linear';

    this._onChangeDeTime = this._onChangeDeTime.bind(this);
    this._onSelectDropdown = this._onSelectDropdown.bind(this);
    this._onChangeEase = this._onChangeEase.bind(this);
    this._onChangeTape = this._onChangeTape.bind(this);

    this.domElem = this._deKeyline.addKey({
        timescale: am.timeline.timescale,
        time: this.time
    });

    this._deMenu = amgui.createDropdown({
        options: ['ease', 'delete']
    });
    this._deMenu.addEventListener('select', this._onSelectDropdown);

    this.domElem.addEventListener('changeTime', this._onChangeDeTime);
    am.timeline.on('changeTape', this._onChangeTape);

    amgui.bindDropdown({
        deTarget: this.domElem,
        deMenu: this._deMenu,
        asContextMenu: true
    });
}

inherits(Key, EventEmitter);
var p = Key.prototype;

Object.defineProperties(p, {

    time: {
        set: function (v) {

            if (this._time === v) return;

            this._time = v;

            this.domElem.setTime(this._time);
        },
        get: function () {

            return this._time;
        }
    },
    value: {
        set: function (v) {

            if (this._value === v) return;

            this._value = v;
        },
        get: function () {

            return this._value;
        }
    }
})

p._onChangeDeTime = function (e) {

    this.time = e.detail.time;

    this.emit('changeTime');
};

p._onSelectDropdown = function (e) {
    
    var selection = e.detail.selection;

    if (selection === 'ease') {

        dialogKeyOptions.show({
            ease: this.ease,
        });
        
        dialogKeyOptions.on('changeEase', this._onChangeEase);
    }
    else if (selection === 'delete') {

        this.emit('delete', this);
    }
};

p._onChangeEase = function (ease) {

    this.ease = ease;
};

p._onChangeTape = function () {

    domElem.setTimescale(am.timeline.timescale);
};

p.dispose = function () {

    this.domElem.removeEventListener('changeTime', this._onChangeDeTime);
    this._deMenu.removeEventListener('select', this._onSelectDropdown);
    am.timeline.removeListener('changeTape', this._onChangeTape);

    if (this.domElem.parentNode) this.domElem.parentNode.removeChild(this.domElem); 
    if (this._deMenu.parentNode) this._deMenu.parentNode.removeChild(this._deMenu); 
};

module.exports = Key;

},{"../../amgui":"/home/azazdeaz/repos/animachine/src/editor/amgui/amgui.js","./dialogKeyOptions":"/home/azazdeaz/repos/animachine/src/editor/modules/css/dialogKeyOptions.js","events":"/home/azazdeaz/repos/animachine/node_modules/events/events.js","inherits":"/home/azazdeaz/repos/animachine/node_modules/inherits/inherits_browser.js"}],"/home/azazdeaz/repos/animachine/src/editor/modules/css/cssModule.js":[function(require,module,exports){
var CssSequence = require('./CssSequence');
var qsgen = require('../../qsgen');

var am, iconNew, qsModal, selectBox;

exports.init = function (_am) {

    am = _am;

    am.registerSequenceType(CssSequence, CssSequence.prototype.type);

    am.on('selectDomElement', onSelectDomElement);

    selectBox = createSelectionBox();
}

function onSelectDomElement(de) {

    if (!CssSequence._instances.some(testSequ)) {

        iconNew = am.toolbar.addIcon(iconNew ? 
        {
            deIcon: iconNew
        } : {

            icon: 'plus-squared',

            onClick: function () {

                am.toolbar.removeIcon(iconNew);
                selectBox.hide();

                var selector = qsgen(am.selectedElement);
                console.log('selector:', selector);

                var sequ = new CssSequence({
                    selectors: [selector]
                });

                am.timeline.addSequence(sequ);

                sequ.select();
            }
        });

        selectBox.show(de);
    }

    function testSequ(sequ) {
            
        if (sequ.isOwnedDomElement(de)) {
            
            sequ.select();
            selectBox.hide();
            return true;
        }
    }
}

function createQsModal() {

    var de = document.createElement('div');
    de.style.width = '340px';

    var inp = document.createElement('input');
    inp.type = 'text';
    de.appendChild(inp);

    return amgui.createDialog({
        content: de,
        title: 'Selector',
        buttons: ['ok']
    });
}

function createSelectionBox() {

    var de = document.createElement('div');
    de.style.position = 'fixed';
    de.style.boxSizing = 'border-box';
    de.style.boxShadow = '0px 0px 1px 0px rgba(50, 50, 50, 0.75)';
    de.style.display = 'none';
    de.style.border = '2px dashed #eee';
    am.deHandlerCont.appendChild(de);
    
    de.show = function (deTarget) {

        var br = deTarget.getBoundingClientRect();
        de.style.left = br.left + 'px';
        de.style.top = br.top + 'px';
        de.style.width = br.width + 'px';
        de.style.height = br.height + 'px';
        de.style.display = 'block';
    }

    de.hide = function () {
        
        de.style.display = 'none';
    }

    return de;
}
},{"../../qsgen":"/home/azazdeaz/repos/animachine/src/editor/qsgen.js","./CssSequence":"/home/azazdeaz/repos/animachine/src/editor/modules/css/CssSequence.js"}],"/home/azazdeaz/repos/animachine/src/editor/modules/css/dialogKeyOptions.js":[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../../amgui');

function DialogKeyOptions () {

    EventEmitter.call(this);

    this._onSelectEase = this._onSelectEase.bind(this);
    this._onClickOk = this._onClickOk.bind(this); 
}

inherits(DialogKeyOptions, EventEmitter);
var p = DialogKeyOptions.prototype;

p.show = function (opt) {

    opt = opt || {};

    this._createDialog();

    this._btnSelectEase.setCaption(opt.ease);

    this.domElem.showModal();
};

p.hide = function () {

    this.domElem.close();

    this.removeAllListeners('changeEase');
};

p._createDialog = function () {

    if (this._isDialogCreated) return;
    this._isDialogCreated = true;

    this._createContent();
    
    this.domElem = amgui.createDialog({
        title: 'Key',
        content: this._deContent,
        parent: am.deDialogCont,
        buttons: ['ok'],
    });

    this.domElem.addEventListener('click_ok', this._onClickOk);
};

p._createContent = function () {

    this._deContent = document.createElement('div');
    this._deContent.style.width = '330px';
    this._deContent.style.padding = '30px 12px';
    this._deContent.style.background = amgui.color.bg0;

    this._deLabelEase = document.createElement('span');
    this._deLabelEase.textContent = 'ease: ';
    this._deLabelEase.style.color = amgui.color.text;
    this._deContent.appendChild(this._deLabelEase);

    this._btnSelectEase = amgui.createBtn('linear');
    this._btnSelectEase.style.display = 'inline-block';
    this._deContent.appendChild(this._btnSelectEase);

    amgui.bindDropdown({
        deTarget: this._btnSelectEase,
        deMenu: amgui.createDropdown({
            options: ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'beizer'],
            onSelect: this._onSelectEase
        })
    });
};

p._onClickOk = function (e) {

    this.hide();
};

p._onSelectEase = function (e) {

    var ease = e.detail.selection;
    this._btnSelectEase.setCaption(ease);
    this.emit('changeEase', ease);
};

module.exports = new DialogKeyOptions();

},{"../../amgui":"/home/azazdeaz/repos/animachine/src/editor/amgui/amgui.js","events":"/home/azazdeaz/repos/animachine/node_modules/events/events.js","inherits":"/home/azazdeaz/repos/animachine/node_modules/inherits/inherits_browser.js"}],"/home/azazdeaz/repos/animachine/src/editor/modules/css/script.player.mst":[function(require,module,exports){
module.exports = "function () {\n\n    var player,\n        animation,\n        isInited = false,\n        animations = [],\n        keys = {{{keys}}},\n        options = {{{options}}},\n        elems = document.querySelectorAll('{{{selectors}}}');\n\n    for (var i = 0; i < elems.length; ++i) {\n\n        animations.push(new Animation(elems[i], keys, options));\n    }\n\n    animation = new AnimationGroup(animations);\n\n    return {\n\n        play: function () {\n\n            if (!isInited) {\n\n                player = document.timeline.play(animation);\n                isInited = true;\n            }\n            else {\n                player.play();\n            }\n        },\n        pause: function () {\n\n            if (!player) {\n                return;\n            }\n\n            player.pause();\n        },\n        seek: function (time) {\n\n            if (!player) {\n                return;\n            }\n\n            player.currentTime = time;\n        }\n    };\n}";

},{}],"/home/azazdeaz/repos/animachine/src/editor/modules/css/uncalc.js":[function(require,module,exports){
var rx = /^calc\((.*?)\)$/;
    
module.exports = function uncalc (value) {

    if (typeof(value) === 'string' && value.indexOf('calc(') !== -1) {

        var m = rx.exec(value);
        return m ? '( ' + m[1] + ' )' : value;
    }
    else {

        return value;
    }
}
},{}],"/home/azazdeaz/repos/animachine/src/editor/qsgen.js":[function(require,module,exports){
var EXATTR = ['id', 'class', 'style'];

function generate(de, root) {

    root = root || document;

    var deCurr = de,
        rootCurr = root, 
        qsCurr, qsParent = '';

    while (true) {

        do {
            qsCurr = gen(deCurr, rootCurr)
        }
        while(!qsCurr && 
            deCurr.parentNode !== rootCurr &&
            (deCurr = deCurr.parentNode));

        if (!qsCurr) {

            if (deCurr.parentNode === rootCurr) {

                qsCurr = '> ' + deCurr.tagName + ':nth-child(' +
                    (Array.prototype.indexOf.call(rootCurr.childNodes, deCurr) + 1) + ')';
            }
            else {
                return; //can't find unique query selector
            }
        }

        qsParent += (qsParent ? ' ' : '') + qsCurr;

        if (deCurr === de) {

            return qsParent;
        }
        else {
            qsCurr = undefined;
            rootCurr = deCurr;
            deCurr = de;
        }
    }
}

function gen(de, root) {


    var singles, selectors, matches = [];

    singles = selectors = [de.tagName].concat(
        possibleIds(de),
        possibleClasses(de, i),
        possibleAttributes(de, i)
    );

    for (var i = 0; i < 5; ++i) {

        selectors.forEach(function (selector) {

            if (root.querySelectorAll(selector).length === 1) {
                matches.push(selector);
            };
        });

        if (matches.length) {

            return matches[0];
        }
        else {
            selectors = combine(selectors, singles);
        }
    }
}

function possibleIds(de) {

    return de.id ? ['#' + CSS.escape(de.id)] : [];
}

function possibleClasses(de, max) {

    return Array.prototype.slice.call(de.classList, 0)
        .map(function (className) {
            return '.' + CSS.escape(className)
        });
}

function possibleAttributes(de) {

    return Array.prototype.slice.call(de.attributes, 0)
        .filter(function(attr) {
            return EXATTR.indexOf(attr.name) === -1;
        })
        .map(function (attr) {
            return '[' + CSS.escape(attr.name) + (attr.value ? '="' + attr.value : '') + '"]';
        });
}

// function variate(_list, length) {

//     return step(_list, 2);

//     function step(list, back) {

//         var combined = combine(attributes, list);
//         return list.concat(back === 0 ? combined : step(combined, --back));
//     }
// }

function combine(sourceA, sourceB) {

    var combined = [];

    sourceA.forEach(function (a) {
        sourceB.forEach(function (b) {
            if (a.indexOf(b) === -1 && b.indexOf(a) === -1 &&
                '#.[:'.indexOf(b.charAt(0)) !== -1) 
            {
                combined.push(a + b);
            }
        });
    });

    return combined;
}

module.exports = generate;

},{}],"/home/azazdeaz/repos/animachine/src/editor/timeline/Timebar.js":[function(require,module,exports){
'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../amgui');
var decorTimebarNavigator = require('./decorTimebarNavigator');

function Timebar(opt) {

    EventEmitter.call(this);

    opt = opt || {};

    this._start = opt.start || 0;
    this._width = opt.width || 0;
    this._height = opt.height || 21;
    this._timescale = opt.timescale || 0;
    this._currTime = opt.currTime || 0;
    this._maxTime = opt.maxTime || 60000;

    this._magnetPoints = [];

    this._onMDown = onMDown.bind(this);
    this._onMMove = onMMove.bind(this);
    this._onMUp = onMUp.bind(this);

    this._steps = getSteps();

    this._createBase();
    this._createPointer();
    this._renderTape();

    this._canvasTape.addEventListener('mousedown', this._onMDown);

    decorTimebarNavigator(this);
}

inherits(Timebar, EventEmitter);
var p = Timebar.prototype;
module.exports = Timebar;




Object.defineProperties(p, {
    
    timescale: {
        set: function (v) {
            if (this._timescale === v) return;
            this._timescale = Math.min(1, Math.max(0.0001, v));
            console.log('>setts', v, this.timescale)
            this._renderTape();
            this.emit('changeTape');
        },
        get: function () {
            return this._timescale;
        }
    },

    start: {
        set: function (v) {
            if (this._start === v) return;
            this._start = Math.min(0, v);
            this._renderTape();
            this.emit('changeTape');
        },
        get: function () {
            return this._start;
        }
    }, 

    width: {
        set: function (v) {
            if (this._width === v) return;
            this._width = v;
            this._renderTape();
            this.emit('changeTape');
        },
        get: function () {
            return this._width;
        }
    }, 
    
    end: {
        get: function () {
            return this._start + (this._width / this._timescale);
        }
    }, 
    
    length: {
        set: function (v) {
            this.timescale = this._width / v;
        },

        get: function () {
            return this._width / this._timescale;
        }
    },
    
    currTime: {
        set: function (time) {

            if (this._currTime === time) return;

            this._currTime = time;

            var pos = (time / this.length) * this.width;

            this._dePointer.style.left = pos + 'px';

            this.emit('changeTime', this._currTime);
        },
        get: function () {
            return this._currTime;
        }
    }, 
    
    magnetPoints: {
        set: function (v) {
            return this._magnetPoints = v;
        },
        get: function () {
            return this._magnetPoints
        }
    },

    maxTime: {
        set: function (v) {
            if (this._maxTime === v) return;
            return this._maxTime = v;
            this.emit('changeTape');
        },
        get: function () {
            return this._maxTime
        }
    },
});




p._renderTape = function () {

    var start = this._start,
        end = this.end,
        length = this.length,
        height = this._height,
        scale = this.timescale, 
        width = this._width,
        maxMarkers = width / 4,
        step, i, text, textW,
        ctx = this._ctxTape;

    this._canvasTape.width = width;
    this._canvasTape.height = height;

    this._steps.forEach(function (s) {

        if ((this.length / s.small) < maxMarkers && (!step || step.small > s.small)) {

            step = s;
        }
    }, this);

    if (step) {

        ctx.linweidth = 0.5;
        ctx.strokeStyle = amgui.color.bg3;
        ctx.fillStyle = amgui.color.bg3;
        ctx.font = ~~(this._height * 0.5) + 'px "Open Sans"'

        for (i = start % step.small; i < length; i += step.small) {

            ctx.moveTo(~~(i * scale) + 0.5, height);
            ctx.lineTo(~~(i * scale) + 0.5, height * 0.75);
        }
        ctx.stroke();

        for (i = start % step.big; i < length; i += step.big) {

            ctx.moveTo(~~(i * scale) + 0.5, height);
            ctx.lineTo(~~(i * scale) + 0.5, height * 0.62);
        }
        ctx.stroke();

        for (i = start % step.time; i < length; i += step.time) {

            text = step.format(i - start);
            textW = ctx.measureText(text).width / 2;
            ctx.fillText(text, i * scale - textW, 12);
        }
        ctx.stroke();
    }
};

function onMDown(e) {

    e.stopPropagation();
    e.preventDefault();

    if (e.shiftKey) this._dragMode = 'translate';
    else if (e.ctrlKey) this._dragMode = 'scale';
    else this._dragMode = 'seek';

    this._mdX = e.pageX;
    this._mdStart = this._start;
    this._mdTimescale = this._timescale;

    this._onMMove(e);

    window.addEventListener('mousemove', this._onMMove);
    window.addEventListener('mouseup', this._onMUp);
    window.addEventListener('mouseleave', this._onMUp);
}

function onMMove(e) {

    var left = this._canvasTape.getBoundingClientRect().left,
        mouseX = Math.max(0, Math.min(this.width, e.pageX - left)),
        move = e.pageX - this._mdX,
        time, magnetPoint, magnetPointDiff;

    if (this._dragMode === 'seek') {

        time = (mouseX / this.width) * this.length;

        this._magnetPoints.forEach(function (mp) {

            var diff = Math.abs(mp - time);

            if (diff < magnetPointDiff || magnetPointDiff === undefined) {
                magnetPoint = mp;
                magnetPointDiff = diff;
            }
        });
        
        if ((magnetPointDiff * this._timescale) < 2) {

            time = magnetPoint;
        }

        this.currTime = this._start + time;
    }
    else if (this._dragMode === 'translate') {

        this.start = this._mdStart + (move / this.timescale);
    }
    else if (this._dragMode === 'scale') {

        this.timescale = this._mdTimescale + (move/1000);
    }
}

function onMUp() {

    window.removeEventListener('mousemove', this._onMMove);
    window.removeEventListener('mouseup', this._onMUp);
    window.removeEventListener('mouseleave', this._onMUp);
}


p._createBase = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.backgroundColor = amgui.color.bg0;
    this.domElem.style.position = 'relative';

    this._canvasTape = document.createElement('canvas');
    this._ctxTape = this._canvasTape.getContext('2d');
    this._canvasTape.style.display = 'block';
    this.domElem.appendChild(this._canvasTape); 
};

p._createPointer = function () {

    var radius = 5.5;
    this._dePointer = document.createElement('div');
    this._dePointer.style.position = 'absolute';
    this._dePointer.style.bottom = 2*radius + 'px';
    var pointer = document.createElement('div');
    pointer.style.position = 'absolute';
    pointer.style.boxSizing = 'border-box';
    pointer.style.pointerEvents = 'none';
    pointer.style.left = -radius + 'px';
    pointer.style.width = 2*radius + 'px';
    pointer.style.height = 2*radius + 'px';
    pointer.style.border = 'solid red 1px';
    pointer.style.borderRadius = radius + 'px';
    this._dePointer.appendChild(pointer); 
    this.domElem.appendChild(this._dePointer); 
};








//Steps
function getSteps() {

    return [
        {
            small: 5, 
            big: 50, 
            time: 50, 
            format: function (ms) {
                var sec = parseInt(ms/1000);

                return (sec ? sec+':'+four(ms) : ms) + 'ms';
            } 
        },
        {
            small: 10, 
            big: 100, 
            time: 100, 
            format: function (ms) {
                var sec = parseInt(ms/1000);

                return (sec ? sec+':'+four(ms) : ms) + 'ms';
            } 
        },
        {
            small: 100, 
            big: 1000, 
            time: 1000, 
            format: function (ms) {
                var min = parseInt(ms/60000);
                var sec = parseInt(ms/1000) % 60;

                return (min ? min+':'+two(sec) : sec) + 's';
            } 
        },
        {
            small: 500, 
            big: 5000, 
            time: 5000, 
            format: function (ms) {
                var min = parseInt(ms/60000);
                var sec = parseInt(ms/1000) % 60;

                return (min ? min+':'+two(sec) : sec) + 's';
            } 
        },
        {
            small: 10000, 
            big: 60000, 
            time: 60000, 
            format: function (ms) {
                var min = parseInt(ms/60000) % 60;
                var hour = parseInt(ms/3600000);

                return (hour ? hour+':'+two(min) : min) + 'm';
            } 
        },
        {
            small: 60000, 
            big: 5*60000, 
            time: 5*60000, 
            format: function (ms) {
                var min = parseInt(ms/60000) % 60;
                var hour = parseInt(ms/3600000);

                return (hour ? hour+':'+two(min) : min) + 'm';
            } 
        }
    ];

    function two(num) {

        return ('00' + num).substr(-2);
    }

    function four(num) {

        return ('0000' + num).substr(-4);
    }
}

},{"../amgui":"/home/azazdeaz/repos/animachine/src/editor/amgui/amgui.js","./decorTimebarNavigator":"/home/azazdeaz/repos/animachine/src/editor/timeline/decorTimebarNavigator.js","events":"/home/azazdeaz/repos/animachine/node_modules/events/events.js","inherits":"/home/azazdeaz/repos/animachine/node_modules/inherits/inherits_browser.js"}],"/home/azazdeaz/repos/animachine/src/editor/timeline/Timeline.js":[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var Timebar = require('./Timebar');
var amgui = require('../amgui');
var mstSaveScript = require('./script.save.mst');

function Timeline(am) {

    EventEmitter.call(this);
    this.setMaxListeners(1100);

    this._headerH = 23;
    
    this._createBase();
    this._createSettingsHead();
    this._createTimeline();
    this._createPointerLine();

    this._currSequence;
    
    this._timebar = new Timebar({
        height: this._headerH,
        width: this._deRight.offsetWidth || 1000,
        timescale: 0.05
    });
    this._deRight.insertBefore(this._timebar.domElem, this._deKeylineCont);

    this._refreshTimebarWidth();

    this._sequences = [];

    this._dropdownNewSequ.addEventListener('select', function (e) {
        
        // this.addSequence(am.sequenceTypes[0].create());
    }.bind(this));

    this._onSelectSequence = this._onSelectSequence.bind(this);
    this._onChangeSequence = this._onChangeSequence.bind(this);
    this._onChangeTime = this._onChangeTime.bind(this);
    this._onChangeTape = this._onChangeTape.bind(this);
    this._onWindowResize = this._onWindowResize.bind(this);

    this._timebar.on('changeTime', this.emit.bind(this, 'changeTime'));
    this._timebar.on('changeTape', this.emit.bind(this, 'changeTape'));
    this._timebar.on('changeTime', this._onChangeTime);
    this._timebar.on('changeTape', this._onChangeTape);

    amgui.callOnAdded(this.domElem, this._refreshTimebarWidth, this);
    
    window.addEventListener('resize', this._onWindowResize);
}

inherits(Timeline, EventEmitter);
var p = Timeline.prototype;
module.exports = Timeline;

p.addSequence = function (sequ) {

    var deContOpt = createCont(sequ.deOptions, this._deLeft),
        deContKf = createCont(sequ.deKeys, this._deKeylineCont);

    this._sequences.push(sequ);

    sequ.on('select', this._onSelectSequence);
    sequ.on('change', this._onChangeSequence);

    sequ.on('changeHeight', function () {

        deContOpt.style.height = sequ.height() + 'px';
        deContKf.style.height = sequ.height() + 'px';
    });

    function createCont(content, parent) {

        var de = document.createElement('div');
        de.style.width = '100%';
        de.style.height = sequ.height() + 'px';
        de.style.overflow = 'hidden';
        de.style.transform = 'height 0.12 easeOut';
        de.appendChild(content);
        parent.appendChild(de);

        return de;
    }
}

Object.defineProperty(p, 'currTime', {
    get: function () {
        return this._timebar._currTime
    }
});

Object.defineProperty(p, 'timescale', {
    get: function () {
        return this._timebar.timescale
    }
});

Object.defineProperty(p, 'length', {
    get: function () {
        return this._timebar._end - this._timebar._start;
    }
});

p._onSelectSequence = function(sequ) {

    if (this._currSequence === sequ) 
        return;

    if (this._currSequence) {
        
        this._currSequence.deselect(); 
    }

    this._currSequence = sequ;
};

p._onChangeSequence = function(sequ) {

    this._refreshMagnetPoints();
};

p._onChangeTime = function () {

    var left = this.currTime * this.timescale;
    this._dePointerLine.style.left = left + 'px';
};

p._onChangeTape = function () {

    this._deKeylineCont.style.left = (this._timebar.start * this.timescale) + 'px';
};

p._onWindowResize = function () {

    this._refreshTimebarWidth();
};

p._refreshMagnetPoints = function () {

    var magnetPoints = [];

    this._sequences.forEach(function (sequ) {

        if (typeof sequ.getMagnetPoints === 'function') {

            magnetPoints = magnetPoints.concat(sequ.getMagnetPoints());
        }
    });

    magnetPoints = _.uniq(magnetPoints);

    this._timebar.magnetPoints = magnetPoints;
};

p._refreshTimebarWidth = function () {

    this._timebar.width = this._deRight.offsetWidth;
};



p.getScript = function (opt) {

    opt = opt || {};

    var script, playerScripts = [];

    this._sequences.forEach(function (sequ) {

        playerScripts.push(sequ.getScript());
    });

    script = Mustache.render(mstSaveScript, {
        name: 'anim1',
        saveData: opt.save && this.getSave(),
        sequPlayerGens: playerScripts.join(',\n'),
        autoPlay: opt.autoPlay
    });

    console.log(script);

    return script;
}

p.getSave = function () {

    var save = {
        currTime: this.currTime,
        timescale: this.timescale,
        sequences: []
    };

    this._sequences.forEach(function (sequ) {

        save.sequences.push({
            type: sequ.type,
            data: sequ.getSave()
        });
    });

    console.log(JSON.stringify(save));

    return JSON.stringify(save);
};

p.useSave = function (save) {

    this.currTime = save.currTime;
    this.timescale = save.timescale;

    save.sequences.forEach(function (sequData) {

        var sequ = new am.sequenceTypes[sequData.type]();
        sequ.useSave(sequData.data)
        this.addSequence(sequ);
    }, this);
};

p.clear = function () {
    //TODO
}







p._createBase = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.backgroundColor = amgui.color.bg0; 
    this.domElem.style.display = 'flex'; 
    this.domElem.style.pointerEvents = 'auto'; 

    this._deLeft = document.createElement('div');
    this._deLeft.style.backgroundColor = amgui.color.bg0;
    this._deLeft.style.width = '230px';
    this._deLeft.style.height = '100%';
    this.domElem.appendChild(this._deLeft);

    this._deDivider = document.createElement('div');
    this._deDivider.style.backgroundColor = amgui.color.bg3;
    this._deDivider.style.width = '1px';
    this._deDivider.style.height = '100%';
    this.domElem.appendChild(this._deDivider);

    this._deRight = document.createElement('div');
    this._deRight.style.position = 'relative';
    this._deRight.style.backgroundColor = amgui.color.bg0;
    this._deRight.style.flex = '1';
    this._deRight.style.height = '100%';
    this.domElem.appendChild(this._deRight);

    this._deKeylineCont = document.createElement('div');
    this._deKeylineCont.style.position = 'relative';
    this._deKeylineCont.style.height = '100%';
    this._deRight.appendChild(this._deKeylineCont);

    this._initDividerMoving();
};

p._createTimeline = function () {

    this._deRight.style.backgroundColor = amgui.color.bg1;
    this._deRight.position = 'absolute';
    this._deRight.style.top = '0px';
    this._deRight.style.right = '0px';
    this._deRight.style.width = '30%';
    this._deRight.style.height = '100%';
};


p._createSettingsHead = function () {

    this._deSettingsHead = document.createElement('div');
    this._deSettingsHead.style.backgroundColor = 'darkgreey';
    this._deSettingsHead.style.width = '100%';
    this._deSettingsHead.style.height = this._headerH + 'px';
    this._deLeft.appendChild(this._deSettingsHead);

    this._btnNewSequ = amgui.createIconBtn({
        icon: 'plus-squared',
        parent: this._deSettingsHead,
        display: 'inline-block'
    });
    this._dropdownNewSequ = amgui.createDropdown({options: ['css', 'script', 'attribute', 'media', 'timeline']});
    amgui.bindDropdown({
        deTarget: this._btnNewSequ,
        deMenu: this._dropdownNewSequ
    });

    
    this._btnPlay = amgui.createToggleIconBtn({
        iconOn: 'pause', 
        iconOff: 'play',
        parent: this._deSettingsHead,
        display: 'inline-block'
    });
};

p._createPointerLine = function () {

    this._dePointerLine = document.createElement('div');
    this._dePointerLine.style.top = this._headerH + 'px';
    this._dePointerLine.style.width = '0px';
    this._dePointerLine.style.position = 'absolute';
    this._dePointerLine.style.userSelect = 'none';
    this._dePointerLine.style.height = '100%';
    this._dePointerLine.style.borderLeft = '1px solid red';
    this._deRight.appendChild(this._dePointerLine);
};



p._initDividerMoving = function () {

    that = this;

    this._deDivider.style.cursor = 'ew-resize';

    this._deDivider.addEventListener('mousedown', down);

    function down(e) {

        e.stopPropagation();
        e.preventDefault();
        
        window.addEventListener('mousemove', drag);
        window.addEventListener('mouseup', end);
        window.addEventListener('mouseleave', end);
    }

    function drag(e) {

        var left = e.pageX - that.domElem.getBoundingClientRect().left;

        that._deDivider.style.left = left + 'px';
        that._deLeft.style.width = left + 'px';

        that._refreshTimebarWidth();
    }

    function end(e) {
        
        window.removeEventListener('mousemove', drag);
        window.removeEventListener('mouseup', end);
        window.removeEventListener('mouseleave', end);
    }
};
},{"../amgui":"/home/azazdeaz/repos/animachine/src/editor/amgui/amgui.js","./Timebar":"/home/azazdeaz/repos/animachine/src/editor/timeline/Timebar.js","./script.save.mst":"/home/azazdeaz/repos/animachine/src/editor/timeline/script.save.mst","events":"/home/azazdeaz/repos/animachine/node_modules/events/events.js","inherits":"/home/azazdeaz/repos/animachine/node_modules/inherits/inherits_browser.js"}],"/home/azazdeaz/repos/animachine/src/editor/timeline/decorTimebarNavigator.js":[function(require,module,exports){
'use strict';

var amgui = require('../amgui');


function decorTimebarNavigator (timebar) {

    var deNav, deLeftHand, deRightHand, 
        dragMode = 'move', mdX, mdStart, mdEnd;
    
    createBase();
    timebar.domElem.appendChild(deNav);

    deNav.addEventListener('mousedown', onMDown);
    deNav.addEventListener('mouseenter', onMEnter);
    deNav.addEventListener('mouseleave', onMLeave);

    timebar.on('changeTape', onChangeTape);

    function onChangeTape() {

        var width = timebar.width,
            max = timebar.maxTime,
            start = timebar.start,
            end = timebar.end;

        deNav.style.left = (width * (start / max)) + 'px';
        deNav.style.width = (width * ((end - start) / max)) + 'px';
    }

    function onMDown(e) {

        e.stopPropagation();
        e.preventDefault();

        if (e.target === deLeftHand) dragMode = 'start';
        else if (e.target === deRightHand) dragMode = 'end';
        else dragMode = 'move';

        mdX = e.pageX;
        mdStart = timebar.start;
        mdEnd = timebar.end;

        window.addEventListener('mousemove', onMMove);
        window.addEventListener('mouseup', onMUp);
        window.addEventListener('mouseleave', onMUp);
    }

    function onMMove(e) {

        var move = (e.pageX - mdX) * timebar.maxTime,
            start = mdStart + move,
            length = mdEnd + timebar.start;

        if (dragMode === 'move') {

            timebar.start = start;
        }
        else if (dragMode === 'start') {

            timebar.start = start;
            timebar.length = length;
        }
        else if (dragMode === 'end') {

            timebar.length = length;
        }
    }

    function onMUp() {

        window.removeEventListener('mousemove', onMMove);
        window.removeEventListener('mouseup', onMUp);
        window.removeEventListener('mouseleave', onMUp);
    }

    function onMEnter() {

        deNav.style.transform = 'scaleY(1)';
    }

    function onMLeave() {

        deNav.style.transform = 'scaleY(0.7)';
    }

    function createBase () {

        deNav = document.createElement('div');
        deNav.style.position = 'absolute';
        deNav.style.top = '0px';
        deNav.style.height = '3px';
        deNav.style.cursor = 'move';
        deNav.style.transformOrigin = 'center top';
        deNav.style.background = amgui.color.bg2;

        deRightHand = createHandler('right');
        deLeftHand = createHandler('left');
    }

    function createHandler(side) {

        var de = document.createElement('div');
        de.style.position = 'absolute';
        de.style[side] = '0px';
        de.style.top = '0px';
        de.style.height = '100%';
        de.style.width = '5%';
        de.style.minWidth = '1px';
        de.style.maxWidth = '7px';
        de.style.cursor = 'ew-resize';
        de.style.transformOrigin = 'center top';
        de.style.transform = 'scaleY(0.3)';
        deNav.appendChild(de);
    }
}

module.exports = decorTimebarNavigator;
},{"../amgui":"/home/azazdeaz/repos/animachine/src/editor/amgui/amgui.js"}],"/home/azazdeaz/repos/animachine/src/editor/timeline/script.save.mst":[function(require,module,exports){
module.exports = ";(function (root) {\n    'use strict';\n\n    root.am = root.am || {};\n    root.am.pageScripts = root.am.pageScripts || {};\n\n    var sequPlayerGens = [{{{sequPlayerGens}}}];\n\n    var reg = root.am.pageScripts.{{name}} = {\n        \n        createPlayer: function () {\n\n            var sequencePlayers = [];\n\n            sequPlayerGens.forEach(function (create) {\n\n                sequencePlayers.push(create());\n            });\n\n            return {\n                play: callPlayers.bind(null, 'play'),\n                pause: callPlayers.bind(null, 'pause'),\n                seek: callPlayers.bind(null, 'seek'),\n            };\n\n            function callPlayers(fnName, arg1) {\n\n                sequencePlayers.forEach(function (sequencePlayer) {\n\n                    sequencePlayer[fnName].call(null, arg1);\n                });\n            }\n        },\n        \n        {{#saveData}}\n        saveData: {{{saveData}}},\n        {{/saveData}}\n    };\n\n    {{#autoPlay}}\n    if (document.readyState == 'interactive' || document.readyState == 'complete') {\n\n        reg.createPlayer().play();\n    }\n    else {\n        document.addEventListener('DOMContentLoaded', function () {\n\n            reg.createPlayer().play();\n        });\n    }\n    {{/autoPlay}}\n}(this));";

},{}],"/home/azazdeaz/repos/animachine/src/editor/toolbar/Toolbar.js":[function(require,module,exports){
'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../amgui');

function Toolbar() {

    EventEmitter.call(this);

    this._height = 32;
    this._icons = [];
    this._separators = {};

    this.domElem = document.createElement('div');
    this.domElem.style.position = 'fixed';
    this.domElem.style.backgroundColor = 'darkslategrey';
    this.domElem.style.pointerEvents = 'auto';
    this.domElem.style.height = this._height + 'px';

    this.addSeparator('tools');
    this.addSeparator('handler');
    this.addSeparator('global');
    this.addSeparator('rest');
}

inherits(Toolbar, EventEmitter);
var p = Toolbar.prototype;
module.exports = Toolbar;


p.addIcon = function (opt) {

    var deIcon = opt.deIcon || amgui.createIconBtn({
        width: 32,
        height: 32,
        fontSize: '32px',
        icon: opt.icon,
        onClick: opt.onClick
    });

    amgui.addTooltip({
        deTarget: deIcon,
        text: 'tooltip',
        side: 'bottom'
    });

    deIcon.style.display = 'inline-block';

    this.domElem.insertBefore(deIcon, this._separators[opt.separator || 'rest']);

    return deIcon;
};

p.removeIcon = function (deIcon) {

    deIcon.parentNode.removeChild(deIcon);
} 

p.addSeparator = function (name) {

    var de = document.createElement('span');
    this.domElem.appendChild(de);
    this._separators[name] = de;
};
},{"../amgui":"/home/azazdeaz/repos/animachine/src/editor/amgui/amgui.js","events":"/home/azazdeaz/repos/animachine/node_modules/events/events.js","inherits":"/home/azazdeaz/repos/animachine/node_modules/inherits/inherits_browser.js"}],"/home/azazdeaz/repos/animachine/src/editor/transhand/Transhand.js":[function(require,module,exports){
var Transformer = require('./hands/Transformer');
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

function Transhand() {

    EventEmitter.call(this);

    this.hands = {};

    [Transformer].forEach(function (Hand) {

        var hand = new Hand();

        hand.on('change', this.emit.bind(this, 'change'));

        this.hands[Hand.id] = hand;
    }, this);
}

inherits(Transhand, EventEmitter);

var p = Transhand.prototype;

p.setup = function (opt) {

    var hand = this.hands[opt.hand.type];

    if (hand) {

        hand.setup(opt.hand);
        this.domElem = hand.domElem;
        this._currHand = hand;
    }
    else {
        throw 'Unknown hand type: ' + opt.hand.type
    }

    if (typeof(opt.on) === 'object') {

        Object.keys(opt.on).forEach(function (eventType) {

            this.on(eventType, opt.on[eventType]);
        }, this);
    }
};

p.activate = function () {

    if (this._currHand) {

        this._currHand.activate();
    }
};

p.deactivate = function () {

    if (this._currHand) {

        this._currHand.deactivate();
    }
};

module.exports = Transhand;
},{"./hands/Transformer":"/home/azazdeaz/repos/animachine/src/editor/transhand/hands/Transformer.js","events":"/home/azazdeaz/repos/animachine/node_modules/events/events.js","inherits":"/home/azazdeaz/repos/animachine/node_modules/inherits/inherits_browser.js"}],"/home/azazdeaz/repos/animachine/src/editor/transhand/hands/Transformer.js":[function(require,module,exports){
'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var _ = require('lodash');

var MOUSESTATES = {
    'move': 'move',
    'rotate': 'grab',
    'origin': 'hairline',
    '1000': 'ns-resize',
    '1100': 'nesw-resize',
    '0100': 'ew-resize',
    '0110': 'nwse-resize',
    '0010': 'ns-resize',
    '0011': 'nesw-resize',
    '0001': 'ew-resize',
    '1001': 'nwse-resize',
};


function Transformer() {

    EventEmitter.call(this);

    this._params = {
        tx: 0, ty: 0,
        sx: 1, sy: 1,
        rz: 0,
        ox: 0.5, oy: 0.5
    };
    this._base = {x: 0, y: 0, w: 0, h: 0};
    this._points = [{}, {}, {}, {}];
    this._pOrigin = {};
    this._originRadius = 6;

    this._onDrag = this._onDrag.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
}

Transformer.id = 'transformer';

inherits(Transformer, EventEmitter);

var p = Transformer.prototype;

p.setup = function (opt) {

    if (!this.domElem) {
        this.createGraphics();
    }

    _.extend(this._params, opt.params);
    _.extend(this._base, opt.base);
    this._refreshPoints();
    this._renderHandler();
};

p.activate = function () {

    if (this._isActivated) return;
    this._isActivated = true;

    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mousedown', this._onMouseDown);
};

p.deactivate = function () {

    if (!this._isActivated) return;
    this._isActivated = false;
    
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mousedown', this._onMouseDown);
};

p.createGraphics = function () {

    this.domElem = document.createElement('canvas');
    this.domElem.style.position = 'fixed';
    this.domElem.style.pointerEvents = 'none';
    // this.domElem.style.border = '1px solid red';
};

p._refreshPoints = function () {

    var base = this._base, 
        params = this._params,
        p = this._points,
        po = this._pOrigin;

    base.x += params.tx;
    base.y += params.ty;

    po.x = base.x + (base.w * params.ox);
    po.y = base.y + (base.h * params.oy);

    var tox = base.x + params.ox * base.w,
        toy = base.y + params.oy * base.h;

    t(p[0], base.x, base.y);
    t(p[1], base.x + base.w, base.y);
    t(p[2], base.x + base.w, base.y + base.h);
    t(p[3], base.x, base.y + base.h);

    function t(p, x, y) {

        var dx = (x - tox) * params.sx,
            dy = (y - toy) * params.sy,
            d = Math.sqrt(dx*dx + dy*dy),
            rad = Math.atan2(dy, dx) + params.rz;

        p.x = tox + (d * Math.cos(rad));
        p.y = toy + (d * Math.sin(rad));
    }
};

p._renderHandler = function () {

    var p = this._points,
        po = this._pOrigin,
        c = this.domElem,
        or = this._originRadius,
        ctx = c.getContext('2d'),
        margin = 2,
        minX = Math.min(p[0].x, p[1].x, p[2].x, p[3].x),
        maxX = Math.max(p[0].x, p[1].x, p[2].x, p[3].x),
        minY = Math.min(p[0].y, p[1].y, p[2].y, p[3].y),
        maxY = Math.max(p[0].y, p[1].y, p[2].y, p[3].y);

    c.style.left = (minX - margin) + 'px';
    c.style.top = (minY - margin) + 'px';
    c.width = (maxX - minX) + (margin * 2);
    c.height = (maxY - minY) + (margin * 2);

    ctx.save();
    ctx.translate(margin - minX, margin - minY);
    ctx.beginPath();
    ctx.moveTo(p[0].x, p[0].y);
    ctx.lineTo(p[1].x, p[1].y);
    ctx.lineTo(p[2].x, p[2].y);
    ctx.lineTo(p[3].x, p[3].y);
    ctx.closePath();

    ctx.moveTo(po.x - or, po.y);
    ctx.lineTo(po.x + or, po.y);
    ctx.moveTo(po.x, po.y - or);
    ctx.lineTo(po.x, po.y + or);
    

    ctx.strokeStyle = '#4f2';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
};


p._onMouseMove = function (e) {

    if (!this._isHandle) {

        this._setFinger(e);
    }
};

p._onDrag = function (e) {

    var params = this._params,
        base = this._base,
        pOrigin = this._pOrigin,
        md = this._mdPos,
        finger = this._finger,
        pMouse = {x: e.pageX, y: e.pageY},
        dx = pMouse.x - md.pMouse.x,
        dy = pMouse.y - md.pMouse.y,
        mr, dr,
        change = {};

    if (finger === 'origin') {
        // change.ox = p.ox = sp.ox + (dx / this._base.w);
        // change.oy = p.oy = sp.oy + (dy / this._base.h);
    }
        
    if (finger === 'move') {
        change.tx = params.tx = md.params.tx + dx;
        change.ty = params.ty = md.params.ty + dy;
    }
    //TODO
    if (finger.charAt(0) === '1') {

        setScale(-Math.PI/2, 'sy');
    }

    if (finger.charAt(1) === '1') {

        setScale(0, 'sx');
    }

    if (finger.charAt(2) === '1') {

        setScale(Math.PI/2, 'sy');
    }

    if (finger.charAt(3) === '1') {

        setScale(Math.PI, 'sx');
    }

    if (finger === 'rotate') {

        setRotation();
    }

    this.emit('change', change, 'transform');

    function setScale(r, s) {

        var rad = r + md.params.rz,
            mdDist = distToPointInAngle(pOrigin, md.pMouse, rad),
            dragDist = distToPointInAngle(pOrigin, pMouse, rad);

        change[s] = params[s] = (dragDist / mdDist) * md.params[s];
    }

    function setRotation() {

        var opx = base.x + base.w * params.ox,
            opy = base.y + base.h * params.oy,
            mdx = md.pMouse.x - opx,
            mdy = md.pMouse.y - opy,
            mdr = Math.atan2(mdy, mdx),
            mx = pMouse.x - opx,
            my = pMouse.y - opy,
            mr = Math.atan2(my, mx);

        change.rz = params.rz = md.params.rz + (mr - mdr);
    }
};

p._setFinger = function (e) {

    var base = this._base,
        params = this._params,
        p = this._points,
        po = this._pOrigin,
        diff = 3,
        rDiff = 9,
        mx = e.pageX,
        my = e.pageY,
        mp = {x: mx, y: my},
        dTop = distToSegment(mp, p[0], p[1]),
        dLeft = distToSegment(mp, p[1], p[2]),
        dBottom = distToSegment(mp, p[2], p[3]),
        dRight = distToSegment(mp, p[3], p[0]),
        dOrigin = dist2(mp, po),
        top = dTop < diff,
        left = dLeft < diff,
        bottom = dBottom < diff,
        right = dRight < diff,
        inside = isInside(mp, p);

    if (base.width * params.sx < diff * 2 && inside) {
        
        left = false;
        right = false;
    }

    if (base.height * params.sy < diff * 2 && inside) {
    
        top = false;
        bottom = false;
    }
    
    if (dOrigin < this._originRadius) {

        this._finger = 'origin';
    }
    else if (top || right || bottom || left) {

        this._finger = ('000' + (top * 1000 + left * 100 + bottom * 10 + right * 1)).substr(-4);
    }
    else if (inside) {

        this._finger = 'move';
    }
    else if (dTop < rDiff || dRight < rDiff || dBottom < rDiff || dLeft < rDiff) {

        this._finger = 'rotate';
    }
    else {
        this._finger = false;
    }

    if (this._finger) {

        this.domElem.style.pointerEvents = 'auto';
        this.domElem.style.cursor = MOUSESTATES[this._finger];
    }
    else {
        this.domElem.style.pointerEvents = 'none';
        this.domElem.style.cursor = 'auto';
    }
};

p._onMouseDown = function (e) {

    if (!this._finger) {
        return;
    }

    e.stopPropagation();
    e.preventDefault();

    this._isHandle = true;

    this._mdPos = {
        pMouse: {x: e.pageX, y: e.pageY},
        params: _.cloneDeep(this._params),
        points: _.cloneDeep(this._points)
    };

    window.addEventListener('mouseup', this._onMouseUp);
    window.addEventListener('mouseup', this._onMouseUp);
    window.addEventListener('mousemove', this._onDrag);
};

p._onMouseUp = function () {

    window.removeEventListener('mouseup', this._onMouseUp);
    window.removeEventListener('mouseleave', this._onMouseUp);
    window.removeEventListener('mousemove', this._onDrag);
    
    this._isHandle = false;
};

function radDiff(r0, r1) {

    r0 %= Math.PI;
    r1 %= Math.PI;
    r0 += Math.PI;
    r1 += Math.PI;

    return r1 - r0;
}

function sqr(x) { 
    return x * x;
}

function dist2(v, w) { 
    return sqr(v.x - w.x) + sqr(v.y - w.y);
}

function distToSegmentSquared(p, v, w) {
  var l2 = dist2(v, w);
    
  if (l2 === 0) return dist2(p, v);
    
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    
  if (t < 0) return dist2(p, v);
  if (t > 1) return dist2(p, w);
    
  return dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
}

function distToSegment(p, v, w) { 
    return Math.sqrt(distToSegmentSquared(p, v, w));
}

function distToPointInAngle(p0, p1, rad) {

    var dx = p1.x - p0.x,
        dy = p1.y - p0.y,
        d = Math.sqrt(dx*dx + dy*dy),
        mRad = Math.atan2(dy, dx);

    rad = mRad - rad;

    // console.log('dx', dx, 'dy', dy, 'd', d, 'mRad', mRad, 'rad', rad, 'return', Math.cos(rad) * d)

    return Math.cos(rad) * d;

}

function isInside(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    
    var x = point.x, y = point.y;
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i].x, yi = vs[i].y;
        var xj = vs[j].x, yj = vs[j].y;
        
        var intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
}

module.exports = Transformer;

},{"events":"/home/azazdeaz/repos/animachine/node_modules/events/events.js","inherits":"/home/azazdeaz/repos/animachine/node_modules/inherits/inherits_browser.js","lodash":"/home/azazdeaz/repos/animachine/node_modules/lodash/dist/lodash.js"}],"/home/azazdeaz/repos/animachine/src/editor/warehouseman/Warehouseman.js":[function(require,module,exports){
'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var WebStorageman = require('./storages/WebStorageman');
var PageScript = require('./storages/PageScript');
var Download = require('./storages/Download');
var decorDialog = require('./decorDialog');

function Warehouseeman(opt) {

    EventEmitter.call(this);

    decorDialog(this);

    opt = opt || {};

    this._storages = [];
    this.addStorage(new PageScript());
    this.addStorage(new WebStorageman());
    this.addStorage(new Download());
    this.addStorage({icon: 'hdd'});
    this.addStorage({icon: 'git'});
    this.addStorage({icon: 'evernote'});
    this.addStorage({icon: 'dropbox'});

    this.selecteStorage(this._storages[0]);
}

inherits(Warehouseeman, EventEmitter);
var p = Warehouseeman.prototype;

p.addStorage = function (storage) {

    this._storages.push(storage);
    this.emit('changeStorages');
};

p.selecteStorage = function (storage) {

    this._currStorage = storage;
};

p.save = function (name, data, path) {

    return this._currStorage.save(name, data, path);
};

p.load = function (name, path   ) {

    return this._currStorage.load(name, path);
};

p.mkdir = function (path) {

    return this._currStorage.mkdir(path);
};

p.dir = function (path) {

    return this._currStorage.dir(path);
};

module.exports = Warehouseeman;


},{"./decorDialog":"/home/azazdeaz/repos/animachine/src/editor/warehouseman/decorDialog.js","./storages/Download":"/home/azazdeaz/repos/animachine/src/editor/warehouseman/storages/Download.js","./storages/PageScript":"/home/azazdeaz/repos/animachine/src/editor/warehouseman/storages/PageScript.js","./storages/WebStorageman":"/home/azazdeaz/repos/animachine/src/editor/warehouseman/storages/WebStorageman.js","events":"/home/azazdeaz/repos/animachine/node_modules/events/events.js","inherits":"/home/azazdeaz/repos/animachine/node_modules/inherits/inherits_browser.js"}],"/home/azazdeaz/repos/animachine/src/editor/warehouseman/decorDialog.js":[function(require,module,exports){
'use strict';

var amgui = require('../amgui');

function decorDialog(whm) {

    var dialog, deRoot, deLeft, deHead, deBreadcrumbs, inpName, 
        deStorageSelector, deDirectory, btnNewFolder, isInited, deOptions,
        selectedPath = '', selectedName = '', selectedData = '',
        openOptions = {};



    whm.showSaveDialog = function(opt) {

        init();

        openOptions = opt;

        selectedName = opt.name || '';
        selectedData = opt.data || '';
        selectedPath = opt.path || '';

        deBreadcrumbs.refresh();
        deDirectory.refresh();
        deStorageSelector.refresh();
        inpName.refresh();

        inpName.style.display = 'block';

        dialog.setTitle('Save');
        dialog.setButtons(['save', 'close']);
        refresh();
        dialog.showModal();
    };

    whm.showOpenDialog = function(name, path) {

        init();

        openOptions = opt;

        selectedName = opt.name || '';
        selectedPath = opt.path || '';

        deBreadcrumbs.refresh();
        deDirectory.refresh();
        deStorageSelector.refresh();

        inpName.style.display = 'none';

        dialog.setTitle('Save');
        dialog.setButtons(['open', 'close']);
        refresh();
        dialog.showModal();
    };

    whm.setSaveOtions = function (opt) {

        deOptions.setOptions(opt);
    };

    whm.getSaveOtions = function () {

        return deOptions.getOptions();
    };

    whm.on('changeSrorage', refresh);

    function refresh() {

        var f = whm._currStorage.features;

        showHide(deDirectory, f.browse);
        showHide(deBreadcrumbs, f.browse);
        showHide(btnNewFolder, f.mkdir);

        function showHide(de, show) {

            de.style.display = show ? 'block' || de.baseDisplay : 'hidden'
        }
    }

    function init () {

        if (isInited) {
            return;
        }
        isInited = true;

        createDialog();
        createStorageSelector();
        createBreadcrumbs();
        createBtnNewFolder();
        createBtnSettings()
        createNameInput();
        createDirectory();
        createOptions();
    }

    function onSave() {

        whm.save(selectedName. selectedData, selectedPath);
    }

    function onOpen() {

        whm.open(selectedName, selectedPath);
    }

    function createDialog () {

        deRoot = document.createElement('div');
        deRoot.style.width = '700px';
        deRoot.style.height = '400px';
        deRoot.style.display = 'flex';

        deLeft = document.createElement('div');
        deLeft.style.height = '100%';
        deLeft.style.flex = '1';
        deLeft.style.display = 'flex';
        deLeft.style.flexDirection = 'column';
        deRoot.appendChild(deLeft);

        deHead = document.createElement('div');
        deHead.style.width = '100%';
        deHead.style.height = '21px';
        deHead.style.display = 'flex';
        deLeft.appendChild(deHead);

        dialog = amgui.createDialog({
            content: deRoot,
            parent: am.deDialogCont
        });

        dialog.addEventListener('click_save', onSave);
        dialog.addEventListener('click_open', onOpen);
    }







    function createBreadcrumbs() {

        deBreadcrumbs = document.createElement('div');
        deBreadcrumbs.style.display = 'inline-block';
        deBreadcrumbs.style.flex = '1';
        deHead.appendChild(deBreadcrumbs);

        deBreadcrumbs.addEventListener('click', function () {

            if (this.crambValue) {

                whm.cd(this.crambValue);
            }
        });

        deBreadcrumbs.refresh = function () {

            var crumbs = selectedPath.split('/'),
                value = '';

            deBreadcrumbs.innerHTML = '';

            crumbs.forEach(function (crumbName) {

                value += crumbName + '/';
                createCrumb(crumbName);
                createSlash();
            });
        };

        function createSlash() {

            var deSlash = createLi(' / ');
            deSlash.style.pointerEvents = 'none';

            return deSlash;
        }

        function createCrumb(content, value) {

            var deChrumb = createLi(content);
            deChrumb.style.pointerEvents = 'none';
            deChrumb.crumbValue = value;

            return deChrumb;
        }
  
        function createLi(content) {

            var li = document.createElement('span');
            li.textContent = content;

            deBreadcrumbs.appendChild(li);

            return li;
        }
    }



    function createBtnSettings() {

        btnNewFolder = amgui.createIconBtn({
            parent: deHead,
            icon: 'wrench',
            width: 21,
            onClick: function () {
                deOptions.toggle();
            }
        });
    }



    function createBtnNewFolder() {

        btnNewFolder = amgui.createIconBtn({
            parent: deHead,
            icon: 'folder-add',
            width: 21
        });
    }

    function createNameInput() {

        inpName = document.createElement('input');
        inpName.type = 'text';
        inpName.style.width = '100%';
        inpName.style.height = '21px';
        inpName.style.background = 'none';
        inpName.style.border = 'none';
        inpName.style.color = amgui.color.text;
        inpName.style.fontSize = amgui.FONT_SIZE;
        inpName.style.fontFamily = amgui.FONT_FAMILY;
        inpName.placeholder = 'File name';
        deLeft.appendChild(inpName);

        inpName.addEventListener('change', function () {

            selectedName = inpName.value;
        });

        inpName.refresh = function () {

            if (inpName.value !== selectedName) {

                inpName.value = selectedName;
            }
        }
    }


    function createDirectory() {

        deDirectory = document.createElement('div');
        deDirectory.style.listStyle = 'none';
        deDirectory.style.display = 'inline-block';
        deDirectory.style.width = '100%';
        deDirectory.style.flex = '1';
        deLeft.appendChild(deDirectory);

        deDirectory.addEventListener('click', onClick);
        deDirectory.addEventListener('dblclick', onClick);

        function onClick(e) {
            
            if (this._value) {

                selectedName = this._value;
            }

            if (e.type === 'dblclick') {

                whm.open(selectedPath + selectedName);
            }
        }

        deDirectory.refresh = function () {


        };
  
        function createItem(name, type) {

            var deItem = document.createElement('div');
            
            amgui.createIcon({
                icon: type === 'folder' ? 'folder-empty' : 'doc',
                parent: deItem,
                display: 'inline-block'
            });

            var deName = document.createElement('span');
            deName.textContent = name;
            deItem.appendChild(deName);

            deDirectory.appendChild(deItem);

            return deItem;
        }
    }




    function createStorageSelector() {

        var btnSize = 52;

        deStorageSelector = document.createElement('div');
        deStorageSelector.style.display = 'inline-block';
        deStorageSelector.style.width = btnSize + 'px';
        deStorageSelector.style.height = '100%';
        deRoot.insertBefore(deStorageSelector, deLeft);

        deStorageSelector.addEventListener('click', function () {

            if (this._storageIdx) {

                whm.selectStorage(whm._storages[this._storageIdx]);
            }
        });

        deStorageSelector.refresh = function () {

            deStorageSelector.innerHTML = '';

            whm._storages.forEach(function (storage, idx) {

                createItem(storage.icon, idx);
            });
        };
  
        function createItem(icon, value) {

            var deItem = document.createElement('div');
            
            deItem = amgui.createIconBtn({
                icon: icon,
                parent: deStorageSelector,
                width: btnSize,
                height: btnSize
            });

            deItem._storageIdx = value;
        }
    }

    function createOptions() {

        var isOpened = false;

        deOptions = document.createElement('div');
        deOptions.style.display = 'none';
        deOptions.style.width = '138px';
        deOptions.style.height = '100%';
        deRoot.appendChild(deOptions);

        var checkSave = createCheckbox('include save');
        var checkMinify = createCheckbox('minify');
        var checkAuto = createCheckbox('auto play');

        deOptions.getOptions = function () {

            return {
                includeSave: checkSave.checked,
                minify: checkMinify.checked,
                autoPlay: checkAuto.checked
            }
        };

        deOptions.setOptions = function (opt) {

            checkSave.checked = otp.includeSave;
            checkMinify.checked = otp.minify;
            checkAuto.checked = otp.autoPlay;
        };

        deOptions.toggle = function () {

            isOpened = !isOpened;

            deOptions.style.display = isOpened ? 'block' : 'none';
        }

        function createCheckbox(name) {

            var de = document.createElement('div');
            deOptions.appendChild(de);

            var cb = document.createElement('input');
            cb.type = 'checkbox';
            de.appendChild(cb);
            
            var label = document.createElement('label');
            label.style.color = amgui.color.text;
            label.textContent = name;
            de.appendChild(label);

            return cb;
        }
    }
}


module.exports = decorDialog;


},{"../amgui":"/home/azazdeaz/repos/animachine/src/editor/amgui/amgui.js"}],"/home/azazdeaz/repos/animachine/src/editor/warehouseman/storages/Download.js":[function(require,module,exports){
'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

var FOLDERS = '<folders>';

function PageScript(opt) {

    EventEmitter.call(this);

    opt = opt || {};

    this._root = opt.root || '_PageScript/';

    this.icon = 'down-circled2';

    this._folders = window.localStorage.getItem(this._root + FOLDERS);
    
    try { 
        this.folders = JSON.parse(this._folders); 
    }
    catch (e) {
        this._folders = [];
    }
}

inherits(PageScript, EventEmitter);
var p = PageScript.prototype;

p.features = {
    save: true,
}

p.save = function (name, data, path) {

    name = this._validName(name);
    
    this.mkdir(path);
    this._set(path + name, data);

    return name;
};

module.exports = PageScript;
},{"events":"/home/azazdeaz/repos/animachine/node_modules/events/events.js","inherits":"/home/azazdeaz/repos/animachine/node_modules/inherits/inherits_browser.js"}],"/home/azazdeaz/repos/animachine/src/editor/warehouseman/storages/PageScript.js":[function(require,module,exports){
'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

var FOLDERS = '<folders>';

function PageScript(opt) {

    EventEmitter.call(this);

    opt = opt || {};

    this._root = opt.root || '_PageScript/';

    this.icon = 'code';

    this._folders = window.localStorage.getItem(this._root + FOLDERS);
    
    try { 
        this.folders = JSON.parse(this._folders); 
    }
    catch (e) {
        this._folders = [];
    }
}

inherits(PageScript, EventEmitter);
var p = PageScript.prototype;

p.save = function (name, data, path) {

    name = this._validName(name);
    
    this.mkdir(path);
    this._set(path + name, data);

    return name;
};

p.open = function (name) {

    if (name in pageScripts()) {

        return pageScripts()[name];
    }
};

p.dir = function (path) {

    var ret = [];

    Object.keys(pageScripts()).forEach(function (key) {

        ret.push({
            name: key,
            type: 'file'
        });
    });

    return ret;
};

function pageScripts() {

    return (window.am && window.am.pageScripts) || [];
}

module.exports = PageScript;
},{"events":"/home/azazdeaz/repos/animachine/node_modules/events/events.js","inherits":"/home/azazdeaz/repos/animachine/node_modules/inherits/inherits_browser.js"}],"/home/azazdeaz/repos/animachine/src/editor/warehouseman/storages/WebStorageman.js":[function(require,module,exports){
'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

var FOLDERS = '<folders>';

function WebStorageman(opt) {

    EventEmitter.call(this);

    opt = opt || {};

    this._root = opt.root || '_webstorageman/';

    this.icon = 'bullseye';

    this._folders = window.localStorage.getItem(this._root + FOLDERS);
    
    try { 
        this.folders = JSON.parse(this._folders); 
    }
    catch (e) {
        this._folders = [];
    }
}

inherits(WebStorageman, EventEmitter);
var p = WebStorageman.prototype;

p.save = function (name, data, path) {

    name = this._validName(name);
    
    this.mkdir(path);
    this._set(path + name, data);

    return name;
};

p.load = function (name, path) {

    name = this._validName(name);
    path = this._validPath(path);
    
    return this._get(path + name);
};

p.mkdir = function (path) {

    path = this._validPath(path);
    path = path.split('/');

    var folderPath = '';

    path.forEach(function (folder) {

        if (folder === '') {
            return;
        }

        folderPath += folder + '/';

        if (this._folders.indexOf(folderPath) !== -1) {

            this._folders.push(folderPath);
        }
    });
};

p.dir = function (path) {

    path = this._root + this._validPath(path);

    var ret = [];

    Object.keys(window.localStorage).forEach(function (key) {

        testKey(key, 'file');
    });

    this._folders.forEach(function (key) {

        testKey(key, 'folder');
    });

    return ret;

    function testKey(key, type) {

        if (key.indexOf(path) === 0) {

            key = key.substr(path.length);
            
            if (key.indexOf('/') === -1) {

                ret.push({
                    name: key,
                    type: type
                });
            }
        }
    }
};

p._addFolder = function(path) {

    if (this._folders.indexOf(path) !== -1) {
        return;
    }

    this._folders.push(path);

};

p._set = function(path, data) {

    return window.localStorage.setItem(this._root + path, data);
};

p._get = function(path) {

    return window.localStorage.getItem(this._root + path);
};

p._validPath = function(path) {

    if (path.charAt(0) === '/') {
        path = path.substr(1);
    }

    if (path.charAt(path.length-1) !== '/') {
        path += '/';
    }

    return path;
};

p._validName = function(name) {

    return name.replace(/<|\//g, '_');
};

module.exports = WebStorageman;
},{"events":"/home/azazdeaz/repos/animachine/node_modules/events/events.js","inherits":"/home/azazdeaz/repos/animachine/node_modules/inherits/inherits_browser.js"}],"/home/azazdeaz/repos/animachine/src/editor/windooman/Container.js":[function(require,module,exports){
'use strict';

var Panel = require('./Panel');

function Container(opt) {

    this._createDomElem();

    this.direction = opt.direction || 'row';
    this._children = [];

    this.size = opt.size;
    this.scaleMode = opt.scaleMode;

    opt.children.forEach(function (cData) {

        if (cData.type === 'container') {

            this.addChild(new Container(cData));
        }
        else if (cData.type === 'panel') {

            this.addChild(new Panel(cData));
        }
    }, this);

    this._scaleChildren();
}

var p = Container.prototype;

Object.defineProperty(p, 'direction', {

    set: function (v) {

        this._direction = v;
        this.domElem.style.flexDirection = this._direction;
    },

    get: function () {

        return this._direction;
    }
});

p.addChild = function (child) {

    this._children.push(child);
    this.domElem.appendChild(child.domElem);

    this._scaleChildren();
};


p.findTab = function (name) {

    var tab;

    this._children.some(function (child) {

        tab = child.findTab(name);
        return tab;
    });

    return tab;
};

p._scaleChildren = function () {

    this._children.forEach(function (child) {

        var flex = '', width = '', height = ''; 

        if (child.scaleMode === 'fix') {

            if (this._direction.indexOf('row') === 0) {

                width = child.size + 'px'; 
            } else {
                height = child.size + 'px';
            }
        }
        else if (child.scaleMode === 'flex') {

            flex = child.size;
        }

        child.domElem.style.width = width;
        child.domElem.style.height = height;
        child.domElem.style.flex = flex;
    }, this);
};

p._createDomElem = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.width = '100%';
    this.domElem.style.height = '100%';
    this.domElem.style.display = 'flex';
    this.domElem.style.alignItems = 'stretch';
    // this.domElem.style.pointerEvents = 'none';
};

module.exports = Container;
},{"./Panel":"/home/azazdeaz/repos/animachine/src/editor/windooman/Panel.js"}],"/home/azazdeaz/repos/animachine/src/editor/windooman/Panel.js":[function(require,module,exports){
'use strict';

var Tab = require('./Tab');

function Panel(opt) {

    this._mode = opt.mode || 'tab';
    this._tabs = [];
    this._showHead = 'showHead' in opt ? opt.showHead : true;
    
    this.size = opt.size;
    this.scaleMode = opt.scaleMode;

    this._createDomElem();
    this._createTabBase();

    if (opt.tabs) {
        opt.tabs.forEach(this.addTab, this);
    }

    if (!this._tabs.some(function (tab) {return tab.selected}) &&
        this._tabs.length)
    {
        this._tabs[0].select();
    }
}

var p = Panel.prototype;

Object.defineProperty(p, 'mode', {

    set: function (v) {

        this._mode = v;
        this.domElem.style.pointerEvents = this._mode === 'empty' ? 'none' : 'auto';
        this._deTabBase.display = this._mode === 'tab' ? 'block' : 'none';
    },

    get: function () {

        return this._mode;
    }
});

p.addTab = function (tData) {

    var tab = new Tab(tData);
    this._deTabHead.appendChild(tab.deEar);
    this._deTabContent.appendChild(tab.domElem);
    this._tabs.push(tab);
};


p.findTab = function (name) {

    var tab;

    this._tabs.some(function (t) {

        if (t.name === name) {

            return (tab = t);
        }
    });

    return tab;
};

p.showTab = function (tab) {

    this._tabs.forEach(function (t) {
        
        if (tab === t) {
            t.select();
        }
        else {
            t.deselect();
        }
    });
};

p._createDomElem = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.width = '100%';
    this.domElem.style.height = '100%';
};

p._createTabBase = function () {

    this._deTabBase = document.createElement('div');
    this._deTabBase.style.width = '100%';
    this._deTabBase.style.height = '100%';
    this._deTabBase.style.display = 'flex';
    this._deTabBase.style.flexDirection = 'column';
    this.domElem.appendChild(this._deTabBase);

    this._deTabHead = document.createElement('div');
    this._deTabHead.style.width = '100%';
    this._deTabHead.style.height = '23px';
    this._deTabHead.style.display = 'flex';
    this._deTabHead.style.alignItems = 'stretch';
    if (this._showHead) {
        this._deTabBase.appendChild(this._deTabHead);
    }

    this._deTabContent = document.createElement('div');
    this._deTabContent.style.width = '100%';
    this._deTabContent.style.flex = 1;
    this._deTabBase.appendChild(this._deTabContent);
};

module.exports = Panel;
},{"./Tab":"/home/azazdeaz/repos/animachine/src/editor/windooman/Tab.js"}],"/home/azazdeaz/repos/animachine/src/editor/windooman/Tab.js":[function(require,module,exports){
'use strict';

function Tab(opt) {

    this.name = opt.name;
    this.selected = opt.selected;

    this._createDomElem();
    this.deEar = this._createTabEar();

    this[this.selected ? 'select' : 'deselect']();
}

var p = Tab.prototype;

p.setContent = function (deContent) {

    this.domElem.innerHTML = '';
    this.domElem.appendChild(deContent);
};

p.select = function () {

    this.domElem.style.display = 'block';
    this.deEar.style.borderBottomWidth = '2px';
};

p.deselect = function () {

    this.domElem.style.display = 'none';
    this.deEar.style.borderBottomWidth = '1px';
};

p._createDomElem = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.width = '100%';
    this.domElem.style.height = '100%';
    this.domElem.style.background = 'rgba(0,0,0,0.3)';
    this.domElem.style.pointerEvents = 'auto';
};

p._createTabEar = function () {

    var de = document.createElement('div');
    de.textContent = this.name;
    de.style.flex = 1;
    de.style.boxSizing = 'border-box';
    de.style.borderBottom = 'solid 1px white';
    de.style.alignItems = 'stretch';

    return de;
};

module.exports = Tab;
},{}],"/home/azazdeaz/repos/animachine/src/editor/windooman/Windooman.js":[function(require,module,exports){
'use strict';

var Container = require('./Container');

function Windooman() {

    this._tabMap = {};
    this._workspaces = {};

    this._createDomElem();
}

var p = Windooman.prototype;

p.loadWorkspaces = function (workspaces) {

    Object.keys(workspaces).forEach(function (name) {

        this._workspaces[name] = workspaces[name];
    }, this);
};

p.load = function (name) {

    var map = this._workspaces[name];

    if (!map || map.type !== 'container') {
        throw Error('can\'t load ' + map);
    }

    this._root = new Container(map);
    
    this.domElem.innerHTML = '';
    this.domElem.appendChild(this._root.domElem);

    Object.keys(this._tabMap).forEach(function (name) {

        this.placeTab(name, this._tabMap[name]);
    }, this);
};

p.findTab = function (name) {

    if (this._root) {

        return this._root.findTab(name);
    }
};

p.fillTab = function (name, content) {

    this._tabMap[name] = content;

    var tab = this.findTab(name);

    if (tab) {
        tab.setContent(content);
    }
};

p._createDomElem = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.width = '100%';
    this.domElem.style.height = '100%';
};

module.exports = Windooman;
},{"./Container":"/home/azazdeaz/repos/animachine/src/editor/windooman/Container.js"}]},{},["./src/editor/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2F6YXpkZWF6L3JlcG9zL2FuaW1hY2hpbmUvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4vc3JjL2VkaXRvci9tYWluLmpzIiwiL2hvbWUvYXphemRlYXovcmVwb3MvYW5pbWFjaGluZS9ub2RlX21vZHVsZXMvZG9tcmVhZHkvcmVhZHkuanMiLCIvaG9tZS9hemF6ZGVhei9yZXBvcy9hbmltYWNoaW5lL25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwiL2hvbWUvYXphemRlYXovcmVwb3MvYW5pbWFjaGluZS9ub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIi9ob21lL2F6YXpkZWF6L3JlcG9zL2FuaW1hY2hpbmUvbm9kZV9tb2R1bGVzL2xvZGFzaC9kaXN0L2xvZGFzaC5qcyIsIi9ob21lL2F6YXpkZWF6L3JlcG9zL2FuaW1hY2hpbmUvc3JjL2VkaXRvci9hbWd1aS9hbWd1aS5iZXppZXJFZGl0b3IuanMiLCIvaG9tZS9hemF6ZGVhei9yZXBvcy9hbmltYWNoaW5lL3NyYy9lZGl0b3IvYW1ndWkvYW1ndWkuanMiLCIvaG9tZS9hemF6ZGVhei9yZXBvcy9hbmltYWNoaW5lL3NyYy9lZGl0b3IvYXNzZXRzL2ZvbnRlbGxvL2NvbmZpZy5qc29uIiwiL2hvbWUvYXphemRlYXovcmVwb3MvYW5pbWFjaGluZS9zcmMvZWRpdG9yL21vZHVsZXMvY3NzL0Nzc1BhcmFtZXRlci5qcyIsIi9ob21lL2F6YXpkZWF6L3JlcG9zL2FuaW1hY2hpbmUvc3JjL2VkaXRvci9tb2R1bGVzL2Nzcy9Dc3NTZXF1ZW5jZS5qcyIsIi9ob21lL2F6YXpkZWF6L3JlcG9zL2FuaW1hY2hpbmUvc3JjL2VkaXRvci9tb2R1bGVzL2Nzcy9Dc3NUcmFuc2Zvcm1QYXJhbWV0ZXIuanMiLCIvaG9tZS9hemF6ZGVhei9yZXBvcy9hbmltYWNoaW5lL3NyYy9lZGl0b3IvbW9kdWxlcy9jc3MvS2V5LmpzIiwiL2hvbWUvYXphemRlYXovcmVwb3MvYW5pbWFjaGluZS9zcmMvZWRpdG9yL21vZHVsZXMvY3NzL2Nzc01vZHVsZS5qcyIsIi9ob21lL2F6YXpkZWF6L3JlcG9zL2FuaW1hY2hpbmUvc3JjL2VkaXRvci9tb2R1bGVzL2Nzcy9kaWFsb2dLZXlPcHRpb25zLmpzIiwiL2hvbWUvYXphemRlYXovcmVwb3MvYW5pbWFjaGluZS9zcmMvZWRpdG9yL21vZHVsZXMvY3NzL3NjcmlwdC5wbGF5ZXIubXN0IiwiL2hvbWUvYXphemRlYXovcmVwb3MvYW5pbWFjaGluZS9zcmMvZWRpdG9yL21vZHVsZXMvY3NzL3VuY2FsYy5qcyIsIi9ob21lL2F6YXpkZWF6L3JlcG9zL2FuaW1hY2hpbmUvc3JjL2VkaXRvci9xc2dlbi5qcyIsIi9ob21lL2F6YXpkZWF6L3JlcG9zL2FuaW1hY2hpbmUvc3JjL2VkaXRvci90aW1lbGluZS9UaW1lYmFyLmpzIiwiL2hvbWUvYXphemRlYXovcmVwb3MvYW5pbWFjaGluZS9zcmMvZWRpdG9yL3RpbWVsaW5lL1RpbWVsaW5lLmpzIiwiL2hvbWUvYXphemRlYXovcmVwb3MvYW5pbWFjaGluZS9zcmMvZWRpdG9yL3RpbWVsaW5lL2RlY29yVGltZWJhck5hdmlnYXRvci5qcyIsIi9ob21lL2F6YXpkZWF6L3JlcG9zL2FuaW1hY2hpbmUvc3JjL2VkaXRvci90aW1lbGluZS9zY3JpcHQuc2F2ZS5tc3QiLCIvaG9tZS9hemF6ZGVhei9yZXBvcy9hbmltYWNoaW5lL3NyYy9lZGl0b3IvdG9vbGJhci9Ub29sYmFyLmpzIiwiL2hvbWUvYXphemRlYXovcmVwb3MvYW5pbWFjaGluZS9zcmMvZWRpdG9yL3RyYW5zaGFuZC9UcmFuc2hhbmQuanMiLCIvaG9tZS9hemF6ZGVhei9yZXBvcy9hbmltYWNoaW5lL3NyYy9lZGl0b3IvdHJhbnNoYW5kL2hhbmRzL1RyYW5zZm9ybWVyLmpzIiwiL2hvbWUvYXphemRlYXovcmVwb3MvYW5pbWFjaGluZS9zcmMvZWRpdG9yL3dhcmVob3VzZW1hbi9XYXJlaG91c2VtYW4uanMiLCIvaG9tZS9hemF6ZGVhei9yZXBvcy9hbmltYWNoaW5lL3NyYy9lZGl0b3Ivd2FyZWhvdXNlbWFuL2RlY29yRGlhbG9nLmpzIiwiL2hvbWUvYXphemRlYXovcmVwb3MvYW5pbWFjaGluZS9zcmMvZWRpdG9yL3dhcmVob3VzZW1hbi9zdG9yYWdlcy9Eb3dubG9hZC5qcyIsIi9ob21lL2F6YXpkZWF6L3JlcG9zL2FuaW1hY2hpbmUvc3JjL2VkaXRvci93YXJlaG91c2VtYW4vc3RvcmFnZXMvUGFnZVNjcmlwdC5qcyIsIi9ob21lL2F6YXpkZWF6L3JlcG9zL2FuaW1hY2hpbmUvc3JjL2VkaXRvci93YXJlaG91c2VtYW4vc3RvcmFnZXMvV2ViU3RvcmFnZW1hbi5qcyIsIi9ob21lL2F6YXpkZWF6L3JlcG9zL2FuaW1hY2hpbmUvc3JjL2VkaXRvci93aW5kb29tYW4vQ29udGFpbmVyLmpzIiwiL2hvbWUvYXphemRlYXovcmVwb3MvYW5pbWFjaGluZS9zcmMvZWRpdG9yL3dpbmRvb21hbi9QYW5lbC5qcyIsIi9ob21lL2F6YXpkZWF6L3JlcG9zL2FuaW1hY2hpbmUvc3JjL2VkaXRvci93aW5kb29tYW4vVGFiLmpzIiwiL2hvbWUvYXphemRlYXovcmVwb3MvYW5pbWFjaGluZS9zcmMvZWRpdG9yL3dpbmRvb21hbi9XaW5kb29tYW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNub05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOWdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckhBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2WkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBkb21yZWFkeSA9IHJlcXVpcmUoJ2RvbXJlYWR5Jyk7XG52YXIgYW1ndWkgPSByZXF1aXJlKCcuL2FtZ3VpJyk7XG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xudmFyIFRyYW5zaGFuZCA9IHJlcXVpcmUoJy4vdHJhbnNoYW5kJyk7XG52YXIgVGltZWxpbmUgPSByZXF1aXJlKCcuL3RpbWVsaW5lJyk7XG52YXIgVG9vbGJhciA9IHJlcXVpcmUoJy4vdG9vbGJhcicpO1xudmFyIFdpbmRvb21hbiA9IHJlcXVpcmUoJy4vd2luZG9vbWFuJyk7XG52YXIgV2FyZWhvdXNlbWFuID0gcmVxdWlyZSgnLi93YXJlaG91c2VtYW4nKTtcbnZhciBtb2R1bGVzID0ge1xuICAgIGNzczogcmVxdWlyZSgnLi9tb2R1bGVzL2NzcycpXG59O1xudmFyIGV4dGVybmFsU3R5bGVzaGVldHMgPSBbXG4gICAgLy8gcmVxdWlyZSgnLi9hc3NldHMvZm9udGVsbG8vY3NzL2FtZ3VpLmNzcycpLFxuICAgIC8vIHJlcXVpcmUoJy4vYXNzZXRzL2RpYWxvZy1wb2x5ZmlsbC5jc3MnKSxcbl07XG5cblxuXG52YXIgaGFuZGxlckJ1ZmYgPSBbXTtcblxuXG52YXIgYW0gPSB3aW5kb3cuYW0gPSBtb2R1bGUuZXhwb3J0cyA9IF8uZXh0ZW5kKG5ldyBFdmVudEVtaXR0ZXIoKSwge1xuXG4gICAgc2VxdWVuY2VUeXBlczoge30sXG5cbiAgICBzZWxlY3RlZEVsZW1lbnQ6IHVuZGVmaW5lZCxcblxuICAgIHJlZ2lzdGVyU2VxdWVuY2VUeXBlOiBmdW5jdGlvbiAoU2VxdWVuY2UsIHR5cGUpIHtcblxuICAgICAgICB0aGlzLnNlcXVlbmNlVHlwZXNbdHlwZV0gPSBTZXF1ZW5jZTtcbiAgICB9XG59KTtcblxuYW0uZ2V0SGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcblxuICAgIGlmIChoYW5kbGVyQnVmZi5sZW5ndGgpIHtcblxuICAgICAgICByZXR1cm4gaGFuZGxlckJ1ZmYucG9wKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IFRyYW5zaGFuZCgpO1xuICAgIH1cbn07XG5cbmFtLnRocm93SGFuZGxlciA9IGZ1bmN0aW9uIChoYW5kbGVyKSB7XG5cbiAgICBoYW5kbGVyQnVmZi5wdXNoKGhhbmRsZXIpO1xufTtcblxuZG9tcmVhZHkoZnVuY3Rpb24gKCkge1xuXG4gICAgYW0ud29ya3NwYWNlID0gbmV3IFdpbmRvb21hbigpO1xuICAgIGFtLndvcmtzcGFjZS5sb2FkV29ya3NwYWNlcyh7XG4gICAgICAgIGJhc2U6IGdldEJhc2VXb3Jrc3BhY2UoKVxuICAgIH0pO1xuICAgIGFtLndvcmtzcGFjZS5sb2FkKCdiYXNlJyk7XG5cbiAgICBhbS5zdG9yYWdlID0gbmV3IFdhcmVob3VzZW1hbigpO1xuXG4gICAgYW0uZG9tRWxlbSA9IGNyZWF0ZUFtUm9vdCgpO1xuICAgIGFtLmRlSGFuZGxlckNvbnQgPSBjcmVhdGVBbUxheWVyKCk7XG4gICAgYW0uZGVHdWlDb250ID0gY3JlYXRlQW1MYXllcigpO1xuICAgIGFtLmRlRGlhbG9nQ29udCA9IGNyZWF0ZUFtTGF5ZXIoKTtcblxuXG4gICAgYW1ndWkuZGVPdmVybGF5Q29udCA9IGFtLmRlRGlhbG9nQ29udDtcblxuICAgIGFtLmRlR3VpQ29udC5hcHBlbmRDaGlsZChhbS53b3Jrc3BhY2UuZG9tRWxlbSk7XG5cbiAgICBhbS5kZVJvb3QgPSBkb2N1bWVudC5ib2R5O1xuICAgIGFtLnRvb2xiYXIgPSBuZXcgVG9vbGJhcigpO1xuICAgIGFtLnRvb2xiYXIuZG9tRWxlbS5zdHlsZS50b3AgPSAnMHB4JztcbiAgICBhbS53b3Jrc3BhY2UuZmlsbFRhYigndG9vbHMnLCBhbS50b29sYmFyLmRvbUVsZW0pO1xuICAgIGFtLnRpbWVsaW5lID0gbmV3IFRpbWVsaW5lKGFtKTtcblxuICAgIGFtLnRvb2xiYXIuYWRkSWNvbih7XG4gICAgICAgIGljb246ICd1cGxvYWQtY2xvdWQnLFxuICAgICAgICBvbkNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICB0aW1lbGluZVNhdmU6IGFtLnRpbWVsaW5lLmdldFNjcmlwdCgpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgYW0uc3RvcmFnZS5zaG93U2F2ZURpYWxvZygnZmlsZW5hbWUnLCB7XG5cbiAgICAgICAgICAgICAgICBnZXRTYXZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB2YXIgb3B0ID0gYW0uc3RvcmFnZS5nZXRTYXZlT3B0aW9ucygpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhbS50aW1lbGluZS5nZXRTY3JpcHQob3B0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgYW0udG9vbGJhci5hZGRJY29uKHtcbiAgICAgICAgaWNvbjogJ2Rvd25sb2FkLWNsb3VkJyxcbiAgICAgICAgb25DbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgYW0uc3RvcmFnZS5zaG93T3BlbkRpYWxvZyh7XG5cbiAgICAgICAgICAgICAgICBvbk9wZW46IGZ1bmN0aW9uIChzYXZlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZyhzYXZlKSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmUgPSBKU09OLnBhcnNlKHNhdmUpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgYW0udGltZWxpbmUuY2xlYXIoKTtcbiAgICAgICAgICAgICAgICAgICAgYW0udGltZWxpbmUudXNlU2F2ZShzYXZlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG5cbiAgICBhbS50b29sYmFyLmFkZEljb24oe1xuICAgICAgICBpY29uOiAnYmxhbmsnLFxuICAgICAgICBvbkNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBhbS50aW1lbGluZS51c2VTYXZlKHtcbiAgICAgICAgICAgICAgICBcImN1cnJUaW1lXCI6IDExMDAsXG4gICAgICAgICAgICAgICAgXCJ0aW1lc2NhbGVcIjogMC4wNSxcbiAgICAgICAgICAgICAgICBcInNlcXVlbmNlc1wiOiBbe1xuICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJjc3Nfc2VxdV90eXBlXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZGF0YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcInNlbGVjdG9yc1wiOiBbXCIjYm94WDVcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICBcInBhcmFtZXRlcnNcIjogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImtleXNcIjogW11cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJ0cmFuc2Zvcm1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImtleXNcIjogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR4XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR6XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJ4XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJ5XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJ6XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN4XCI6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5XCI6IDIuMjAyNTA1MjE5MjA2NjgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN6XCI6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInNrZXdYXCI6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInNrZXdZXCI6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBlcnNwZWN0aXZlXCI6IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0aW1lXCI6IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eFwiOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eVwiOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0elwiOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyeFwiOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyeVwiOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyelwiOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeFwiOiAzLjQyNzQ0OTYxNTgwMDY5NjQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN5XCI6IDEuMDE5NjY0NDEzODQwMzk5OSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3pcIjogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic2tld1hcIjogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic2tld1lcIjogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGVyc3BlY3RpdmVcIjogMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInRpbWVcIjogMTM4MFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGFtLnRpbWVsaW5lLmRvbUVsZW0uc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnO1xuICAgIGFtLnRpbWVsaW5lLmRvbUVsZW0uc3R5bGUud2lkdGggPSAnMTAwJSc7XG4gICAgYW0udGltZWxpbmUuZG9tRWxlbS5zdHlsZS5oZWlnaHQgPSAnMjMwcHgnO1xuICAgIGFtLnRpbWVsaW5lLmRvbUVsZW0uc3R5bGUuYm90dG9tID0gJzBweCc7XG4gICAgYW0ud29ya3NwYWNlLmZpbGxUYWIoJ3RpbWVsaW5lJywgYW0udGltZWxpbmUuZG9tRWxlbSk7XG5cbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25DbGlja1Jvb3QpO1xuXG4gICAgbW9kdWxlcy5jc3MuaW5pdChhbSk7XG59KTtcblxuZnVuY3Rpb24gb25DbGlja1Jvb3QoZSkge1xuXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgIHZhciBkZSA9IGUudGFyZ2V0O1xuXG4gICAgaWYgKGFtLnNlbGVjdGVkRWxlbWVudCAhPT0gZGUgJiYgaXNQaWNrYWJsZShkZSkpIHtcbiAgICAgICAgYW0uc2VsZWN0ZWRFbGVtZW50ID0gZGU7XG4gICAgICAgIFxuICAgICAgICBhbS5lbWl0KCdzZWxlY3REb21FbGVtZW50JywgYW0uc2VsZWN0ZWRFbGVtZW50KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGlzUGlja2FibGUoZGVUZXN0KSB7XG5cbiAgICB2YXIgZWRpdG9ycyA9IFthbS5kb21FbGVtXTtcblxuICAgIHJldHVybiBzdGVwKGRlVGVzdCk7XG5cbiAgICBmdW5jdGlvbiBzdGVwKGRlKSB7XG5cbiAgICAgICAgaWYgKGRlID09PSBkb2N1bWVudC5ib2R5KSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChlZGl0b3JzLmluZGV4T2YoZGUpICE9PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRlKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RlcChkZS5wYXJlbnROb2RlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQW1Sb290KCkge1xuICAgIFxuICAgIHZhciBkZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRlLnN0eWxlLnBvc2l0aW9uID0gJ2ZpeGVkJztcbiAgICBkZS5zdHlsZS5sZWZ0ID0gJzBweCc7XG4gICAgZGUuc3R5bGUudG9wID0gJzBweCc7XG4gICAgZGUuc3R5bGUud2lkdGggPSAnMTAwJSc7XG4gICAgZGUuc3R5bGUuaGVpZ2h0ID0gJzEwMCUnO1xuICAgIGRlLnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSc7XG4gICAgZGUuc3R5bGUudXNlclNlbGVjdCA9ICdub25lJztcbiAgICBkZS5zdHlsZS53ZWJrdFVzZXJTZWxlY3QgPSAnbm9uZSc7XG4gICAgZGUuc3R5bGUuZm9udEZhbWlseSA9IGFtZ3VpLkZPTlRfRkFNSUxZO1xuICAgIGRlLnN0eWxlLmNvbG9yID0gYW1ndWkuY29sb3IudGV4dDtcblxuICAgIHZhciB6SW5kZXggPSBnZXRNYXhaSW5kZXgoKTtcbiAgICBpZiAoekluZGV4KSB7XG4gICAgICAgIGRlLnN0eWxlLnpJbmRleCA9IHpJbmRleCArIDEwMDA7XG4gICAgfVxuXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkZSk7XG5cbiAgICBkZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoZSkge1xuXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9KTtcblxuICAgIHZhciBzciA9IGRlLmNyZWF0ZVNoYWRvd1Jvb3QoKTtcbiAgICAgICAgXG4gICAgc3IuYXBwZW5kQ2hpbGQoYW1ndWkuZ2V0U3R5bGVTaGVldCgpKTtcblxuICAgIGV4dGVybmFsU3R5bGVzaGVldHMuZm9yRWFjaChmdW5jdGlvbiAoY3NzKSB7XG5cbiAgICAgICAgdmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgICAgc3R5bGUuaW5uZXJIVE1MID0gY3NzO1xuICAgICAgICAvL1RPRE9cbiAgICAgICAgLy8gc3IuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICAgICAgICAvLyBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBzcjtcbiAgICAvLyByZXR1cm4gZGU7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUFtTGF5ZXIoKSB7XG5cbiAgICB2YXIgZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkZS5zdHlsZS5wb3NpdGlvbiA9ICdmaXhlZCc7XG4gICAgZGUuc3R5bGUud2lkdGggPSAnMTAwJSc7XG4gICAgZGUuc3R5bGUuaGVpZ2h0ID0gJzEwMCUnO1xuICAgIGFtLmRvbUVsZW0uYXBwZW5kQ2hpbGQoZGUpO1xuICAgIHJldHVybiBkZTtcbn1cblxuXG5cblxuZnVuY3Rpb24gZ2V0TWF4WkluZGV4KCkge1xuXG4gICAgdmFyIHpJbmRleCA9IDAsIGVscywgeCwgeExlbiwgZWwsIHZhbDtcblxuICAgIGVscyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyonKTtcbiAgICBmb3IgKHggPSAwLCB4TGVuID0gZWxzLmxlbmd0aDsgeCA8IHhMZW47IHggKz0gMSkge1xuICAgICAgZWwgPSBlbHNbeF07XG4gICAgICBpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpLmdldFByb3BlcnR5VmFsdWUoJ3Bvc2l0aW9uJykgIT09ICdzdGF0aWMnKSB7XG4gICAgICAgIHZhbCA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKS5nZXRQcm9wZXJ0eVZhbHVlKCd6LWluZGV4Jyk7XG4gICAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgICB2YWwgPSArdmFsO1xuICAgICAgICAgIGlmICh2YWwgPiB6SW5kZXgpIHtcbiAgICAgICAgICAgIHpJbmRleCA9IHZhbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHpJbmRleDsgICAgXG59XG5cblxuZnVuY3Rpb24gZ2V0QmFzZVdvcmtzcGFjZSgpIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdjb250YWluZXInLFxuICAgICAgICBkaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgICAgICBjaGlsZHJlbjogW3tcbiAgICAgICAgICAgICAgICB0eXBlOiAncGFuZWwnLFxuICAgICAgICAgICAgICAgIG1vZGU6ICd0YWInLFxuICAgICAgICAgICAgICAgIHNpemU6IDIzLFxuICAgICAgICAgICAgICAgIHNjYWxlTW9kZTogJ2ZpeCcsXG4gICAgICAgICAgICAgICAgc2hvd0hlYWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHRhYnM6IFt7bmFtZTogJ3Rvb2xzJ31dLFxuICAgICAgICAgICAgfSx7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2NvbnRhaW5lcicsXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAncm93JyxcbiAgICAgICAgICAgICAgICBzaXplOiAxMCxcbiAgICAgICAgICAgICAgICBzY2FsZU1vZGU6ICdmbGV4JyxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjogW3sgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAncGFuZWwnLFxuICAgICAgICAgICAgICAgICAgICBtb2RlOiAndGFiJyxcbiAgICAgICAgICAgICAgICAgICAgc2l6ZTogMyxcbiAgICAgICAgICAgICAgICAgICAgc2NhbGVNb2RlOiAnZmxleCcsXG4gICAgICAgICAgICAgICAgICAgIHRhYnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiAnQ3NzIFN0eWxlJ30sXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ0RvbSBUcmVlJ31cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH0sIHsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAncGFuZWwnLFxuICAgICAgICAgICAgICAgICAgICBtb2RlOiAnZW1wdHknLFxuICAgICAgICAgICAgICAgICAgICBzaXplOiAxMixcbiAgICAgICAgICAgICAgICAgICAgc2NhbGVNb2RlOiAnZmxleCdcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdwYW5lbCcsXG4gICAgICAgICAgICAgICAgbW9kZTogJ3RhYicsXG4gICAgICAgICAgICAgICAgc2l6ZTogNCxcbiAgICAgICAgICAgICAgICBzY2FsZU1vZGU6ICdmbGV4JyxcbiAgICAgICAgICAgICAgICBzaG93SGVhZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdGFiczogW3tuYW1lOiAndGltZWxpbmUnfV0sXG4gICAgICAgICAgICB9XVxuICAgIH07XG59XG5cbi8vL3BvbHlmaWxsc1xuaWYgKCFBcnJheS5wcm90b3R5cGUuZmluZCkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQXJyYXkucHJvdG90eXBlLCAnZmluZCcsIHtcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgdmFsdWU6IGZ1bmN0aW9uKHByZWRpY2F0ZSkge1xuICAgICAgaWYgKHRoaXMgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcnJheS5wcm90b3R5cGUuZmluZCBjYWxsZWQgb24gbnVsbCBvciB1bmRlZmluZWQnKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgcHJlZGljYXRlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ByZWRpY2F0ZSBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICAgIH1cbiAgICAgIHZhciBsaXN0ID0gT2JqZWN0KHRoaXMpO1xuICAgICAgdmFyIGxlbmd0aCA9IGxpc3QubGVuZ3RoID4+PiAwO1xuICAgICAgdmFyIHRoaXNBcmcgPSBhcmd1bWVudHNbMV07XG4gICAgICB2YXIgdmFsdWU7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGkgaW4gbGlzdCkge1xuICAgICAgICAgIHZhbHVlID0gbGlzdFtpXTtcbiAgICAgICAgICBpZiAocHJlZGljYXRlLmNhbGwodGhpc0FyZywgdmFsdWUsIGksIGxpc3QpKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfSk7XG59IiwiLyohXG4gICogZG9tcmVhZHkgKGMpIER1c3RpbiBEaWF6IDIwMTQgLSBMaWNlbnNlIE1JVFxuICAqL1xuIWZ1bmN0aW9uIChuYW1lLCBkZWZpbml0aW9uKSB7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcpIG1vZHVsZS5leHBvcnRzID0gZGVmaW5pdGlvbigpXG4gIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PSAnb2JqZWN0JykgZGVmaW5lKGRlZmluaXRpb24pXG4gIGVsc2UgdGhpc1tuYW1lXSA9IGRlZmluaXRpb24oKVxuXG59KCdkb21yZWFkeScsIGZ1bmN0aW9uICgpIHtcblxuICB2YXIgZm5zID0gW10sIGxpc3RlbmVyXG4gICAgLCBkb2MgPSBkb2N1bWVudFxuICAgICwgZG9tQ29udGVudExvYWRlZCA9ICdET01Db250ZW50TG9hZGVkJ1xuICAgICwgbG9hZGVkID0gL15sb2FkZWR8XmMvLnRlc3QoZG9jLnJlYWR5U3RhdGUpXG5cbiAgaWYgKCFsb2FkZWQpXG4gIGRvYy5hZGRFdmVudExpc3RlbmVyKGRvbUNvbnRlbnRMb2FkZWQsIGxpc3RlbmVyID0gZnVuY3Rpb24gKCkge1xuICAgIGRvYy5yZW1vdmVFdmVudExpc3RlbmVyKGRvbUNvbnRlbnRMb2FkZWQsIGxpc3RlbmVyKVxuICAgIGxvYWRlZCA9IDFcbiAgICB3aGlsZSAobGlzdGVuZXIgPSBmbnMuc2hpZnQoKSkgbGlzdGVuZXIoKVxuICB9KVxuXG4gIHJldHVybiBmdW5jdGlvbiAoZm4pIHtcbiAgICBsb2FkZWQgPyBmbigpIDogZm5zLnB1c2goZm4pXG4gIH1cblxufSk7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfVxuICAgICAgdGhyb3cgVHlwZUVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgdmFyIG07XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCFlbWl0dGVyLl9ldmVudHMgfHwgIWVtaXR0ZXIuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSAwO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKGVtaXR0ZXIuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gMTtcbiAgZWxzZVxuICAgIHJldCA9IGVtaXR0ZXIuX2V2ZW50c1t0eXBlXS5sZW5ndGg7XG4gIHJldHVybiByZXQ7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8qKlxuICogQGxpY2Vuc2VcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZGVybiAtbyAuL2Rpc3QvbG9kYXNoLmpzYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbjsoZnVuY3Rpb24oKSB7XG5cbiAgLyoqIFVzZWQgYXMgYSBzYWZlIHJlZmVyZW5jZSBmb3IgYHVuZGVmaW5lZGAgaW4gcHJlIEVTNSBlbnZpcm9ubWVudHMgKi9cbiAgdmFyIHVuZGVmaW5lZDtcblxuICAvKiogVXNlZCB0byBwb29sIGFycmF5cyBhbmQgb2JqZWN0cyB1c2VkIGludGVybmFsbHkgKi9cbiAgdmFyIGFycmF5UG9vbCA9IFtdLFxuICAgICAgb2JqZWN0UG9vbCA9IFtdO1xuXG4gIC8qKiBVc2VkIHRvIGdlbmVyYXRlIHVuaXF1ZSBJRHMgKi9cbiAgdmFyIGlkQ291bnRlciA9IDA7XG5cbiAgLyoqIFVzZWQgdG8gcHJlZml4IGtleXMgdG8gYXZvaWQgaXNzdWVzIHdpdGggYF9fcHJvdG9fX2AgYW5kIHByb3BlcnRpZXMgb24gYE9iamVjdC5wcm90b3R5cGVgICovXG4gIHZhciBrZXlQcmVmaXggPSArbmV3IERhdGUgKyAnJztcblxuICAvKiogVXNlZCBhcyB0aGUgc2l6ZSB3aGVuIG9wdGltaXphdGlvbnMgYXJlIGVuYWJsZWQgZm9yIGxhcmdlIGFycmF5cyAqL1xuICB2YXIgbGFyZ2VBcnJheVNpemUgPSA3NTtcblxuICAvKiogVXNlZCBhcyB0aGUgbWF4IHNpemUgb2YgdGhlIGBhcnJheVBvb2xgIGFuZCBgb2JqZWN0UG9vbGAgKi9cbiAgdmFyIG1heFBvb2xTaXplID0gNDA7XG5cbiAgLyoqIFVzZWQgdG8gZGV0ZWN0IGFuZCB0ZXN0IHdoaXRlc3BhY2UgKi9cbiAgdmFyIHdoaXRlc3BhY2UgPSAoXG4gICAgLy8gd2hpdGVzcGFjZVxuICAgICcgXFx0XFx4MEJcXGZcXHhBMFxcdWZlZmYnICtcblxuICAgIC8vIGxpbmUgdGVybWluYXRvcnNcbiAgICAnXFxuXFxyXFx1MjAyOFxcdTIwMjknICtcblxuICAgIC8vIHVuaWNvZGUgY2F0ZWdvcnkgXCJac1wiIHNwYWNlIHNlcGFyYXRvcnNcbiAgICAnXFx1MTY4MFxcdTE4MGVcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzXFx1MjAwNFxcdTIwMDVcXHUyMDA2XFx1MjAwN1xcdTIwMDhcXHUyMDA5XFx1MjAwYVxcdTIwMmZcXHUyMDVmXFx1MzAwMCdcbiAgKTtcblxuICAvKiogVXNlZCB0byBtYXRjaCBlbXB0eSBzdHJpbmcgbGl0ZXJhbHMgaW4gY29tcGlsZWQgdGVtcGxhdGUgc291cmNlICovXG4gIHZhciByZUVtcHR5U3RyaW5nTGVhZGluZyA9IC9cXGJfX3AgXFwrPSAnJzsvZyxcbiAgICAgIHJlRW1wdHlTdHJpbmdNaWRkbGUgPSAvXFxiKF9fcCBcXCs9KSAnJyBcXCsvZyxcbiAgICAgIHJlRW1wdHlTdHJpbmdUcmFpbGluZyA9IC8oX19lXFwoLio/XFwpfFxcYl9fdFxcKSkgXFwrXFxuJyc7L2c7XG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gbWF0Y2ggRVM2IHRlbXBsYXRlIGRlbGltaXRlcnNcbiAgICogaHR0cDovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtbGl0ZXJhbHMtc3RyaW5nLWxpdGVyYWxzXG4gICAqL1xuICB2YXIgcmVFc1RlbXBsYXRlID0gL1xcJFxceyhbXlxcXFx9XSooPzpcXFxcLlteXFxcXH1dKikqKVxcfS9nO1xuXG4gIC8qKiBVc2VkIHRvIG1hdGNoIHJlZ2V4cCBmbGFncyBmcm9tIHRoZWlyIGNvZXJjZWQgc3RyaW5nIHZhbHVlcyAqL1xuICB2YXIgcmVGbGFncyA9IC9cXHcqJC87XG5cbiAgLyoqIFVzZWQgdG8gZGV0ZWN0ZWQgbmFtZWQgZnVuY3Rpb25zICovXG4gIHZhciByZUZ1bmNOYW1lID0gL15cXHMqZnVuY3Rpb25bIFxcblxcclxcdF0rXFx3LztcblxuICAvKiogVXNlZCB0byBtYXRjaCBcImludGVycG9sYXRlXCIgdGVtcGxhdGUgZGVsaW1pdGVycyAqL1xuICB2YXIgcmVJbnRlcnBvbGF0ZSA9IC88JT0oW1xcc1xcU10rPyklPi9nO1xuXG4gIC8qKiBVc2VkIHRvIG1hdGNoIGxlYWRpbmcgd2hpdGVzcGFjZSBhbmQgemVyb3MgdG8gYmUgcmVtb3ZlZCAqL1xuICB2YXIgcmVMZWFkaW5nU3BhY2VzQW5kWmVyb3MgPSBSZWdFeHAoJ15bJyArIHdoaXRlc3BhY2UgKyAnXSowKyg/PS4kKScpO1xuXG4gIC8qKiBVc2VkIHRvIGVuc3VyZSBjYXB0dXJpbmcgb3JkZXIgb2YgdGVtcGxhdGUgZGVsaW1pdGVycyAqL1xuICB2YXIgcmVOb01hdGNoID0gLygkXikvO1xuXG4gIC8qKiBVc2VkIHRvIGRldGVjdCBmdW5jdGlvbnMgY29udGFpbmluZyBhIGB0aGlzYCByZWZlcmVuY2UgKi9cbiAgdmFyIHJlVGhpcyA9IC9cXGJ0aGlzXFxiLztcblxuICAvKiogVXNlZCB0byBtYXRjaCB1bmVzY2FwZWQgY2hhcmFjdGVycyBpbiBjb21waWxlZCBzdHJpbmcgbGl0ZXJhbHMgKi9cbiAgdmFyIHJlVW5lc2NhcGVkU3RyaW5nID0gL1snXFxuXFxyXFx0XFx1MjAyOFxcdTIwMjlcXFxcXS9nO1xuXG4gIC8qKiBVc2VkIHRvIGFzc2lnbiBkZWZhdWx0IGBjb250ZXh0YCBvYmplY3QgcHJvcGVydGllcyAqL1xuICB2YXIgY29udGV4dFByb3BzID0gW1xuICAgICdBcnJheScsICdCb29sZWFuJywgJ0RhdGUnLCAnRnVuY3Rpb24nLCAnTWF0aCcsICdOdW1iZXInLCAnT2JqZWN0JyxcbiAgICAnUmVnRXhwJywgJ1N0cmluZycsICdfJywgJ2F0dGFjaEV2ZW50JywgJ2NsZWFyVGltZW91dCcsICdpc0Zpbml0ZScsICdpc05hTicsXG4gICAgJ3BhcnNlSW50JywgJ3NldFRpbWVvdXQnXG4gIF07XG5cbiAgLyoqIFVzZWQgdG8gbWFrZSB0ZW1wbGF0ZSBzb3VyY2VVUkxzIGVhc2llciB0byBpZGVudGlmeSAqL1xuICB2YXIgdGVtcGxhdGVDb3VudGVyID0gMDtcblxuICAvKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHNob3J0Y3V0cyAqL1xuICB2YXIgYXJnc0NsYXNzID0gJ1tvYmplY3QgQXJndW1lbnRzXScsXG4gICAgICBhcnJheUNsYXNzID0gJ1tvYmplY3QgQXJyYXldJyxcbiAgICAgIGJvb2xDbGFzcyA9ICdbb2JqZWN0IEJvb2xlYW5dJyxcbiAgICAgIGRhdGVDbGFzcyA9ICdbb2JqZWN0IERhdGVdJyxcbiAgICAgIGZ1bmNDbGFzcyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgICBudW1iZXJDbGFzcyA9ICdbb2JqZWN0IE51bWJlcl0nLFxuICAgICAgb2JqZWN0Q2xhc3MgPSAnW29iamVjdCBPYmplY3RdJyxcbiAgICAgIHJlZ2V4cENsYXNzID0gJ1tvYmplY3QgUmVnRXhwXScsXG4gICAgICBzdHJpbmdDbGFzcyA9ICdbb2JqZWN0IFN0cmluZ10nO1xuXG4gIC8qKiBVc2VkIHRvIGlkZW50aWZ5IG9iamVjdCBjbGFzc2lmaWNhdGlvbnMgdGhhdCBgXy5jbG9uZWAgc3VwcG9ydHMgKi9cbiAgdmFyIGNsb25lYWJsZUNsYXNzZXMgPSB7fTtcbiAgY2xvbmVhYmxlQ2xhc3Nlc1tmdW5jQ2xhc3NdID0gZmFsc2U7XG4gIGNsb25lYWJsZUNsYXNzZXNbYXJnc0NsYXNzXSA9IGNsb25lYWJsZUNsYXNzZXNbYXJyYXlDbGFzc10gPVxuICBjbG9uZWFibGVDbGFzc2VzW2Jvb2xDbGFzc10gPSBjbG9uZWFibGVDbGFzc2VzW2RhdGVDbGFzc10gPVxuICBjbG9uZWFibGVDbGFzc2VzW251bWJlckNsYXNzXSA9IGNsb25lYWJsZUNsYXNzZXNbb2JqZWN0Q2xhc3NdID1cbiAgY2xvbmVhYmxlQ2xhc3Nlc1tyZWdleHBDbGFzc10gPSBjbG9uZWFibGVDbGFzc2VzW3N0cmluZ0NsYXNzXSA9IHRydWU7XG5cbiAgLyoqIFVzZWQgYXMgYW4gaW50ZXJuYWwgYF8uZGVib3VuY2VgIG9wdGlvbnMgb2JqZWN0ICovXG4gIHZhciBkZWJvdW5jZU9wdGlvbnMgPSB7XG4gICAgJ2xlYWRpbmcnOiBmYWxzZSxcbiAgICAnbWF4V2FpdCc6IDAsXG4gICAgJ3RyYWlsaW5nJzogZmFsc2VcbiAgfTtcblxuICAvKiogVXNlZCBhcyB0aGUgcHJvcGVydHkgZGVzY3JpcHRvciBmb3IgYF9fYmluZERhdGFfX2AgKi9cbiAgdmFyIGRlc2NyaXB0b3IgPSB7XG4gICAgJ2NvbmZpZ3VyYWJsZSc6IGZhbHNlLFxuICAgICdlbnVtZXJhYmxlJzogZmFsc2UsXG4gICAgJ3ZhbHVlJzogbnVsbCxcbiAgICAnd3JpdGFibGUnOiBmYWxzZVxuICB9O1xuXG4gIC8qKiBVc2VkIHRvIGRldGVybWluZSBpZiB2YWx1ZXMgYXJlIG9mIHRoZSBsYW5ndWFnZSB0eXBlIE9iamVjdCAqL1xuICB2YXIgb2JqZWN0VHlwZXMgPSB7XG4gICAgJ2Jvb2xlYW4nOiBmYWxzZSxcbiAgICAnZnVuY3Rpb24nOiB0cnVlLFxuICAgICdvYmplY3QnOiB0cnVlLFxuICAgICdudW1iZXInOiBmYWxzZSxcbiAgICAnc3RyaW5nJzogZmFsc2UsXG4gICAgJ3VuZGVmaW5lZCc6IGZhbHNlXG4gIH07XG5cbiAgLyoqIFVzZWQgdG8gZXNjYXBlIGNoYXJhY3RlcnMgZm9yIGluY2x1c2lvbiBpbiBjb21waWxlZCBzdHJpbmcgbGl0ZXJhbHMgKi9cbiAgdmFyIHN0cmluZ0VzY2FwZXMgPSB7XG4gICAgJ1xcXFwnOiAnXFxcXCcsXG4gICAgXCInXCI6IFwiJ1wiLFxuICAgICdcXG4nOiAnbicsXG4gICAgJ1xccic6ICdyJyxcbiAgICAnXFx0JzogJ3QnLFxuICAgICdcXHUyMDI4JzogJ3UyMDI4JyxcbiAgICAnXFx1MjAyOSc6ICd1MjAyOSdcbiAgfTtcblxuICAvKiogVXNlZCBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdCAqL1xuICB2YXIgcm9vdCA9IChvYmplY3RUeXBlc1t0eXBlb2Ygd2luZG93XSAmJiB3aW5kb3cpIHx8IHRoaXM7XG5cbiAgLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYCAqL1xuICB2YXIgZnJlZUV4cG9ydHMgPSBvYmplY3RUeXBlc1t0eXBlb2YgZXhwb3J0c10gJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXG4gIC8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYCAqL1xuICB2YXIgZnJlZU1vZHVsZSA9IG9iamVjdFR5cGVzW3R5cGVvZiBtb2R1bGVdICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuICAvKiogRGV0ZWN0IHRoZSBwb3B1bGFyIENvbW1vbkpTIGV4dGVuc2lvbiBgbW9kdWxlLmV4cG9ydHNgICovXG4gIHZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzICYmIGZyZWVFeHBvcnRzO1xuXG4gIC8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMgb3IgQnJvd3NlcmlmaWVkIGNvZGUgYW5kIHVzZSBpdCBhcyBgcm9vdGAgKi9cbiAgdmFyIGZyZWVHbG9iYWwgPSBvYmplY3RUeXBlc1t0eXBlb2YgZ2xvYmFsXSAmJiBnbG9iYWw7XG4gIGlmIChmcmVlR2xvYmFsICYmIChmcmVlR2xvYmFsLmdsb2JhbCA9PT0gZnJlZUdsb2JhbCB8fCBmcmVlR2xvYmFsLndpbmRvdyA9PT0gZnJlZUdsb2JhbCkpIHtcbiAgICByb290ID0gZnJlZUdsb2JhbDtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pbmRleE9mYCB3aXRob3V0IHN1cHBvcnQgZm9yIGJpbmFyeSBzZWFyY2hlc1xuICAgKiBvciBgZnJvbUluZGV4YCBjb25zdHJhaW50cy5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIHNlYXJjaC5cbiAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2VhcmNoIGZvci5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtmcm9tSW5kZXg9MF0gVGhlIGluZGV4IHRvIHNlYXJjaCBmcm9tLlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgbWF0Y2hlZCB2YWx1ZSBvciBgLTFgLlxuICAgKi9cbiAgZnVuY3Rpb24gYmFzZUluZGV4T2YoYXJyYXksIHZhbHVlLCBmcm9tSW5kZXgpIHtcbiAgICB2YXIgaW5kZXggPSAoZnJvbUluZGV4IHx8IDApIC0gMSxcbiAgICAgICAgbGVuZ3RoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwO1xuXG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIGlmIChhcnJheVtpbmRleF0gPT09IHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBpbmRleDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIGltcGxlbWVudGF0aW9uIG9mIGBfLmNvbnRhaW5zYCBmb3IgY2FjaGUgb2JqZWN0cyB0aGF0IG1pbWljcyB0aGUgcmV0dXJuXG4gICAqIHNpZ25hdHVyZSBvZiBgXy5pbmRleE9mYCBieSByZXR1cm5pbmcgYDBgIGlmIHRoZSB2YWx1ZSBpcyBmb3VuZCwgZWxzZSBgLTFgLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge09iamVjdH0gY2FjaGUgVGhlIGNhY2hlIG9iamVjdCB0byBpbnNwZWN0LlxuICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZWFyY2ggZm9yLlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIGAwYCBpZiBgdmFsdWVgIGlzIGZvdW5kLCBlbHNlIGAtMWAuXG4gICAqL1xuICBmdW5jdGlvbiBjYWNoZUluZGV4T2YoY2FjaGUsIHZhbHVlKSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gICAgY2FjaGUgPSBjYWNoZS5jYWNoZTtcblxuICAgIGlmICh0eXBlID09ICdib29sZWFuJyB8fCB2YWx1ZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gY2FjaGVbdmFsdWVdID8gMCA6IC0xO1xuICAgIH1cbiAgICBpZiAodHlwZSAhPSAnbnVtYmVyJyAmJiB0eXBlICE9ICdzdHJpbmcnKSB7XG4gICAgICB0eXBlID0gJ29iamVjdCc7XG4gICAgfVxuICAgIHZhciBrZXkgPSB0eXBlID09ICdudW1iZXInID8gdmFsdWUgOiBrZXlQcmVmaXggKyB2YWx1ZTtcbiAgICBjYWNoZSA9IChjYWNoZSA9IGNhY2hlW3R5cGVdKSAmJiBjYWNoZVtrZXldO1xuXG4gICAgcmV0dXJuIHR5cGUgPT0gJ29iamVjdCdcbiAgICAgID8gKGNhY2hlICYmIGJhc2VJbmRleE9mKGNhY2hlLCB2YWx1ZSkgPiAtMSA/IDAgOiAtMSlcbiAgICAgIDogKGNhY2hlID8gMCA6IC0xKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgZ2l2ZW4gdmFsdWUgdG8gdGhlIGNvcnJlc3BvbmRpbmcgY2FjaGUgb2JqZWN0LlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBhZGQgdG8gdGhlIGNhY2hlLlxuICAgKi9cbiAgZnVuY3Rpb24gY2FjaGVQdXNoKHZhbHVlKSB7XG4gICAgdmFyIGNhY2hlID0gdGhpcy5jYWNoZSxcbiAgICAgICAgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcblxuICAgIGlmICh0eXBlID09ICdib29sZWFuJyB8fCB2YWx1ZSA9PSBudWxsKSB7XG4gICAgICBjYWNoZVt2YWx1ZV0gPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodHlwZSAhPSAnbnVtYmVyJyAmJiB0eXBlICE9ICdzdHJpbmcnKSB7XG4gICAgICAgIHR5cGUgPSAnb2JqZWN0JztcbiAgICAgIH1cbiAgICAgIHZhciBrZXkgPSB0eXBlID09ICdudW1iZXInID8gdmFsdWUgOiBrZXlQcmVmaXggKyB2YWx1ZSxcbiAgICAgICAgICB0eXBlQ2FjaGUgPSBjYWNoZVt0eXBlXSB8fCAoY2FjaGVbdHlwZV0gPSB7fSk7XG5cbiAgICAgIGlmICh0eXBlID09ICdvYmplY3QnKSB7XG4gICAgICAgICh0eXBlQ2FjaGVba2V5XSB8fCAodHlwZUNhY2hlW2tleV0gPSBbXSkpLnB1c2godmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHlwZUNhY2hlW2tleV0gPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVc2VkIGJ5IGBfLm1heGAgYW5kIGBfLm1pbmAgYXMgdGhlIGRlZmF1bHQgY2FsbGJhY2sgd2hlbiBhIGdpdmVuXG4gICAqIGNvbGxlY3Rpb24gaXMgYSBzdHJpbmcgdmFsdWUuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSBUaGUgY2hhcmFjdGVyIHRvIGluc3BlY3QuXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGNvZGUgdW5pdCBvZiBnaXZlbiBjaGFyYWN0ZXIuXG4gICAqL1xuICBmdW5jdGlvbiBjaGFyQXRDYWxsYmFjayh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZS5jaGFyQ29kZUF0KDApO1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZWQgYnkgYHNvcnRCeWAgdG8gY29tcGFyZSB0cmFuc2Zvcm1lZCBgY29sbGVjdGlvbmAgZWxlbWVudHMsIHN0YWJsZSBzb3J0aW5nXG4gICAqIHRoZW0gaW4gYXNjZW5kaW5nIG9yZGVyLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge09iamVjdH0gYSBUaGUgb2JqZWN0IHRvIGNvbXBhcmUgdG8gYGJgLlxuICAgKiBAcGFyYW0ge09iamVjdH0gYiBUaGUgb2JqZWN0IHRvIGNvbXBhcmUgdG8gYGFgLlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBzb3J0IG9yZGVyIGluZGljYXRvciBvZiBgMWAgb3IgYC0xYC5cbiAgICovXG4gIGZ1bmN0aW9uIGNvbXBhcmVBc2NlbmRpbmcoYSwgYikge1xuICAgIHZhciBhYyA9IGEuY3JpdGVyaWEsXG4gICAgICAgIGJjID0gYi5jcml0ZXJpYSxcbiAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gYWMubGVuZ3RoO1xuXG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIHZhciB2YWx1ZSA9IGFjW2luZGV4XSxcbiAgICAgICAgICBvdGhlciA9IGJjW2luZGV4XTtcblxuICAgICAgaWYgKHZhbHVlICE9PSBvdGhlcikge1xuICAgICAgICBpZiAodmFsdWUgPiBvdGhlciB8fCB0eXBlb2YgdmFsdWUgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsdWUgPCBvdGhlciB8fCB0eXBlb2Ygb3RoZXIgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gRml4ZXMgYW4gYEFycmF5I3NvcnRgIGJ1ZyBpbiB0aGUgSlMgZW5naW5lIGVtYmVkZGVkIGluIEFkb2JlIGFwcGxpY2F0aW9uc1xuICAgIC8vIHRoYXQgY2F1c2VzIGl0LCB1bmRlciBjZXJ0YWluIGNpcmN1bXN0YW5jZXMsIHRvIHJldHVybiB0aGUgc2FtZSB2YWx1ZSBmb3JcbiAgICAvLyBgYWAgYW5kIGBiYC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qYXNoa2VuYXMvdW5kZXJzY29yZS9wdWxsLzEyNDdcbiAgICAvL1xuICAgIC8vIFRoaXMgYWxzbyBlbnN1cmVzIGEgc3RhYmxlIHNvcnQgaW4gVjggYW5kIG90aGVyIGVuZ2luZXMuXG4gICAgLy8gU2VlIGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTkwXG4gICAgcmV0dXJuIGEuaW5kZXggLSBiLmluZGV4O1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBjYWNoZSBvYmplY3QgdG8gb3B0aW1pemUgbGluZWFyIHNlYXJjaGVzIG9mIGxhcmdlIGFycmF5cy5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtBcnJheX0gW2FycmF5PVtdXSBUaGUgYXJyYXkgdG8gc2VhcmNoLlxuICAgKiBAcmV0dXJucyB7bnVsbHxPYmplY3R9IFJldHVybnMgdGhlIGNhY2hlIG9iamVjdCBvciBgbnVsbGAgaWYgY2FjaGluZyBzaG91bGQgbm90IGJlIHVzZWQuXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVDYWNoZShhcnJheSkge1xuICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICBsZW5ndGggPSBhcnJheS5sZW5ndGgsXG4gICAgICAgIGZpcnN0ID0gYXJyYXlbMF0sXG4gICAgICAgIG1pZCA9IGFycmF5WyhsZW5ndGggLyAyKSB8IDBdLFxuICAgICAgICBsYXN0ID0gYXJyYXlbbGVuZ3RoIC0gMV07XG5cbiAgICBpZiAoZmlyc3QgJiYgdHlwZW9mIGZpcnN0ID09ICdvYmplY3QnICYmXG4gICAgICAgIG1pZCAmJiB0eXBlb2YgbWlkID09ICdvYmplY3QnICYmIGxhc3QgJiYgdHlwZW9mIGxhc3QgPT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIGNhY2hlID0gZ2V0T2JqZWN0KCk7XG4gICAgY2FjaGVbJ2ZhbHNlJ10gPSBjYWNoZVsnbnVsbCddID0gY2FjaGVbJ3RydWUnXSA9IGNhY2hlWyd1bmRlZmluZWQnXSA9IGZhbHNlO1xuXG4gICAgdmFyIHJlc3VsdCA9IGdldE9iamVjdCgpO1xuICAgIHJlc3VsdC5hcnJheSA9IGFycmF5O1xuICAgIHJlc3VsdC5jYWNoZSA9IGNhY2hlO1xuICAgIHJlc3VsdC5wdXNoID0gY2FjaGVQdXNoO1xuXG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGFycmF5W2luZGV4XSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogVXNlZCBieSBgdGVtcGxhdGVgIHRvIGVzY2FwZSBjaGFyYWN0ZXJzIGZvciBpbmNsdXNpb24gaW4gY29tcGlsZWRcbiAgICogc3RyaW5nIGxpdGVyYWxzLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWF0Y2ggVGhlIG1hdGNoZWQgY2hhcmFjdGVyIHRvIGVzY2FwZS5cbiAgICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgZXNjYXBlZCBjaGFyYWN0ZXIuXG4gICAqL1xuICBmdW5jdGlvbiBlc2NhcGVTdHJpbmdDaGFyKG1hdGNoKSB7XG4gICAgcmV0dXJuICdcXFxcJyArIHN0cmluZ0VzY2FwZXNbbWF0Y2hdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW4gYXJyYXkgZnJvbSB0aGUgYXJyYXkgcG9vbCBvciBjcmVhdGVzIGEgbmV3IG9uZSBpZiB0aGUgcG9vbCBpcyBlbXB0eS5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybnMge0FycmF5fSBUaGUgYXJyYXkgZnJvbSB0aGUgcG9vbC5cbiAgICovXG4gIGZ1bmN0aW9uIGdldEFycmF5KCkge1xuICAgIHJldHVybiBhcnJheVBvb2wucG9wKCkgfHwgW107XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbiBvYmplY3QgZnJvbSB0aGUgb2JqZWN0IHBvb2wgb3IgY3JlYXRlcyBhIG5ldyBvbmUgaWYgdGhlIHBvb2wgaXMgZW1wdHkuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSBvYmplY3QgZnJvbSB0aGUgcG9vbC5cbiAgICovXG4gIGZ1bmN0aW9uIGdldE9iamVjdCgpIHtcbiAgICByZXR1cm4gb2JqZWN0UG9vbC5wb3AoKSB8fCB7XG4gICAgICAnYXJyYXknOiBudWxsLFxuICAgICAgJ2NhY2hlJzogbnVsbCxcbiAgICAgICdjcml0ZXJpYSc6IG51bGwsXG4gICAgICAnZmFsc2UnOiBmYWxzZSxcbiAgICAgICdpbmRleCc6IDAsXG4gICAgICAnbnVsbCc6IGZhbHNlLFxuICAgICAgJ251bWJlcic6IG51bGwsXG4gICAgICAnb2JqZWN0JzogbnVsbCxcbiAgICAgICdwdXNoJzogbnVsbCxcbiAgICAgICdzdHJpbmcnOiBudWxsLFxuICAgICAgJ3RydWUnOiBmYWxzZSxcbiAgICAgICd1bmRlZmluZWQnOiBmYWxzZSxcbiAgICAgICd2YWx1ZSc6IG51bGxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbGVhc2VzIHRoZSBnaXZlbiBhcnJheSBiYWNrIHRvIHRoZSBhcnJheSBwb29sLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge0FycmF5fSBbYXJyYXldIFRoZSBhcnJheSB0byByZWxlYXNlLlxuICAgKi9cbiAgZnVuY3Rpb24gcmVsZWFzZUFycmF5KGFycmF5KSB7XG4gICAgYXJyYXkubGVuZ3RoID0gMDtcbiAgICBpZiAoYXJyYXlQb29sLmxlbmd0aCA8IG1heFBvb2xTaXplKSB7XG4gICAgICBhcnJheVBvb2wucHVzaChhcnJheSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbGVhc2VzIHRoZSBnaXZlbiBvYmplY3QgYmFjayB0byB0aGUgb2JqZWN0IHBvb2wuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0XSBUaGUgb2JqZWN0IHRvIHJlbGVhc2UuXG4gICAqL1xuICBmdW5jdGlvbiByZWxlYXNlT2JqZWN0KG9iamVjdCkge1xuICAgIHZhciBjYWNoZSA9IG9iamVjdC5jYWNoZTtcbiAgICBpZiAoY2FjaGUpIHtcbiAgICAgIHJlbGVhc2VPYmplY3QoY2FjaGUpO1xuICAgIH1cbiAgICBvYmplY3QuYXJyYXkgPSBvYmplY3QuY2FjaGUgPSBvYmplY3QuY3JpdGVyaWEgPSBvYmplY3Qub2JqZWN0ID0gb2JqZWN0Lm51bWJlciA9IG9iamVjdC5zdHJpbmcgPSBvYmplY3QudmFsdWUgPSBudWxsO1xuICAgIGlmIChvYmplY3RQb29sLmxlbmd0aCA8IG1heFBvb2xTaXplKSB7XG4gICAgICBvYmplY3RQb29sLnB1c2gob2JqZWN0KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2xpY2VzIHRoZSBgY29sbGVjdGlvbmAgZnJvbSB0aGUgYHN0YXJ0YCBpbmRleCB1cCB0bywgYnV0IG5vdCBpbmNsdWRpbmcsXG4gICAqIHRoZSBgZW5kYCBpbmRleC5cbiAgICpcbiAgICogTm90ZTogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIGluc3RlYWQgb2YgYEFycmF5I3NsaWNlYCB0byBzdXBwb3J0IG5vZGUgbGlzdHNcbiAgICogaW4gSUUgPCA5IGFuZCB0byBlbnN1cmUgZGVuc2UgYXJyYXlzIGFyZSByZXR1cm5lZC5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIHNsaWNlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gc3RhcnQgVGhlIHN0YXJ0IGluZGV4LlxuICAgKiBAcGFyYW0ge251bWJlcn0gZW5kIFRoZSBlbmQgaW5kZXguXG4gICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IGFycmF5LlxuICAgKi9cbiAgZnVuY3Rpb24gc2xpY2UoYXJyYXksIHN0YXJ0LCBlbmQpIHtcbiAgICBzdGFydCB8fCAoc3RhcnQgPSAwKTtcbiAgICBpZiAodHlwZW9mIGVuZCA9PSAndW5kZWZpbmVkJykge1xuICAgICAgZW5kID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwO1xuICAgIH1cbiAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gZW5kIC0gc3RhcnQgfHwgMCxcbiAgICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoIDwgMCA/IDAgOiBsZW5ndGgpO1xuXG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIHJlc3VsdFtpbmRleF0gPSBhcnJheVtzdGFydCArIGluZGV4XTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYGxvZGFzaGAgZnVuY3Rpb24gdXNpbmcgdGhlIGdpdmVuIGNvbnRleHQgb2JqZWN0LlxuICAgKlxuICAgKiBAc3RhdGljXG4gICAqIEBtZW1iZXJPZiBfXG4gICAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAgICogQHBhcmFtIHtPYmplY3R9IFtjb250ZXh0PXJvb3RdIFRoZSBjb250ZXh0IG9iamVjdC5cbiAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBgbG9kYXNoYCBmdW5jdGlvbi5cbiAgICovXG4gIGZ1bmN0aW9uIHJ1bkluQ29udGV4dChjb250ZXh0KSB7XG4gICAgLy8gQXZvaWQgaXNzdWVzIHdpdGggc29tZSBFUzMgZW52aXJvbm1lbnRzIHRoYXQgYXR0ZW1wdCB0byB1c2UgdmFsdWVzLCBuYW1lZFxuICAgIC8vIGFmdGVyIGJ1aWx0LWluIGNvbnN0cnVjdG9ycyBsaWtlIGBPYmplY3RgLCBmb3IgdGhlIGNyZWF0aW9uIG9mIGxpdGVyYWxzLlxuICAgIC8vIEVTNSBjbGVhcnMgdGhpcyB1cCBieSBzdGF0aW5nIHRoYXQgbGl0ZXJhbHMgbXVzdCB1c2UgYnVpbHQtaW4gY29uc3RydWN0b3JzLlxuICAgIC8vIFNlZSBodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDExLjEuNS5cbiAgICBjb250ZXh0ID0gY29udGV4dCA/IF8uZGVmYXVsdHMocm9vdC5PYmplY3QoKSwgY29udGV4dCwgXy5waWNrKHJvb3QsIGNvbnRleHRQcm9wcykpIDogcm9vdDtcblxuICAgIC8qKiBOYXRpdmUgY29uc3RydWN0b3IgcmVmZXJlbmNlcyAqL1xuICAgIHZhciBBcnJheSA9IGNvbnRleHQuQXJyYXksXG4gICAgICAgIEJvb2xlYW4gPSBjb250ZXh0LkJvb2xlYW4sXG4gICAgICAgIERhdGUgPSBjb250ZXh0LkRhdGUsXG4gICAgICAgIEZ1bmN0aW9uID0gY29udGV4dC5GdW5jdGlvbixcbiAgICAgICAgTWF0aCA9IGNvbnRleHQuTWF0aCxcbiAgICAgICAgTnVtYmVyID0gY29udGV4dC5OdW1iZXIsXG4gICAgICAgIE9iamVjdCA9IGNvbnRleHQuT2JqZWN0LFxuICAgICAgICBSZWdFeHAgPSBjb250ZXh0LlJlZ0V4cCxcbiAgICAgICAgU3RyaW5nID0gY29udGV4dC5TdHJpbmcsXG4gICAgICAgIFR5cGVFcnJvciA9IGNvbnRleHQuVHlwZUVycm9yO1xuXG4gICAgLyoqXG4gICAgICogVXNlZCBmb3IgYEFycmF5YCBtZXRob2QgcmVmZXJlbmNlcy5cbiAgICAgKlxuICAgICAqIE5vcm1hbGx5IGBBcnJheS5wcm90b3R5cGVgIHdvdWxkIHN1ZmZpY2UsIGhvd2V2ZXIsIHVzaW5nIGFuIGFycmF5IGxpdGVyYWxcbiAgICAgKiBhdm9pZHMgaXNzdWVzIGluIE5hcndoYWwuXG4gICAgICovXG4gICAgdmFyIGFycmF5UmVmID0gW107XG5cbiAgICAvKiogVXNlZCBmb3IgbmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzICovXG4gICAgdmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuICAgIC8qKiBVc2VkIHRvIHJlc3RvcmUgdGhlIG9yaWdpbmFsIGBfYCByZWZlcmVuY2UgaW4gYG5vQ29uZmxpY3RgICovXG4gICAgdmFyIG9sZERhc2ggPSBjb250ZXh0Ll87XG5cbiAgICAvKiogVXNlZCB0byByZXNvbHZlIHRoZSBpbnRlcm5hbCBbW0NsYXNzXV0gb2YgdmFsdWVzICovXG4gICAgdmFyIHRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbiAgICAvKiogVXNlZCB0byBkZXRlY3QgaWYgYSBtZXRob2QgaXMgbmF0aXZlICovXG4gICAgdmFyIHJlTmF0aXZlID0gUmVnRXhwKCdeJyArXG4gICAgICBTdHJpbmcodG9TdHJpbmcpXG4gICAgICAgIC5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpXG4gICAgICAgIC5yZXBsYWNlKC90b1N0cmluZ3wgZm9yIFteXFxdXSsvZywgJy4qPycpICsgJyQnXG4gICAgKTtcblxuICAgIC8qKiBOYXRpdmUgbWV0aG9kIHNob3J0Y3V0cyAqL1xuICAgIHZhciBjZWlsID0gTWF0aC5jZWlsLFxuICAgICAgICBjbGVhclRpbWVvdXQgPSBjb250ZXh0LmNsZWFyVGltZW91dCxcbiAgICAgICAgZmxvb3IgPSBNYXRoLmZsb29yLFxuICAgICAgICBmblRvU3RyaW5nID0gRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nLFxuICAgICAgICBnZXRQcm90b3R5cGVPZiA9IGlzTmF0aXZlKGdldFByb3RvdHlwZU9mID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKSAmJiBnZXRQcm90b3R5cGVPZixcbiAgICAgICAgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eSxcbiAgICAgICAgcHVzaCA9IGFycmF5UmVmLnB1c2gsXG4gICAgICAgIHNldFRpbWVvdXQgPSBjb250ZXh0LnNldFRpbWVvdXQsXG4gICAgICAgIHNwbGljZSA9IGFycmF5UmVmLnNwbGljZSxcbiAgICAgICAgdW5zaGlmdCA9IGFycmF5UmVmLnVuc2hpZnQ7XG5cbiAgICAvKiogVXNlZCB0byBzZXQgbWV0YSBkYXRhIG9uIGZ1bmN0aW9ucyAqL1xuICAgIHZhciBkZWZpbmVQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgICAgIC8vIElFIDggb25seSBhY2NlcHRzIERPTSBlbGVtZW50c1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIG8gPSB7fSxcbiAgICAgICAgICAgIGZ1bmMgPSBpc05hdGl2ZShmdW5jID0gT2JqZWN0LmRlZmluZVByb3BlcnR5KSAmJiBmdW5jLFxuICAgICAgICAgICAgcmVzdWx0ID0gZnVuYyhvLCBvLCBvKSAmJiBmdW5jO1xuICAgICAgfSBjYXRjaChlKSB7IH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSgpKTtcblxuICAgIC8qIE5hdGl2ZSBtZXRob2Qgc2hvcnRjdXRzIGZvciBtZXRob2RzIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzICovXG4gICAgdmFyIG5hdGl2ZUNyZWF0ZSA9IGlzTmF0aXZlKG5hdGl2ZUNyZWF0ZSA9IE9iamVjdC5jcmVhdGUpICYmIG5hdGl2ZUNyZWF0ZSxcbiAgICAgICAgbmF0aXZlSXNBcnJheSA9IGlzTmF0aXZlKG5hdGl2ZUlzQXJyYXkgPSBBcnJheS5pc0FycmF5KSAmJiBuYXRpdmVJc0FycmF5LFxuICAgICAgICBuYXRpdmVJc0Zpbml0ZSA9IGNvbnRleHQuaXNGaW5pdGUsXG4gICAgICAgIG5hdGl2ZUlzTmFOID0gY29udGV4dC5pc05hTixcbiAgICAgICAgbmF0aXZlS2V5cyA9IGlzTmF0aXZlKG5hdGl2ZUtleXMgPSBPYmplY3Qua2V5cykgJiYgbmF0aXZlS2V5cyxcbiAgICAgICAgbmF0aXZlTWF4ID0gTWF0aC5tYXgsXG4gICAgICAgIG5hdGl2ZU1pbiA9IE1hdGgubWluLFxuICAgICAgICBuYXRpdmVQYXJzZUludCA9IGNvbnRleHQucGFyc2VJbnQsXG4gICAgICAgIG5hdGl2ZVJhbmRvbSA9IE1hdGgucmFuZG9tO1xuXG4gICAgLyoqIFVzZWQgdG8gbG9va3VwIGEgYnVpbHQtaW4gY29uc3RydWN0b3IgYnkgW1tDbGFzc11dICovXG4gICAgdmFyIGN0b3JCeUNsYXNzID0ge307XG4gICAgY3RvckJ5Q2xhc3NbYXJyYXlDbGFzc10gPSBBcnJheTtcbiAgICBjdG9yQnlDbGFzc1tib29sQ2xhc3NdID0gQm9vbGVhbjtcbiAgICBjdG9yQnlDbGFzc1tkYXRlQ2xhc3NdID0gRGF0ZTtcbiAgICBjdG9yQnlDbGFzc1tmdW5jQ2xhc3NdID0gRnVuY3Rpb247XG4gICAgY3RvckJ5Q2xhc3Nbb2JqZWN0Q2xhc3NdID0gT2JqZWN0O1xuICAgIGN0b3JCeUNsYXNzW251bWJlckNsYXNzXSA9IE51bWJlcjtcbiAgICBjdG9yQnlDbGFzc1tyZWdleHBDbGFzc10gPSBSZWdFeHA7XG4gICAgY3RvckJ5Q2xhc3Nbc3RyaW5nQ2xhc3NdID0gU3RyaW5nO1xuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgYGxvZGFzaGAgb2JqZWN0IHdoaWNoIHdyYXBzIHRoZSBnaXZlbiB2YWx1ZSB0byBlbmFibGUgaW50dWl0aXZlXG4gICAgICogbWV0aG9kIGNoYWluaW5nLlxuICAgICAqXG4gICAgICogSW4gYWRkaXRpb24gdG8gTG8tRGFzaCBtZXRob2RzLCB3cmFwcGVycyBhbHNvIGhhdmUgdGhlIGZvbGxvd2luZyBgQXJyYXlgIG1ldGhvZHM6XG4gICAgICogYGNvbmNhdGAsIGBqb2luYCwgYHBvcGAsIGBwdXNoYCwgYHJldmVyc2VgLCBgc2hpZnRgLCBgc2xpY2VgLCBgc29ydGAsIGBzcGxpY2VgLFxuICAgICAqIGFuZCBgdW5zaGlmdGBcbiAgICAgKlxuICAgICAqIENoYWluaW5nIGlzIHN1cHBvcnRlZCBpbiBjdXN0b20gYnVpbGRzIGFzIGxvbmcgYXMgdGhlIGB2YWx1ZWAgbWV0aG9kIGlzXG4gICAgICogaW1wbGljaXRseSBvciBleHBsaWNpdGx5IGluY2x1ZGVkIGluIHRoZSBidWlsZC5cbiAgICAgKlxuICAgICAqIFRoZSBjaGFpbmFibGUgd3JhcHBlciBmdW5jdGlvbnMgYXJlOlxuICAgICAqIGBhZnRlcmAsIGBhc3NpZ25gLCBgYmluZGAsIGBiaW5kQWxsYCwgYGJpbmRLZXlgLCBgY2hhaW5gLCBgY29tcGFjdGAsXG4gICAgICogYGNvbXBvc2VgLCBgY29uY2F0YCwgYGNvdW50QnlgLCBgY3JlYXRlYCwgYGNyZWF0ZUNhbGxiYWNrYCwgYGN1cnJ5YCxcbiAgICAgKiBgZGVib3VuY2VgLCBgZGVmYXVsdHNgLCBgZGVmZXJgLCBgZGVsYXlgLCBgZGlmZmVyZW5jZWAsIGBmaWx0ZXJgLCBgZmxhdHRlbmAsXG4gICAgICogYGZvckVhY2hgLCBgZm9yRWFjaFJpZ2h0YCwgYGZvckluYCwgYGZvckluUmlnaHRgLCBgZm9yT3duYCwgYGZvck93blJpZ2h0YCxcbiAgICAgKiBgZnVuY3Rpb25zYCwgYGdyb3VwQnlgLCBgaW5kZXhCeWAsIGBpbml0aWFsYCwgYGludGVyc2VjdGlvbmAsIGBpbnZlcnRgLFxuICAgICAqIGBpbnZva2VgLCBga2V5c2AsIGBtYXBgLCBgbWF4YCwgYG1lbW9pemVgLCBgbWVyZ2VgLCBgbWluYCwgYG9iamVjdGAsIGBvbWl0YCxcbiAgICAgKiBgb25jZWAsIGBwYWlyc2AsIGBwYXJ0aWFsYCwgYHBhcnRpYWxSaWdodGAsIGBwaWNrYCwgYHBsdWNrYCwgYHB1bGxgLCBgcHVzaGAsXG4gICAgICogYHJhbmdlYCwgYHJlamVjdGAsIGByZW1vdmVgLCBgcmVzdGAsIGByZXZlcnNlYCwgYHNodWZmbGVgLCBgc2xpY2VgLCBgc29ydGAsXG4gICAgICogYHNvcnRCeWAsIGBzcGxpY2VgLCBgdGFwYCwgYHRocm90dGxlYCwgYHRpbWVzYCwgYHRvQXJyYXlgLCBgdHJhbnNmb3JtYCxcbiAgICAgKiBgdW5pb25gLCBgdW5pcWAsIGB1bnNoaWZ0YCwgYHVuemlwYCwgYHZhbHVlc2AsIGB3aGVyZWAsIGB3aXRob3V0YCwgYHdyYXBgLFxuICAgICAqIGFuZCBgemlwYFxuICAgICAqXG4gICAgICogVGhlIG5vbi1jaGFpbmFibGUgd3JhcHBlciBmdW5jdGlvbnMgYXJlOlxuICAgICAqIGBjbG9uZWAsIGBjbG9uZURlZXBgLCBgY29udGFpbnNgLCBgZXNjYXBlYCwgYGV2ZXJ5YCwgYGZpbmRgLCBgZmluZEluZGV4YCxcbiAgICAgKiBgZmluZEtleWAsIGBmaW5kTGFzdGAsIGBmaW5kTGFzdEluZGV4YCwgYGZpbmRMYXN0S2V5YCwgYGhhc2AsIGBpZGVudGl0eWAsXG4gICAgICogYGluZGV4T2ZgLCBgaXNBcmd1bWVudHNgLCBgaXNBcnJheWAsIGBpc0Jvb2xlYW5gLCBgaXNEYXRlYCwgYGlzRWxlbWVudGAsXG4gICAgICogYGlzRW1wdHlgLCBgaXNFcXVhbGAsIGBpc0Zpbml0ZWAsIGBpc0Z1bmN0aW9uYCwgYGlzTmFOYCwgYGlzTnVsbGAsIGBpc051bWJlcmAsXG4gICAgICogYGlzT2JqZWN0YCwgYGlzUGxhaW5PYmplY3RgLCBgaXNSZWdFeHBgLCBgaXNTdHJpbmdgLCBgaXNVbmRlZmluZWRgLCBgam9pbmAsXG4gICAgICogYGxhc3RJbmRleE9mYCwgYG1peGluYCwgYG5vQ29uZmxpY3RgLCBgcGFyc2VJbnRgLCBgcG9wYCwgYHJhbmRvbWAsIGByZWR1Y2VgLFxuICAgICAqIGByZWR1Y2VSaWdodGAsIGByZXN1bHRgLCBgc2hpZnRgLCBgc2l6ZWAsIGBzb21lYCwgYHNvcnRlZEluZGV4YCwgYHJ1bkluQ29udGV4dGAsXG4gICAgICogYHRlbXBsYXRlYCwgYHVuZXNjYXBlYCwgYHVuaXF1ZUlkYCwgYW5kIGB2YWx1ZWBcbiAgICAgKlxuICAgICAqIFRoZSB3cmFwcGVyIGZ1bmN0aW9ucyBgZmlyc3RgIGFuZCBgbGFzdGAgcmV0dXJuIHdyYXBwZWQgdmFsdWVzIHdoZW4gYG5gIGlzXG4gICAgICogcHJvdmlkZWQsIG90aGVyd2lzZSB0aGV5IHJldHVybiB1bndyYXBwZWQgdmFsdWVzLlxuICAgICAqXG4gICAgICogRXhwbGljaXQgY2hhaW5pbmcgY2FuIGJlIGVuYWJsZWQgYnkgdXNpbmcgdGhlIGBfLmNoYWluYCBtZXRob2QuXG4gICAgICpcbiAgICAgKiBAbmFtZSBfXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQGNhdGVnb3J5IENoYWluaW5nXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gd3JhcCBpbiBhIGBsb2Rhc2hgIGluc3RhbmNlLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYSBgbG9kYXNoYCBpbnN0YW5jZS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIHdyYXBwZWQgPSBfKFsxLCAyLCAzXSk7XG4gICAgICpcbiAgICAgKiAvLyByZXR1cm5zIGFuIHVud3JhcHBlZCB2YWx1ZVxuICAgICAqIHdyYXBwZWQucmVkdWNlKGZ1bmN0aW9uKHN1bSwgbnVtKSB7XG4gICAgICogICByZXR1cm4gc3VtICsgbnVtO1xuICAgICAqIH0pO1xuICAgICAqIC8vID0+IDZcbiAgICAgKlxuICAgICAqIC8vIHJldHVybnMgYSB3cmFwcGVkIHZhbHVlXG4gICAgICogdmFyIHNxdWFyZXMgPSB3cmFwcGVkLm1hcChmdW5jdGlvbihudW0pIHtcbiAgICAgKiAgIHJldHVybiBudW0gKiBudW07XG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiBfLmlzQXJyYXkoc3F1YXJlcyk7XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKlxuICAgICAqIF8uaXNBcnJheShzcXVhcmVzLnZhbHVlKCkpO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBsb2Rhc2godmFsdWUpIHtcbiAgICAgIC8vIGRvbid0IHdyYXAgaWYgYWxyZWFkeSB3cmFwcGVkLCBldmVuIGlmIHdyYXBwZWQgYnkgYSBkaWZmZXJlbnQgYGxvZGFzaGAgY29uc3RydWN0b3JcbiAgICAgIHJldHVybiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnICYmICFpc0FycmF5KHZhbHVlKSAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCAnX193cmFwcGVkX18nKSlcbiAgICAgICA/IHZhbHVlXG4gICAgICAgOiBuZXcgbG9kYXNoV3JhcHBlcih2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQSBmYXN0IHBhdGggZm9yIGNyZWF0aW5nIGBsb2Rhc2hgIHdyYXBwZXIgb2JqZWN0cy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gd3JhcCBpbiBhIGBsb2Rhc2hgIGluc3RhbmNlLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gY2hhaW5BbGwgQSBmbGFnIHRvIGVuYWJsZSBjaGFpbmluZyBmb3IgYWxsIG1ldGhvZHNcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGEgYGxvZGFzaGAgaW5zdGFuY2UuXG4gICAgICovXG4gICAgZnVuY3Rpb24gbG9kYXNoV3JhcHBlcih2YWx1ZSwgY2hhaW5BbGwpIHtcbiAgICAgIHRoaXMuX19jaGFpbl9fID0gISFjaGFpbkFsbDtcbiAgICAgIHRoaXMuX193cmFwcGVkX18gPSB2YWx1ZTtcbiAgICB9XG4gICAgLy8gZW5zdXJlIGBuZXcgbG9kYXNoV3JhcHBlcmAgaXMgYW4gaW5zdGFuY2Ugb2YgYGxvZGFzaGBcbiAgICBsb2Rhc2hXcmFwcGVyLnByb3RvdHlwZSA9IGxvZGFzaC5wcm90b3R5cGU7XG5cbiAgICAvKipcbiAgICAgKiBBbiBvYmplY3QgdXNlZCB0byBmbGFnIGVudmlyb25tZW50cyBmZWF0dXJlcy5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAqL1xuICAgIHZhciBzdXBwb3J0ID0gbG9kYXNoLnN1cHBvcnQgPSB7fTtcblxuICAgIC8qKlxuICAgICAqIERldGVjdCBpZiBmdW5jdGlvbnMgY2FuIGJlIGRlY29tcGlsZWQgYnkgYEZ1bmN0aW9uI3RvU3RyaW5nYFxuICAgICAqIChhbGwgYnV0IFBTMyBhbmQgb2xkZXIgT3BlcmEgbW9iaWxlIGJyb3dzZXJzICYgYXZvaWRlZCBpbiBXaW5kb3dzIDggYXBwcykuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgXy5zdXBwb3J0XG4gICAgICogQHR5cGUgYm9vbGVhblxuICAgICAqL1xuICAgIHN1cHBvcnQuZnVuY0RlY29tcCA9ICFpc05hdGl2ZShjb250ZXh0LldpblJURXJyb3IpICYmIHJlVGhpcy50ZXN0KHJ1bkluQ29udGV4dCk7XG5cbiAgICAvKipcbiAgICAgKiBEZXRlY3QgaWYgYEZ1bmN0aW9uI25hbWVgIGlzIHN1cHBvcnRlZCAoYWxsIGJ1dCBJRSkuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgXy5zdXBwb3J0XG4gICAgICogQHR5cGUgYm9vbGVhblxuICAgICAqL1xuICAgIHN1cHBvcnQuZnVuY05hbWVzID0gdHlwZW9mIEZ1bmN0aW9uLm5hbWUgPT0gJ3N0cmluZyc7XG5cbiAgICAvKipcbiAgICAgKiBCeSBkZWZhdWx0LCB0aGUgdGVtcGxhdGUgZGVsaW1pdGVycyB1c2VkIGJ5IExvLURhc2ggYXJlIHNpbWlsYXIgdG8gdGhvc2UgaW5cbiAgICAgKiBlbWJlZGRlZCBSdWJ5IChFUkIpLiBDaGFuZ2UgdGhlIGZvbGxvd2luZyB0ZW1wbGF0ZSBzZXR0aW5ncyB0byB1c2UgYWx0ZXJuYXRpdmVcbiAgICAgKiBkZWxpbWl0ZXJzLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQHR5cGUgT2JqZWN0XG4gICAgICovXG4gICAgbG9kYXNoLnRlbXBsYXRlU2V0dGluZ3MgPSB7XG5cbiAgICAgIC8qKlxuICAgICAgICogVXNlZCB0byBkZXRlY3QgYGRhdGFgIHByb3BlcnR5IHZhbHVlcyB0byBiZSBIVE1MLWVzY2FwZWQuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgICAgICogQHR5cGUgUmVnRXhwXG4gICAgICAgKi9cbiAgICAgICdlc2NhcGUnOiAvPCUtKFtcXHNcXFNdKz8pJT4vZyxcblxuICAgICAgLyoqXG4gICAgICAgKiBVc2VkIHRvIGRldGVjdCBjb2RlIHRvIGJlIGV2YWx1YXRlZC5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAgICAgKiBAdHlwZSBSZWdFeHBcbiAgICAgICAqL1xuICAgICAgJ2V2YWx1YXRlJzogLzwlKFtcXHNcXFNdKz8pJT4vZyxcblxuICAgICAgLyoqXG4gICAgICAgKiBVc2VkIHRvIGRldGVjdCBgZGF0YWAgcHJvcGVydHkgdmFsdWVzIHRvIGluamVjdC5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAgICAgKiBAdHlwZSBSZWdFeHBcbiAgICAgICAqL1xuICAgICAgJ2ludGVycG9sYXRlJzogcmVJbnRlcnBvbGF0ZSxcblxuICAgICAgLyoqXG4gICAgICAgKiBVc2VkIHRvIHJlZmVyZW5jZSB0aGUgZGF0YSBvYmplY3QgaW4gdGhlIHRlbXBsYXRlIHRleHQuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgICAgICogQHR5cGUgc3RyaW5nXG4gICAgICAgKi9cbiAgICAgICd2YXJpYWJsZSc6ICcnLFxuXG4gICAgICAvKipcbiAgICAgICAqIFVzZWQgdG8gaW1wb3J0IHZhcmlhYmxlcyBpbnRvIHRoZSBjb21waWxlZCB0ZW1wbGF0ZS5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAqL1xuICAgICAgJ2ltcG9ydHMnOiB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEEgcmVmZXJlbmNlIHRvIHRoZSBgbG9kYXNoYCBmdW5jdGlvbi5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5ncy5pbXBvcnRzXG4gICAgICAgICAqIEB0eXBlIEZ1bmN0aW9uXG4gICAgICAgICAqL1xuICAgICAgICAnXyc6IGxvZGFzaFxuICAgICAgfVxuICAgIH07XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIC8qKlxuICAgICAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmJpbmRgIHRoYXQgY3JlYXRlcyB0aGUgYm91bmQgZnVuY3Rpb24gYW5kXG4gICAgICogc2V0cyBpdHMgbWV0YSBkYXRhLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBiaW5kRGF0YSBUaGUgYmluZCBkYXRhIGFycmF5LlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGJvdW5kIGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJhc2VCaW5kKGJpbmREYXRhKSB7XG4gICAgICB2YXIgZnVuYyA9IGJpbmREYXRhWzBdLFxuICAgICAgICAgIHBhcnRpYWxBcmdzID0gYmluZERhdGFbMl0sXG4gICAgICAgICAgdGhpc0FyZyA9IGJpbmREYXRhWzRdO1xuXG4gICAgICBmdW5jdGlvbiBib3VuZCgpIHtcbiAgICAgICAgLy8gYEZ1bmN0aW9uI2JpbmRgIHNwZWNcbiAgICAgICAgLy8gaHR0cDovL2VzNS5naXRodWIuaW8vI3gxNS4zLjQuNVxuICAgICAgICBpZiAocGFydGlhbEFyZ3MpIHtcbiAgICAgICAgICAvLyBhdm9pZCBgYXJndW1lbnRzYCBvYmplY3QgZGVvcHRpbWl6YXRpb25zIGJ5IHVzaW5nIGBzbGljZWAgaW5zdGVhZFxuICAgICAgICAgIC8vIG9mIGBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbGAgYW5kIG5vdCBhc3NpZ25pbmcgYGFyZ3VtZW50c2AgdG8gYVxuICAgICAgICAgIC8vIHZhcmlhYmxlIGFzIGEgdGVybmFyeSBleHByZXNzaW9uXG4gICAgICAgICAgdmFyIGFyZ3MgPSBzbGljZShwYXJ0aWFsQXJncyk7XG4gICAgICAgICAgcHVzaC5hcHBseShhcmdzLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgICAgIC8vIG1pbWljIHRoZSBjb25zdHJ1Y3RvcidzIGByZXR1cm5gIGJlaGF2aW9yXG4gICAgICAgIC8vIGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4MTMuMi4yXG4gICAgICAgIGlmICh0aGlzIGluc3RhbmNlb2YgYm91bmQpIHtcbiAgICAgICAgICAvLyBlbnN1cmUgYG5ldyBib3VuZGAgaXMgYW4gaW5zdGFuY2Ugb2YgYGZ1bmNgXG4gICAgICAgICAgdmFyIHRoaXNCaW5kaW5nID0gYmFzZUNyZWF0ZShmdW5jLnByb3RvdHlwZSksXG4gICAgICAgICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpc0JpbmRpbmcsIGFyZ3MgfHwgYXJndW1lbnRzKTtcbiAgICAgICAgICByZXR1cm4gaXNPYmplY3QocmVzdWx0KSA/IHJlc3VsdCA6IHRoaXNCaW5kaW5nO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MgfHwgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICAgIHNldEJpbmREYXRhKGJvdW5kLCBiaW5kRGF0YSk7XG4gICAgICByZXR1cm4gYm91bmQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uY2xvbmVgIHdpdGhvdXQgYXJndW1lbnQganVnZ2xpbmcgb3Igc3VwcG9ydFxuICAgICAqIGZvciBgdGhpc0FyZ2AgYmluZGluZy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2xvbmUuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbaXNEZWVwPWZhbHNlXSBTcGVjaWZ5IGEgZGVlcCBjbG9uZS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY2xvbmluZyB2YWx1ZXMuXG4gICAgICogQHBhcmFtIHtBcnJheX0gW3N0YWNrQT1bXV0gVHJhY2tzIHRyYXZlcnNlZCBzb3VyY2Ugb2JqZWN0cy5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBbc3RhY2tCPVtdXSBBc3NvY2lhdGVzIGNsb25lcyB3aXRoIHNvdXJjZSBjb3VudGVycGFydHMuXG4gICAgICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGNsb25lZCB2YWx1ZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBiYXNlQ2xvbmUodmFsdWUsIGlzRGVlcCwgY2FsbGJhY2ssIHN0YWNrQSwgc3RhY2tCKSB7XG4gICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGNhbGxiYWNrKHZhbHVlKTtcbiAgICAgICAgaWYgKHR5cGVvZiByZXN1bHQgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBpbnNwZWN0IFtbQ2xhc3NdXVxuICAgICAgdmFyIGlzT2JqID0gaXNPYmplY3QodmFsdWUpO1xuICAgICAgaWYgKGlzT2JqKSB7XG4gICAgICAgIHZhciBjbGFzc05hbWUgPSB0b1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgICAgICAgaWYgKCFjbG9uZWFibGVDbGFzc2VzW2NsYXNzTmFtZV0pIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGN0b3IgPSBjdG9yQnlDbGFzc1tjbGFzc05hbWVdO1xuICAgICAgICBzd2l0Y2ggKGNsYXNzTmFtZSkge1xuICAgICAgICAgIGNhc2UgYm9vbENsYXNzOlxuICAgICAgICAgIGNhc2UgZGF0ZUNsYXNzOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBjdG9yKCt2YWx1ZSk7XG5cbiAgICAgICAgICBjYXNlIG51bWJlckNsYXNzOlxuICAgICAgICAgIGNhc2Ugc3RyaW5nQ2xhc3M6XG4gICAgICAgICAgICByZXR1cm4gbmV3IGN0b3IodmFsdWUpO1xuXG4gICAgICAgICAgY2FzZSByZWdleHBDbGFzczpcbiAgICAgICAgICAgIHJlc3VsdCA9IGN0b3IodmFsdWUuc291cmNlLCByZUZsYWdzLmV4ZWModmFsdWUpKTtcbiAgICAgICAgICAgIHJlc3VsdC5sYXN0SW5kZXggPSB2YWx1ZS5sYXN0SW5kZXg7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9XG4gICAgICB2YXIgaXNBcnIgPSBpc0FycmF5KHZhbHVlKTtcbiAgICAgIGlmIChpc0RlZXApIHtcbiAgICAgICAgLy8gY2hlY2sgZm9yIGNpcmN1bGFyIHJlZmVyZW5jZXMgYW5kIHJldHVybiBjb3JyZXNwb25kaW5nIGNsb25lXG4gICAgICAgIHZhciBpbml0ZWRTdGFjayA9ICFzdGFja0E7XG4gICAgICAgIHN0YWNrQSB8fCAoc3RhY2tBID0gZ2V0QXJyYXkoKSk7XG4gICAgICAgIHN0YWNrQiB8fCAoc3RhY2tCID0gZ2V0QXJyYXkoKSk7XG5cbiAgICAgICAgdmFyIGxlbmd0aCA9IHN0YWNrQS5sZW5ndGg7XG4gICAgICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICAgIGlmIChzdGFja0FbbGVuZ3RoXSA9PSB2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHN0YWNrQltsZW5ndGhdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSBpc0FyciA/IGN0b3IodmFsdWUubGVuZ3RoKSA6IHt9O1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IGlzQXJyID8gc2xpY2UodmFsdWUpIDogYXNzaWduKHt9LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICAvLyBhZGQgYXJyYXkgcHJvcGVydGllcyBhc3NpZ25lZCBieSBgUmVnRXhwI2V4ZWNgXG4gICAgICBpZiAoaXNBcnIpIHtcbiAgICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsICdpbmRleCcpKSB7XG4gICAgICAgICAgcmVzdWx0LmluZGV4ID0gdmFsdWUuaW5kZXg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsICdpbnB1dCcpKSB7XG4gICAgICAgICAgcmVzdWx0LmlucHV0ID0gdmFsdWUuaW5wdXQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGV4aXQgZm9yIHNoYWxsb3cgY2xvbmVcbiAgICAgIGlmICghaXNEZWVwKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgICAvLyBhZGQgdGhlIHNvdXJjZSB2YWx1ZSB0byB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHNcbiAgICAgIC8vIGFuZCBhc3NvY2lhdGUgaXQgd2l0aCBpdHMgY2xvbmVcbiAgICAgIHN0YWNrQS5wdXNoKHZhbHVlKTtcbiAgICAgIHN0YWNrQi5wdXNoKHJlc3VsdCk7XG5cbiAgICAgIC8vIHJlY3Vyc2l2ZWx5IHBvcHVsYXRlIGNsb25lIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cylcbiAgICAgIChpc0FyciA/IGZvckVhY2ggOiBmb3JPd24pKHZhbHVlLCBmdW5jdGlvbihvYmpWYWx1ZSwga2V5KSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gYmFzZUNsb25lKG9ialZhbHVlLCBpc0RlZXAsIGNhbGxiYWNrLCBzdGFja0EsIHN0YWNrQik7XG4gICAgICB9KTtcblxuICAgICAgaWYgKGluaXRlZFN0YWNrKSB7XG4gICAgICAgIHJlbGVhc2VBcnJheShzdGFja0EpO1xuICAgICAgICByZWxlYXNlQXJyYXkoc3RhY2tCKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uY3JlYXRlYCB3aXRob3V0IHN1cHBvcnQgZm9yIGFzc2lnbmluZ1xuICAgICAqIHByb3BlcnRpZXMgdG8gdGhlIGNyZWF0ZWQgb2JqZWN0LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcHJvdG90eXBlIFRoZSBvYmplY3QgdG8gaW5oZXJpdCBmcm9tLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIG5ldyBvYmplY3QuXG4gICAgICovXG4gICAgZnVuY3Rpb24gYmFzZUNyZWF0ZShwcm90b3R5cGUsIHByb3BlcnRpZXMpIHtcbiAgICAgIHJldHVybiBpc09iamVjdChwcm90b3R5cGUpID8gbmF0aXZlQ3JlYXRlKHByb3RvdHlwZSkgOiB7fTtcbiAgICB9XG4gICAgLy8gZmFsbGJhY2sgZm9yIGJyb3dzZXJzIHdpdGhvdXQgYE9iamVjdC5jcmVhdGVgXG4gICAgaWYgKCFuYXRpdmVDcmVhdGUpIHtcbiAgICAgIGJhc2VDcmVhdGUgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgIGZ1bmN0aW9uIE9iamVjdCgpIHt9XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihwcm90b3R5cGUpIHtcbiAgICAgICAgICBpZiAoaXNPYmplY3QocHJvdG90eXBlKSkge1xuICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZSA9IHByb3RvdHlwZTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBuZXcgT2JqZWN0O1xuICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZSA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHQgfHwgY29udGV4dC5PYmplY3QoKTtcbiAgICAgICAgfTtcbiAgICAgIH0oKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uY3JlYXRlQ2FsbGJhY2tgIHdpdGhvdXQgc3VwcG9ydCBmb3IgY3JlYXRpbmdcbiAgICAgKiBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFja3MuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7Kn0gW2Z1bmM9aWRlbnRpdHldIFRoZSB2YWx1ZSB0byBjb252ZXJ0IHRvIGEgY2FsbGJhY2suXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIHRoZSBjcmVhdGVkIGNhbGxiYWNrLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbYXJnQ291bnRdIFRoZSBudW1iZXIgb2YgYXJndW1lbnRzIHRoZSBjYWxsYmFjayBhY2NlcHRzLlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyBhIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJhc2VDcmVhdGVDYWxsYmFjayhmdW5jLCB0aGlzQXJnLCBhcmdDb3VudCkge1xuICAgICAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIGlkZW50aXR5O1xuICAgICAgfVxuICAgICAgLy8gZXhpdCBlYXJseSBmb3Igbm8gYHRoaXNBcmdgIG9yIGFscmVhZHkgYm91bmQgYnkgYEZ1bmN0aW9uI2JpbmRgXG4gICAgICBpZiAodHlwZW9mIHRoaXNBcmcgPT0gJ3VuZGVmaW5lZCcgfHwgISgncHJvdG90eXBlJyBpbiBmdW5jKSkge1xuICAgICAgICByZXR1cm4gZnVuYztcbiAgICAgIH1cbiAgICAgIHZhciBiaW5kRGF0YSA9IGZ1bmMuX19iaW5kRGF0YV9fO1xuICAgICAgaWYgKHR5cGVvZiBiaW5kRGF0YSA9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpZiAoc3VwcG9ydC5mdW5jTmFtZXMpIHtcbiAgICAgICAgICBiaW5kRGF0YSA9ICFmdW5jLm5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgYmluZERhdGEgPSBiaW5kRGF0YSB8fCAhc3VwcG9ydC5mdW5jRGVjb21wO1xuICAgICAgICBpZiAoIWJpbmREYXRhKSB7XG4gICAgICAgICAgdmFyIHNvdXJjZSA9IGZuVG9TdHJpbmcuY2FsbChmdW5jKTtcbiAgICAgICAgICBpZiAoIXN1cHBvcnQuZnVuY05hbWVzKSB7XG4gICAgICAgICAgICBiaW5kRGF0YSA9ICFyZUZ1bmNOYW1lLnRlc3Qoc291cmNlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFiaW5kRGF0YSkge1xuICAgICAgICAgICAgLy8gY2hlY2tzIGlmIGBmdW5jYCByZWZlcmVuY2VzIHRoZSBgdGhpc2Aga2V5d29yZCBhbmQgc3RvcmVzIHRoZSByZXN1bHRcbiAgICAgICAgICAgIGJpbmREYXRhID0gcmVUaGlzLnRlc3Qoc291cmNlKTtcbiAgICAgICAgICAgIHNldEJpbmREYXRhKGZ1bmMsIGJpbmREYXRhKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGV4aXQgZWFybHkgaWYgdGhlcmUgYXJlIG5vIGB0aGlzYCByZWZlcmVuY2VzIG9yIGBmdW5jYCBpcyBib3VuZFxuICAgICAgaWYgKGJpbmREYXRhID09PSBmYWxzZSB8fCAoYmluZERhdGEgIT09IHRydWUgJiYgYmluZERhdGFbMV0gJiAxKSkge1xuICAgICAgICByZXR1cm4gZnVuYztcbiAgICAgIH1cbiAgICAgIHN3aXRjaCAoYXJnQ291bnQpIHtcbiAgICAgICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIHZhbHVlKTtcbiAgICAgICAgfTtcbiAgICAgICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgIHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYSwgYik7XG4gICAgICAgIH07XG4gICAgICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICAgIHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICAgICAgfTtcbiAgICAgICAgY2FzZSA0OiByZXR1cm4gZnVuY3Rpb24oYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICAgIHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gYmluZChmdW5jLCB0aGlzQXJnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgY3JlYXRlV3JhcHBlcmAgdGhhdCBjcmVhdGVzIHRoZSB3cmFwcGVyIGFuZFxuICAgICAqIHNldHMgaXRzIG1ldGEgZGF0YS5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtBcnJheX0gYmluZERhdGEgVGhlIGJpbmQgZGF0YSBhcnJheS5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBiYXNlQ3JlYXRlV3JhcHBlcihiaW5kRGF0YSkge1xuICAgICAgdmFyIGZ1bmMgPSBiaW5kRGF0YVswXSxcbiAgICAgICAgICBiaXRtYXNrID0gYmluZERhdGFbMV0sXG4gICAgICAgICAgcGFydGlhbEFyZ3MgPSBiaW5kRGF0YVsyXSxcbiAgICAgICAgICBwYXJ0aWFsUmlnaHRBcmdzID0gYmluZERhdGFbM10sXG4gICAgICAgICAgdGhpc0FyZyA9IGJpbmREYXRhWzRdLFxuICAgICAgICAgIGFyaXR5ID0gYmluZERhdGFbNV07XG5cbiAgICAgIHZhciBpc0JpbmQgPSBiaXRtYXNrICYgMSxcbiAgICAgICAgICBpc0JpbmRLZXkgPSBiaXRtYXNrICYgMixcbiAgICAgICAgICBpc0N1cnJ5ID0gYml0bWFzayAmIDQsXG4gICAgICAgICAgaXNDdXJyeUJvdW5kID0gYml0bWFzayAmIDgsXG4gICAgICAgICAga2V5ID0gZnVuYztcblxuICAgICAgZnVuY3Rpb24gYm91bmQoKSB7XG4gICAgICAgIHZhciB0aGlzQmluZGluZyA9IGlzQmluZCA/IHRoaXNBcmcgOiB0aGlzO1xuICAgICAgICBpZiAocGFydGlhbEFyZ3MpIHtcbiAgICAgICAgICB2YXIgYXJncyA9IHNsaWNlKHBhcnRpYWxBcmdzKTtcbiAgICAgICAgICBwdXNoLmFwcGx5KGFyZ3MsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcnRpYWxSaWdodEFyZ3MgfHwgaXNDdXJyeSkge1xuICAgICAgICAgIGFyZ3MgfHwgKGFyZ3MgPSBzbGljZShhcmd1bWVudHMpKTtcbiAgICAgICAgICBpZiAocGFydGlhbFJpZ2h0QXJncykge1xuICAgICAgICAgICAgcHVzaC5hcHBseShhcmdzLCBwYXJ0aWFsUmlnaHRBcmdzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGlzQ3VycnkgJiYgYXJncy5sZW5ndGggPCBhcml0eSkge1xuICAgICAgICAgICAgYml0bWFzayB8PSAxNiAmIH4zMjtcbiAgICAgICAgICAgIHJldHVybiBiYXNlQ3JlYXRlV3JhcHBlcihbZnVuYywgKGlzQ3VycnlCb3VuZCA/IGJpdG1hc2sgOiBiaXRtYXNrICYgfjMpLCBhcmdzLCBudWxsLCB0aGlzQXJnLCBhcml0eV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBhcmdzIHx8IChhcmdzID0gYXJndW1lbnRzKTtcbiAgICAgICAgaWYgKGlzQmluZEtleSkge1xuICAgICAgICAgIGZ1bmMgPSB0aGlzQmluZGluZ1trZXldO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzIGluc3RhbmNlb2YgYm91bmQpIHtcbiAgICAgICAgICB0aGlzQmluZGluZyA9IGJhc2VDcmVhdGUoZnVuYy5wcm90b3R5cGUpO1xuICAgICAgICAgIHZhciByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXNCaW5kaW5nLCBhcmdzKTtcbiAgICAgICAgICByZXR1cm4gaXNPYmplY3QocmVzdWx0KSA/IHJlc3VsdCA6IHRoaXNCaW5kaW5nO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXNCaW5kaW5nLCBhcmdzKTtcbiAgICAgIH1cbiAgICAgIHNldEJpbmREYXRhKGJvdW5kLCBiaW5kRGF0YSk7XG4gICAgICByZXR1cm4gYm91bmQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uZGlmZmVyZW5jZWAgdGhhdCBhY2NlcHRzIGEgc2luZ2xlIGFycmF5XG4gICAgICogb2YgdmFsdWVzIHRvIGV4Y2x1ZGUuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBwcm9jZXNzLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IFt2YWx1ZXNdIFRoZSBhcnJheSBvZiB2YWx1ZXMgdG8gZXhjbHVkZS5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYSBuZXcgYXJyYXkgb2YgZmlsdGVyZWQgdmFsdWVzLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJhc2VEaWZmZXJlbmNlKGFycmF5LCB2YWx1ZXMpIHtcbiAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgIGluZGV4T2YgPSBnZXRJbmRleE9mKCksXG4gICAgICAgICAgbGVuZ3RoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwLFxuICAgICAgICAgIGlzTGFyZ2UgPSBsZW5ndGggPj0gbGFyZ2VBcnJheVNpemUgJiYgaW5kZXhPZiA9PT0gYmFzZUluZGV4T2YsXG4gICAgICAgICAgcmVzdWx0ID0gW107XG5cbiAgICAgIGlmIChpc0xhcmdlKSB7XG4gICAgICAgIHZhciBjYWNoZSA9IGNyZWF0ZUNhY2hlKHZhbHVlcyk7XG4gICAgICAgIGlmIChjYWNoZSkge1xuICAgICAgICAgIGluZGV4T2YgPSBjYWNoZUluZGV4T2Y7XG4gICAgICAgICAgdmFsdWVzID0gY2FjaGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXNMYXJnZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBhcnJheVtpbmRleF07XG4gICAgICAgIGlmIChpbmRleE9mKHZhbHVlcywgdmFsdWUpIDwgMCkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGlzTGFyZ2UpIHtcbiAgICAgICAgcmVsZWFzZU9iamVjdCh2YWx1ZXMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5mbGF0dGVuYCB3aXRob3V0IHN1cHBvcnQgZm9yIGNhbGxiYWNrXG4gICAgICogc2hvcnRoYW5kcyBvciBgdGhpc0FyZ2AgYmluZGluZy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGZsYXR0ZW4uXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbaXNTaGFsbG93PWZhbHNlXSBBIGZsYWcgdG8gcmVzdHJpY3QgZmxhdHRlbmluZyB0byBhIHNpbmdsZSBsZXZlbC5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc1N0cmljdD1mYWxzZV0gQSBmbGFnIHRvIHJlc3RyaWN0IGZsYXR0ZW5pbmcgdG8gYXJyYXlzIGFuZCBgYXJndW1lbnRzYCBvYmplY3RzLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbZnJvbUluZGV4PTBdIFRoZSBpbmRleCB0byBzdGFydCBmcm9tLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhIG5ldyBmbGF0dGVuZWQgYXJyYXkuXG4gICAgICovXG4gICAgZnVuY3Rpb24gYmFzZUZsYXR0ZW4oYXJyYXksIGlzU2hhbGxvdywgaXNTdHJpY3QsIGZyb21JbmRleCkge1xuICAgICAgdmFyIGluZGV4ID0gKGZyb21JbmRleCB8fCAwKSAtIDEsXG4gICAgICAgICAgbGVuZ3RoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwLFxuICAgICAgICAgIHJlc3VsdCA9IFtdO1xuXG4gICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBhcnJheVtpbmRleF07XG5cbiAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsdWUubGVuZ3RoID09ICdudW1iZXInXG4gICAgICAgICAgICAmJiAoaXNBcnJheSh2YWx1ZSkgfHwgaXNBcmd1bWVudHModmFsdWUpKSkge1xuICAgICAgICAgIC8vIHJlY3Vyc2l2ZWx5IGZsYXR0ZW4gYXJyYXlzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cylcbiAgICAgICAgICBpZiAoIWlzU2hhbGxvdykge1xuICAgICAgICAgICAgdmFsdWUgPSBiYXNlRmxhdHRlbih2YWx1ZSwgaXNTaGFsbG93LCBpc1N0cmljdCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciB2YWxJbmRleCA9IC0xLFxuICAgICAgICAgICAgICB2YWxMZW5ndGggPSB2YWx1ZS5sZW5ndGgsXG4gICAgICAgICAgICAgIHJlc0luZGV4ID0gcmVzdWx0Lmxlbmd0aDtcblxuICAgICAgICAgIHJlc3VsdC5sZW5ndGggKz0gdmFsTGVuZ3RoO1xuICAgICAgICAgIHdoaWxlICgrK3ZhbEluZGV4IDwgdmFsTGVuZ3RoKSB7XG4gICAgICAgICAgICByZXN1bHRbcmVzSW5kZXgrK10gPSB2YWx1ZVt2YWxJbmRleF07XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCFpc1N0cmljdCkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc0VxdWFsYCwgd2l0aG91dCBzdXBwb3J0IGZvciBgdGhpc0FyZ2AgYmluZGluZyxcbiAgICAgKiB0aGF0IGFsbG93cyBwYXJ0aWFsIFwiXy53aGVyZVwiIHN0eWxlIGNvbXBhcmlzb25zLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0geyp9IGEgVGhlIHZhbHVlIHRvIGNvbXBhcmUuXG4gICAgICogQHBhcmFtIHsqfSBiIFRoZSBvdGhlciB2YWx1ZSB0byBjb21wYXJlLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb21wYXJpbmcgdmFsdWVzLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtpc1doZXJlPWZhbHNlXSBBIGZsYWcgdG8gaW5kaWNhdGUgcGVyZm9ybWluZyBwYXJ0aWFsIGNvbXBhcmlzb25zLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IFtzdGFja0E9W11dIFRyYWNrcyB0cmF2ZXJzZWQgYGFgIG9iamVjdHMuXG4gICAgICogQHBhcmFtIHtBcnJheX0gW3N0YWNrQj1bXV0gVHJhY2tzIHRyYXZlcnNlZCBgYmAgb2JqZWN0cy5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJhc2VJc0VxdWFsKGEsIGIsIGNhbGxiYWNrLCBpc1doZXJlLCBzdGFja0EsIHN0YWNrQikge1xuICAgICAgLy8gdXNlZCB0byBpbmRpY2F0ZSB0aGF0IHdoZW4gY29tcGFyaW5nIG9iamVjdHMsIGBhYCBoYXMgYXQgbGVhc3QgdGhlIHByb3BlcnRpZXMgb2YgYGJgXG4gICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGNhbGxiYWNrKGEsIGIpO1xuICAgICAgICBpZiAodHlwZW9mIHJlc3VsdCAhPSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHJldHVybiAhIXJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gZXhpdCBlYXJseSBmb3IgaWRlbnRpY2FsIHZhbHVlc1xuICAgICAgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgLy8gdHJlYXQgYCswYCB2cy4gYC0wYCBhcyBub3QgZXF1YWxcbiAgICAgICAgcmV0dXJuIGEgIT09IDAgfHwgKDEgLyBhID09IDEgLyBiKTtcbiAgICAgIH1cbiAgICAgIHZhciB0eXBlID0gdHlwZW9mIGEsXG4gICAgICAgICAgb3RoZXJUeXBlID0gdHlwZW9mIGI7XG5cbiAgICAgIC8vIGV4aXQgZWFybHkgZm9yIHVubGlrZSBwcmltaXRpdmUgdmFsdWVzXG4gICAgICBpZiAoYSA9PT0gYSAmJlxuICAgICAgICAgICEoYSAmJiBvYmplY3RUeXBlc1t0eXBlXSkgJiZcbiAgICAgICAgICAhKGIgJiYgb2JqZWN0VHlwZXNbb3RoZXJUeXBlXSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgLy8gZXhpdCBlYXJseSBmb3IgYG51bGxgIGFuZCBgdW5kZWZpbmVkYCBhdm9pZGluZyBFUzMncyBGdW5jdGlvbiNjYWxsIGJlaGF2aW9yXG4gICAgICAvLyBodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDE1LjMuNC40XG4gICAgICBpZiAoYSA9PSBudWxsIHx8IGIgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gYSA9PT0gYjtcbiAgICAgIH1cbiAgICAgIC8vIGNvbXBhcmUgW1tDbGFzc11dIG5hbWVzXG4gICAgICB2YXIgY2xhc3NOYW1lID0gdG9TdHJpbmcuY2FsbChhKSxcbiAgICAgICAgICBvdGhlckNsYXNzID0gdG9TdHJpbmcuY2FsbChiKTtcblxuICAgICAgaWYgKGNsYXNzTmFtZSA9PSBhcmdzQ2xhc3MpIHtcbiAgICAgICAgY2xhc3NOYW1lID0gb2JqZWN0Q2xhc3M7XG4gICAgICB9XG4gICAgICBpZiAob3RoZXJDbGFzcyA9PSBhcmdzQ2xhc3MpIHtcbiAgICAgICAgb3RoZXJDbGFzcyA9IG9iamVjdENsYXNzO1xuICAgICAgfVxuICAgICAgaWYgKGNsYXNzTmFtZSAhPSBvdGhlckNsYXNzKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHN3aXRjaCAoY2xhc3NOYW1lKSB7XG4gICAgICAgIGNhc2UgYm9vbENsYXNzOlxuICAgICAgICBjYXNlIGRhdGVDbGFzczpcbiAgICAgICAgICAvLyBjb2VyY2UgZGF0ZXMgYW5kIGJvb2xlYW5zIHRvIG51bWJlcnMsIGRhdGVzIHRvIG1pbGxpc2Vjb25kcyBhbmQgYm9vbGVhbnNcbiAgICAgICAgICAvLyB0byBgMWAgb3IgYDBgIHRyZWF0aW5nIGludmFsaWQgZGF0ZXMgY29lcmNlZCB0byBgTmFOYCBhcyBub3QgZXF1YWxcbiAgICAgICAgICByZXR1cm4gK2EgPT0gK2I7XG5cbiAgICAgICAgY2FzZSBudW1iZXJDbGFzczpcbiAgICAgICAgICAvLyB0cmVhdCBgTmFOYCB2cy4gYE5hTmAgYXMgZXF1YWxcbiAgICAgICAgICByZXR1cm4gKGEgIT0gK2EpXG4gICAgICAgICAgICA/IGIgIT0gK2JcbiAgICAgICAgICAgIC8vIGJ1dCB0cmVhdCBgKzBgIHZzLiBgLTBgIGFzIG5vdCBlcXVhbFxuICAgICAgICAgICAgOiAoYSA9PSAwID8gKDEgLyBhID09IDEgLyBiKSA6IGEgPT0gK2IpO1xuXG4gICAgICAgIGNhc2UgcmVnZXhwQ2xhc3M6XG4gICAgICAgIGNhc2Ugc3RyaW5nQ2xhc3M6XG4gICAgICAgICAgLy8gY29lcmNlIHJlZ2V4ZXMgdG8gc3RyaW5ncyAoaHR0cDovL2VzNS5naXRodWIuaW8vI3gxNS4xMC42LjQpXG4gICAgICAgICAgLy8gdHJlYXQgc3RyaW5nIHByaW1pdGl2ZXMgYW5kIHRoZWlyIGNvcnJlc3BvbmRpbmcgb2JqZWN0IGluc3RhbmNlcyBhcyBlcXVhbFxuICAgICAgICAgIHJldHVybiBhID09IFN0cmluZyhiKTtcbiAgICAgIH1cbiAgICAgIHZhciBpc0FyciA9IGNsYXNzTmFtZSA9PSBhcnJheUNsYXNzO1xuICAgICAgaWYgKCFpc0Fycikge1xuICAgICAgICAvLyB1bndyYXAgYW55IGBsb2Rhc2hgIHdyYXBwZWQgdmFsdWVzXG4gICAgICAgIHZhciBhV3JhcHBlZCA9IGhhc093blByb3BlcnR5LmNhbGwoYSwgJ19fd3JhcHBlZF9fJyksXG4gICAgICAgICAgICBiV3JhcHBlZCA9IGhhc093blByb3BlcnR5LmNhbGwoYiwgJ19fd3JhcHBlZF9fJyk7XG5cbiAgICAgICAgaWYgKGFXcmFwcGVkIHx8IGJXcmFwcGVkKSB7XG4gICAgICAgICAgcmV0dXJuIGJhc2VJc0VxdWFsKGFXcmFwcGVkID8gYS5fX3dyYXBwZWRfXyA6IGEsIGJXcmFwcGVkID8gYi5fX3dyYXBwZWRfXyA6IGIsIGNhbGxiYWNrLCBpc1doZXJlLCBzdGFja0EsIHN0YWNrQik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZXhpdCBmb3IgZnVuY3Rpb25zIGFuZCBET00gbm9kZXNcbiAgICAgICAgaWYgKGNsYXNzTmFtZSAhPSBvYmplY3RDbGFzcykge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBpbiBvbGRlciB2ZXJzaW9ucyBvZiBPcGVyYSwgYGFyZ3VtZW50c2Agb2JqZWN0cyBoYXZlIGBBcnJheWAgY29uc3RydWN0b3JzXG4gICAgICAgIHZhciBjdG9yQSA9IGEuY29uc3RydWN0b3IsXG4gICAgICAgICAgICBjdG9yQiA9IGIuY29uc3RydWN0b3I7XG5cbiAgICAgICAgLy8gbm9uIGBPYmplY3RgIG9iamVjdCBpbnN0YW5jZXMgd2l0aCBkaWZmZXJlbnQgY29uc3RydWN0b3JzIGFyZSBub3QgZXF1YWxcbiAgICAgICAgaWYgKGN0b3JBICE9IGN0b3JCICYmXG4gICAgICAgICAgICAgICEoaXNGdW5jdGlvbihjdG9yQSkgJiYgY3RvckEgaW5zdGFuY2VvZiBjdG9yQSAmJiBpc0Z1bmN0aW9uKGN0b3JCKSAmJiBjdG9yQiBpbnN0YW5jZW9mIGN0b3JCKSAmJlxuICAgICAgICAgICAgICAoJ2NvbnN0cnVjdG9yJyBpbiBhICYmICdjb25zdHJ1Y3RvcicgaW4gYilcbiAgICAgICAgICAgICkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gYXNzdW1lIGN5Y2xpYyBzdHJ1Y3R1cmVzIGFyZSBlcXVhbFxuICAgICAgLy8gdGhlIGFsZ29yaXRobSBmb3IgZGV0ZWN0aW5nIGN5Y2xpYyBzdHJ1Y3R1cmVzIGlzIGFkYXB0ZWQgZnJvbSBFUyA1LjFcbiAgICAgIC8vIHNlY3Rpb24gMTUuMTIuMywgYWJzdHJhY3Qgb3BlcmF0aW9uIGBKT2AgKGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4MTUuMTIuMylcbiAgICAgIHZhciBpbml0ZWRTdGFjayA9ICFzdGFja0E7XG4gICAgICBzdGFja0EgfHwgKHN0YWNrQSA9IGdldEFycmF5KCkpO1xuICAgICAgc3RhY2tCIHx8IChzdGFja0IgPSBnZXRBcnJheSgpKTtcblxuICAgICAgdmFyIGxlbmd0aCA9IHN0YWNrQS5sZW5ndGg7XG4gICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgaWYgKHN0YWNrQVtsZW5ndGhdID09IGEpIHtcbiAgICAgICAgICByZXR1cm4gc3RhY2tCW2xlbmd0aF0gPT0gYjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIHNpemUgPSAwO1xuICAgICAgcmVzdWx0ID0gdHJ1ZTtcblxuICAgICAgLy8gYWRkIGBhYCBhbmQgYGJgIHRvIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0c1xuICAgICAgc3RhY2tBLnB1c2goYSk7XG4gICAgICBzdGFja0IucHVzaChiKTtcblxuICAgICAgLy8gcmVjdXJzaXZlbHkgY29tcGFyZSBvYmplY3RzIGFuZCBhcnJheXMgKHN1c2NlcHRpYmxlIHRvIGNhbGwgc3RhY2sgbGltaXRzKVxuICAgICAgaWYgKGlzQXJyKSB7XG4gICAgICAgIC8vIGNvbXBhcmUgbGVuZ3RocyB0byBkZXRlcm1pbmUgaWYgYSBkZWVwIGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5XG4gICAgICAgIGxlbmd0aCA9IGEubGVuZ3RoO1xuICAgICAgICBzaXplID0gYi5sZW5ndGg7XG4gICAgICAgIHJlc3VsdCA9IHNpemUgPT0gbGVuZ3RoO1xuXG4gICAgICAgIGlmIChyZXN1bHQgfHwgaXNXaGVyZSkge1xuICAgICAgICAgIC8vIGRlZXAgY29tcGFyZSB0aGUgY29udGVudHMsIGlnbm9yaW5nIG5vbi1udW1lcmljIHByb3BlcnRpZXNcbiAgICAgICAgICB3aGlsZSAoc2l6ZS0tKSB7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSBsZW5ndGgsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBiW3NpemVdO1xuXG4gICAgICAgICAgICBpZiAoaXNXaGVyZSkge1xuICAgICAgICAgICAgICB3aGlsZSAoaW5kZXgtLSkge1xuICAgICAgICAgICAgICAgIGlmICgocmVzdWx0ID0gYmFzZUlzRXF1YWwoYVtpbmRleF0sIHZhbHVlLCBjYWxsYmFjaywgaXNXaGVyZSwgc3RhY2tBLCBzdGFja0IpKSkge1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCEocmVzdWx0ID0gYmFzZUlzRXF1YWwoYVtzaXplXSwgdmFsdWUsIGNhbGxiYWNrLCBpc1doZXJlLCBzdGFja0EsIHN0YWNrQikpKSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIC8vIGRlZXAgY29tcGFyZSBvYmplY3RzIHVzaW5nIGBmb3JJbmAsIGluc3RlYWQgb2YgYGZvck93bmAsIHRvIGF2b2lkIGBPYmplY3Qua2V5c2BcbiAgICAgICAgLy8gd2hpY2gsIGluIHRoaXMgY2FzZSwgaXMgbW9yZSBjb3N0bHlcbiAgICAgICAgZm9ySW4oYiwgZnVuY3Rpb24odmFsdWUsIGtleSwgYikge1xuICAgICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIGtleSkpIHtcbiAgICAgICAgICAgIC8vIGNvdW50IHRoZSBudW1iZXIgb2YgcHJvcGVydGllcy5cbiAgICAgICAgICAgIHNpemUrKztcbiAgICAgICAgICAgIC8vIGRlZXAgY29tcGFyZSBlYWNoIHByb3BlcnR5IHZhbHVlLlxuICAgICAgICAgICAgcmV0dXJuIChyZXN1bHQgPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKGEsIGtleSkgJiYgYmFzZUlzRXF1YWwoYVtrZXldLCB2YWx1ZSwgY2FsbGJhY2ssIGlzV2hlcmUsIHN0YWNrQSwgc3RhY2tCKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAocmVzdWx0ICYmICFpc1doZXJlKSB7XG4gICAgICAgICAgLy8gZW5zdXJlIGJvdGggb2JqZWN0cyBoYXZlIHRoZSBzYW1lIG51bWJlciBvZiBwcm9wZXJ0aWVzXG4gICAgICAgICAgZm9ySW4oYSwgZnVuY3Rpb24odmFsdWUsIGtleSwgYSkge1xuICAgICAgICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoYSwga2V5KSkge1xuICAgICAgICAgICAgICAvLyBgc2l6ZWAgd2lsbCBiZSBgLTFgIGlmIGBhYCBoYXMgbW9yZSBwcm9wZXJ0aWVzIHRoYW4gYGJgXG4gICAgICAgICAgICAgIHJldHVybiAocmVzdWx0ID0gLS1zaXplID4gLTEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzdGFja0EucG9wKCk7XG4gICAgICBzdGFja0IucG9wKCk7XG5cbiAgICAgIGlmIChpbml0ZWRTdGFjaykge1xuICAgICAgICByZWxlYXNlQXJyYXkoc3RhY2tBKTtcbiAgICAgICAgcmVsZWFzZUFycmF5KHN0YWNrQik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLm1lcmdlYCB3aXRob3V0IGFyZ3VtZW50IGp1Z2dsaW5nIG9yIHN1cHBvcnRcbiAgICAgKiBmb3IgYHRoaXNBcmdgIGJpbmRpbmcuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBzb3VyY2Ugb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBtZXJnaW5nIHByb3BlcnRpZXMuXG4gICAgICogQHBhcmFtIHtBcnJheX0gW3N0YWNrQT1bXV0gVHJhY2tzIHRyYXZlcnNlZCBzb3VyY2Ugb2JqZWN0cy5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBbc3RhY2tCPVtdXSBBc3NvY2lhdGVzIHZhbHVlcyB3aXRoIHNvdXJjZSBjb3VudGVycGFydHMuXG4gICAgICovXG4gICAgZnVuY3Rpb24gYmFzZU1lcmdlKG9iamVjdCwgc291cmNlLCBjYWxsYmFjaywgc3RhY2tBLCBzdGFja0IpIHtcbiAgICAgIChpc0FycmF5KHNvdXJjZSkgPyBmb3JFYWNoIDogZm9yT3duKShzb3VyY2UsIGZ1bmN0aW9uKHNvdXJjZSwga2V5KSB7XG4gICAgICAgIHZhciBmb3VuZCxcbiAgICAgICAgICAgIGlzQXJyLFxuICAgICAgICAgICAgcmVzdWx0ID0gc291cmNlLFxuICAgICAgICAgICAgdmFsdWUgPSBvYmplY3Rba2V5XTtcblxuICAgICAgICBpZiAoc291cmNlICYmICgoaXNBcnIgPSBpc0FycmF5KHNvdXJjZSkpIHx8IGlzUGxhaW5PYmplY3Qoc291cmNlKSkpIHtcbiAgICAgICAgICAvLyBhdm9pZCBtZXJnaW5nIHByZXZpb3VzbHkgbWVyZ2VkIGN5Y2xpYyBzb3VyY2VzXG4gICAgICAgICAgdmFyIHN0YWNrTGVuZ3RoID0gc3RhY2tBLmxlbmd0aDtcbiAgICAgICAgICB3aGlsZSAoc3RhY2tMZW5ndGgtLSkge1xuICAgICAgICAgICAgaWYgKChmb3VuZCA9IHN0YWNrQVtzdGFja0xlbmd0aF0gPT0gc291cmNlKSkge1xuICAgICAgICAgICAgICB2YWx1ZSA9IHN0YWNrQltzdGFja0xlbmd0aF07XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIWZvdW5kKSB7XG4gICAgICAgICAgICB2YXIgaXNTaGFsbG93O1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgIHJlc3VsdCA9IGNhbGxiYWNrKHZhbHVlLCBzb3VyY2UpO1xuICAgICAgICAgICAgICBpZiAoKGlzU2hhbGxvdyA9IHR5cGVvZiByZXN1bHQgIT0gJ3VuZGVmaW5lZCcpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSByZXN1bHQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNTaGFsbG93KSB7XG4gICAgICAgICAgICAgIHZhbHVlID0gaXNBcnJcbiAgICAgICAgICAgICAgICA/IChpc0FycmF5KHZhbHVlKSA/IHZhbHVlIDogW10pXG4gICAgICAgICAgICAgICAgOiAoaXNQbGFpbk9iamVjdCh2YWx1ZSkgPyB2YWx1ZSA6IHt9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGFkZCBgc291cmNlYCBhbmQgYXNzb2NpYXRlZCBgdmFsdWVgIHRvIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0c1xuICAgICAgICAgICAgc3RhY2tBLnB1c2goc291cmNlKTtcbiAgICAgICAgICAgIHN0YWNrQi5wdXNoKHZhbHVlKTtcblxuICAgICAgICAgICAgLy8gcmVjdXJzaXZlbHkgbWVyZ2Ugb2JqZWN0cyBhbmQgYXJyYXlzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cylcbiAgICAgICAgICAgIGlmICghaXNTaGFsbG93KSB7XG4gICAgICAgICAgICAgIGJhc2VNZXJnZSh2YWx1ZSwgc291cmNlLCBjYWxsYmFjaywgc3RhY2tBLCBzdGFja0IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IGNhbGxiYWNrKHZhbHVlLCBzb3VyY2UpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByZXN1bHQgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gc291cmNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHlwZW9mIHJlc3VsdCAhPSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdmFsdWUgPSByZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG9iamVjdFtrZXldID0gdmFsdWU7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5yYW5kb21gIHdpdGhvdXQgYXJndW1lbnQganVnZ2xpbmcgb3Igc3VwcG9ydFxuICAgICAqIGZvciByZXR1cm5pbmcgZmxvYXRpbmctcG9pbnQgbnVtYmVycy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbiBUaGUgbWluaW11bSBwb3NzaWJsZSB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWF4IFRoZSBtYXhpbXVtIHBvc3NpYmxlIHZhbHVlLlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgYSByYW5kb20gbnVtYmVyLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJhc2VSYW5kb20obWluLCBtYXgpIHtcbiAgICAgIHJldHVybiBtaW4gKyBmbG9vcihuYXRpdmVSYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udW5pcWAgd2l0aG91dCBzdXBwb3J0IGZvciBjYWxsYmFjayBzaG9ydGhhbmRzXG4gICAgICogb3IgYHRoaXNBcmdgIGJpbmRpbmcuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBwcm9jZXNzLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzU29ydGVkPWZhbHNlXSBBIGZsYWcgdG8gaW5kaWNhdGUgdGhhdCBgYXJyYXlgIGlzIHNvcnRlZC5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIFRoZSBmdW5jdGlvbiBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYSBkdXBsaWNhdGUtdmFsdWUtZnJlZSBhcnJheS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBiYXNlVW5pcShhcnJheSwgaXNTb3J0ZWQsIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBpbmRleE9mID0gZ2V0SW5kZXhPZigpLFxuICAgICAgICAgIGxlbmd0aCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMCxcbiAgICAgICAgICByZXN1bHQgPSBbXTtcblxuICAgICAgdmFyIGlzTGFyZ2UgPSAhaXNTb3J0ZWQgJiYgbGVuZ3RoID49IGxhcmdlQXJyYXlTaXplICYmIGluZGV4T2YgPT09IGJhc2VJbmRleE9mLFxuICAgICAgICAgIHNlZW4gPSAoY2FsbGJhY2sgfHwgaXNMYXJnZSkgPyBnZXRBcnJheSgpIDogcmVzdWx0O1xuXG4gICAgICBpZiAoaXNMYXJnZSkge1xuICAgICAgICB2YXIgY2FjaGUgPSBjcmVhdGVDYWNoZShzZWVuKTtcbiAgICAgICAgaW5kZXhPZiA9IGNhY2hlSW5kZXhPZjtcbiAgICAgICAgc2VlbiA9IGNhY2hlO1xuICAgICAgfVxuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gYXJyYXlbaW5kZXhdLFxuICAgICAgICAgICAgY29tcHV0ZWQgPSBjYWxsYmFjayA/IGNhbGxiYWNrKHZhbHVlLCBpbmRleCwgYXJyYXkpIDogdmFsdWU7XG5cbiAgICAgICAgaWYgKGlzU29ydGVkXG4gICAgICAgICAgICAgID8gIWluZGV4IHx8IHNlZW5bc2Vlbi5sZW5ndGggLSAxXSAhPT0gY29tcHV0ZWRcbiAgICAgICAgICAgICAgOiBpbmRleE9mKHNlZW4sIGNvbXB1dGVkKSA8IDBcbiAgICAgICAgICAgICkge1xuICAgICAgICAgIGlmIChjYWxsYmFjayB8fCBpc0xhcmdlKSB7XG4gICAgICAgICAgICBzZWVuLnB1c2goY29tcHV0ZWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChpc0xhcmdlKSB7XG4gICAgICAgIHJlbGVhc2VBcnJheShzZWVuLmFycmF5KTtcbiAgICAgICAgcmVsZWFzZU9iamVjdChzZWVuKTtcbiAgICAgIH0gZWxzZSBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgcmVsZWFzZUFycmF5KHNlZW4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCBhZ2dyZWdhdGVzIGEgY29sbGVjdGlvbiwgY3JlYXRpbmcgYW4gb2JqZWN0IGNvbXBvc2VkXG4gICAgICogb2Yga2V5cyBnZW5lcmF0ZWQgZnJvbSB0aGUgcmVzdWx0cyBvZiBydW5uaW5nIGVhY2ggZWxlbWVudCBvZiB0aGUgY29sbGVjdGlvblxuICAgICAqIHRocm91Z2ggYSBjYWxsYmFjay4gVGhlIGdpdmVuIGBzZXR0ZXJgIGZ1bmN0aW9uIHNldHMgdGhlIGtleXMgYW5kIHZhbHVlc1xuICAgICAqIG9mIHRoZSBjb21wb3NlZCBvYmplY3QuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IHNldHRlciBUaGUgc2V0dGVyIGZ1bmN0aW9uLlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGFnZ3JlZ2F0b3IgZnVuY3Rpb24uXG4gICAgICovXG4gICAgZnVuY3Rpb24gY3JlYXRlQWdncmVnYXRvcihzZXR0ZXIpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihjb2xsZWN0aW9uLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcblxuICAgICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICAgIGxlbmd0aCA9IGNvbGxlY3Rpb24gPyBjb2xsZWN0aW9uLmxlbmd0aCA6IDA7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBsZW5ndGggPT0gJ251bWJlcicpIHtcbiAgICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gY29sbGVjdGlvbltpbmRleF07XG4gICAgICAgICAgICBzZXR0ZXIocmVzdWx0LCB2YWx1ZSwgY2FsbGJhY2sodmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSwgY29sbGVjdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvck93bihjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWx1ZSwga2V5LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICBzZXR0ZXIocmVzdWx0LCB2YWx1ZSwgY2FsbGJhY2sodmFsdWUsIGtleSwgY29sbGVjdGlvbiksIGNvbGxlY3Rpb24pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCwgZWl0aGVyIGN1cnJpZXMgb3IgaW52b2tlcyBgZnVuY2BcbiAgICAgKiB3aXRoIGFuIG9wdGlvbmFsIGB0aGlzYCBiaW5kaW5nIGFuZCBwYXJ0aWFsbHkgYXBwbGllZCBhcmd1bWVudHMuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258c3RyaW5nfSBmdW5jIFRoZSBmdW5jdGlvbiBvciBtZXRob2QgbmFtZSB0byByZWZlcmVuY2UuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGJpdG1hc2sgVGhlIGJpdG1hc2sgb2YgbWV0aG9kIGZsYWdzIHRvIGNvbXBvc2UuXG4gICAgICogIFRoZSBiaXRtYXNrIG1heSBiZSBjb21wb3NlZCBvZiB0aGUgZm9sbG93aW5nIGZsYWdzOlxuICAgICAqICAxIC0gYF8uYmluZGBcbiAgICAgKiAgMiAtIGBfLmJpbmRLZXlgXG4gICAgICogIDQgLSBgXy5jdXJyeWBcbiAgICAgKiAgOCAtIGBfLmN1cnJ5YCAoYm91bmQpXG4gICAgICogIDE2IC0gYF8ucGFydGlhbGBcbiAgICAgKiAgMzIgLSBgXy5wYXJ0aWFsUmlnaHRgXG4gICAgICogQHBhcmFtIHtBcnJheX0gW3BhcnRpYWxBcmdzXSBBbiBhcnJheSBvZiBhcmd1bWVudHMgdG8gcHJlcGVuZCB0byB0aG9zZVxuICAgICAqICBwcm92aWRlZCB0byB0aGUgbmV3IGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IFtwYXJ0aWFsUmlnaHRBcmdzXSBBbiBhcnJheSBvZiBhcmd1bWVudHMgdG8gYXBwZW5kIHRvIHRob3NlXG4gICAgICogIHByb3ZpZGVkIHRvIHRoZSBuZXcgZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBmdW5jYC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2FyaXR5XSBUaGUgYXJpdHkgb2YgYGZ1bmNgLlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNyZWF0ZVdyYXBwZXIoZnVuYywgYml0bWFzaywgcGFydGlhbEFyZ3MsIHBhcnRpYWxSaWdodEFyZ3MsIHRoaXNBcmcsIGFyaXR5KSB7XG4gICAgICB2YXIgaXNCaW5kID0gYml0bWFzayAmIDEsXG4gICAgICAgICAgaXNCaW5kS2V5ID0gYml0bWFzayAmIDIsXG4gICAgICAgICAgaXNDdXJyeSA9IGJpdG1hc2sgJiA0LFxuICAgICAgICAgIGlzQ3VycnlCb3VuZCA9IGJpdG1hc2sgJiA4LFxuICAgICAgICAgIGlzUGFydGlhbCA9IGJpdG1hc2sgJiAxNixcbiAgICAgICAgICBpc1BhcnRpYWxSaWdodCA9IGJpdG1hc2sgJiAzMjtcblxuICAgICAgaWYgKCFpc0JpbmRLZXkgJiYgIWlzRnVuY3Rpb24oZnVuYykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcjtcbiAgICAgIH1cbiAgICAgIGlmIChpc1BhcnRpYWwgJiYgIXBhcnRpYWxBcmdzLmxlbmd0aCkge1xuICAgICAgICBiaXRtYXNrICY9IH4xNjtcbiAgICAgICAgaXNQYXJ0aWFsID0gcGFydGlhbEFyZ3MgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1BhcnRpYWxSaWdodCAmJiAhcGFydGlhbFJpZ2h0QXJncy5sZW5ndGgpIHtcbiAgICAgICAgYml0bWFzayAmPSB+MzI7XG4gICAgICAgIGlzUGFydGlhbFJpZ2h0ID0gcGFydGlhbFJpZ2h0QXJncyA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgdmFyIGJpbmREYXRhID0gZnVuYyAmJiBmdW5jLl9fYmluZERhdGFfXztcbiAgICAgIGlmIChiaW5kRGF0YSAmJiBiaW5kRGF0YSAhPT0gdHJ1ZSkge1xuICAgICAgICAvLyBjbG9uZSBgYmluZERhdGFgXG4gICAgICAgIGJpbmREYXRhID0gc2xpY2UoYmluZERhdGEpO1xuICAgICAgICBpZiAoYmluZERhdGFbMl0pIHtcbiAgICAgICAgICBiaW5kRGF0YVsyXSA9IHNsaWNlKGJpbmREYXRhWzJdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYmluZERhdGFbM10pIHtcbiAgICAgICAgICBiaW5kRGF0YVszXSA9IHNsaWNlKGJpbmREYXRhWzNdKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzZXQgYHRoaXNCaW5kaW5nYCBpcyBub3QgcHJldmlvdXNseSBib3VuZFxuICAgICAgICBpZiAoaXNCaW5kICYmICEoYmluZERhdGFbMV0gJiAxKSkge1xuICAgICAgICAgIGJpbmREYXRhWzRdID0gdGhpc0FyZztcbiAgICAgICAgfVxuICAgICAgICAvLyBzZXQgaWYgcHJldmlvdXNseSBib3VuZCBidXQgbm90IGN1cnJlbnRseSAoc3Vic2VxdWVudCBjdXJyaWVkIGZ1bmN0aW9ucylcbiAgICAgICAgaWYgKCFpc0JpbmQgJiYgYmluZERhdGFbMV0gJiAxKSB7XG4gICAgICAgICAgYml0bWFzayB8PSA4O1xuICAgICAgICB9XG4gICAgICAgIC8vIHNldCBjdXJyaWVkIGFyaXR5IGlmIG5vdCB5ZXQgc2V0XG4gICAgICAgIGlmIChpc0N1cnJ5ICYmICEoYmluZERhdGFbMV0gJiA0KSkge1xuICAgICAgICAgIGJpbmREYXRhWzVdID0gYXJpdHk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gYXBwZW5kIHBhcnRpYWwgbGVmdCBhcmd1bWVudHNcbiAgICAgICAgaWYgKGlzUGFydGlhbCkge1xuICAgICAgICAgIHB1c2guYXBwbHkoYmluZERhdGFbMl0gfHwgKGJpbmREYXRhWzJdID0gW10pLCBwYXJ0aWFsQXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gYXBwZW5kIHBhcnRpYWwgcmlnaHQgYXJndW1lbnRzXG4gICAgICAgIGlmIChpc1BhcnRpYWxSaWdodCkge1xuICAgICAgICAgIHVuc2hpZnQuYXBwbHkoYmluZERhdGFbM10gfHwgKGJpbmREYXRhWzNdID0gW10pLCBwYXJ0aWFsUmlnaHRBcmdzKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBtZXJnZSBmbGFnc1xuICAgICAgICBiaW5kRGF0YVsxXSB8PSBiaXRtYXNrO1xuICAgICAgICByZXR1cm4gY3JlYXRlV3JhcHBlci5hcHBseShudWxsLCBiaW5kRGF0YSk7XG4gICAgICB9XG4gICAgICAvLyBmYXN0IHBhdGggZm9yIGBfLmJpbmRgXG4gICAgICB2YXIgY3JlYXRlciA9IChiaXRtYXNrID09IDEgfHwgYml0bWFzayA9PT0gMTcpID8gYmFzZUJpbmQgOiBiYXNlQ3JlYXRlV3JhcHBlcjtcbiAgICAgIHJldHVybiBjcmVhdGVyKFtmdW5jLCBiaXRtYXNrLCBwYXJ0aWFsQXJncywgcGFydGlhbFJpZ2h0QXJncywgdGhpc0FyZywgYXJpdHldKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVc2VkIGJ5IGBlc2NhcGVgIHRvIGNvbnZlcnQgY2hhcmFjdGVycyB0byBIVE1MIGVudGl0aWVzLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbWF0Y2ggVGhlIG1hdGNoZWQgY2hhcmFjdGVyIHRvIGVzY2FwZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBlc2NhcGVkIGNoYXJhY3Rlci5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBlc2NhcGVIdG1sQ2hhcihtYXRjaCkge1xuICAgICAgcmV0dXJuIGh0bWxFc2NhcGVzW21hdGNoXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBhcHByb3ByaWF0ZSBcImluZGV4T2ZcIiBmdW5jdGlvbi4gSWYgdGhlIGBfLmluZGV4T2ZgIG1ldGhvZCBpc1xuICAgICAqIGN1c3RvbWl6ZWQsIHRoaXMgbWV0aG9kIHJldHVybnMgdGhlIGN1c3RvbSBtZXRob2QsIG90aGVyd2lzZSBpdCByZXR1cm5zXG4gICAgICogdGhlIGBiYXNlSW5kZXhPZmAgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgXCJpbmRleE9mXCIgZnVuY3Rpb24uXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0SW5kZXhPZigpIHtcbiAgICAgIHZhciByZXN1bHQgPSAocmVzdWx0ID0gbG9kYXNoLmluZGV4T2YpID09PSBpbmRleE9mID8gYmFzZUluZGV4T2YgOiByZXN1bHQ7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgbmF0aXZlIGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24sIGVsc2UgYGZhbHNlYC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc05hdGl2ZSh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nICYmIHJlTmF0aXZlLnRlc3QodmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgYHRoaXNgIGJpbmRpbmcgZGF0YSBvbiBhIGdpdmVuIGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBzZXQgZGF0YSBvbi5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSB2YWx1ZSBUaGUgZGF0YSBhcnJheSB0byBzZXQuXG4gICAgICovXG4gICAgdmFyIHNldEJpbmREYXRhID0gIWRlZmluZVByb3BlcnR5ID8gbm9vcCA6IGZ1bmN0aW9uKGZ1bmMsIHZhbHVlKSB7XG4gICAgICBkZXNjcmlwdG9yLnZhbHVlID0gdmFsdWU7XG4gICAgICBkZWZpbmVQcm9wZXJ0eShmdW5jLCAnX19iaW5kRGF0YV9fJywgZGVzY3JpcHRvcik7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEEgZmFsbGJhY2sgaW1wbGVtZW50YXRpb24gb2YgYGlzUGxhaW5PYmplY3RgIHdoaWNoIGNoZWNrcyBpZiBhIGdpdmVuIHZhbHVlXG4gICAgICogaXMgYW4gb2JqZWN0IGNyZWF0ZWQgYnkgdGhlIGBPYmplY3RgIGNvbnN0cnVjdG9yLCBhc3N1bWluZyBvYmplY3RzIGNyZWF0ZWRcbiAgICAgKiBieSB0aGUgYE9iamVjdGAgY29uc3RydWN0b3IgaGF2ZSBubyBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0aWVzIGFuZCB0aGF0XG4gICAgICogdGhlcmUgYXJlIG5vIGBPYmplY3QucHJvdG90eXBlYCBleHRlbnNpb25zLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNoaW1Jc1BsYWluT2JqZWN0KHZhbHVlKSB7XG4gICAgICB2YXIgY3RvcixcbiAgICAgICAgICByZXN1bHQ7XG5cbiAgICAgIC8vIGF2b2lkIG5vbiBPYmplY3Qgb2JqZWN0cywgYGFyZ3VtZW50c2Agb2JqZWN0cywgYW5kIERPTSBlbGVtZW50c1xuICAgICAgaWYgKCEodmFsdWUgJiYgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gb2JqZWN0Q2xhc3MpIHx8XG4gICAgICAgICAgKGN0b3IgPSB2YWx1ZS5jb25zdHJ1Y3RvciwgaXNGdW5jdGlvbihjdG9yKSAmJiAhKGN0b3IgaW5zdGFuY2VvZiBjdG9yKSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgLy8gSW4gbW9zdCBlbnZpcm9ubWVudHMgYW4gb2JqZWN0J3Mgb3duIHByb3BlcnRpZXMgYXJlIGl0ZXJhdGVkIGJlZm9yZVxuICAgICAgLy8gaXRzIGluaGVyaXRlZCBwcm9wZXJ0aWVzLiBJZiB0aGUgbGFzdCBpdGVyYXRlZCBwcm9wZXJ0eSBpcyBhbiBvYmplY3Qnc1xuICAgICAgLy8gb3duIHByb3BlcnR5IHRoZW4gdGhlcmUgYXJlIG5vIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnRpZXMuXG4gICAgICBmb3JJbih2YWx1ZSwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICByZXN1bHQgPSBrZXk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0eXBlb2YgcmVzdWx0ID09ICd1bmRlZmluZWQnIHx8IGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIHJlc3VsdCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXNlZCBieSBgdW5lc2NhcGVgIHRvIGNvbnZlcnQgSFRNTCBlbnRpdGllcyB0byBjaGFyYWN0ZXJzLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbWF0Y2ggVGhlIG1hdGNoZWQgY2hhcmFjdGVyIHRvIHVuZXNjYXBlLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHVuZXNjYXBlZCBjaGFyYWN0ZXIuXG4gICAgICovXG4gICAgZnVuY3Rpb24gdW5lc2NhcGVIdG1sQ2hhcihtYXRjaCkge1xuICAgICAgcmV0dXJuIGh0bWxVbmVzY2FwZXNbbWF0Y2hdO1xuICAgIH1cblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIChmdW5jdGlvbigpIHsgcmV0dXJuIF8uaXNBcmd1bWVudHMoYXJndW1lbnRzKTsgfSkoMSwgMiwgMyk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogXy5pc0FyZ3VtZW50cyhbMSwgMiwgM10pO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNBcmd1bWVudHModmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgJiYgdHlwZW9mIHZhbHVlLmxlbmd0aCA9PSAnbnVtYmVyJyAmJlxuICAgICAgICB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PSBhcmdzQ2xhc3MgfHwgZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYW4gYXJyYXkuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGFuIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIChmdW5jdGlvbigpIHsgcmV0dXJuIF8uaXNBcnJheShhcmd1bWVudHMpOyB9KSgpO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICpcbiAgICAgKiBfLmlzQXJyYXkoWzEsIDIsIDNdKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgdmFyIGlzQXJyYXkgPSBuYXRpdmVJc0FycmF5IHx8IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnICYmIHR5cGVvZiB2YWx1ZS5sZW5ndGggPT0gJ251bWJlcicgJiZcbiAgICAgICAgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gYXJyYXlDbGFzcyB8fCBmYWxzZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQSBmYWxsYmFjayBpbXBsZW1lbnRhdGlvbiBvZiBgT2JqZWN0LmtleXNgIHdoaWNoIHByb2R1Y2VzIGFuIGFycmF5IG9mIHRoZVxuICAgICAqIGdpdmVuIG9iamVjdCdzIG93biBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpbnNwZWN0LlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhbiBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAgICAgKi9cbiAgICB2YXIgc2hpbUtleXMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICAgIHZhciBpbmRleCwgaXRlcmFibGUgPSBvYmplY3QsIHJlc3VsdCA9IFtdO1xuICAgICAgaWYgKCFpdGVyYWJsZSkgcmV0dXJuIHJlc3VsdDtcbiAgICAgIGlmICghKG9iamVjdFR5cGVzW3R5cGVvZiBvYmplY3RdKSkgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgZm9yIChpbmRleCBpbiBpdGVyYWJsZSkge1xuICAgICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGl0ZXJhYmxlLCBpbmRleCkpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGluZGV4KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhcnJheSBjb21wb3NlZCBvZiB0aGUgb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgYW4gb2JqZWN0LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaW5zcGVjdC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYW4gYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8ua2V5cyh7ICdvbmUnOiAxLCAndHdvJzogMiwgJ3RocmVlJzogMyB9KTtcbiAgICAgKiAvLyA9PiBbJ29uZScsICd0d28nLCAndGhyZWUnXSAocHJvcGVydHkgb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQgYWNyb3NzIGVudmlyb25tZW50cylcbiAgICAgKi9cbiAgICB2YXIga2V5cyA9ICFuYXRpdmVLZXlzID8gc2hpbUtleXMgOiBmdW5jdGlvbihvYmplY3QpIHtcbiAgICAgIGlmICghaXNPYmplY3Qob2JqZWN0KSkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG4gICAgICByZXR1cm4gbmF0aXZlS2V5cyhvYmplY3QpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBVc2VkIHRvIGNvbnZlcnQgY2hhcmFjdGVycyB0byBIVE1MIGVudGl0aWVzOlxuICAgICAqXG4gICAgICogVGhvdWdoIHRoZSBgPmAgY2hhcmFjdGVyIGlzIGVzY2FwZWQgZm9yIHN5bW1ldHJ5LCBjaGFyYWN0ZXJzIGxpa2UgYD5gIGFuZCBgL2BcbiAgICAgKiBkb24ndCByZXF1aXJlIGVzY2FwaW5nIGluIEhUTUwgYW5kIGhhdmUgbm8gc3BlY2lhbCBtZWFuaW5nIHVubGVzcyB0aGV5J3JlIHBhcnRcbiAgICAgKiBvZiBhIHRhZyBvciBhbiB1bnF1b3RlZCBhdHRyaWJ1dGUgdmFsdWUuXG4gICAgICogaHR0cDovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvYW1iaWd1b3VzLWFtcGVyc2FuZHMgKHVuZGVyIFwic2VtaS1yZWxhdGVkIGZ1biBmYWN0XCIpXG4gICAgICovXG4gICAgdmFyIGh0bWxFc2NhcGVzID0ge1xuICAgICAgJyYnOiAnJmFtcDsnLFxuICAgICAgJzwnOiAnJmx0OycsXG4gICAgICAnPic6ICcmZ3Q7JyxcbiAgICAgICdcIic6ICcmcXVvdDsnLFxuICAgICAgXCInXCI6ICcmIzM5OydcbiAgICB9O1xuXG4gICAgLyoqIFVzZWQgdG8gY29udmVydCBIVE1MIGVudGl0aWVzIHRvIGNoYXJhY3RlcnMgKi9cbiAgICB2YXIgaHRtbFVuZXNjYXBlcyA9IGludmVydChodG1sRXNjYXBlcyk7XG5cbiAgICAvKiogVXNlZCB0byBtYXRjaCBIVE1MIGVudGl0aWVzIGFuZCBIVE1MIGNoYXJhY3RlcnMgKi9cbiAgICB2YXIgcmVFc2NhcGVkSHRtbCA9IFJlZ0V4cCgnKCcgKyBrZXlzKGh0bWxVbmVzY2FwZXMpLmpvaW4oJ3wnKSArICcpJywgJ2cnKSxcbiAgICAgICAgcmVVbmVzY2FwZWRIdG1sID0gUmVnRXhwKCdbJyArIGtleXMoaHRtbEVzY2FwZXMpLmpvaW4oJycpICsgJ10nLCAnZycpO1xuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvKipcbiAgICAgKiBBc3NpZ25zIG93biBlbnVtZXJhYmxlIHByb3BlcnRpZXMgb2Ygc291cmNlIG9iamVjdChzKSB0byB0aGUgZGVzdGluYXRpb25cbiAgICAgKiBvYmplY3QuIFN1YnNlcXVlbnQgc291cmNlcyB3aWxsIG92ZXJ3cml0ZSBwcm9wZXJ0eSBhc3NpZ25tZW50cyBvZiBwcmV2aW91c1xuICAgICAqIHNvdXJjZXMuIElmIGEgY2FsbGJhY2sgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSBleGVjdXRlZCB0byBwcm9kdWNlIHRoZVxuICAgICAqIGFzc2lnbmVkIHZhbHVlcy4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIHR3b1xuICAgICAqIGFyZ3VtZW50czsgKG9iamVjdFZhbHVlLCBzb3VyY2VWYWx1ZSkuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAqIEBhbGlhcyBleHRlbmRcbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAgICAgKiBAcGFyYW0gey4uLk9iamVjdH0gW3NvdXJjZV0gVGhlIHNvdXJjZSBvYmplY3RzLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBhc3NpZ25pbmcgdmFsdWVzLlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5hc3NpZ24oeyAnbmFtZSc6ICdmcmVkJyB9LCB7ICdlbXBsb3llcic6ICdzbGF0ZScgfSk7XG4gICAgICogLy8gPT4geyAnbmFtZSc6ICdmcmVkJywgJ2VtcGxveWVyJzogJ3NsYXRlJyB9XG4gICAgICpcbiAgICAgKiB2YXIgZGVmYXVsdHMgPSBfLnBhcnRpYWxSaWdodChfLmFzc2lnbiwgZnVuY3Rpb24oYSwgYikge1xuICAgICAqICAgcmV0dXJuIHR5cGVvZiBhID09ICd1bmRlZmluZWQnID8gYiA6IGE7XG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiB2YXIgb2JqZWN0ID0geyAnbmFtZSc6ICdiYXJuZXknIH07XG4gICAgICogZGVmYXVsdHMob2JqZWN0LCB7ICduYW1lJzogJ2ZyZWQnLCAnZW1wbG95ZXInOiAnc2xhdGUnIH0pO1xuICAgICAqIC8vID0+IHsgJ25hbWUnOiAnYmFybmV5JywgJ2VtcGxveWVyJzogJ3NsYXRlJyB9XG4gICAgICovXG4gICAgdmFyIGFzc2lnbiA9IGZ1bmN0aW9uKG9iamVjdCwgc291cmNlLCBndWFyZCkge1xuICAgICAgdmFyIGluZGV4LCBpdGVyYWJsZSA9IG9iamVjdCwgcmVzdWx0ID0gaXRlcmFibGU7XG4gICAgICBpZiAoIWl0ZXJhYmxlKSByZXR1cm4gcmVzdWx0O1xuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICAgICAgYXJnc0luZGV4ID0gMCxcbiAgICAgICAgICBhcmdzTGVuZ3RoID0gdHlwZW9mIGd1YXJkID09ICdudW1iZXInID8gMiA6IGFyZ3MubGVuZ3RoO1xuICAgICAgaWYgKGFyZ3NMZW5ndGggPiAzICYmIHR5cGVvZiBhcmdzW2FyZ3NMZW5ndGggLSAyXSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IGJhc2VDcmVhdGVDYWxsYmFjayhhcmdzWy0tYXJnc0xlbmd0aCAtIDFdLCBhcmdzW2FyZ3NMZW5ndGgtLV0sIDIpO1xuICAgICAgfSBlbHNlIGlmIChhcmdzTGVuZ3RoID4gMiAmJiB0eXBlb2YgYXJnc1thcmdzTGVuZ3RoIC0gMV0gPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjYWxsYmFjayA9IGFyZ3NbLS1hcmdzTGVuZ3RoXTtcbiAgICAgIH1cbiAgICAgIHdoaWxlICgrK2FyZ3NJbmRleCA8IGFyZ3NMZW5ndGgpIHtcbiAgICAgICAgaXRlcmFibGUgPSBhcmdzW2FyZ3NJbmRleF07XG4gICAgICAgIGlmIChpdGVyYWJsZSAmJiBvYmplY3RUeXBlc1t0eXBlb2YgaXRlcmFibGVdKSB7XG4gICAgICAgIHZhciBvd25JbmRleCA9IC0xLFxuICAgICAgICAgICAgb3duUHJvcHMgPSBvYmplY3RUeXBlc1t0eXBlb2YgaXRlcmFibGVdICYmIGtleXMoaXRlcmFibGUpLFxuICAgICAgICAgICAgbGVuZ3RoID0gb3duUHJvcHMgPyBvd25Qcm9wcy5sZW5ndGggOiAwO1xuXG4gICAgICAgIHdoaWxlICgrK293bkluZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgaW5kZXggPSBvd25Qcm9wc1tvd25JbmRleF07XG4gICAgICAgICAgcmVzdWx0W2luZGV4XSA9IGNhbGxiYWNrID8gY2FsbGJhY2socmVzdWx0W2luZGV4XSwgaXRlcmFibGVbaW5kZXhdKSA6IGl0ZXJhYmxlW2luZGV4XTtcbiAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBjbG9uZSBvZiBgdmFsdWVgLiBJZiBgaXNEZWVwYCBpcyBgdHJ1ZWAgbmVzdGVkIG9iamVjdHMgd2lsbCBhbHNvXG4gICAgICogYmUgY2xvbmVkLCBvdGhlcndpc2UgdGhleSB3aWxsIGJlIGFzc2lnbmVkIGJ5IHJlZmVyZW5jZS4gSWYgYSBjYWxsYmFja1xuICAgICAqIGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgZXhlY3V0ZWQgdG8gcHJvZHVjZSB0aGUgY2xvbmVkIHZhbHVlcy4gSWYgdGhlXG4gICAgICogY2FsbGJhY2sgcmV0dXJucyBgdW5kZWZpbmVkYCBjbG9uaW5nIHdpbGwgYmUgaGFuZGxlZCBieSB0aGUgbWV0aG9kIGluc3RlYWQuXG4gICAgICogVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIG9uZSBhcmd1bWVudDsgKHZhbHVlKS5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2xvbmUuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbaXNEZWVwPWZhbHNlXSBTcGVjaWZ5IGEgZGVlcCBjbG9uZS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY2xvbmluZyB2YWx1ZXMuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGNsb25lZCB2YWx1ZS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSBbXG4gICAgICogICB7ICduYW1lJzogJ2Jhcm5leScsICdhZ2UnOiAzNiB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdmcmVkJywgICAnYWdlJzogNDAgfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiB2YXIgc2hhbGxvdyA9IF8uY2xvbmUoY2hhcmFjdGVycyk7XG4gICAgICogc2hhbGxvd1swXSA9PT0gY2hhcmFjdGVyc1swXTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiB2YXIgZGVlcCA9IF8uY2xvbmUoY2hhcmFjdGVycywgdHJ1ZSk7XG4gICAgICogZGVlcFswXSA9PT0gY2hhcmFjdGVyc1swXTtcbiAgICAgKiAvLyA9PiBmYWxzZVxuICAgICAqXG4gICAgICogXy5taXhpbih7XG4gICAgICogICAnY2xvbmUnOiBfLnBhcnRpYWxSaWdodChfLmNsb25lLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAqICAgICByZXR1cm4gXy5pc0VsZW1lbnQodmFsdWUpID8gdmFsdWUuY2xvbmVOb2RlKGZhbHNlKSA6IHVuZGVmaW5lZDtcbiAgICAgKiAgIH0pXG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiB2YXIgY2xvbmUgPSBfLmNsb25lKGRvY3VtZW50LmJvZHkpO1xuICAgICAqIGNsb25lLmNoaWxkTm9kZXMubGVuZ3RoO1xuICAgICAqIC8vID0+IDBcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjbG9uZSh2YWx1ZSwgaXNEZWVwLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgLy8gYWxsb3dzIHdvcmtpbmcgd2l0aCBcIkNvbGxlY3Rpb25zXCIgbWV0aG9kcyB3aXRob3V0IHVzaW5nIHRoZWlyIGBpbmRleGBcbiAgICAgIC8vIGFuZCBgY29sbGVjdGlvbmAgYXJndW1lbnRzIGZvciBgaXNEZWVwYCBhbmQgYGNhbGxiYWNrYFxuICAgICAgaWYgKHR5cGVvZiBpc0RlZXAgIT0gJ2Jvb2xlYW4nICYmIGlzRGVlcCAhPSBudWxsKSB7XG4gICAgICAgIHRoaXNBcmcgPSBjYWxsYmFjaztcbiAgICAgICAgY2FsbGJhY2sgPSBpc0RlZXA7XG4gICAgICAgIGlzRGVlcCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJhc2VDbG9uZSh2YWx1ZSwgaXNEZWVwLCB0eXBlb2YgY2FsbGJhY2sgPT0gJ2Z1bmN0aW9uJyAmJiBiYXNlQ3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDEpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZGVlcCBjbG9uZSBvZiBgdmFsdWVgLiBJZiBhIGNhbGxiYWNrIGlzIHByb3ZpZGVkIGl0IHdpbGwgYmVcbiAgICAgKiBleGVjdXRlZCB0byBwcm9kdWNlIHRoZSBjbG9uZWQgdmFsdWVzLiBJZiB0aGUgY2FsbGJhY2sgcmV0dXJucyBgdW5kZWZpbmVkYFxuICAgICAqIGNsb25pbmcgd2lsbCBiZSBoYW5kbGVkIGJ5IHRoZSBtZXRob2QgaW5zdGVhZC4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvXG4gICAgICogYHRoaXNBcmdgIGFuZCBpbnZva2VkIHdpdGggb25lIGFyZ3VtZW50OyAodmFsdWUpLlxuICAgICAqXG4gICAgICogTm90ZTogVGhpcyBtZXRob2QgaXMgbG9vc2VseSBiYXNlZCBvbiB0aGUgc3RydWN0dXJlZCBjbG9uZSBhbGdvcml0aG0uIEZ1bmN0aW9uc1xuICAgICAqIGFuZCBET00gbm9kZXMgYXJlICoqbm90KiogY2xvbmVkLiBUaGUgZW51bWVyYWJsZSBwcm9wZXJ0aWVzIG9mIGBhcmd1bWVudHNgIG9iamVjdHMgYW5kXG4gICAgICogb2JqZWN0cyBjcmVhdGVkIGJ5IGNvbnN0cnVjdG9ycyBvdGhlciB0aGFuIGBPYmplY3RgIGFyZSBjbG9uZWQgdG8gcGxhaW4gYE9iamVjdGAgb2JqZWN0cy5cbiAgICAgKiBTZWUgaHR0cDovL3d3dy53My5vcmcvVFIvaHRtbDUvaW5mcmFzdHJ1Y3R1cmUuaHRtbCNpbnRlcm5hbC1zdHJ1Y3R1cmVkLWNsb25pbmctYWxnb3JpdGhtLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBkZWVwIGNsb25lLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjbG9uaW5nIHZhbHVlcy5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZGVlcCBjbG9uZWQgdmFsdWUuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBjaGFyYWN0ZXJzID0gW1xuICAgICAqICAgeyAnbmFtZSc6ICdiYXJuZXknLCAnYWdlJzogMzYgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgJ2FnZSc6IDQwIH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogdmFyIGRlZXAgPSBfLmNsb25lRGVlcChjaGFyYWN0ZXJzKTtcbiAgICAgKiBkZWVwWzBdID09PSBjaGFyYWN0ZXJzWzBdO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICpcbiAgICAgKiB2YXIgdmlldyA9IHtcbiAgICAgKiAgICdsYWJlbCc6ICdkb2NzJyxcbiAgICAgKiAgICdub2RlJzogZWxlbWVudFxuICAgICAqIH07XG4gICAgICpcbiAgICAgKiB2YXIgY2xvbmUgPSBfLmNsb25lRGVlcCh2aWV3LCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAqICAgcmV0dXJuIF8uaXNFbGVtZW50KHZhbHVlKSA/IHZhbHVlLmNsb25lTm9kZSh0cnVlKSA6IHVuZGVmaW5lZDtcbiAgICAgKiB9KTtcbiAgICAgKlxuICAgICAqIGNsb25lLm5vZGUgPT0gdmlldy5ub2RlO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICovXG4gICAgZnVuY3Rpb24gY2xvbmVEZWVwKHZhbHVlLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgcmV0dXJuIGJhc2VDbG9uZSh2YWx1ZSwgdHJ1ZSwgdHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbicgJiYgYmFzZUNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAxKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBvYmplY3QgdGhhdCBpbmhlcml0cyBmcm9tIHRoZSBnaXZlbiBgcHJvdG90eXBlYCBvYmplY3QuIElmIGFcbiAgICAgKiBgcHJvcGVydGllc2Agb2JqZWN0IGlzIHByb3ZpZGVkIGl0cyBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzIGFyZSBhc3NpZ25lZFxuICAgICAqIHRvIHRoZSBjcmVhdGVkIG9iamVjdC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHByb3RvdHlwZSBUaGUgb2JqZWN0IHRvIGluaGVyaXQgZnJvbS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXNdIFRoZSBwcm9wZXJ0aWVzIHRvIGFzc2lnbiB0byB0aGUgb2JqZWN0LlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIG5ldyBvYmplY3QuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIGZ1bmN0aW9uIFNoYXBlKCkge1xuICAgICAqICAgdGhpcy54ID0gMDtcbiAgICAgKiAgIHRoaXMueSA9IDA7XG4gICAgICogfVxuICAgICAqXG4gICAgICogZnVuY3Rpb24gQ2lyY2xlKCkge1xuICAgICAqICAgU2hhcGUuY2FsbCh0aGlzKTtcbiAgICAgKiB9XG4gICAgICpcbiAgICAgKiBDaXJjbGUucHJvdG90eXBlID0gXy5jcmVhdGUoU2hhcGUucHJvdG90eXBlLCB7ICdjb25zdHJ1Y3Rvcic6IENpcmNsZSB9KTtcbiAgICAgKlxuICAgICAqIHZhciBjaXJjbGUgPSBuZXcgQ2lyY2xlO1xuICAgICAqIGNpcmNsZSBpbnN0YW5jZW9mIENpcmNsZTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBjaXJjbGUgaW5zdGFuY2VvZiBTaGFwZTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgZnVuY3Rpb24gY3JlYXRlKHByb3RvdHlwZSwgcHJvcGVydGllcykge1xuICAgICAgdmFyIHJlc3VsdCA9IGJhc2VDcmVhdGUocHJvdG90eXBlKTtcbiAgICAgIHJldHVybiBwcm9wZXJ0aWVzID8gYXNzaWduKHJlc3VsdCwgcHJvcGVydGllcykgOiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXNzaWducyBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzIG9mIHNvdXJjZSBvYmplY3QocykgdG8gdGhlIGRlc3RpbmF0aW9uXG4gICAgICogb2JqZWN0IGZvciBhbGwgZGVzdGluYXRpb24gcHJvcGVydGllcyB0aGF0IHJlc29sdmUgdG8gYHVuZGVmaW5lZGAuIE9uY2UgYVxuICAgICAqIHByb3BlcnR5IGlzIHNldCwgYWRkaXRpb25hbCBkZWZhdWx0cyBvZiB0aGUgc2FtZSBwcm9wZXJ0eSB3aWxsIGJlIGlnbm9yZWQuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7Li4uT2JqZWN0fSBbc291cmNlXSBUaGUgc291cmNlIG9iamVjdHMuXG4gICAgICogQHBhcmFtLSB7T2JqZWN0fSBbZ3VhcmRdIEFsbG93cyB3b3JraW5nIHdpdGggYF8ucmVkdWNlYCB3aXRob3V0IHVzaW5nIGl0c1xuICAgICAqICBga2V5YCBhbmQgYG9iamVjdGAgYXJndW1lbnRzIGFzIHNvdXJjZXMuXG4gICAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgb2JqZWN0ID0geyAnbmFtZSc6ICdiYXJuZXknIH07XG4gICAgICogXy5kZWZhdWx0cyhvYmplY3QsIHsgJ25hbWUnOiAnZnJlZCcsICdlbXBsb3llcic6ICdzbGF0ZScgfSk7XG4gICAgICogLy8gPT4geyAnbmFtZSc6ICdiYXJuZXknLCAnZW1wbG95ZXInOiAnc2xhdGUnIH1cbiAgICAgKi9cbiAgICB2YXIgZGVmYXVsdHMgPSBmdW5jdGlvbihvYmplY3QsIHNvdXJjZSwgZ3VhcmQpIHtcbiAgICAgIHZhciBpbmRleCwgaXRlcmFibGUgPSBvYmplY3QsIHJlc3VsdCA9IGl0ZXJhYmxlO1xuICAgICAgaWYgKCFpdGVyYWJsZSkgcmV0dXJuIHJlc3VsdDtcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICAgIGFyZ3NJbmRleCA9IDAsXG4gICAgICAgICAgYXJnc0xlbmd0aCA9IHR5cGVvZiBndWFyZCA9PSAnbnVtYmVyJyA/IDIgOiBhcmdzLmxlbmd0aDtcbiAgICAgIHdoaWxlICgrK2FyZ3NJbmRleCA8IGFyZ3NMZW5ndGgpIHtcbiAgICAgICAgaXRlcmFibGUgPSBhcmdzW2FyZ3NJbmRleF07XG4gICAgICAgIGlmIChpdGVyYWJsZSAmJiBvYmplY3RUeXBlc1t0eXBlb2YgaXRlcmFibGVdKSB7XG4gICAgICAgIHZhciBvd25JbmRleCA9IC0xLFxuICAgICAgICAgICAgb3duUHJvcHMgPSBvYmplY3RUeXBlc1t0eXBlb2YgaXRlcmFibGVdICYmIGtleXMoaXRlcmFibGUpLFxuICAgICAgICAgICAgbGVuZ3RoID0gb3duUHJvcHMgPyBvd25Qcm9wcy5sZW5ndGggOiAwO1xuXG4gICAgICAgIHdoaWxlICgrK293bkluZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgaW5kZXggPSBvd25Qcm9wc1tvd25JbmRleF07XG4gICAgICAgICAgaWYgKHR5cGVvZiByZXN1bHRbaW5kZXhdID09ICd1bmRlZmluZWQnKSByZXN1bHRbaW5kZXhdID0gaXRlcmFibGVbaW5kZXhdO1xuICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgbGlrZSBgXy5maW5kSW5kZXhgIGV4Y2VwdCB0aGF0IGl0IHJldHVybnMgdGhlIGtleSBvZiB0aGVcbiAgICAgKiBmaXJzdCBlbGVtZW50IHRoYXQgcGFzc2VzIHRoZSBjYWxsYmFjayBjaGVjaywgaW5zdGVhZCBvZiB0aGUgZWxlbWVudCBpdHNlbGYuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHNlYXJjaC5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdHxzdHJpbmd9IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXJcbiAgICAgKiAgaXRlcmF0aW9uLiBJZiBhIHByb3BlcnR5IG5hbWUgb3Igb2JqZWN0IGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgdXNlZCB0b1xuICAgICAqICBjcmVhdGUgYSBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFjaywgcmVzcGVjdGl2ZWx5LlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd8dW5kZWZpbmVkfSBSZXR1cm5zIHRoZSBrZXkgb2YgdGhlIGZvdW5kIGVsZW1lbnQsIGVsc2UgYHVuZGVmaW5lZGAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBjaGFyYWN0ZXJzID0ge1xuICAgICAqICAgJ2Jhcm5leSc6IHsgICdhZ2UnOiAzNiwgJ2Jsb2NrZWQnOiBmYWxzZSB9LFxuICAgICAqICAgJ2ZyZWQnOiB7ICAgICdhZ2UnOiA0MCwgJ2Jsb2NrZWQnOiB0cnVlIH0sXG4gICAgICogICAncGViYmxlcyc6IHsgJ2FnZSc6IDEsICAnYmxvY2tlZCc6IGZhbHNlIH1cbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogXy5maW5kS2V5KGNoYXJhY3RlcnMsIGZ1bmN0aW9uKGNocikge1xuICAgICAqICAgcmV0dXJuIGNoci5hZ2UgPCA0MDtcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiAnYmFybmV5JyAocHJvcGVydHkgb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQgYWNyb3NzIGVudmlyb25tZW50cylcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy53aGVyZVwiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8uZmluZEtleShjaGFyYWN0ZXJzLCB7ICdhZ2UnOiAxIH0pO1xuICAgICAqIC8vID0+ICdwZWJibGVzJ1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLnBsdWNrXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5maW5kS2V5KGNoYXJhY3RlcnMsICdibG9ja2VkJyk7XG4gICAgICogLy8gPT4gJ2ZyZWQnXG4gICAgICovXG4gICAgZnVuY3Rpb24gZmluZEtleShvYmplY3QsIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgcmVzdWx0O1xuICAgICAgY2FsbGJhY2sgPSBsb2Rhc2guY3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDMpO1xuICAgICAgZm9yT3duKG9iamVjdCwgZnVuY3Rpb24odmFsdWUsIGtleSwgb2JqZWN0KSB7XG4gICAgICAgIGlmIChjYWxsYmFjayh2YWx1ZSwga2V5LCBvYmplY3QpKSB7XG4gICAgICAgICAgcmVzdWx0ID0ga2V5O1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8uZmluZEtleWAgZXhjZXB0IHRoYXQgaXQgaXRlcmF0ZXMgb3ZlciBlbGVtZW50c1xuICAgICAqIG9mIGEgYGNvbGxlY3Rpb25gIGluIHRoZSBvcHBvc2l0ZSBvcmRlci5cbiAgICAgKlxuICAgICAqIElmIGEgcHJvcGVydHkgbmFtZSBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ucGx1Y2tcIiBzdHlsZVxuICAgICAqIGNhbGxiYWNrIHdpbGwgcmV0dXJuIHRoZSBwcm9wZXJ0eSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKlxuICAgICAqIElmIGFuIG9iamVjdCBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFja1xuICAgICAqIHdpbGwgcmV0dXJuIGB0cnVlYCBmb3IgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBnaXZlbiBvYmplY3QsXG4gICAgICogZWxzZSBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gc2VhcmNoLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlclxuICAgICAqICBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkIHRvXG4gICAgICogIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge3N0cmluZ3x1bmRlZmluZWR9IFJldHVybnMgdGhlIGtleSBvZiB0aGUgZm91bmQgZWxlbWVudCwgZWxzZSBgdW5kZWZpbmVkYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSB7XG4gICAgICogICAnYmFybmV5JzogeyAgJ2FnZSc6IDM2LCAnYmxvY2tlZCc6IHRydWUgfSxcbiAgICAgKiAgICdmcmVkJzogeyAgICAnYWdlJzogNDAsICdibG9ja2VkJzogZmFsc2UgfSxcbiAgICAgKiAgICdwZWJibGVzJzogeyAnYWdlJzogMSwgICdibG9ja2VkJzogdHJ1ZSB9XG4gICAgICogfTtcbiAgICAgKlxuICAgICAqIF8uZmluZExhc3RLZXkoY2hhcmFjdGVycywgZnVuY3Rpb24oY2hyKSB7XG4gICAgICogICByZXR1cm4gY2hyLmFnZSA8IDQwO1xuICAgICAqIH0pO1xuICAgICAqIC8vID0+IHJldHVybnMgYHBlYmJsZXNgLCBhc3N1bWluZyBgXy5maW5kS2V5YCByZXR1cm5zIGBiYXJuZXlgXG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ud2hlcmVcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLmZpbmRMYXN0S2V5KGNoYXJhY3RlcnMsIHsgJ2FnZSc6IDQwIH0pO1xuICAgICAqIC8vID0+ICdmcmVkJ1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLnBsdWNrXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5maW5kTGFzdEtleShjaGFyYWN0ZXJzLCAnYmxvY2tlZCcpO1xuICAgICAqIC8vID0+ICdwZWJibGVzJ1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZpbmRMYXN0S2V5KG9iamVjdCwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHZhciByZXN1bHQ7XG4gICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICBmb3JPd25SaWdodChvYmplY3QsIGZ1bmN0aW9uKHZhbHVlLCBrZXksIG9iamVjdCkge1xuICAgICAgICBpZiAoY2FsbGJhY2sodmFsdWUsIGtleSwgb2JqZWN0KSkge1xuICAgICAgICAgIHJlc3VsdCA9IGtleTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJdGVyYXRlcyBvdmVyIG93biBhbmQgaW5oZXJpdGVkIGVudW1lcmFibGUgcHJvcGVydGllcyBvZiBhbiBvYmplY3QsXG4gICAgICogZXhlY3V0aW5nIHRoZSBjYWxsYmFjayBmb3IgZWFjaCBwcm9wZXJ0eS4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYFxuICAgICAqIGFuZCBpbnZva2VkIHdpdGggdGhyZWUgYXJndW1lbnRzOyAodmFsdWUsIGtleSwgb2JqZWN0KS4gQ2FsbGJhY2tzIG1heSBleGl0XG4gICAgICogaXRlcmF0aW9uIGVhcmx5IGJ5IGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBmdW5jdGlvbiBTaGFwZSgpIHtcbiAgICAgKiAgIHRoaXMueCA9IDA7XG4gICAgICogICB0aGlzLnkgPSAwO1xuICAgICAqIH1cbiAgICAgKlxuICAgICAqIFNoYXBlLnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24oeCwgeSkge1xuICAgICAqICAgdGhpcy54ICs9IHg7XG4gICAgICogICB0aGlzLnkgKz0geTtcbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogXy5mb3JJbihuZXcgU2hhcGUsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgKiAgIGNvbnNvbGUubG9nKGtleSk7XG4gICAgICogfSk7XG4gICAgICogLy8gPT4gbG9ncyAneCcsICd5JywgYW5kICdtb3ZlJyAocHJvcGVydHkgb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQgYWNyb3NzIGVudmlyb25tZW50cylcbiAgICAgKi9cbiAgICB2YXIgZm9ySW4gPSBmdW5jdGlvbihjb2xsZWN0aW9uLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIGluZGV4LCBpdGVyYWJsZSA9IGNvbGxlY3Rpb24sIHJlc3VsdCA9IGl0ZXJhYmxlO1xuICAgICAgaWYgKCFpdGVyYWJsZSkgcmV0dXJuIHJlc3VsdDtcbiAgICAgIGlmICghb2JqZWN0VHlwZXNbdHlwZW9mIGl0ZXJhYmxlXSkgcmV0dXJuIHJlc3VsdDtcbiAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgJiYgdHlwZW9mIHRoaXNBcmcgPT0gJ3VuZGVmaW5lZCcgPyBjYWxsYmFjayA6IGJhc2VDcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICAgIGZvciAoaW5kZXggaW4gaXRlcmFibGUpIHtcbiAgICAgICAgICBpZiAoY2FsbGJhY2soaXRlcmFibGVbaW5kZXhdLCBpbmRleCwgY29sbGVjdGlvbikgPT09IGZhbHNlKSByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8uZm9ySW5gIGV4Y2VwdCB0aGF0IGl0IGl0ZXJhdGVzIG92ZXIgZWxlbWVudHNcbiAgICAgKiBvZiBhIGBjb2xsZWN0aW9uYCBpbiB0aGUgb3Bwb3NpdGUgb3JkZXIuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogZnVuY3Rpb24gU2hhcGUoKSB7XG4gICAgICogICB0aGlzLnggPSAwO1xuICAgICAqICAgdGhpcy55ID0gMDtcbiAgICAgKiB9XG4gICAgICpcbiAgICAgKiBTaGFwZS5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgKiAgIHRoaXMueCArPSB4O1xuICAgICAqICAgdGhpcy55ICs9IHk7XG4gICAgICogfTtcbiAgICAgKlxuICAgICAqIF8uZm9ySW5SaWdodChuZXcgU2hhcGUsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgKiAgIGNvbnNvbGUubG9nKGtleSk7XG4gICAgICogfSk7XG4gICAgICogLy8gPT4gbG9ncyAnbW92ZScsICd5JywgYW5kICd4JyBhc3N1bWluZyBgXy5mb3JJbiBgIGxvZ3MgJ3gnLCAneScsIGFuZCAnbW92ZSdcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBmb3JJblJpZ2h0KG9iamVjdCwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHZhciBwYWlycyA9IFtdO1xuXG4gICAgICBmb3JJbihvYmplY3QsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgcGFpcnMucHVzaChrZXksIHZhbHVlKTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgbGVuZ3RoID0gcGFpcnMubGVuZ3RoO1xuICAgICAgY2FsbGJhY2sgPSBiYXNlQ3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDMpO1xuICAgICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgIGlmIChjYWxsYmFjayhwYWlyc1tsZW5ndGgtLV0sIHBhaXJzW2xlbmd0aF0sIG9iamVjdCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSXRlcmF0ZXMgb3ZlciBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzIG9mIGFuIG9iamVjdCwgZXhlY3V0aW5nIHRoZSBjYWxsYmFja1xuICAgICAqIGZvciBlYWNoIHByb3BlcnR5LiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZCBpbnZva2VkIHdpdGggdGhyZWVcbiAgICAgKiBhcmd1bWVudHM7ICh2YWx1ZSwga2V5LCBvYmplY3QpLiBDYWxsYmFja3MgbWF5IGV4aXQgaXRlcmF0aW9uIGVhcmx5IGJ5XG4gICAgICogZXhwbGljaXRseSByZXR1cm5pbmcgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEB0eXBlIEZ1bmN0aW9uXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uZm9yT3duKHsgJzAnOiAnemVybycsICcxJzogJ29uZScsICdsZW5ndGgnOiAyIH0sIGZ1bmN0aW9uKG51bSwga2V5KSB7XG4gICAgICogICBjb25zb2xlLmxvZyhrZXkpO1xuICAgICAqIH0pO1xuICAgICAqIC8vID0+IGxvZ3MgJzAnLCAnMScsIGFuZCAnbGVuZ3RoJyAocHJvcGVydHkgb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQgYWNyb3NzIGVudmlyb25tZW50cylcbiAgICAgKi9cbiAgICB2YXIgZm9yT3duID0gZnVuY3Rpb24oY29sbGVjdGlvbiwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHZhciBpbmRleCwgaXRlcmFibGUgPSBjb2xsZWN0aW9uLCByZXN1bHQgPSBpdGVyYWJsZTtcbiAgICAgIGlmICghaXRlcmFibGUpIHJldHVybiByZXN1bHQ7XG4gICAgICBpZiAoIW9iamVjdFR5cGVzW3R5cGVvZiBpdGVyYWJsZV0pIHJldHVybiByZXN1bHQ7XG4gICAgICBjYWxsYmFjayA9IGNhbGxiYWNrICYmIHR5cGVvZiB0aGlzQXJnID09ICd1bmRlZmluZWQnID8gY2FsbGJhY2sgOiBiYXNlQ3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDMpO1xuICAgICAgICB2YXIgb3duSW5kZXggPSAtMSxcbiAgICAgICAgICAgIG93blByb3BzID0gb2JqZWN0VHlwZXNbdHlwZW9mIGl0ZXJhYmxlXSAmJiBrZXlzKGl0ZXJhYmxlKSxcbiAgICAgICAgICAgIGxlbmd0aCA9IG93blByb3BzID8gb3duUHJvcHMubGVuZ3RoIDogMDtcblxuICAgICAgICB3aGlsZSAoKytvd25JbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgIGluZGV4ID0gb3duUHJvcHNbb3duSW5kZXhdO1xuICAgICAgICAgIGlmIChjYWxsYmFjayhpdGVyYWJsZVtpbmRleF0sIGluZGV4LCBjb2xsZWN0aW9uKSA9PT0gZmFsc2UpIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgbGlrZSBgXy5mb3JPd25gIGV4Y2VwdCB0aGF0IGl0IGl0ZXJhdGVzIG92ZXIgZWxlbWVudHNcbiAgICAgKiBvZiBhIGBjb2xsZWN0aW9uYCBpbiB0aGUgb3Bwb3NpdGUgb3JkZXIuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5mb3JPd25SaWdodCh7ICcwJzogJ3plcm8nLCAnMSc6ICdvbmUnLCAnbGVuZ3RoJzogMiB9LCBmdW5jdGlvbihudW0sIGtleSkge1xuICAgICAqICAgY29uc29sZS5sb2coa2V5KTtcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiBsb2dzICdsZW5ndGgnLCAnMScsIGFuZCAnMCcgYXNzdW1pbmcgYF8uZm9yT3duYCBsb2dzICcwJywgJzEnLCBhbmQgJ2xlbmd0aCdcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBmb3JPd25SaWdodChvYmplY3QsIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgcHJvcHMgPSBrZXlzKG9iamVjdCksXG4gICAgICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuXG4gICAgICBjYWxsYmFjayA9IGJhc2VDcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgdmFyIGtleSA9IHByb3BzW2xlbmd0aF07XG4gICAgICAgIGlmIChjYWxsYmFjayhvYmplY3Rba2V5XSwga2V5LCBvYmplY3QpID09PSBmYWxzZSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqZWN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBzb3J0ZWQgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMgb2YgYWxsIGVudW1lcmFibGUgcHJvcGVydGllcyxcbiAgICAgKiBvd24gYW5kIGluaGVyaXRlZCwgb2YgYG9iamVjdGAgdGhhdCBoYXZlIGZ1bmN0aW9uIHZhbHVlcy5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBhbGlhcyBtZXRob2RzXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaW5zcGVjdC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYW4gYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMgdGhhdCBoYXZlIGZ1bmN0aW9uIHZhbHVlcy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5mdW5jdGlvbnMoXyk7XG4gICAgICogLy8gPT4gWydhbGwnLCAnYW55JywgJ2JpbmQnLCAnYmluZEFsbCcsICdjbG9uZScsICdjb21wYWN0JywgJ2NvbXBvc2UnLCAuLi5dXG4gICAgICovXG4gICAgZnVuY3Rpb24gZnVuY3Rpb25zKG9iamVjdCkge1xuICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgZm9ySW4ob2JqZWN0LCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdC5zb3J0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBzcGVjaWZpZWQgcHJvcGVydHkgbmFtZSBleGlzdHMgYXMgYSBkaXJlY3QgcHJvcGVydHkgb2YgYG9iamVjdGAsXG4gICAgICogaW5zdGVhZCBvZiBhbiBpbmhlcml0ZWQgcHJvcGVydHkuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpbnNwZWN0LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBrZXkgaXMgYSBkaXJlY3QgcHJvcGVydHksIGVsc2UgYGZhbHNlYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5oYXMoeyAnYSc6IDEsICdiJzogMiwgJ2MnOiAzIH0sICdiJyk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGhhcyhvYmplY3QsIGtleSkge1xuICAgICAgcmV0dXJuIG9iamVjdCA/IGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpIDogZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBvYmplY3QgY29tcG9zZWQgb2YgdGhlIGludmVydGVkIGtleXMgYW5kIHZhbHVlcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaW52ZXJ0LlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGNyZWF0ZWQgaW52ZXJ0ZWQgb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmludmVydCh7ICdmaXJzdCc6ICdmcmVkJywgJ3NlY29uZCc6ICdiYXJuZXknIH0pO1xuICAgICAqIC8vID0+IHsgJ2ZyZWQnOiAnZmlyc3QnLCAnYmFybmV5JzogJ3NlY29uZCcgfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGludmVydChvYmplY3QpIHtcbiAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgIHByb3BzID0ga2V5cyhvYmplY3QpLFxuICAgICAgICAgIGxlbmd0aCA9IHByb3BzLmxlbmd0aCxcbiAgICAgICAgICByZXN1bHQgPSB7fTtcblxuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgdmFyIGtleSA9IHByb3BzW2luZGV4XTtcbiAgICAgICAgcmVzdWx0W29iamVjdFtrZXldXSA9IGtleTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBib29sZWFuIHZhbHVlLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYSBib29sZWFuIHZhbHVlLCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uaXNCb29sZWFuKG51bGwpO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNCb29sZWFuKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUgPT09IHRydWUgfHwgdmFsdWUgPT09IGZhbHNlIHx8XG4gICAgICAgIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyAmJiB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PSBib29sQ2xhc3MgfHwgZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBkYXRlLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYSBkYXRlLCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uaXNEYXRlKG5ldyBEYXRlKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNEYXRlKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnICYmIHRvU3RyaW5nLmNhbGwodmFsdWUpID09IGRhdGVDbGFzcyB8fCBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIERPTSBlbGVtZW50LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYSBET00gZWxlbWVudCwgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmlzRWxlbWVudChkb2N1bWVudC5ib2R5KTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNFbGVtZW50KHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUgJiYgdmFsdWUubm9kZVR5cGUgPT09IDEgfHwgZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgZW1wdHkuIEFycmF5cywgc3RyaW5ncywgb3IgYGFyZ3VtZW50c2Agb2JqZWN0cyB3aXRoIGFcbiAgICAgKiBsZW5ndGggb2YgYDBgIGFuZCBvYmplY3RzIHdpdGggbm8gb3duIGVudW1lcmFibGUgcHJvcGVydGllcyBhcmUgY29uc2lkZXJlZFxuICAgICAqIFwiZW1wdHlcIi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSB2YWx1ZSBUaGUgdmFsdWUgdG8gaW5zcGVjdC5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgZW1wdHksIGVsc2UgYGZhbHNlYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5pc0VtcHR5KFsxLCAyLCAzXSk7XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKlxuICAgICAqIF8uaXNFbXB0eSh7fSk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogXy5pc0VtcHR5KCcnKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSkge1xuICAgICAgdmFyIHJlc3VsdCA9IHRydWU7XG4gICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgICB2YXIgY2xhc3NOYW1lID0gdG9TdHJpbmcuY2FsbCh2YWx1ZSksXG4gICAgICAgICAgbGVuZ3RoID0gdmFsdWUubGVuZ3RoO1xuXG4gICAgICBpZiAoKGNsYXNzTmFtZSA9PSBhcnJheUNsYXNzIHx8IGNsYXNzTmFtZSA9PSBzdHJpbmdDbGFzcyB8fCBjbGFzc05hbWUgPT0gYXJnc0NsYXNzICkgfHxcbiAgICAgICAgICAoY2xhc3NOYW1lID09IG9iamVjdENsYXNzICYmIHR5cGVvZiBsZW5ndGggPT0gJ251bWJlcicgJiYgaXNGdW5jdGlvbih2YWx1ZS5zcGxpY2UpKSkge1xuICAgICAgICByZXR1cm4gIWxlbmd0aDtcbiAgICAgIH1cbiAgICAgIGZvck93bih2YWx1ZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAocmVzdWx0ID0gZmFsc2UpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBlcmZvcm1zIGEgZGVlcCBjb21wYXJpc29uIGJldHdlZW4gdHdvIHZhbHVlcyB0byBkZXRlcm1pbmUgaWYgdGhleSBhcmVcbiAgICAgKiBlcXVpdmFsZW50IHRvIGVhY2ggb3RoZXIuIElmIGEgY2FsbGJhY2sgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSBleGVjdXRlZFxuICAgICAqIHRvIGNvbXBhcmUgdmFsdWVzLiBJZiB0aGUgY2FsbGJhY2sgcmV0dXJucyBgdW5kZWZpbmVkYCBjb21wYXJpc29ucyB3aWxsXG4gICAgICogYmUgaGFuZGxlZCBieSB0aGUgbWV0aG9kIGluc3RlYWQuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kXG4gICAgICogaW52b2tlZCB3aXRoIHR3byBhcmd1bWVudHM7IChhLCBiKS5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHsqfSBhIFRoZSB2YWx1ZSB0byBjb21wYXJlLlxuICAgICAqIEBwYXJhbSB7Kn0gYiBUaGUgb3RoZXIgdmFsdWUgdG8gY29tcGFyZS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaW5nIHZhbHVlcy5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgb2JqZWN0ID0geyAnbmFtZSc6ICdmcmVkJyB9O1xuICAgICAqIHZhciBjb3B5ID0geyAnbmFtZSc6ICdmcmVkJyB9O1xuICAgICAqXG4gICAgICogb2JqZWN0ID09IGNvcHk7XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKlxuICAgICAqIF8uaXNFcXVhbChvYmplY3QsIGNvcHkpO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKlxuICAgICAqIHZhciB3b3JkcyA9IFsnaGVsbG8nLCAnZ29vZGJ5ZSddO1xuICAgICAqIHZhciBvdGhlcldvcmRzID0gWydoaScsICdnb29kYnllJ107XG4gICAgICpcbiAgICAgKiBfLmlzRXF1YWwod29yZHMsIG90aGVyV29yZHMsIGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgKiAgIHZhciByZUdyZWV0ID0gL14oPzpoZWxsb3xoaSkkL2ksXG4gICAgICogICAgICAgYUdyZWV0ID0gXy5pc1N0cmluZyhhKSAmJiByZUdyZWV0LnRlc3QoYSksXG4gICAgICogICAgICAgYkdyZWV0ID0gXy5pc1N0cmluZyhiKSAmJiByZUdyZWV0LnRlc3QoYik7XG4gICAgICpcbiAgICAgKiAgIHJldHVybiAoYUdyZWV0IHx8IGJHcmVldCkgPyAoYUdyZWV0ID09IGJHcmVldCkgOiB1bmRlZmluZWQ7XG4gICAgICogfSk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGlzRXF1YWwoYSwgYiwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHJldHVybiBiYXNlSXNFcXVhbChhLCBiLCB0eXBlb2YgY2FsbGJhY2sgPT0gJ2Z1bmN0aW9uJyAmJiBiYXNlQ3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDIpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYHZhbHVlYCBpcywgb3IgY2FuIGJlIGNvZXJjZWQgdG8sIGEgZmluaXRlIG51bWJlci5cbiAgICAgKlxuICAgICAqIE5vdGU6IFRoaXMgaXMgbm90IHRoZSBzYW1lIGFzIG5hdGl2ZSBgaXNGaW5pdGVgIHdoaWNoIHdpbGwgcmV0dXJuIHRydWUgZm9yXG4gICAgICogYm9vbGVhbnMgYW5kIGVtcHR5IHN0cmluZ3MuIFNlZSBodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDE1LjEuMi41LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgZmluaXRlLCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uaXNGaW5pdGUoLTEwMSk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogXy5pc0Zpbml0ZSgnMTAnKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmlzRmluaXRlKHRydWUpO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICpcbiAgICAgKiBfLmlzRmluaXRlKCcnKTtcbiAgICAgKiAvLyA9PiBmYWxzZVxuICAgICAqXG4gICAgICogXy5pc0Zpbml0ZShJbmZpbml0eSk7XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc0Zpbml0ZSh2YWx1ZSkge1xuICAgICAgcmV0dXJuIG5hdGl2ZUlzRmluaXRlKHZhbHVlKSAmJiAhbmF0aXZlSXNOYU4ocGFyc2VGbG9hdCh2YWx1ZSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uaXNGdW5jdGlvbihfKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZSBsYW5ndWFnZSB0eXBlIG9mIE9iamVjdC5cbiAgICAgKiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmlzT2JqZWN0KHt9KTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogXy5pc09iamVjdCgxKTtcbiAgICAgKiAvLyA9PiBmYWxzZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gICAgICAvLyBjaGVjayBpZiB0aGUgdmFsdWUgaXMgdGhlIEVDTUFTY3JpcHQgbGFuZ3VhZ2UgdHlwZSBvZiBPYmplY3RcbiAgICAgIC8vIGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4OFxuICAgICAgLy8gYW5kIGF2b2lkIGEgVjggYnVnXG4gICAgICAvLyBodHRwOi8vY29kZS5nb29nbGUuY29tL3AvdjgvaXNzdWVzL2RldGFpbD9pZD0yMjkxXG4gICAgICByZXR1cm4gISEodmFsdWUgJiYgb2JqZWN0VHlwZXNbdHlwZW9mIHZhbHVlXSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYE5hTmAuXG4gICAgICpcbiAgICAgKiBOb3RlOiBUaGlzIGlzIG5vdCB0aGUgc2FtZSBhcyBuYXRpdmUgYGlzTmFOYCB3aGljaCB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yXG4gICAgICogYHVuZGVmaW5lZGAgYW5kIG90aGVyIG5vbi1udW1lcmljIHZhbHVlcy4gU2VlIGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4MTUuMS4yLjQuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBgTmFOYCwgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmlzTmFOKE5hTik7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogXy5pc05hTihuZXcgTnVtYmVyKE5hTikpO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKlxuICAgICAqIGlzTmFOKHVuZGVmaW5lZCk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogXy5pc05hTih1bmRlZmluZWQpO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNOYU4odmFsdWUpIHtcbiAgICAgIC8vIGBOYU5gIGFzIGEgcHJpbWl0aXZlIGlzIHRoZSBvbmx5IHZhbHVlIHRoYXQgaXMgbm90IGVxdWFsIHRvIGl0c2VsZlxuICAgICAgLy8gKHBlcmZvcm0gdGhlIFtbQ2xhc3NdXSBjaGVjayBmaXJzdCB0byBhdm9pZCBlcnJvcnMgd2l0aCBzb21lIGhvc3Qgb2JqZWN0cyBpbiBJRSlcbiAgICAgIHJldHVybiBpc051bWJlcih2YWx1ZSkgJiYgdmFsdWUgIT0gK3ZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGBudWxsYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGBudWxsYCwgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmlzTnVsbChudWxsKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmlzTnVsbCh1bmRlZmluZWQpO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNOdWxsKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUgPT09IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBudW1iZXIuXG4gICAgICpcbiAgICAgKiBOb3RlOiBgTmFOYCBpcyBjb25zaWRlcmVkIGEgbnVtYmVyLiBTZWUgaHR0cDovL2VzNS5naXRodWIuaW8vI3g4LjUuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBhIG51bWJlciwgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmlzTnVtYmVyKDguNCAqIDUpO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc051bWJlcih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyB8fFxuICAgICAgICB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgJiYgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gbnVtYmVyQ2xhc3MgfHwgZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYW4gb2JqZWN0IGNyZWF0ZWQgYnkgdGhlIGBPYmplY3RgIGNvbnN0cnVjdG9yLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBmdW5jdGlvbiBTaGFwZSgpIHtcbiAgICAgKiAgIHRoaXMueCA9IDA7XG4gICAgICogICB0aGlzLnkgPSAwO1xuICAgICAqIH1cbiAgICAgKlxuICAgICAqIF8uaXNQbGFpbk9iamVjdChuZXcgU2hhcGUpO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICpcbiAgICAgKiBfLmlzUGxhaW5PYmplY3QoWzEsIDIsIDNdKTtcbiAgICAgKiAvLyA9PiBmYWxzZVxuICAgICAqXG4gICAgICogXy5pc1BsYWluT2JqZWN0KHsgJ3gnOiAwLCAneSc6IDAgfSk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqL1xuICAgIHZhciBpc1BsYWluT2JqZWN0ID0gIWdldFByb3RvdHlwZU9mID8gc2hpbUlzUGxhaW5PYmplY3QgOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKCEodmFsdWUgJiYgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gb2JqZWN0Q2xhc3MpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHZhciB2YWx1ZU9mID0gdmFsdWUudmFsdWVPZixcbiAgICAgICAgICBvYmpQcm90byA9IGlzTmF0aXZlKHZhbHVlT2YpICYmIChvYmpQcm90byA9IGdldFByb3RvdHlwZU9mKHZhbHVlT2YpKSAmJiBnZXRQcm90b3R5cGVPZihvYmpQcm90byk7XG5cbiAgICAgIHJldHVybiBvYmpQcm90b1xuICAgICAgICA/ICh2YWx1ZSA9PSBvYmpQcm90byB8fCBnZXRQcm90b3R5cGVPZih2YWx1ZSkgPT0gb2JqUHJvdG8pXG4gICAgICAgIDogc2hpbUlzUGxhaW5PYmplY3QodmFsdWUpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHJlZ3VsYXIgZXhwcmVzc2lvbi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGEgcmVndWxhciBleHByZXNzaW9uLCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uaXNSZWdFeHAoL2ZyZWQvKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNSZWdFeHAodmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgJiYgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gcmVnZXhwQ2xhc3MgfHwgZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBzdHJpbmcuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBhIHN0cmluZywgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmlzU3RyaW5nKCdmcmVkJyk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGlzU3RyaW5nKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdzdHJpbmcnIHx8XG4gICAgICAgIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyAmJiB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PSBzdHJpbmdDbGFzcyB8fCBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBgdW5kZWZpbmVkYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGB1bmRlZmluZWRgLCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uaXNVbmRlZmluZWQodm9pZCAwKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsdWUpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3VuZGVmaW5lZCc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBvYmplY3Qgd2l0aCB0aGUgc2FtZSBrZXlzIGFzIGBvYmplY3RgIGFuZCB2YWx1ZXMgZ2VuZXJhdGVkIGJ5XG4gICAgICogcnVubmluZyBlYWNoIG93biBlbnVtZXJhYmxlIHByb3BlcnR5IG9mIGBvYmplY3RgIHRocm91Z2ggdGhlIGNhbGxiYWNrLlxuICAgICAqIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aCB0aHJlZSBhcmd1bWVudHM7XG4gICAgICogKHZhbHVlLCBrZXksIG9iamVjdCkuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdHxzdHJpbmd9IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZFxuICAgICAqICBwZXIgaXRlcmF0aW9uLiBJZiBhIHByb3BlcnR5IG5hbWUgb3Igb2JqZWN0IGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgdXNlZFxuICAgICAqICB0byBjcmVhdGUgYSBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFjaywgcmVzcGVjdGl2ZWx5LlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhIG5ldyBvYmplY3Qgd2l0aCB2YWx1ZXMgb2YgdGhlIHJlc3VsdHMgb2YgZWFjaCBgY2FsbGJhY2tgIGV4ZWN1dGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5tYXBWYWx1ZXMoeyAnYSc6IDEsICdiJzogMiwgJ2MnOiAzfSAsIGZ1bmN0aW9uKG51bSkgeyByZXR1cm4gbnVtICogMzsgfSk7XG4gICAgICogLy8gPT4geyAnYSc6IDMsICdiJzogNiwgJ2MnOiA5IH1cbiAgICAgKlxuICAgICAqIHZhciBjaGFyYWN0ZXJzID0ge1xuICAgICAqICAgJ2ZyZWQnOiB7ICduYW1lJzogJ2ZyZWQnLCAnYWdlJzogNDAgfSxcbiAgICAgKiAgICdwZWJibGVzJzogeyAnbmFtZSc6ICdwZWJibGVzJywgJ2FnZSc6IDEgfVxuICAgICAqIH07XG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ucGx1Y2tcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLm1hcFZhbHVlcyhjaGFyYWN0ZXJzLCAnYWdlJyk7XG4gICAgICogLy8gPT4geyAnZnJlZCc6IDQwLCAncGViYmxlcyc6IDEgfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG1hcFZhbHVlcyhvYmplY3QsIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG5cbiAgICAgIGZvck93bihvYmplY3QsIGZ1bmN0aW9uKHZhbHVlLCBrZXksIG9iamVjdCkge1xuICAgICAgICByZXN1bHRba2V5XSA9IGNhbGxiYWNrKHZhbHVlLCBrZXksIG9iamVjdCk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVjdXJzaXZlbHkgbWVyZ2VzIG93biBlbnVtZXJhYmxlIHByb3BlcnRpZXMgb2YgdGhlIHNvdXJjZSBvYmplY3QocyksIHRoYXRcbiAgICAgKiBkb24ndCByZXNvbHZlIHRvIGB1bmRlZmluZWRgIGludG8gdGhlIGRlc3RpbmF0aW9uIG9iamVjdC4gU3Vic2VxdWVudCBzb3VyY2VzXG4gICAgICogd2lsbCBvdmVyd3JpdGUgcHJvcGVydHkgYXNzaWdubWVudHMgb2YgcHJldmlvdXMgc291cmNlcy4gSWYgYSBjYWxsYmFjayBpc1xuICAgICAqIHByb3ZpZGVkIGl0IHdpbGwgYmUgZXhlY3V0ZWQgdG8gcHJvZHVjZSB0aGUgbWVyZ2VkIHZhbHVlcyBvZiB0aGUgZGVzdGluYXRpb25cbiAgICAgKiBhbmQgc291cmNlIHByb3BlcnRpZXMuIElmIHRoZSBjYWxsYmFjayByZXR1cm5zIGB1bmRlZmluZWRgIG1lcmdpbmcgd2lsbFxuICAgICAqIGJlIGhhbmRsZWQgYnkgdGhlIG1ldGhvZCBpbnN0ZWFkLiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZFxuICAgICAqIGludm9rZWQgd2l0aCB0d28gYXJndW1lbnRzOyAob2JqZWN0VmFsdWUsIHNvdXJjZVZhbHVlKS5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7Li4uT2JqZWN0fSBbc291cmNlXSBUaGUgc291cmNlIG9iamVjdHMuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIG1lcmdpbmcgcHJvcGVydGllcy5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBuYW1lcyA9IHtcbiAgICAgKiAgICdjaGFyYWN0ZXJzJzogW1xuICAgICAqICAgICB7ICduYW1lJzogJ2Jhcm5leScgfSxcbiAgICAgKiAgICAgeyAnbmFtZSc6ICdmcmVkJyB9XG4gICAgICogICBdXG4gICAgICogfTtcbiAgICAgKlxuICAgICAqIHZhciBhZ2VzID0ge1xuICAgICAqICAgJ2NoYXJhY3RlcnMnOiBbXG4gICAgICogICAgIHsgJ2FnZSc6IDM2IH0sXG4gICAgICogICAgIHsgJ2FnZSc6IDQwIH1cbiAgICAgKiAgIF1cbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogXy5tZXJnZShuYW1lcywgYWdlcyk7XG4gICAgICogLy8gPT4geyAnY2hhcmFjdGVycyc6IFt7ICduYW1lJzogJ2Jhcm5leScsICdhZ2UnOiAzNiB9LCB7ICduYW1lJzogJ2ZyZWQnLCAnYWdlJzogNDAgfV0gfVxuICAgICAqXG4gICAgICogdmFyIGZvb2QgPSB7XG4gICAgICogICAnZnJ1aXRzJzogWydhcHBsZSddLFxuICAgICAqICAgJ3ZlZ2V0YWJsZXMnOiBbJ2JlZXQnXVxuICAgICAqIH07XG4gICAgICpcbiAgICAgKiB2YXIgb3RoZXJGb29kID0ge1xuICAgICAqICAgJ2ZydWl0cyc6IFsnYmFuYW5hJ10sXG4gICAgICogICAndmVnZXRhYmxlcyc6IFsnY2Fycm90J11cbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogXy5tZXJnZShmb29kLCBvdGhlckZvb2QsIGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgKiAgIHJldHVybiBfLmlzQXJyYXkoYSkgPyBhLmNvbmNhdChiKSA6IHVuZGVmaW5lZDtcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiB7ICdmcnVpdHMnOiBbJ2FwcGxlJywgJ2JhbmFuYSddLCAndmVnZXRhYmxlcyc6IFsnYmVldCcsICdjYXJyb3RdIH1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBtZXJnZShvYmplY3QpIHtcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICAgIGxlbmd0aCA9IDI7XG5cbiAgICAgIGlmICghaXNPYmplY3Qob2JqZWN0KSkge1xuICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgICAgfVxuICAgICAgLy8gYWxsb3dzIHdvcmtpbmcgd2l0aCBgXy5yZWR1Y2VgIGFuZCBgXy5yZWR1Y2VSaWdodGAgd2l0aG91dCB1c2luZ1xuICAgICAgLy8gdGhlaXIgYGluZGV4YCBhbmQgYGNvbGxlY3Rpb25gIGFyZ3VtZW50c1xuICAgICAgaWYgKHR5cGVvZiBhcmdzWzJdICE9ICdudW1iZXInKSB7XG4gICAgICAgIGxlbmd0aCA9IGFyZ3MubGVuZ3RoO1xuICAgICAgfVxuICAgICAgaWYgKGxlbmd0aCA+IDMgJiYgdHlwZW9mIGFyZ3NbbGVuZ3RoIC0gMl0gPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSBiYXNlQ3JlYXRlQ2FsbGJhY2soYXJnc1stLWxlbmd0aCAtIDFdLCBhcmdzW2xlbmd0aC0tXSwgMik7XG4gICAgICB9IGVsc2UgaWYgKGxlbmd0aCA+IDIgJiYgdHlwZW9mIGFyZ3NbbGVuZ3RoIC0gMV0gPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjYWxsYmFjayA9IGFyZ3NbLS1sZW5ndGhdO1xuICAgICAgfVxuICAgICAgdmFyIHNvdXJjZXMgPSBzbGljZShhcmd1bWVudHMsIDEsIGxlbmd0aCksXG4gICAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgICBzdGFja0EgPSBnZXRBcnJheSgpLFxuICAgICAgICAgIHN0YWNrQiA9IGdldEFycmF5KCk7XG5cbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIGJhc2VNZXJnZShvYmplY3QsIHNvdXJjZXNbaW5kZXhdLCBjYWxsYmFjaywgc3RhY2tBLCBzdGFja0IpO1xuICAgICAgfVxuICAgICAgcmVsZWFzZUFycmF5KHN0YWNrQSk7XG4gICAgICByZWxlYXNlQXJyYXkoc3RhY2tCKTtcbiAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHNoYWxsb3cgY2xvbmUgb2YgYG9iamVjdGAgZXhjbHVkaW5nIHRoZSBzcGVjaWZpZWQgcHJvcGVydGllcy5cbiAgICAgKiBQcm9wZXJ0eSBuYW1lcyBtYXkgYmUgc3BlY2lmaWVkIGFzIGluZGl2aWR1YWwgYXJndW1lbnRzIG9yIGFzIGFycmF5cyBvZlxuICAgICAqIHByb3BlcnR5IG5hbWVzLiBJZiBhIGNhbGxiYWNrIGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgZXhlY3V0ZWQgZm9yIGVhY2hcbiAgICAgKiBwcm9wZXJ0eSBvZiBgb2JqZWN0YCBvbWl0dGluZyB0aGUgcHJvcGVydGllcyB0aGUgY2FsbGJhY2sgcmV0dXJucyB0cnVleVxuICAgICAqIGZvci4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50cztcbiAgICAgKiAodmFsdWUsIGtleSwgb2JqZWN0KS5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgc291cmNlIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufC4uLnN0cmluZ3xzdHJpbmdbXX0gW2NhbGxiYWNrXSBUaGUgcHJvcGVydGllcyB0byBvbWl0IG9yIHRoZVxuICAgICAqICBmdW5jdGlvbiBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGFuIG9iamVjdCB3aXRob3V0IHRoZSBvbWl0dGVkIHByb3BlcnRpZXMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8ub21pdCh7ICduYW1lJzogJ2ZyZWQnLCAnYWdlJzogNDAgfSwgJ2FnZScpO1xuICAgICAqIC8vID0+IHsgJ25hbWUnOiAnZnJlZCcgfVxuICAgICAqXG4gICAgICogXy5vbWl0KHsgJ25hbWUnOiAnZnJlZCcsICdhZ2UnOiA0MCB9LCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAqICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJztcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiB7ICduYW1lJzogJ2ZyZWQnIH1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBvbWl0KG9iamVjdCwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgcHJvcHMgPSBbXTtcbiAgICAgICAgZm9ySW4ob2JqZWN0LCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgcHJvcHMucHVzaChrZXkpO1xuICAgICAgICB9KTtcbiAgICAgICAgcHJvcHMgPSBiYXNlRGlmZmVyZW5jZShwcm9wcywgYmFzZUZsYXR0ZW4oYXJndW1lbnRzLCB0cnVlLCBmYWxzZSwgMSkpO1xuXG4gICAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuXG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgdmFyIGtleSA9IHByb3BzW2luZGV4XTtcbiAgICAgICAgICByZXN1bHRba2V5XSA9IG9iamVjdFtrZXldO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICAgIGZvckluKG9iamVjdCwgZnVuY3Rpb24odmFsdWUsIGtleSwgb2JqZWN0KSB7XG4gICAgICAgICAgaWYgKCFjYWxsYmFjayh2YWx1ZSwga2V5LCBvYmplY3QpKSB7XG4gICAgICAgICAgICByZXN1bHRba2V5XSA9IHZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSB0d28gZGltZW5zaW9uYWwgYXJyYXkgb2YgYW4gb2JqZWN0J3Mga2V5LXZhbHVlIHBhaXJzLFxuICAgICAqIGkuZS4gYFtba2V5MSwgdmFsdWUxXSwgW2tleTIsIHZhbHVlMl1dYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGluc3BlY3QuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIG5ldyBhcnJheSBvZiBrZXktdmFsdWUgcGFpcnMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8ucGFpcnMoeyAnYmFybmV5JzogMzYsICdmcmVkJzogNDAgfSk7XG4gICAgICogLy8gPT4gW1snYmFybmV5JywgMzZdLCBbJ2ZyZWQnLCA0MF1dIChwcm9wZXJ0eSBvcmRlciBpcyBub3QgZ3VhcmFudGVlZCBhY3Jvc3MgZW52aXJvbm1lbnRzKVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHBhaXJzKG9iamVjdCkge1xuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgcHJvcHMgPSBrZXlzKG9iamVjdCksXG4gICAgICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoLFxuICAgICAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIHZhciBrZXkgPSBwcm9wc1tpbmRleF07XG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSBba2V5LCBvYmplY3Rba2V5XV07XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBzaGFsbG93IGNsb25lIG9mIGBvYmplY3RgIGNvbXBvc2VkIG9mIHRoZSBzcGVjaWZpZWQgcHJvcGVydGllcy5cbiAgICAgKiBQcm9wZXJ0eSBuYW1lcyBtYXkgYmUgc3BlY2lmaWVkIGFzIGluZGl2aWR1YWwgYXJndW1lbnRzIG9yIGFzIGFycmF5cyBvZlxuICAgICAqIHByb3BlcnR5IG5hbWVzLiBJZiBhIGNhbGxiYWNrIGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgZXhlY3V0ZWQgZm9yIGVhY2hcbiAgICAgKiBwcm9wZXJ0eSBvZiBgb2JqZWN0YCBwaWNraW5nIHRoZSBwcm9wZXJ0aWVzIHRoZSBjYWxsYmFjayByZXR1cm5zIHRydWV5XG4gICAgICogZm9yLiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZCBpbnZva2VkIHdpdGggdGhyZWUgYXJndW1lbnRzO1xuICAgICAqICh2YWx1ZSwga2V5LCBvYmplY3QpLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBzb3VyY2Ugb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258Li4uc3RyaW5nfHN0cmluZ1tdfSBbY2FsbGJhY2tdIFRoZSBmdW5jdGlvbiBjYWxsZWQgcGVyXG4gICAgICogIGl0ZXJhdGlvbiBvciBwcm9wZXJ0eSBuYW1lcyB0byBwaWNrLCBzcGVjaWZpZWQgYXMgaW5kaXZpZHVhbCBwcm9wZXJ0eVxuICAgICAqICBuYW1lcyBvciBhcnJheXMgb2YgcHJvcGVydHkgbmFtZXMuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBhbiBvYmplY3QgY29tcG9zZWQgb2YgdGhlIHBpY2tlZCBwcm9wZXJ0aWVzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLnBpY2soeyAnbmFtZSc6ICdmcmVkJywgJ191c2VyaWQnOiAnZnJlZDEnIH0sICduYW1lJyk7XG4gICAgICogLy8gPT4geyAnbmFtZSc6ICdmcmVkJyB9XG4gICAgICpcbiAgICAgKiBfLnBpY2soeyAnbmFtZSc6ICdmcmVkJywgJ191c2VyaWQnOiAnZnJlZDEnIH0sIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgKiAgIHJldHVybiBrZXkuY2hhckF0KDApICE9ICdfJztcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiB7ICduYW1lJzogJ2ZyZWQnIH1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBwaWNrKG9iamVjdCwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICAgIHByb3BzID0gYmFzZUZsYXR0ZW4oYXJndW1lbnRzLCB0cnVlLCBmYWxzZSwgMSksXG4gICAgICAgICAgICBsZW5ndGggPSBpc09iamVjdChvYmplY3QpID8gcHJvcHMubGVuZ3RoIDogMDtcblxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgIHZhciBrZXkgPSBwcm9wc1tpbmRleF07XG4gICAgICAgICAgaWYgKGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gb2JqZWN0W2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICAgIGZvckluKG9iamVjdCwgZnVuY3Rpb24odmFsdWUsIGtleSwgb2JqZWN0KSB7XG4gICAgICAgICAgaWYgKGNhbGxiYWNrKHZhbHVlLCBrZXksIG9iamVjdCkpIHtcbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQW4gYWx0ZXJuYXRpdmUgdG8gYF8ucmVkdWNlYCB0aGlzIG1ldGhvZCB0cmFuc2Zvcm1zIGBvYmplY3RgIHRvIGEgbmV3XG4gICAgICogYGFjY3VtdWxhdG9yYCBvYmplY3Qgd2hpY2ggaXMgdGhlIHJlc3VsdCBvZiBydW5uaW5nIGVhY2ggb2YgaXRzIG93blxuICAgICAqIGVudW1lcmFibGUgcHJvcGVydGllcyB0aHJvdWdoIGEgY2FsbGJhY2ssIHdpdGggZWFjaCBjYWxsYmFjayBleGVjdXRpb25cbiAgICAgKiBwb3RlbnRpYWxseSBtdXRhdGluZyB0aGUgYGFjY3VtdWxhdG9yYCBvYmplY3QuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0b1xuICAgICAqIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIGZvdXIgYXJndW1lbnRzOyAoYWNjdW11bGF0b3IsIHZhbHVlLCBrZXksIG9iamVjdCkuXG4gICAgICogQ2FsbGJhY2tzIG1heSBleGl0IGl0ZXJhdGlvbiBlYXJseSBieSBleHBsaWNpdGx5IHJldHVybmluZyBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICAgICAqIEBwYXJhbSB7Kn0gW2FjY3VtdWxhdG9yXSBUaGUgY3VzdG9tIGFjY3VtdWxhdG9yIHZhbHVlLlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBhY2N1bXVsYXRlZCB2YWx1ZS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIHNxdWFyZXMgPSBfLnRyYW5zZm9ybShbMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTBdLCBmdW5jdGlvbihyZXN1bHQsIG51bSkge1xuICAgICAqICAgbnVtICo9IG51bTtcbiAgICAgKiAgIGlmIChudW0gJSAyKSB7XG4gICAgICogICAgIHJldHVybiByZXN1bHQucHVzaChudW0pIDwgMztcbiAgICAgKiAgIH1cbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiBbMSwgOSwgMjVdXG4gICAgICpcbiAgICAgKiB2YXIgbWFwcGVkID0gXy50cmFuc2Zvcm0oeyAnYSc6IDEsICdiJzogMiwgJ2MnOiAzIH0sIGZ1bmN0aW9uKHJlc3VsdCwgbnVtLCBrZXkpIHtcbiAgICAgKiAgIHJlc3VsdFtrZXldID0gbnVtICogMztcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiB7ICdhJzogMywgJ2InOiA2LCAnYyc6IDkgfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRyYW5zZm9ybShvYmplY3QsIGNhbGxiYWNrLCBhY2N1bXVsYXRvciwgdGhpc0FyZykge1xuICAgICAgdmFyIGlzQXJyID0gaXNBcnJheShvYmplY3QpO1xuICAgICAgaWYgKGFjY3VtdWxhdG9yID09IG51bGwpIHtcbiAgICAgICAgaWYgKGlzQXJyKSB7XG4gICAgICAgICAgYWNjdW11bGF0b3IgPSBbXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgY3RvciA9IG9iamVjdCAmJiBvYmplY3QuY29uc3RydWN0b3IsXG4gICAgICAgICAgICAgIHByb3RvID0gY3RvciAmJiBjdG9yLnByb3RvdHlwZTtcblxuICAgICAgICAgIGFjY3VtdWxhdG9yID0gYmFzZUNyZWF0ZShwcm90byk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgNCk7XG4gICAgICAgIChpc0FyciA/IGZvckVhY2ggOiBmb3JPd24pKG9iamVjdCwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBvYmplY3QpIHtcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2soYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgb2JqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYWNjdW11bGF0b3I7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhcnJheSBjb21wb3NlZCBvZiB0aGUgb3duIGVudW1lcmFibGUgcHJvcGVydHkgdmFsdWVzIG9mIGBvYmplY3RgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaW5zcGVjdC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYW4gYXJyYXkgb2YgcHJvcGVydHkgdmFsdWVzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLnZhbHVlcyh7ICdvbmUnOiAxLCAndHdvJzogMiwgJ3RocmVlJzogMyB9KTtcbiAgICAgKiAvLyA9PiBbMSwgMiwgM10gKHByb3BlcnR5IG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkIGFjcm9zcyBlbnZpcm9ubWVudHMpXG4gICAgICovXG4gICAgZnVuY3Rpb24gdmFsdWVzKG9iamVjdCkge1xuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgcHJvcHMgPSBrZXlzKG9iamVjdCksXG4gICAgICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoLFxuICAgICAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSBvYmplY3RbcHJvcHNbaW5kZXhdXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGFycmF5IG9mIGVsZW1lbnRzIGZyb20gdGhlIHNwZWNpZmllZCBpbmRleGVzLCBvciBrZXlzLCBvZiB0aGVcbiAgICAgKiBgY29sbGVjdGlvbmAuIEluZGV4ZXMgbWF5IGJlIHNwZWNpZmllZCBhcyBpbmRpdmlkdWFsIGFyZ3VtZW50cyBvciBhcyBhcnJheXNcbiAgICAgKiBvZiBpbmRleGVzLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25zXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0gey4uLihudW1iZXJ8bnVtYmVyW118c3RyaW5nfHN0cmluZ1tdKX0gW2luZGV4XSBUaGUgaW5kZXhlcyBvZiBgY29sbGVjdGlvbmBcbiAgICAgKiAgIHRvIHJldHJpZXZlLCBzcGVjaWZpZWQgYXMgaW5kaXZpZHVhbCBpbmRleGVzIG9yIGFycmF5cyBvZiBpbmRleGVzLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhIG5ldyBhcnJheSBvZiBlbGVtZW50cyBjb3JyZXNwb25kaW5nIHRvIHRoZVxuICAgICAqICBwcm92aWRlZCBpbmRleGVzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmF0KFsnYScsICdiJywgJ2MnLCAnZCcsICdlJ10sIFswLCAyLCA0XSk7XG4gICAgICogLy8gPT4gWydhJywgJ2MnLCAnZSddXG4gICAgICpcbiAgICAgKiBfLmF0KFsnZnJlZCcsICdiYXJuZXknLCAncGViYmxlcyddLCAwLCAyKTtcbiAgICAgKiAvLyA9PiBbJ2ZyZWQnLCAncGViYmxlcyddXG4gICAgICovXG4gICAgZnVuY3Rpb24gYXQoY29sbGVjdGlvbikge1xuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgICBwcm9wcyA9IGJhc2VGbGF0dGVuKGFyZ3MsIHRydWUsIGZhbHNlLCAxKSxcbiAgICAgICAgICBsZW5ndGggPSAoYXJnc1syXSAmJiBhcmdzWzJdW2FyZ3NbMV1dID09PSBjb2xsZWN0aW9uKSA/IDEgOiBwcm9wcy5sZW5ndGgsXG4gICAgICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgICAgd2hpbGUoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICByZXN1bHRbaW5kZXhdID0gY29sbGVjdGlvbltwcm9wc1tpbmRleF1dO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYSBnaXZlbiB2YWx1ZSBpcyBwcmVzZW50IGluIGEgY29sbGVjdGlvbiB1c2luZyBzdHJpY3QgZXF1YWxpdHlcbiAgICAgKiBmb3IgY29tcGFyaXNvbnMsIGkuZS4gYD09PWAuIElmIGBmcm9tSW5kZXhgIGlzIG5lZ2F0aXZlLCBpdCBpcyB1c2VkIGFzIHRoZVxuICAgICAqIG9mZnNldCBmcm9tIHRoZSBlbmQgb2YgdGhlIGNvbGxlY3Rpb24uXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAYWxpYXMgaW5jbHVkZVxuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHsqfSB0YXJnZXQgVGhlIHZhbHVlIHRvIGNoZWNrIGZvci5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2Zyb21JbmRleD0wXSBUaGUgaW5kZXggdG8gc2VhcmNoIGZyb20uXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdGFyZ2V0YCBlbGVtZW50IGlzIGZvdW5kLCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uY29udGFpbnMoWzEsIDIsIDNdLCAxKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmNvbnRhaW5zKFsxLCAyLCAzXSwgMSwgMik7XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKlxuICAgICAqIF8uY29udGFpbnMoeyAnbmFtZSc6ICdmcmVkJywgJ2FnZSc6IDQwIH0sICdmcmVkJyk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogXy5jb250YWlucygncGViYmxlcycsICdlYicpO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjb250YWlucyhjb2xsZWN0aW9uLCB0YXJnZXQsIGZyb21JbmRleCkge1xuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgaW5kZXhPZiA9IGdldEluZGV4T2YoKSxcbiAgICAgICAgICBsZW5ndGggPSBjb2xsZWN0aW9uID8gY29sbGVjdGlvbi5sZW5ndGggOiAwLFxuICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xuXG4gICAgICBmcm9tSW5kZXggPSAoZnJvbUluZGV4IDwgMCA/IG5hdGl2ZU1heCgwLCBsZW5ndGggKyBmcm9tSW5kZXgpIDogZnJvbUluZGV4KSB8fCAwO1xuICAgICAgaWYgKGlzQXJyYXkoY29sbGVjdGlvbikpIHtcbiAgICAgICAgcmVzdWx0ID0gaW5kZXhPZihjb2xsZWN0aW9uLCB0YXJnZXQsIGZyb21JbmRleCkgPiAtMTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJykge1xuICAgICAgICByZXN1bHQgPSAoaXNTdHJpbmcoY29sbGVjdGlvbikgPyBjb2xsZWN0aW9uLmluZGV4T2YodGFyZ2V0LCBmcm9tSW5kZXgpIDogaW5kZXhPZihjb2xsZWN0aW9uLCB0YXJnZXQsIGZyb21JbmRleCkpID4gLTE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3JPd24oY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICBpZiAoKytpbmRleCA+PSBmcm9tSW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiAhKHJlc3VsdCA9IHZhbHVlID09PSB0YXJnZXQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gb2JqZWN0IGNvbXBvc2VkIG9mIGtleXMgZ2VuZXJhdGVkIGZyb20gdGhlIHJlc3VsdHMgb2YgcnVubmluZ1xuICAgICAqIGVhY2ggZWxlbWVudCBvZiBgY29sbGVjdGlvbmAgdGhyb3VnaCB0aGUgY2FsbGJhY2suIFRoZSBjb3JyZXNwb25kaW5nIHZhbHVlXG4gICAgICogb2YgZWFjaCBrZXkgaXMgdGhlIG51bWJlciBvZiB0aW1lcyB0aGUga2V5IHdhcyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2suXG4gICAgICogVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50cztcbiAgICAgKiAodmFsdWUsIGluZGV4fGtleSwgY29sbGVjdGlvbikuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8c3RyaW5nfSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGl0ZXJhdGlvbi4gSWYgYSBwcm9wZXJ0eSBuYW1lIG9yIG9iamVjdCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWRcbiAgICAgKiAgdG8gY3JlYXRlIGEgXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2ssIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjb21wb3NlZCBhZ2dyZWdhdGUgb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmNvdW50QnkoWzQuMywgNi4xLCA2LjRdLCBmdW5jdGlvbihudW0pIHsgcmV0dXJuIE1hdGguZmxvb3IobnVtKTsgfSk7XG4gICAgICogLy8gPT4geyAnNCc6IDEsICc2JzogMiB9XG4gICAgICpcbiAgICAgKiBfLmNvdW50QnkoWzQuMywgNi4xLCA2LjRdLCBmdW5jdGlvbihudW0pIHsgcmV0dXJuIHRoaXMuZmxvb3IobnVtKTsgfSwgTWF0aCk7XG4gICAgICogLy8gPT4geyAnNCc6IDEsICc2JzogMiB9XG4gICAgICpcbiAgICAgKiBfLmNvdW50QnkoWydvbmUnLCAndHdvJywgJ3RocmVlJ10sICdsZW5ndGgnKTtcbiAgICAgKiAvLyA9PiB7ICczJzogMiwgJzUnOiAxIH1cbiAgICAgKi9cbiAgICB2YXIgY291bnRCeSA9IGNyZWF0ZUFnZ3JlZ2F0b3IoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwga2V5KSB7XG4gICAgICAoaGFzT3duUHJvcGVydHkuY2FsbChyZXN1bHQsIGtleSkgPyByZXN1bHRba2V5XSsrIDogcmVzdWx0W2tleV0gPSAxKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gY2FsbGJhY2sgcmV0dXJucyB0cnVleSB2YWx1ZSBmb3IgKiphbGwqKiBlbGVtZW50cyBvZlxuICAgICAqIGEgY29sbGVjdGlvbi4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIHRocmVlXG4gICAgICogYXJndW1lbnRzOyAodmFsdWUsIGluZGV4fGtleSwgY29sbGVjdGlvbikuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBhbGlhcyBhbGxcbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkXG4gICAgICogIHBlciBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkXG4gICAgICogIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFsbCBlbGVtZW50cyBwYXNzZWQgdGhlIGNhbGxiYWNrIGNoZWNrLFxuICAgICAqICBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uZXZlcnkoW3RydWUsIDEsIG51bGwsICd5ZXMnXSk7XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKlxuICAgICAqIHZhciBjaGFyYWN0ZXJzID0gW1xuICAgICAqICAgeyAnbmFtZSc6ICdiYXJuZXknLCAnYWdlJzogMzYgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgJ2FnZSc6IDQwIH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLnBsdWNrXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5ldmVyeShjaGFyYWN0ZXJzLCAnYWdlJyk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLndoZXJlXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5ldmVyeShjaGFyYWN0ZXJzLCB7ICdhZ2UnOiAzNiB9KTtcbiAgICAgKiAvLyA9PiBmYWxzZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGV2ZXJ5KGNvbGxlY3Rpb24sIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcblxuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgbGVuZ3RoID0gY29sbGVjdGlvbiA/IGNvbGxlY3Rpb24ubGVuZ3RoIDogMDtcblxuICAgICAgaWYgKHR5cGVvZiBsZW5ndGggPT0gJ251bWJlcicpIHtcbiAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICBpZiAoIShyZXN1bHQgPSAhIWNhbGxiYWNrKGNvbGxlY3Rpb25baW5kZXhdLCBpbmRleCwgY29sbGVjdGlvbikpKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvck93bihjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICByZXR1cm4gKHJlc3VsdCA9ICEhY2FsbGJhY2sodmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJdGVyYXRlcyBvdmVyIGVsZW1lbnRzIG9mIGEgY29sbGVjdGlvbiwgcmV0dXJuaW5nIGFuIGFycmF5IG9mIGFsbCBlbGVtZW50c1xuICAgICAqIHRoZSBjYWxsYmFjayByZXR1cm5zIHRydWV5IGZvci4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmRcbiAgICAgKiBpbnZva2VkIHdpdGggdGhyZWUgYXJndW1lbnRzOyAodmFsdWUsIGluZGV4fGtleSwgY29sbGVjdGlvbikuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBhbGlhcyBzZWxlY3RcbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkXG4gICAgICogIHBlciBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkXG4gICAgICogIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGEgbmV3IGFycmF5IG9mIGVsZW1lbnRzIHRoYXQgcGFzc2VkIHRoZSBjYWxsYmFjayBjaGVjay5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGV2ZW5zID0gXy5maWx0ZXIoWzEsIDIsIDMsIDQsIDUsIDZdLCBmdW5jdGlvbihudW0pIHsgcmV0dXJuIG51bSAlIDIgPT0gMDsgfSk7XG4gICAgICogLy8gPT4gWzIsIDQsIDZdXG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2LCAnYmxvY2tlZCc6IGZhbHNlIH0sXG4gICAgICogICB7ICduYW1lJzogJ2ZyZWQnLCAgICdhZ2UnOiA0MCwgJ2Jsb2NrZWQnOiB0cnVlIH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLnBsdWNrXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5maWx0ZXIoY2hhcmFjdGVycywgJ2Jsb2NrZWQnKTtcbiAgICAgKiAvLyA9PiBbeyAnbmFtZSc6ICdmcmVkJywgJ2FnZSc6IDQwLCAnYmxvY2tlZCc6IHRydWUgfV1cbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy53aGVyZVwiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8uZmlsdGVyKGNoYXJhY3RlcnMsIHsgJ2FnZSc6IDM2IH0pO1xuICAgICAqIC8vID0+IFt7ICduYW1lJzogJ2Jhcm5leScsICdhZ2UnOiAzNiwgJ2Jsb2NrZWQnOiBmYWxzZSB9XVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZpbHRlcihjb2xsZWN0aW9uLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgY2FsbGJhY2sgPSBsb2Rhc2guY3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDMpO1xuXG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBsZW5ndGggPSBjb2xsZWN0aW9uID8gY29sbGVjdGlvbi5sZW5ndGggOiAwO1xuXG4gICAgICBpZiAodHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJykge1xuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgIHZhciB2YWx1ZSA9IGNvbGxlY3Rpb25baW5kZXhdO1xuICAgICAgICAgIGlmIChjYWxsYmFjayh2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3JPd24oY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgaWYgKGNhbGxiYWNrKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJdGVyYXRlcyBvdmVyIGVsZW1lbnRzIG9mIGEgY29sbGVjdGlvbiwgcmV0dXJuaW5nIHRoZSBmaXJzdCBlbGVtZW50IHRoYXRcbiAgICAgKiB0aGUgY2FsbGJhY2sgcmV0dXJucyB0cnVleSBmb3IuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kXG4gICAgICogaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50czsgKHZhbHVlLCBpbmRleHxrZXksIGNvbGxlY3Rpb24pLlxuICAgICAqXG4gICAgICogSWYgYSBwcm9wZXJ0eSBuYW1lIGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy5wbHVja1wiIHN0eWxlXG4gICAgICogY2FsbGJhY2sgd2lsbCByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrXG4gICAgICogd2lsbCByZXR1cm4gYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuIG9iamVjdCxcbiAgICAgKiBlbHNlIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAYWxpYXMgZGV0ZWN0LCBmaW5kV2hlcmVcbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkXG4gICAgICogIHBlciBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkXG4gICAgICogIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGZvdW5kIGVsZW1lbnQsIGVsc2UgYHVuZGVmaW5lZGAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBjaGFyYWN0ZXJzID0gW1xuICAgICAqICAgeyAnbmFtZSc6ICdiYXJuZXknLCAgJ2FnZSc6IDM2LCAnYmxvY2tlZCc6IGZhbHNlIH0sXG4gICAgICogICB7ICduYW1lJzogJ2ZyZWQnLCAgICAnYWdlJzogNDAsICdibG9ja2VkJzogdHJ1ZSB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdwZWJibGVzJywgJ2FnZSc6IDEsICAnYmxvY2tlZCc6IGZhbHNlIH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogXy5maW5kKGNoYXJhY3RlcnMsIGZ1bmN0aW9uKGNocikge1xuICAgICAqICAgcmV0dXJuIGNoci5hZ2UgPCA0MDtcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiB7ICduYW1lJzogJ2Jhcm5leScsICdhZ2UnOiAzNiwgJ2Jsb2NrZWQnOiBmYWxzZSB9XG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ud2hlcmVcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLmZpbmQoY2hhcmFjdGVycywgeyAnYWdlJzogMSB9KTtcbiAgICAgKiAvLyA9PiAgeyAnbmFtZSc6ICdwZWJibGVzJywgJ2FnZSc6IDEsICdibG9ja2VkJzogZmFsc2UgfVxuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLnBsdWNrXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5maW5kKGNoYXJhY3RlcnMsICdibG9ja2VkJyk7XG4gICAgICogLy8gPT4geyAnbmFtZSc6ICdmcmVkJywgJ2FnZSc6IDQwLCAnYmxvY2tlZCc6IHRydWUgfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZpbmQoY29sbGVjdGlvbiwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcblxuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgbGVuZ3RoID0gY29sbGVjdGlvbiA/IGNvbGxlY3Rpb24ubGVuZ3RoIDogMDtcblxuICAgICAgaWYgKHR5cGVvZiBsZW5ndGggPT0gJ251bWJlcicpIHtcbiAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICB2YXIgdmFsdWUgPSBjb2xsZWN0aW9uW2luZGV4XTtcbiAgICAgICAgICBpZiAoY2FsbGJhY2sodmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgZm9yT3duKGNvbGxlY3Rpb24sIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICAgIGlmIChjYWxsYmFjayh2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8uZmluZGAgZXhjZXB0IHRoYXQgaXQgaXRlcmF0ZXMgb3ZlciBlbGVtZW50c1xuICAgICAqIG9mIGEgYGNvbGxlY3Rpb25gIGZyb20gcmlnaHQgdG8gbGVmdC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8c3RyaW5nfSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGl0ZXJhdGlvbi4gSWYgYSBwcm9wZXJ0eSBuYW1lIG9yIG9iamVjdCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWRcbiAgICAgKiAgdG8gY3JlYXRlIGEgXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2ssIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZm91bmQgZWxlbWVudCwgZWxzZSBgdW5kZWZpbmVkYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5maW5kTGFzdChbMSwgMiwgMywgNF0sIGZ1bmN0aW9uKG51bSkge1xuICAgICAqICAgcmV0dXJuIG51bSAlIDIgPT0gMTtcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiAzXG4gICAgICovXG4gICAgZnVuY3Rpb24gZmluZExhc3QoY29sbGVjdGlvbiwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHZhciByZXN1bHQ7XG4gICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICBmb3JFYWNoUmlnaHQoY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgIGlmIChjYWxsYmFjayh2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pKSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSXRlcmF0ZXMgb3ZlciBlbGVtZW50cyBvZiBhIGNvbGxlY3Rpb24sIGV4ZWN1dGluZyB0aGUgY2FsbGJhY2sgZm9yIGVhY2hcbiAgICAgKiBlbGVtZW50LiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZCBpbnZva2VkIHdpdGggdGhyZWUgYXJndW1lbnRzO1xuICAgICAqICh2YWx1ZSwgaW5kZXh8a2V5LCBjb2xsZWN0aW9uKS4gQ2FsbGJhY2tzIG1heSBleGl0IGl0ZXJhdGlvbiBlYXJseSBieVxuICAgICAqIGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBOb3RlOiBBcyB3aXRoIG90aGVyIFwiQ29sbGVjdGlvbnNcIiBtZXRob2RzLCBvYmplY3RzIHdpdGggYSBgbGVuZ3RoYCBwcm9wZXJ0eVxuICAgICAqIGFyZSBpdGVyYXRlZCBsaWtlIGFycmF5cy4gVG8gYXZvaWQgdGhpcyBiZWhhdmlvciBgXy5mb3JJbmAgb3IgYF8uZm9yT3duYFxuICAgICAqIG1heSBiZSB1c2VkIGZvciBvYmplY3QgaXRlcmF0aW9uLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGFsaWFzIGVhY2hcbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtBcnJheXxPYmplY3R8c3RyaW5nfSBSZXR1cm5zIGBjb2xsZWN0aW9uYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXyhbMSwgMiwgM10pLmZvckVhY2goZnVuY3Rpb24obnVtKSB7IGNvbnNvbGUubG9nKG51bSk7IH0pLmpvaW4oJywnKTtcbiAgICAgKiAvLyA9PiBsb2dzIGVhY2ggbnVtYmVyIGFuZCByZXR1cm5zICcxLDIsMydcbiAgICAgKlxuICAgICAqIF8uZm9yRWFjaCh7ICdvbmUnOiAxLCAndHdvJzogMiwgJ3RocmVlJzogMyB9LCBmdW5jdGlvbihudW0pIHsgY29uc29sZS5sb2cobnVtKTsgfSk7XG4gICAgICogLy8gPT4gbG9ncyBlYWNoIG51bWJlciBhbmQgcmV0dXJucyB0aGUgb2JqZWN0IChwcm9wZXJ0eSBvcmRlciBpcyBub3QgZ3VhcmFudGVlZCBhY3Jvc3MgZW52aXJvbm1lbnRzKVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZvckVhY2goY29sbGVjdGlvbiwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgIGxlbmd0aCA9IGNvbGxlY3Rpb24gPyBjb2xsZWN0aW9uLmxlbmd0aCA6IDA7XG5cbiAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgJiYgdHlwZW9mIHRoaXNBcmcgPT0gJ3VuZGVmaW5lZCcgPyBjYWxsYmFjayA6IGJhc2VDcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICBpZiAodHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJykge1xuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgIGlmIChjYWxsYmFjayhjb2xsZWN0aW9uW2luZGV4XSwgaW5kZXgsIGNvbGxlY3Rpb24pID09PSBmYWxzZSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3JPd24oY29sbGVjdGlvbiwgY2FsbGJhY2spO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbGxlY3Rpb247XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgbGlrZSBgXy5mb3JFYWNoYCBleGNlcHQgdGhhdCBpdCBpdGVyYXRlcyBvdmVyIGVsZW1lbnRzXG4gICAgICogb2YgYSBgY29sbGVjdGlvbmAgZnJvbSByaWdodCB0byBsZWZ0LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGFsaWFzIGVhY2hSaWdodFxuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge0FycmF5fE9iamVjdHxzdHJpbmd9IFJldHVybnMgYGNvbGxlY3Rpb25gLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfKFsxLCAyLCAzXSkuZm9yRWFjaFJpZ2h0KGZ1bmN0aW9uKG51bSkgeyBjb25zb2xlLmxvZyhudW0pOyB9KS5qb2luKCcsJyk7XG4gICAgICogLy8gPT4gbG9ncyBlYWNoIG51bWJlciBmcm9tIHJpZ2h0IHRvIGxlZnQgYW5kIHJldHVybnMgJzMsMiwxJ1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZvckVhY2hSaWdodChjb2xsZWN0aW9uLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIGxlbmd0aCA9IGNvbGxlY3Rpb24gPyBjb2xsZWN0aW9uLmxlbmd0aCA6IDA7XG4gICAgICBjYWxsYmFjayA9IGNhbGxiYWNrICYmIHR5cGVvZiB0aGlzQXJnID09ICd1bmRlZmluZWQnID8gY2FsbGJhY2sgOiBiYXNlQ3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDMpO1xuICAgICAgaWYgKHR5cGVvZiBsZW5ndGggPT0gJ251bWJlcicpIHtcbiAgICAgICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgICAgaWYgKGNhbGxiYWNrKGNvbGxlY3Rpb25bbGVuZ3RoXSwgbGVuZ3RoLCBjb2xsZWN0aW9uKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHByb3BzID0ga2V5cyhjb2xsZWN0aW9uKTtcbiAgICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuICAgICAgICBmb3JPd24oY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsdWUsIGtleSwgY29sbGVjdGlvbikge1xuICAgICAgICAgIGtleSA9IHByb3BzID8gcHJvcHNbLS1sZW5ndGhdIDogLS1sZW5ndGg7XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGNvbGxlY3Rpb25ba2V5XSwga2V5LCBjb2xsZWN0aW9uKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIG9iamVjdCBjb21wb3NlZCBvZiBrZXlzIGdlbmVyYXRlZCBmcm9tIHRoZSByZXN1bHRzIG9mIHJ1bm5pbmdcbiAgICAgKiBlYWNoIGVsZW1lbnQgb2YgYSBjb2xsZWN0aW9uIHRocm91Z2ggdGhlIGNhbGxiYWNrLiBUaGUgY29ycmVzcG9uZGluZyB2YWx1ZVxuICAgICAqIG9mIGVhY2gga2V5IGlzIGFuIGFycmF5IG9mIHRoZSBlbGVtZW50cyByZXNwb25zaWJsZSBmb3IgZ2VuZXJhdGluZyB0aGUga2V5LlxuICAgICAqIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aCB0aHJlZSBhcmd1bWVudHM7XG4gICAgICogKHZhbHVlLCBpbmRleHxrZXksIGNvbGxlY3Rpb24pLlxuICAgICAqXG4gICAgICogSWYgYSBwcm9wZXJ0eSBuYW1lIGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy5wbHVja1wiIHN0eWxlXG4gICAgICogY2FsbGJhY2sgd2lsbCByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrXG4gICAgICogd2lsbCByZXR1cm4gYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuIG9iamVjdCxcbiAgICAgKiBlbHNlIGBmYWxzZWBcbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8c3RyaW5nfSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGl0ZXJhdGlvbi4gSWYgYSBwcm9wZXJ0eSBuYW1lIG9yIG9iamVjdCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWRcbiAgICAgKiAgdG8gY3JlYXRlIGEgXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2ssIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjb21wb3NlZCBhZ2dyZWdhdGUgb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmdyb3VwQnkoWzQuMiwgNi4xLCA2LjRdLCBmdW5jdGlvbihudW0pIHsgcmV0dXJuIE1hdGguZmxvb3IobnVtKTsgfSk7XG4gICAgICogLy8gPT4geyAnNCc6IFs0LjJdLCAnNic6IFs2LjEsIDYuNF0gfVxuICAgICAqXG4gICAgICogXy5ncm91cEJ5KFs0LjIsIDYuMSwgNi40XSwgZnVuY3Rpb24obnVtKSB7IHJldHVybiB0aGlzLmZsb29yKG51bSk7IH0sIE1hdGgpO1xuICAgICAqIC8vID0+IHsgJzQnOiBbNC4yXSwgJzYnOiBbNi4xLCA2LjRdIH1cbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy5wbHVja1wiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8uZ3JvdXBCeShbJ29uZScsICd0d28nLCAndGhyZWUnXSwgJ2xlbmd0aCcpO1xuICAgICAqIC8vID0+IHsgJzMnOiBbJ29uZScsICd0d28nXSwgJzUnOiBbJ3RocmVlJ10gfVxuICAgICAqL1xuICAgIHZhciBncm91cEJ5ID0gY3JlYXRlQWdncmVnYXRvcihmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBrZXkpIHtcbiAgICAgIChoYXNPd25Qcm9wZXJ0eS5jYWxsKHJlc3VsdCwga2V5KSA/IHJlc3VsdFtrZXldIDogcmVzdWx0W2tleV0gPSBbXSkucHVzaCh2YWx1ZSk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIG9iamVjdCBjb21wb3NlZCBvZiBrZXlzIGdlbmVyYXRlZCBmcm9tIHRoZSByZXN1bHRzIG9mIHJ1bm5pbmdcbiAgICAgKiBlYWNoIGVsZW1lbnQgb2YgdGhlIGNvbGxlY3Rpb24gdGhyb3VnaCB0aGUgZ2l2ZW4gY2FsbGJhY2suIFRoZSBjb3JyZXNwb25kaW5nXG4gICAgICogdmFsdWUgb2YgZWFjaCBrZXkgaXMgdGhlIGxhc3QgZWxlbWVudCByZXNwb25zaWJsZSBmb3IgZ2VuZXJhdGluZyB0aGUga2V5LlxuICAgICAqIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aCB0aHJlZSBhcmd1bWVudHM7XG4gICAgICogKHZhbHVlLCBpbmRleHxrZXksIGNvbGxlY3Rpb24pLlxuICAgICAqXG4gICAgICogSWYgYSBwcm9wZXJ0eSBuYW1lIGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy5wbHVja1wiIHN0eWxlXG4gICAgICogY2FsbGJhY2sgd2lsbCByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrXG4gICAgICogd2lsbCByZXR1cm4gYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuIG9iamVjdCxcbiAgICAgKiBlbHNlIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkXG4gICAgICogIHBlciBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkXG4gICAgICogIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY29tcG9zZWQgYWdncmVnYXRlIG9iamVjdC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGtleXMgPSBbXG4gICAgICogICB7ICdkaXInOiAnbGVmdCcsICdjb2RlJzogOTcgfSxcbiAgICAgKiAgIHsgJ2Rpcic6ICdyaWdodCcsICdjb2RlJzogMTAwIH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogXy5pbmRleEJ5KGtleXMsICdkaXInKTtcbiAgICAgKiAvLyA9PiB7ICdsZWZ0JzogeyAnZGlyJzogJ2xlZnQnLCAnY29kZSc6IDk3IH0sICdyaWdodCc6IHsgJ2Rpcic6ICdyaWdodCcsICdjb2RlJzogMTAwIH0gfVxuICAgICAqXG4gICAgICogXy5pbmRleEJ5KGtleXMsIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShrZXkuY29kZSk7IH0pO1xuICAgICAqIC8vID0+IHsgJ2EnOiB7ICdkaXInOiAnbGVmdCcsICdjb2RlJzogOTcgfSwgJ2QnOiB7ICdkaXInOiAncmlnaHQnLCAnY29kZSc6IDEwMCB9IH1cbiAgICAgKlxuICAgICAqIF8uaW5kZXhCeShjaGFyYWN0ZXJzLCBmdW5jdGlvbihrZXkpIHsgdGhpcy5mcm9tQ2hhckNvZGUoa2V5LmNvZGUpOyB9LCBTdHJpbmcpO1xuICAgICAqIC8vID0+IHsgJ2EnOiB7ICdkaXInOiAnbGVmdCcsICdjb2RlJzogOTcgfSwgJ2QnOiB7ICdkaXInOiAncmlnaHQnLCAnY29kZSc6IDEwMCB9IH1cbiAgICAgKi9cbiAgICB2YXIgaW5kZXhCeSA9IGNyZWF0ZUFnZ3JlZ2F0b3IoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwga2V5KSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbHVlO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogSW52b2tlcyB0aGUgbWV0aG9kIG5hbWVkIGJ5IGBtZXRob2ROYW1lYCBvbiBlYWNoIGVsZW1lbnQgaW4gdGhlIGBjb2xsZWN0aW9uYFxuICAgICAqIHJldHVybmluZyBhbiBhcnJheSBvZiB0aGUgcmVzdWx0cyBvZiBlYWNoIGludm9rZWQgbWV0aG9kLiBBZGRpdGlvbmFsIGFyZ3VtZW50c1xuICAgICAqIHdpbGwgYmUgcHJvdmlkZWQgdG8gZWFjaCBpbnZva2VkIG1ldGhvZC4gSWYgYG1ldGhvZE5hbWVgIGlzIGEgZnVuY3Rpb24gaXRcbiAgICAgKiB3aWxsIGJlIGludm9rZWQgZm9yLCBhbmQgYHRoaXNgIGJvdW5kIHRvLCBlYWNoIGVsZW1lbnQgaW4gdGhlIGBjb2xsZWN0aW9uYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxzdHJpbmd9IG1ldGhvZE5hbWUgVGhlIG5hbWUgb2YgdGhlIG1ldGhvZCB0byBpbnZva2Ugb3JcbiAgICAgKiAgdGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICAgKiBAcGFyYW0gey4uLip9IFthcmddIEFyZ3VtZW50cyB0byBpbnZva2UgdGhlIG1ldGhvZCB3aXRoLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhIG5ldyBhcnJheSBvZiB0aGUgcmVzdWx0cyBvZiBlYWNoIGludm9rZWQgbWV0aG9kLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmludm9rZShbWzUsIDEsIDddLCBbMywgMiwgMV1dLCAnc29ydCcpO1xuICAgICAqIC8vID0+IFtbMSwgNSwgN10sIFsxLCAyLCAzXV1cbiAgICAgKlxuICAgICAqIF8uaW52b2tlKFsxMjMsIDQ1Nl0sIFN0cmluZy5wcm90b3R5cGUuc3BsaXQsICcnKTtcbiAgICAgKiAvLyA9PiBbWycxJywgJzInLCAnMyddLCBbJzQnLCAnNScsICc2J11dXG4gICAgICovXG4gICAgZnVuY3Rpb24gaW52b2tlKGNvbGxlY3Rpb24sIG1ldGhvZE5hbWUpIHtcbiAgICAgIHZhciBhcmdzID0gc2xpY2UoYXJndW1lbnRzLCAyKSxcbiAgICAgICAgICBpbmRleCA9IC0xLFxuICAgICAgICAgIGlzRnVuYyA9IHR5cGVvZiBtZXRob2ROYW1lID09ICdmdW5jdGlvbicsXG4gICAgICAgICAgbGVuZ3RoID0gY29sbGVjdGlvbiA/IGNvbGxlY3Rpb24ubGVuZ3RoIDogMCxcbiAgICAgICAgICByZXN1bHQgPSBBcnJheSh0eXBlb2YgbGVuZ3RoID09ICdudW1iZXInID8gbGVuZ3RoIDogMCk7XG5cbiAgICAgIGZvckVhY2goY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgcmVzdWx0WysraW5kZXhdID0gKGlzRnVuYyA/IG1ldGhvZE5hbWUgOiB2YWx1ZVttZXRob2ROYW1lXSkuYXBwbHkodmFsdWUsIGFyZ3MpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdmFsdWVzIGJ5IHJ1bm5pbmcgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uXG4gICAgICogdGhyb3VnaCB0aGUgY2FsbGJhY2suIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aFxuICAgICAqIHRocmVlIGFyZ3VtZW50czsgKHZhbHVlLCBpbmRleHxrZXksIGNvbGxlY3Rpb24pLlxuICAgICAqXG4gICAgICogSWYgYSBwcm9wZXJ0eSBuYW1lIGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy5wbHVja1wiIHN0eWxlXG4gICAgICogY2FsbGJhY2sgd2lsbCByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrXG4gICAgICogd2lsbCByZXR1cm4gYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuIG9iamVjdCxcbiAgICAgKiBlbHNlIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAYWxpYXMgY29sbGVjdFxuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8c3RyaW5nfSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGl0ZXJhdGlvbi4gSWYgYSBwcm9wZXJ0eSBuYW1lIG9yIG9iamVjdCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWRcbiAgICAgKiAgdG8gY3JlYXRlIGEgXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2ssIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYSBuZXcgYXJyYXkgb2YgdGhlIHJlc3VsdHMgb2YgZWFjaCBgY2FsbGJhY2tgIGV4ZWN1dGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5tYXAoWzEsIDIsIDNdLCBmdW5jdGlvbihudW0pIHsgcmV0dXJuIG51bSAqIDM7IH0pO1xuICAgICAqIC8vID0+IFszLCA2LCA5XVxuICAgICAqXG4gICAgICogXy5tYXAoeyAnb25lJzogMSwgJ3R3byc6IDIsICd0aHJlZSc6IDMgfSwgZnVuY3Rpb24obnVtKSB7IHJldHVybiBudW0gKiAzOyB9KTtcbiAgICAgKiAvLyA9PiBbMywgNiwgOV0gKHByb3BlcnR5IG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkIGFjcm9zcyBlbnZpcm9ubWVudHMpXG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2IH0sXG4gICAgICogICB7ICduYW1lJzogJ2ZyZWQnLCAgICdhZ2UnOiA0MCB9XG4gICAgICogXTtcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy5wbHVja1wiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8ubWFwKGNoYXJhY3RlcnMsICduYW1lJyk7XG4gICAgICogLy8gPT4gWydiYXJuZXknLCAnZnJlZCddXG4gICAgICovXG4gICAgZnVuY3Rpb24gbWFwKGNvbGxlY3Rpb24sIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBsZW5ndGggPSBjb2xsZWN0aW9uID8gY29sbGVjdGlvbi5sZW5ndGggOiAwO1xuXG4gICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICBpZiAodHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJykge1xuICAgICAgICB2YXIgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcbiAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICByZXN1bHRbaW5kZXhdID0gY2FsbGJhY2soY29sbGVjdGlvbltpbmRleF0sIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gW107XG4gICAgICAgIGZvck93bihjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWx1ZSwga2V5LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgcmVzdWx0WysraW5kZXhdID0gY2FsbGJhY2sodmFsdWUsIGtleSwgY29sbGVjdGlvbik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZXMgdGhlIG1heGltdW0gdmFsdWUgb2YgYSBjb2xsZWN0aW9uLiBJZiB0aGUgY29sbGVjdGlvbiBpcyBlbXB0eSBvclxuICAgICAqIGZhbHNleSBgLUluZmluaXR5YCBpcyByZXR1cm5lZC4gSWYgYSBjYWxsYmFjayBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIGV4ZWN1dGVkXG4gICAgICogZm9yIGVhY2ggdmFsdWUgaW4gdGhlIGNvbGxlY3Rpb24gdG8gZ2VuZXJhdGUgdGhlIGNyaXRlcmlvbiBieSB3aGljaCB0aGUgdmFsdWVcbiAgICAgKiBpcyByYW5rZWQuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aCB0aHJlZVxuICAgICAqIGFyZ3VtZW50czsgKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8c3RyaW5nfSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGl0ZXJhdGlvbi4gSWYgYSBwcm9wZXJ0eSBuYW1lIG9yIG9iamVjdCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWRcbiAgICAgKiAgdG8gY3JlYXRlIGEgXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2ssIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgbWF4aW11bSB2YWx1ZS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5tYXgoWzQsIDIsIDgsIDZdKTtcbiAgICAgKiAvLyA9PiA4XG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2IH0sXG4gICAgICogICB7ICduYW1lJzogJ2ZyZWQnLCAgICdhZ2UnOiA0MCB9XG4gICAgICogXTtcbiAgICAgKlxuICAgICAqIF8ubWF4KGNoYXJhY3RlcnMsIGZ1bmN0aW9uKGNocikgeyByZXR1cm4gY2hyLmFnZTsgfSk7XG4gICAgICogLy8gPT4geyAnbmFtZSc6ICdmcmVkJywgJ2FnZSc6IDQwIH07XG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ucGx1Y2tcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLm1heChjaGFyYWN0ZXJzLCAnYWdlJyk7XG4gICAgICogLy8gPT4geyAnbmFtZSc6ICdmcmVkJywgJ2FnZSc6IDQwIH07XG4gICAgICovXG4gICAgZnVuY3Rpb24gbWF4KGNvbGxlY3Rpb24sIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgY29tcHV0ZWQgPSAtSW5maW5pdHksXG4gICAgICAgICAgcmVzdWx0ID0gY29tcHV0ZWQ7XG5cbiAgICAgIC8vIGFsbG93cyB3b3JraW5nIHdpdGggZnVuY3Rpb25zIGxpa2UgYF8ubWFwYCB3aXRob3V0IHVzaW5nXG4gICAgICAvLyB0aGVpciBgaW5kZXhgIGFyZ3VtZW50IGFzIGEgY2FsbGJhY2tcbiAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT0gJ2Z1bmN0aW9uJyAmJiB0aGlzQXJnICYmIHRoaXNBcmdbY2FsbGJhY2tdID09PSBjb2xsZWN0aW9uKSB7XG4gICAgICAgIGNhbGxiYWNrID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmIChjYWxsYmFjayA9PSBudWxsICYmIGlzQXJyYXkoY29sbGVjdGlvbikpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgICBsZW5ndGggPSBjb2xsZWN0aW9uLmxlbmd0aDtcblxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgIHZhciB2YWx1ZSA9IGNvbGxlY3Rpb25baW5kZXhdO1xuICAgICAgICAgIGlmICh2YWx1ZSA+IHJlc3VsdCkge1xuICAgICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYWxsYmFjayA9IChjYWxsYmFjayA9PSBudWxsICYmIGlzU3RyaW5nKGNvbGxlY3Rpb24pKVxuICAgICAgICAgID8gY2hhckF0Q2FsbGJhY2tcbiAgICAgICAgICA6IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG5cbiAgICAgICAgZm9yRWFjaChjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICB2YXIgY3VycmVudCA9IGNhbGxiYWNrKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICAgICAgaWYgKGN1cnJlbnQgPiBjb21wdXRlZCkge1xuICAgICAgICAgICAgY29tcHV0ZWQgPSBjdXJyZW50O1xuICAgICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0cmlldmVzIHRoZSBtaW5pbXVtIHZhbHVlIG9mIGEgY29sbGVjdGlvbi4gSWYgdGhlIGNvbGxlY3Rpb24gaXMgZW1wdHkgb3JcbiAgICAgKiBmYWxzZXkgYEluZmluaXR5YCBpcyByZXR1cm5lZC4gSWYgYSBjYWxsYmFjayBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIGV4ZWN1dGVkXG4gICAgICogZm9yIGVhY2ggdmFsdWUgaW4gdGhlIGNvbGxlY3Rpb24gdG8gZ2VuZXJhdGUgdGhlIGNyaXRlcmlvbiBieSB3aGljaCB0aGUgdmFsdWVcbiAgICAgKiBpcyByYW5rZWQuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aCB0aHJlZVxuICAgICAqIGFyZ3VtZW50czsgKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8c3RyaW5nfSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGl0ZXJhdGlvbi4gSWYgYSBwcm9wZXJ0eSBuYW1lIG9yIG9iamVjdCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWRcbiAgICAgKiAgdG8gY3JlYXRlIGEgXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2ssIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgbWluaW11bSB2YWx1ZS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5taW4oWzQsIDIsIDgsIDZdKTtcbiAgICAgKiAvLyA9PiAyXG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2IH0sXG4gICAgICogICB7ICduYW1lJzogJ2ZyZWQnLCAgICdhZ2UnOiA0MCB9XG4gICAgICogXTtcbiAgICAgKlxuICAgICAqIF8ubWluKGNoYXJhY3RlcnMsIGZ1bmN0aW9uKGNocikgeyByZXR1cm4gY2hyLmFnZTsgfSk7XG4gICAgICogLy8gPT4geyAnbmFtZSc6ICdiYXJuZXknLCAnYWdlJzogMzYgfTtcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy5wbHVja1wiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8ubWluKGNoYXJhY3RlcnMsICdhZ2UnKTtcbiAgICAgKiAvLyA9PiB7ICduYW1lJzogJ2Jhcm5leScsICdhZ2UnOiAzNiB9O1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIG1pbihjb2xsZWN0aW9uLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIGNvbXB1dGVkID0gSW5maW5pdHksXG4gICAgICAgICAgcmVzdWx0ID0gY29tcHV0ZWQ7XG5cbiAgICAgIC8vIGFsbG93cyB3b3JraW5nIHdpdGggZnVuY3Rpb25zIGxpa2UgYF8ubWFwYCB3aXRob3V0IHVzaW5nXG4gICAgICAvLyB0aGVpciBgaW5kZXhgIGFyZ3VtZW50IGFzIGEgY2FsbGJhY2tcbiAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT0gJ2Z1bmN0aW9uJyAmJiB0aGlzQXJnICYmIHRoaXNBcmdbY2FsbGJhY2tdID09PSBjb2xsZWN0aW9uKSB7XG4gICAgICAgIGNhbGxiYWNrID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmIChjYWxsYmFjayA9PSBudWxsICYmIGlzQXJyYXkoY29sbGVjdGlvbikpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgICBsZW5ndGggPSBjb2xsZWN0aW9uLmxlbmd0aDtcblxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgIHZhciB2YWx1ZSA9IGNvbGxlY3Rpb25baW5kZXhdO1xuICAgICAgICAgIGlmICh2YWx1ZSA8IHJlc3VsdCkge1xuICAgICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYWxsYmFjayA9IChjYWxsYmFjayA9PSBudWxsICYmIGlzU3RyaW5nKGNvbGxlY3Rpb24pKVxuICAgICAgICAgID8gY2hhckF0Q2FsbGJhY2tcbiAgICAgICAgICA6IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG5cbiAgICAgICAgZm9yRWFjaChjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICB2YXIgY3VycmVudCA9IGNhbGxiYWNrKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICAgICAgaWYgKGN1cnJlbnQgPCBjb21wdXRlZCkge1xuICAgICAgICAgICAgY29tcHV0ZWQgPSBjdXJyZW50O1xuICAgICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0cmlldmVzIHRoZSB2YWx1ZSBvZiBhIHNwZWNpZmllZCBwcm9wZXJ0eSBmcm9tIGFsbCBlbGVtZW50cyBpbiB0aGUgY29sbGVjdGlvbi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEB0eXBlIEZ1bmN0aW9uXG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25zXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHkgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIHBsdWNrLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhIG5ldyBhcnJheSBvZiBwcm9wZXJ0eSB2YWx1ZXMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBjaGFyYWN0ZXJzID0gW1xuICAgICAqICAgeyAnbmFtZSc6ICdiYXJuZXknLCAnYWdlJzogMzYgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgJ2FnZSc6IDQwIH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogXy5wbHVjayhjaGFyYWN0ZXJzLCAnbmFtZScpO1xuICAgICAqIC8vID0+IFsnYmFybmV5JywgJ2ZyZWQnXVxuICAgICAqL1xuICAgIHZhciBwbHVjayA9IG1hcDtcblxuICAgIC8qKlxuICAgICAqIFJlZHVjZXMgYSBjb2xsZWN0aW9uIHRvIGEgdmFsdWUgd2hpY2ggaXMgdGhlIGFjY3VtdWxhdGVkIHJlc3VsdCBvZiBydW5uaW5nXG4gICAgICogZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uIHRocm91Z2ggdGhlIGNhbGxiYWNrLCB3aGVyZSBlYWNoIHN1Y2Nlc3NpdmVcbiAgICAgKiBjYWxsYmFjayBleGVjdXRpb24gY29uc3VtZXMgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgcHJldmlvdXMgZXhlY3V0aW9uLiBJZlxuICAgICAqIGBhY2N1bXVsYXRvcmAgaXMgbm90IHByb3ZpZGVkIHRoZSBmaXJzdCBlbGVtZW50IG9mIHRoZSBjb2xsZWN0aW9uIHdpbGwgYmVcbiAgICAgKiB1c2VkIGFzIHRoZSBpbml0aWFsIGBhY2N1bXVsYXRvcmAgdmFsdWUuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2BcbiAgICAgKiBhbmQgaW52b2tlZCB3aXRoIGZvdXIgYXJndW1lbnRzOyAoYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleHxrZXksIGNvbGxlY3Rpb24pLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGFsaWFzIGZvbGRsLCBpbmplY3RcbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICAgICAqIEBwYXJhbSB7Kn0gW2FjY3VtdWxhdG9yXSBJbml0aWFsIHZhbHVlIG9mIHRoZSBhY2N1bXVsYXRvci5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgYWNjdW11bGF0ZWQgdmFsdWUuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBzdW0gPSBfLnJlZHVjZShbMSwgMiwgM10sIGZ1bmN0aW9uKHN1bSwgbnVtKSB7XG4gICAgICogICByZXR1cm4gc3VtICsgbnVtO1xuICAgICAqIH0pO1xuICAgICAqIC8vID0+IDZcbiAgICAgKlxuICAgICAqIHZhciBtYXBwZWQgPSBfLnJlZHVjZSh7ICdhJzogMSwgJ2InOiAyLCAnYyc6IDMgfSwgZnVuY3Rpb24ocmVzdWx0LCBudW0sIGtleSkge1xuICAgICAqICAgcmVzdWx0W2tleV0gPSBudW0gKiAzO1xuICAgICAqICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgKiB9LCB7fSk7XG4gICAgICogLy8gPT4geyAnYSc6IDMsICdiJzogNiwgJ2MnOiA5IH1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZWR1Y2UoY29sbGVjdGlvbiwgY2FsbGJhY2ssIGFjY3VtdWxhdG9yLCB0aGlzQXJnKSB7XG4gICAgICBpZiAoIWNvbGxlY3Rpb24pIHJldHVybiBhY2N1bXVsYXRvcjtcbiAgICAgIHZhciBub2FjY3VtID0gYXJndW1lbnRzLmxlbmd0aCA8IDM7XG4gICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgNCk7XG5cbiAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgIGxlbmd0aCA9IGNvbGxlY3Rpb24ubGVuZ3RoO1xuXG4gICAgICBpZiAodHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJykge1xuICAgICAgICBpZiAobm9hY2N1bSkge1xuICAgICAgICAgIGFjY3VtdWxhdG9yID0gY29sbGVjdGlvblsrK2luZGV4XTtcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgIGFjY3VtdWxhdG9yID0gY2FsbGJhY2soYWNjdW11bGF0b3IsIGNvbGxlY3Rpb25baW5kZXhdLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvck93bihjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICBhY2N1bXVsYXRvciA9IG5vYWNjdW1cbiAgICAgICAgICAgID8gKG5vYWNjdW0gPSBmYWxzZSwgdmFsdWUpXG4gICAgICAgICAgICA6IGNhbGxiYWNrKGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFjY3VtdWxhdG9yO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8ucmVkdWNlYCBleGNlcHQgdGhhdCBpdCBpdGVyYXRlcyBvdmVyIGVsZW1lbnRzXG4gICAgICogb2YgYSBgY29sbGVjdGlvbmAgZnJvbSByaWdodCB0byBsZWZ0LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGFsaWFzIGZvbGRyXG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25zXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICAgKiBAcGFyYW0geyp9IFthY2N1bXVsYXRvcl0gSW5pdGlhbCB2YWx1ZSBvZiB0aGUgYWNjdW11bGF0b3IuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGFjY3VtdWxhdGVkIHZhbHVlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgbGlzdCA9IFtbMCwgMV0sIFsyLCAzXSwgWzQsIDVdXTtcbiAgICAgKiB2YXIgZmxhdCA9IF8ucmVkdWNlUmlnaHQobGlzdCwgZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gYS5jb25jYXQoYik7IH0sIFtdKTtcbiAgICAgKiAvLyA9PiBbNCwgNSwgMiwgMywgMCwgMV1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZWR1Y2VSaWdodChjb2xsZWN0aW9uLCBjYWxsYmFjaywgYWNjdW11bGF0b3IsIHRoaXNBcmcpIHtcbiAgICAgIHZhciBub2FjY3VtID0gYXJndW1lbnRzLmxlbmd0aCA8IDM7XG4gICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgNCk7XG4gICAgICBmb3JFYWNoUmlnaHQoY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgIGFjY3VtdWxhdG9yID0gbm9hY2N1bVxuICAgICAgICAgID8gKG5vYWNjdW0gPSBmYWxzZSwgdmFsdWUpXG4gICAgICAgICAgOiBjYWxsYmFjayhhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGFjY3VtdWxhdG9yO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBvcHBvc2l0ZSBvZiBgXy5maWx0ZXJgIHRoaXMgbWV0aG9kIHJldHVybnMgdGhlIGVsZW1lbnRzIG9mIGFcbiAgICAgKiBjb2xsZWN0aW9uIHRoYXQgdGhlIGNhbGxiYWNrIGRvZXMgKipub3QqKiByZXR1cm4gdHJ1ZXkgZm9yLlxuICAgICAqXG4gICAgICogSWYgYSBwcm9wZXJ0eSBuYW1lIGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy5wbHVja1wiIHN0eWxlXG4gICAgICogY2FsbGJhY2sgd2lsbCByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrXG4gICAgICogd2lsbCByZXR1cm4gYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuIG9iamVjdCxcbiAgICAgKiBlbHNlIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkXG4gICAgICogIHBlciBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkXG4gICAgICogIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGEgbmV3IGFycmF5IG9mIGVsZW1lbnRzIHRoYXQgZmFpbGVkIHRoZSBjYWxsYmFjayBjaGVjay5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIG9kZHMgPSBfLnJlamVjdChbMSwgMiwgMywgNCwgNSwgNl0sIGZ1bmN0aW9uKG51bSkgeyByZXR1cm4gbnVtICUgMiA9PSAwOyB9KTtcbiAgICAgKiAvLyA9PiBbMSwgMywgNV1cbiAgICAgKlxuICAgICAqIHZhciBjaGFyYWN0ZXJzID0gW1xuICAgICAqICAgeyAnbmFtZSc6ICdiYXJuZXknLCAnYWdlJzogMzYsICdibG9ja2VkJzogZmFsc2UgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgJ2FnZSc6IDQwLCAnYmxvY2tlZCc6IHRydWUgfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ucGx1Y2tcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLnJlamVjdChjaGFyYWN0ZXJzLCAnYmxvY2tlZCcpO1xuICAgICAqIC8vID0+IFt7ICduYW1lJzogJ2Jhcm5leScsICdhZ2UnOiAzNiwgJ2Jsb2NrZWQnOiBmYWxzZSB9XVxuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLndoZXJlXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5yZWplY3QoY2hhcmFjdGVycywgeyAnYWdlJzogMzYgfSk7XG4gICAgICogLy8gPT4gW3sgJ25hbWUnOiAnZnJlZCcsICdhZ2UnOiA0MCwgJ2Jsb2NrZWQnOiB0cnVlIH1dXG4gICAgICovXG4gICAgZnVuY3Rpb24gcmVqZWN0KGNvbGxlY3Rpb24sIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICByZXR1cm4gZmlsdGVyKGNvbGxlY3Rpb24sIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICByZXR1cm4gIWNhbGxiYWNrKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZXMgYSByYW5kb20gZWxlbWVudCBvciBgbmAgcmFuZG9tIGVsZW1lbnRzIGZyb20gYSBjb2xsZWN0aW9uLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25zXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIHNhbXBsZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW25dIFRoZSBudW1iZXIgb2YgZWxlbWVudHMgdG8gc2FtcGxlLlxuICAgICAqIEBwYXJhbS0ge09iamVjdH0gW2d1YXJkXSBBbGxvd3Mgd29ya2luZyB3aXRoIGZ1bmN0aW9ucyBsaWtlIGBfLm1hcGBcbiAgICAgKiAgd2l0aG91dCB1c2luZyB0aGVpciBgaW5kZXhgIGFyZ3VtZW50cyBhcyBgbmAuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSByYW5kb20gc2FtcGxlKHMpIG9mIGBjb2xsZWN0aW9uYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5zYW1wbGUoWzEsIDIsIDMsIDRdKTtcbiAgICAgKiAvLyA9PiAyXG4gICAgICpcbiAgICAgKiBfLnNhbXBsZShbMSwgMiwgMywgNF0sIDIpO1xuICAgICAqIC8vID0+IFszLCAxXVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNhbXBsZShjb2xsZWN0aW9uLCBuLCBndWFyZCkge1xuICAgICAgaWYgKGNvbGxlY3Rpb24gJiYgdHlwZW9mIGNvbGxlY3Rpb24ubGVuZ3RoICE9ICdudW1iZXInKSB7XG4gICAgICAgIGNvbGxlY3Rpb24gPSB2YWx1ZXMoY29sbGVjdGlvbik7XG4gICAgICB9XG4gICAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSB7XG4gICAgICAgIHJldHVybiBjb2xsZWN0aW9uID8gY29sbGVjdGlvbltiYXNlUmFuZG9tKDAsIGNvbGxlY3Rpb24ubGVuZ3RoIC0gMSldIDogdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgdmFyIHJlc3VsdCA9IHNodWZmbGUoY29sbGVjdGlvbik7XG4gICAgICByZXN1bHQubGVuZ3RoID0gbmF0aXZlTWluKG5hdGl2ZU1heCgwLCBuKSwgcmVzdWx0Lmxlbmd0aCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gYXJyYXkgb2Ygc2h1ZmZsZWQgdmFsdWVzLCB1c2luZyBhIHZlcnNpb24gb2YgdGhlIEZpc2hlci1ZYXRlc1xuICAgICAqIHNodWZmbGUuIFNlZSBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Zpc2hlci1ZYXRlc19zaHVmZmxlLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25zXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIHNodWZmbGUuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGEgbmV3IHNodWZmbGVkIGNvbGxlY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uc2h1ZmZsZShbMSwgMiwgMywgNCwgNSwgNl0pO1xuICAgICAqIC8vID0+IFs0LCAxLCA2LCAzLCA1LCAyXVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNodWZmbGUoY29sbGVjdGlvbikge1xuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgbGVuZ3RoID0gY29sbGVjdGlvbiA/IGNvbGxlY3Rpb24ubGVuZ3RoIDogMCxcbiAgICAgICAgICByZXN1bHQgPSBBcnJheSh0eXBlb2YgbGVuZ3RoID09ICdudW1iZXInID8gbGVuZ3RoIDogMCk7XG5cbiAgICAgIGZvckVhY2goY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgdmFyIHJhbmQgPSBiYXNlUmFuZG9tKDAsICsraW5kZXgpO1xuICAgICAgICByZXN1bHRbaW5kZXhdID0gcmVzdWx0W3JhbmRdO1xuICAgICAgICByZXN1bHRbcmFuZF0gPSB2YWx1ZTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBzaXplIG9mIHRoZSBgY29sbGVjdGlvbmAgYnkgcmV0dXJuaW5nIGBjb2xsZWN0aW9uLmxlbmd0aGAgZm9yIGFycmF5c1xuICAgICAqIGFuZCBhcnJheS1saWtlIG9iamVjdHMgb3IgdGhlIG51bWJlciBvZiBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzIGZvciBvYmplY3RzLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25zXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGluc3BlY3QuXG4gICAgICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyBgY29sbGVjdGlvbi5sZW5ndGhgIG9yIG51bWJlciBvZiBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLnNpemUoWzEsIDJdKTtcbiAgICAgKiAvLyA9PiAyXG4gICAgICpcbiAgICAgKiBfLnNpemUoeyAnb25lJzogMSwgJ3R3byc6IDIsICd0aHJlZSc6IDMgfSk7XG4gICAgICogLy8gPT4gM1xuICAgICAqXG4gICAgICogXy5zaXplKCdwZWJibGVzJyk7XG4gICAgICogLy8gPT4gN1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNpemUoY29sbGVjdGlvbikge1xuICAgICAgdmFyIGxlbmd0aCA9IGNvbGxlY3Rpb24gPyBjb2xsZWN0aW9uLmxlbmd0aCA6IDA7XG4gICAgICByZXR1cm4gdHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJyA/IGxlbmd0aCA6IGtleXMoY29sbGVjdGlvbikubGVuZ3RoO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgY2FsbGJhY2sgcmV0dXJucyBhIHRydWV5IHZhbHVlIGZvciAqKmFueSoqIGVsZW1lbnQgb2YgYVxuICAgICAqIGNvbGxlY3Rpb24uIFRoZSBmdW5jdGlvbiByZXR1cm5zIGFzIHNvb24gYXMgaXQgZmluZHMgYSBwYXNzaW5nIHZhbHVlIGFuZFxuICAgICAqIGRvZXMgbm90IGl0ZXJhdGUgb3ZlciB0aGUgZW50aXJlIGNvbGxlY3Rpb24uIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0b1xuICAgICAqIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50czsgKHZhbHVlLCBpbmRleHxrZXksIGNvbGxlY3Rpb24pLlxuICAgICAqXG4gICAgICogSWYgYSBwcm9wZXJ0eSBuYW1lIGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy5wbHVja1wiIHN0eWxlXG4gICAgICogY2FsbGJhY2sgd2lsbCByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrXG4gICAgICogd2lsbCByZXR1cm4gYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuIG9iamVjdCxcbiAgICAgKiBlbHNlIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAYWxpYXMgYW55XG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25zXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdHxzdHJpbmd9IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZFxuICAgICAqICBwZXIgaXRlcmF0aW9uLiBJZiBhIHByb3BlcnR5IG5hbWUgb3Igb2JqZWN0IGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgdXNlZFxuICAgICAqICB0byBjcmVhdGUgYSBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFjaywgcmVzcGVjdGl2ZWx5LlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBhbnkgZWxlbWVudCBwYXNzZWQgdGhlIGNhbGxiYWNrIGNoZWNrLFxuICAgICAqICBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uc29tZShbbnVsbCwgMCwgJ3llcycsIGZhbHNlXSwgQm9vbGVhbik7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSBbXG4gICAgICogICB7ICduYW1lJzogJ2Jhcm5leScsICdhZ2UnOiAzNiwgJ2Jsb2NrZWQnOiBmYWxzZSB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdmcmVkJywgICAnYWdlJzogNDAsICdibG9ja2VkJzogdHJ1ZSB9XG4gICAgICogXTtcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy5wbHVja1wiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8uc29tZShjaGFyYWN0ZXJzLCAnYmxvY2tlZCcpO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy53aGVyZVwiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8uc29tZShjaGFyYWN0ZXJzLCB7ICdhZ2UnOiAxIH0pO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICovXG4gICAgZnVuY3Rpb24gc29tZShjb2xsZWN0aW9uLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIHJlc3VsdDtcbiAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcblxuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgbGVuZ3RoID0gY29sbGVjdGlvbiA/IGNvbGxlY3Rpb24ubGVuZ3RoIDogMDtcblxuICAgICAgaWYgKHR5cGVvZiBsZW5ndGggPT0gJ251bWJlcicpIHtcbiAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICBpZiAoKHJlc3VsdCA9IGNhbGxiYWNrKGNvbGxlY3Rpb25baW5kZXhdLCBpbmRleCwgY29sbGVjdGlvbikpKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvck93bihjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICByZXR1cm4gIShyZXN1bHQgPSBjYWxsYmFjayh2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gISFyZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhcnJheSBvZiBlbGVtZW50cywgc29ydGVkIGluIGFzY2VuZGluZyBvcmRlciBieSB0aGUgcmVzdWx0cyBvZlxuICAgICAqIHJ1bm5pbmcgZWFjaCBlbGVtZW50IGluIGEgY29sbGVjdGlvbiB0aHJvdWdoIHRoZSBjYWxsYmFjay4gVGhpcyBtZXRob2RcbiAgICAgKiBwZXJmb3JtcyBhIHN0YWJsZSBzb3J0LCB0aGF0IGlzLCBpdCB3aWxsIHByZXNlcnZlIHRoZSBvcmlnaW5hbCBzb3J0IG9yZGVyXG4gICAgICogb2YgZXF1YWwgZWxlbWVudHMuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aFxuICAgICAqIHRocmVlIGFyZ3VtZW50czsgKHZhbHVlLCBpbmRleHxrZXksIGNvbGxlY3Rpb24pLlxuICAgICAqXG4gICAgICogSWYgYSBwcm9wZXJ0eSBuYW1lIGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy5wbHVja1wiIHN0eWxlXG4gICAgICogY2FsbGJhY2sgd2lsbCByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogSWYgYW4gYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNvbGxlY3Rpb25cbiAgICAgKiB3aWxsIGJlIHNvcnRlZCBieSBlYWNoIHByb3BlcnR5IHZhbHVlLlxuICAgICAqXG4gICAgICogSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrXG4gICAgICogd2lsbCByZXR1cm4gYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuIG9iamVjdCxcbiAgICAgKiBlbHNlIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkXG4gICAgICogIHBlciBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkXG4gICAgICogIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGEgbmV3IGFycmF5IG9mIHNvcnRlZCBlbGVtZW50cy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5zb3J0QnkoWzEsIDIsIDNdLCBmdW5jdGlvbihudW0pIHsgcmV0dXJuIE1hdGguc2luKG51bSk7IH0pO1xuICAgICAqIC8vID0+IFszLCAxLCAyXVxuICAgICAqXG4gICAgICogXy5zb3J0QnkoWzEsIDIsIDNdLCBmdW5jdGlvbihudW0pIHsgcmV0dXJuIHRoaXMuc2luKG51bSk7IH0sIE1hdGgpO1xuICAgICAqIC8vID0+IFszLCAxLCAyXVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSBbXG4gICAgICogICB7ICduYW1lJzogJ2Jhcm5leScsICAnYWdlJzogMzYgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgICdhZ2UnOiA0MCB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdiYXJuZXknLCAgJ2FnZSc6IDI2IH0sXG4gICAgICogICB7ICduYW1lJzogJ2ZyZWQnLCAgICAnYWdlJzogMzAgfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ucGx1Y2tcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLm1hcChfLnNvcnRCeShjaGFyYWN0ZXJzLCAnYWdlJyksIF8udmFsdWVzKTtcbiAgICAgKiAvLyA9PiBbWydiYXJuZXknLCAyNl0sIFsnZnJlZCcsIDMwXSwgWydiYXJuZXknLCAzNl0sIFsnZnJlZCcsIDQwXV1cbiAgICAgKlxuICAgICAqIC8vIHNvcnRpbmcgYnkgbXVsdGlwbGUgcHJvcGVydGllc1xuICAgICAqIF8ubWFwKF8uc29ydEJ5KGNoYXJhY3RlcnMsIFsnbmFtZScsICdhZ2UnXSksIF8udmFsdWVzKTtcbiAgICAgKiAvLyA9ID4gW1snYmFybmV5JywgMjZdLCBbJ2Jhcm5leScsIDM2XSwgWydmcmVkJywgMzBdLCBbJ2ZyZWQnLCA0MF1dXG4gICAgICovXG4gICAgZnVuY3Rpb24gc29ydEJ5KGNvbGxlY3Rpb24sIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBpc0FyciA9IGlzQXJyYXkoY2FsbGJhY2spLFxuICAgICAgICAgIGxlbmd0aCA9IGNvbGxlY3Rpb24gPyBjb2xsZWN0aW9uLmxlbmd0aCA6IDAsXG4gICAgICAgICAgcmVzdWx0ID0gQXJyYXkodHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJyA/IGxlbmd0aCA6IDApO1xuXG4gICAgICBpZiAoIWlzQXJyKSB7XG4gICAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcbiAgICAgIH1cbiAgICAgIGZvckVhY2goY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsdWUsIGtleSwgY29sbGVjdGlvbikge1xuICAgICAgICB2YXIgb2JqZWN0ID0gcmVzdWx0WysraW5kZXhdID0gZ2V0T2JqZWN0KCk7XG4gICAgICAgIGlmIChpc0Fycikge1xuICAgICAgICAgIG9iamVjdC5jcml0ZXJpYSA9IG1hcChjYWxsYmFjaywgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAob2JqZWN0LmNyaXRlcmlhID0gZ2V0QXJyYXkoKSlbMF0gPSBjYWxsYmFjayh2YWx1ZSwga2V5LCBjb2xsZWN0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBvYmplY3QuaW5kZXggPSBpbmRleDtcbiAgICAgICAgb2JqZWN0LnZhbHVlID0gdmFsdWU7XG4gICAgICB9KTtcblxuICAgICAgbGVuZ3RoID0gcmVzdWx0Lmxlbmd0aDtcbiAgICAgIHJlc3VsdC5zb3J0KGNvbXBhcmVBc2NlbmRpbmcpO1xuICAgICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgIHZhciBvYmplY3QgPSByZXN1bHRbbGVuZ3RoXTtcbiAgICAgICAgcmVzdWx0W2xlbmd0aF0gPSBvYmplY3QudmFsdWU7XG4gICAgICAgIGlmICghaXNBcnIpIHtcbiAgICAgICAgICByZWxlYXNlQXJyYXkob2JqZWN0LmNyaXRlcmlhKTtcbiAgICAgICAgfVxuICAgICAgICByZWxlYXNlT2JqZWN0KG9iamVjdCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIHRoZSBgY29sbGVjdGlvbmAgdG8gYW4gYXJyYXkuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gY29udmVydC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBjb252ZXJ0ZWQgYXJyYXkuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIChmdW5jdGlvbigpIHsgcmV0dXJuIF8udG9BcnJheShhcmd1bWVudHMpLnNsaWNlKDEpOyB9KSgxLCAyLCAzLCA0KTtcbiAgICAgKiAvLyA9PiBbMiwgMywgNF1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0b0FycmF5KGNvbGxlY3Rpb24pIHtcbiAgICAgIGlmIChjb2xsZWN0aW9uICYmIHR5cGVvZiBjb2xsZWN0aW9uLmxlbmd0aCA9PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4gc2xpY2UoY29sbGVjdGlvbik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWVzKGNvbGxlY3Rpb24pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBlcmZvcm1zIGEgZGVlcCBjb21wYXJpc29uIG9mIGVhY2ggZWxlbWVudCBpbiBhIGBjb2xsZWN0aW9uYCB0byB0aGUgZ2l2ZW5cbiAgICAgKiBgcHJvcGVydGllc2Agb2JqZWN0LCByZXR1cm5pbmcgYW4gYXJyYXkgb2YgYWxsIGVsZW1lbnRzIHRoYXQgaGF2ZSBlcXVpdmFsZW50XG4gICAgICogcHJvcGVydHkgdmFsdWVzLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQHR5cGUgRnVuY3Rpb25cbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wcyBUaGUgb2JqZWN0IG9mIHByb3BlcnR5IHZhbHVlcyB0byBmaWx0ZXIgYnkuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGEgbmV3IGFycmF5IG9mIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgZ2l2ZW4gcHJvcGVydGllcy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSBbXG4gICAgICogICB7ICduYW1lJzogJ2Jhcm5leScsICdhZ2UnOiAzNiwgJ3BldHMnOiBbJ2hvcHB5J10gfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgJ2FnZSc6IDQwLCAncGV0cyc6IFsnYmFieSBwdXNzJywgJ2Rpbm8nXSB9XG4gICAgICogXTtcbiAgICAgKlxuICAgICAqIF8ud2hlcmUoY2hhcmFjdGVycywgeyAnYWdlJzogMzYgfSk7XG4gICAgICogLy8gPT4gW3sgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2LCAncGV0cyc6IFsnaG9wcHknXSB9XVxuICAgICAqXG4gICAgICogXy53aGVyZShjaGFyYWN0ZXJzLCB7ICdwZXRzJzogWydkaW5vJ10gfSk7XG4gICAgICogLy8gPT4gW3sgJ25hbWUnOiAnZnJlZCcsICdhZ2UnOiA0MCwgJ3BldHMnOiBbJ2JhYnkgcHVzcycsICdkaW5vJ10gfV1cbiAgICAgKi9cbiAgICB2YXIgd2hlcmUgPSBmaWx0ZXI7XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gYXJyYXkgd2l0aCBhbGwgZmFsc2V5IHZhbHVlcyByZW1vdmVkLiBUaGUgdmFsdWVzIGBmYWxzZWAsIGBudWxsYCxcbiAgICAgKiBgMGAsIGBcIlwiYCwgYHVuZGVmaW5lZGAsIGFuZCBgTmFOYCBhcmUgYWxsIGZhbHNleS5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gY29tcGFjdC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYSBuZXcgYXJyYXkgb2YgZmlsdGVyZWQgdmFsdWVzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmNvbXBhY3QoWzAsIDEsIGZhbHNlLCAyLCAnJywgM10pO1xuICAgICAqIC8vID0+IFsxLCAyLCAzXVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNvbXBhY3QoYXJyYXkpIHtcbiAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgIGxlbmd0aCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMCxcbiAgICAgICAgICByZXN1bHQgPSBbXTtcblxuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gYXJyYXlbaW5kZXhdO1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhcnJheSBleGNsdWRpbmcgYWxsIHZhbHVlcyBvZiB0aGUgcHJvdmlkZWQgYXJyYXlzIHVzaW5nIHN0cmljdFxuICAgICAqIGVxdWFsaXR5IGZvciBjb21wYXJpc29ucywgaS5lLiBgPT09YC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gcHJvY2Vzcy5cbiAgICAgKiBAcGFyYW0gey4uLkFycmF5fSBbdmFsdWVzXSBUaGUgYXJyYXlzIG9mIHZhbHVlcyB0byBleGNsdWRlLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhIG5ldyBhcnJheSBvZiBmaWx0ZXJlZCB2YWx1ZXMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uZGlmZmVyZW5jZShbMSwgMiwgMywgNCwgNV0sIFs1LCAyLCAxMF0pO1xuICAgICAqIC8vID0+IFsxLCAzLCA0XVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGRpZmZlcmVuY2UoYXJyYXkpIHtcbiAgICAgIHJldHVybiBiYXNlRGlmZmVyZW5jZShhcnJheSwgYmFzZUZsYXR0ZW4oYXJndW1lbnRzLCB0cnVlLCB0cnVlLCAxKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgbGlrZSBgXy5maW5kYCBleGNlcHQgdGhhdCBpdCByZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgZmlyc3RcbiAgICAgKiBlbGVtZW50IHRoYXQgcGFzc2VzIHRoZSBjYWxsYmFjayBjaGVjaywgaW5zdGVhZCBvZiB0aGUgZWxlbWVudCBpdHNlbGYuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gc2VhcmNoLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkXG4gICAgICogIHBlciBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkXG4gICAgICogIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGZvdW5kIGVsZW1lbnQsIGVsc2UgYC0xYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSBbXG4gICAgICogICB7ICduYW1lJzogJ2Jhcm5leScsICAnYWdlJzogMzYsICdibG9ja2VkJzogZmFsc2UgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgICdhZ2UnOiA0MCwgJ2Jsb2NrZWQnOiB0cnVlIH0sXG4gICAgICogICB7ICduYW1lJzogJ3BlYmJsZXMnLCAnYWdlJzogMSwgICdibG9ja2VkJzogZmFsc2UgfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiBfLmZpbmRJbmRleChjaGFyYWN0ZXJzLCBmdW5jdGlvbihjaHIpIHtcbiAgICAgKiAgIHJldHVybiBjaHIuYWdlIDwgMjA7XG4gICAgICogfSk7XG4gICAgICogLy8gPT4gMlxuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLndoZXJlXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5maW5kSW5kZXgoY2hhcmFjdGVycywgeyAnYWdlJzogMzYgfSk7XG4gICAgICogLy8gPT4gMFxuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLnBsdWNrXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5maW5kSW5kZXgoY2hhcmFjdGVycywgJ2Jsb2NrZWQnKTtcbiAgICAgKiAvLyA9PiAxXG4gICAgICovXG4gICAgZnVuY3Rpb24gZmluZEluZGV4KGFycmF5LCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgbGVuZ3RoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwO1xuXG4gICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICBpZiAoY2FsbGJhY2soYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpKSB7XG4gICAgICAgICAgcmV0dXJuIGluZGV4O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgbGlrZSBgXy5maW5kSW5kZXhgIGV4Y2VwdCB0aGF0IGl0IGl0ZXJhdGVzIG92ZXIgZWxlbWVudHNcbiAgICAgKiBvZiBhIGBjb2xsZWN0aW9uYCBmcm9tIHJpZ2h0IHRvIGxlZnQuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gc2VhcmNoLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkXG4gICAgICogIHBlciBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkXG4gICAgICogIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGZvdW5kIGVsZW1lbnQsIGVsc2UgYC0xYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSBbXG4gICAgICogICB7ICduYW1lJzogJ2Jhcm5leScsICAnYWdlJzogMzYsICdibG9ja2VkJzogdHJ1ZSB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdmcmVkJywgICAgJ2FnZSc6IDQwLCAnYmxvY2tlZCc6IGZhbHNlIH0sXG4gICAgICogICB7ICduYW1lJzogJ3BlYmJsZXMnLCAnYWdlJzogMSwgICdibG9ja2VkJzogdHJ1ZSB9XG4gICAgICogXTtcbiAgICAgKlxuICAgICAqIF8uZmluZExhc3RJbmRleChjaGFyYWN0ZXJzLCBmdW5jdGlvbihjaHIpIHtcbiAgICAgKiAgIHJldHVybiBjaHIuYWdlID4gMzA7XG4gICAgICogfSk7XG4gICAgICogLy8gPT4gMVxuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLndoZXJlXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5maW5kTGFzdEluZGV4KGNoYXJhY3RlcnMsIHsgJ2FnZSc6IDM2IH0pO1xuICAgICAqIC8vID0+IDBcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy5wbHVja1wiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8uZmluZExhc3RJbmRleChjaGFyYWN0ZXJzLCAnYmxvY2tlZCcpO1xuICAgICAqIC8vID0+IDJcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBmaW5kTGFzdEluZGV4KGFycmF5LCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIGxlbmd0aCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMDtcbiAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcbiAgICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICBpZiAoY2FsbGJhY2soYXJyYXlbbGVuZ3RoXSwgbGVuZ3RoLCBhcnJheSkpIHtcbiAgICAgICAgICByZXR1cm4gbGVuZ3RoO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgZmlyc3QgZWxlbWVudCBvciBmaXJzdCBgbmAgZWxlbWVudHMgb2YgYW4gYXJyYXkuIElmIGEgY2FsbGJhY2tcbiAgICAgKiBpcyBwcm92aWRlZCBlbGVtZW50cyBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBhcnJheSBhcmUgcmV0dXJuZWQgYXMgbG9uZ1xuICAgICAqIGFzIHRoZSBjYWxsYmFjayByZXR1cm5zIHRydWV5LiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZFxuICAgICAqIGludm9rZWQgd2l0aCB0aHJlZSBhcmd1bWVudHM7ICh2YWx1ZSwgaW5kZXgsIGFycmF5KS5cbiAgICAgKlxuICAgICAqIElmIGEgcHJvcGVydHkgbmFtZSBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ucGx1Y2tcIiBzdHlsZVxuICAgICAqIGNhbGxiYWNrIHdpbGwgcmV0dXJuIHRoZSBwcm9wZXJ0eSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKlxuICAgICAqIElmIGFuIG9iamVjdCBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFja1xuICAgICAqIHdpbGwgcmV0dXJuIGB0cnVlYCBmb3IgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBnaXZlbiBvYmplY3QsXG4gICAgICogZWxzZSBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGFsaWFzIGhlYWQsIHRha2VcbiAgICAgKiBAY2F0ZWdvcnkgQXJyYXlzXG4gICAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIHF1ZXJ5LlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fG51bWJlcnxzdHJpbmd9IFtjYWxsYmFja10gVGhlIGZ1bmN0aW9uIGNhbGxlZFxuICAgICAqICBwZXIgZWxlbWVudCBvciB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIHRvIHJldHVybi4gSWYgYSBwcm9wZXJ0eSBuYW1lIG9yXG4gICAgICogIG9iamVjdCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWQgdG8gY3JlYXRlIGEgXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCJcbiAgICAgKiAgc3R5bGUgY2FsbGJhY2ssIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZmlyc3QgZWxlbWVudChzKSBvZiBgYXJyYXlgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmZpcnN0KFsxLCAyLCAzXSk7XG4gICAgICogLy8gPT4gMVxuICAgICAqXG4gICAgICogXy5maXJzdChbMSwgMiwgM10sIDIpO1xuICAgICAqIC8vID0+IFsxLCAyXVxuICAgICAqXG4gICAgICogXy5maXJzdChbMSwgMiwgM10sIGZ1bmN0aW9uKG51bSkge1xuICAgICAqICAgcmV0dXJuIG51bSA8IDM7XG4gICAgICogfSk7XG4gICAgICogLy8gPT4gWzEsIDJdXG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgICdibG9ja2VkJzogdHJ1ZSwgICdlbXBsb3llcic6ICdzbGF0ZScgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgICdibG9ja2VkJzogZmFsc2UsICdlbXBsb3llcic6ICdzbGF0ZScgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAncGViYmxlcycsICdibG9ja2VkJzogdHJ1ZSwgICdlbXBsb3llcic6ICduYScgfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ucGx1Y2tcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLmZpcnN0KGNoYXJhY3RlcnMsICdibG9ja2VkJyk7XG4gICAgICogLy8gPT4gW3sgJ25hbWUnOiAnYmFybmV5JywgJ2Jsb2NrZWQnOiB0cnVlLCAnZW1wbG95ZXInOiAnc2xhdGUnIH1dXG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ud2hlcmVcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLnBsdWNrKF8uZmlyc3QoY2hhcmFjdGVycywgeyAnZW1wbG95ZXInOiAnc2xhdGUnIH0pLCAnbmFtZScpO1xuICAgICAqIC8vID0+IFsnYmFybmV5JywgJ2ZyZWQnXVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZpcnN0KGFycmF5LCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIG4gPSAwLFxuICAgICAgICAgIGxlbmd0aCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMDtcblxuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPSAnbnVtYmVyJyAmJiBjYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICAgIHZhciBpbmRleCA9IC0xO1xuICAgICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoICYmIGNhbGxiYWNrKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KSkge1xuICAgICAgICAgIG4rKztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbiA9IGNhbGxiYWNrO1xuICAgICAgICBpZiAobiA9PSBudWxsIHx8IHRoaXNBcmcpIHtcbiAgICAgICAgICByZXR1cm4gYXJyYXkgPyBhcnJheVswXSA6IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHNsaWNlKGFycmF5LCAwLCBuYXRpdmVNaW4obmF0aXZlTWF4KDAsIG4pLCBsZW5ndGgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGbGF0dGVucyBhIG5lc3RlZCBhcnJheSAodGhlIG5lc3RpbmcgY2FuIGJlIHRvIGFueSBkZXB0aCkuIElmIGBpc1NoYWxsb3dgXG4gICAgICogaXMgdHJ1ZXksIHRoZSBhcnJheSB3aWxsIG9ubHkgYmUgZmxhdHRlbmVkIGEgc2luZ2xlIGxldmVsLiBJZiBhIGNhbGxiYWNrXG4gICAgICogaXMgcHJvdmlkZWQgZWFjaCBlbGVtZW50IG9mIHRoZSBhcnJheSBpcyBwYXNzZWQgdGhyb3VnaCB0aGUgY2FsbGJhY2sgYmVmb3JlXG4gICAgICogZmxhdHRlbmluZy4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIHRocmVlXG4gICAgICogYXJndW1lbnRzOyAodmFsdWUsIGluZGV4LCBhcnJheSkuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gZmxhdHRlbi5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc1NoYWxsb3c9ZmFsc2VdIEEgZmxhZyB0byByZXN0cmljdCBmbGF0dGVuaW5nIHRvIGEgc2luZ2xlIGxldmVsLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkXG4gICAgICogIHBlciBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkXG4gICAgICogIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGEgbmV3IGZsYXR0ZW5lZCBhcnJheS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5mbGF0dGVuKFsxLCBbMl0sIFszLCBbWzRdXV1dKTtcbiAgICAgKiAvLyA9PiBbMSwgMiwgMywgNF07XG4gICAgICpcbiAgICAgKiBfLmZsYXR0ZW4oWzEsIFsyXSwgWzMsIFtbNF1dXV0sIHRydWUpO1xuICAgICAqIC8vID0+IFsxLCAyLCAzLCBbWzRdXV07XG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDMwLCAncGV0cyc6IFsnaG9wcHknXSB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdmcmVkJywgICAnYWdlJzogNDAsICdwZXRzJzogWydiYWJ5IHB1c3MnLCAnZGlubyddIH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLnBsdWNrXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5mbGF0dGVuKGNoYXJhY3RlcnMsICdwZXRzJyk7XG4gICAgICogLy8gPT4gWydob3BweScsICdiYWJ5IHB1c3MnLCAnZGlubyddXG4gICAgICovXG4gICAgZnVuY3Rpb24gZmxhdHRlbihhcnJheSwgaXNTaGFsbG93LCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgLy8ganVnZ2xlIGFyZ3VtZW50c1xuICAgICAgaWYgKHR5cGVvZiBpc1NoYWxsb3cgIT0gJ2Jvb2xlYW4nICYmIGlzU2hhbGxvdyAhPSBudWxsKSB7XG4gICAgICAgIHRoaXNBcmcgPSBjYWxsYmFjaztcbiAgICAgICAgY2FsbGJhY2sgPSAodHlwZW9mIGlzU2hhbGxvdyAhPSAnZnVuY3Rpb24nICYmIHRoaXNBcmcgJiYgdGhpc0FyZ1tpc1NoYWxsb3ddID09PSBhcnJheSkgPyBudWxsIDogaXNTaGFsbG93O1xuICAgICAgICBpc1NoYWxsb3cgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICAgIGFycmF5ID0gbWFwKGFycmF5LCBjYWxsYmFjaywgdGhpc0FyZyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYmFzZUZsYXR0ZW4oYXJyYXksIGlzU2hhbGxvdyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgaW5kZXggYXQgd2hpY2ggdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgYHZhbHVlYCBpcyBmb3VuZCB1c2luZ1xuICAgICAqIHN0cmljdCBlcXVhbGl0eSBmb3IgY29tcGFyaXNvbnMsIGkuZS4gYD09PWAuIElmIHRoZSBhcnJheSBpcyBhbHJlYWR5IHNvcnRlZFxuICAgICAqIHByb3ZpZGluZyBgdHJ1ZWAgZm9yIGBmcm9tSW5kZXhgIHdpbGwgcnVuIGEgZmFzdGVyIGJpbmFyeSBzZWFyY2guXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQXJyYXlzXG4gICAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIHNlYXJjaC5cbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZWFyY2ggZm9yLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbnxudW1iZXJ9IFtmcm9tSW5kZXg9MF0gVGhlIGluZGV4IHRvIHNlYXJjaCBmcm9tIG9yIGB0cnVlYFxuICAgICAqICB0byBwZXJmb3JtIGEgYmluYXJ5IHNlYXJjaCBvbiBhIHNvcnRlZCBhcnJheS5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgbWF0Y2hlZCB2YWx1ZSBvciBgLTFgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmluZGV4T2YoWzEsIDIsIDMsIDEsIDIsIDNdLCAyKTtcbiAgICAgKiAvLyA9PiAxXG4gICAgICpcbiAgICAgKiBfLmluZGV4T2YoWzEsIDIsIDMsIDEsIDIsIDNdLCAyLCAzKTtcbiAgICAgKiAvLyA9PiA0XG4gICAgICpcbiAgICAgKiBfLmluZGV4T2YoWzEsIDEsIDIsIDIsIDMsIDNdLCAyLCB0cnVlKTtcbiAgICAgKiAvLyA9PiAyXG4gICAgICovXG4gICAgZnVuY3Rpb24gaW5kZXhPZihhcnJheSwgdmFsdWUsIGZyb21JbmRleCkge1xuICAgICAgaWYgKHR5cGVvZiBmcm9tSW5kZXggPT0gJ251bWJlcicpIHtcbiAgICAgICAgdmFyIGxlbmd0aCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMDtcbiAgICAgICAgZnJvbUluZGV4ID0gKGZyb21JbmRleCA8IDAgPyBuYXRpdmVNYXgoMCwgbGVuZ3RoICsgZnJvbUluZGV4KSA6IGZyb21JbmRleCB8fCAwKTtcbiAgICAgIH0gZWxzZSBpZiAoZnJvbUluZGV4KSB7XG4gICAgICAgIHZhciBpbmRleCA9IHNvcnRlZEluZGV4KGFycmF5LCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiBhcnJheVtpbmRleF0gPT09IHZhbHVlID8gaW5kZXggOiAtMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBiYXNlSW5kZXhPZihhcnJheSwgdmFsdWUsIGZyb21JbmRleCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyBhbGwgYnV0IHRoZSBsYXN0IGVsZW1lbnQgb3IgbGFzdCBgbmAgZWxlbWVudHMgb2YgYW4gYXJyYXkuIElmIGFcbiAgICAgKiBjYWxsYmFjayBpcyBwcm92aWRlZCBlbGVtZW50cyBhdCB0aGUgZW5kIG9mIHRoZSBhcnJheSBhcmUgZXhjbHVkZWQgZnJvbVxuICAgICAqIHRoZSByZXN1bHQgYXMgbG9uZyBhcyB0aGUgY2FsbGJhY2sgcmV0dXJucyB0cnVleS4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kXG4gICAgICogdG8gYHRoaXNBcmdgIGFuZCBpbnZva2VkIHdpdGggdGhyZWUgYXJndW1lbnRzOyAodmFsdWUsIGluZGV4LCBhcnJheSkuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gcXVlcnkuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8bnVtYmVyfHN0cmluZ30gW2NhbGxiYWNrPTFdIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGVsZW1lbnQgb3IgdGhlIG51bWJlciBvZiBlbGVtZW50cyB0byBleGNsdWRlLiBJZiBhIHByb3BlcnR5IG5hbWUgb3JcbiAgICAgKiAgb2JqZWN0IGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgdXNlZCB0byBjcmVhdGUgYSBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIlxuICAgICAqICBzdHlsZSBjYWxsYmFjaywgcmVzcGVjdGl2ZWx5LlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhIHNsaWNlIG9mIGBhcnJheWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uaW5pdGlhbChbMSwgMiwgM10pO1xuICAgICAqIC8vID0+IFsxLCAyXVxuICAgICAqXG4gICAgICogXy5pbml0aWFsKFsxLCAyLCAzXSwgMik7XG4gICAgICogLy8gPT4gWzFdXG4gICAgICpcbiAgICAgKiBfLmluaXRpYWwoWzEsIDIsIDNdLCBmdW5jdGlvbihudW0pIHtcbiAgICAgKiAgIHJldHVybiBudW0gPiAxO1xuICAgICAqIH0pO1xuICAgICAqIC8vID0+IFsxXVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSBbXG4gICAgICogICB7ICduYW1lJzogJ2Jhcm5leScsICAnYmxvY2tlZCc6IGZhbHNlLCAnZW1wbG95ZXInOiAnc2xhdGUnIH0sXG4gICAgICogICB7ICduYW1lJzogJ2ZyZWQnLCAgICAnYmxvY2tlZCc6IHRydWUsICAnZW1wbG95ZXInOiAnc2xhdGUnIH0sXG4gICAgICogICB7ICduYW1lJzogJ3BlYmJsZXMnLCAnYmxvY2tlZCc6IHRydWUsICAnZW1wbG95ZXInOiAnbmEnIH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLnBsdWNrXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5pbml0aWFsKGNoYXJhY3RlcnMsICdibG9ja2VkJyk7XG4gICAgICogLy8gPT4gW3sgJ25hbWUnOiAnYmFybmV5JywgICdibG9ja2VkJzogZmFsc2UsICdlbXBsb3llcic6ICdzbGF0ZScgfV1cbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy53aGVyZVwiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8ucGx1Y2soXy5pbml0aWFsKGNoYXJhY3RlcnMsIHsgJ2VtcGxveWVyJzogJ25hJyB9KSwgJ25hbWUnKTtcbiAgICAgKiAvLyA9PiBbJ2Jhcm5leScsICdmcmVkJ11cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpbml0aWFsKGFycmF5LCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIG4gPSAwLFxuICAgICAgICAgIGxlbmd0aCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMDtcblxuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPSAnbnVtYmVyJyAmJiBjYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGxlbmd0aDtcbiAgICAgICAgY2FsbGJhY2sgPSBsb2Rhc2guY3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDMpO1xuICAgICAgICB3aGlsZSAoaW5kZXgtLSAmJiBjYWxsYmFjayhhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSkpIHtcbiAgICAgICAgICBuKys7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG4gPSAoY2FsbGJhY2sgPT0gbnVsbCB8fCB0aGlzQXJnKSA/IDEgOiBjYWxsYmFjayB8fCBuO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNsaWNlKGFycmF5LCAwLCBuYXRpdmVNaW4obmF0aXZlTWF4KDAsIGxlbmd0aCAtIG4pLCBsZW5ndGgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGFycmF5IG9mIHVuaXF1ZSB2YWx1ZXMgcHJlc2VudCBpbiBhbGwgcHJvdmlkZWQgYXJyYXlzIHVzaW5nXG4gICAgICogc3RyaWN0IGVxdWFsaXR5IGZvciBjb21wYXJpc29ucywgaS5lLiBgPT09YC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0gey4uLkFycmF5fSBbYXJyYXldIFRoZSBhcnJheXMgdG8gaW5zcGVjdC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYW4gYXJyYXkgb2Ygc2hhcmVkIHZhbHVlcy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5pbnRlcnNlY3Rpb24oWzEsIDIsIDNdLCBbNSwgMiwgMSwgNF0sIFsyLCAxXSk7XG4gICAgICogLy8gPT4gWzEsIDJdXG4gICAgICovXG4gICAgZnVuY3Rpb24gaW50ZXJzZWN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3MgPSBbXSxcbiAgICAgICAgICBhcmdzSW5kZXggPSAtMSxcbiAgICAgICAgICBhcmdzTGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aCxcbiAgICAgICAgICBjYWNoZXMgPSBnZXRBcnJheSgpLFxuICAgICAgICAgIGluZGV4T2YgPSBnZXRJbmRleE9mKCksXG4gICAgICAgICAgdHJ1c3RJbmRleE9mID0gaW5kZXhPZiA9PT0gYmFzZUluZGV4T2YsXG4gICAgICAgICAgc2VlbiA9IGdldEFycmF5KCk7XG5cbiAgICAgIHdoaWxlICgrK2FyZ3NJbmRleCA8IGFyZ3NMZW5ndGgpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gYXJndW1lbnRzW2FyZ3NJbmRleF07XG4gICAgICAgIGlmIChpc0FycmF5KHZhbHVlKSB8fCBpc0FyZ3VtZW50cyh2YWx1ZSkpIHtcbiAgICAgICAgICBhcmdzLnB1c2godmFsdWUpO1xuICAgICAgICAgIGNhY2hlcy5wdXNoKHRydXN0SW5kZXhPZiAmJiB2YWx1ZS5sZW5ndGggPj0gbGFyZ2VBcnJheVNpemUgJiZcbiAgICAgICAgICAgIGNyZWF0ZUNhY2hlKGFyZ3NJbmRleCA/IGFyZ3NbYXJnc0luZGV4XSA6IHNlZW4pKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIGFycmF5ID0gYXJnc1swXSxcbiAgICAgICAgICBpbmRleCA9IC0xLFxuICAgICAgICAgIGxlbmd0aCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMCxcbiAgICAgICAgICByZXN1bHQgPSBbXTtcblxuICAgICAgb3V0ZXI6XG4gICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICB2YXIgY2FjaGUgPSBjYWNoZXNbMF07XG4gICAgICAgIHZhbHVlID0gYXJyYXlbaW5kZXhdO1xuXG4gICAgICAgIGlmICgoY2FjaGUgPyBjYWNoZUluZGV4T2YoY2FjaGUsIHZhbHVlKSA6IGluZGV4T2Yoc2VlbiwgdmFsdWUpKSA8IDApIHtcbiAgICAgICAgICBhcmdzSW5kZXggPSBhcmdzTGVuZ3RoO1xuICAgICAgICAgIChjYWNoZSB8fCBzZWVuKS5wdXNoKHZhbHVlKTtcbiAgICAgICAgICB3aGlsZSAoLS1hcmdzSW5kZXgpIHtcbiAgICAgICAgICAgIGNhY2hlID0gY2FjaGVzW2FyZ3NJbmRleF07XG4gICAgICAgICAgICBpZiAoKGNhY2hlID8gY2FjaGVJbmRleE9mKGNhY2hlLCB2YWx1ZSkgOiBpbmRleE9mKGFyZ3NbYXJnc0luZGV4XSwgdmFsdWUpKSA8IDApIHtcbiAgICAgICAgICAgICAgY29udGludWUgb3V0ZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgd2hpbGUgKGFyZ3NMZW5ndGgtLSkge1xuICAgICAgICBjYWNoZSA9IGNhY2hlc1thcmdzTGVuZ3RoXTtcbiAgICAgICAgaWYgKGNhY2hlKSB7XG4gICAgICAgICAgcmVsZWFzZU9iamVjdChjYWNoZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlbGVhc2VBcnJheShjYWNoZXMpO1xuICAgICAgcmVsZWFzZUFycmF5KHNlZW4pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBsYXN0IGVsZW1lbnQgb3IgbGFzdCBgbmAgZWxlbWVudHMgb2YgYW4gYXJyYXkuIElmIGEgY2FsbGJhY2sgaXNcbiAgICAgKiBwcm92aWRlZCBlbGVtZW50cyBhdCB0aGUgZW5kIG9mIHRoZSBhcnJheSBhcmUgcmV0dXJuZWQgYXMgbG9uZyBhcyB0aGVcbiAgICAgKiBjYWxsYmFjayByZXR1cm5zIHRydWV5LiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZCBpbnZva2VkXG4gICAgICogd2l0aCB0aHJlZSBhcmd1bWVudHM7ICh2YWx1ZSwgaW5kZXgsIGFycmF5KS5cbiAgICAgKlxuICAgICAqIElmIGEgcHJvcGVydHkgbmFtZSBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ucGx1Y2tcIiBzdHlsZVxuICAgICAqIGNhbGxiYWNrIHdpbGwgcmV0dXJuIHRoZSBwcm9wZXJ0eSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKlxuICAgICAqIElmIGFuIG9iamVjdCBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFja1xuICAgICAqIHdpbGwgcmV0dXJuIGB0cnVlYCBmb3IgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBnaXZlbiBvYmplY3QsXG4gICAgICogZWxzZSBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEFycmF5c1xuICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBxdWVyeS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdHxudW1iZXJ8c3RyaW5nfSBbY2FsbGJhY2tdIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGVsZW1lbnQgb3IgdGhlIG51bWJlciBvZiBlbGVtZW50cyB0byByZXR1cm4uIElmIGEgcHJvcGVydHkgbmFtZSBvclxuICAgICAqICBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiXG4gICAgICogIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGxhc3QgZWxlbWVudChzKSBvZiBgYXJyYXlgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmxhc3QoWzEsIDIsIDNdKTtcbiAgICAgKiAvLyA9PiAzXG4gICAgICpcbiAgICAgKiBfLmxhc3QoWzEsIDIsIDNdLCAyKTtcbiAgICAgKiAvLyA9PiBbMiwgM11cbiAgICAgKlxuICAgICAqIF8ubGFzdChbMSwgMiwgM10sIGZ1bmN0aW9uKG51bSkge1xuICAgICAqICAgcmV0dXJuIG51bSA+IDE7XG4gICAgICogfSk7XG4gICAgICogLy8gPT4gWzIsIDNdXG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgICdibG9ja2VkJzogZmFsc2UsICdlbXBsb3llcic6ICdzbGF0ZScgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgICdibG9ja2VkJzogdHJ1ZSwgICdlbXBsb3llcic6ICdzbGF0ZScgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAncGViYmxlcycsICdibG9ja2VkJzogdHJ1ZSwgICdlbXBsb3llcic6ICduYScgfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ucGx1Y2tcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLnBsdWNrKF8ubGFzdChjaGFyYWN0ZXJzLCAnYmxvY2tlZCcpLCAnbmFtZScpO1xuICAgICAqIC8vID0+IFsnZnJlZCcsICdwZWJibGVzJ11cbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy53aGVyZVwiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8ubGFzdChjaGFyYWN0ZXJzLCB7ICdlbXBsb3llcic6ICduYScgfSk7XG4gICAgICogLy8gPT4gW3sgJ25hbWUnOiAncGViYmxlcycsICdibG9ja2VkJzogdHJ1ZSwgJ2VtcGxveWVyJzogJ25hJyB9XVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGxhc3QoYXJyYXksIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgbiA9IDAsXG4gICAgICAgICAgbGVuZ3RoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwO1xuXG4gICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9ICdudW1iZXInICYmIGNhbGxiYWNrICE9IG51bGwpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gbGVuZ3RoO1xuICAgICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICAgIHdoaWxlIChpbmRleC0tICYmIGNhbGxiYWNrKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KSkge1xuICAgICAgICAgIG4rKztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbiA9IGNhbGxiYWNrO1xuICAgICAgICBpZiAobiA9PSBudWxsIHx8IHRoaXNBcmcpIHtcbiAgICAgICAgICByZXR1cm4gYXJyYXkgPyBhcnJheVtsZW5ndGggLSAxXSA6IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHNsaWNlKGFycmF5LCBuYXRpdmVNYXgoMCwgbGVuZ3RoIC0gbikpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGluZGV4IGF0IHdoaWNoIHRoZSBsYXN0IG9jY3VycmVuY2Ugb2YgYHZhbHVlYCBpcyBmb3VuZCB1c2luZyBzdHJpY3RcbiAgICAgKiBlcXVhbGl0eSBmb3IgY29tcGFyaXNvbnMsIGkuZS4gYD09PWAuIElmIGBmcm9tSW5kZXhgIGlzIG5lZ2F0aXZlLCBpdCBpcyB1c2VkXG4gICAgICogYXMgdGhlIG9mZnNldCBmcm9tIHRoZSBlbmQgb2YgdGhlIGNvbGxlY3Rpb24uXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gc2VhcmNoLlxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNlYXJjaCBmb3IuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtmcm9tSW5kZXg9YXJyYXkubGVuZ3RoLTFdIFRoZSBpbmRleCB0byBzZWFyY2ggZnJvbS5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgbWF0Y2hlZCB2YWx1ZSBvciBgLTFgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmxhc3RJbmRleE9mKFsxLCAyLCAzLCAxLCAyLCAzXSwgMik7XG4gICAgICogLy8gPT4gNFxuICAgICAqXG4gICAgICogXy5sYXN0SW5kZXhPZihbMSwgMiwgMywgMSwgMiwgM10sIDIsIDMpO1xuICAgICAqIC8vID0+IDFcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBsYXN0SW5kZXhPZihhcnJheSwgdmFsdWUsIGZyb21JbmRleCkge1xuICAgICAgdmFyIGluZGV4ID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwO1xuICAgICAgaWYgKHR5cGVvZiBmcm9tSW5kZXggPT0gJ251bWJlcicpIHtcbiAgICAgICAgaW5kZXggPSAoZnJvbUluZGV4IDwgMCA/IG5hdGl2ZU1heCgwLCBpbmRleCArIGZyb21JbmRleCkgOiBuYXRpdmVNaW4oZnJvbUluZGV4LCBpbmRleCAtIDEpKSArIDE7XG4gICAgICB9XG4gICAgICB3aGlsZSAoaW5kZXgtLSkge1xuICAgICAgICBpZiAoYXJyYXlbaW5kZXhdID09PSB2YWx1ZSkge1xuICAgICAgICAgIHJldHVybiBpbmRleDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIHByb3ZpZGVkIHZhbHVlcyBmcm9tIHRoZSBnaXZlbiBhcnJheSB1c2luZyBzdHJpY3QgZXF1YWxpdHkgZm9yXG4gICAgICogY29tcGFyaXNvbnMsIGkuZS4gYD09PWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQXJyYXlzXG4gICAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIG1vZGlmeS5cbiAgICAgKiBAcGFyYW0gey4uLip9IFt2YWx1ZV0gVGhlIHZhbHVlcyB0byByZW1vdmUuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGBhcnJheWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBhcnJheSA9IFsxLCAyLCAzLCAxLCAyLCAzXTtcbiAgICAgKiBfLnB1bGwoYXJyYXksIDIsIDMpO1xuICAgICAqIGNvbnNvbGUubG9nKGFycmF5KTtcbiAgICAgKiAvLyA9PiBbMSwgMV1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBwdWxsKGFycmF5KSB7XG4gICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgICBhcmdzSW5kZXggPSAwLFxuICAgICAgICAgIGFyZ3NMZW5ndGggPSBhcmdzLmxlbmd0aCxcbiAgICAgICAgICBsZW5ndGggPSBhcnJheSA/IGFycmF5Lmxlbmd0aCA6IDA7XG5cbiAgICAgIHdoaWxlICgrK2FyZ3NJbmRleCA8IGFyZ3NMZW5ndGgpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgICB2YWx1ZSA9IGFyZ3NbYXJnc0luZGV4XTtcbiAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICBpZiAoYXJyYXlbaW5kZXhdID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgc3BsaWNlLmNhbGwoYXJyYXksIGluZGV4LS0sIDEpO1xuICAgICAgICAgICAgbGVuZ3RoLS07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gYXJyYXk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhcnJheSBvZiBudW1iZXJzIChwb3NpdGl2ZSBhbmQvb3IgbmVnYXRpdmUpIHByb2dyZXNzaW5nIGZyb21cbiAgICAgKiBgc3RhcnRgIHVwIHRvIGJ1dCBub3QgaW5jbHVkaW5nIGBlbmRgLiBJZiBgc3RhcnRgIGlzIGxlc3MgdGhhbiBgc3RvcGAgYVxuICAgICAqIHplcm8tbGVuZ3RoIHJhbmdlIGlzIGNyZWF0ZWQgdW5sZXNzIGEgbmVnYXRpdmUgYHN0ZXBgIGlzIHNwZWNpZmllZC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3N0YXJ0PTBdIFRoZSBzdGFydCBvZiB0aGUgcmFuZ2UuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGVuZCBUaGUgZW5kIG9mIHRoZSByYW5nZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3N0ZXA9MV0gVGhlIHZhbHVlIHRvIGluY3JlbWVudCBvciBkZWNyZW1lbnQgYnkuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGEgbmV3IHJhbmdlIGFycmF5LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLnJhbmdlKDQpO1xuICAgICAqIC8vID0+IFswLCAxLCAyLCAzXVxuICAgICAqXG4gICAgICogXy5yYW5nZSgxLCA1KTtcbiAgICAgKiAvLyA9PiBbMSwgMiwgMywgNF1cbiAgICAgKlxuICAgICAqIF8ucmFuZ2UoMCwgMjAsIDUpO1xuICAgICAqIC8vID0+IFswLCA1LCAxMCwgMTVdXG4gICAgICpcbiAgICAgKiBfLnJhbmdlKDAsIC00LCAtMSk7XG4gICAgICogLy8gPT4gWzAsIC0xLCAtMiwgLTNdXG4gICAgICpcbiAgICAgKiBfLnJhbmdlKDEsIDQsIDApO1xuICAgICAqIC8vID0+IFsxLCAxLCAxXVxuICAgICAqXG4gICAgICogXy5yYW5nZSgwKTtcbiAgICAgKiAvLyA9PiBbXVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJhbmdlKHN0YXJ0LCBlbmQsIHN0ZXApIHtcbiAgICAgIHN0YXJ0ID0gK3N0YXJ0IHx8IDA7XG4gICAgICBzdGVwID0gdHlwZW9mIHN0ZXAgPT0gJ251bWJlcicgPyBzdGVwIDogKCtzdGVwIHx8IDEpO1xuXG4gICAgICBpZiAoZW5kID09IG51bGwpIHtcbiAgICAgICAgZW5kID0gc3RhcnQ7XG4gICAgICAgIHN0YXJ0ID0gMDtcbiAgICAgIH1cbiAgICAgIC8vIHVzZSBgQXJyYXkobGVuZ3RoKWAgc28gZW5naW5lcyBsaWtlIENoYWtyYSBhbmQgVjggYXZvaWQgc2xvd2VyIG1vZGVzXG4gICAgICAvLyBodHRwOi8veW91dHUuYmUvWEFxSXBHVThaWmsjdD0xN20yNXNcbiAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgIGxlbmd0aCA9IG5hdGl2ZU1heCgwLCBjZWlsKChlbmQgLSBzdGFydCkgLyAoc3RlcCB8fCAxKSkpLFxuICAgICAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSBzdGFydDtcbiAgICAgICAgc3RhcnQgKz0gc3RlcDtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgZWxlbWVudHMgZnJvbSBhbiBhcnJheSB0aGF0IHRoZSBjYWxsYmFjayByZXR1cm5zIHRydWV5IGZvclxuICAgICAqIGFuZCByZXR1cm5zIGFuIGFycmF5IG9mIHJlbW92ZWQgZWxlbWVudHMuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2BcbiAgICAgKiBhbmQgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50czsgKHZhbHVlLCBpbmRleCwgYXJyYXkpLlxuICAgICAqXG4gICAgICogSWYgYSBwcm9wZXJ0eSBuYW1lIGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy5wbHVja1wiIHN0eWxlXG4gICAgICogY2FsbGJhY2sgd2lsbCByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrXG4gICAgICogd2lsbCByZXR1cm4gYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuIG9iamVjdCxcbiAgICAgKiBlbHNlIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQXJyYXlzXG4gICAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIG1vZGlmeS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdHxzdHJpbmd9IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZFxuICAgICAqICBwZXIgaXRlcmF0aW9uLiBJZiBhIHByb3BlcnR5IG5hbWUgb3Igb2JqZWN0IGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgdXNlZFxuICAgICAqICB0byBjcmVhdGUgYSBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFjaywgcmVzcGVjdGl2ZWx5LlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhIG5ldyBhcnJheSBvZiByZW1vdmVkIGVsZW1lbnRzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgYXJyYXkgPSBbMSwgMiwgMywgNCwgNSwgNl07XG4gICAgICogdmFyIGV2ZW5zID0gXy5yZW1vdmUoYXJyYXksIGZ1bmN0aW9uKG51bSkgeyByZXR1cm4gbnVtICUgMiA9PSAwOyB9KTtcbiAgICAgKlxuICAgICAqIGNvbnNvbGUubG9nKGFycmF5KTtcbiAgICAgKiAvLyA9PiBbMSwgMywgNV1cbiAgICAgKlxuICAgICAqIGNvbnNvbGUubG9nKGV2ZW5zKTtcbiAgICAgKiAvLyA9PiBbMiwgNCwgNl1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZW1vdmUoYXJyYXksIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBsZW5ndGggPSBhcnJheSA/IGFycmF5Lmxlbmd0aCA6IDAsXG4gICAgICAgICAgcmVzdWx0ID0gW107XG5cbiAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGFycmF5W2luZGV4XTtcbiAgICAgICAgaWYgKGNhbGxiYWNrKHZhbHVlLCBpbmRleCwgYXJyYXkpKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgICAgIHNwbGljZS5jYWxsKGFycmF5LCBpbmRleC0tLCAxKTtcbiAgICAgICAgICBsZW5ndGgtLTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgb3Bwb3NpdGUgb2YgYF8uaW5pdGlhbGAgdGhpcyBtZXRob2QgZ2V0cyBhbGwgYnV0IHRoZSBmaXJzdCBlbGVtZW50IG9yXG4gICAgICogZmlyc3QgYG5gIGVsZW1lbnRzIG9mIGFuIGFycmF5LiBJZiBhIGNhbGxiYWNrIGZ1bmN0aW9uIGlzIHByb3ZpZGVkIGVsZW1lbnRzXG4gICAgICogYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXkgYXJlIGV4Y2x1ZGVkIGZyb20gdGhlIHJlc3VsdCBhcyBsb25nIGFzIHRoZVxuICAgICAqIGNhbGxiYWNrIHJldHVybnMgdHJ1ZXkuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWRcbiAgICAgKiB3aXRoIHRocmVlIGFyZ3VtZW50czsgKHZhbHVlLCBpbmRleCwgYXJyYXkpLlxuICAgICAqXG4gICAgICogSWYgYSBwcm9wZXJ0eSBuYW1lIGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy5wbHVja1wiIHN0eWxlXG4gICAgICogY2FsbGJhY2sgd2lsbCByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrXG4gICAgICogd2lsbCByZXR1cm4gYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuIG9iamVjdCxcbiAgICAgKiBlbHNlIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAYWxpYXMgZHJvcCwgdGFpbFxuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gcXVlcnkuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8bnVtYmVyfHN0cmluZ30gW2NhbGxiYWNrPTFdIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGVsZW1lbnQgb3IgdGhlIG51bWJlciBvZiBlbGVtZW50cyB0byBleGNsdWRlLiBJZiBhIHByb3BlcnR5IG5hbWUgb3JcbiAgICAgKiAgb2JqZWN0IGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgdXNlZCB0byBjcmVhdGUgYSBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIlxuICAgICAqICBzdHlsZSBjYWxsYmFjaywgcmVzcGVjdGl2ZWx5LlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhIHNsaWNlIG9mIGBhcnJheWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8ucmVzdChbMSwgMiwgM10pO1xuICAgICAqIC8vID0+IFsyLCAzXVxuICAgICAqXG4gICAgICogXy5yZXN0KFsxLCAyLCAzXSwgMik7XG4gICAgICogLy8gPT4gWzNdXG4gICAgICpcbiAgICAgKiBfLnJlc3QoWzEsIDIsIDNdLCBmdW5jdGlvbihudW0pIHtcbiAgICAgKiAgIHJldHVybiBudW0gPCAzO1xuICAgICAqIH0pO1xuICAgICAqIC8vID0+IFszXVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSBbXG4gICAgICogICB7ICduYW1lJzogJ2Jhcm5leScsICAnYmxvY2tlZCc6IHRydWUsICAnZW1wbG95ZXInOiAnc2xhdGUnIH0sXG4gICAgICogICB7ICduYW1lJzogJ2ZyZWQnLCAgICAnYmxvY2tlZCc6IGZhbHNlLCAgJ2VtcGxveWVyJzogJ3NsYXRlJyB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdwZWJibGVzJywgJ2Jsb2NrZWQnOiB0cnVlLCAnZW1wbG95ZXInOiAnbmEnIH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLnBsdWNrXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5wbHVjayhfLnJlc3QoY2hhcmFjdGVycywgJ2Jsb2NrZWQnKSwgJ25hbWUnKTtcbiAgICAgKiAvLyA9PiBbJ2ZyZWQnLCAncGViYmxlcyddXG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ud2hlcmVcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLnJlc3QoY2hhcmFjdGVycywgeyAnZW1wbG95ZXInOiAnc2xhdGUnIH0pO1xuICAgICAqIC8vID0+IFt7ICduYW1lJzogJ3BlYmJsZXMnLCAnYmxvY2tlZCc6IHRydWUsICdlbXBsb3llcic6ICduYScgfV1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZXN0KGFycmF5LCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPSAnbnVtYmVyJyAmJiBjYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICAgIHZhciBuID0gMCxcbiAgICAgICAgICAgIGluZGV4ID0gLTEsXG4gICAgICAgICAgICBsZW5ndGggPSBhcnJheSA/IGFycmF5Lmxlbmd0aCA6IDA7XG5cbiAgICAgICAgY2FsbGJhY2sgPSBsb2Rhc2guY3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDMpO1xuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCAmJiBjYWxsYmFjayhhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSkpIHtcbiAgICAgICAgICBuKys7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG4gPSAoY2FsbGJhY2sgPT0gbnVsbCB8fCB0aGlzQXJnKSA/IDEgOiBuYXRpdmVNYXgoMCwgY2FsbGJhY2spO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNsaWNlKGFycmF5LCBuKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVc2VzIGEgYmluYXJ5IHNlYXJjaCB0byBkZXRlcm1pbmUgdGhlIHNtYWxsZXN0IGluZGV4IGF0IHdoaWNoIGEgdmFsdWVcbiAgICAgKiBzaG91bGQgYmUgaW5zZXJ0ZWQgaW50byBhIGdpdmVuIHNvcnRlZCBhcnJheSBpbiBvcmRlciB0byBtYWludGFpbiB0aGUgc29ydFxuICAgICAqIG9yZGVyIG9mIHRoZSBhcnJheS4gSWYgYSBjYWxsYmFjayBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIGV4ZWN1dGVkIGZvclxuICAgICAqIGB2YWx1ZWAgYW5kIGVhY2ggZWxlbWVudCBvZiBgYXJyYXlgIHRvIGNvbXB1dGUgdGhlaXIgc29ydCByYW5raW5nLiBUaGVcbiAgICAgKiBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aCBvbmUgYXJndW1lbnQ7ICh2YWx1ZSkuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaW5zcGVjdC5cbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBldmFsdWF0ZS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdHxzdHJpbmd9IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZFxuICAgICAqICBwZXIgaXRlcmF0aW9uLiBJZiBhIHByb3BlcnR5IG5hbWUgb3Igb2JqZWN0IGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgdXNlZFxuICAgICAqICB0byBjcmVhdGUgYSBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFjaywgcmVzcGVjdGl2ZWx5LlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGluZGV4IGF0IHdoaWNoIGB2YWx1ZWAgc2hvdWxkIGJlIGluc2VydGVkXG4gICAgICogIGludG8gYGFycmF5YC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5zb3J0ZWRJbmRleChbMjAsIDMwLCA1MF0sIDQwKTtcbiAgICAgKiAvLyA9PiAyXG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ucGx1Y2tcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLnNvcnRlZEluZGV4KFt7ICd4JzogMjAgfSwgeyAneCc6IDMwIH0sIHsgJ3gnOiA1MCB9XSwgeyAneCc6IDQwIH0sICd4Jyk7XG4gICAgICogLy8gPT4gMlxuICAgICAqXG4gICAgICogdmFyIGRpY3QgPSB7XG4gICAgICogICAnd29yZFRvTnVtYmVyJzogeyAndHdlbnR5JzogMjAsICd0aGlydHknOiAzMCwgJ2ZvdXJ0eSc6IDQwLCAnZmlmdHknOiA1MCB9XG4gICAgICogfTtcbiAgICAgKlxuICAgICAqIF8uc29ydGVkSW5kZXgoWyd0d2VudHknLCAndGhpcnR5JywgJ2ZpZnR5J10sICdmb3VydHknLCBmdW5jdGlvbih3b3JkKSB7XG4gICAgICogICByZXR1cm4gZGljdC53b3JkVG9OdW1iZXJbd29yZF07XG4gICAgICogfSk7XG4gICAgICogLy8gPT4gMlxuICAgICAqXG4gICAgICogXy5zb3J0ZWRJbmRleChbJ3R3ZW50eScsICd0aGlydHknLCAnZmlmdHknXSwgJ2ZvdXJ0eScsIGZ1bmN0aW9uKHdvcmQpIHtcbiAgICAgKiAgIHJldHVybiB0aGlzLndvcmRUb051bWJlclt3b3JkXTtcbiAgICAgKiB9LCBkaWN0KTtcbiAgICAgKiAvLyA9PiAyXG4gICAgICovXG4gICAgZnVuY3Rpb24gc29ydGVkSW5kZXgoYXJyYXksIHZhbHVlLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIGxvdyA9IDAsXG4gICAgICAgICAgaGlnaCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogbG93O1xuXG4gICAgICAvLyBleHBsaWNpdGx5IHJlZmVyZW5jZSBgaWRlbnRpdHlgIGZvciBiZXR0ZXIgaW5saW5pbmcgaW4gRmlyZWZveFxuICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayA/IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMSkgOiBpZGVudGl0eTtcbiAgICAgIHZhbHVlID0gY2FsbGJhY2sodmFsdWUpO1xuXG4gICAgICB3aGlsZSAobG93IDwgaGlnaCkge1xuICAgICAgICB2YXIgbWlkID0gKGxvdyArIGhpZ2gpID4+PiAxO1xuICAgICAgICAoY2FsbGJhY2soYXJyYXlbbWlkXSkgPCB2YWx1ZSlcbiAgICAgICAgICA/IGxvdyA9IG1pZCArIDFcbiAgICAgICAgICA6IGhpZ2ggPSBtaWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gbG93O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdW5pcXVlIHZhbHVlcywgaW4gb3JkZXIsIG9mIHRoZSBwcm92aWRlZCBhcnJheXMgdXNpbmdcbiAgICAgKiBzdHJpY3QgZXF1YWxpdHkgZm9yIGNvbXBhcmlzb25zLCBpLmUuIGA9PT1gLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEFycmF5c1xuICAgICAqIEBwYXJhbSB7Li4uQXJyYXl9IFthcnJheV0gVGhlIGFycmF5cyB0byBpbnNwZWN0LlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhbiBhcnJheSBvZiBjb21iaW5lZCB2YWx1ZXMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8udW5pb24oWzEsIDIsIDNdLCBbNSwgMiwgMSwgNF0sIFsyLCAxXSk7XG4gICAgICogLy8gPT4gWzEsIDIsIDMsIDUsIDRdXG4gICAgICovXG4gICAgZnVuY3Rpb24gdW5pb24oKSB7XG4gICAgICByZXR1cm4gYmFzZVVuaXEoYmFzZUZsYXR0ZW4oYXJndW1lbnRzLCB0cnVlLCB0cnVlKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGR1cGxpY2F0ZS12YWx1ZS1mcmVlIHZlcnNpb24gb2YgYW4gYXJyYXkgdXNpbmcgc3RyaWN0IGVxdWFsaXR5XG4gICAgICogZm9yIGNvbXBhcmlzb25zLCBpLmUuIGA9PT1gLiBJZiB0aGUgYXJyYXkgaXMgc29ydGVkLCBwcm92aWRpbmdcbiAgICAgKiBgdHJ1ZWAgZm9yIGBpc1NvcnRlZGAgd2lsbCB1c2UgYSBmYXN0ZXIgYWxnb3JpdGhtLiBJZiBhIGNhbGxiYWNrIGlzIHByb3ZpZGVkXG4gICAgICogZWFjaCBlbGVtZW50IG9mIGBhcnJheWAgaXMgcGFzc2VkIHRocm91Z2ggdGhlIGNhbGxiYWNrIGJlZm9yZSB1bmlxdWVuZXNzXG4gICAgICogaXMgY29tcHV0ZWQuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aCB0aHJlZVxuICAgICAqIGFyZ3VtZW50czsgKHZhbHVlLCBpbmRleCwgYXJyYXkpLlxuICAgICAqXG4gICAgICogSWYgYSBwcm9wZXJ0eSBuYW1lIGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy5wbHVja1wiIHN0eWxlXG4gICAgICogY2FsbGJhY2sgd2lsbCByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrXG4gICAgICogd2lsbCByZXR1cm4gYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuIG9iamVjdCxcbiAgICAgKiBlbHNlIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAYWxpYXMgdW5pcXVlXG4gICAgICogQGNhdGVnb3J5IEFycmF5c1xuICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBwcm9jZXNzLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzU29ydGVkPWZhbHNlXSBBIGZsYWcgdG8gaW5kaWNhdGUgdGhhdCBgYXJyYXlgIGlzIHNvcnRlZC5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdHxzdHJpbmd9IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZFxuICAgICAqICBwZXIgaXRlcmF0aW9uLiBJZiBhIHByb3BlcnR5IG5hbWUgb3Igb2JqZWN0IGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgdXNlZFxuICAgICAqICB0byBjcmVhdGUgYSBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFjaywgcmVzcGVjdGl2ZWx5LlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhIGR1cGxpY2F0ZS12YWx1ZS1mcmVlIGFycmF5LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLnVuaXEoWzEsIDIsIDEsIDMsIDFdKTtcbiAgICAgKiAvLyA9PiBbMSwgMiwgM11cbiAgICAgKlxuICAgICAqIF8udW5pcShbMSwgMSwgMiwgMiwgM10sIHRydWUpO1xuICAgICAqIC8vID0+IFsxLCAyLCAzXVxuICAgICAqXG4gICAgICogXy51bmlxKFsnQScsICdiJywgJ0MnLCAnYScsICdCJywgJ2MnXSwgZnVuY3Rpb24obGV0dGVyKSB7IHJldHVybiBsZXR0ZXIudG9Mb3dlckNhc2UoKTsgfSk7XG4gICAgICogLy8gPT4gWydBJywgJ2InLCAnQyddXG4gICAgICpcbiAgICAgKiBfLnVuaXEoWzEsIDIuNSwgMywgMS41LCAyLCAzLjVdLCBmdW5jdGlvbihudW0pIHsgcmV0dXJuIHRoaXMuZmxvb3IobnVtKTsgfSwgTWF0aCk7XG4gICAgICogLy8gPT4gWzEsIDIuNSwgM11cbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy5wbHVja1wiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8udW5pcShbeyAneCc6IDEgfSwgeyAneCc6IDIgfSwgeyAneCc6IDEgfV0sICd4Jyk7XG4gICAgICogLy8gPT4gW3sgJ3gnOiAxIH0sIHsgJ3gnOiAyIH1dXG4gICAgICovXG4gICAgZnVuY3Rpb24gdW5pcShhcnJheSwgaXNTb3J0ZWQsIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICAvLyBqdWdnbGUgYXJndW1lbnRzXG4gICAgICBpZiAodHlwZW9mIGlzU29ydGVkICE9ICdib29sZWFuJyAmJiBpc1NvcnRlZCAhPSBudWxsKSB7XG4gICAgICAgIHRoaXNBcmcgPSBjYWxsYmFjaztcbiAgICAgICAgY2FsbGJhY2sgPSAodHlwZW9mIGlzU29ydGVkICE9ICdmdW5jdGlvbicgJiYgdGhpc0FyZyAmJiB0aGlzQXJnW2lzU29ydGVkXSA9PT0gYXJyYXkpID8gbnVsbCA6IGlzU29ydGVkO1xuICAgICAgICBpc1NvcnRlZCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKGNhbGxiYWNrICE9IG51bGwpIHtcbiAgICAgICAgY2FsbGJhY2sgPSBsb2Rhc2guY3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJhc2VVbmlxKGFycmF5LCBpc1NvcnRlZCwgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gYXJyYXkgZXhjbHVkaW5nIGFsbCBwcm92aWRlZCB2YWx1ZXMgdXNpbmcgc3RyaWN0IGVxdWFsaXR5IGZvclxuICAgICAqIGNvbXBhcmlzb25zLCBpLmUuIGA9PT1gLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEFycmF5c1xuICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBmaWx0ZXIuXG4gICAgICogQHBhcmFtIHsuLi4qfSBbdmFsdWVdIFRoZSB2YWx1ZXMgdG8gZXhjbHVkZS5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYSBuZXcgYXJyYXkgb2YgZmlsdGVyZWQgdmFsdWVzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLndpdGhvdXQoWzEsIDIsIDEsIDAsIDMsIDEsIDRdLCAwLCAxKTtcbiAgICAgKiAvLyA9PiBbMiwgMywgNF1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB3aXRob3V0KGFycmF5KSB7XG4gICAgICByZXR1cm4gYmFzZURpZmZlcmVuY2UoYXJyYXksIHNsaWNlKGFyZ3VtZW50cywgMSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gYXJyYXkgdGhhdCBpcyB0aGUgc3ltbWV0cmljIGRpZmZlcmVuY2Ugb2YgdGhlIHByb3ZpZGVkIGFycmF5cy5cbiAgICAgKiBTZWUgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TeW1tZXRyaWNfZGlmZmVyZW5jZS5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0gey4uLkFycmF5fSBbYXJyYXldIFRoZSBhcnJheXMgdG8gaW5zcGVjdC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYW4gYXJyYXkgb2YgdmFsdWVzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLnhvcihbMSwgMiwgM10sIFs1LCAyLCAxLCA0XSk7XG4gICAgICogLy8gPT4gWzMsIDUsIDRdXG4gICAgICpcbiAgICAgKiBfLnhvcihbMSwgMiwgNV0sIFsyLCAzLCA1XSwgWzMsIDQsIDVdKTtcbiAgICAgKiAvLyA9PiBbMSwgNCwgNV1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB4b3IoKSB7XG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuXG4gICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICB2YXIgYXJyYXkgPSBhcmd1bWVudHNbaW5kZXhdO1xuICAgICAgICBpZiAoaXNBcnJheShhcnJheSkgfHwgaXNBcmd1bWVudHMoYXJyYXkpKSB7XG4gICAgICAgICAgdmFyIHJlc3VsdCA9IHJlc3VsdFxuICAgICAgICAgICAgPyBiYXNlVW5pcShiYXNlRGlmZmVyZW5jZShyZXN1bHQsIGFycmF5KS5jb25jYXQoYmFzZURpZmZlcmVuY2UoYXJyYXksIHJlc3VsdCkpKVxuICAgICAgICAgICAgOiBhcnJheTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdCB8fCBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGFycmF5IG9mIGdyb3VwZWQgZWxlbWVudHMsIHRoZSBmaXJzdCBvZiB3aGljaCBjb250YWlucyB0aGUgZmlyc3RcbiAgICAgKiBlbGVtZW50cyBvZiB0aGUgZ2l2ZW4gYXJyYXlzLCB0aGUgc2Vjb25kIG9mIHdoaWNoIGNvbnRhaW5zIHRoZSBzZWNvbmRcbiAgICAgKiBlbGVtZW50cyBvZiB0aGUgZ2l2ZW4gYXJyYXlzLCBhbmQgc28gb24uXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAYWxpYXMgdW56aXBcbiAgICAgKiBAY2F0ZWdvcnkgQXJyYXlzXG4gICAgICogQHBhcmFtIHsuLi5BcnJheX0gW2FycmF5XSBBcnJheXMgdG8gcHJvY2Vzcy5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYSBuZXcgYXJyYXkgb2YgZ3JvdXBlZCBlbGVtZW50cy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy56aXAoWydmcmVkJywgJ2Jhcm5leSddLCBbMzAsIDQwXSwgW3RydWUsIGZhbHNlXSk7XG4gICAgICogLy8gPT4gW1snZnJlZCcsIDMwLCB0cnVlXSwgWydiYXJuZXknLCA0MCwgZmFsc2VdXVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHppcCgpIHtcbiAgICAgIHZhciBhcnJheSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzIDogYXJndW1lbnRzWzBdLFxuICAgICAgICAgIGluZGV4ID0gLTEsXG4gICAgICAgICAgbGVuZ3RoID0gYXJyYXkgPyBtYXgocGx1Y2soYXJyYXksICdsZW5ndGgnKSkgOiAwLFxuICAgICAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCA8IDAgPyAwIDogbGVuZ3RoKTtcblxuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgcmVzdWx0W2luZGV4XSA9IHBsdWNrKGFycmF5LCBpbmRleCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gb2JqZWN0IGNvbXBvc2VkIGZyb20gYXJyYXlzIG9mIGBrZXlzYCBhbmQgYHZhbHVlc2AuIFByb3ZpZGVcbiAgICAgKiBlaXRoZXIgYSBzaW5nbGUgdHdvIGRpbWVuc2lvbmFsIGFycmF5LCBpLmUuIGBbW2tleTEsIHZhbHVlMV0sIFtrZXkyLCB2YWx1ZTJdXWBcbiAgICAgKiBvciB0d28gYXJyYXlzLCBvbmUgb2YgYGtleXNgIGFuZCBvbmUgb2YgY29ycmVzcG9uZGluZyBgdmFsdWVzYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBhbGlhcyBvYmplY3RcbiAgICAgKiBAY2F0ZWdvcnkgQXJyYXlzXG4gICAgICogQHBhcmFtIHtBcnJheX0ga2V5cyBUaGUgYXJyYXkgb2Yga2V5cy5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBbdmFsdWVzPVtdXSBUaGUgYXJyYXkgb2YgdmFsdWVzLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYW4gb2JqZWN0IGNvbXBvc2VkIG9mIHRoZSBnaXZlbiBrZXlzIGFuZFxuICAgICAqICBjb3JyZXNwb25kaW5nIHZhbHVlcy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy56aXBPYmplY3QoWydmcmVkJywgJ2Jhcm5leSddLCBbMzAsIDQwXSk7XG4gICAgICogLy8gPT4geyAnZnJlZCc6IDMwLCAnYmFybmV5JzogNDAgfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHppcE9iamVjdChrZXlzLCB2YWx1ZXMpIHtcbiAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgIGxlbmd0aCA9IGtleXMgPyBrZXlzLmxlbmd0aCA6IDAsXG4gICAgICAgICAgcmVzdWx0ID0ge307XG5cbiAgICAgIGlmICghdmFsdWVzICYmIGxlbmd0aCAmJiAhaXNBcnJheShrZXlzWzBdKSkge1xuICAgICAgICB2YWx1ZXMgPSBbXTtcbiAgICAgIH1cbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIHZhciBrZXkgPSBrZXlzW2luZGV4XTtcbiAgICAgICAgaWYgKHZhbHVlcykge1xuICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsdWVzW2luZGV4XTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkpIHtcbiAgICAgICAgICByZXN1bHRba2V5WzBdXSA9IGtleVsxXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IGV4ZWN1dGVzIGBmdW5jYCwgd2l0aCAgdGhlIGB0aGlzYCBiaW5kaW5nIGFuZFxuICAgICAqIGFyZ3VtZW50cyBvZiB0aGUgY3JlYXRlZCBmdW5jdGlvbiwgb25seSBhZnRlciBiZWluZyBjYWxsZWQgYG5gIHRpbWVzLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBuIFRoZSBudW1iZXIgb2YgdGltZXMgdGhlIGZ1bmN0aW9uIG11c3QgYmUgY2FsbGVkIGJlZm9yZVxuICAgICAqICBgZnVuY2AgaXMgZXhlY3V0ZWQuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gcmVzdHJpY3QuXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgcmVzdHJpY3RlZCBmdW5jdGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIHNhdmVzID0gWydwcm9maWxlJywgJ3NldHRpbmdzJ107XG4gICAgICpcbiAgICAgKiB2YXIgZG9uZSA9IF8uYWZ0ZXIoc2F2ZXMubGVuZ3RoLCBmdW5jdGlvbigpIHtcbiAgICAgKiAgIGNvbnNvbGUubG9nKCdEb25lIHNhdmluZyEnKTtcbiAgICAgKiB9KTtcbiAgICAgKlxuICAgICAqIF8uZm9yRWFjaChzYXZlcywgZnVuY3Rpb24odHlwZSkge1xuICAgICAqICAgYXN5bmNTYXZlKHsgJ3R5cGUnOiB0eXBlLCAnY29tcGxldGUnOiBkb25lIH0pO1xuICAgICAqIH0pO1xuICAgICAqIC8vID0+IGxvZ3MgJ0RvbmUgc2F2aW5nIScsIGFmdGVyIGFsbCBzYXZlcyBoYXZlIGNvbXBsZXRlZFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGFmdGVyKG4sIGZ1bmMpIHtcbiAgICAgIGlmICghaXNGdW5jdGlvbihmdW5jKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoLS1uIDwgMSkge1xuICAgICAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLCBpbnZva2VzIGBmdW5jYCB3aXRoIHRoZSBgdGhpc2BcbiAgICAgKiBiaW5kaW5nIG9mIGB0aGlzQXJnYCBhbmQgcHJlcGVuZHMgYW55IGFkZGl0aW9uYWwgYGJpbmRgIGFyZ3VtZW50cyB0byB0aG9zZVxuICAgICAqIHByb3ZpZGVkIHRvIHRoZSBib3VuZCBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvbnNcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBiaW5kLlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgZnVuY2AuXG4gICAgICogQHBhcmFtIHsuLi4qfSBbYXJnXSBBcmd1bWVudHMgdG8gYmUgcGFydGlhbGx5IGFwcGxpZWQuXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYm91bmQgZnVuY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBmdW5jID0gZnVuY3Rpb24oZ3JlZXRpbmcpIHtcbiAgICAgKiAgIHJldHVybiBncmVldGluZyArICcgJyArIHRoaXMubmFtZTtcbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogZnVuYyA9IF8uYmluZChmdW5jLCB7ICduYW1lJzogJ2ZyZWQnIH0sICdoaScpO1xuICAgICAqIGZ1bmMoKTtcbiAgICAgKiAvLyA9PiAnaGkgZnJlZCdcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBiaW5kKGZ1bmMsIHRoaXNBcmcpIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID4gMlxuICAgICAgICA/IGNyZWF0ZVdyYXBwZXIoZnVuYywgMTcsIHNsaWNlKGFyZ3VtZW50cywgMiksIG51bGwsIHRoaXNBcmcpXG4gICAgICAgIDogY3JlYXRlV3JhcHBlcihmdW5jLCAxLCBudWxsLCBudWxsLCB0aGlzQXJnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBCaW5kcyBtZXRob2RzIG9mIGFuIG9iamVjdCB0byB0aGUgb2JqZWN0IGl0c2VsZiwgb3ZlcndyaXRpbmcgdGhlIGV4aXN0aW5nXG4gICAgICogbWV0aG9kLiBNZXRob2QgbmFtZXMgbWF5IGJlIHNwZWNpZmllZCBhcyBpbmRpdmlkdWFsIGFyZ3VtZW50cyBvciBhcyBhcnJheXNcbiAgICAgKiBvZiBtZXRob2QgbmFtZXMuIElmIG5vIG1ldGhvZCBuYW1lcyBhcmUgcHJvdmlkZWQgYWxsIHRoZSBmdW5jdGlvbiBwcm9wZXJ0aWVzXG4gICAgICogb2YgYG9iamVjdGAgd2lsbCBiZSBib3VuZC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvbnNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gYmluZCBhbmQgYXNzaWduIHRoZSBib3VuZCBtZXRob2RzIHRvLlxuICAgICAqIEBwYXJhbSB7Li4uc3RyaW5nfSBbbWV0aG9kTmFtZV0gVGhlIG9iamVjdCBtZXRob2QgbmFtZXMgdG9cbiAgICAgKiAgYmluZCwgc3BlY2lmaWVkIGFzIGluZGl2aWR1YWwgbWV0aG9kIG5hbWVzIG9yIGFycmF5cyBvZiBtZXRob2QgbmFtZXMuXG4gICAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIHZpZXcgPSB7XG4gICAgICogICAnbGFiZWwnOiAnZG9jcycsXG4gICAgICogICAnb25DbGljayc6IGZ1bmN0aW9uKCkgeyBjb25zb2xlLmxvZygnY2xpY2tlZCAnICsgdGhpcy5sYWJlbCk7IH1cbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogXy5iaW5kQWxsKHZpZXcpO1xuICAgICAqIGpRdWVyeSgnI2RvY3MnKS5vbignY2xpY2snLCB2aWV3Lm9uQ2xpY2spO1xuICAgICAqIC8vID0+IGxvZ3MgJ2NsaWNrZWQgZG9jcycsIHdoZW4gdGhlIGJ1dHRvbiBpcyBjbGlja2VkXG4gICAgICovXG4gICAgZnVuY3Rpb24gYmluZEFsbChvYmplY3QpIHtcbiAgICAgIHZhciBmdW5jcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYmFzZUZsYXR0ZW4oYXJndW1lbnRzLCB0cnVlLCBmYWxzZSwgMSkgOiBmdW5jdGlvbnMob2JqZWN0KSxcbiAgICAgICAgICBpbmRleCA9IC0xLFxuICAgICAgICAgIGxlbmd0aCA9IGZ1bmNzLmxlbmd0aDtcblxuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgdmFyIGtleSA9IGZ1bmNzW2luZGV4XTtcbiAgICAgICAgb2JqZWN0W2tleV0gPSBjcmVhdGVXcmFwcGVyKG9iamVjdFtrZXldLCAxLCBudWxsLCBudWxsLCBvYmplY3QpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsIGludm9rZXMgdGhlIG1ldGhvZCBhdCBgb2JqZWN0W2tleV1gXG4gICAgICogYW5kIHByZXBlbmRzIGFueSBhZGRpdGlvbmFsIGBiaW5kS2V5YCBhcmd1bWVudHMgdG8gdGhvc2UgcHJvdmlkZWQgdG8gdGhlIGJvdW5kXG4gICAgICogZnVuY3Rpb24uIFRoaXMgbWV0aG9kIGRpZmZlcnMgZnJvbSBgXy5iaW5kYCBieSBhbGxvd2luZyBib3VuZCBmdW5jdGlvbnMgdG9cbiAgICAgKiByZWZlcmVuY2UgbWV0aG9kcyB0aGF0IHdpbGwgYmUgcmVkZWZpbmVkIG9yIGRvbid0IHlldCBleGlzdC5cbiAgICAgKiBTZWUgaHR0cDovL21pY2hhdXguY2EvYXJ0aWNsZXMvbGF6eS1mdW5jdGlvbi1kZWZpbml0aW9uLXBhdHRlcm4uXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25zXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRoZSBtZXRob2QgYmVsb25ncyB0by5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIG1ldGhvZC5cbiAgICAgKiBAcGFyYW0gey4uLip9IFthcmddIEFyZ3VtZW50cyB0byBiZSBwYXJ0aWFsbHkgYXBwbGllZC5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBib3VuZCBmdW5jdGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIG9iamVjdCA9IHtcbiAgICAgKiAgICduYW1lJzogJ2ZyZWQnLFxuICAgICAqICAgJ2dyZWV0JzogZnVuY3Rpb24oZ3JlZXRpbmcpIHtcbiAgICAgKiAgICAgcmV0dXJuIGdyZWV0aW5nICsgJyAnICsgdGhpcy5uYW1lO1xuICAgICAqICAgfVxuICAgICAqIH07XG4gICAgICpcbiAgICAgKiB2YXIgZnVuYyA9IF8uYmluZEtleShvYmplY3QsICdncmVldCcsICdoaScpO1xuICAgICAqIGZ1bmMoKTtcbiAgICAgKiAvLyA9PiAnaGkgZnJlZCdcbiAgICAgKlxuICAgICAqIG9iamVjdC5ncmVldCA9IGZ1bmN0aW9uKGdyZWV0aW5nKSB7XG4gICAgICogICByZXR1cm4gZ3JlZXRpbmcgKyAneWEgJyArIHRoaXMubmFtZSArICchJztcbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogZnVuYygpO1xuICAgICAqIC8vID0+ICdoaXlhIGZyZWQhJ1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJpbmRLZXkob2JqZWN0LCBrZXkpIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID4gMlxuICAgICAgICA/IGNyZWF0ZVdyYXBwZXIoa2V5LCAxOSwgc2xpY2UoYXJndW1lbnRzLCAyKSwgbnVsbCwgb2JqZWN0KVxuICAgICAgICA6IGNyZWF0ZVdyYXBwZXIoa2V5LCAzLCBudWxsLCBudWxsLCBvYmplY3QpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IGlzIHRoZSBjb21wb3NpdGlvbiBvZiB0aGUgcHJvdmlkZWQgZnVuY3Rpb25zLFxuICAgICAqIHdoZXJlIGVhY2ggZnVuY3Rpb24gY29uc3VtZXMgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZnVuY3Rpb24gdGhhdCBmb2xsb3dzLlxuICAgICAqIEZvciBleGFtcGxlLCBjb21wb3NpbmcgdGhlIGZ1bmN0aW9ucyBgZigpYCwgYGcoKWAsIGFuZCBgaCgpYCBwcm9kdWNlcyBgZihnKGgoKSkpYC5cbiAgICAgKiBFYWNoIGZ1bmN0aW9uIGlzIGV4ZWN1dGVkIHdpdGggdGhlIGB0aGlzYCBiaW5kaW5nIG9mIHRoZSBjb21wb3NlZCBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvbnNcbiAgICAgKiBAcGFyYW0gey4uLkZ1bmN0aW9ufSBbZnVuY10gRnVuY3Rpb25zIHRvIGNvbXBvc2UuXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgY29tcG9zZWQgZnVuY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciByZWFsTmFtZU1hcCA9IHtcbiAgICAgKiAgICdwZWJibGVzJzogJ3BlbmVsb3BlJ1xuICAgICAqIH07XG4gICAgICpcbiAgICAgKiB2YXIgZm9ybWF0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgICAqICAgbmFtZSA9IHJlYWxOYW1lTWFwW25hbWUudG9Mb3dlckNhc2UoKV0gfHwgbmFtZTtcbiAgICAgKiAgIHJldHVybiBuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zbGljZSgxKS50b0xvd2VyQ2FzZSgpO1xuICAgICAqIH07XG4gICAgICpcbiAgICAgKiB2YXIgZ3JlZXQgPSBmdW5jdGlvbihmb3JtYXR0ZWQpIHtcbiAgICAgKiAgIHJldHVybiAnSGl5YSAnICsgZm9ybWF0dGVkICsgJyEnO1xuICAgICAqIH07XG4gICAgICpcbiAgICAgKiB2YXIgd2VsY29tZSA9IF8uY29tcG9zZShncmVldCwgZm9ybWF0KTtcbiAgICAgKiB3ZWxjb21lKCdwZWJibGVzJyk7XG4gICAgICogLy8gPT4gJ0hpeWEgUGVuZWxvcGUhJ1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNvbXBvc2UoKSB7XG4gICAgICB2YXIgZnVuY3MgPSBhcmd1bWVudHMsXG4gICAgICAgICAgbGVuZ3RoID0gZnVuY3MubGVuZ3RoO1xuXG4gICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgaWYgKCFpc0Z1bmN0aW9uKGZ1bmNzW2xlbmd0aF0pKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgICAgIGxlbmd0aCA9IGZ1bmNzLmxlbmd0aDtcblxuICAgICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgICBhcmdzID0gW2Z1bmNzW2xlbmd0aF0uYXBwbHkodGhpcywgYXJncyldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcmdzWzBdO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZnVuY3Rpb24gd2hpY2ggYWNjZXB0cyBvbmUgb3IgbW9yZSBhcmd1bWVudHMgb2YgYGZ1bmNgIHRoYXQgd2hlblxuICAgICAqIGludm9rZWQgZWl0aGVyIGV4ZWN1dGVzIGBmdW5jYCByZXR1cm5pbmcgaXRzIHJlc3VsdCwgaWYgYWxsIGBmdW5jYCBhcmd1bWVudHNcbiAgICAgKiBoYXZlIGJlZW4gcHJvdmlkZWQsIG9yIHJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGFjY2VwdHMgb25lIG9yIG1vcmUgb2YgdGhlXG4gICAgICogcmVtYWluaW5nIGBmdW5jYCBhcmd1bWVudHMsIGFuZCBzbyBvbi4gVGhlIGFyaXR5IG9mIGBmdW5jYCBjYW4gYmUgc3BlY2lmaWVkXG4gICAgICogaWYgYGZ1bmMubGVuZ3RoYCBpcyBub3Qgc3VmZmljaWVudC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvbnNcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjdXJyeS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2FyaXR5PWZ1bmMubGVuZ3RoXSBUaGUgYXJpdHkgb2YgYGZ1bmNgLlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGN1cnJpZWQgZnVuY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBjdXJyaWVkID0gXy5jdXJyeShmdW5jdGlvbihhLCBiLCBjKSB7XG4gICAgICogICBjb25zb2xlLmxvZyhhICsgYiArIGMpO1xuICAgICAqIH0pO1xuICAgICAqXG4gICAgICogY3VycmllZCgxKSgyKSgzKTtcbiAgICAgKiAvLyA9PiA2XG4gICAgICpcbiAgICAgKiBjdXJyaWVkKDEsIDIpKDMpO1xuICAgICAqIC8vID0+IDZcbiAgICAgKlxuICAgICAqIGN1cnJpZWQoMSwgMiwgMyk7XG4gICAgICogLy8gPT4gNlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGN1cnJ5KGZ1bmMsIGFyaXR5KSB7XG4gICAgICBhcml0eSA9IHR5cGVvZiBhcml0eSA9PSAnbnVtYmVyJyA/IGFyaXR5IDogKCthcml0eSB8fCBmdW5jLmxlbmd0aCk7XG4gICAgICByZXR1cm4gY3JlYXRlV3JhcHBlcihmdW5jLCA0LCBudWxsLCBudWxsLCBudWxsLCBhcml0eSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBkZWxheSB0aGUgZXhlY3V0aW9uIG9mIGBmdW5jYCB1bnRpbCBhZnRlclxuICAgICAqIGB3YWl0YCBtaWxsaXNlY29uZHMgaGF2ZSBlbGFwc2VkIHNpbmNlIHRoZSBsYXN0IHRpbWUgaXQgd2FzIGludm9rZWQuXG4gICAgICogUHJvdmlkZSBhbiBvcHRpb25zIG9iamVjdCB0byBpbmRpY2F0ZSB0aGF0IGBmdW5jYCBzaG91bGQgYmUgaW52b2tlZCBvblxuICAgICAqIHRoZSBsZWFkaW5nIGFuZC9vciB0cmFpbGluZyBlZGdlIG9mIHRoZSBgd2FpdGAgdGltZW91dC4gU3Vic2VxdWVudCBjYWxsc1xuICAgICAqIHRvIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gd2lsbCByZXR1cm4gdGhlIHJlc3VsdCBvZiB0aGUgbGFzdCBgZnVuY2AgY2FsbC5cbiAgICAgKlxuICAgICAqIE5vdGU6IElmIGBsZWFkaW5nYCBhbmQgYHRyYWlsaW5nYCBvcHRpb25zIGFyZSBgdHJ1ZWAgYGZ1bmNgIHdpbGwgYmUgY2FsbGVkXG4gICAgICogb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQgb25seSBpZiB0aGUgdGhlIGRlYm91bmNlZCBmdW5jdGlvbiBpc1xuICAgICAqIGludm9rZWQgbW9yZSB0aGFuIG9uY2UgZHVyaW5nIHRoZSBgd2FpdGAgdGltZW91dC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvbnNcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBkZWJvdW5jZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2FpdCBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byBkZWxheS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFRoZSBvcHRpb25zIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxlYWRpbmc9ZmFsc2VdIFNwZWNpZnkgZXhlY3V0aW9uIG9uIHRoZSBsZWFkaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1heFdhaXRdIFRoZSBtYXhpbXVtIHRpbWUgYGZ1bmNgIGlzIGFsbG93ZWQgdG8gYmUgZGVsYXllZCBiZWZvcmUgaXQncyBjYWxsZWQuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50cmFpbGluZz10cnVlXSBTcGVjaWZ5IGV4ZWN1dGlvbiBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBkZWJvdW5jZWQgZnVuY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIC8vIGF2b2lkIGNvc3RseSBjYWxjdWxhdGlvbnMgd2hpbGUgdGhlIHdpbmRvdyBzaXplIGlzIGluIGZsdXhcbiAgICAgKiB2YXIgbGF6eUxheW91dCA9IF8uZGVib3VuY2UoY2FsY3VsYXRlTGF5b3V0LCAxNTApO1xuICAgICAqIGpRdWVyeSh3aW5kb3cpLm9uKCdyZXNpemUnLCBsYXp5TGF5b3V0KTtcbiAgICAgKlxuICAgICAqIC8vIGV4ZWN1dGUgYHNlbmRNYWlsYCB3aGVuIHRoZSBjbGljayBldmVudCBpcyBmaXJlZCwgZGVib3VuY2luZyBzdWJzZXF1ZW50IGNhbGxzXG4gICAgICogalF1ZXJ5KCcjcG9zdGJveCcpLm9uKCdjbGljaycsIF8uZGVib3VuY2Uoc2VuZE1haWwsIDMwMCwge1xuICAgICAqICAgJ2xlYWRpbmcnOiB0cnVlLFxuICAgICAqICAgJ3RyYWlsaW5nJzogZmFsc2VcbiAgICAgKiB9KTtcbiAgICAgKlxuICAgICAqIC8vIGVuc3VyZSBgYmF0Y2hMb2dgIGlzIGV4ZWN1dGVkIG9uY2UgYWZ0ZXIgMSBzZWNvbmQgb2YgZGVib3VuY2VkIGNhbGxzXG4gICAgICogdmFyIHNvdXJjZSA9IG5ldyBFdmVudFNvdXJjZSgnL3N0cmVhbScpO1xuICAgICAqIHNvdXJjZS5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgXy5kZWJvdW5jZShiYXRjaExvZywgMjUwLCB7XG4gICAgICogICAnbWF4V2FpdCc6IDEwMDBcbiAgICAgKiB9LCBmYWxzZSk7XG4gICAgICovXG4gICAgZnVuY3Rpb24gZGVib3VuY2UoZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICAgICAgdmFyIGFyZ3MsXG4gICAgICAgICAgbWF4VGltZW91dElkLFxuICAgICAgICAgIHJlc3VsdCxcbiAgICAgICAgICBzdGFtcCxcbiAgICAgICAgICB0aGlzQXJnLFxuICAgICAgICAgIHRpbWVvdXRJZCxcbiAgICAgICAgICB0cmFpbGluZ0NhbGwsXG4gICAgICAgICAgbGFzdENhbGxlZCA9IDAsXG4gICAgICAgICAgbWF4V2FpdCA9IGZhbHNlLFxuICAgICAgICAgIHRyYWlsaW5nID0gdHJ1ZTtcblxuICAgICAgaWYgKCFpc0Z1bmN0aW9uKGZ1bmMpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3I7XG4gICAgICB9XG4gICAgICB3YWl0ID0gbmF0aXZlTWF4KDAsIHdhaXQpIHx8IDA7XG4gICAgICBpZiAob3B0aW9ucyA9PT0gdHJ1ZSkge1xuICAgICAgICB2YXIgbGVhZGluZyA9IHRydWU7XG4gICAgICAgIHRyYWlsaW5nID0gZmFsc2U7XG4gICAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KG9wdGlvbnMpKSB7XG4gICAgICAgIGxlYWRpbmcgPSBvcHRpb25zLmxlYWRpbmc7XG4gICAgICAgIG1heFdhaXQgPSAnbWF4V2FpdCcgaW4gb3B0aW9ucyAmJiAobmF0aXZlTWF4KHdhaXQsIG9wdGlvbnMubWF4V2FpdCkgfHwgMCk7XG4gICAgICAgIHRyYWlsaW5nID0gJ3RyYWlsaW5nJyBpbiBvcHRpb25zID8gb3B0aW9ucy50cmFpbGluZyA6IHRyYWlsaW5nO1xuICAgICAgfVxuICAgICAgdmFyIGRlbGF5ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlbWFpbmluZyA9IHdhaXQgLSAobm93KCkgLSBzdGFtcCk7XG4gICAgICAgIGlmIChyZW1haW5pbmcgPD0gMCkge1xuICAgICAgICAgIGlmIChtYXhUaW1lb3V0SWQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChtYXhUaW1lb3V0SWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgaXNDYWxsZWQgPSB0cmFpbGluZ0NhbGw7XG4gICAgICAgICAgbWF4VGltZW91dElkID0gdGltZW91dElkID0gdHJhaWxpbmdDYWxsID0gdW5kZWZpbmVkO1xuICAgICAgICAgIGlmIChpc0NhbGxlZCkge1xuICAgICAgICAgICAgbGFzdENhbGxlZCA9IG5vdygpO1xuICAgICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgICAgICAgICAgIGlmICghdGltZW91dElkICYmICFtYXhUaW1lb3V0SWQpIHtcbiAgICAgICAgICAgICAgYXJncyA9IHRoaXNBcmcgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KGRlbGF5ZWQsIHJlbWFpbmluZyk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHZhciBtYXhEZWxheWVkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aW1lb3V0SWQpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgfVxuICAgICAgICBtYXhUaW1lb3V0SWQgPSB0aW1lb3V0SWQgPSB0cmFpbGluZ0NhbGwgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0cmFpbGluZyB8fCAobWF4V2FpdCAhPT0gd2FpdCkpIHtcbiAgICAgICAgICBsYXN0Q2FsbGVkID0gbm93KCk7XG4gICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgICAgICAgICBpZiAoIXRpbWVvdXRJZCAmJiAhbWF4VGltZW91dElkKSB7XG4gICAgICAgICAgICBhcmdzID0gdGhpc0FyZyA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgIHN0YW1wID0gbm93KCk7XG4gICAgICAgIHRoaXNBcmcgPSB0aGlzO1xuICAgICAgICB0cmFpbGluZ0NhbGwgPSB0cmFpbGluZyAmJiAodGltZW91dElkIHx8ICFsZWFkaW5nKTtcblxuICAgICAgICBpZiAobWF4V2FpdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICB2YXIgbGVhZGluZ0NhbGwgPSBsZWFkaW5nICYmICF0aW1lb3V0SWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKCFtYXhUaW1lb3V0SWQgJiYgIWxlYWRpbmcpIHtcbiAgICAgICAgICAgIGxhc3RDYWxsZWQgPSBzdGFtcDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIHJlbWFpbmluZyA9IG1heFdhaXQgLSAoc3RhbXAgLSBsYXN0Q2FsbGVkKSxcbiAgICAgICAgICAgICAgaXNDYWxsZWQgPSByZW1haW5pbmcgPD0gMDtcblxuICAgICAgICAgIGlmIChpc0NhbGxlZCkge1xuICAgICAgICAgICAgaWYgKG1heFRpbWVvdXRJZCkge1xuICAgICAgICAgICAgICBtYXhUaW1lb3V0SWQgPSBjbGVhclRpbWVvdXQobWF4VGltZW91dElkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxhc3RDYWxsZWQgPSBzdGFtcDtcbiAgICAgICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKCFtYXhUaW1lb3V0SWQpIHtcbiAgICAgICAgICAgIG1heFRpbWVvdXRJZCA9IHNldFRpbWVvdXQobWF4RGVsYXllZCwgcmVtYWluaW5nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQ2FsbGVkICYmIHRpbWVvdXRJZCkge1xuICAgICAgICAgIHRpbWVvdXRJZCA9IGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCF0aW1lb3V0SWQgJiYgd2FpdCAhPT0gbWF4V2FpdCkge1xuICAgICAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZGVsYXllZCwgd2FpdCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlYWRpbmdDYWxsKSB7XG4gICAgICAgICAgaXNDYWxsZWQgPSB0cnVlO1xuICAgICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQ2FsbGVkICYmICF0aW1lb3V0SWQgJiYgIW1heFRpbWVvdXRJZCkge1xuICAgICAgICAgIGFyZ3MgPSB0aGlzQXJnID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZWZlcnMgZXhlY3V0aW5nIHRoZSBgZnVuY2AgZnVuY3Rpb24gdW50aWwgdGhlIGN1cnJlbnQgY2FsbCBzdGFjayBoYXMgY2xlYXJlZC5cbiAgICAgKiBBZGRpdGlvbmFsIGFyZ3VtZW50cyB3aWxsIGJlIHByb3ZpZGVkIHRvIGBmdW5jYCB3aGVuIGl0IGlzIGludm9rZWQuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25zXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gZGVmZXIuXG4gICAgICogQHBhcmFtIHsuLi4qfSBbYXJnXSBBcmd1bWVudHMgdG8gaW52b2tlIHRoZSBmdW5jdGlvbiB3aXRoLlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIHRpbWVyIGlkLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmRlZmVyKGZ1bmN0aW9uKHRleHQpIHsgY29uc29sZS5sb2codGV4dCk7IH0sICdkZWZlcnJlZCcpO1xuICAgICAqIC8vIGxvZ3MgJ2RlZmVycmVkJyBhZnRlciBvbmUgb3IgbW9yZSBtaWxsaXNlY29uZHNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBkZWZlcihmdW5jKSB7XG4gICAgICBpZiAoIWlzRnVuY3Rpb24oZnVuYykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcjtcbiAgICAgIH1cbiAgICAgIHZhciBhcmdzID0gc2xpY2UoYXJndW1lbnRzLCAxKTtcbiAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBmdW5jLmFwcGx5KHVuZGVmaW5lZCwgYXJncyk7IH0sIDEpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGVzIHRoZSBgZnVuY2AgZnVuY3Rpb24gYWZ0ZXIgYHdhaXRgIG1pbGxpc2Vjb25kcy4gQWRkaXRpb25hbCBhcmd1bWVudHNcbiAgICAgKiB3aWxsIGJlIHByb3ZpZGVkIHRvIGBmdW5jYCB3aGVuIGl0IGlzIGludm9rZWQuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25zXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gZGVsYXkuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdhaXQgVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gZGVsYXkgZXhlY3V0aW9uLlxuICAgICAqIEBwYXJhbSB7Li4uKn0gW2FyZ10gQXJndW1lbnRzIHRvIGludm9rZSB0aGUgZnVuY3Rpb24gd2l0aC5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSB0aW1lciBpZC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5kZWxheShmdW5jdGlvbih0ZXh0KSB7IGNvbnNvbGUubG9nKHRleHQpOyB9LCAxMDAwLCAnbGF0ZXInKTtcbiAgICAgKiAvLyA9PiBsb2dzICdsYXRlcicgYWZ0ZXIgb25lIHNlY29uZFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGRlbGF5KGZ1bmMsIHdhaXQpIHtcbiAgICAgIGlmICghaXNGdW5jdGlvbihmdW5jKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yO1xuICAgICAgfVxuICAgICAgdmFyIGFyZ3MgPSBzbGljZShhcmd1bWVudHMsIDIpO1xuICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGZ1bmMuYXBwbHkodW5kZWZpbmVkLCBhcmdzKTsgfSwgd2FpdCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgbWVtb2l6ZXMgdGhlIHJlc3VsdCBvZiBgZnVuY2AuIElmIGByZXNvbHZlcmAgaXNcbiAgICAgKiBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBjYWNoZSBrZXkgZm9yIHN0b3JpbmcgdGhlIHJlc3VsdFxuICAgICAqIGJhc2VkIG9uIHRoZSBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlIG1lbW9pemVkIGZ1bmN0aW9uLiBCeSBkZWZhdWx0LCB0aGVcbiAgICAgKiBmaXJzdCBhcmd1bWVudCBwcm92aWRlZCB0byB0aGUgbWVtb2l6ZWQgZnVuY3Rpb24gaXMgdXNlZCBhcyB0aGUgY2FjaGUga2V5LlxuICAgICAqIFRoZSBgZnVuY2AgaXMgZXhlY3V0ZWQgd2l0aCB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgdGhlIG1lbW9pemVkIGZ1bmN0aW9uLlxuICAgICAqIFRoZSByZXN1bHQgY2FjaGUgaXMgZXhwb3NlZCBhcyB0aGUgYGNhY2hlYCBwcm9wZXJ0eSBvbiB0aGUgbWVtb2l6ZWQgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25zXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gaGF2ZSBpdHMgb3V0cHV0IG1lbW9pemVkLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtyZXNvbHZlcl0gQSBmdW5jdGlvbiB1c2VkIHRvIHJlc29sdmUgdGhlIGNhY2hlIGtleS5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBtZW1vaXppbmcgZnVuY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBmaWJvbmFjY2kgPSBfLm1lbW9pemUoZnVuY3Rpb24obikge1xuICAgICAqICAgcmV0dXJuIG4gPCAyID8gbiA6IGZpYm9uYWNjaShuIC0gMSkgKyBmaWJvbmFjY2kobiAtIDIpO1xuICAgICAqIH0pO1xuICAgICAqXG4gICAgICogZmlib25hY2NpKDkpXG4gICAgICogLy8gPT4gMzRcbiAgICAgKlxuICAgICAqIHZhciBkYXRhID0ge1xuICAgICAqICAgJ2ZyZWQnOiB7ICduYW1lJzogJ2ZyZWQnLCAnYWdlJzogNDAgfSxcbiAgICAgKiAgICdwZWJibGVzJzogeyAnbmFtZSc6ICdwZWJibGVzJywgJ2FnZSc6IDEgfVxuICAgICAqIH07XG4gICAgICpcbiAgICAgKiAvLyBtb2RpZnlpbmcgdGhlIHJlc3VsdCBjYWNoZVxuICAgICAqIHZhciBnZXQgPSBfLm1lbW9pemUoZnVuY3Rpb24obmFtZSkgeyByZXR1cm4gZGF0YVtuYW1lXTsgfSwgXy5pZGVudGl0eSk7XG4gICAgICogZ2V0KCdwZWJibGVzJyk7XG4gICAgICogLy8gPT4geyAnbmFtZSc6ICdwZWJibGVzJywgJ2FnZSc6IDEgfVxuICAgICAqXG4gICAgICogZ2V0LmNhY2hlLnBlYmJsZXMubmFtZSA9ICdwZW5lbG9wZSc7XG4gICAgICogZ2V0KCdwZWJibGVzJyk7XG4gICAgICogLy8gPT4geyAnbmFtZSc6ICdwZW5lbG9wZScsICdhZ2UnOiAxIH1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBtZW1vaXplKGZ1bmMsIHJlc29sdmVyKSB7XG4gICAgICBpZiAoIWlzRnVuY3Rpb24oZnVuYykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcjtcbiAgICAgIH1cbiAgICAgIHZhciBtZW1vaXplZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2FjaGUgPSBtZW1vaXplZC5jYWNoZSxcbiAgICAgICAgICAgIGtleSA9IHJlc29sdmVyID8gcmVzb2x2ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSA6IGtleVByZWZpeCArIGFyZ3VtZW50c1swXTtcblxuICAgICAgICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChjYWNoZSwga2V5KVxuICAgICAgICAgID8gY2FjaGVba2V5XVxuICAgICAgICAgIDogKGNhY2hlW2tleV0gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICAgICAgfVxuICAgICAgbWVtb2l6ZWQuY2FjaGUgPSB7fTtcbiAgICAgIHJldHVybiBtZW1vaXplZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCBpcyByZXN0cmljdGVkIHRvIGV4ZWN1dGUgYGZ1bmNgIG9uY2UuIFJlcGVhdCBjYWxscyB0b1xuICAgICAqIHRoZSBmdW5jdGlvbiB3aWxsIHJldHVybiB0aGUgdmFsdWUgb2YgdGhlIGZpcnN0IGNhbGwuIFRoZSBgZnVuY2AgaXMgZXhlY3V0ZWRcbiAgICAgKiB3aXRoIHRoZSBgdGhpc2AgYmluZGluZyBvZiB0aGUgY3JlYXRlZCBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvbnNcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byByZXN0cmljdC5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyByZXN0cmljdGVkIGZ1bmN0aW9uLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgaW5pdGlhbGl6ZSA9IF8ub25jZShjcmVhdGVBcHBsaWNhdGlvbik7XG4gICAgICogaW5pdGlhbGl6ZSgpO1xuICAgICAqIGluaXRpYWxpemUoKTtcbiAgICAgKiAvLyBgaW5pdGlhbGl6ZWAgZXhlY3V0ZXMgYGNyZWF0ZUFwcGxpY2F0aW9uYCBvbmNlXG4gICAgICovXG4gICAgZnVuY3Rpb24gb25jZShmdW5jKSB7XG4gICAgICB2YXIgcmFuLFxuICAgICAgICAgIHJlc3VsdDtcblxuICAgICAgaWYgKCFpc0Z1bmN0aW9uKGZ1bmMpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3I7XG4gICAgICB9XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChyYW4pIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIHJhbiA9IHRydWU7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAvLyBjbGVhciB0aGUgYGZ1bmNgIHZhcmlhYmxlIHNvIHRoZSBmdW5jdGlvbiBtYXkgYmUgZ2FyYmFnZSBjb2xsZWN0ZWRcbiAgICAgICAgZnVuYyA9IG51bGw7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCwgaW52b2tlcyBgZnVuY2Agd2l0aCBhbnkgYWRkaXRpb25hbFxuICAgICAqIGBwYXJ0aWFsYCBhcmd1bWVudHMgcHJlcGVuZGVkIHRvIHRob3NlIHByb3ZpZGVkIHRvIHRoZSBuZXcgZnVuY3Rpb24uIFRoaXNcbiAgICAgKiBtZXRob2QgaXMgc2ltaWxhciB0byBgXy5iaW5kYCBleGNlcHQgaXQgZG9lcyAqKm5vdCoqIGFsdGVyIHRoZSBgdGhpc2AgYmluZGluZy5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvbnNcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBwYXJ0aWFsbHkgYXBwbHkgYXJndW1lbnRzIHRvLlxuICAgICAqIEBwYXJhbSB7Li4uKn0gW2FyZ10gQXJndW1lbnRzIHRvIGJlIHBhcnRpYWxseSBhcHBsaWVkLlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IHBhcnRpYWxseSBhcHBsaWVkIGZ1bmN0aW9uLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgZ3JlZXQgPSBmdW5jdGlvbihncmVldGluZywgbmFtZSkgeyByZXR1cm4gZ3JlZXRpbmcgKyAnICcgKyBuYW1lOyB9O1xuICAgICAqIHZhciBoaSA9IF8ucGFydGlhbChncmVldCwgJ2hpJyk7XG4gICAgICogaGkoJ2ZyZWQnKTtcbiAgICAgKiAvLyA9PiAnaGkgZnJlZCdcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBwYXJ0aWFsKGZ1bmMpIHtcbiAgICAgIHJldHVybiBjcmVhdGVXcmFwcGVyKGZ1bmMsIDE2LCBzbGljZShhcmd1bWVudHMsIDEpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBsaWtlIGBfLnBhcnRpYWxgIGV4Y2VwdCB0aGF0IGBwYXJ0aWFsYCBhcmd1bWVudHMgYXJlXG4gICAgICogYXBwZW5kZWQgdG8gdGhvc2UgcHJvdmlkZWQgdG8gdGhlIG5ldyBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvbnNcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBwYXJ0aWFsbHkgYXBwbHkgYXJndW1lbnRzIHRvLlxuICAgICAqIEBwYXJhbSB7Li4uKn0gW2FyZ10gQXJndW1lbnRzIHRvIGJlIHBhcnRpYWxseSBhcHBsaWVkLlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IHBhcnRpYWxseSBhcHBsaWVkIGZ1bmN0aW9uLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgZGVmYXVsdHNEZWVwID0gXy5wYXJ0aWFsUmlnaHQoXy5tZXJnZSwgXy5kZWZhdWx0cyk7XG4gICAgICpcbiAgICAgKiB2YXIgb3B0aW9ucyA9IHtcbiAgICAgKiAgICd2YXJpYWJsZSc6ICdkYXRhJyxcbiAgICAgKiAgICdpbXBvcnRzJzogeyAnanEnOiAkIH1cbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogZGVmYXVsdHNEZWVwKG9wdGlvbnMsIF8udGVtcGxhdGVTZXR0aW5ncyk7XG4gICAgICpcbiAgICAgKiBvcHRpb25zLnZhcmlhYmxlXG4gICAgICogLy8gPT4gJ2RhdGEnXG4gICAgICpcbiAgICAgKiBvcHRpb25zLmltcG9ydHNcbiAgICAgKiAvLyA9PiB7ICdfJzogXywgJ2pxJzogJCB9XG4gICAgICovXG4gICAgZnVuY3Rpb24gcGFydGlhbFJpZ2h0KGZ1bmMpIHtcbiAgICAgIHJldHVybiBjcmVhdGVXcmFwcGVyKGZ1bmMsIDMyLCBudWxsLCBzbGljZShhcmd1bWVudHMsIDEpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBleGVjdXRlZCwgd2lsbCBvbmx5IGNhbGwgdGhlIGBmdW5jYCBmdW5jdGlvblxuICAgICAqIGF0IG1vc3Qgb25jZSBwZXIgZXZlcnkgYHdhaXRgIG1pbGxpc2Vjb25kcy4gUHJvdmlkZSBhbiBvcHRpb25zIG9iamVjdCB0b1xuICAgICAqIGluZGljYXRlIHRoYXQgYGZ1bmNgIHNob3VsZCBiZSBpbnZva2VkIG9uIHRoZSBsZWFkaW5nIGFuZC9vciB0cmFpbGluZyBlZGdlXG4gICAgICogb2YgdGhlIGB3YWl0YCB0aW1lb3V0LiBTdWJzZXF1ZW50IGNhbGxzIHRvIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gd2lsbFxuICAgICAqIHJldHVybiB0aGUgcmVzdWx0IG9mIHRoZSBsYXN0IGBmdW5jYCBjYWxsLlxuICAgICAqXG4gICAgICogTm90ZTogSWYgYGxlYWRpbmdgIGFuZCBgdHJhaWxpbmdgIG9wdGlvbnMgYXJlIGB0cnVlYCBgZnVuY2Agd2lsbCBiZSBjYWxsZWRcbiAgICAgKiBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dCBvbmx5IGlmIHRoZSB0aGUgdGhyb3R0bGVkIGZ1bmN0aW9uIGlzXG4gICAgICogaW52b2tlZCBtb3JlIHRoYW4gb25jZSBkdXJpbmcgdGhlIGB3YWl0YCB0aW1lb3V0LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uc1xuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHRocm90dGxlLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3YWl0IFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHRocm90dGxlIGV4ZWN1dGlvbnMgdG8uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5sZWFkaW5nPXRydWVdIFNwZWNpZnkgZXhlY3V0aW9uIG9uIHRoZSBsZWFkaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50cmFpbGluZz10cnVlXSBTcGVjaWZ5IGV4ZWN1dGlvbiBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyB0aHJvdHRsZWQgZnVuY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIC8vIGF2b2lkIGV4Y2Vzc2l2ZWx5IHVwZGF0aW5nIHRoZSBwb3NpdGlvbiB3aGlsZSBzY3JvbGxpbmdcbiAgICAgKiB2YXIgdGhyb3R0bGVkID0gXy50aHJvdHRsZSh1cGRhdGVQb3NpdGlvbiwgMTAwKTtcbiAgICAgKiBqUXVlcnkod2luZG93KS5vbignc2Nyb2xsJywgdGhyb3R0bGVkKTtcbiAgICAgKlxuICAgICAqIC8vIGV4ZWN1dGUgYHJlbmV3VG9rZW5gIHdoZW4gdGhlIGNsaWNrIGV2ZW50IGlzIGZpcmVkLCBidXQgbm90IG1vcmUgdGhhbiBvbmNlIGV2ZXJ5IDUgbWludXRlc1xuICAgICAqIGpRdWVyeSgnLmludGVyYWN0aXZlJykub24oJ2NsaWNrJywgXy50aHJvdHRsZShyZW5ld1Rva2VuLCAzMDAwMDAsIHtcbiAgICAgKiAgICd0cmFpbGluZyc6IGZhbHNlXG4gICAgICogfSkpO1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRocm90dGxlKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBsZWFkaW5nID0gdHJ1ZSxcbiAgICAgICAgICB0cmFpbGluZyA9IHRydWU7XG5cbiAgICAgIGlmICghaXNGdW5jdGlvbihmdW5jKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yO1xuICAgICAgfVxuICAgICAgaWYgKG9wdGlvbnMgPT09IGZhbHNlKSB7XG4gICAgICAgIGxlYWRpbmcgPSBmYWxzZTtcbiAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3Qob3B0aW9ucykpIHtcbiAgICAgICAgbGVhZGluZyA9ICdsZWFkaW5nJyBpbiBvcHRpb25zID8gb3B0aW9ucy5sZWFkaW5nIDogbGVhZGluZztcbiAgICAgICAgdHJhaWxpbmcgPSAndHJhaWxpbmcnIGluIG9wdGlvbnMgPyBvcHRpb25zLnRyYWlsaW5nIDogdHJhaWxpbmc7XG4gICAgICB9XG4gICAgICBkZWJvdW5jZU9wdGlvbnMubGVhZGluZyA9IGxlYWRpbmc7XG4gICAgICBkZWJvdW5jZU9wdGlvbnMubWF4V2FpdCA9IHdhaXQ7XG4gICAgICBkZWJvdW5jZU9wdGlvbnMudHJhaWxpbmcgPSB0cmFpbGluZztcblxuICAgICAgcmV0dXJuIGRlYm91bmNlKGZ1bmMsIHdhaXQsIGRlYm91bmNlT3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgcHJvdmlkZXMgYHZhbHVlYCB0byB0aGUgd3JhcHBlciBmdW5jdGlvbiBhcyBpdHNcbiAgICAgKiBmaXJzdCBhcmd1bWVudC4gQWRkaXRpb25hbCBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlIGZ1bmN0aW9uIGFyZSBhcHBlbmRlZFxuICAgICAqIHRvIHRob3NlIHByb3ZpZGVkIHRvIHRoZSB3cmFwcGVyIGZ1bmN0aW9uLiBUaGUgd3JhcHBlciBpcyBleGVjdXRlZCB3aXRoXG4gICAgICogdGhlIGB0aGlzYCBiaW5kaW5nIG9mIHRoZSBjcmVhdGVkIGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uc1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHdyYXAuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gd3JhcHBlciBUaGUgd3JhcHBlciBmdW5jdGlvbi5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIHAgPSBfLndyYXAoXy5lc2NhcGUsIGZ1bmN0aW9uKGZ1bmMsIHRleHQpIHtcbiAgICAgKiAgIHJldHVybiAnPHA+JyArIGZ1bmModGV4dCkgKyAnPC9wPic7XG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiBwKCdGcmVkLCBXaWxtYSwgJiBQZWJibGVzJyk7XG4gICAgICogLy8gPT4gJzxwPkZyZWQsIFdpbG1hLCAmYW1wOyBQZWJibGVzPC9wPidcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB3cmFwKHZhbHVlLCB3cmFwcGVyKSB7XG4gICAgICByZXR1cm4gY3JlYXRlV3JhcHBlcih3cmFwcGVyLCAxNiwgW3ZhbHVlXSk7XG4gICAgfVxuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGB2YWx1ZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcmV0dXJuIGZyb20gdGhlIG5ldyBmdW5jdGlvbi5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIG9iamVjdCA9IHsgJ25hbWUnOiAnZnJlZCcgfTtcbiAgICAgKiB2YXIgZ2V0dGVyID0gXy5jb25zdGFudChvYmplY3QpO1xuICAgICAqIGdldHRlcigpID09PSBvYmplY3Q7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNvbnN0YW50KHZhbHVlKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJvZHVjZXMgYSBjYWxsYmFjayBib3VuZCB0byBhbiBvcHRpb25hbCBgdGhpc0FyZ2AuIElmIGBmdW5jYCBpcyBhIHByb3BlcnR5XG4gICAgICogbmFtZSB0aGUgY3JlYXRlZCBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgZm9yIGEgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKiBJZiBgZnVuY2AgaXMgYW4gb2JqZWN0IHRoZSBjcmVhdGVkIGNhbGxiYWNrIHdpbGwgcmV0dXJuIGB0cnVlYCBmb3IgZWxlbWVudHNcbiAgICAgKiB0aGF0IGNvbnRhaW4gdGhlIGVxdWl2YWxlbnQgb2JqZWN0IHByb3BlcnRpZXMsIG90aGVyd2lzZSBpdCB3aWxsIHJldHVybiBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICAgICAqIEBwYXJhbSB7Kn0gW2Z1bmM9aWRlbnRpdHldIFRoZSB2YWx1ZSB0byBjb252ZXJ0IHRvIGEgY2FsbGJhY2suXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIHRoZSBjcmVhdGVkIGNhbGxiYWNrLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbYXJnQ291bnRdIFRoZSBudW1iZXIgb2YgYXJndW1lbnRzIHRoZSBjYWxsYmFjayBhY2NlcHRzLlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyBhIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2IH0sXG4gICAgICogICB7ICduYW1lJzogJ2ZyZWQnLCAgICdhZ2UnOiA0MCB9XG4gICAgICogXTtcbiAgICAgKlxuICAgICAqIC8vIHdyYXAgdG8gY3JlYXRlIGN1c3RvbSBjYWxsYmFjayBzaG9ydGhhbmRzXG4gICAgICogXy5jcmVhdGVDYWxsYmFjayA9IF8ud3JhcChfLmNyZWF0ZUNhbGxiYWNrLCBmdW5jdGlvbihmdW5jLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAqICAgdmFyIG1hdGNoID0gL14oLis/KV9fKFtnbF10KSguKykkLy5leGVjKGNhbGxiYWNrKTtcbiAgICAgKiAgIHJldHVybiAhbWF0Y2ggPyBmdW5jKGNhbGxiYWNrLCB0aGlzQXJnKSA6IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgICAqICAgICByZXR1cm4gbWF0Y2hbMl0gPT0gJ2d0JyA/IG9iamVjdFttYXRjaFsxXV0gPiBtYXRjaFszXSA6IG9iamVjdFttYXRjaFsxXV0gPCBtYXRjaFszXTtcbiAgICAgKiAgIH07XG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiBfLmZpbHRlcihjaGFyYWN0ZXJzLCAnYWdlX19ndDM4Jyk7XG4gICAgICogLy8gPT4gW3sgJ25hbWUnOiAnZnJlZCcsICdhZ2UnOiA0MCB9XVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNyZWF0ZUNhbGxiYWNrKGZ1bmMsIHRoaXNBcmcsIGFyZ0NvdW50KSB7XG4gICAgICB2YXIgdHlwZSA9IHR5cGVvZiBmdW5jO1xuICAgICAgaWYgKGZ1bmMgPT0gbnVsbCB8fCB0eXBlID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIGJhc2VDcmVhdGVDYWxsYmFjayhmdW5jLCB0aGlzQXJnLCBhcmdDb3VudCk7XG4gICAgICB9XG4gICAgICAvLyBoYW5kbGUgXCJfLnBsdWNrXCIgc3R5bGUgY2FsbGJhY2sgc2hvcnRoYW5kc1xuICAgICAgaWYgKHR5cGUgIT0gJ29iamVjdCcpIHtcbiAgICAgICAgcmV0dXJuIHByb3BlcnR5KGZ1bmMpO1xuICAgICAgfVxuICAgICAgdmFyIHByb3BzID0ga2V5cyhmdW5jKSxcbiAgICAgICAgICBrZXkgPSBwcm9wc1swXSxcbiAgICAgICAgICBhID0gZnVuY1trZXldO1xuXG4gICAgICAvLyBoYW5kbGUgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2sgc2hvcnRoYW5kc1xuICAgICAgaWYgKHByb3BzLmxlbmd0aCA9PSAxICYmIGEgPT09IGEgJiYgIWlzT2JqZWN0KGEpKSB7XG4gICAgICAgIC8vIGZhc3QgcGF0aCB0aGUgY29tbW9uIGNhc2Ugb2YgcHJvdmlkaW5nIGFuIG9iamVjdCB3aXRoIGEgc2luZ2xlXG4gICAgICAgIC8vIHByb3BlcnR5IGNvbnRhaW5pbmcgYSBwcmltaXRpdmUgdmFsdWVcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCkge1xuICAgICAgICAgIHZhciBiID0gb2JqZWN0W2tleV07XG4gICAgICAgICAgcmV0dXJuIGEgPT09IGIgJiYgKGEgIT09IDAgfHwgKDEgLyBhID09IDEgLyBiKSk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgICAgIHZhciBsZW5ndGggPSBwcm9wcy5sZW5ndGgsXG4gICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcblxuICAgICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgICBpZiAoIShyZXN1bHQgPSBiYXNlSXNFcXVhbChvYmplY3RbcHJvcHNbbGVuZ3RoXV0sIGZ1bmNbcHJvcHNbbGVuZ3RoXV0sIG51bGwsIHRydWUpKSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIHRoZSBjaGFyYWN0ZXJzIGAmYCwgYDxgLCBgPmAsIGBcImAsIGFuZCBgJ2AgaW4gYHN0cmluZ2AgdG8gdGhlaXJcbiAgICAgKiBjb3JyZXNwb25kaW5nIEhUTUwgZW50aXRpZXMuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyBUaGUgc3RyaW5nIHRvIGVzY2FwZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBlc2NhcGVkIHN0cmluZy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5lc2NhcGUoJ0ZyZWQsIFdpbG1hLCAmIFBlYmJsZXMnKTtcbiAgICAgKiAvLyA9PiAnRnJlZCwgV2lsbWEsICZhbXA7IFBlYmJsZXMnXG4gICAgICovXG4gICAgZnVuY3Rpb24gZXNjYXBlKHN0cmluZykge1xuICAgICAgcmV0dXJuIHN0cmluZyA9PSBudWxsID8gJycgOiBTdHJpbmcoc3RyaW5nKS5yZXBsYWNlKHJlVW5lc2NhcGVkSHRtbCwgZXNjYXBlSHRtbENoYXIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIHJldHVybnMgdGhlIGZpcnN0IGFyZ3VtZW50IHByb3ZpZGVkIHRvIGl0LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgQW55IHZhbHVlLlxuICAgICAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIGB2YWx1ZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBvYmplY3QgPSB7ICduYW1lJzogJ2ZyZWQnIH07XG4gICAgICogXy5pZGVudGl0eShvYmplY3QpID09PSBvYmplY3Q7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGlkZW50aXR5KHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBmdW5jdGlvbiBwcm9wZXJ0aWVzIG9mIGEgc291cmNlIG9iamVjdCB0byB0aGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICAgICAqIElmIGBvYmplY3RgIGlzIGEgZnVuY3Rpb24gbWV0aG9kcyB3aWxsIGJlIGFkZGVkIHRvIGl0cyBwcm90b3R5cGUgYXMgd2VsbC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdH0gW29iamVjdD1sb2Rhc2hdIG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIG9iamVjdCBvZiBmdW5jdGlvbnMgdG8gYWRkLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuY2hhaW49dHJ1ZV0gU3BlY2lmeSB3aGV0aGVyIHRoZSBmdW5jdGlvbnMgYWRkZWQgYXJlIGNoYWluYWJsZS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogZnVuY3Rpb24gY2FwaXRhbGl6ZShzdHJpbmcpIHtcbiAgICAgKiAgIHJldHVybiBzdHJpbmcuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoMSkudG9Mb3dlckNhc2UoKTtcbiAgICAgKiB9XG4gICAgICpcbiAgICAgKiBfLm1peGluKHsgJ2NhcGl0YWxpemUnOiBjYXBpdGFsaXplIH0pO1xuICAgICAqIF8uY2FwaXRhbGl6ZSgnZnJlZCcpO1xuICAgICAqIC8vID0+ICdGcmVkJ1xuICAgICAqXG4gICAgICogXygnZnJlZCcpLmNhcGl0YWxpemUoKS52YWx1ZSgpO1xuICAgICAqIC8vID0+ICdGcmVkJ1xuICAgICAqXG4gICAgICogXy5taXhpbih7ICdjYXBpdGFsaXplJzogY2FwaXRhbGl6ZSB9LCB7ICdjaGFpbic6IGZhbHNlIH0pO1xuICAgICAqIF8oJ2ZyZWQnKS5jYXBpdGFsaXplKCk7XG4gICAgICogLy8gPT4gJ0ZyZWQnXG4gICAgICovXG4gICAgZnVuY3Rpb24gbWl4aW4ob2JqZWN0LCBzb3VyY2UsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBjaGFpbiA9IHRydWUsXG4gICAgICAgICAgbWV0aG9kTmFtZXMgPSBzb3VyY2UgJiYgZnVuY3Rpb25zKHNvdXJjZSk7XG5cbiAgICAgIGlmICghc291cmNlIHx8ICghb3B0aW9ucyAmJiAhbWV0aG9kTmFtZXMubGVuZ3RoKSkge1xuICAgICAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICAgICAgb3B0aW9ucyA9IHNvdXJjZTtcbiAgICAgICAgfVxuICAgICAgICBjdG9yID0gbG9kYXNoV3JhcHBlcjtcbiAgICAgICAgc291cmNlID0gb2JqZWN0O1xuICAgICAgICBvYmplY3QgPSBsb2Rhc2g7XG4gICAgICAgIG1ldGhvZE5hbWVzID0gZnVuY3Rpb25zKHNvdXJjZSk7XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucyA9PT0gZmFsc2UpIHtcbiAgICAgICAgY2hhaW4gPSBmYWxzZTtcbiAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3Qob3B0aW9ucykgJiYgJ2NoYWluJyBpbiBvcHRpb25zKSB7XG4gICAgICAgIGNoYWluID0gb3B0aW9ucy5jaGFpbjtcbiAgICAgIH1cbiAgICAgIHZhciBjdG9yID0gb2JqZWN0LFxuICAgICAgICAgIGlzRnVuYyA9IGlzRnVuY3Rpb24oY3Rvcik7XG5cbiAgICAgIGZvckVhY2gobWV0aG9kTmFtZXMsIGZ1bmN0aW9uKG1ldGhvZE5hbWUpIHtcbiAgICAgICAgdmFyIGZ1bmMgPSBvYmplY3RbbWV0aG9kTmFtZV0gPSBzb3VyY2VbbWV0aG9kTmFtZV07XG4gICAgICAgIGlmIChpc0Z1bmMpIHtcbiAgICAgICAgICBjdG9yLnByb3RvdHlwZVttZXRob2ROYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGNoYWluQWxsID0gdGhpcy5fX2NoYWluX18sXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGlzLl9fd3JhcHBlZF9fLFxuICAgICAgICAgICAgICAgIGFyZ3MgPSBbdmFsdWVdO1xuXG4gICAgICAgICAgICBwdXNoLmFwcGx5KGFyZ3MsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gZnVuYy5hcHBseShvYmplY3QsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKGNoYWluIHx8IGNoYWluQWxsKSB7XG4gICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gcmVzdWx0ICYmIGlzT2JqZWN0KHJlc3VsdCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXN1bHQgPSBuZXcgY3RvcihyZXN1bHQpO1xuICAgICAgICAgICAgICByZXN1bHQuX19jaGFpbl9fID0gY2hhaW5BbGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldmVydHMgdGhlICdfJyB2YXJpYWJsZSB0byBpdHMgcHJldmlvdXMgdmFsdWUgYW5kIHJldHVybnMgYSByZWZlcmVuY2UgdG9cbiAgICAgKiB0aGUgYGxvZGFzaGAgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBgbG9kYXNoYCBmdW5jdGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGxvZGFzaCA9IF8ubm9Db25mbGljdCgpO1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIG5vQ29uZmxpY3QoKSB7XG4gICAgICBjb250ZXh0Ll8gPSBvbGREYXNoO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQSBuby1vcGVyYXRpb24gZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBvYmplY3QgPSB7ICduYW1lJzogJ2ZyZWQnIH07XG4gICAgICogXy5ub29wKG9iamVjdCkgPT09IHVuZGVmaW5lZDtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgZnVuY3Rpb24gbm9vcCgpIHtcbiAgICAgIC8vIG5vIG9wZXJhdGlvbiBwZXJmb3JtZWRcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRoYXQgaGF2ZSBlbGFwc2VkIHNpbmNlIHRoZSBVbml4IGVwb2NoXG4gICAgICogKDEgSmFudWFyeSAxOTcwIDAwOjAwOjAwIFVUQykuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBzdGFtcCA9IF8ubm93KCk7XG4gICAgICogXy5kZWZlcihmdW5jdGlvbigpIHsgY29uc29sZS5sb2coXy5ub3coKSAtIHN0YW1wKTsgfSk7XG4gICAgICogLy8gPT4gbG9ncyB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBpdCB0b29rIGZvciB0aGUgZGVmZXJyZWQgZnVuY3Rpb24gdG8gYmUgY2FsbGVkXG4gICAgICovXG4gICAgdmFyIG5vdyA9IGlzTmF0aXZlKG5vdyA9IERhdGUubm93KSAmJiBub3cgfHwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIHRoZSBnaXZlbiB2YWx1ZSBpbnRvIGFuIGludGVnZXIgb2YgdGhlIHNwZWNpZmllZCByYWRpeC5cbiAgICAgKiBJZiBgcmFkaXhgIGlzIGB1bmRlZmluZWRgIG9yIGAwYCBhIGByYWRpeGAgb2YgYDEwYCBpcyB1c2VkIHVubGVzcyB0aGVcbiAgICAgKiBgdmFsdWVgIGlzIGEgaGV4YWRlY2ltYWwsIGluIHdoaWNoIGNhc2UgYSBgcmFkaXhgIG9mIGAxNmAgaXMgdXNlZC5cbiAgICAgKlxuICAgICAqIE5vdGU6IFRoaXMgbWV0aG9kIGF2b2lkcyBkaWZmZXJlbmNlcyBpbiBuYXRpdmUgRVMzIGFuZCBFUzUgYHBhcnNlSW50YFxuICAgICAqIGltcGxlbWVudGF0aW9ucy4gU2VlIGh0dHA6Ly9lczUuZ2l0aHViLmlvLyNFLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcGFyc2UuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtyYWRpeF0gVGhlIHJhZGl4IHVzZWQgdG8gaW50ZXJwcmV0IHRoZSB2YWx1ZSB0byBwYXJzZS5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBuZXcgaW50ZWdlciB2YWx1ZS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5wYXJzZUludCgnMDgnKTtcbiAgICAgKiAvLyA9PiA4XG4gICAgICovXG4gICAgdmFyIHBhcnNlSW50ID0gbmF0aXZlUGFyc2VJbnQod2hpdGVzcGFjZSArICcwOCcpID09IDggPyBuYXRpdmVQYXJzZUludCA6IGZ1bmN0aW9uKHZhbHVlLCByYWRpeCkge1xuICAgICAgLy8gRmlyZWZveCA8IDIxIGFuZCBPcGVyYSA8IDE1IGZvbGxvdyB0aGUgRVMzIHNwZWNpZmllZCBpbXBsZW1lbnRhdGlvbiBvZiBgcGFyc2VJbnRgXG4gICAgICByZXR1cm4gbmF0aXZlUGFyc2VJbnQoaXNTdHJpbmcodmFsdWUpID8gdmFsdWUucmVwbGFjZShyZUxlYWRpbmdTcGFjZXNBbmRaZXJvcywgJycpIDogdmFsdWUsIHJhZGl4IHx8IDApO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgXCJfLnBsdWNrXCIgc3R5bGUgZnVuY3Rpb24sIHdoaWNoIHJldHVybnMgdGhlIGBrZXlgIHZhbHVlIG9mIGFcbiAgICAgKiBnaXZlbiBvYmplY3QuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gcmV0cmlldmUuXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBjaGFyYWN0ZXJzID0gW1xuICAgICAqICAgeyAnbmFtZSc6ICdmcmVkJywgICAnYWdlJzogNDAgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2IH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogdmFyIGdldE5hbWUgPSBfLnByb3BlcnR5KCduYW1lJyk7XG4gICAgICpcbiAgICAgKiBfLm1hcChjaGFyYWN0ZXJzLCBnZXROYW1lKTtcbiAgICAgKiAvLyA9PiBbJ2Jhcm5leScsICdmcmVkJ11cbiAgICAgKlxuICAgICAqIF8uc29ydEJ5KGNoYXJhY3RlcnMsIGdldE5hbWUpO1xuICAgICAqIC8vID0+IFt7ICduYW1lJzogJ2Jhcm5leScsICdhZ2UnOiAzNiB9LCB7ICduYW1lJzogJ2ZyZWQnLCAgICdhZ2UnOiA0MCB9XVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHByb3BlcnR5KGtleSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCkge1xuICAgICAgICByZXR1cm4gb2JqZWN0W2tleV07XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByb2R1Y2VzIGEgcmFuZG9tIG51bWJlciBiZXR3ZWVuIGBtaW5gIGFuZCBgbWF4YCAoaW5jbHVzaXZlKS4gSWYgb25seSBvbmVcbiAgICAgKiBhcmd1bWVudCBpcyBwcm92aWRlZCBhIG51bWJlciBiZXR3ZWVuIGAwYCBhbmQgdGhlIGdpdmVuIG51bWJlciB3aWxsIGJlXG4gICAgICogcmV0dXJuZWQuIElmIGBmbG9hdGluZ2AgaXMgdHJ1ZXkgb3IgZWl0aGVyIGBtaW5gIG9yIGBtYXhgIGFyZSBmbG9hdHMgYVxuICAgICAqIGZsb2F0aW5nLXBvaW50IG51bWJlciB3aWxsIGJlIHJldHVybmVkIGluc3RlYWQgb2YgYW4gaW50ZWdlci5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW21pbj0wXSBUaGUgbWluaW11bSBwb3NzaWJsZSB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW21heD0xXSBUaGUgbWF4aW11bSBwb3NzaWJsZSB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtmbG9hdGluZz1mYWxzZV0gU3BlY2lmeSByZXR1cm5pbmcgYSBmbG9hdGluZy1wb2ludCBudW1iZXIuXG4gICAgICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyBhIHJhbmRvbSBudW1iZXIuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8ucmFuZG9tKDAsIDUpO1xuICAgICAqIC8vID0+IGFuIGludGVnZXIgYmV0d2VlbiAwIGFuZCA1XG4gICAgICpcbiAgICAgKiBfLnJhbmRvbSg1KTtcbiAgICAgKiAvLyA9PiBhbHNvIGFuIGludGVnZXIgYmV0d2VlbiAwIGFuZCA1XG4gICAgICpcbiAgICAgKiBfLnJhbmRvbSg1LCB0cnVlKTtcbiAgICAgKiAvLyA9PiBhIGZsb2F0aW5nLXBvaW50IG51bWJlciBiZXR3ZWVuIDAgYW5kIDVcbiAgICAgKlxuICAgICAqIF8ucmFuZG9tKDEuMiwgNS4yKTtcbiAgICAgKiAvLyA9PiBhIGZsb2F0aW5nLXBvaW50IG51bWJlciBiZXR3ZWVuIDEuMiBhbmQgNS4yXG4gICAgICovXG4gICAgZnVuY3Rpb24gcmFuZG9tKG1pbiwgbWF4LCBmbG9hdGluZykge1xuICAgICAgdmFyIG5vTWluID0gbWluID09IG51bGwsXG4gICAgICAgICAgbm9NYXggPSBtYXggPT0gbnVsbDtcblxuICAgICAgaWYgKGZsb2F0aW5nID09IG51bGwpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBtaW4gPT0gJ2Jvb2xlYW4nICYmIG5vTWF4KSB7XG4gICAgICAgICAgZmxvYXRpbmcgPSBtaW47XG4gICAgICAgICAgbWluID0gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghbm9NYXggJiYgdHlwZW9mIG1heCA9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICBmbG9hdGluZyA9IG1heDtcbiAgICAgICAgICBub01heCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChub01pbiAmJiBub01heCkge1xuICAgICAgICBtYXggPSAxO1xuICAgICAgfVxuICAgICAgbWluID0gK21pbiB8fCAwO1xuICAgICAgaWYgKG5vTWF4KSB7XG4gICAgICAgIG1heCA9IG1pbjtcbiAgICAgICAgbWluID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1heCA9ICttYXggfHwgMDtcbiAgICAgIH1cbiAgICAgIGlmIChmbG9hdGluZyB8fCBtaW4gJSAxIHx8IG1heCAlIDEpIHtcbiAgICAgICAgdmFyIHJhbmQgPSBuYXRpdmVSYW5kb20oKTtcbiAgICAgICAgcmV0dXJuIG5hdGl2ZU1pbihtaW4gKyAocmFuZCAqIChtYXggLSBtaW4gKyBwYXJzZUZsb2F0KCcxZS0nICsgKChyYW5kICsnJykubGVuZ3RoIC0gMSkpKSksIG1heCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYmFzZVJhbmRvbShtaW4sIG1heCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzb2x2ZXMgdGhlIHZhbHVlIG9mIHByb3BlcnR5IGBrZXlgIG9uIGBvYmplY3RgLiBJZiBga2V5YCBpcyBhIGZ1bmN0aW9uXG4gICAgICogaXQgd2lsbCBiZSBpbnZva2VkIHdpdGggdGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBvYmplY3RgIGFuZCBpdHMgcmVzdWx0IHJldHVybmVkLFxuICAgICAqIGVsc2UgdGhlIHByb3BlcnR5IHZhbHVlIGlzIHJldHVybmVkLiBJZiBgb2JqZWN0YCBpcyBmYWxzZXkgdGhlbiBgdW5kZWZpbmVkYFxuICAgICAqIGlzIHJldHVybmVkLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpbnNwZWN0LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIHJlc29sdmUuXG4gICAgICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHJlc29sdmVkIHZhbHVlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgb2JqZWN0ID0ge1xuICAgICAqICAgJ2NoZWVzZSc6ICdjcnVtcGV0cycsXG4gICAgICogICAnc3R1ZmYnOiBmdW5jdGlvbigpIHtcbiAgICAgKiAgICAgcmV0dXJuICdub25zZW5zZSc7XG4gICAgICogICB9XG4gICAgICogfTtcbiAgICAgKlxuICAgICAqIF8ucmVzdWx0KG9iamVjdCwgJ2NoZWVzZScpO1xuICAgICAqIC8vID0+ICdjcnVtcGV0cydcbiAgICAgKlxuICAgICAqIF8ucmVzdWx0KG9iamVjdCwgJ3N0dWZmJyk7XG4gICAgICogLy8gPT4gJ25vbnNlbnNlJ1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJlc3VsdChvYmplY3QsIGtleSkge1xuICAgICAgaWYgKG9iamVjdCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBvYmplY3Rba2V5XTtcbiAgICAgICAgcmV0dXJuIGlzRnVuY3Rpb24odmFsdWUpID8gb2JqZWN0W2tleV0oKSA6IHZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEEgbWljcm8tdGVtcGxhdGluZyBtZXRob2QgdGhhdCBoYW5kbGVzIGFyYml0cmFyeSBkZWxpbWl0ZXJzLCBwcmVzZXJ2ZXNcbiAgICAgKiB3aGl0ZXNwYWNlLCBhbmQgY29ycmVjdGx5IGVzY2FwZXMgcXVvdGVzIHdpdGhpbiBpbnRlcnBvbGF0ZWQgY29kZS5cbiAgICAgKlxuICAgICAqIE5vdGU6IEluIHRoZSBkZXZlbG9wbWVudCBidWlsZCwgYF8udGVtcGxhdGVgIHV0aWxpemVzIHNvdXJjZVVSTHMgZm9yIGVhc2llclxuICAgICAqIGRlYnVnZ2luZy4gU2VlIGh0dHA6Ly93d3cuaHRtbDVyb2Nrcy5jb20vZW4vdHV0b3JpYWxzL2RldmVsb3BlcnRvb2xzL3NvdXJjZW1hcHMvI3RvYy1zb3VyY2V1cmxcbiAgICAgKlxuICAgICAqIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIHByZWNvbXBpbGluZyB0ZW1wbGF0ZXMgc2VlOlxuICAgICAqIGh0dHA6Ly9sb2Rhc2guY29tL2N1c3RvbS1idWlsZHNcbiAgICAgKlxuICAgICAqIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIENocm9tZSBleHRlbnNpb24gc2FuZGJveGVzIHNlZTpcbiAgICAgKiBodHRwOi8vZGV2ZWxvcGVyLmNocm9tZS5jb20vc3RhYmxlL2V4dGVuc2lvbnMvc2FuZGJveGluZ0V2YWwuaHRtbFxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFRoZSB0ZW1wbGF0ZSB0ZXh0LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIFRoZSBkYXRhIG9iamVjdCB1c2VkIHRvIHBvcHVsYXRlIHRoZSB0ZXh0LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7UmVnRXhwfSBbb3B0aW9ucy5lc2NhcGVdIFRoZSBcImVzY2FwZVwiIGRlbGltaXRlci5cbiAgICAgKiBAcGFyYW0ge1JlZ0V4cH0gW29wdGlvbnMuZXZhbHVhdGVdIFRoZSBcImV2YWx1YXRlXCIgZGVsaW1pdGVyLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucy5pbXBvcnRzXSBBbiBvYmplY3QgdG8gaW1wb3J0IGludG8gdGhlIHRlbXBsYXRlIGFzIGxvY2FsIHZhcmlhYmxlcy5cbiAgICAgKiBAcGFyYW0ge1JlZ0V4cH0gW29wdGlvbnMuaW50ZXJwb2xhdGVdIFRoZSBcImludGVycG9sYXRlXCIgZGVsaW1pdGVyLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc291cmNlVVJMXSBUaGUgc291cmNlVVJMIG9mIHRoZSB0ZW1wbGF0ZSdzIGNvbXBpbGVkIHNvdXJjZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3ZhcmlhYmxlXSBUaGUgZGF0YSBvYmplY3QgdmFyaWFibGUgbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb258c3RyaW5nfSBSZXR1cm5zIGEgY29tcGlsZWQgZnVuY3Rpb24gd2hlbiBubyBgZGF0YWAgb2JqZWN0XG4gICAgICogIGlzIGdpdmVuLCBlbHNlIGl0IHJldHVybnMgdGhlIGludGVycG9sYXRlZCB0ZXh0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAvLyB1c2luZyB0aGUgXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlciB0byBjcmVhdGUgYSBjb21waWxlZCB0ZW1wbGF0ZVxuICAgICAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJ2hlbGxvIDwlPSBuYW1lICU+Jyk7XG4gICAgICogY29tcGlsZWQoeyAnbmFtZSc6ICdmcmVkJyB9KTtcbiAgICAgKiAvLyA9PiAnaGVsbG8gZnJlZCdcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIHRoZSBcImVzY2FwZVwiIGRlbGltaXRlciB0byBlc2NhcGUgSFRNTCBpbiBkYXRhIHByb3BlcnR5IHZhbHVlc1xuICAgICAqIF8udGVtcGxhdGUoJzxiPjwlLSB2YWx1ZSAlPjwvYj4nLCB7ICd2YWx1ZSc6ICc8c2NyaXB0PicgfSk7XG4gICAgICogLy8gPT4gJzxiPiZsdDtzY3JpcHQmZ3Q7PC9iPidcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIHRoZSBcImV2YWx1YXRlXCIgZGVsaW1pdGVyIHRvIGdlbmVyYXRlIEhUTUxcbiAgICAgKiB2YXIgbGlzdCA9ICc8JSBfLmZvckVhY2gocGVvcGxlLCBmdW5jdGlvbihuYW1lKSB7ICU+PGxpPjwlLSBuYW1lICU+PC9saT48JSB9KTsgJT4nO1xuICAgICAqIF8udGVtcGxhdGUobGlzdCwgeyAncGVvcGxlJzogWydmcmVkJywgJ2Jhcm5leSddIH0pO1xuICAgICAqIC8vID0+ICc8bGk+ZnJlZDwvbGk+PGxpPmJhcm5leTwvbGk+J1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgdGhlIEVTNiBkZWxpbWl0ZXIgYXMgYW4gYWx0ZXJuYXRpdmUgdG8gdGhlIGRlZmF1bHQgXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlclxuICAgICAqIF8udGVtcGxhdGUoJ2hlbGxvICR7IG5hbWUgfScsIHsgJ25hbWUnOiAncGViYmxlcycgfSk7XG4gICAgICogLy8gPT4gJ2hlbGxvIHBlYmJsZXMnXG4gICAgICpcbiAgICAgKiAvLyB1c2luZyB0aGUgaW50ZXJuYWwgYHByaW50YCBmdW5jdGlvbiBpbiBcImV2YWx1YXRlXCIgZGVsaW1pdGVyc1xuICAgICAqIF8udGVtcGxhdGUoJzwlIHByaW50KFwiaGVsbG8gXCIgKyBuYW1lKTsgJT4hJywgeyAnbmFtZSc6ICdiYXJuZXknIH0pO1xuICAgICAqIC8vID0+ICdoZWxsbyBiYXJuZXkhJ1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgYSBjdXN0b20gdGVtcGxhdGUgZGVsaW1pdGVyc1xuICAgICAqIF8udGVtcGxhdGVTZXR0aW5ncyA9IHtcbiAgICAgKiAgICdpbnRlcnBvbGF0ZSc6IC97eyhbXFxzXFxTXSs/KX19L2dcbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogXy50ZW1wbGF0ZSgnaGVsbG8ge3sgbmFtZSB9fSEnLCB7ICduYW1lJzogJ211c3RhY2hlJyB9KTtcbiAgICAgKiAvLyA9PiAnaGVsbG8gbXVzdGFjaGUhJ1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgdGhlIGBpbXBvcnRzYCBvcHRpb24gdG8gaW1wb3J0IGpRdWVyeVxuICAgICAqIHZhciBsaXN0ID0gJzwlIGpxLmVhY2gocGVvcGxlLCBmdW5jdGlvbihuYW1lKSB7ICU+PGxpPjwlLSBuYW1lICU+PC9saT48JSB9KTsgJT4nO1xuICAgICAqIF8udGVtcGxhdGUobGlzdCwgeyAncGVvcGxlJzogWydmcmVkJywgJ2Jhcm5leSddIH0sIHsgJ2ltcG9ydHMnOiB7ICdqcSc6IGpRdWVyeSB9IH0pO1xuICAgICAqIC8vID0+ICc8bGk+ZnJlZDwvbGk+PGxpPmJhcm5leTwvbGk+J1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgdGhlIGBzb3VyY2VVUkxgIG9wdGlvbiB0byBzcGVjaWZ5IGEgY3VzdG9tIHNvdXJjZVVSTCBmb3IgdGhlIHRlbXBsYXRlXG4gICAgICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnaGVsbG8gPCU9IG5hbWUgJT4nLCBudWxsLCB7ICdzb3VyY2VVUkwnOiAnL2Jhc2ljL2dyZWV0aW5nLmpzdCcgfSk7XG4gICAgICogY29tcGlsZWQoZGF0YSk7XG4gICAgICogLy8gPT4gZmluZCB0aGUgc291cmNlIG9mIFwiZ3JlZXRpbmcuanN0XCIgdW5kZXIgdGhlIFNvdXJjZXMgdGFiIG9yIFJlc291cmNlcyBwYW5lbCBvZiB0aGUgd2ViIGluc3BlY3RvclxuICAgICAqXG4gICAgICogLy8gdXNpbmcgdGhlIGB2YXJpYWJsZWAgb3B0aW9uIHRvIGVuc3VyZSBhIHdpdGgtc3RhdGVtZW50IGlzbid0IHVzZWQgaW4gdGhlIGNvbXBpbGVkIHRlbXBsYXRlXG4gICAgICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnaGkgPCU9IGRhdGEubmFtZSAlPiEnLCBudWxsLCB7ICd2YXJpYWJsZSc6ICdkYXRhJyB9KTtcbiAgICAgKiBjb21waWxlZC5zb3VyY2U7XG4gICAgICogLy8gPT4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAqICAgdmFyIF9fdCwgX19wID0gJycsIF9fZSA9IF8uZXNjYXBlO1xuICAgICAqICAgX19wICs9ICdoaSAnICsgKChfX3QgPSAoIGRhdGEubmFtZSApKSA9PSBudWxsID8gJycgOiBfX3QpICsgJyEnO1xuICAgICAqICAgcmV0dXJuIF9fcDtcbiAgICAgKiB9XG4gICAgICpcbiAgICAgKiAvLyB1c2luZyB0aGUgYHNvdXJjZWAgcHJvcGVydHkgdG8gaW5saW5lIGNvbXBpbGVkIHRlbXBsYXRlcyBmb3IgbWVhbmluZ2Z1bFxuICAgICAqIC8vIGxpbmUgbnVtYmVycyBpbiBlcnJvciBtZXNzYWdlcyBhbmQgYSBzdGFjayB0cmFjZVxuICAgICAqIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKGN3ZCwgJ2pzdC5qcycpLCAnXFxcbiAgICAgKiAgIHZhciBKU1QgPSB7XFxcbiAgICAgKiAgICAgXCJtYWluXCI6ICcgKyBfLnRlbXBsYXRlKG1haW5UZXh0KS5zb3VyY2UgKyAnXFxcbiAgICAgKiAgIH07XFxcbiAgICAgKiAnKTtcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0ZW1wbGF0ZSh0ZXh0LCBkYXRhLCBvcHRpb25zKSB7XG4gICAgICAvLyBiYXNlZCBvbiBKb2huIFJlc2lnJ3MgYHRtcGxgIGltcGxlbWVudGF0aW9uXG4gICAgICAvLyBodHRwOi8vZWpvaG4ub3JnL2Jsb2cvamF2YXNjcmlwdC1taWNyby10ZW1wbGF0aW5nL1xuICAgICAgLy8gYW5kIExhdXJhIERva3Rvcm92YSdzIGRvVC5qc1xuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL29sYWRvL2RvVFxuICAgICAgdmFyIHNldHRpbmdzID0gbG9kYXNoLnRlbXBsYXRlU2V0dGluZ3M7XG4gICAgICB0ZXh0ID0gU3RyaW5nKHRleHQgfHwgJycpO1xuXG4gICAgICAvLyBhdm9pZCBtaXNzaW5nIGRlcGVuZGVuY2llcyB3aGVuIGBpdGVyYXRvclRlbXBsYXRlYCBpcyBub3QgZGVmaW5lZFxuICAgICAgb3B0aW9ucyA9IGRlZmF1bHRzKHt9LCBvcHRpb25zLCBzZXR0aW5ncyk7XG5cbiAgICAgIHZhciBpbXBvcnRzID0gZGVmYXVsdHMoe30sIG9wdGlvbnMuaW1wb3J0cywgc2V0dGluZ3MuaW1wb3J0cyksXG4gICAgICAgICAgaW1wb3J0c0tleXMgPSBrZXlzKGltcG9ydHMpLFxuICAgICAgICAgIGltcG9ydHNWYWx1ZXMgPSB2YWx1ZXMoaW1wb3J0cyk7XG5cbiAgICAgIHZhciBpc0V2YWx1YXRpbmcsXG4gICAgICAgICAgaW5kZXggPSAwLFxuICAgICAgICAgIGludGVycG9sYXRlID0gb3B0aW9ucy5pbnRlcnBvbGF0ZSB8fCByZU5vTWF0Y2gsXG4gICAgICAgICAgc291cmNlID0gXCJfX3AgKz0gJ1wiO1xuXG4gICAgICAvLyBjb21waWxlIHRoZSByZWdleHAgdG8gbWF0Y2ggZWFjaCBkZWxpbWl0ZXJcbiAgICAgIHZhciByZURlbGltaXRlcnMgPSBSZWdFeHAoXG4gICAgICAgIChvcHRpb25zLmVzY2FwZSB8fCByZU5vTWF0Y2gpLnNvdXJjZSArICd8JyArXG4gICAgICAgIGludGVycG9sYXRlLnNvdXJjZSArICd8JyArXG4gICAgICAgIChpbnRlcnBvbGF0ZSA9PT0gcmVJbnRlcnBvbGF0ZSA/IHJlRXNUZW1wbGF0ZSA6IHJlTm9NYXRjaCkuc291cmNlICsgJ3wnICtcbiAgICAgICAgKG9wdGlvbnMuZXZhbHVhdGUgfHwgcmVOb01hdGNoKS5zb3VyY2UgKyAnfCQnXG4gICAgICAsICdnJyk7XG5cbiAgICAgIHRleHQucmVwbGFjZShyZURlbGltaXRlcnMsIGZ1bmN0aW9uKG1hdGNoLCBlc2NhcGVWYWx1ZSwgaW50ZXJwb2xhdGVWYWx1ZSwgZXNUZW1wbGF0ZVZhbHVlLCBldmFsdWF0ZVZhbHVlLCBvZmZzZXQpIHtcbiAgICAgICAgaW50ZXJwb2xhdGVWYWx1ZSB8fCAoaW50ZXJwb2xhdGVWYWx1ZSA9IGVzVGVtcGxhdGVWYWx1ZSk7XG5cbiAgICAgICAgLy8gZXNjYXBlIGNoYXJhY3RlcnMgdGhhdCBjYW5ub3QgYmUgaW5jbHVkZWQgaW4gc3RyaW5nIGxpdGVyYWxzXG4gICAgICAgIHNvdXJjZSArPSB0ZXh0LnNsaWNlKGluZGV4LCBvZmZzZXQpLnJlcGxhY2UocmVVbmVzY2FwZWRTdHJpbmcsIGVzY2FwZVN0cmluZ0NoYXIpO1xuXG4gICAgICAgIC8vIHJlcGxhY2UgZGVsaW1pdGVycyB3aXRoIHNuaXBwZXRzXG4gICAgICAgIGlmIChlc2NhcGVWYWx1ZSkge1xuICAgICAgICAgIHNvdXJjZSArPSBcIicgK1xcbl9fZShcIiArIGVzY2FwZVZhbHVlICsgXCIpICtcXG4nXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2YWx1YXRlVmFsdWUpIHtcbiAgICAgICAgICBpc0V2YWx1YXRpbmcgPSB0cnVlO1xuICAgICAgICAgIHNvdXJjZSArPSBcIic7XFxuXCIgKyBldmFsdWF0ZVZhbHVlICsgXCI7XFxuX19wICs9ICdcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW50ZXJwb2xhdGVWYWx1ZSkge1xuICAgICAgICAgIHNvdXJjZSArPSBcIicgK1xcbigoX190ID0gKFwiICsgaW50ZXJwb2xhdGVWYWx1ZSArIFwiKSkgPT0gbnVsbCA/ICcnIDogX190KSArXFxuJ1wiO1xuICAgICAgICB9XG4gICAgICAgIGluZGV4ID0gb2Zmc2V0ICsgbWF0Y2gubGVuZ3RoO1xuXG4gICAgICAgIC8vIHRoZSBKUyBlbmdpbmUgZW1iZWRkZWQgaW4gQWRvYmUgcHJvZHVjdHMgcmVxdWlyZXMgcmV0dXJuaW5nIHRoZSBgbWF0Y2hgXG4gICAgICAgIC8vIHN0cmluZyBpbiBvcmRlciB0byBwcm9kdWNlIHRoZSBjb3JyZWN0IGBvZmZzZXRgIHZhbHVlXG4gICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgIH0pO1xuXG4gICAgICBzb3VyY2UgKz0gXCInO1xcblwiO1xuXG4gICAgICAvLyBpZiBgdmFyaWFibGVgIGlzIG5vdCBzcGVjaWZpZWQsIHdyYXAgYSB3aXRoLXN0YXRlbWVudCBhcm91bmQgdGhlIGdlbmVyYXRlZFxuICAgICAgLy8gY29kZSB0byBhZGQgdGhlIGRhdGEgb2JqZWN0IHRvIHRoZSB0b3Agb2YgdGhlIHNjb3BlIGNoYWluXG4gICAgICB2YXIgdmFyaWFibGUgPSBvcHRpb25zLnZhcmlhYmxlLFxuICAgICAgICAgIGhhc1ZhcmlhYmxlID0gdmFyaWFibGU7XG5cbiAgICAgIGlmICghaGFzVmFyaWFibGUpIHtcbiAgICAgICAgdmFyaWFibGUgPSAnb2JqJztcbiAgICAgICAgc291cmNlID0gJ3dpdGggKCcgKyB2YXJpYWJsZSArICcpIHtcXG4nICsgc291cmNlICsgJ1xcbn1cXG4nO1xuICAgICAgfVxuICAgICAgLy8gY2xlYW51cCBjb2RlIGJ5IHN0cmlwcGluZyBlbXB0eSBzdHJpbmdzXG4gICAgICBzb3VyY2UgPSAoaXNFdmFsdWF0aW5nID8gc291cmNlLnJlcGxhY2UocmVFbXB0eVN0cmluZ0xlYWRpbmcsICcnKSA6IHNvdXJjZSlcbiAgICAgICAgLnJlcGxhY2UocmVFbXB0eVN0cmluZ01pZGRsZSwgJyQxJylcbiAgICAgICAgLnJlcGxhY2UocmVFbXB0eVN0cmluZ1RyYWlsaW5nLCAnJDE7Jyk7XG5cbiAgICAgIC8vIGZyYW1lIGNvZGUgYXMgdGhlIGZ1bmN0aW9uIGJvZHlcbiAgICAgIHNvdXJjZSA9ICdmdW5jdGlvbignICsgdmFyaWFibGUgKyAnKSB7XFxuJyArXG4gICAgICAgIChoYXNWYXJpYWJsZSA/ICcnIDogdmFyaWFibGUgKyAnIHx8ICgnICsgdmFyaWFibGUgKyAnID0ge30pO1xcbicpICtcbiAgICAgICAgXCJ2YXIgX190LCBfX3AgPSAnJywgX19lID0gXy5lc2NhcGVcIiArXG4gICAgICAgIChpc0V2YWx1YXRpbmdcbiAgICAgICAgICA/ICcsIF9faiA9IEFycmF5LnByb3RvdHlwZS5qb2luO1xcbicgK1xuICAgICAgICAgICAgXCJmdW5jdGlvbiBwcmludCgpIHsgX19wICs9IF9fai5jYWxsKGFyZ3VtZW50cywgJycpIH1cXG5cIlxuICAgICAgICAgIDogJztcXG4nXG4gICAgICAgICkgK1xuICAgICAgICBzb3VyY2UgK1xuICAgICAgICAncmV0dXJuIF9fcFxcbn0nO1xuXG4gICAgICAvLyBVc2UgYSBzb3VyY2VVUkwgZm9yIGVhc2llciBkZWJ1Z2dpbmcuXG4gICAgICAvLyBodHRwOi8vd3d3Lmh0bWw1cm9ja3MuY29tL2VuL3R1dG9yaWFscy9kZXZlbG9wZXJ0b29scy9zb3VyY2VtYXBzLyN0b2Mtc291cmNldXJsXG4gICAgICB2YXIgc291cmNlVVJMID0gJ1xcbi8qXFxuLy8jIHNvdXJjZVVSTD0nICsgKG9wdGlvbnMuc291cmNlVVJMIHx8ICcvbG9kYXNoL3RlbXBsYXRlL3NvdXJjZVsnICsgKHRlbXBsYXRlQ291bnRlcisrKSArICddJykgKyAnXFxuKi8nO1xuXG4gICAgICB0cnkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gRnVuY3Rpb24oaW1wb3J0c0tleXMsICdyZXR1cm4gJyArIHNvdXJjZSArIHNvdXJjZVVSTCkuYXBwbHkodW5kZWZpbmVkLCBpbXBvcnRzVmFsdWVzKTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICBlLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQoZGF0YSk7XG4gICAgICB9XG4gICAgICAvLyBwcm92aWRlIHRoZSBjb21waWxlZCBmdW5jdGlvbidzIHNvdXJjZSBieSBpdHMgYHRvU3RyaW5nYCBtZXRob2QsIGluXG4gICAgICAvLyBzdXBwb3J0ZWQgZW52aXJvbm1lbnRzLCBvciB0aGUgYHNvdXJjZWAgcHJvcGVydHkgYXMgYSBjb252ZW5pZW5jZSBmb3JcbiAgICAgIC8vIGlubGluaW5nIGNvbXBpbGVkIHRlbXBsYXRlcyBkdXJpbmcgdGhlIGJ1aWxkIHByb2Nlc3NcbiAgICAgIHJlc3VsdC5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGVzIHRoZSBjYWxsYmFjayBgbmAgdGltZXMsIHJldHVybmluZyBhbiBhcnJheSBvZiB0aGUgcmVzdWx0c1xuICAgICAqIG9mIGVhY2ggY2FsbGJhY2sgZXhlY3V0aW9uLiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZCBpbnZva2VkXG4gICAgICogd2l0aCBvbmUgYXJndW1lbnQ7IChpbmRleCkuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG4gVGhlIG51bWJlciBvZiB0aW1lcyB0byBleGVjdXRlIHRoZSBjYWxsYmFjay5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGFuIGFycmF5IG9mIHRoZSByZXN1bHRzIG9mIGVhY2ggYGNhbGxiYWNrYCBleGVjdXRpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBkaWNlUm9sbHMgPSBfLnRpbWVzKDMsIF8ucGFydGlhbChfLnJhbmRvbSwgMSwgNikpO1xuICAgICAqIC8vID0+IFszLCA2LCA0XVxuICAgICAqXG4gICAgICogXy50aW1lcygzLCBmdW5jdGlvbihuKSB7IG1hZ2UuY2FzdFNwZWxsKG4pOyB9KTtcbiAgICAgKiAvLyA9PiBjYWxscyBgbWFnZS5jYXN0U3BlbGwobilgIHRocmVlIHRpbWVzLCBwYXNzaW5nIGBuYCBvZiBgMGAsIGAxYCwgYW5kIGAyYCByZXNwZWN0aXZlbHlcbiAgICAgKlxuICAgICAqIF8udGltZXMoMywgZnVuY3Rpb24obikgeyB0aGlzLmNhc3Qobik7IH0sIG1hZ2UpO1xuICAgICAqIC8vID0+IGFsc28gY2FsbHMgYG1hZ2UuY2FzdFNwZWxsKG4pYCB0aHJlZSB0aW1lc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRpbWVzKG4sIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICBuID0gKG4gPSArbikgPiAtMSA/IG4gOiAwO1xuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgcmVzdWx0ID0gQXJyYXkobik7XG5cbiAgICAgIGNhbGxiYWNrID0gYmFzZUNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAxKTtcbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbikge1xuICAgICAgICByZXN1bHRbaW5kZXhdID0gY2FsbGJhY2soaW5kZXgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgaW52ZXJzZSBvZiBgXy5lc2NhcGVgIHRoaXMgbWV0aG9kIGNvbnZlcnRzIHRoZSBIVE1MIGVudGl0aWVzXG4gICAgICogYCZhbXA7YCwgYCZsdDtgLCBgJmd0O2AsIGAmcXVvdDtgLCBhbmQgYCYjMzk7YCBpbiBgc3RyaW5nYCB0byB0aGVpclxuICAgICAqIGNvcnJlc3BvbmRpbmcgY2hhcmFjdGVycy5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIFRoZSBzdHJpbmcgdG8gdW5lc2NhcGUuXG4gICAgICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgdW5lc2NhcGVkIHN0cmluZy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy51bmVzY2FwZSgnRnJlZCwgQmFybmV5ICZhbXA7IFBlYmJsZXMnKTtcbiAgICAgKiAvLyA9PiAnRnJlZCwgQmFybmV5ICYgUGViYmxlcydcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB1bmVzY2FwZShzdHJpbmcpIHtcbiAgICAgIHJldHVybiBzdHJpbmcgPT0gbnVsbCA/ICcnIDogU3RyaW5nKHN0cmluZykucmVwbGFjZShyZUVzY2FwZWRIdG1sLCB1bmVzY2FwZUh0bWxDaGFyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZXMgYSB1bmlxdWUgSUQuIElmIGBwcmVmaXhgIGlzIHByb3ZpZGVkIHRoZSBJRCB3aWxsIGJlIGFwcGVuZGVkIHRvIGl0LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbcHJlZml4XSBUaGUgdmFsdWUgdG8gcHJlZml4IHRoZSBJRCB3aXRoLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHVuaXF1ZSBJRC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy51bmlxdWVJZCgnY29udGFjdF8nKTtcbiAgICAgKiAvLyA9PiAnY29udGFjdF8xMDQnXG4gICAgICpcbiAgICAgKiBfLnVuaXF1ZUlkKCk7XG4gICAgICogLy8gPT4gJzEwNSdcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB1bmlxdWVJZChwcmVmaXgpIHtcbiAgICAgIHZhciBpZCA9ICsraWRDb3VudGVyO1xuICAgICAgcmV0dXJuIFN0cmluZyhwcmVmaXggPT0gbnVsbCA/ICcnIDogcHJlZml4KSArIGlkO1xuICAgIH1cblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGBsb2Rhc2hgIG9iamVjdCB0aGF0IHdyYXBzIHRoZSBnaXZlbiB2YWx1ZSB3aXRoIGV4cGxpY2l0XG4gICAgICogbWV0aG9kIGNoYWluaW5nIGVuYWJsZWQuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQ2hhaW5pbmdcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byB3cmFwLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIHdyYXBwZXIgb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgICdhZ2UnOiAzNiB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdmcmVkJywgICAgJ2FnZSc6IDQwIH0sXG4gICAgICogICB7ICduYW1lJzogJ3BlYmJsZXMnLCAnYWdlJzogMSB9XG4gICAgICogXTtcbiAgICAgKlxuICAgICAqIHZhciB5b3VuZ2VzdCA9IF8uY2hhaW4oY2hhcmFjdGVycylcbiAgICAgKiAgICAgLnNvcnRCeSgnYWdlJylcbiAgICAgKiAgICAgLm1hcChmdW5jdGlvbihjaHIpIHsgcmV0dXJuIGNoci5uYW1lICsgJyBpcyAnICsgY2hyLmFnZTsgfSlcbiAgICAgKiAgICAgLmZpcnN0KClcbiAgICAgKiAgICAgLnZhbHVlKCk7XG4gICAgICogLy8gPT4gJ3BlYmJsZXMgaXMgMSdcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjaGFpbih2YWx1ZSkge1xuICAgICAgdmFsdWUgPSBuZXcgbG9kYXNoV3JhcHBlcih2YWx1ZSk7XG4gICAgICB2YWx1ZS5fX2NoYWluX18gPSB0cnVlO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZXMgYGludGVyY2VwdG9yYCB3aXRoIHRoZSBgdmFsdWVgIGFzIHRoZSBmaXJzdCBhcmd1bWVudCBhbmQgdGhlblxuICAgICAqIHJldHVybnMgYHZhbHVlYC4gVGhlIHB1cnBvc2Ugb2YgdGhpcyBtZXRob2QgaXMgdG8gXCJ0YXAgaW50b1wiIGEgbWV0aG9kXG4gICAgICogY2hhaW4gaW4gb3JkZXIgdG8gcGVyZm9ybSBvcGVyYXRpb25zIG9uIGludGVybWVkaWF0ZSByZXN1bHRzIHdpdGhpblxuICAgICAqIHRoZSBjaGFpbi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBDaGFpbmluZ1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb3ZpZGUgdG8gYGludGVyY2VwdG9yYC5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBpbnRlcmNlcHRvciBUaGUgZnVuY3Rpb24gdG8gaW52b2tlLlxuICAgICAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIGB2YWx1ZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8oWzEsIDIsIDMsIDRdKVxuICAgICAqICAudGFwKGZ1bmN0aW9uKGFycmF5KSB7IGFycmF5LnBvcCgpOyB9KVxuICAgICAqICAucmV2ZXJzZSgpXG4gICAgICogIC52YWx1ZSgpO1xuICAgICAqIC8vID0+IFszLCAyLCAxXVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRhcCh2YWx1ZSwgaW50ZXJjZXB0b3IpIHtcbiAgICAgIGludGVyY2VwdG9yKHZhbHVlKTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbmFibGVzIGV4cGxpY2l0IG1ldGhvZCBjaGFpbmluZyBvbiB0aGUgd3JhcHBlciBvYmplY3QuXG4gICAgICpcbiAgICAgKiBAbmFtZSBjaGFpblxuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IENoYWluaW5nXG4gICAgICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHdyYXBwZXIgb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2IH0sXG4gICAgICogICB7ICduYW1lJzogJ2ZyZWQnLCAgICdhZ2UnOiA0MCB9XG4gICAgICogXTtcbiAgICAgKlxuICAgICAqIC8vIHdpdGhvdXQgZXhwbGljaXQgY2hhaW5pbmdcbiAgICAgKiBfKGNoYXJhY3RlcnMpLmZpcnN0KCk7XG4gICAgICogLy8gPT4geyAnbmFtZSc6ICdiYXJuZXknLCAnYWdlJzogMzYgfVxuICAgICAqXG4gICAgICogLy8gd2l0aCBleHBsaWNpdCBjaGFpbmluZ1xuICAgICAqIF8oY2hhcmFjdGVycykuY2hhaW4oKVxuICAgICAqICAgLmZpcnN0KClcbiAgICAgKiAgIC5waWNrKCdhZ2UnKVxuICAgICAqICAgLnZhbHVlKCk7XG4gICAgICogLy8gPT4geyAnYWdlJzogMzYgfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHdyYXBwZXJDaGFpbigpIHtcbiAgICAgIHRoaXMuX19jaGFpbl9fID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByb2R1Y2VzIHRoZSBgdG9TdHJpbmdgIHJlc3VsdCBvZiB0aGUgd3JhcHBlZCB2YWx1ZS5cbiAgICAgKlxuICAgICAqIEBuYW1lIHRvU3RyaW5nXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQ2hhaW5pbmdcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBzdHJpbmcgcmVzdWx0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfKFsxLCAyLCAzXSkudG9TdHJpbmcoKTtcbiAgICAgKiAvLyA9PiAnMSwyLDMnXG4gICAgICovXG4gICAgZnVuY3Rpb24gd3JhcHBlclRvU3RyaW5nKCkge1xuICAgICAgcmV0dXJuIFN0cmluZyh0aGlzLl9fd3JhcHBlZF9fKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeHRyYWN0cyB0aGUgd3JhcHBlZCB2YWx1ZS5cbiAgICAgKlxuICAgICAqIEBuYW1lIHZhbHVlT2ZcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBhbGlhcyB2YWx1ZVxuICAgICAqIEBjYXRlZ29yeSBDaGFpbmluZ1xuICAgICAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSB3cmFwcGVkIHZhbHVlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfKFsxLCAyLCAzXSkudmFsdWVPZigpO1xuICAgICAqIC8vID0+IFsxLCAyLCAzXVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHdyYXBwZXJWYWx1ZU9mKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX193cmFwcGVkX187XG4gICAgfVxuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvLyBhZGQgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIHdyYXBwZWQgdmFsdWVzIHdoZW4gY2hhaW5pbmdcbiAgICBsb2Rhc2guYWZ0ZXIgPSBhZnRlcjtcbiAgICBsb2Rhc2guYXNzaWduID0gYXNzaWduO1xuICAgIGxvZGFzaC5hdCA9IGF0O1xuICAgIGxvZGFzaC5iaW5kID0gYmluZDtcbiAgICBsb2Rhc2guYmluZEFsbCA9IGJpbmRBbGw7XG4gICAgbG9kYXNoLmJpbmRLZXkgPSBiaW5kS2V5O1xuICAgIGxvZGFzaC5jaGFpbiA9IGNoYWluO1xuICAgIGxvZGFzaC5jb21wYWN0ID0gY29tcGFjdDtcbiAgICBsb2Rhc2guY29tcG9zZSA9IGNvbXBvc2U7XG4gICAgbG9kYXNoLmNvbnN0YW50ID0gY29uc3RhbnQ7XG4gICAgbG9kYXNoLmNvdW50QnkgPSBjb3VudEJ5O1xuICAgIGxvZGFzaC5jcmVhdGUgPSBjcmVhdGU7XG4gICAgbG9kYXNoLmNyZWF0ZUNhbGxiYWNrID0gY3JlYXRlQ2FsbGJhY2s7XG4gICAgbG9kYXNoLmN1cnJ5ID0gY3Vycnk7XG4gICAgbG9kYXNoLmRlYm91bmNlID0gZGVib3VuY2U7XG4gICAgbG9kYXNoLmRlZmF1bHRzID0gZGVmYXVsdHM7XG4gICAgbG9kYXNoLmRlZmVyID0gZGVmZXI7XG4gICAgbG9kYXNoLmRlbGF5ID0gZGVsYXk7XG4gICAgbG9kYXNoLmRpZmZlcmVuY2UgPSBkaWZmZXJlbmNlO1xuICAgIGxvZGFzaC5maWx0ZXIgPSBmaWx0ZXI7XG4gICAgbG9kYXNoLmZsYXR0ZW4gPSBmbGF0dGVuO1xuICAgIGxvZGFzaC5mb3JFYWNoID0gZm9yRWFjaDtcbiAgICBsb2Rhc2guZm9yRWFjaFJpZ2h0ID0gZm9yRWFjaFJpZ2h0O1xuICAgIGxvZGFzaC5mb3JJbiA9IGZvckluO1xuICAgIGxvZGFzaC5mb3JJblJpZ2h0ID0gZm9ySW5SaWdodDtcbiAgICBsb2Rhc2guZm9yT3duID0gZm9yT3duO1xuICAgIGxvZGFzaC5mb3JPd25SaWdodCA9IGZvck93blJpZ2h0O1xuICAgIGxvZGFzaC5mdW5jdGlvbnMgPSBmdW5jdGlvbnM7XG4gICAgbG9kYXNoLmdyb3VwQnkgPSBncm91cEJ5O1xuICAgIGxvZGFzaC5pbmRleEJ5ID0gaW5kZXhCeTtcbiAgICBsb2Rhc2guaW5pdGlhbCA9IGluaXRpYWw7XG4gICAgbG9kYXNoLmludGVyc2VjdGlvbiA9IGludGVyc2VjdGlvbjtcbiAgICBsb2Rhc2guaW52ZXJ0ID0gaW52ZXJ0O1xuICAgIGxvZGFzaC5pbnZva2UgPSBpbnZva2U7XG4gICAgbG9kYXNoLmtleXMgPSBrZXlzO1xuICAgIGxvZGFzaC5tYXAgPSBtYXA7XG4gICAgbG9kYXNoLm1hcFZhbHVlcyA9IG1hcFZhbHVlcztcbiAgICBsb2Rhc2gubWF4ID0gbWF4O1xuICAgIGxvZGFzaC5tZW1vaXplID0gbWVtb2l6ZTtcbiAgICBsb2Rhc2gubWVyZ2UgPSBtZXJnZTtcbiAgICBsb2Rhc2gubWluID0gbWluO1xuICAgIGxvZGFzaC5vbWl0ID0gb21pdDtcbiAgICBsb2Rhc2gub25jZSA9IG9uY2U7XG4gICAgbG9kYXNoLnBhaXJzID0gcGFpcnM7XG4gICAgbG9kYXNoLnBhcnRpYWwgPSBwYXJ0aWFsO1xuICAgIGxvZGFzaC5wYXJ0aWFsUmlnaHQgPSBwYXJ0aWFsUmlnaHQ7XG4gICAgbG9kYXNoLnBpY2sgPSBwaWNrO1xuICAgIGxvZGFzaC5wbHVjayA9IHBsdWNrO1xuICAgIGxvZGFzaC5wcm9wZXJ0eSA9IHByb3BlcnR5O1xuICAgIGxvZGFzaC5wdWxsID0gcHVsbDtcbiAgICBsb2Rhc2gucmFuZ2UgPSByYW5nZTtcbiAgICBsb2Rhc2gucmVqZWN0ID0gcmVqZWN0O1xuICAgIGxvZGFzaC5yZW1vdmUgPSByZW1vdmU7XG4gICAgbG9kYXNoLnJlc3QgPSByZXN0O1xuICAgIGxvZGFzaC5zaHVmZmxlID0gc2h1ZmZsZTtcbiAgICBsb2Rhc2guc29ydEJ5ID0gc29ydEJ5O1xuICAgIGxvZGFzaC50YXAgPSB0YXA7XG4gICAgbG9kYXNoLnRocm90dGxlID0gdGhyb3R0bGU7XG4gICAgbG9kYXNoLnRpbWVzID0gdGltZXM7XG4gICAgbG9kYXNoLnRvQXJyYXkgPSB0b0FycmF5O1xuICAgIGxvZGFzaC50cmFuc2Zvcm0gPSB0cmFuc2Zvcm07XG4gICAgbG9kYXNoLnVuaW9uID0gdW5pb247XG4gICAgbG9kYXNoLnVuaXEgPSB1bmlxO1xuICAgIGxvZGFzaC52YWx1ZXMgPSB2YWx1ZXM7XG4gICAgbG9kYXNoLndoZXJlID0gd2hlcmU7XG4gICAgbG9kYXNoLndpdGhvdXQgPSB3aXRob3V0O1xuICAgIGxvZGFzaC53cmFwID0gd3JhcDtcbiAgICBsb2Rhc2gueG9yID0geG9yO1xuICAgIGxvZGFzaC56aXAgPSB6aXA7XG4gICAgbG9kYXNoLnppcE9iamVjdCA9IHppcE9iamVjdDtcblxuICAgIC8vIGFkZCBhbGlhc2VzXG4gICAgbG9kYXNoLmNvbGxlY3QgPSBtYXA7XG4gICAgbG9kYXNoLmRyb3AgPSByZXN0O1xuICAgIGxvZGFzaC5lYWNoID0gZm9yRWFjaDtcbiAgICBsb2Rhc2guZWFjaFJpZ2h0ID0gZm9yRWFjaFJpZ2h0O1xuICAgIGxvZGFzaC5leHRlbmQgPSBhc3NpZ247XG4gICAgbG9kYXNoLm1ldGhvZHMgPSBmdW5jdGlvbnM7XG4gICAgbG9kYXNoLm9iamVjdCA9IHppcE9iamVjdDtcbiAgICBsb2Rhc2guc2VsZWN0ID0gZmlsdGVyO1xuICAgIGxvZGFzaC50YWlsID0gcmVzdDtcbiAgICBsb2Rhc2gudW5pcXVlID0gdW5pcTtcbiAgICBsb2Rhc2gudW56aXAgPSB6aXA7XG5cbiAgICAvLyBhZGQgZnVuY3Rpb25zIHRvIGBsb2Rhc2gucHJvdG90eXBlYFxuICAgIG1peGluKGxvZGFzaCk7XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIC8vIGFkZCBmdW5jdGlvbnMgdGhhdCByZXR1cm4gdW53cmFwcGVkIHZhbHVlcyB3aGVuIGNoYWluaW5nXG4gICAgbG9kYXNoLmNsb25lID0gY2xvbmU7XG4gICAgbG9kYXNoLmNsb25lRGVlcCA9IGNsb25lRGVlcDtcbiAgICBsb2Rhc2guY29udGFpbnMgPSBjb250YWlucztcbiAgICBsb2Rhc2guZXNjYXBlID0gZXNjYXBlO1xuICAgIGxvZGFzaC5ldmVyeSA9IGV2ZXJ5O1xuICAgIGxvZGFzaC5maW5kID0gZmluZDtcbiAgICBsb2Rhc2guZmluZEluZGV4ID0gZmluZEluZGV4O1xuICAgIGxvZGFzaC5maW5kS2V5ID0gZmluZEtleTtcbiAgICBsb2Rhc2guZmluZExhc3QgPSBmaW5kTGFzdDtcbiAgICBsb2Rhc2guZmluZExhc3RJbmRleCA9IGZpbmRMYXN0SW5kZXg7XG4gICAgbG9kYXNoLmZpbmRMYXN0S2V5ID0gZmluZExhc3RLZXk7XG4gICAgbG9kYXNoLmhhcyA9IGhhcztcbiAgICBsb2Rhc2guaWRlbnRpdHkgPSBpZGVudGl0eTtcbiAgICBsb2Rhc2guaW5kZXhPZiA9IGluZGV4T2Y7XG4gICAgbG9kYXNoLmlzQXJndW1lbnRzID0gaXNBcmd1bWVudHM7XG4gICAgbG9kYXNoLmlzQXJyYXkgPSBpc0FycmF5O1xuICAgIGxvZGFzaC5pc0Jvb2xlYW4gPSBpc0Jvb2xlYW47XG4gICAgbG9kYXNoLmlzRGF0ZSA9IGlzRGF0ZTtcbiAgICBsb2Rhc2guaXNFbGVtZW50ID0gaXNFbGVtZW50O1xuICAgIGxvZGFzaC5pc0VtcHR5ID0gaXNFbXB0eTtcbiAgICBsb2Rhc2guaXNFcXVhbCA9IGlzRXF1YWw7XG4gICAgbG9kYXNoLmlzRmluaXRlID0gaXNGaW5pdGU7XG4gICAgbG9kYXNoLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuICAgIGxvZGFzaC5pc05hTiA9IGlzTmFOO1xuICAgIGxvZGFzaC5pc051bGwgPSBpc051bGw7XG4gICAgbG9kYXNoLmlzTnVtYmVyID0gaXNOdW1iZXI7XG4gICAgbG9kYXNoLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG4gICAgbG9kYXNoLmlzUGxhaW5PYmplY3QgPSBpc1BsYWluT2JqZWN0O1xuICAgIGxvZGFzaC5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuICAgIGxvZGFzaC5pc1N0cmluZyA9IGlzU3RyaW5nO1xuICAgIGxvZGFzaC5pc1VuZGVmaW5lZCA9IGlzVW5kZWZpbmVkO1xuICAgIGxvZGFzaC5sYXN0SW5kZXhPZiA9IGxhc3RJbmRleE9mO1xuICAgIGxvZGFzaC5taXhpbiA9IG1peGluO1xuICAgIGxvZGFzaC5ub0NvbmZsaWN0ID0gbm9Db25mbGljdDtcbiAgICBsb2Rhc2gubm9vcCA9IG5vb3A7XG4gICAgbG9kYXNoLm5vdyA9IG5vdztcbiAgICBsb2Rhc2gucGFyc2VJbnQgPSBwYXJzZUludDtcbiAgICBsb2Rhc2gucmFuZG9tID0gcmFuZG9tO1xuICAgIGxvZGFzaC5yZWR1Y2UgPSByZWR1Y2U7XG4gICAgbG9kYXNoLnJlZHVjZVJpZ2h0ID0gcmVkdWNlUmlnaHQ7XG4gICAgbG9kYXNoLnJlc3VsdCA9IHJlc3VsdDtcbiAgICBsb2Rhc2gucnVuSW5Db250ZXh0ID0gcnVuSW5Db250ZXh0O1xuICAgIGxvZGFzaC5zaXplID0gc2l6ZTtcbiAgICBsb2Rhc2guc29tZSA9IHNvbWU7XG4gICAgbG9kYXNoLnNvcnRlZEluZGV4ID0gc29ydGVkSW5kZXg7XG4gICAgbG9kYXNoLnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gICAgbG9kYXNoLnVuZXNjYXBlID0gdW5lc2NhcGU7XG4gICAgbG9kYXNoLnVuaXF1ZUlkID0gdW5pcXVlSWQ7XG5cbiAgICAvLyBhZGQgYWxpYXNlc1xuICAgIGxvZGFzaC5hbGwgPSBldmVyeTtcbiAgICBsb2Rhc2guYW55ID0gc29tZTtcbiAgICBsb2Rhc2guZGV0ZWN0ID0gZmluZDtcbiAgICBsb2Rhc2guZmluZFdoZXJlID0gZmluZDtcbiAgICBsb2Rhc2guZm9sZGwgPSByZWR1Y2U7XG4gICAgbG9kYXNoLmZvbGRyID0gcmVkdWNlUmlnaHQ7XG4gICAgbG9kYXNoLmluY2x1ZGUgPSBjb250YWlucztcbiAgICBsb2Rhc2guaW5qZWN0ID0gcmVkdWNlO1xuXG4gICAgbWl4aW4oZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc291cmNlID0ge31cbiAgICAgIGZvck93bihsb2Rhc2gsIGZ1bmN0aW9uKGZ1bmMsIG1ldGhvZE5hbWUpIHtcbiAgICAgICAgaWYgKCFsb2Rhc2gucHJvdG90eXBlW21ldGhvZE5hbWVdKSB7XG4gICAgICAgICAgc291cmNlW21ldGhvZE5hbWVdID0gZnVuYztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gc291cmNlO1xuICAgIH0oKSwgZmFsc2UpO1xuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvLyBhZGQgZnVuY3Rpb25zIGNhcGFibGUgb2YgcmV0dXJuaW5nIHdyYXBwZWQgYW5kIHVud3JhcHBlZCB2YWx1ZXMgd2hlbiBjaGFpbmluZ1xuICAgIGxvZGFzaC5maXJzdCA9IGZpcnN0O1xuICAgIGxvZGFzaC5sYXN0ID0gbGFzdDtcbiAgICBsb2Rhc2guc2FtcGxlID0gc2FtcGxlO1xuXG4gICAgLy8gYWRkIGFsaWFzZXNcbiAgICBsb2Rhc2gudGFrZSA9IGZpcnN0O1xuICAgIGxvZGFzaC5oZWFkID0gZmlyc3Q7XG5cbiAgICBmb3JPd24obG9kYXNoLCBmdW5jdGlvbihmdW5jLCBtZXRob2ROYW1lKSB7XG4gICAgICB2YXIgY2FsbGJhY2thYmxlID0gbWV0aG9kTmFtZSAhPT0gJ3NhbXBsZSc7XG4gICAgICBpZiAoIWxvZGFzaC5wcm90b3R5cGVbbWV0aG9kTmFtZV0pIHtcbiAgICAgICAgbG9kYXNoLnByb3RvdHlwZVttZXRob2ROYW1lXT0gZnVuY3Rpb24obiwgZ3VhcmQpIHtcbiAgICAgICAgICB2YXIgY2hhaW5BbGwgPSB0aGlzLl9fY2hhaW5fXyxcbiAgICAgICAgICAgICAgcmVzdWx0ID0gZnVuYyh0aGlzLl9fd3JhcHBlZF9fLCBuLCBndWFyZCk7XG5cbiAgICAgICAgICByZXR1cm4gIWNoYWluQWxsICYmIChuID09IG51bGwgfHwgKGd1YXJkICYmICEoY2FsbGJhY2thYmxlICYmIHR5cGVvZiBuID09ICdmdW5jdGlvbicpKSlcbiAgICAgICAgICAgID8gcmVzdWx0XG4gICAgICAgICAgICA6IG5ldyBsb2Rhc2hXcmFwcGVyKHJlc3VsdCwgY2hhaW5BbGwpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvKipcbiAgICAgKiBUaGUgc2VtYW50aWMgdmVyc2lvbiBudW1iZXIuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgKi9cbiAgICBsb2Rhc2guVkVSU0lPTiA9ICcyLjQuMSc7XG5cbiAgICAvLyBhZGQgXCJDaGFpbmluZ1wiIGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlclxuICAgIGxvZGFzaC5wcm90b3R5cGUuY2hhaW4gPSB3cmFwcGVyQ2hhaW47XG4gICAgbG9kYXNoLnByb3RvdHlwZS50b1N0cmluZyA9IHdyYXBwZXJUb1N0cmluZztcbiAgICBsb2Rhc2gucHJvdG90eXBlLnZhbHVlID0gd3JhcHBlclZhbHVlT2Y7XG4gICAgbG9kYXNoLnByb3RvdHlwZS52YWx1ZU9mID0gd3JhcHBlclZhbHVlT2Y7XG5cbiAgICAvLyBhZGQgYEFycmF5YCBmdW5jdGlvbnMgdGhhdCByZXR1cm4gdW53cmFwcGVkIHZhbHVlc1xuICAgIGZvckVhY2goWydqb2luJywgJ3BvcCcsICdzaGlmdCddLCBmdW5jdGlvbihtZXRob2ROYW1lKSB7XG4gICAgICB2YXIgZnVuYyA9IGFycmF5UmVmW21ldGhvZE5hbWVdO1xuICAgICAgbG9kYXNoLnByb3RvdHlwZVttZXRob2ROYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2hhaW5BbGwgPSB0aGlzLl9fY2hhaW5fXyxcbiAgICAgICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpcy5fX3dyYXBwZWRfXywgYXJndW1lbnRzKTtcblxuICAgICAgICByZXR1cm4gY2hhaW5BbGxcbiAgICAgICAgICA/IG5ldyBsb2Rhc2hXcmFwcGVyKHJlc3VsdCwgY2hhaW5BbGwpXG4gICAgICAgICAgOiByZXN1bHQ7XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgLy8gYWRkIGBBcnJheWAgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIHRoZSBleGlzdGluZyB3cmFwcGVkIHZhbHVlXG4gICAgZm9yRWFjaChbJ3B1c2gnLCAncmV2ZXJzZScsICdzb3J0JywgJ3Vuc2hpZnQnXSwgZnVuY3Rpb24obWV0aG9kTmFtZSkge1xuICAgICAgdmFyIGZ1bmMgPSBhcnJheVJlZlttZXRob2ROYW1lXTtcbiAgICAgIGxvZGFzaC5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgZnVuYy5hcHBseSh0aGlzLl9fd3JhcHBlZF9fLCBhcmd1bWVudHMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICAvLyBhZGQgYEFycmF5YCBmdW5jdGlvbnMgdGhhdCByZXR1cm4gbmV3IHdyYXBwZWQgdmFsdWVzXG4gICAgZm9yRWFjaChbJ2NvbmNhdCcsICdzbGljZScsICdzcGxpY2UnXSwgZnVuY3Rpb24obWV0aG9kTmFtZSkge1xuICAgICAgdmFyIGZ1bmMgPSBhcnJheVJlZlttZXRob2ROYW1lXTtcbiAgICAgIGxvZGFzaC5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBsb2Rhc2hXcmFwcGVyKGZ1bmMuYXBwbHkodGhpcy5fX3dyYXBwZWRfXywgYXJndW1lbnRzKSwgdGhpcy5fX2NoYWluX18pO1xuICAgICAgfTtcbiAgICB9KTtcblxuICAgIHJldHVybiBsb2Rhc2g7XG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvLyBleHBvc2UgTG8tRGFzaFxuICB2YXIgXyA9IHJ1bkluQ29udGV4dCgpO1xuXG4gIC8vIHNvbWUgQU1EIGJ1aWxkIG9wdGltaXplcnMgbGlrZSByLmpzIGNoZWNrIGZvciBjb25kaXRpb24gcGF0dGVybnMgbGlrZSB0aGUgZm9sbG93aW5nOlxuICBpZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBFeHBvc2UgTG8tRGFzaCB0byB0aGUgZ2xvYmFsIG9iamVjdCBldmVuIHdoZW4gYW4gQU1EIGxvYWRlciBpcyBwcmVzZW50IGluXG4gICAgLy8gY2FzZSBMby1EYXNoIGlzIGxvYWRlZCB3aXRoIGEgUmVxdWlyZUpTIHNoaW0gY29uZmlnLlxuICAgIC8vIFNlZSBodHRwOi8vcmVxdWlyZWpzLm9yZy9kb2NzL2FwaS5odG1sI2NvbmZpZy1zaGltXG4gICAgcm9vdC5fID0gXztcblxuICAgIC8vIGRlZmluZSBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlIHNvLCB0aHJvdWdoIHBhdGggbWFwcGluZywgaXQgY2FuIGJlXG4gICAgLy8gcmVmZXJlbmNlZCBhcyB0aGUgXCJ1bmRlcnNjb3JlXCIgbW9kdWxlXG4gICAgZGVmaW5lKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF87XG4gICAgfSk7XG4gIH1cbiAgLy8gY2hlY2sgZm9yIGBleHBvcnRzYCBhZnRlciBgZGVmaW5lYCBpbiBjYXNlIGEgYnVpbGQgb3B0aW1pemVyIGFkZHMgYW4gYGV4cG9ydHNgIG9iamVjdFxuICBlbHNlIGlmIChmcmVlRXhwb3J0cyAmJiBmcmVlTW9kdWxlKSB7XG4gICAgLy8gaW4gTm9kZS5qcyBvciBSaW5nb0pTXG4gICAgaWYgKG1vZHVsZUV4cG9ydHMpIHtcbiAgICAgIChmcmVlTW9kdWxlLmV4cG9ydHMgPSBfKS5fID0gXztcbiAgICB9XG4gICAgLy8gaW4gTmFyd2hhbCBvciBSaGlubyAtcmVxdWlyZVxuICAgIGVsc2Uge1xuICAgICAgZnJlZUV4cG9ydHMuXyA9IF87XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIC8vIGluIGEgYnJvd3NlciBvciBSaGlub1xuICAgIHJvb3QuXyA9IF87XG4gIH1cbn0uY2FsbCh0aGlzKSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIGFtZ3VpID0ge1xuXG4gICAgY3JlYXRlQmV6aWVyRWRpdG9yOiBjcmVhdGVCZXppZXJFZGl0b3IsXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFtZ3VpO1xuXG5cblxuXG5cbmZ1bmN0aW9uIGNyZWF0ZUJlemllckVkaXRvcihvcHQpIHtcblxuICAgIG9wdCA9IG9wdCB8fCB7fTtcblxuICAgIHZhciBwMCA9IHt4OiAwLjMsIHk6IDB9LFxuICAgICAgICBwMSA9IHt4OiAwLjcsIHk6IDF9LFxuICAgICAgICB3ID0gb3B0LndpZHRoIHx8IDMxMixcbiAgICAgICAgaCA9IG9wdC5oZWlnaHQgfHwgMzEyO1xuXG4gICAgdmFyIGRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGUuc3R5bGUud2lkdGggPSB3ICsgJ3B4JztcbiAgICBkZS5zdHlsZS5oZWlnaHQgPSBoICsgJ3B4JztcblxuICAgIHZhciBjID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgYy53aWR0aCA9IHc7XG4gICAgYy5oZWlnaHQgPSBoO1xuICAgIGRlLmFwcGVuZENoaWxkKGMpO1xuXG4gICAgdmFyIGN0eCA9IGMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgXG4gICAgdmFyIGRlQ3AwID0gY3JlYXRlQ3AocDApO1xuICAgIHZhciBkZUNwMSA9IGNyZWF0ZUNwKHAxKTtcblxuICAgIGRlLmdldFZhbHVlID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHJldHVybiAnY3ViaWMtYmV6aWVyKCcrcDAueCsnLCcrcDAueSsnLCcrcDEueCsnLCcrcDEueSsnKSc7XG4gICAgfTtcblxuICAgIGRlLnNldFZhbHVlID0gZnVuY3Rpb24gKHBvaW50cykge1xuXG4gICAgICAgIHAwLnggPSBwb2ludHMuY3AweDtcbiAgICAgICAgcDAueSA9IHBvaW50cy5jcDB5O1xuICAgICAgICBwMS54ID0gcG9pbnRzLmNwMXg7XG4gICAgICAgIHAxLnkgPSBwb2ludHMuY3AxeTtcbiAgICAgICAgXG4gICAgICAgIHJlbmRlcigpO1xuICAgIH07XG4gICAgXG4gICAgcmVuZGVyKCk7XG4gIFxuICAgIHJldHVybiBkZTtcbiAgXG5cbiAgXG4gIFxuXG4gICAgZnVuY3Rpb24gcmVuZGVyKCkge1xuXG4gICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgdywgaCk7XG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgY3R4Lm1vdmVUbyh4KHAwLngpLCB5KHAwLnkpKTtcbiAgICAgICAgY3R4LmxpbmVUbygwLCB5KDApKTtcbiAgICAgICAgY3R4LmJlemllckN1cnZlVG8oXG4gICAgICAgICAgICB4KHAwLngpLCB5KHAwLnkpLFxuICAgICAgICAgICAgeChwMS54KSwgeShwMS55KSxcbiAgICAgICAgICAgIHgoMSksIHkoMSkpO1xuICAgICAgICBjdHgubGluZVRvKHgocDEueCksIHkocDEueSkpO1xuICAgICAgICBcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJyNmZmYnO1xuICAgICAgICBjdHgubGluZVdpZHRoID0gMjtcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICBcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICBjdHgucmVjdCh4KDApLCB5KDApLCB4KDEpLCB5KDEpIC0geSgwKSk7XG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjZmZmJztcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDE7XG4gICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgIFxuICAgICAgICBkZUNwMC5yZWZyZXNoUG9zaXRpb24oKTtcbiAgICAgICAgZGVDcDEucmVmcmVzaFBvc2l0aW9uKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24geCAocCkge1xuICAgICAgICByZXR1cm4gcCAqIHc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24geSAocCkge1xuXG4gICAgICAgIHZhciBtaW4gPSBtaW5ZKCksXG4gICAgICAgICAgICBtYXggPSBtYXhZKCksXG4gICAgICAgICAgICBmdWxsID0gbWF4IC0gbWluO1xuXG4gICAgICAgIHJldHVybiAoKHAgLSBtaW4pIC8gZnVsbCkgKiBoO1xuICAgIH1cbiAgXG4gICAgZnVuY3Rpb24gbWluWSgpIHtcbiAgICBcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKDAsIHAwLnksIHAxLnkpO1xuICAgIH1cbiAgXG4gICAgZnVuY3Rpb24gbWF4WSgpIHtcbiAgICBcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KDEsIHAwLnksIHAxLnkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUNwKHBvaW50KSB7XG5cbiAgICAgICAgdmFyIHIgPSA2LCBtZE1pblksIG1kRnVsbFk7XG5cbiAgICAgICAgdmFyIGRlQ3AgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGVDcC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIGRlQ3Auc3R5bGUuY3Vyc29yID0gJ2dyYWInO1xuICAgICAgICBkZUNwLnN0eWxlLmJveFNpemluZyA9ICdib3JkZXItYm94JztcbiAgICAgICAgZGVDcC5zdHlsZS53aWR0aCA9IHIqMiArICdweCc7XG4gICAgICAgIGRlQ3Auc3R5bGUuaGVpZ2h0ID0gcioyICsgJ3B4JztcbiAgICAgICAgZGVDcC5zdHlsZS5ib3JkZXJSYWRpdXMgPSByICsgJ3B4JztcbiAgICAgICAgZGVDcC5zdHlsZS5iYWNrZ3JvdW5kID0gJ3JnYmEoMjU2LCAyNTYsIDI1NiwgMSknO1xuICAgICAgICBkZS5hcHBlbmRDaGlsZChkZUNwKTtcbiAgICAgIFxuICAgICAgICBkZUNwLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uRG93bik7XG4gICAgICBcbiAgICAgICAgZGVDcC5yZWZyZXNoUG9zaXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGRlQ3Auc3R5bGUubGVmdCA9ICh4KHBvaW50LngpICkgKyAncHgnO1xuICAgICAgICAgICAgZGVDcC5zdHlsZS50b3AgPSAoeShwb2ludC55KSkgKyAncHgnO1xuICAgICAgICB9O1xuICAgICAgICBkZUNwLnJlZnJlc2hQb3NpdGlvbigpO1xuICAgICAgXG4gICAgICAgIHJldHVybiBkZUNwO1xuXG4gICAgICAgIGZ1bmN0aW9uIG9uRG93bigpIHtcbiAgICAgICAgICBcbiAgICAgICAgICAgIG1kTWluWSA9IG1pblkoKTtcbiAgICAgICAgICAgIG1kRnVsbFkgPSBtYXhZKCkgLSBtZE1pblk7XG5cbiAgICAgICAgICAgIGRlQ3Auc3R5bGUuY3Vyc29yID0gJ2dyYWJiaW5nJztcblxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG9uRHJhZyk7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG9uVXApO1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBvblVwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG9uRHJhZyhlKSB7XG5cbiAgICAgICAgICAgIHZhciBiciA9IGRlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgICAgICBwb2ludC54ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgKGUucGFnZVggLSBici5sZWZ0KSAvIHcpKTtcbiAgICAgICAgICAgIHBvaW50LnkgPSAoKChlLnBhZ2VZIC0gYnIudG9wKSAvIGgpICogbWRGdWxsWSkgLSBtZE1pblk7XG4gICAgICAgICAgXG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICBcbiAgICAgICAgICAgIGRlLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdjaGFuZ2UnLCB7ZGV0YWlsOiB7dmFsdWU6IGRlLmdldFZhbHVlKCl9fSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gb25VcCgpIHtcblxuICAgICAgICAgICAgZGVDcC5zdHlsZS5jdXJzb3IgPSAnZ3JhYic7XG5cbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBvbkRyYWcpO1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBvblVwKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgb25VcCk7XG4gICAgICAgIH1cbiAgICB9XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xudmFyIGZvbnRlbGxvQ29uZiA9IHJlcXVpcmUoJy4uL2Fzc2V0cy9mb250ZWxsby9jb25maWcuanNvbicpO1xuXG5XZWJGb250LmxvYWQoe1xuICAgIGdvb2dsZToge1xuICAgICAgZmFtaWxpZXM6IFsnT3BlbiBTYW5zJ11cbiAgICB9XG59KTtcblxudmFyIGFtZ3VpID0gXy5leHRlbmQoXG4gICAgbmV3IEV2ZW50RW1pdHRlciwgXG4gICAgcmVxdWlyZSgnLi9hbWd1aS5iZXppZXJFZGl0b3InKSxcbiAgICB7XG5cbiAgICBGT05UX0ZBTUlMWTogJ1wiT3BlbiBTYW5zXCIsIHNhbnMtc2VyaWYnLFxuICAgIEZPTlRfU0laRTogJzE1cHgnLFxuXG4gICAgY29sb3I6IHtcbiAgICAgICAgYmcwOiAnIzAwMCcsXG4gICAgICAgIGJnMTogJyMyMjInLFxuICAgICAgICBiZzI6ICcjNDQ0JyxcbiAgICAgICAgYmczOiAnIzY2NicsXG4gICAgICAgIHRleHQ6ICcjZWZlJyxcbiAgICAgICAgb3ZlcmxheTogJ3JnYmEoMCwwLDAsLjc4NSknLFxuICAgICAgICBiZ0hvdmVyOiAncmdiYSgyNTUsMjU1LDI1NSwwLjEyKScsXG4gICAgfSxcblxuICAgIGdldFN0eWxlU2hlZXQ6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuXG4gICAgICAgIHN0eWxlLmlubmVySFRNTCA9ICdkaWFsb2c6OmJhY2tkcm9wIHsgYmFja2dyb3VuZDonK2FtZ3VpLmNvbG9yLmJnSG92ZXIrJyB9JztcblxuICAgICAgICByZXR1cm4gc3R5bGU7XG4gICAgfSwgXG5cbiAgICBjcmVhdGVLZXlsaW5lOiBmdW5jdGlvbiAob3B0KSB7XG5cbiAgICAgICAgdmFyIHRpbWVzY2FsZSA9IG9wdC50aW1lc2NhbGUgfHwgMC4yLFxuICAgICAgICAgICAga2V5cyA9IFtdO1xuXG4gICAgICAgIHZhciBkZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBkZS5zdHlsZS53aWR0aCA9ICcxMDAlJztcbiAgICAgICAgZGUuc3R5bGUuaGVpZ2h0ID0gKG9wdC5oZWlnaHQgfHwgMjEpICsgJ3B4JztcbiAgICAgICAgZGUuc3R5bGUuYmFja2dyb3VuZCA9IG9wdC5iYWNrZ3JvdW5kIHx8ICdncmV5JztcbiAgICAgICAgZGUuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnO1xuXG4gICAgICAgIGRlLmFkZEtleSA9IGZ1bmN0aW9uIChvcHQpIHtcblxuICAgICAgICAgICAgdmFyIGtleSA9IGFtZ3VpLmNyZWF0ZUtleShvcHQpO1xuICAgICAgICAgICAga2V5cy5wdXNoKGtleSk7XG5cbiAgICAgICAgICAgIGRlLmFwcGVuZENoaWxkKGtleSk7XG5cbiAgICAgICAgICAgIHJldHVybiBrZXk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGU7XG4gICAgfSxcblxuICAgIGNyZWF0ZUtleTogZnVuY3Rpb24gKG9wdCkge1xuXG4gICAgICAgIHZhciBpc1VzZXJTZWxlY3RlZCA9IGZhbHNlLCBcbiAgICAgICAgICAgIG1keCwgbURyYWdnZWQsXG4gICAgICAgICAgICB0aW1lID0gb3B0LnRpbWUgfHwgMCwgXG4gICAgICAgICAgICB0aW1lc2NhbGUgPSBvcHQudGltZXNjYWxlIHx8IDE7XG5cbiAgICAgICAgdmFyIGRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRlLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcblxuICAgICAgICB2YXIga2V5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGtleS5zdHlsZS53aWR0aCA9ICcwJztcbiAgICAgICAga2V5LnN0eWxlLmhlaWdodCA9ICcwJztcbiAgICAgICAga2V5LnN0eWxlLmJvcmRlclN0eWxlID0gJ3NvbGlkJztcbiAgICAgICAga2V5LnN0eWxlLmJvcmRlcldpZHRoID0gJzIxcHggNHB4IDAgNHB4JztcbiAgICAgICAga2V5LnN0eWxlLmJvcmRlckNvbG9yID0gJyM3NzAwZmYgdHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQnO1xuICAgICAgICBkZS5hcHBlbmRDaGlsZChrZXkpO1xuXG4gICAgICAgIHNldExlZnQoKTtcblxuICAgICAgICBkZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoZSkge1xuXG4gICAgICAgICAgICBpZiAoZS5idXR0b24gIT09IDApIHtcblxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgbWR4ID0gZS5wYWdlWDtcbiAgICAgICAgICAgIG1EcmFnZ2VkID0gMDtcblxuICAgICAgICAgICAgaWYgKCFlLnNoaWZ0S2V5ICYmICFlLmN0cmxLZXkpIHtcbiAgICAgICAgICAgICAgICBhbWd1aS5lbWl0KCdkZXNlbGVjdEFsbEtleXMnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGUuY3RybEtleSkge1xuICAgICAgICAgICAgICAgIHRvZ2dsZVVzZXJTZWxlY3RlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdXNlclNlbGVjdCh0cnVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGRyYWcpO1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBkcmFnRW5kKTtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgZHJhZ0VuZCk7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGUuc2V0VGltZSA9IGZ1bmN0aW9uKHQpIHtcblxuICAgICAgICAgICAgaWYgKHRpbWUgPT09IHQpIHJldHVybjtcblxuICAgICAgICAgICAgdGltZSA9IHQ7XG4gICAgICAgICAgICBzZXRMZWZ0KCk7XG5cbiAgICAgICAgICAgIGRlLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdjaGFuZ2VUaW1lJywge2RldGFpbDoge3RpbWU6IHRpbWV9fSkpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGRlLnNldFRpbWVzY2FsZSA9IGZ1bmN0aW9uKHRzKSB7XG5cbiAgICAgICAgICAgIGlmICh0aW1lc2NhbGUgPT09IHRzKSByZXR1cm47XG5cbiAgICAgICAgICAgIHRpbWVzY2FsZSA9IHRzO1xuICAgICAgICAgICAgc2V0TGVmdCgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGFtZ3VpLm9uKCdkZXNlbGVjdEFsbEtleXMnLCB1c2VyU2VsZWN0LmJpbmQobnVsbCwgZmFsc2UpKTtcblxuICAgICAgICBhbWd1aS5vbigndHJhbnNsYXRlU2VsZWN0ZWRLZXlzJywgZnVuY3Rpb24gKG9mZnNldCkge1xuXG4gICAgICAgICAgICBpZiAoaXNVc2VyU2VsZWN0ZWQpIHtcblxuICAgICAgICAgICAgICAgIGRlLnNldFRpbWUodGltZSArIG9mZnNldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBkZTtcblxuICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICAgICAgZnVuY3Rpb24gZHJhZyhlKSB7XG5cbiAgICAgICAgICAgIHZhciBkaWZmID0gZS5wYWdlWCAtIG1keCxcbiAgICAgICAgICAgICAgICBkaWZmVGltZSA9IChkaWZmIC8gdGltZXNjYWxlKSAtIG1EcmFnZ2VkO1xuXG4gICAgICAgICAgICBtRHJhZ2dlZCArPSBkaWZmVGltZTtcblxuICAgICAgICAgICAgYW1ndWkuZW1pdCgndHJhbnNsYXRlU2VsZWN0ZWRLZXlzJywgZGlmZlRpbWUpXG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBkcmFnRW5kKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZHJhZyk7XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGRyYWdFbmQpO1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBkcmFnRW5kKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHNldExlZnQoKSB7XG5cbiAgICAgICAgICAgIGRlLnN0eWxlLmxlZnQgPSAoKHRpbWUgKiB0aW1lc2NhbGUpIC0gNCkgKyAncHgnO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gdG9nZ2xlVXNlclNlbGVjdGVkKCkge1xuXG4gICAgICAgICAgICB1c2VyU2VsZWN0KCFpc1VzZXJTZWxlY3RlZCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiB1c2VyU2VsZWN0KG9uKSB7XG5cbiAgICAgICAgICAgIGlzVXNlclNlbGVjdGVkID0gb247XG4gICAgICAgICAgICBkZS5zdHlsZS5iYWNrZ3JvdW5kID0gaXNVc2VyU2VsZWN0ZWQgPyAnd2hpdGUnIDogJ25vbmUnO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGNyZWF0ZURpYWxvZzogZnVuY3Rpb24gKG9wdCkge1xuXG4gICAgICAgIHZhciBkZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpYWxvZycpO1xuICAgICAgICAob3B0LnBhcmVudCB8fCBkb2N1bWVudC5ib2R5KS5hcHBlbmRDaGlsZChkZSk7XG5cbiAgICAgICAgZGUuc3R5bGUuYmFja2dyb3VuZCA9ICdub25lJztcbiAgICAgICAgZGUuc3R5bGUuYm9yZGVyID0gJ25vbmUnO1xuICAgICAgICBkZS5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ2F1dG8nO1xuICAgICAgICBkZS5zdHlsZS5mb250RmFtaWx5ID0gYW1ndWkuRk9OVF9GQU1JTFk7XG5cblxuICAgICAgICB2YXIgZGVUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBkZVRpdGxlLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJztcbiAgICAgICAgZGVUaXRsZS5zdHlsZS5wYWRkaW5nID0gJzAgMThweCc7XG4gICAgICAgIGRlVGl0bGUuc3R5bGUuaGVpZ2h0ID0gJzM0cHgnO1xuICAgICAgICBkZVRpdGxlLnN0eWxlLmZvbnRTaXplID0gJzIzcHgnO1xuICAgICAgICBkZVRpdGxlLnN0eWxlLmZvbnRXZWlnaHQgPSAnYm9sZCc7XG4gICAgICAgIGRlVGl0bGUuc3R5bGUuYmFja2dyb3VuZCA9IGFtZ3VpLmNvbG9yLm92ZXJsYXk7XG4gICAgICAgIGRlVGl0bGUuc3R5bGUuY29sb3IgPSBhbWd1aS5jb2xvci50ZXh0O1xuICAgICAgICBkZS5hcHBlbmRDaGlsZChkZVRpdGxlKTtcblxuICAgICAgICB2YXIgdGl0bGVFbmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdGl0bGVFbmQuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snO1xuICAgICAgICB0aXRsZUVuZC5zdHlsZS53aWR0aCA9ICcwJztcbiAgICAgICAgdGl0bGVFbmQuc3R5bGUuaGVpZ2h0ID0gJzAnO1xuICAgICAgICB0aXRsZUVuZC5zdHlsZS52ZXJ0aWNhbEFsaWduID0gJ2JvdHRvbSc7XG4gICAgICAgIHRpdGxlRW5kLnN0eWxlLmJvcmRlclN0eWxlID0gJ3NvbGlkJztcbiAgICAgICAgdGl0bGVFbmQuc3R5bGUuYm9yZGVyV2lkdGggPSAnMzRweCAwIDAgOHB4JztcbiAgICAgICAgdGl0bGVFbmQuc3R5bGUuYm9yZGVyQ29sb3IgPSAndHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQgJyArIGFtZ3VpLmNvbG9yLm92ZXJsYXk7O1xuICAgICAgICBkZS5hcHBlbmRDaGlsZCh0aXRsZUVuZCk7XG5cbiAgICAgICAgXG5cbiAgICAgICAgdmFyIGNvbnRlbnRDb250ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGNvbnRlbnRDb250LnN0eWxlLmJhY2tncm91bmQgPSBhbWd1aS5jb2xvci5vdmVybGF5O1xuICAgICAgICBkZS5hcHBlbmRDaGlsZChjb250ZW50Q29udCk7XG5cbiAgICAgICAgdmFyIGJ1dHRvbnNDb250ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGJ1dHRvbnNDb250LnN0eWxlLmJhY2tncm91bmQgPSBhbWd1aS5jb2xvci5vdmVybGF5O1xuICAgICAgICBidXR0b25zQ29udC5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jayc7XG4gICAgICAgIGJ1dHRvbnNDb250LnN0eWxlLmZsb2F0ID0gJ3JpZ2h0JztcbiAgICAgICAgZGUuYXBwZW5kQ2hpbGQoYnV0dG9uc0NvbnQpO1xuXG5cbiAgICAgICAgZGUuc2V0VGl0bGUgPSBmdW5jdGlvbiAodGl0bGUpIHtcblxuICAgICAgICAgICAgZGVUaXRsZS50ZXh0Q29udGVudCA9IHRpdGxlIHx8ICdEaWFsb2cnO1xuICAgICAgICB9O1xuXG4gICAgICAgIGRlLnNldENvbnRlbnQgPSBmdW5jdGlvbiAoY29udGVudCkge1xuXG4gICAgICAgICAgICBpZiAoIWNvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnRlbnRDb250LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgY29udGVudENvbnQuYXBwZW5kQ2hpbGQoY29udGVudCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgZGUuc2V0QnV0dG9ucyA9IGZ1bmN0aW9uIChidXR0b25zKSB7XG5cbiAgICAgICAgICAgIGlmICghYnV0dG9ucykge1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBidXR0b25zQ29udC5pbm5lckhUTUwgPSAnJztcblxuICAgICAgICAgICAgYnV0dG9ucy5mb3JFYWNoKGZ1bmN0aW9uIChjYXB0aW9uKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgYnRuID0gYW1ndWkuY3JlYXRlQnRuKHtjYXB0aW9uOiBjYXB0aW9ufSk7XG4gICAgICAgICAgICAgICAgYnRuLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJztcbiAgICAgICAgICAgICAgICBidG4uc3R5bGUuZm9udFdlaWdodCA9ICdib2xkJztcbiAgICAgICAgICAgICAgICBidG4uc3R5bGUuZm9udFNpemUgPSAnMThweCc7XG4gICAgICAgICAgICAgICAgYnV0dG9uc0NvbnQuYXBwZW5kQ2hpbGQoYnRuKTtcblxuICAgICAgICAgICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZGUuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NsaWNrXycgKyBjYXB0aW9uLnRvTG93ZXJDYXNlKCkpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGRlLnNldFRpdGxlKG9wdC50aXRsZSk7XG4gICAgICAgIGRlLnNldENvbnRlbnQob3B0LmNvbnRlbnQpO1xuICAgICAgICBkZS5zZXRCdXR0b25zKG9wdC5idXR0b25zKTtcblxuICAgICAgICB2YXIgYnV0dG9uc0VuZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBidXR0b25zRW5kLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJztcbiAgICAgICAgYnV0dG9uc0VuZC5zdHlsZS5mbG9hdCA9ICdyaWdodCc7XG4gICAgICAgIGJ1dHRvbnNFbmQuc3R5bGUud2lkdGggPSAnMCc7XG4gICAgICAgIGJ1dHRvbnNFbmQuc3R5bGUuaGVpZ2h0ID0gJzAnO1xuICAgICAgICBidXR0b25zRW5kLnN0eWxlLnZlcnRpY2FsQWxpZ24gPSAndG9wJztcbiAgICAgICAgYnV0dG9uc0VuZC5zdHlsZS5ib3JkZXJTdHlsZSA9ICdzb2xpZCc7XG4gICAgICAgIGJ1dHRvbnNFbmQuc3R5bGUuYm9yZGVyV2lkdGggPSAnMCA2cHggMjFweCAwJztcbiAgICAgICAgYnV0dG9uc0VuZC5zdHlsZS5ib3JkZXJDb2xvciA9ICd0cmFuc3BhcmVudCAnK2FtZ3VpLmNvbG9yLmJnMCsnIHRyYW5zcGFyZW50IHRyYW5zcGFyZW50JztcbiAgICAgICAgZGUuYXBwZW5kQ2hpbGQoYnV0dG9uc0VuZCk7XG5cbiAgICAgICAgcmV0dXJuIGRlO1xuICAgIH0sXG5cbiAgICBjcmVhdGVCdG46IGZ1bmN0aW9uIChvcHQpIHtcblxuICAgICAgICBvcHQuYmFja2dyb3VuZENvbG9yID0gb3B0LmJhY2tncm91bmRDb2xvciB8fCBhbWd1aS5jb2xvci5iZzA7XG5cbiAgICAgICAgdmFyIGRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRlLnN0eWxlLmhlaWdodCA9IChvcHQuaGVpZ2h0IHx8IDIxKSArICdweCc7XG4gICAgICAgIGRlLnN0eWxlLnBhZGRpbmcgPSAnMCAxNXB4JztcbiAgICAgICAgZGUuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuICAgICAgICBkZS5zdHlsZS5jb2xvciA9IGFtZ3VpLmNvbG9yLnRleHQ7XG4gICAgICAgIGRlLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IG9wdC5iYWNrZ3JvdW5kQ29sb3I7XG5cbiAgICAgICAgZGUuc2V0Q2FwdGlvbiA9IGZ1bmN0aW9uIChjYXB0aW9uKSB7XG5cbiAgICAgICAgICAgIGRlLnRleHRDb250ZW50ID0gY2FwdGlvbjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZGUuc2V0Q2FwdGlvbihvcHQuY2FwdGlvbiB8fCAnYnV0dG9uJyk7XG5cbiAgICAgICAgZGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIG9uTU92ZXIpO1xuICAgICAgICBkZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgb25NT3V0KTtcblxuICAgICAgICBmdW5jdGlvbiBvbk1PdmVyKCkge1xuXG4gICAgICAgICAgICB0aGlzLnN0eWxlLmJhY2tncm91bmQgPSBhbWd1aS5jb2xvci5iZ0hvdmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gb25NT3V0KCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnN0eWxlLmJhY2tncm91bmQgPSBvcHQuYmFja2dyb3VuZENvbG9yO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdC5wYXJlbnQpIHtcbiAgICAgICAgICAgIG9wdC5wYXJlbnQuYXBwZW5kQ2hpbGQoZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRlO1xuICAgIH0sXG5cbiAgICBjcmVhdGVJY29uQnRuOiBmdW5jdGlvbiAob3B0KSB7XG5cbiAgICAgICAgdmFyIGRlID0gYW1ndWkuY3JlYXRlSWNvbih7c2l6ZTogb3B0LmhlaWdodCwgaWNvbjogb3B0Lmljb259KTtcbiAgICAgICAgZGUuc3R5bGUud2lkdGggPSAob3B0LndpZHRoIHx8IDIxKSArICdweCc7XG4gICAgICAgIGRlLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICAgICAgZGUuc3R5bGUuY29sb3IgPSAnd2hpdGUnO1xuICAgICAgICBkZS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuICAgICAgICBkZS5zdHlsZS5kaXNwbGF5ID0gb3B0LmRpc3BsYXkgfHwgJ2Jsb2NrJztcblxuICAgICAgICBkZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgb25NT3Zlcik7XG4gICAgICAgIGRlLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBvbk1PdXQpO1xuXG4gICAgICAgIGlmIChvcHQub25DbGljaykge1xuXG4gICAgICAgICAgICBkZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG9wdC5vbkNsaWNrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG9uTU92ZXIoKSB7XG5cbiAgICAgICAgICAgIHRoaXMuc3R5bGUuYmFja2dyb3VuZCA9IGFtZ3VpLmNvbG9yLmJnSG92ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBvbk1PdXQoKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuc3R5bGUuYmFja2dyb3VuZCA9ICdub25lJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHQucGFyZW50KSB7XG4gICAgICAgICAgICBvcHQucGFyZW50LmFwcGVuZENoaWxkKGRlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkZTtcbiAgICB9LFxuXG4gICAgY3JlYXRlVG9nZ2xlSWNvbkJ0bjogZnVuY3Rpb24gKG9wdCkge1xuXG4gICAgICAgIHZhciBpc09uID0gZmFsc2U7XG4gICAgICAgIHZhciBkZSA9IGFtZ3VpLmNyZWF0ZUljb25CdG4ob3B0KTtcbiAgICAgICAgc2V0SWNvbigpO1xuXG4gICAgICAgIGRlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25DbGljayk7XG5cbiAgICAgICAgZGUuc2V0VG9nZ2xlID0gZnVuY3Rpb24gKG9uKSB7XG5cbiAgICAgICAgICAgIG9uID0gISFvbjtcbiAgICAgICAgICAgIGlmIChvbiA9PT0gaXNPbikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlzT24gPSBvbjtcbiAgICAgICAgICAgIHNldEljb24oKTtcblxuICAgICAgICAgICAgZGUuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ3RvZ2dsZScsIHtkZXRhaWw6IHtzdGF0ZTogaXNPbn19KSk7XG4gICAgICAgICAgICBkZS5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChpc09uID8gJ3RvZ2dsZU9uJyA6ICd0b2dnbGVPZmYnKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgZGUuc3RhdGUgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBpc09uO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gb25DbGljaygpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZGUuc2V0VG9nZ2xlKCFpc09uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHNldEljb24oKSB7XG5cbiAgICAgICAgICAgIGRlLnNldEljb24oaXNPbiA/IG9wdC5pY29uT24gOiBvcHQuaWNvbk9mZik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGU7XG4gICAgfSxcblxuICAgIGNyZWF0ZUljb246IGZ1bmN0aW9uIChvcHQpIHtcblxuICAgICAgICBvcHQgPSBvcHQgfHwge307XG4gICAgICAgIG9wdC5zaXplID0gb3B0LnNpemUgfHwgMjM7XG4gICAgICAgIFxuICAgICAgICB2YXIgZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGUuc3R5bGUuY29sb3IgPSAnI2ZmZic7XG4gICAgICAgIGRlLnN0eWxlLndpZHRoID0gb3B0LnNpemUgKyAncHgnO1xuICAgICAgICBkZS5zdHlsZS5oZWlnaHQgPSBvcHQuc2l6ZSArICdweCc7XG4gICAgICAgIGRlLnN0eWxlLmxpbmVIZWlnaHQgPSBvcHQuc2l6ZSArICdweCc7XG4gICAgICAgIGRlLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgICAgICBkZS5zdHlsZS5mb250RmFtaWx5ID0gJ2FtZ3VpJztcbiAgICAgICAgZGUuc3R5bGUuZm9udFNpemUgPSBNYXRoLnJvdW5kKG9wdC5zaXplICogMC43MikgKyAncHgnO1xuXG4gICAgICAgIGRlLnNldEljb24gPSBmdW5jdGlvbiAoaWNvbikge1xuXG4gICAgICAgICAgICB2YXIgZ2x5cGggPSBmb250ZWxsb0NvbmYuZ2x5cGhzLmZpbmQoZnVuY3Rpb24gKGdseXBoKSB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZ2x5cGguY3NzID09PSBpY29uXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmFyIGNvZGUgPSBnbHlwaCA/IGdseXBoLmNvZGUgOiA1OTQwNztcbiAgICAgICAgICAgIGRlLnRleHRDb250ZW50ID0gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlKTtcbiAgICAgICAgfTtcblxuICAgICAgICBkZS5zZXRJY29uKG9wdC5pY29uKTtcblxuICAgICAgICByZXR1cm4gZGU7XG4gICAgfSwgIFxuXG4gICAgY3JlYXRlRHJvcGRvd246IGZ1bmN0aW9uIChvcHQpIHtcblxuICAgICAgICB2YXIgb3B0aW9ucyA9IG9wdC5vcHRpb25zIHx8IFtdO1xuXG4gICAgICAgIHZhciBkZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XG4gICAgICAgIGRlLnN0eWxlLmxpc3RTdHlsZVR5cGUgPSAnbm9uZSc7XG4gICAgICAgIGRlLnN0eWxlLm1hcmdpbiA9IDA7XG4gICAgICAgIGRlLnN0eWxlLnBhZGRpbmcgPSAwO1xuXG4gICAgICAgIG9wdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAodGV4dCkge1xuXG4gICAgICAgICAgICB2YXIgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgICAgICAgbGkudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICAgICAgbGkuc3R5bGUudGV4dEFsaWduID0gJ2xlZnQnO1xuICAgICAgICAgICAgbGkuc3R5bGUuZm9udEZhbWlseSA9IGFtZ3VpLkZPTlRfRkFNSUxZO1xuICAgICAgICAgICAgbGkuc3R5bGUuZm9udFNpemUgPSAnMTRweCc7XG4gICAgICAgICAgICBsaS5zdHlsZS5wYWRkaW5nID0gJzAgM3B4JztcbiAgICAgICAgICAgIGxpLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICAgICAgICAgIGxpLnN0eWxlLmNvbG9yID0gYW1ndWkuY29sb3IudGV4dDtcbiAgICAgICAgICAgIGxpLnN0eWxlLmJhY2tncm91bmQgPSBhbWd1aS5jb2xvci5iZzI7XG5cbiAgICAgICAgICAgIGxpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcblxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgICAgICAgICBkZS5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnc2VsZWN0Jywge2RldGFpbDoge3NlbGVjdGlvbjogdGV4dH19KSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGRlLmFwcGVuZENoaWxkKGxpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKG9wdC5vblNlbGVjdCkge1xuXG4gICAgICAgICAgICBkZS5hZGRFdmVudExpc3RlbmVyKCdzZWxlY3QnLCBvcHQub25TZWxlY3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRlO1xuICAgIH0sXG5cbiAgICBiaW5kRHJvcGRvd246IGZ1bmN0aW9uKG9wdCkge1xuXG4gICAgICAgIHZhciBpc09wZW5lZCA9IGZhbHNlO1xuICAgICAgICB2YXIgZGVCdG4gPSBvcHQuZGVUYXJnZXQ7XG4gICAgICAgIHZhciBkZURyb3Bkb3duID0gb3B0LmRlTWVudTtcblxuICAgICAgICBpZiAob3B0LmFzQ29udGV4dE1lbnUpIHtcblxuICAgICAgICAgICAgZGVCdG4uYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBmdW5jdGlvbiAoZSkge1xuXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgaXNPcGVuZWQgPyBjbG9zZSgpIDogb3BlbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGRlQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcblxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaXNPcGVuZWQgPyBjbG9zZSgpIDogb3BlbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBkZURyb3Bkb3duLnN0eWxlLnBvc2l0aW9uID0gJ2ZpeGVkJztcbiAgICAgICAgXG4gICAgICAgIGRlRHJvcGRvd24uYWRkRXZlbnRMaXN0ZW5lcignc2VsZWN0JywgY2xvc2UpO1xuXG4gICAgICAgIGZ1bmN0aW9uIG9wZW4oKSB7XG5cbiAgICAgICAgICAgIGlmIChpc09wZW5lZCkgcmV0dXJuO1xuICAgICAgICAgICAgaXNPcGVuZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICB2YXIgYmNyID0gZGVCdG4uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICBkZURyb3Bkb3duLnN0eWxlLmxlZnQgPSBiY3IubGVmdCArICdweCc7XG4gICAgICAgICAgICBkZURyb3Bkb3duLnN0eWxlLnRvcCA9IGJjci5ib3R0b20gKyAncHgnO1xuXG4gICAgICAgICAgICBkZUJ0bi5hcHBlbmRDaGlsZChkZURyb3Bkb3duKTtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsb3NlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGNsb3NlKCkge1xuXG4gICAgICAgICAgICBpZiAoIWlzT3BlbmVkKSByZXR1cm47XG4gICAgICAgICAgICBpc09wZW5lZCA9IGZhbHNlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoZGVEcm9wZG93bi5wYXJlbnRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgZGVEcm9wZG93bi5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGRlRHJvcGRvd24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xvc2UpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGFkZFRvb2x0aXA6IGZ1bmN0aW9uIChvcHQpIHtcblxuICAgICAgICB2YXIgc2hvd1NldFQsIGRlbGF5ID0gNzk4LCBteCA9IDAsIG15ID0gMDtcblxuICAgICAgICB2YXIgZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGUudGV4dENvbnRlbnQgPSBvcHQudGV4dDtcbiAgICAgICAgZGUuc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnO1xuICAgICAgICBkZS5zdHlsZS5wYWRkaW5nID0gJzEycHgnO1xuICAgICAgICBkZS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jayc7XG4gICAgICAgIGRlLnN0eWxlLmJhY2tncm91bmQgPSBhbWd1aS5jb2xvci5vdmVybGF5O1xuICAgICAgICBkZS5zdHlsZS5jb2xvciA9IGFtZ3VpLmNvbG9yLnRleHQ7XG5cbiAgICAgICAgb3B0LmRlVGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBvbk1FbnRlcik7XG4gICAgICAgIG9wdC5kZVRhcmdldC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgb25NTGVhdmUpO1xuXG4gICAgICAgIGZ1bmN0aW9uIG9uTUVudGVyKGUpIHtcblxuICAgICAgICAgICAgb3B0LmRlVGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG9uTU1vdmUpO1xuICAgICAgICAgICAgb25NTW92ZShlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG9uTUxlYXZlKGUpIHtcblxuICAgICAgICAgICAgb3B0LmRlVGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG9uTU1vdmUpO1xuICAgICAgICAgICAgaGlkZSgpO1xuICAgICAgICAgICAgY2xlYXJTaG93U2V0VCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gb25NTW92ZShlKSB7XG5cbiAgICAgICAgICAgIGhpZGUoKTtcbiAgICAgICAgICAgIHJlZnJlc2hTaG93U2V0VCgpO1xuICAgICAgICAgICAgbXggPSBlLnBhZ2VYO1xuICAgICAgICAgICAgbXkgPSBlLnBhZ2VZO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVmcmVzaFNob3dTZXRUKCkge1xuXG4gICAgICAgICAgICBjbGVhclNob3dTZXRUKCk7XG4gICAgICAgICAgICBzaG93U2V0VCA9IHNldFRpbWVvdXQoc2hvdywgZGVsYXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gY2xlYXJTaG93U2V0VCgpIHtcblxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHNob3dTZXRUKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHNob3coKSB7XG5cbiAgICAgICAgICAgIGFtZ3VpLmRlT3ZlcmxheUNvbnQuYXBwZW5kQ2hpbGQoZGUpO1xuICAgICAgICAgICAgYW1ndWkucGxhY2VUb1BvaW50KGRlLCBteCwgbXksIG9wdC5zaWRlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGhpZGUoKSB7XG5cbiAgICAgICAgICAgIGlmIChkZS5wYXJlbnRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgZGUucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChkZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgY3JlYXRlS2V5VmFsdWVJbnB1dDogZnVuY3Rpb24gKG9wdCkge1xuXG4gICAgICAgIG9wdCA9IG9wdCB8fCB7fTtcblxuICAgICAgICB2YXIgZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGUuc3R5bGUubWFyZ2luID0gJzAgMXB4JztcblxuICAgICAgICB2YXIga2V5T24gPSBmYWxzZTtcblxuICAgICAgICB2YXIgb2xkS2V5LCBvbGRWYWx1ZTtcblxuICAgICAgICB2YXIgaW5wS2V5ID0gY3JlYXRlSW5wdXQoJ3BhcmFtZXRlciBuYW1lJyk7XG4gICAgICAgIGlucEtleS5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIG9uS2V5UHJlc3MpO1xuXG4gICAgICAgIHZhciBkaXZpZGVyID0gY3JlYXRlRGl2aWRlcigpO1xuXG4gICAgICAgIHZhciBpbnBWYWx1ZSA9IGNyZWF0ZUlucHV0KCd2YWx1ZScpO1xuICAgICAgICAvLyBpbnBWYWx1ZS5zdHlsZS5jb2xvciA9ICdsaWdodGJsdWUnO1xuICAgICAgICBpbnBWYWx1ZS5zdHlsZS50ZXh0QWxpZ24gPSAncmlnaHQnO1xuICAgICAgICBpbnBWYWx1ZS5zdHlsZS5yaWdodCA9ICcwcHgnO1xuXG4gICAgICAgIHNob3dIaWRlVmFsdWUoa2V5T24pO1xuXG4gICAgICAgIGRlLmdldEtleSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBpbnBLZXkudmFsdWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgZGUuc2V0S2V5ID0gZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHYgPT09IG9sZEtleSkgcmV0dXJuO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBvbGRLZXkgPSB2O1xuICAgICAgICAgICAgaW5wS2V5LnZhbHVlID0gdjtcbiAgICAgICAgICAgIGNoZWNrS2V5T24oKTtcbiAgICAgICAgfTtcblxuICAgICAgICBkZS5nZXRWYWx1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBpbnBWYWx1ZS52YWx1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICBkZS5zZXRWYWx1ZSA9IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICh2ID09PSBvbGRWYWx1ZSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBvbGRWYWx1ZSA9IHY7XG4gICAgICAgICAgICBpbnBWYWx1ZS52YWx1ZSA9IHY7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKG9wdC5wYXJlbnQpIHtcbiAgICAgICAgICAgIG9wdC5wYXJlbnQuYXBwZW5kQ2hpbGQoZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdC5rZXkpIHtcbiAgICAgICAgICAgIGRlLnNldEtleShvcHQua2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHQudmFsdWUpIHtcbiAgICAgICAgICAgIGRlLnNldFZhbHVlKG9wdC52YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0Lm9uQ2hhbmdlKSB7XG4gICAgICAgICAgICBkZS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBvcHQub25DaGFuZ2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gb25DaGFuZ2UoZSkge1xuXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjaGVja0tleU9uKCk7XG5cbiAgICAgICAgICAgIHZhciBkZXRhaWwgPSB7fTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGRlLmdldEtleSgpICE9PSBvbGRLZXkpIHtcbiAgICAgICAgICAgICAgICBvbGRLZXkgPSBkZXRhaWwua2V5ID0gZGUuZ2V0S2V5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGUuZ2V0VmFsdWUoKSAhPT0gb2xkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBvbGRWYWx1ZSA9IGRldGFpbC52YWx1ZSA9IGRlLmdldFZhbHVlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgndmFsdWUnIGluIGRldGFpbCB8fCAna2V5JyBpbiBkZXRhaWwpIHtcblxuICAgICAgICAgICAgICAgIGRlLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdjaGFuZ2UnLCB7ZGV0YWlsOiBkZXRhaWx9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBvbktleVByZXNzKGUpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICAgICAgICAgIGlucFZhbHVlLmZvY3VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBjaGVja0tleU9uKCkge1xuXG4gICAgICAgICAgICB2YXIgb24gPSAhIWlucEtleS52YWx1ZTtcblxuICAgICAgICAgICAgaWYgKG9uICE9PSBrZXlPbikge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGtleU9uID0gb247XG4gICAgICAgICAgICAgICAgc2hvd0hpZGVWYWx1ZShrZXlPbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBzaG93SGlkZVZhbHVlKHNob3cpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZGl2aWRlci5zdHlsZS5kaXNwbGF5ID0gc2hvdyA/ICdpbmxpbmUnIDogJ25vbmUnO1xuICAgICAgICAgICAgaW5wVmFsdWUuc3R5bGUuZGlzcGxheSA9IHNob3cgPyAnaW5saW5lLWJsb2NrJyA6ICdub25lJztcbiAgICAgICAgICAgIGlucEtleS5zdHlsZS53aWR0aCA9IHNob3cgPyAnY2FsYyg1MCUgLSA1cHgpJyA6ICcxMDAlJztcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZUlucHV0KHBsYWNlaG9sZGVyKSB7XG5cbiAgICAgICAgICAgIHZhciBpbnAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICAgICAgaW5wLnR5cGUgPSAndGV4dCc7XG4gICAgICAgICAgICBpbnAucGxhY2Vob2xkZXIgPSBwbGFjZWhvbGRlcjtcbiAgICAgICAgICAgIGlucC5zdHlsZS53aWR0aCA9ICc1MCUnO1xuICAgICAgICAgICAgaW5wLnN0eWxlLmhlaWdodCA9ICcxMDAlJztcbiAgICAgICAgICAgIGlucC5zdHlsZS5mb250U2l6ZSA9IGFtZ3VpLkZPTlRfU0laRTtcbiAgICAgICAgICAgIGlucC5zdHlsZS5mb250RmFtaWx5ID0gYW1ndWkuRk9OVF9GQU1JTFk7XG4gICAgICAgICAgICBpbnAuc3R5bGUuYm9yZGVyID0gJ25vbmUnO1xuICAgICAgICAgICAgaW5wLnN0eWxlLmNvbG9yID0gJ3doaXRlJztcbiAgICAgICAgICAgIGlucC5zdHlsZS5iYWNrZ3JvdW5kID0gJ25vbmUnO1xuICAgICAgICAgICAgaW5wLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIG9uQ2hhbmdlKTtcbiAgICAgICAgICAgIGlucC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIG9uQ2hhbmdlKTtcbiAgICAgICAgICAgIC8vICQoaW5wKS5hdXRvc2l6ZUlucHV0KHtzcGFjZTogMH0pO1xuICAgICAgICAgICAgZGUuYXBwZW5kQ2hpbGQoaW5wKTtcbiAgICAgICAgICAgIHJldHVybiBpbnA7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVEaXZpZGVyICgpIHtcblxuICAgICAgICAgICAgdmFyIGRpdmlkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICBkaXZpZGVyLnRleHRDb250ZW50ID0gJzonO1xuICAgICAgICAgICAgZGl2aWRlci5zdHlsZS5jb2xvciA9ICd3aGl0ZSc7XG4gICAgICAgICAgICBkaXZpZGVyLnN0eWxlLndpZHRoID0gJzJweCc7XG4gICAgICAgICAgICBkaXZpZGVyLnN0eWxlLmZvbnRTaXplID0gYW1ndWkuRk9OVF9TSVpFO1xuICAgICAgICAgICAgZGl2aWRlci5zdHlsZS5mb250RmFtaWx5ID0gYW1ndWkuRk9OVF9GQU1JTFk7XG4gICAgICAgICAgICBkZS5hcHBlbmRDaGlsZChkaXZpZGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIGRpdmlkZXI7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGU7XG4gICAgfSxcblxuICAgIHBsYWNlVG9Qb2ludDogZnVuY3Rpb24gKGRlLCBteCwgbXksIHdheSkge1xuXG4gICAgICAgIHZhciBweCA9IDAsIHB5ID0gMCxcbiAgICAgICAgICAgIGJyID0gZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgICAgICB3ID0gYnIud2lkdGgsXG4gICAgICAgICAgICBoID0gYnIuaGVpZ2h0LFxuICAgICAgICAgICAgd3cgPSB3aW5kb3cuaW5uZXJXaWR0aCxcbiAgICAgICAgICAgIHdoID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG4gICAgICAgIHdheSA9IHdheSB8fCAnbGVmdCc7XG5cbiAgICAgICAgc3dpdGNoICh3YXkpIHtcblxuICAgICAgICAgICAgY2FzZSAndG9wJzpcbiAgICAgICAgICAgICAgICBweCA9IG14IC0gKHcgLyAyKTtcbiAgICAgICAgICAgICAgICBweSA9IG15IC0gaDtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgIHB4ID0gbXg7XG4gICAgICAgICAgICAgICAgcHkgPSBteSAtIChoIC8gMik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgICAgICAgcHggPSBteCAtICh3IC8gMik7XG4gICAgICAgICAgICAgICAgcHkgPSBteTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHB4ID0gbXggLSB3O1xuICAgICAgICAgICAgICAgIHB5ID0gbXkgLSAoaCAvIDIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHB5IDwgMCkgcHkgPSAwO1xuICAgICAgICBpZiAocHggKyB3ID4gd3cpIHB4IC09IChweCArIHcpIC0gd3c7XG4gICAgICAgIGlmIChweSArIGggPiB3aCkgcHkgLT0gKHB5ICsgaCkgLSB3aDtcbiAgICAgICAgaWYgKHB4IDwgMCkgcHggPSAwO1xuXG4gICAgICAgIGRlLnN0eWxlLmxlZnQgPSBweCArICdweCc7XG4gICAgICAgIGRlLnN0eWxlLnRvcCA9IHB5ICsgJ3B4JztcbiAgICB9LFxuXG4gICAgY2FsbE9uQWRkZWQ6IGZ1bmN0aW9uIChkZSwgY2IsIHRoaXNBcmcpIHtcblxuICAgICAgICB2YXIgc2V0SSA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgaWYgKGNoZWNrKGRlKSkge1xuXG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChzZXRJKTtcblxuICAgICAgICAgICAgICAgIGNiLmNhbGwodGhpc0FyZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfSwgMjM0KTtcbiAgICAgICAgXG4gICAgICAgIGZ1bmN0aW9uIGNoZWNrIChub2RlKSB7XG5cbiAgICAgICAgICAgIHdoaWxlIChub2RlLnBhcmVudE5vZGUpIHtcblxuICAgICAgICAgICAgICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDkgfHwgbm9kZS5ub2RlVHlwZSA9PT0gMTEpIHtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuXG5hbWd1aS5zZXRNYXhMaXN0ZW5lcnMoMCk7XG5cbm1vZHVsZS5leHBvcnRzID0gYW1ndWk7IiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIm5hbWVcIjogXCJhbWd1aVwiLFxuICBcImNzc19wcmVmaXhfdGV4dFwiOiBcImljb24tXCIsXG4gIFwiY3NzX3VzZV9zdWZmaXhcIjogZmFsc2UsXG4gIFwiaGludGluZ1wiOiB0cnVlLFxuICBcInVuaXRzX3Blcl9lbVwiOiAxMDAwLFxuICBcImFzY2VudFwiOiA4NTAsXG4gIFwiZ2x5cGhzXCI6IFtcbiAgICB7XG4gICAgICBcInVpZFwiOiBcIjUzZWQ4NTcwMjI1NTgxMjY5Y2Q3ZWZmNTc5NWU4YmVhXCIsXG4gICAgICBcImNzc1wiOiBcImVtby11bmhhcHB5XCIsXG4gICAgICBcImNvZGVcIjogNTk0MTIsXG4gICAgICBcInNyY1wiOiBcImZvbnRlbGljb1wiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInVpZFwiOiBcIjhjZTczMjY4ODU4NzkwOWFkMGE5ZDgzMjNlYWNhOGFkXCIsXG4gICAgICBcImNzc1wiOiBcIm1hcnF1ZWVcIixcbiAgICAgIFwiY29kZVwiOiA1OTQxMyxcbiAgICAgIFwic3JjXCI6IFwiZm9udGVsaWNvXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidWlkXCI6IFwiMWE1Y2ZhMTg2NjQ3ZThjOTI5YzJiMTdiOWZjNGRhYzFcIixcbiAgICAgIFwiY3NzXCI6IFwicGx1cy1zcXVhcmVkXCIsXG4gICAgICBcImNvZGVcIjogNTkzOTgsXG4gICAgICBcInNyY1wiOiBcImZvbnRhd2Vzb21lXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidWlkXCI6IFwiZjU5OTlhMDEyZmMzNzUyMzg2NjM1ZWMwMmE4NTg0NDdcIixcbiAgICAgIFwiY3NzXCI6IFwiZG93bmxvYWQtY2xvdWRcIixcbiAgICAgIFwiY29kZVwiOiAxMTUsXG4gICAgICBcInNyY1wiOiBcImZvbnRhd2Vzb21lXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidWlkXCI6IFwiZGUyZmM3YTVjOTg2YWI4YzYyMmY2MzQ1NWQ3Y2Y4MTRcIixcbiAgICAgIFwiY3NzXCI6IFwidXBsb2FkLWNsb3VkXCIsXG4gICAgICBcImNvZGVcIjogMTE3LFxuICAgICAgXCJzcmNcIjogXCJmb250YXdlc29tZVwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInVpZFwiOiBcIjcwMzRlNGQyMjg2NmFmODJiZWY4MTFmNTJmYjFiYTQ2XCIsXG4gICAgICBcImNzc1wiOiBcImNvZGVcIixcbiAgICAgIFwiY29kZVwiOiA1OTQxNyxcbiAgICAgIFwic3JjXCI6IFwiZm9udGF3ZXNvbWVcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ1aWRcIjogXCJmNDhhZTU0YWRmYjI3ZDhhZGE1M2QwZmQ5ZTM0ZWUxMFwiLFxuICAgICAgXCJjc3NcIjogXCJ0cmFzaFwiLFxuICAgICAgXCJjb2RlXCI6IDU5Mzk2LFxuICAgICAgXCJzcmNcIjogXCJmb250YXdlc29tZVwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInVpZFwiOiBcIjFiNWE1ZDdiN2UzYzcxNDM3ZjVhMjZiZWZkZDA0NWVkXCIsXG4gICAgICBcImNzc1wiOiBcImRvY1wiLFxuICAgICAgXCJjb2RlXCI6IDU5NDA1LFxuICAgICAgXCJzcmNcIjogXCJmb250YXdlc29tZVwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInVpZFwiOiBcIjI2NjEzYTJlNmJjNDE1OTNjNTRiZWFkNDZmOGM4ZWUzXCIsXG4gICAgICBcImNzc1wiOiBcImZpbGUtY29kZVwiLFxuICAgICAgXCJjb2RlXCI6IDU5NDAwLFxuICAgICAgXCJzcmNcIjogXCJmb250YXdlc29tZVwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInVpZFwiOiBcImIwOTFhOGJkMGZkYWRlMTc0OTUxZjE3ZDkzNmY1MWU0XCIsXG4gICAgICBcImNzc1wiOiBcImZvbGRlci1lbXB0eVwiLFxuICAgICAgXCJjb2RlXCI6IDU5NDAzLFxuICAgICAgXCJzcmNcIjogXCJmb250YXdlc29tZVwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInVpZFwiOiBcIjY1MzNiZGMxNmFiMjAxZWIzZjNiMjdjZTk4OWNhYjMzXCIsXG4gICAgICBcImNzc1wiOiBcImZvbGRlci1vcGVuLWVtcHR5XCIsXG4gICAgICBcImNvZGVcIjogNTk0MDQsXG4gICAgICBcInNyY1wiOiBcImZvbnRhd2Vzb21lXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidWlkXCI6IFwiZTk5NDYxYWJmZWYzOTIzNTQ2ZGE4ZDc0NTM3MmM5OTVcIixcbiAgICAgIFwiY3NzXCI6IFwiY29nXCIsXG4gICAgICBcImNvZGVcIjogNTkzOTMsXG4gICAgICBcInNyY1wiOiBcImZvbnRhd2Vzb21lXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidWlkXCI6IFwiNWJiMTAzY2QyOWRlNzdlMGUwNmE1MjYzODUyN2I1NzVcIixcbiAgICAgIFwiY3NzXCI6IFwid3JlbmNoXCIsXG4gICAgICBcImNvZGVcIjogNTk0MTUsXG4gICAgICBcInNyY1wiOiBcImZvbnRhd2Vzb21lXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidWlkXCI6IFwiMjFiNDJkM2MzZTZiZTQ0YzNjYzNkNzMwNDJmYWEyMTZcIixcbiAgICAgIFwiY3NzXCI6IFwic2xpZGVyc1wiLFxuICAgICAgXCJjb2RlXCI6IDU5NDE2LFxuICAgICAgXCJzcmNcIjogXCJmb250YXdlc29tZVwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInVpZFwiOiBcImM1MzA2OGZlMjFjODQxMGIwYTA5OGI0YzUyYzNkMzdlXCIsXG4gICAgICBcImNzc1wiOiBcImRvd24tY2lyY2xlZDJcIixcbiAgICAgIFwiY29kZVwiOiA1OTQxNCxcbiAgICAgIFwic3JjXCI6IFwiZm9udGF3ZXNvbWVcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ1aWRcIjogXCI3YmYxNDI4MWFmNTYzM2E1OTdmODViMDYxZWYxY2ZiOVwiLFxuICAgICAgXCJjc3NcIjogXCJhbmdsZS1yaWdodFwiLFxuICAgICAgXCJjb2RlXCI6IDU5Mzk0LFxuICAgICAgXCJzcmNcIjogXCJmb250YXdlc29tZVwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInVpZFwiOiBcImU0ZGRlMTk5MmY3ODcxNjNlMmUyYjUzNGI4YzgwNjdkXCIsXG4gICAgICBcImNzc1wiOiBcImFuZ2xlLWRvd25cIixcbiAgICAgIFwiY29kZVwiOiA1OTM5NSxcbiAgICAgIFwic3JjXCI6IFwiZm9udGF3ZXNvbWVcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ1aWRcIjogXCJjZTA2YjU4MDUxMjBkMGMyZjhkNjBjZDNmMWE0ZmRiNVwiLFxuICAgICAgXCJjc3NcIjogXCJwbGF5XCIsXG4gICAgICBcImNvZGVcIjogNTkzOTcsXG4gICAgICBcInNyY1wiOiBcImZvbnRhd2Vzb21lXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidWlkXCI6IFwiMGIyODA1MGJhYzlkM2ZhY2YyZjAyMjZkYjY0M2VjZTBcIixcbiAgICAgIFwiY3NzXCI6IFwicGF1c2VcIixcbiAgICAgIFwiY29kZVwiOiA1OTM5OSxcbiAgICAgIFwic3JjXCI6IFwiZm9udGF3ZXNvbWVcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ1aWRcIjogXCJmNDQ0NWZlYjU1NTIxMjgzNTcyZWU4OGJjMzA0ZjkyOFwiLFxuICAgICAgXCJjc3NcIjogXCJmbG9wcHlcIixcbiAgICAgIFwiY29kZVwiOiA1OTQwMSxcbiAgICAgIFwic3JjXCI6IFwiZm9udGF3ZXNvbWVcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ1aWRcIjogXCI3OTVlZmQwN2NkNTIwNWI1ODljODgzOTE2YTc2Y2ZmMFwiLFxuICAgICAgXCJjc3NcIjogXCJoZGRcIixcbiAgICAgIFwiY29kZVwiOiA1OTQxMSxcbiAgICAgIFwic3JjXCI6IFwiZm9udGF3ZXNvbWVcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ1aWRcIjogXCJjOTJhZDMwMjhhY2NlOWQ1MWJhZTBhYzgyZjVkZThhMlwiLFxuICAgICAgXCJjc3NcIjogXCJidWxsc2V5ZVwiLFxuICAgICAgXCJjb2RlXCI6IDU5NDA4LFxuICAgICAgXCJzcmNcIjogXCJmb250YXdlc29tZVwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInVpZFwiOiBcIjllMzRhMDQ3ZmVlOTQ5ZWFlOWI2ZTYxM2Q3OTBkNmNmXCIsXG4gICAgICBcImNzc1wiOiBcImRyb3Bib3hcIixcbiAgICAgIFwiY29kZVwiOiA1OTQwOSxcbiAgICAgIFwic3JjXCI6IFwiZm9udGF3ZXNvbWVcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ1aWRcIjogXCJlN2NiNzJhMTdmM2IyMWUzNTc2ZjM1YzNmMGE3NjM5YlwiLFxuICAgICAgXCJjc3NcIjogXCJnaXRcIixcbiAgICAgIFwiY29kZVwiOiA1OTQwNixcbiAgICAgIFwic3JjXCI6IFwiZm9udGF3ZXNvbWVcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ1aWRcIjogXCIyYzJjYThhOTZiMzE3ODFjOWM4MDU2ZDA1YzBhODk4MFwiLFxuICAgICAgXCJjc3NcIjogXCJibGFua1wiLFxuICAgICAgXCJjb2RlXCI6IDU5NDA3LFxuICAgICAgXCJzcmNcIjogXCJmb250YXdlc29tZVwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInVpZFwiOiBcImU1MzZjODBlMDExMzY2MDQ2MzYwZjVmZmU2NjlkYmZkXCIsXG4gICAgICBcImNzc1wiOiBcImZvbGRlci1hZGRcIixcbiAgICAgIFwiY29kZVwiOiA1OTQwMixcbiAgICAgIFwic3JjXCI6IFwidHlwaWNvbnNcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ1aWRcIjogXCIzNjY1MTBlY2ZiMDhjZDAxMTAxMzRiMWVhOTA3ZmI4MVwiLFxuICAgICAgXCJjc3NcIjogXCJldmVybm90ZVwiLFxuICAgICAgXCJjb2RlXCI6IDU5NDEwLFxuICAgICAgXCJzcmNcIjogXCJ6b2NpYWxcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ1aWRcIjogXCIyNzJlMDhlMGUxNjIyNmFhZGY5NGRjYmYzM2FhYjJiMlwiLFxuICAgICAgXCJjc3NcIjogXCJrZXlcIixcbiAgICAgIFwiY29kZVwiOiA1OTM5MixcbiAgICAgIFwic3JjXCI6IFwiZWx1c2l2ZVwiXG4gICAgfVxuICBdXG59IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcbnZhciB1bmNhbGMgPSByZXF1aXJlKCcuL3VuY2FsYycpO1xudmFyIEtleSA9IHJlcXVpcmUoJy4vS2V5Jyk7XG52YXIgYW1ndWkgPSByZXF1aXJlKCcuLi8uLi9hbWd1aScpO1xuXG5mdW5jdGlvbiBDc3NQYXJhbWV0ZXIgKG9wdCkge1xuXG4gICAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG4gICAgXG4gICAgdGhpcy5uYW1lID0gb3B0Lm5hbWUgfHwgJyc7XG5cbiAgICB0aGlzLl9saW5lSCA9IG9wdC5saW5lSCB8fCAyMTtcblxuICAgIHRoaXMuX2tleXMgPSBbXTtcblxuICAgIHRoaXMuZGVPcHRpb25zID0gdGhpcy5fY3JlYXRlUGFyYW1ldGVyT3B0aW9ucygpO1xuICAgIHRoaXMuZGVLZXlsaW5lID0gYW1ndWkuY3JlYXRlS2V5bGluZSh7XG4gICAgICAgIHRpbWVzY2FsZTogYW0udGltZWxpbmUudGltZXNjYWxlXG4gICAgfSk7XG5cbiAgICB0aGlzLl9vbkNoYW5nZUlucHV0ID0gdGhpcy5fb25DaGFuZ2VJbnB1dC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uQ2hhbmdlVGltZSA9IHRoaXMuX29uQ2hhbmdlVGltZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uQ2hhbmdlS2V5VGltZSA9IHRoaXMuX29uQ2hhbmdlS2V5VGltZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uVG9nZ2xlS2V5ID0gdGhpcy5fb25Ub2dnbGVLZXkuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vbkRlbGV0ZUtleSA9IHRoaXMuX29uRGVsZXRlS2V5LmJpbmQodGhpcyk7XG5cbiAgICBpZiAoIW9wdC5za2lwS2V5VmFsdWVJbnB1dCkge1xuXG4gICAgICAgIHRoaXMuX2lucHV0ID0gYW1ndWkuY3JlYXRlS2V5VmFsdWVJbnB1dCh7XG4gICAgICAgICAgICBwYXJlbnQ6IHRoaXMuZGVPcHRpb25zLFxuICAgICAgICAgICAga2V5OiB0aGlzLm5hbWUsXG4gICAgICAgICAgICB2YWx1ZTogb3B0LnZhbHVlLFxuICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMuX29uQ2hhbmdlSW5wdXQsXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuX2xpbmVIXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9pbnB1dC5zdHlsZS5mbGV4ID0gMTtcbiAgICB9XG5cbiAgICB0aGlzLl9idG5Ub2dnbGVLZXkgPSBhbWd1aS5jcmVhdGVJY29uQnRuKHtcbiAgICAgICAgaWNvbjogJ2tleScsXG4gICAgICAgIGhlaWdodDogMjEsXG4gICAgICAgIHBhcmVudDogdGhpcy5kZU9wdGlvbnNcbiAgICB9KTtcbiAgICB0aGlzLl9idG5Ub2dnbGVLZXkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vblRvZ2dsZUtleSk7XG4gICAgdGhpcy5fcmVmcmVzaEJ0blRvZ2dsZUtleSgpO1xuXG4gICAgYW0udGltZWxpbmUub24oJ2NoYW5nZVRpbWUnLCB0aGlzLl9vbkNoYW5nZVRpbWUpO1xufVxuXG5pbmhlcml0cyhDc3NQYXJhbWV0ZXIsIEV2ZW50RW1pdHRlcik7XG52YXIgcCA9IENzc1BhcmFtZXRlci5wcm90b3R5cGU7XG5cbnAuZ2V0VmFsdWUgPSBmdW5jdGlvbiAodGltZSkge1xuXG4gICAgaWYgKCFfLmlzTnVtYmVyKHRpbWUpKSB7XG4gICAgICAgIHRpbWUgPSBhbS50aW1lbGluZS5jdXJyVGltZTtcbiAgICB9XG5cbiAgICB2YXIgYmVmb3JlLCBhZnRlciwgc2FtZTtcblxuICAgIHRoaXMuX2tleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG5cbiAgICAgICAgaWYgKGtleS50aW1lID09PSB0aW1lKSB7XG4gICAgICAgIFxuICAgICAgICAgICAgc2FtZSA9IGtleTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChrZXkudGltZSA8IHRpbWUgJiYgKCFiZWZvcmUgfHwgYmVmb3JlLnRpbWUgPCBrZXkudGltZSkpIHtcbiAgICAgICAgXG4gICAgICAgICAgICBiZWZvcmUgPSBrZXk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoa2V5LnRpbWUgPiB0aW1lICYmICghYWZ0ZXIgfHwgYWZ0ZXIudGltZSA+IGtleS50aW1lKSkge1xuICAgICAgICBcbiAgICAgICAgICAgIGFmdGVyID0ga2V5O1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoc2FtZSkge1xuXG4gICAgICAgIHJldHVybiBzYW1lLnZhbHVlO1xuICAgIH1cbiAgICBlbHNlIHtcblxuICAgICAgICBpZiAoYWZ0ZXIgJiYgYmVmb3JlKSB7XG5cbiAgICAgICAgICAgIHZhciBwID0gKHRpbWUgLSBiZWZvcmUudGltZSkgLyAoYWZ0ZXIudGltZSAtIGJlZm9yZS50aW1lKSwgXG4gICAgICAgICAgICAgICAgYXYgPSB1bmNhbGMoYWZ0ZXIudmFsdWUpLCBidiA9IHVuY2FsYyhiZWZvcmUudmFsdWUpO1xuXG4gICAgICAgICAgICByZXR1cm4gJ2NhbGMoJyArIGJ2ICsgJyArICgnICsgYXYgKyAnIC0gJyArIGJ2ICsgJykqJyArIHAgKyAnKSc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYmVmb3JlKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBiZWZvcmUudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYWZ0ZXIpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGFmdGVyLnZhbHVlO1xuICAgICAgICB9XG4gICAgfVxufTtcblxucC5hZGRLZXkgPSBmdW5jdGlvbiAob3B0KSB7XG5cbiAgICB2YXIga2V5ID0gdGhpcy5nZXRLZXkob3B0LnRpbWUpO1xuXG4gICAgaWYgKGtleSkge1xuXG4gICAgICAgIGlmICgndmFsdWUnIGluIG9wdCkge1xuXG4gICAgICAgICAgICBrZXkudmFsdWUgPSBvcHQudmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG5cbiAgICAgICAga2V5ID0gbmV3IEtleShfLmV4dGVuZCh7ZGVLZXlsaW5lOiB0aGlzLmRlS2V5bGluZX0sIG9wdCkpO1xuXG4gICAgICAgIGtleS5vbignY2hhbmdlVGltZScsIHRoaXMuX29uQ2hhbmdlS2V5VGltZSk7XG4gICAgICAgIGtleS5vbignZGVsZXRlJywgdGhpcy5fb25EZWxldGVLZXkpO1xuXG4gICAgICAgIHRoaXMuX2tleXMucHVzaChrZXkpO1xuICAgIH1cblxuICAgIHRoaXMuX3JlZnJlc2hJbnB1dCgpO1xuICAgIHRoaXMuX3JlZnJlc2hCdG5Ub2dnbGVLZXkoKTtcblxuICAgIHRoaXMuZW1pdCgnY2hhbmdlJyk7XG5cbiAgICByZXR1cm4ga2V5O1xufTtcblxucC5nZXRLZXkgPSBmdW5jdGlvbiAodGltZSkge1xuXG4gICAgcmV0dXJuIHRoaXMuX2tleXMuZmluZChmdW5jdGlvbihrZXkpIHtcblxuICAgICAgICByZXR1cm4ga2V5LnRpbWUgPT09IHRpbWU7XG4gICAgfSk7XG59O1xuXG5wLmdldFByZXZLZXkgPSBmdW5jdGlvbiAodGltZSkge1xuXG4gICAgdmFyIHJldEtleTtcbiAgICBcbiAgICB0aGlzLl9rZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG5cbiAgICAgICAgaWYgKGtleS50aW1lIDwgdGltZSAmJiAoIXJldEtleSB8fCByZXRLZXkudGltZSA8IGtleS50aW1lKSkge1xuXG4gICAgICAgICAgICByZXRLZXkgPSBrZXk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiByZXRLZXk7XG59O1xuXG5wLmdldE5leHRLZXkgPSBmdW5jdGlvbiAodGltZSkge1xuXG4gICAgdmFyIHJldEtleTtcbiAgICBcbiAgICB0aGlzLl9rZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG5cbiAgICAgICAgaWYgKGtleS50aW1lID4gdGltZSAmJiAoIXJldEtleSB8fCByZXRLZXkudGltZSA+IGtleS50aW1lKSkge1xuXG4gICAgICAgICAgICByZXRLZXkgPSBrZXk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiByZXRLZXk7XG59O1xuXG5wLmdldEtleVRpbWVzID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIHRpbWVzID0gW107XG5cbiAgICB0aGlzLl9rZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuXG4gICAgICAgIHRpbWVzLnB1c2goa2V5LnRpbWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRpbWVzO1xufTtcblxucC5nZXRTYXZlID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIHNhdmUgPSB7XG4gICAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgICAga2V5czogW10sXG4gICAgfVxuXG4gICAgdGhpcy5fa2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcblxuICAgICAgICBzYXZlLmtleXMucHVzaCh7XG4gICAgICAgICAgICB2YWx1ZToga2V5LnZhbHVlLFxuICAgICAgICAgICAgdGltZToga2V5LnRpbWVcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc2F2ZTtcbn07XG5cbnAudXNlU2F2ZSA9IGZ1bmN0aW9uKHNhdmUpIHtcblxuICAgIHRoaXMubmFtZSA9IHNhdmUubmFtZTtcblxuICAgIHNhdmUua2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXlEYXRhKSB7XG5cbiAgICAgICAgdGhpcy5hZGRLZXkoa2V5RGF0YSk7XG4gICAgfSwgdGhpcyk7XG59O1xuXG5wLl9vbkNoYW5nZUlucHV0ID0gZnVuY3Rpb24gKGUpIHtcblxuICAgIGlmICgna2V5JyBpbiBlLmRldGFpbCkge1xuICAgICAgICB0aGlzLm5hbWUgPSBlLmRldGFpbC5rZXk7XG4gICAgfVxuXG4gICAgaWYgKCd2YWx1ZScgaW4gZS5kZXRhaWwpIHtcbiAgICAgICAgdGhpcy5hZGRLZXkoe1xuICAgICAgICAgICAgdGltZTogYW0udGltZWxpbmUuY3VyclRpbWUsXG4gICAgICAgICAgICB2YWx1ZTogZS5kZXRhaWwudmFsdWVcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5lbWl0KCdjaGFuZ2UnKTtcbn07XG5cbnAuX29uQ2hhbmdlS2V5VGltZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHRoaXMuZW1pdCgnY2hhbmdlJyk7XG59O1xuXG5wLl9vbkRlbGV0ZUtleSA9IGZ1bmN0aW9uIChrZXkpIHtcblxuICAgIHRoaXMuZGVsZXRlS2V5KGtleSk7XG59O1xuXG5wLl9vbkNoYW5nZVRpbWUgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB0aGlzLl9yZWZyZXNoSW5wdXQoKTtcbiAgICB0aGlzLl9yZWZyZXNoQnRuVG9nZ2xlS2V5KCk7XG59O1xuXG5wLl9vblRvZ2dsZUtleSA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBrZXkgPSB0aGlzLmdldEtleShhbS50aW1lbGluZS5jdXJyVGltZSk7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICAgIHRoaXMuZGVsZXRlS2V5KGtleSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmFkZEtleSh7dGltZTogYW0udGltZWxpbmUuY3VyclRpbWV9KTtcbiAgICB9XG59O1xuXG5wLmRlbGV0ZUtleSA9IGZ1bmN0aW9uIChrZXkpIHtcblxuICAgIHZhciBpZHggPSB0aGlzLl9rZXlzLmluZGV4T2Yoa2V5KTtcblxuICAgIGlmIChpZHggIT09IC0xKSB7XG5cbiAgICAgICAgdGhpcy5fa2V5cy5zcGxpY2UoaWR4LCAxKTtcblxuICAgICAgICBrZXkuZGlzcG9zZSgpO1xuXG4gICAgICAgIGtleS5yZW1vdmVMaXN0ZW5lcignY2hhbmdlVGltZScsIHRoaXMuX29uQ2hhbmdlS2V5VGltZSk7XG4gICAgICAgIGtleS5yZW1vdmVMaXN0ZW5lcignZGVsZXRlJywgdGhpcy5fb25EZWxldGVLZXkpO1xuXG4gICAgICAgIHRoaXMuX3JlZnJlc2hCdG5Ub2dnbGVLZXkoKTtcblxuICAgICAgICB0aGlzLmVtaXQoJ2NoYW5nZScpO1xuICAgIH1cbn07XG5cbnAuaXNWYWxpZCA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHJldHVybiAhISh0aGlzLm5hbWUgJiYgdGhpcy5fa2V5cy5sZW5ndGgpO1xufTtcblxucC5fcmVmcmVzaElucHV0ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdGhpcy5faW5wdXQuc2V0S2V5KHRoaXMubmFtZSk7XG4gICAgdGhpcy5faW5wdXQuc2V0VmFsdWUodGhpcy5nZXRWYWx1ZSgpKTtcbn07XG5cbnAuX3JlZnJlc2hCdG5Ub2dnbGVLZXkgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIga2V5ID0gdGhpcy5nZXRLZXkoYW0udGltZWxpbmUuY3VyclRpbWUpO1xuICAgIHRoaXMuX2J0blRvZ2dsZUtleS5zdHlsZS5jb2xvciA9IGtleSA/IGFtZ3VpLmNvbG9yLnRleHQgOiAncmdiYSgyNTUsMjU1LDI1NSwuMjMpJztcbn07XG5cbnAuX2NyZWF0ZVBhcmFtZXRlck9wdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkZS5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xuICAgIGRlLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgIGRlLnN0eWxlLmhlaWdodCA9IHRoaXMuX2xpbmVIICsgJ3B4JztcbiAgICBkZS5zdHlsZS5iYWNrZ3JvdW5kID0gJ2xpbmVhci1ncmFkaWVudCh0byBib3R0b20sICMxODRGMTIgMTglLCMxQjQ0MTcgOTYlKSc7XG5cbiAgICByZXR1cm4gZGU7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENzc1BhcmFtZXRlcjtcbiIsInZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXI7XG52YXIgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xudmFyIGFtZ3VpID0gcmVxdWlyZSgnLi4vLi4vYW1ndWknKTtcbnZhciBDc3NQYXJhbWV0ZXIgPSByZXF1aXJlKCcuL0Nzc1BhcmFtZXRlcicpO1xudmFyIENzc1RyYW5zZm9ybVBhcmFtZXRlciA9IHJlcXVpcmUoJy4vQ3NzVHJhbnNmb3JtUGFyYW1ldGVyJyk7XG52YXIgS2V5ID0gcmVxdWlyZSgnLi9LZXknKTtcbnZhciBUcmFuc2hhbmQgPSByZXF1aXJlKCcuLi8uLi90cmFuc2hhbmQvVHJhbnNoYW5kJyk7XG52YXIgbXN0UGxheWVyID0gcmVxdWlyZSgnLi9zY3JpcHQucGxheWVyLm1zdCcpO1xuXG5mdW5jdGlvbiBDc3NTZXF1ZW5jZShvcHQpIHtcblxuICAgIG9wdCA9IG9wdCB8fCB7fTtcblxuICAgIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gICAgQ3NzU2VxdWVuY2UuX2luc3RhbmNlcy5wdXNoKHRoaXMpO1xuXG4gICAgdGhpcy5fc2VsZWN0b3JzID0gb3B0LnNlbGVjdG9ycyB8fCBbXTtcbiAgICB0aGlzLl9wYXJhbWV0ZXJzID0gW107XG5cbiAgICB0aGlzLl9vcHQgPSBfLmV4dGVuZCh7YmFzZUg6IDIxfSwgb3B0KTtcblxuICAgIHRoaXMuX3NlbGVjdGVkRWxlbWVudHMgPSBbXTtcbiAgICB0aGlzLl9pc09wZW5lZCA9IGZhbHNlO1xuICAgIHRoaXMuX2hlYWRLZXlzID0gW107XG5cbiAgICB0aGlzLl9vblNlbGVjdENsaWNrID0gdGhpcy5fb25TZWxlY3RDbGljay5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uQ2hhbmdlSGFuZGxlciA9IHRoaXMuX29uQ2hhbmdlSGFuZGxlci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uQ2hhbmdlVGltZSA9IHRoaXMuX29uQ2hhbmdlVGltZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uQ2hhbmdlUGFyYW1ldGVyID0gdGhpcy5fb25DaGFuZ2VQYXJhbWV0ZXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vbkNoYW5nZUJsYW5rUGFyYW1ldGVyID0gdGhpcy5fb25DaGFuZ2VCbGFua1BhcmFtZXRlci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uVG9nZ2xlS2V5ID0gdGhpcy5fb25Ub2dnbGVLZXkuYmluZCh0aGlzKTtcblxuICAgIHRoaXMuZGVPcHRpb25zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5kZUtleXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgIHRoaXMuX2RlSGVhZE9wdGlub3MgPSB0aGlzLl9jcmVhdGVIZWFkT3B0aW9ucygpO1xuICAgIHRoaXMuX2RlSGVhZEtleWxpbmUgPSBhbWd1aS5jcmVhdGVLZXlsaW5lKHt9KTtcbiAgICB0aGlzLmRlS2V5cy5hcHBlbmRDaGlsZCh0aGlzLl9kZUhlYWRLZXlsaW5lKTtcblxuICAgIGFtLnRpbWVsaW5lLm9uKCdjaGFuZ2VUaW1lJywgdGhpcy5fb25DaGFuZ2VUaW1lKTtcbiAgICB0aGlzLmRlT3B0aW9ucy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uU2VsZWN0Q2xpY2spO1xuICAgIHRoaXMuZGVLZXlzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25TZWxlY3RDbGljayk7XG5cbiAgICB0aGlzLl9vbkNoYW5nZUJsYW5rUGFyYW1ldGVyKCk7XG59XG5cbkNzc1NlcXVlbmNlLl9pbnN0YW5jZXMgPSBbXTtcblxuaW5oZXJpdHMoQ3NzU2VxdWVuY2UsIEV2ZW50RW1pdHRlcik7XG52YXIgcCA9IENzc1NlcXVlbmNlLnByb3RvdHlwZTtcblxucC50eXBlID0gJ2Nzc19zZXF1X3R5cGUnO1xuXG5wLnNlbGVjdCA9IGZ1bmN0aW9uICgpIHtcblxuICAgIGlmICh0aGlzLl9pc1NlbGVjdGVkKSByZXR1cm47XG4gICAgdGhpcy5faXNTZWxlY3RlZCA9IHRydWU7XG5cblxuICAgIGlmICghdGhpcy5faGFuZGxlcikge1xuICAgICAgICB0aGlzLl9oYW5kbGVyID0gbmV3IFRyYW5zaGFuZCgpO1xuICAgIH1cblxuICAgIHRoaXMuX2hhbmRsZXIub24oJ2NoYW5nZScsIHRoaXMuX29uQ2hhbmdlSGFuZGxlcik7XG5cbiAgICB0aGlzLnNlbGVjdEVsZW1lbnRzKCk7XG5cbiAgICBpZiAodGhpcy5fc2VsZWN0ZWRFbGVtZW50cy5sZW5ndGgpIHtcblxuICAgICAgICB0aGlzLl9mb2N1c0hhbmRsZXIodGhpcy5fc2VsZWN0ZWRFbGVtZW50c1swXSk7XG4gICAgfVxuXG4gICAgdGhpcy5kZUhpZ2hsaWdodC5zdHlsZS5vcGFjaXR5ID0gMTtcblxuICAgIHRoaXMuZW1pdCgnc2VsZWN0JywgdGhpcyk7XG59O1xuXG5wLmRlc2VsZWN0ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgaWYgKCF0aGlzLl9pc1NlbGVjdGVkKSByZXR1cm47XG4gICAgdGhpcy5faXNTZWxlY3RlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5fYmx1ckhhbmRsZXIoKTtcblxuICAgIHRoaXMuZGVIaWdobGlnaHQuc3R5bGUub3BhY2l0eSA9IDA7XG5cbiAgICBpZiAodGhpcy5faGFuZGxlcikge1xuXG4gICAgICAgIHRoaXMuX2hhbmRsZXIucmVtb3ZlTGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuX29uQ2hhbmdlSGFuZGxlcik7XG4gICAgfVxufTtcblxucC5yZW5kZXJUaW1lID0gZnVuY3Rpb24gKHRpbWUpIHtcblxuICAgIGlmICh0aGlzLl9zZWxlY3RvcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgc2VsZWN0aW9uID0gXy50b0FycmF5KGFtLmRlUm9vdC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuX3NlbGVjdG9ycy5qb2luKCcsJykpKTtcblxuICAgIHRoaXMuX3BhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbiAocGFyYW0pIHtcblxuICAgICAgICBzZWxlY3Rpb24uZm9yRWFjaChmdW5jdGlvbiAoZGUpIHtcblxuICAgICAgICAgICAgZGUuc3R5bGVbcGFyYW0ubmFtZV0gPSBwYXJhbS5nZXRWYWx1ZSh0aW1lKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG5wLmhlaWdodCA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHJldHVybiB0aGlzLl9vcHQuYmFzZUggKiAodGhpcy5faXNPcGVuZWQgPyB0aGlzLl9wYXJhbWV0ZXJzLmxlbmd0aCArIDEgOiAxKTtcbn07XG5cbnAuX29uUGljayA9IGZ1bmN0aW9uIChkZSkge1xuXG4gICAgdmFyIGl0ZW1zID0gYW0uZGVSb290LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5zZWxlY3RvcnMuam9pbignLCcpKTtcblxuICAgIGlmIChpdGVtcy5pbmRleE9mKGRlKSkge1xuXG4gICAgICAgIHRoaXMuc2VsZWN0KCk7XG4gICAgfVxufTtcblxucC5fZm9jdXNIYW5kbGVyID0gZnVuY3Rpb24gKGRlKSB7XG5cbiAgICBkZSA9IGRlIHx8IHRoaXMuX2N1cnJIYW5kbGVkRGU7XG4gICAgdGhpcy5fY3VyckhhbmRsZWREZSA9IGRlO1xuXG4gICAgaWYgKCF0aGlzLl9jdXJySGFuZGxlZERlKSByZXR1cm47XG5cbiAgICB2YXIgdHJhbnNmb3JtU2F2ZTtcbiAgICBpZiAoZGUuc3R5bGUudHJhbnNmb3JtKSB7XG4gICAgICAgIHRyYW5zZm9ybVNhdmUgPSBkZS5zdHlsZS50cmFuc2Zvcm07XG4gICAgICAgIGRlLnN0eWxlLnRyYW5zZm9ybSA9ICcnO1xuICAgIH1cblxuICAgIHZhciBiciA9IGRlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgZGUuc3R5bGUudHJhbnNmb3JtID0gdHJhbnNmb3JtU2F2ZTtcblxuICAgIHZhciBoYW5kT3B0ID0ge1xuICAgICAgICB0eXBlOiAndHJhbnNmb3JtZXInLFxuICAgICAgICBiYXNlOiB7XG4gICAgICAgICAgICB4OiBici5sZWZ0LFxuICAgICAgICAgICAgeTogYnIudG9wLFxuICAgICAgICAgICAgdzogYnIud2lkdGgsXG4gICAgICAgICAgICBoOiBici5oZWlnaHQsXG4gICAgICAgIH1cbiAgICB9O1xuICAgIHZhciB0cmFuc2Zvcm1QYXJhbSA9IHRoaXMuZ2V0UGFyYW1ldGVyKCd0cmFuc2Zvcm0nKTtcblxuICAgIGlmICh0cmFuc2Zvcm1QYXJhbSkge1xuXG4gICAgICAgIGhhbmRPcHQucGFyYW1zID0gdHJhbnNmb3JtUGFyYW0uZ2V0UmF3VmFsdWUoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9oYW5kbGVyLnNldHVwKHtcbiAgICAgICAgaGFuZDogaGFuZE9wdFxuICAgIH0pO1xuICAgIHRoaXMuX2hhbmRsZXIuYWN0aXZhdGUoKTtcblxuICAgIGFtLmRlSGFuZGxlckNvbnQuYXBwZW5kQ2hpbGQodGhpcy5faGFuZGxlci5kb21FbGVtKTtcbn07XG5cbnAuX2JsdXJIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xuXG4gICAgLy8gdGhpcy5fY3VyckhhbmRsZWREZSA9IHVuZGVmaW5lZDtcblxuICAgIGlmICh0aGlzLl9oYW5kbGVyICYmIHRoaXMuX2hhbmRsZXIuZG9tRWxlbSAmJiB0aGlzLl9oYW5kbGVyLmRvbUVsZW0ucGFyZW50Tm9kZSkge1xuXG4gICAgICAgIHRoaXMuX2hhbmRsZXIuZGVhY3RpdmF0ZSgpO1xuICAgICAgICB0aGlzLl9oYW5kbGVyLmRvbUVsZW0ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9oYW5kbGVyLmRvbUVsZW0pO1xuICAgIH1cbn07XG5cbnAuX29uU2VsZWN0Q2xpY2sgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB0aGlzLnNlbGVjdCgpO1xufTtcblxucC5fb25DaGFuZ2VIYW5kbGVyID0gZnVuY3Rpb24ocGFyYW1zLCB0eXBlKSB7XG5cbiAgICB2YXIgdGltZSA9IGFtLnRpbWVsaW5lLmN1cnJUaW1lLFxuICAgICAgICBuYW1lLCBwcm9wLCB2YWx1ZTtcblxuXG4gICAgaWYgKHR5cGUgPT09ICd0cmFuc2Zvcm0nKSB7XG5cbiAgICAgICAgT2JqZWN0LmtleXMocGFyYW1zKS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG5cbiAgICAgICAgICAgIGlmIChuYW1lID09PSAndHgnIHx8IG5hbWUgPT09ICd0eScgfHwgbmFtZSA9PT0gJ3R6JyB8fFxuICAgICAgICAgICAgICAgIG5hbWUgPT09ICdyeCcgfHwgbmFtZSA9PT0gJ3J5JyB8fCBuYW1lID09PSAncnonIHx8XG4gICAgICAgICAgICAgICAgbmFtZSA9PT0gJ3N4JyB8fCBuYW1lID09PSAnc3knIHx8IG5hbWUgPT09ICdzeicpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSB7fTtcbiAgICAgICAgICAgICAgICB2YWx1ZVtuYW1lXSA9IHBhcmFtc1tuYW1lXTtcblxuICAgICAgICAgICAgICAgIHByb3AgPSB0aGlzLmFkZFBhcmFtZXRlcih7bmFtZTogJ3RyYW5zZm9ybSd9KTtcbiAgICAgICAgICAgICAgICBwcm9wLmFkZEtleSh7XG4gICAgICAgICAgICAgICAgICAgIHRpbWU6IHRpbWUsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICBpZiAoJ294JyBpbiBwYXJhbXMgJiYgJ295JyBpbiBwYXJhbXMpIHtcblxuICAgICAgICAgICAgcHJvcCA9IHRoaXMuYWRkUGFyYW1ldGVyKHtuYW1lOiAndHJhbnNmb3JtLW9yaWdpbid9KTtcbiAgICAgICAgICAgIHByb3AuYWRkS2V5KHtcbiAgICAgICAgICAgICAgICB0aW1lOiB0aW1lLFxuICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICAgICAgdmFsdWU6IChwYXJhbXMub3gqMTAwKSArICclICcgKyAocGFyYW1zLm95KjEwMCkgKyAnJSdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5yZW5kZXJUaW1lKHRpbWUpO1xuICAgIHRoaXMuX2ZvY3VzSGFuZGxlcigpO1xufTtcblxucC5fb25DaGFuZ2VUaW1lID0gZnVuY3Rpb24gKHRpbWUpIHtcblxuICAgIHRoaXMuX3BhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbiAocGFyYW0pIHtcblxuICAgICAgICB0aGlzLnJlbmRlclRpbWUodGltZSk7XG4gICAgICAgIHRoaXMuX2ZvY3VzSGFuZGxlcigpO1xuICAgICAgICB0aGlzLl9yZWZyZXNoQnRuVG9nZ2xlS2V5KCk7XG4gICAgfSwgdGhpcyk7XG59O1xuXG5wLl9vbkNoYW5nZVBhcmFtZXRlciA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHRoaXMucmVuZGVyVGltZSgpO1xuICAgIHRoaXMuX2ZvY3VzSGFuZGxlcigpO1xuICAgIHRoaXMuX3JlZnJlc2hIZWFkS2V5bGluZSgpO1xuICAgIHRoaXMuX3JlZnJlc2hCdG5Ub2dnbGVLZXkoKTtcblxuICAgIHRoaXMuZW1pdCgnY2hhbmdlJyk7XG59O1xuXG5wLl9vbkNoYW5nZUJsYW5rUGFyYW1ldGVyID0gZnVuY3Rpb24gKCkge1xuXG4gICAgaWYgKHRoaXMuX2JsYW5rUGFyYW1ldGVyKSB7XG5cbiAgICAgICAgdGhpcy5fYmxhbmtQYXJhbWV0ZXIucmVtb3ZlTGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuX29uQ2hhbmdlQmxhbmtQYXJhbWV0ZXIpO1xuICAgIH07XG5cbiAgICB0aGlzLl9ibGFua1BhcmFtZXRlciA9IHRoaXMuYWRkUGFyYW1ldGVyKCk7XG4gICAgdGhpcy5fYmxhbmtQYXJhbWV0ZXIub24oJ2NoYW5nZScsIHRoaXMuX29uQ2hhbmdlQmxhbmtQYXJhbWV0ZXIpO1xufTtcblxucC5fb25Ub2dnbGVLZXkgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgdGltZSA9IGFtLnRpbWVsaW5lLmN1cnJUaW1lO1xuICAgICAgICBhbGxIYXZlS2V5ID0gdGhpcy5faXNBbGxQYXJhbXNIYXZlS2V5KHRpbWUpO1xuXG4gICAgdGhpcy5fcGFyYW1ldGVycy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJhbSkge1xuXG4gICAgICAgIGlmIChwYXJhbS5pc1ZhbGlkKCkpIHtcblxuICAgICAgICAgICAgaWYgKGFsbEhhdmVLZXkpIHtcbiAgICAgICAgICAgICAgICBwYXJhbS5kZWxldGVLZXkocGFyYW0uZ2V0S2V5KHRpbWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhcmFtLmFkZEtleSh7dGltZTogdGltZX0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9yZWZyZXNoQnRuVG9nZ2xlS2V5KCk7XG59O1xuXG5wLl9pc0FsbFBhcmFtc0hhdmVLZXkgPSBmdW5jdGlvbiAodGltZSkge1xuXG4gICAgcmV0dXJuIHRoaXMuX3BhcmFtZXRlcnMuZXZlcnkoZnVuY3Rpb24gKHBhcmFtKSB7XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtLmdldEtleSh0aW1lKSB8fCAhcGFyYW0uaXNWYWxpZCgpO1xuICAgIH0pO1xufTtcblxucC5nZXRQYXJhbWV0ZXIgPSBmdW5jdGlvbiAobmFtZSkge1xuXG4gICAgcmV0dXJuIHRoaXMuX3BhcmFtZXRlcnMuZmluZChmdW5jdGlvbihwYXJhbSkge1xuXG4gICAgICAgIHJldHVybiBwYXJhbS5uYW1lID09PSBuYW1lO1xuICAgIH0pO1xufTtcblxucC5hZGRQYXJhbWV0ZXIgPSBmdW5jdGlvbiAob3B0KSB7XG5cbiAgICBvcHQgPSBvcHQgfHwge307XG5cbiAgICB2YXIgcGFyYW0gPSB0aGlzLmdldFBhcmFtZXRlcihvcHQubmFtZSk7XG5cbiAgICBpZiAocGFyYW0pIHtcblxuICAgICAgICByZXR1cm4gcGFyYW1cbiAgICB9XG4gICAgZWxzZSB7XG5cbiAgICAgICAgaWYgKG9wdC5uYW1lID09PSAndHJhbnNmb3JtJykge1xuXG4gICAgICAgICAgICBwYXJhbSA9IG5ldyBDc3NUcmFuc2Zvcm1QYXJhbWV0ZXIob3B0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcblxuICAgICAgICAgICAgcGFyYW0gPSBuZXcgQ3NzUGFyYW1ldGVyKG9wdCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9wYXJhbWV0ZXJzLnB1c2gocGFyYW0pO1xuICAgICAgICBwYXJhbS5vbignY2hhbmdlJywgdGhpcy5fb25DaGFuZ2VQYXJhbWV0ZXIpO1xuXG4gICAgICAgIHRoaXMuZGVPcHRpb25zLmFwcGVuZENoaWxkKHBhcmFtLmRlT3B0aW9ucyk7XG4gICAgICAgIHRoaXMuZGVLZXlzLmFwcGVuZENoaWxkKHBhcmFtLmRlS2V5bGluZSk7XG4gICAgICAgIHRoaXMuZW1pdCgnY2hhbmdlSGVpZ2h0Jyk7XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtO1xuICAgIH1cbn07XG5cbnAuX3JlZnJlc2hCdG5Ub2dnbGVLZXkgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgYWxsSGF2ZUtleSA9IHRoaXMuX2lzQWxsUGFyYW1zSGF2ZUtleShhbS50aW1lbGluZS5jdXJyVGltZSk7XG4gICAgdGhpcy5fYnRuVG9nZ2xlS2V5LnN0eWxlLmNvbG9yID0gYWxsSGF2ZUtleSA/IGFtZ3VpLmNvbG9yLnRleHQgOiAncmdiYSgyNTUsMjU1LDI1NSwuMjMpJztcbn07XG5cblxucC5fcmVmcmVzaEhlYWRLZXlsaW5lID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIHRpbWVzID0gW10sIG9sZEtleXMgPSB0aGlzLl9oZWFkS2V5cy5zcGxpY2UoMCk7XG5cbiAgICB0aGlzLl9wYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gKHBhcmFtKSB7XG5cbiAgICAgICAgdGltZXMgPSB0aW1lcy5jb25jYXQocGFyYW0uZ2V0S2V5VGltZXMoKSk7XG4gICAgfSk7XG5cbiAgICB0aW1lcyA9IF8udW5pcSh0aW1lcyk7XG5cbiAgICB0aW1lcy5mb3JFYWNoKGZ1bmN0aW9uICh0aW1lKSB7XG5cbiAgICAgICAgdmFyIGtleSA9IG9sZEtleXMucG9wKCkgfHwgbmV3IEtleSh7XG4gICAgICAgICAgICBkZUtleWxpbmU6IHRoaXMuX2RlSGVhZEtleWxpbmVcbiAgICAgICAgfSk7XG5cbiAgICAgICAga2V5LnRpbWUgPSB0aW1lO1xuXG4gICAgICAgIHRoaXMuX2hlYWRLZXlzLnB1c2goa2V5KTtcbiAgICB9LCB0aGlzKTtcblxuICAgIF8uaW52b2tlKF8uZGlmZmVyZW5jZShvbGRLZXlzLCB0aGlzLl9oZWFkS2V5cyksICdkaXNwb3NlJyk7XG59O1xuXG5wLmdldFNjcmlwdCA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBrZXlzID0gW10sIGNvZGUgPSAnJywgb3B0aW9ucywgc2VsZWN0b3JzLFxuICAgICAgICBsb25nZXN0T2Zmc2V0ID0gMDtcblxuICAgIHRoaXMuX3BhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbiAocGFyYW0pIHtcblxuICAgICAgICBwYXJhbS5fa2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcblxuICAgICAgICAgICAgdmFyIG9mZnNldCA9IGtleS50aW1lO1xuICAgICAgICAgICAgZ2V0S2V5KG9mZnNldClbcGFyYW0ubmFtZV0gPSBwYXJhbS5nZXRWYWx1ZShrZXkudGltZSk7XG5cbiAgICAgICAgICAgIGlmIChsb25nZXN0T2Zmc2V0IDwgb2Zmc2V0KSBsb25nZXN0T2Zmc2V0ID0gb2Zmc2V0O1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG5cbiAgICAgICAga2V5Lm9mZnNldCAvPSBsb25nZXN0T2Zmc2V0O1xuICAgIH0pO1xuXG4gICAga2V5cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG5cbiAgICAgICAgcmV0dXJuIGEub2Zmc2V0IC0gYi5vZmZzZXQ7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBnZXRLZXkodGltZSkge1xuXG4gICAgICAgIHZhciBrZXkgPSBrZXlzLmZpbmQoZnVuY3Rpb24gKF9rZXkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aW1lID09PSBfa2V5Lm9mZnNldDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKCFrZXkpIHtcblxuICAgICAgICAgICAga2V5ID0ge29mZnNldDogdGltZX07XG4gICAgICAgICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBrZXk7XG4gICAgfVxuXG4gICAgb3B0aW9ucyA9IHtcbiAgICAgIGRpcmVjdGlvbjogXCJub3JtYWxcIixcbiAgICAgIGR1cmF0aW9uOiBsb25nZXN0T2Zmc2V0LFxuICAgICAgaXRlcmF0aW9uczogMVxuICAgIH07XG5cbiAgICBzZWxlY3RvcnMgPSB0aGlzLl9zZWxlY3RvcnMuam9pbignLCcpLnJlcGxhY2UoJ1xcXFwnLCdcXFxcXFxcXCcpO1xuXG4gICAgY29kZSA9IE11c3RhY2hlLnJlbmRlcihtc3RQbGF5ZXIsIHtcbiAgICAgICAga2V5czogSlNPTi5zdHJpbmdpZnkoa2V5cyksXG4gICAgICAgIG9wdGlvbnM6IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMpLFxuICAgICAgICBzZWxlY3RvcnM6IHNlbGVjdG9yc1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNvZGU7XG59O1xuXG5wLmdldFNhdmUgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgc2F2ZSA9IHtcbiAgICAgICAgc2VsZWN0b3JzOiBfLmNsb25lKHRoaXMuX3NlbGVjdG9ycyksXG4gICAgICAgIHBhcmFtZXRlcnM6IFtdLFxuICAgIH07XG5cbiAgICB0aGlzLl9wYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gKHBhcmFtKSB7XG5cbiAgICAgICAgc2F2ZS5wYXJhbWV0ZXJzLnB1c2gocGFyYW0uZ2V0U2F2ZSgpKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBzYXZlO1xufTtcblxucC51c2VTYXZlID0gZnVuY3Rpb24gKHNhdmUpIHtcblxuICAgIHRoaXMuX3NlbGVjdG9ycyA9IHNhdmUuc2VsZWN0b3JzO1xuXG4gICAgc2F2ZS5wYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gKHBhcmFtRGF0YSkge1xuICAgICAgICAvL2hhY2s6IGdpdmUgdGhlICduYW1lJyBvbiBjcmVhdGluZyB0aGUgcGFyYW0gdG8gaGF2ZVxuICAgICAgICAvLyAgdGhlICdDc3NUcmFuc2Zvcm1QYXJhbWV0ZXInIGluc3RhbmNlIGZvciB0aGUgJ3RyYW5zZm9ybScgcGFyYW1ldGVyXG4gICAgICAgIHZhciBwYXJhbSA9IHRoaXMuYWRkUGFyYW1ldGVyKHtuYW1lOiBwYXJhbURhdGEubmFtZX0pO1xuICAgICAgICBwYXJhbS51c2VTYXZlKHBhcmFtRGF0YSk7XG4gICAgfSwgdGhpcyk7XG5cbiAgICByZXR1cm4gc2F2ZTtcbn07XG5cbnAuZ2V0TWFnbmV0UG9pbnRzID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIHRpbWVzID0gW107XG5cbiAgICB0aGlzLl9oZWFkS2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcblxuICAgICAgICB0aW1lcy5wdXNoKGtleS50aW1lKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aW1lcztcbn07XG5cblxuXG5wLl9jcmVhdGVIZWFkT3B0aW9ucyA9IGZ1bmN0aW9uICgpe1xuXG4gICAgdmFyIGRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGUuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnO1xuICAgIGRlLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgIGRlLnN0eWxlLmhlaWdodCA9IHRoaXMuX29wdC5iYXNlSCArICdweCc7XG4gICAgZGUuc3R5bGUuYmFja2dyb3VuZCA9ICdsaW5lYXItZ3JhZGllbnQodG8gYm90dG9tLCAjMDYzNTAxIDE4JSwjMDY0MTAwIDk2JSknO1xuICAgIHRoaXMuZGVPcHRpb25zLmFwcGVuZENoaWxkKGRlKTtcblxuICAgIHRoaXMuZGVIaWdobGlnaHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLmRlSGlnaGxpZ2h0LnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJztcbiAgICB0aGlzLmRlSGlnaGxpZ2h0LnN0eWxlLndpZHRoID0gJzJweCc7XG4gICAgdGhpcy5kZUhpZ2hsaWdodC5zdHlsZS5oZWlnaHQgPSB0aGlzLl9vcHQuYmFzZUggKyAncHgnO1xuICAgIHRoaXMuZGVIaWdobGlnaHQuc3R5bGUuYmFja2dyb3VuZCA9ICdnb2xkJztcbiAgICB0aGlzLmRlSGlnaGxpZ2h0LnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgIGRlLmFwcGVuZENoaWxkKHRoaXMuZGVIaWdobGlnaHQpO1xuXG4gICAgdGhpcy5fZGVUb2dnbGVEcm9wRG93biA9IGFtZ3VpLmNyZWF0ZVRvZ2dsZUljb25CdG4oe1xuICAgICAgICBpY29uT246ICdhbmdsZS1kb3duJyxcbiAgICAgICAgaWNvbk9mZjogJ2FuZ2xlLXJpZ2h0JyxcbiAgICAgICAgaGVpZ2h0OiB0aGlzLl9vcHQuYmFzZUgsXG4gICAgfSk7XG4gICAgdGhpcy5fZGVUb2dnbGVEcm9wRG93bi5hZGRFdmVudExpc3RlbmVyKCd0b2dnbGUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICB0aGlzLl9pc09wZW5lZCA9IGUuZGV0YWlsLnN0YXRlO1xuICAgICAgICB0aGlzLmVtaXQoJ2NoYW5nZUhlaWdodCcsIHRoaXMuaGVpZ2h0KCkpO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fZGVUb2dnbGVEcm9wRG93bi5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jayc7XG4gICAgZGUuYXBwZW5kQ2hpbGQodGhpcy5fZGVUb2dnbGVEcm9wRG93bik7XG5cbiAgICB0aGlzLl9kZU9wdGlvbnNCdG4gPSBhbWd1aS5jcmVhdGVJY29uQnRuKHtpY29uOiAnY29nJywgaGVpZ2h0OiB0aGlzLl9vcHQuYmFzZUh9KTtcbiAgICB0aGlzLl9kZU9wdGlvbnNCdG4uc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgIHRoaXMuX2RlT3B0aW9uc0J0bi5zdHlsZS5yaWdodCA9ICcyMXB4JztcbiAgICB0aGlzLl9kZU9wdGlvbnNCdG4uc3R5bGUudG9wID0gJzBweCc7XG4gICAgZGUuYXBwZW5kQ2hpbGQodGhpcy5fZGVPcHRpb25zQnRuKTtcblxuICAgIHRoaXMuX2J0blRvZ2dsZUtleSA9IGFtZ3VpLmNyZWF0ZUljb25CdG4oe2ljb246ICdrZXknLCBoZWlnaHQ6IHRoaXMuX29wdC5iYXNlSH0pO1xuICAgIHRoaXMuX2J0blRvZ2dsZUtleS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgdGhpcy5fYnRuVG9nZ2xlS2V5LnN0eWxlLnJpZ2h0ID0gJzBweCc7XG4gICAgdGhpcy5fYnRuVG9nZ2xlS2V5LnN0eWxlLnRvcCA9ICcwcHgnO1xuICAgIHRoaXMuX2J0blRvZ2dsZUtleS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uVG9nZ2xlS2V5KTtcbiAgICBkZS5hcHBlbmRDaGlsZCh0aGlzLl9idG5Ub2dnbGVLZXkpO1xuICAgIHRoaXMuX3JlZnJlc2hCdG5Ub2dnbGVLZXkoKTtcblxuICAgIHJldHVybiBkZTtcbn07XG5cbnAuaXNPd25lZERvbUVsZW1lbnQgPSBmdW5jdGlvbiAoZGUpIHtcblxuICAgIHJldHVybiB0aGlzLl9zZWxlY3RlZEVsZW1lbnRzLmluZGV4T2YoZGUpICE9PSAtMTtcbn07XG5cbnAuc2VsZWN0RWxlbWVudHMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgbGlzdCA9IFtdO1xuXG4gICAgdGhpcy5fc2VsZWN0b3JzLmZvckVhY2goZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG5cbiAgICAgICAgdmFyIGl0ZW1zID0gYW0uZGVSb290LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICBpdGVtcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGl0ZW1zKTtcbiAgICAgICAgbGlzdCA9IGxpc3QuY29uY2F0KGl0ZW1zKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX3NlbGVjdGVkRWxlbWVudHMgPSBsaXN0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDc3NTZXF1ZW5jZTtcblxuXG5cblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xudmFyIENzc1BhcmFtZXRlciA9IHJlcXVpcmUoJy4vQ3NzUGFyYW1ldGVyJyk7XG52YXIgdW5jYWxjID0gcmVxdWlyZSgnLi91bmNhbGMnKTtcbnZhciBLZXkgPSByZXF1aXJlKCcuL0tleScpO1xudmFyIGFtZ3VpID0gcmVxdWlyZSgnLi4vLi4vYW1ndWknKTtcblxudmFyIEJBU0VfVkFMVUVTID0ge1xuICAgIHR4OiAwLCB0eTogMCwgdHo6IDAsXG4gICAgcng6IDAsIHJ5OiAwLCByejogMCxcbiAgICBzeDogMSwgc3k6IDEsIHN6OiAxLFxuICAgIHNrZXdYOiAwLCBza2V3WTogMCxcbiAgICBwZXJzcGVjdGl2ZTogMFxufTtcblxuZnVuY3Rpb24gQ3NzVHJhbnNmb3JtUGFyYW1ldGVyIChvcHQpIHtcblxuICAgIENzc1BhcmFtZXRlci5jYWxsKHRoaXMsIF8uZXh0ZW5kKHtcbiAgICAgICAgbmFtZTogJ3RyYW5zZm9ybScsXG4gICAgICAgIHNraXBLZXlWYWx1ZUlucHV0OiB0cnVlLFxuICAgIH0sIG9wdCkpO1xufVxuXG5pbmhlcml0cyhDc3NUcmFuc2Zvcm1QYXJhbWV0ZXIsIENzc1BhcmFtZXRlcik7XG52YXIgcCA9IENzc1RyYW5zZm9ybVBhcmFtZXRlci5wcm90b3R5cGU7XG5cbnAuZ2V0VmFsdWUgPSBmdW5jdGlvbiAodGltZSkge1xuXG4gICAgcmV0dXJuIGNvbnZlcnRUcmFuc2Zvcm1WYWx1ZSh0aGlzLmdldFJhd1ZhbHVlKHRpbWUpKTtcbn07XG5cbnAuZ2V0UmF3VmFsdWUgPSBmdW5jdGlvbiAodGltZSkge1xuXG4gICAgaWYgKCFfLmlzTnVtYmVyKHRpbWUpKSB7XG4gICAgICAgIHRpbWUgPSBhbS50aW1lbGluZS5jdXJyVGltZTtcbiAgICB9XG5cbiAgICB2YXIgYmVmb3JlLCBhZnRlciwgc2FtZTtcblxuICAgIHRoaXMuX2tleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG5cbiAgICAgICAgaWYgKGtleS50aW1lID09PSB0aW1lKSB7XG4gICAgICAgIFxuICAgICAgICAgICAgc2FtZSA9IGtleTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChrZXkudGltZSA8IHRpbWUgJiYgKCFiZWZvcmUgfHwgYmVmb3JlLnRpbWUgPCBrZXkudGltZSkpIHtcbiAgICAgICAgXG4gICAgICAgICAgICBiZWZvcmUgPSBrZXk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoa2V5LnRpbWUgPiB0aW1lICYmICghYWZ0ZXIgfHwgYWZ0ZXIudGltZSA+IGtleS50aW1lKSkge1xuICAgICAgICBcbiAgICAgICAgICAgIGFmdGVyID0ga2V5O1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoc2FtZSkge1xuXG4gICAgICAgIHJldHVybiBzYW1lLnZhbHVlO1xuICAgIH1cbiAgICBlbHNlIHtcblxuICAgICAgICBpZiAoYWZ0ZXIgJiYgYmVmb3JlKSB7XG5cbiAgICAgICAgICAgIHZhciBjYWxjdWxhdGVkID0ge30sXG4gICAgICAgICAgICAgICAgcCA9ICh0aW1lIC0gYmVmb3JlLnRpbWUpIC8gKGFmdGVyLnRpbWUgLSBiZWZvcmUudGltZSksXG4gICAgICAgICAgICAgICAgYXYgPSBhZnRlci52YWx1ZSxcbiAgICAgICAgICAgICAgICBidiA9IGJlZm9yZS52YWx1ZTtcblxuICAgICAgICAgICAgT2JqZWN0LmtleXMoYnYpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcblxuICAgICAgICAgICAgICAgIGlmIChuYW1lIGluIGF2KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FsY3VsYXRlZFtuYW1lXSA9IGJ2W25hbWVdICsgKGF2W25hbWVdIC0gYnZbbmFtZV0pICogcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGN1bGF0ZWRbbmFtZV0gPSBidltuYW1lXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGNhbGN1bGF0ZWQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYmVmb3JlKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBfLmNsb25lKGJlZm9yZS52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYWZ0ZXIpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIF8uY2xvbmUoYWZ0ZXIudmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIF8uY2xvbmUoQkFTRV9WQUxVRVMpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxucC5hZGRLZXkgPSBmdW5jdGlvbiAob3B0KSB7XG5cbiAgICB2YXIga2V5ID0gdGhpcy5nZXRLZXkob3B0LnRpbWUpO1xuXG4gICAgaWYgKGtleSkge1xuXG4gICAgICAgIGlmICgndmFsdWUnIGluIG9wdCkge1xuXG4gICAgICAgICAgICBrZXkudmFsdWUgPSBfLmV4dGVuZChrZXkudmFsdWUsIG9wdC52YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGtleSA9IG5ldyBLZXkoXy5leHRlbmQoe2RlS2V5bGluZTogdGhpcy5kZUtleWxpbmV9LCBvcHQpKTtcbiAgICAgICAga2V5LnZhbHVlID0gXy5leHRlbmQodGhpcy5nZXRSYXdWYWx1ZShvcHQudGltZSksIG9wdC52YWx1ZSk7XG5cbiAgICAgICAga2V5Lm9uKCdjaGFuZ2VUaW1lJywgdGhpcy5fb25DaGFuZ2VLZXlUaW1lKTtcbiAgICAgICAga2V5Lm9uKCdkZWxldGUnLCB0aGlzLl9vbkRlbGV0ZUtleSk7XG5cbiAgICAgICAgdGhpcy5fa2V5cy5wdXNoKGtleSk7XG4gICAgfVxuXG4gICAgdGhpcy5fcmVmcmVzaElucHV0KCk7XG4gICAgdGhpcy5fcmVmcmVzaEJ0blRvZ2dsZUtleSgpO1xuXG4gICAgdGhpcy5lbWl0KCdjaGFuZ2UnKTtcblxuICAgIHJldHVybiBrZXk7XG59O1xuXG5wLl9vbkNoYW5nZUlucHV0ID0gZnVuY3Rpb24gKGUpIHtcblxuICAgIGlmICgna2V5JyBpbiBlLmRldGFpbCkge1xuICAgICAgICB0aGlzLm5hbWUgPSBlLmRldGFpbC5rZXk7XG4gICAgfVxuXG4gICAgaWYgKCdwYXJhbU5hbWUnIGluIGUuZGV0YWlsICYmICd2YWx1ZScgaW4gZS5kZXRhaWwpIHtcbiAgICAgICAgXG4gICAgICAgIHZhciBrZXkgPSB0aGlzLmFkZEtleSh7XG4gICAgICAgICAgICB0aW1lOiBhbS50aW1lbGluZS5jdXJyVGltZSxcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBrZXkudmFsdWVbZS5kZXRhaWwucGFyYW1OYW1lXSA9IGUuZGV0YWlsLnZhbHVlO1xuICAgIH1cblxuICAgIHRoaXMuZW1pdCgnY2hhbmdlJyk7XG59O1xuXG5wLl9yZWZyZXNoSW5wdXQgPSBmdW5jdGlvbiAoKSB7XG5cbn07XG5cbmZ1bmN0aW9uIGNvbnZlcnRUcmFuc2Zvcm1WYWx1ZSh2KSB7XG5cbiAgICB2YXIgdHggPSAndHgnIGluIHYgJiYgdi50eCAhPT0gQkFTRV9WQUxVRVMudHgsXG4gICAgICAgIHR5ID0gJ3R5JyBpbiB2ICYmIHYudHkgIT09IEJBU0VfVkFMVUVTLnR5LFxuICAgICAgICB0eiA9ICd0eicgaW4gdiAmJiB2LnR6ICE9PSBCQVNFX1ZBTFVFUy50eixcbiAgICAgICAgcnggPSAncngnIGluIHYgJiYgdi5yeCAhPT0gQkFTRV9WQUxVRVMucngsXG4gICAgICAgIHJ5ID0gJ3J5JyBpbiB2ICYmIHYucnkgIT09IEJBU0VfVkFMVUVTLnJ5LFxuICAgICAgICByeiA9ICdyeicgaW4gdiAmJiB2LnJ6ICE9PSBCQVNFX1ZBTFVFUy5yeixcbiAgICAgICAgc3ggPSAnc3gnIGluIHYgJiYgdi5zeCAhPT0gQkFTRV9WQUxVRVMuc3gsXG4gICAgICAgIHN5ID0gJ3N5JyBpbiB2ICYmIHYuc3kgIT09IEJBU0VfVkFMVUVTLnN5LFxuICAgICAgICBzeiA9ICdzeicgaW4gdiAmJiB2LnN6ICE9PSBCQVNFX1ZBTFVFUy5zeixcbiAgICAgICAgc2tld1ggPSAnc2tlZXdYJyBpbiB2ICYmIHYuc2tld1ggIT09IEJBU0VfVkFMVUVTLnNrZXdYLFxuICAgICAgICBza2V3WSA9ICdza2Vld1knIGluIHYgJiYgdi5za2V3WSAhPT0gQkFTRV9WQUxVRVMuc2tld1ksXG4gICAgICAgIHBlcnNwZWN0aXZlID0gJ3BlcnNwZWN0aXZlJyBpbiB2ICYmIHYucGVyc3BlY3RpdmUgIT09IEJBU0VfVkFMVUVTLnBlcnNwZWN0aXZlLFxuICAgICAgICByZXQgPSAnJztcblxuICAgIGlmICh0eCAmJiB0eSAmJiB0eikgcmV0ICs9ICd0cmFuc2xhdGUzZCgnK3YudHgrJ3B4LCcrdi50eSsncHgsJyt2LnR6KydweCkgJztcbiAgICBlbHNlIGlmICh0eCAmJiB0eSkgcmV0ICs9ICd0cmFuc2xhdGUoJyt2LnR4KydweCwnK3YudHkrJ3B4KSAnO1xuICAgIGVsc2Uge1xuICAgICAgICBpZiAodHgpIHJldCArPSAndHJhbnNsYXRlWCgnK3YudHgrJ3B4KSAnO1xuICAgICAgICBpZiAodHkpIHJldCArPSAndHJhbnNsYXRlWSgnK3YudHkrJ3B4KSAnO1xuICAgICAgICBpZiAodHopIHJldCArPSAndHJhbnNsYXRlWignK3YudHorJ3B4KSAnO1xuICAgIH1cblxuICAgIGlmIChyeCAmJiByeSAmJiByeikgcmV0ICs9ICdyb3RhdGUzZCgnK3YucngrJ3JhZCwnK3YucnkrJ3JhZCwnK3YucnorJ3JhZCkgJztcbiAgICBlbHNlIGlmIChyeCAmJiByeSkgcmV0ICs9ICdyb3RhdGUoJyt2LnJ4KydyYWQsJyt2LnJ5KydyYWQpICc7XG4gICAgZWxzZSB7XG4gICAgICAgIGlmIChyeCkgcmV0ICs9ICdyb3RhdGVYKCcrdi5yeCsncmFkKSAnO1xuICAgICAgICBpZiAocnkpIHJldCArPSAncm90YXRlWSgnK3YucnkrJ3JhZCkgJztcbiAgICAgICAgaWYgKHJ6KSByZXQgKz0gJ3JvdGF0ZSgnK3YucnorJ3JhZCkgJztcbiAgICB9XG5cbiAgICBpZiAoc3ggJiYgc3kgJiYgc3opIHJldCArPSAnc2NhbGUzZCgnK3Yuc3grJywnK3Yuc3krJywnK3Yuc3orJykgJztcbiAgICBlbHNlIGlmIChzeCAmJiBzeSkgcmV0ICs9ICdzY2FsZSgnK3Yuc3grJywnK3Yuc3krJykgJztcbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKHN4KSByZXQgKz0gJ3NjYWxlWCgnK3Yuc3grJykgJztcbiAgICAgICAgaWYgKHN5KSByZXQgKz0gJ3NjYWxlWSgnK3Yuc3krJykgJztcbiAgICAgICAgaWYgKHN6KSByZXQgKz0gJ3NjYWxlWignK3Yuc3orJykgJztcbiAgICB9XG5cbiAgICBpZiAoc2tld1ggJiYgc2tld1kpIHJldCArPSAnc2tldygnK3Yuc2tld3grJ3JhZCwnK3Yuc2tld1krJ3JhZCkgJztcbiAgICBlbHNlIGlmIChza2V3WCkgcmV0ICs9ICdza2V3WCgnK3Yuc2tld1grJ3JhZCkgJztcbiAgICBlbHNlIGlmIChza2V3WSkgcmV0ICs9ICdza2V3WSgnK3Yuc2tld1krJ3JhZCkgJztcblxuICAgIGlmKHBlcnNwZWN0aXZlKSByZXQgKz0gJ3BlcnNwZWN0aXZlKCcrdi5wZXJzcGVjdGl2ZSsnKSAnO1xuY29uc29sZS5sb2cocmV0KVxuICAgIHJldHVybiByZXQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ3NzVHJhbnNmb3JtUGFyYW1ldGVyO1xuIiwidmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG52YXIgZGlhbG9nS2V5T3B0aW9ucyA9IHJlcXVpcmUoJy4vZGlhbG9nS2V5T3B0aW9ucycpO1xudmFyIGFtZ3VpID0gcmVxdWlyZSgnLi4vLi4vYW1ndWknKTtcblxuZnVuY3Rpb24gS2V5IChvcHQpIHtcblxuICAgIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuICAgIFxuICAgIHRoaXMuX3RpbWUgPSBvcHQudGltZSB8fCAwLFxuICAgIHRoaXMuX3ZhbHVlID0gb3B0LnZhbHVlIHx8ICcnLFxuICAgIHRoaXMuX2RlS2V5bGluZSA9IG9wdC5kZUtleWxpbmUsXG4gICAgdGhpcy5lYXNlID0gJ2xpbmVhcic7XG5cbiAgICB0aGlzLl9vbkNoYW5nZURlVGltZSA9IHRoaXMuX29uQ2hhbmdlRGVUaW1lLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25TZWxlY3REcm9wZG93biA9IHRoaXMuX29uU2VsZWN0RHJvcGRvd24uYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vbkNoYW5nZUVhc2UgPSB0aGlzLl9vbkNoYW5nZUVhc2UuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vbkNoYW5nZVRhcGUgPSB0aGlzLl9vbkNoYW5nZVRhcGUuYmluZCh0aGlzKTtcblxuICAgIHRoaXMuZG9tRWxlbSA9IHRoaXMuX2RlS2V5bGluZS5hZGRLZXkoe1xuICAgICAgICB0aW1lc2NhbGU6IGFtLnRpbWVsaW5lLnRpbWVzY2FsZSxcbiAgICAgICAgdGltZTogdGhpcy50aW1lXG4gICAgfSk7XG5cbiAgICB0aGlzLl9kZU1lbnUgPSBhbWd1aS5jcmVhdGVEcm9wZG93bih7XG4gICAgICAgIG9wdGlvbnM6IFsnZWFzZScsICdkZWxldGUnXVxuICAgIH0pO1xuICAgIHRoaXMuX2RlTWVudS5hZGRFdmVudExpc3RlbmVyKCdzZWxlY3QnLCB0aGlzLl9vblNlbGVjdERyb3Bkb3duKTtcblxuICAgIHRoaXMuZG9tRWxlbS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2VUaW1lJywgdGhpcy5fb25DaGFuZ2VEZVRpbWUpO1xuICAgIGFtLnRpbWVsaW5lLm9uKCdjaGFuZ2VUYXBlJywgdGhpcy5fb25DaGFuZ2VUYXBlKTtcblxuICAgIGFtZ3VpLmJpbmREcm9wZG93bih7XG4gICAgICAgIGRlVGFyZ2V0OiB0aGlzLmRvbUVsZW0sXG4gICAgICAgIGRlTWVudTogdGhpcy5fZGVNZW51LFxuICAgICAgICBhc0NvbnRleHRNZW51OiB0cnVlXG4gICAgfSk7XG59XG5cbmluaGVyaXRzKEtleSwgRXZlbnRFbWl0dGVyKTtcbnZhciBwID0gS2V5LnByb3RvdHlwZTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMocCwge1xuXG4gICAgdGltZToge1xuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2KSB7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLl90aW1lID09PSB2KSByZXR1cm47XG5cbiAgICAgICAgICAgIHRoaXMuX3RpbWUgPSB2O1xuXG4gICAgICAgICAgICB0aGlzLmRvbUVsZW0uc2V0VGltZSh0aGlzLl90aW1lKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl90aW1lO1xuICAgICAgICB9XG4gICAgfSxcbiAgICB2YWx1ZToge1xuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2KSB7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLl92YWx1ZSA9PT0gdikgcmV0dXJuO1xuXG4gICAgICAgICAgICB0aGlzLl92YWx1ZSA9IHY7XG4gICAgICAgIH0sXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG59KVxuXG5wLl9vbkNoYW5nZURlVGltZSA9IGZ1bmN0aW9uIChlKSB7XG5cbiAgICB0aGlzLnRpbWUgPSBlLmRldGFpbC50aW1lO1xuXG4gICAgdGhpcy5lbWl0KCdjaGFuZ2VUaW1lJyk7XG59O1xuXG5wLl9vblNlbGVjdERyb3Bkb3duID0gZnVuY3Rpb24gKGUpIHtcbiAgICBcbiAgICB2YXIgc2VsZWN0aW9uID0gZS5kZXRhaWwuc2VsZWN0aW9uO1xuXG4gICAgaWYgKHNlbGVjdGlvbiA9PT0gJ2Vhc2UnKSB7XG5cbiAgICAgICAgZGlhbG9nS2V5T3B0aW9ucy5zaG93KHtcbiAgICAgICAgICAgIGVhc2U6IHRoaXMuZWFzZSxcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBkaWFsb2dLZXlPcHRpb25zLm9uKCdjaGFuZ2VFYXNlJywgdGhpcy5fb25DaGFuZ2VFYXNlKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoc2VsZWN0aW9uID09PSAnZGVsZXRlJykge1xuXG4gICAgICAgIHRoaXMuZW1pdCgnZGVsZXRlJywgdGhpcyk7XG4gICAgfVxufTtcblxucC5fb25DaGFuZ2VFYXNlID0gZnVuY3Rpb24gKGVhc2UpIHtcblxuICAgIHRoaXMuZWFzZSA9IGVhc2U7XG59O1xuXG5wLl9vbkNoYW5nZVRhcGUgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICBkb21FbGVtLnNldFRpbWVzY2FsZShhbS50aW1lbGluZS50aW1lc2NhbGUpO1xufTtcblxucC5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdGhpcy5kb21FbGVtLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NoYW5nZVRpbWUnLCB0aGlzLl9vbkNoYW5nZURlVGltZSk7XG4gICAgdGhpcy5fZGVNZW51LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3NlbGVjdCcsIHRoaXMuX29uU2VsZWN0RHJvcGRvd24pO1xuICAgIGFtLnRpbWVsaW5lLnJlbW92ZUxpc3RlbmVyKCdjaGFuZ2VUYXBlJywgdGhpcy5fb25DaGFuZ2VUYXBlKTtcblxuICAgIGlmICh0aGlzLmRvbUVsZW0ucGFyZW50Tm9kZSkgdGhpcy5kb21FbGVtLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5kb21FbGVtKTsgXG4gICAgaWYgKHRoaXMuX2RlTWVudS5wYXJlbnROb2RlKSB0aGlzLl9kZU1lbnUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9kZU1lbnUpOyBcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gS2V5O1xuIiwidmFyIENzc1NlcXVlbmNlID0gcmVxdWlyZSgnLi9Dc3NTZXF1ZW5jZScpO1xudmFyIHFzZ2VuID0gcmVxdWlyZSgnLi4vLi4vcXNnZW4nKTtcblxudmFyIGFtLCBpY29uTmV3LCBxc01vZGFsLCBzZWxlY3RCb3g7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uIChfYW0pIHtcblxuICAgIGFtID0gX2FtO1xuXG4gICAgYW0ucmVnaXN0ZXJTZXF1ZW5jZVR5cGUoQ3NzU2VxdWVuY2UsIENzc1NlcXVlbmNlLnByb3RvdHlwZS50eXBlKTtcblxuICAgIGFtLm9uKCdzZWxlY3REb21FbGVtZW50Jywgb25TZWxlY3REb21FbGVtZW50KTtcblxuICAgIHNlbGVjdEJveCA9IGNyZWF0ZVNlbGVjdGlvbkJveCgpO1xufVxuXG5mdW5jdGlvbiBvblNlbGVjdERvbUVsZW1lbnQoZGUpIHtcblxuICAgIGlmICghQ3NzU2VxdWVuY2UuX2luc3RhbmNlcy5zb21lKHRlc3RTZXF1KSkge1xuXG4gICAgICAgIGljb25OZXcgPSBhbS50b29sYmFyLmFkZEljb24oaWNvbk5ldyA/IFxuICAgICAgICB7XG4gICAgICAgICAgICBkZUljb246IGljb25OZXdcbiAgICAgICAgfSA6IHtcblxuICAgICAgICAgICAgaWNvbjogJ3BsdXMtc3F1YXJlZCcsXG5cbiAgICAgICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgIGFtLnRvb2xiYXIucmVtb3ZlSWNvbihpY29uTmV3KTtcbiAgICAgICAgICAgICAgICBzZWxlY3RCb3guaGlkZSgpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHNlbGVjdG9yID0gcXNnZW4oYW0uc2VsZWN0ZWRFbGVtZW50KTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc2VsZWN0b3I6Jywgc2VsZWN0b3IpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHNlcXUgPSBuZXcgQ3NzU2VxdWVuY2Uoe1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcnM6IFtzZWxlY3Rvcl1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGFtLnRpbWVsaW5lLmFkZFNlcXVlbmNlKHNlcXUpO1xuXG4gICAgICAgICAgICAgICAgc2VxdS5zZWxlY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2VsZWN0Qm94LnNob3coZGUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRlc3RTZXF1KHNlcXUpIHtcbiAgICAgICAgICAgIFxuICAgICAgICBpZiAoc2VxdS5pc093bmVkRG9tRWxlbWVudChkZSkpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc2VxdS5zZWxlY3QoKTtcbiAgICAgICAgICAgIHNlbGVjdEJveC5oaWRlKCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlUXNNb2RhbCgpIHtcblxuICAgIHZhciBkZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRlLnN0eWxlLndpZHRoID0gJzM0MHB4JztcblxuICAgIHZhciBpbnAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgIGlucC50eXBlID0gJ3RleHQnO1xuICAgIGRlLmFwcGVuZENoaWxkKGlucCk7XG5cbiAgICByZXR1cm4gYW1ndWkuY3JlYXRlRGlhbG9nKHtcbiAgICAgICAgY29udGVudDogZGUsXG4gICAgICAgIHRpdGxlOiAnU2VsZWN0b3InLFxuICAgICAgICBidXR0b25zOiBbJ29rJ11cbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU2VsZWN0aW9uQm94KCkge1xuXG4gICAgdmFyIGRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGUuc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnO1xuICAgIGRlLnN0eWxlLmJveFNpemluZyA9ICdib3JkZXItYm94JztcbiAgICBkZS5zdHlsZS5ib3hTaGFkb3cgPSAnMHB4IDBweCAxcHggMHB4IHJnYmEoNTAsIDUwLCA1MCwgMC43NSknO1xuICAgIGRlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgZGUuc3R5bGUuYm9yZGVyID0gJzJweCBkYXNoZWQgI2VlZSc7XG4gICAgYW0uZGVIYW5kbGVyQ29udC5hcHBlbmRDaGlsZChkZSk7XG4gICAgXG4gICAgZGUuc2hvdyA9IGZ1bmN0aW9uIChkZVRhcmdldCkge1xuXG4gICAgICAgIHZhciBiciA9IGRlVGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBkZS5zdHlsZS5sZWZ0ID0gYnIubGVmdCArICdweCc7XG4gICAgICAgIGRlLnN0eWxlLnRvcCA9IGJyLnRvcCArICdweCc7XG4gICAgICAgIGRlLnN0eWxlLndpZHRoID0gYnIud2lkdGggKyAncHgnO1xuICAgICAgICBkZS5zdHlsZS5oZWlnaHQgPSBici5oZWlnaHQgKyAncHgnO1xuICAgICAgICBkZS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICB9XG5cbiAgICBkZS5oaWRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBcbiAgICAgICAgZGUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9XG5cbiAgICByZXR1cm4gZGU7XG59IiwidmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG52YXIgYW1ndWkgPSByZXF1aXJlKCcuLi8uLi9hbWd1aScpO1xuXG5mdW5jdGlvbiBEaWFsb2dLZXlPcHRpb25zICgpIHtcblxuICAgIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gICAgdGhpcy5fb25TZWxlY3RFYXNlID0gdGhpcy5fb25TZWxlY3RFYXNlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25DbGlja09rID0gdGhpcy5fb25DbGlja09rLmJpbmQodGhpcyk7IFxufVxuXG5pbmhlcml0cyhEaWFsb2dLZXlPcHRpb25zLCBFdmVudEVtaXR0ZXIpO1xudmFyIHAgPSBEaWFsb2dLZXlPcHRpb25zLnByb3RvdHlwZTtcblxucC5zaG93ID0gZnVuY3Rpb24gKG9wdCkge1xuXG4gICAgb3B0ID0gb3B0IHx8IHt9O1xuXG4gICAgdGhpcy5fY3JlYXRlRGlhbG9nKCk7XG5cbiAgICB0aGlzLl9idG5TZWxlY3RFYXNlLnNldENhcHRpb24ob3B0LmVhc2UpO1xuXG4gICAgdGhpcy5kb21FbGVtLnNob3dNb2RhbCgpO1xufTtcblxucC5oaWRlID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdGhpcy5kb21FbGVtLmNsb3NlKCk7XG5cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygnY2hhbmdlRWFzZScpO1xufTtcblxucC5fY3JlYXRlRGlhbG9nID0gZnVuY3Rpb24gKCkge1xuXG4gICAgaWYgKHRoaXMuX2lzRGlhbG9nQ3JlYXRlZCkgcmV0dXJuO1xuICAgIHRoaXMuX2lzRGlhbG9nQ3JlYXRlZCA9IHRydWU7XG5cbiAgICB0aGlzLl9jcmVhdGVDb250ZW50KCk7XG4gICAgXG4gICAgdGhpcy5kb21FbGVtID0gYW1ndWkuY3JlYXRlRGlhbG9nKHtcbiAgICAgICAgdGl0bGU6ICdLZXknLFxuICAgICAgICBjb250ZW50OiB0aGlzLl9kZUNvbnRlbnQsXG4gICAgICAgIHBhcmVudDogYW0uZGVEaWFsb2dDb250LFxuICAgICAgICBidXR0b25zOiBbJ29rJ10sXG4gICAgfSk7XG5cbiAgICB0aGlzLmRvbUVsZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2tfb2snLCB0aGlzLl9vbkNsaWNrT2spO1xufTtcblxucC5fY3JlYXRlQ29udGVudCA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHRoaXMuX2RlQ29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuX2RlQ29udGVudC5zdHlsZS53aWR0aCA9ICczMzBweCc7XG4gICAgdGhpcy5fZGVDb250ZW50LnN0eWxlLnBhZGRpbmcgPSAnMzBweCAxMnB4JztcbiAgICB0aGlzLl9kZUNvbnRlbnQuc3R5bGUuYmFja2dyb3VuZCA9IGFtZ3VpLmNvbG9yLmJnMDtcblxuICAgIHRoaXMuX2RlTGFiZWxFYXNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIHRoaXMuX2RlTGFiZWxFYXNlLnRleHRDb250ZW50ID0gJ2Vhc2U6ICc7XG4gICAgdGhpcy5fZGVMYWJlbEVhc2Uuc3R5bGUuY29sb3IgPSBhbWd1aS5jb2xvci50ZXh0O1xuICAgIHRoaXMuX2RlQ29udGVudC5hcHBlbmRDaGlsZCh0aGlzLl9kZUxhYmVsRWFzZSk7XG5cbiAgICB0aGlzLl9idG5TZWxlY3RFYXNlID0gYW1ndWkuY3JlYXRlQnRuKCdsaW5lYXInKTtcbiAgICB0aGlzLl9idG5TZWxlY3RFYXNlLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJztcbiAgICB0aGlzLl9kZUNvbnRlbnQuYXBwZW5kQ2hpbGQodGhpcy5fYnRuU2VsZWN0RWFzZSk7XG5cbiAgICBhbWd1aS5iaW5kRHJvcGRvd24oe1xuICAgICAgICBkZVRhcmdldDogdGhpcy5fYnRuU2VsZWN0RWFzZSxcbiAgICAgICAgZGVNZW51OiBhbWd1aS5jcmVhdGVEcm9wZG93bih7XG4gICAgICAgICAgICBvcHRpb25zOiBbJ2xpbmVhcicsICdlYXNlJywgJ2Vhc2UtaW4nLCAnZWFzZS1vdXQnLCAnZWFzZS1pbi1vdXQnLCAnYmVpemVyJ10sXG4gICAgICAgICAgICBvblNlbGVjdDogdGhpcy5fb25TZWxlY3RFYXNlXG4gICAgICAgIH0pXG4gICAgfSk7XG59O1xuXG5wLl9vbkNsaWNrT2sgPSBmdW5jdGlvbiAoZSkge1xuXG4gICAgdGhpcy5oaWRlKCk7XG59O1xuXG5wLl9vblNlbGVjdEVhc2UgPSBmdW5jdGlvbiAoZSkge1xuXG4gICAgdmFyIGVhc2UgPSBlLmRldGFpbC5zZWxlY3Rpb247XG4gICAgdGhpcy5fYnRuU2VsZWN0RWFzZS5zZXRDYXB0aW9uKGVhc2UpO1xuICAgIHRoaXMuZW1pdCgnY2hhbmdlRWFzZScsIGVhc2UpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgRGlhbG9nS2V5T3B0aW9ucygpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBcImZ1bmN0aW9uICgpIHtcXG5cXG4gICAgdmFyIHBsYXllcixcXG4gICAgICAgIGFuaW1hdGlvbixcXG4gICAgICAgIGlzSW5pdGVkID0gZmFsc2UsXFxuICAgICAgICBhbmltYXRpb25zID0gW10sXFxuICAgICAgICBrZXlzID0ge3t7a2V5c319fSxcXG4gICAgICAgIG9wdGlvbnMgPSB7e3tvcHRpb25zfX19LFxcbiAgICAgICAgZWxlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCd7e3tzZWxlY3RvcnN9fX0nKTtcXG5cXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtcy5sZW5ndGg7ICsraSkge1xcblxcbiAgICAgICAgYW5pbWF0aW9ucy5wdXNoKG5ldyBBbmltYXRpb24oZWxlbXNbaV0sIGtleXMsIG9wdGlvbnMpKTtcXG4gICAgfVxcblxcbiAgICBhbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uR3JvdXAoYW5pbWF0aW9ucyk7XFxuXFxuICAgIHJldHVybiB7XFxuXFxuICAgICAgICBwbGF5OiBmdW5jdGlvbiAoKSB7XFxuXFxuICAgICAgICAgICAgaWYgKCFpc0luaXRlZCkge1xcblxcbiAgICAgICAgICAgICAgICBwbGF5ZXIgPSBkb2N1bWVudC50aW1lbGluZS5wbGF5KGFuaW1hdGlvbik7XFxuICAgICAgICAgICAgICAgIGlzSW5pdGVkID0gdHJ1ZTtcXG4gICAgICAgICAgICB9XFxuICAgICAgICAgICAgZWxzZSB7XFxuICAgICAgICAgICAgICAgIHBsYXllci5wbGF5KCk7XFxuICAgICAgICAgICAgfVxcbiAgICAgICAgfSxcXG4gICAgICAgIHBhdXNlOiBmdW5jdGlvbiAoKSB7XFxuXFxuICAgICAgICAgICAgaWYgKCFwbGF5ZXIpIHtcXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xcbiAgICAgICAgICAgIH1cXG5cXG4gICAgICAgICAgICBwbGF5ZXIucGF1c2UoKTtcXG4gICAgICAgIH0sXFxuICAgICAgICBzZWVrOiBmdW5jdGlvbiAodGltZSkge1xcblxcbiAgICAgICAgICAgIGlmICghcGxheWVyKSB7XFxuICAgICAgICAgICAgICAgIHJldHVybjtcXG4gICAgICAgICAgICB9XFxuXFxuICAgICAgICAgICAgcGxheWVyLmN1cnJlbnRUaW1lID0gdGltZTtcXG4gICAgICAgIH1cXG4gICAgfTtcXG59XCI7XG4iLCJ2YXIgcnggPSAvXmNhbGNcXCgoLio/KVxcKSQvO1xuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB1bmNhbGMgKHZhbHVlKSB7XG5cbiAgICBpZiAodHlwZW9mKHZhbHVlKSA9PT0gJ3N0cmluZycgJiYgdmFsdWUuaW5kZXhPZignY2FsYygnKSAhPT0gLTEpIHtcblxuICAgICAgICB2YXIgbSA9IHJ4LmV4ZWModmFsdWUpO1xuICAgICAgICByZXR1cm4gbSA/ICcoICcgKyBtWzFdICsgJyApJyA6IHZhbHVlO1xuICAgIH1cbiAgICBlbHNlIHtcblxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxufSIsInZhciBFWEFUVFIgPSBbJ2lkJywgJ2NsYXNzJywgJ3N0eWxlJ107XG5cbmZ1bmN0aW9uIGdlbmVyYXRlKGRlLCByb290KSB7XG5cbiAgICByb290ID0gcm9vdCB8fCBkb2N1bWVudDtcblxuICAgIHZhciBkZUN1cnIgPSBkZSxcbiAgICAgICAgcm9vdEN1cnIgPSByb290LCBcbiAgICAgICAgcXNDdXJyLCBxc1BhcmVudCA9ICcnO1xuXG4gICAgd2hpbGUgKHRydWUpIHtcblxuICAgICAgICBkbyB7XG4gICAgICAgICAgICBxc0N1cnIgPSBnZW4oZGVDdXJyLCByb290Q3VycilcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSghcXNDdXJyICYmIFxuICAgICAgICAgICAgZGVDdXJyLnBhcmVudE5vZGUgIT09IHJvb3RDdXJyICYmXG4gICAgICAgICAgICAoZGVDdXJyID0gZGVDdXJyLnBhcmVudE5vZGUpKTtcblxuICAgICAgICBpZiAoIXFzQ3Vycikge1xuXG4gICAgICAgICAgICBpZiAoZGVDdXJyLnBhcmVudE5vZGUgPT09IHJvb3RDdXJyKSB7XG5cbiAgICAgICAgICAgICAgICBxc0N1cnIgPSAnPiAnICsgZGVDdXJyLnRhZ05hbWUgKyAnOm50aC1jaGlsZCgnICtcbiAgICAgICAgICAgICAgICAgICAgKEFycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwocm9vdEN1cnIuY2hpbGROb2RlcywgZGVDdXJyKSArIDEpICsgJyknO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuOyAvL2Nhbid0IGZpbmQgdW5pcXVlIHF1ZXJ5IHNlbGVjdG9yXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBxc1BhcmVudCArPSAocXNQYXJlbnQgPyAnICcgOiAnJykgKyBxc0N1cnI7XG5cbiAgICAgICAgaWYgKGRlQ3VyciA9PT0gZGUpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHFzUGFyZW50O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcXNDdXJyID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgcm9vdEN1cnIgPSBkZUN1cnI7XG4gICAgICAgICAgICBkZUN1cnIgPSBkZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2VuKGRlLCByb290KSB7XG5cblxuICAgIHZhciBzaW5nbGVzLCBzZWxlY3RvcnMsIG1hdGNoZXMgPSBbXTtcblxuICAgIHNpbmdsZXMgPSBzZWxlY3RvcnMgPSBbZGUudGFnTmFtZV0uY29uY2F0KFxuICAgICAgICBwb3NzaWJsZUlkcyhkZSksXG4gICAgICAgIHBvc3NpYmxlQ2xhc3NlcyhkZSwgaSksXG4gICAgICAgIHBvc3NpYmxlQXR0cmlidXRlcyhkZSwgaSlcbiAgICApO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1OyArK2kpIHtcblxuICAgICAgICBzZWxlY3RvcnMuZm9yRWFjaChmdW5jdGlvbiAoc2VsZWN0b3IpIHtcblxuICAgICAgICAgICAgaWYgKHJvb3QucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgbWF0Y2hlcy5wdXNoKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChtYXRjaGVzLmxlbmd0aCkge1xuXG4gICAgICAgICAgICByZXR1cm4gbWF0Y2hlc1swXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHNlbGVjdG9ycyA9IGNvbWJpbmUoc2VsZWN0b3JzLCBzaW5nbGVzKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcG9zc2libGVJZHMoZGUpIHtcblxuICAgIHJldHVybiBkZS5pZCA/IFsnIycgKyBDU1MuZXNjYXBlKGRlLmlkKV0gOiBbXTtcbn1cblxuZnVuY3Rpb24gcG9zc2libGVDbGFzc2VzKGRlLCBtYXgpIHtcblxuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChkZS5jbGFzc0xpc3QsIDApXG4gICAgICAgIC5tYXAoZnVuY3Rpb24gKGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuICcuJyArIENTUy5lc2NhcGUoY2xhc3NOYW1lKVxuICAgICAgICB9KTtcbn1cblxuZnVuY3Rpb24gcG9zc2libGVBdHRyaWJ1dGVzKGRlKSB7XG5cbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZGUuYXR0cmlidXRlcywgMClcbiAgICAgICAgLmZpbHRlcihmdW5jdGlvbihhdHRyKSB7XG4gICAgICAgICAgICByZXR1cm4gRVhBVFRSLmluZGV4T2YoYXR0ci5uYW1lKSA9PT0gLTE7XG4gICAgICAgIH0pXG4gICAgICAgIC5tYXAoZnVuY3Rpb24gKGF0dHIpIHtcbiAgICAgICAgICAgIHJldHVybiAnWycgKyBDU1MuZXNjYXBlKGF0dHIubmFtZSkgKyAoYXR0ci52YWx1ZSA/ICc9XCInICsgYXR0ci52YWx1ZSA6ICcnKSArICdcIl0nO1xuICAgICAgICB9KTtcbn1cblxuLy8gZnVuY3Rpb24gdmFyaWF0ZShfbGlzdCwgbGVuZ3RoKSB7XG5cbi8vICAgICByZXR1cm4gc3RlcChfbGlzdCwgMik7XG5cbi8vICAgICBmdW5jdGlvbiBzdGVwKGxpc3QsIGJhY2spIHtcblxuLy8gICAgICAgICB2YXIgY29tYmluZWQgPSBjb21iaW5lKGF0dHJpYnV0ZXMsIGxpc3QpO1xuLy8gICAgICAgICByZXR1cm4gbGlzdC5jb25jYXQoYmFjayA9PT0gMCA/IGNvbWJpbmVkIDogc3RlcChjb21iaW5lZCwgLS1iYWNrKSk7XG4vLyAgICAgfVxuLy8gfVxuXG5mdW5jdGlvbiBjb21iaW5lKHNvdXJjZUEsIHNvdXJjZUIpIHtcblxuICAgIHZhciBjb21iaW5lZCA9IFtdO1xuXG4gICAgc291cmNlQS5mb3JFYWNoKGZ1bmN0aW9uIChhKSB7XG4gICAgICAgIHNvdXJjZUIuZm9yRWFjaChmdW5jdGlvbiAoYikge1xuICAgICAgICAgICAgaWYgKGEuaW5kZXhPZihiKSA9PT0gLTEgJiYgYi5pbmRleE9mKGEpID09PSAtMSAmJlxuICAgICAgICAgICAgICAgICcjLls6Jy5pbmRleE9mKGIuY2hhckF0KDApKSAhPT0gLTEpIFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbWJpbmVkLnB1c2goYSArIGIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBjb21iaW5lZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZW5lcmF0ZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG52YXIgYW1ndWkgPSByZXF1aXJlKCcuLi9hbWd1aScpO1xudmFyIGRlY29yVGltZWJhck5hdmlnYXRvciA9IHJlcXVpcmUoJy4vZGVjb3JUaW1lYmFyTmF2aWdhdG9yJyk7XG5cbmZ1bmN0aW9uIFRpbWViYXIob3B0KSB7XG5cbiAgICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblxuICAgIG9wdCA9IG9wdCB8fCB7fTtcblxuICAgIHRoaXMuX3N0YXJ0ID0gb3B0LnN0YXJ0IHx8IDA7XG4gICAgdGhpcy5fd2lkdGggPSBvcHQud2lkdGggfHwgMDtcbiAgICB0aGlzLl9oZWlnaHQgPSBvcHQuaGVpZ2h0IHx8IDIxO1xuICAgIHRoaXMuX3RpbWVzY2FsZSA9IG9wdC50aW1lc2NhbGUgfHwgMDtcbiAgICB0aGlzLl9jdXJyVGltZSA9IG9wdC5jdXJyVGltZSB8fCAwO1xuICAgIHRoaXMuX21heFRpbWUgPSBvcHQubWF4VGltZSB8fCA2MDAwMDtcblxuICAgIHRoaXMuX21hZ25ldFBvaW50cyA9IFtdO1xuXG4gICAgdGhpcy5fb25NRG93biA9IG9uTURvd24uYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vbk1Nb3ZlID0gb25NTW92ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uTVVwID0gb25NVXAuYmluZCh0aGlzKTtcblxuICAgIHRoaXMuX3N0ZXBzID0gZ2V0U3RlcHMoKTtcblxuICAgIHRoaXMuX2NyZWF0ZUJhc2UoKTtcbiAgICB0aGlzLl9jcmVhdGVQb2ludGVyKCk7XG4gICAgdGhpcy5fcmVuZGVyVGFwZSgpO1xuXG4gICAgdGhpcy5fY2FudmFzVGFwZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9vbk1Eb3duKTtcblxuICAgIGRlY29yVGltZWJhck5hdmlnYXRvcih0aGlzKTtcbn1cblxuaW5oZXJpdHMoVGltZWJhciwgRXZlbnRFbWl0dGVyKTtcbnZhciBwID0gVGltZWJhci5wcm90b3R5cGU7XG5tb2R1bGUuZXhwb3J0cyA9IFRpbWViYXI7XG5cblxuXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHAsIHtcbiAgICBcbiAgICB0aW1lc2NhbGU6IHtcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3RpbWVzY2FsZSA9PT0gdikgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5fdGltZXNjYWxlID0gTWF0aC5taW4oMSwgTWF0aC5tYXgoMC4wMDAxLCB2KSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnPnNldHRzJywgdiwgdGhpcy50aW1lc2NhbGUpXG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJUYXBlKCk7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2NoYW5nZVRhcGUnKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdGltZXNjYWxlO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHN0YXJ0OiB7XG4gICAgICAgIHNldDogZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zdGFydCA9PT0gdikgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5fc3RhcnQgPSBNYXRoLm1pbigwLCB2KTtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlclRhcGUoKTtcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnY2hhbmdlVGFwZScpO1xuICAgICAgICB9LFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zdGFydDtcbiAgICAgICAgfVxuICAgIH0sIFxuXG4gICAgd2lkdGg6IHtcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3dpZHRoID09PSB2KSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLl93aWR0aCA9IHY7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJUYXBlKCk7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2NoYW5nZVRhcGUnKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fd2lkdGg7XG4gICAgICAgIH1cbiAgICB9LCBcbiAgICBcbiAgICBlbmQ6IHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc3RhcnQgKyAodGhpcy5fd2lkdGggLyB0aGlzLl90aW1lc2NhbGUpO1xuICAgICAgICB9XG4gICAgfSwgXG4gICAgXG4gICAgbGVuZ3RoOiB7XG4gICAgICAgIHNldDogZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgIHRoaXMudGltZXNjYWxlID0gdGhpcy5fd2lkdGggLyB2O1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3dpZHRoIC8gdGhpcy5fdGltZXNjYWxlO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBjdXJyVGltZToge1xuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh0aW1lKSB7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLl9jdXJyVGltZSA9PT0gdGltZSkgcmV0dXJuO1xuXG4gICAgICAgICAgICB0aGlzLl9jdXJyVGltZSA9IHRpbWU7XG5cbiAgICAgICAgICAgIHZhciBwb3MgPSAodGltZSAvIHRoaXMubGVuZ3RoKSAqIHRoaXMud2lkdGg7XG5cbiAgICAgICAgICAgIHRoaXMuX2RlUG9pbnRlci5zdHlsZS5sZWZ0ID0gcG9zICsgJ3B4JztcblxuICAgICAgICAgICAgdGhpcy5lbWl0KCdjaGFuZ2VUaW1lJywgdGhpcy5fY3VyclRpbWUpO1xuICAgICAgICB9LFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jdXJyVGltZTtcbiAgICAgICAgfVxuICAgIH0sIFxuICAgIFxuICAgIG1hZ25ldFBvaW50czoge1xuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWFnbmV0UG9pbnRzID0gdjtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWFnbmV0UG9pbnRzXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgbWF4VGltZToge1xuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fbWF4VGltZSA9PT0gdikgcmV0dXJuO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21heFRpbWUgPSB2O1xuICAgICAgICAgICAgdGhpcy5lbWl0KCdjaGFuZ2VUYXBlJyk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21heFRpbWVcbiAgICAgICAgfVxuICAgIH0sXG59KTtcblxuXG5cblxucC5fcmVuZGVyVGFwZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBzdGFydCA9IHRoaXMuX3N0YXJ0LFxuICAgICAgICBlbmQgPSB0aGlzLmVuZCxcbiAgICAgICAgbGVuZ3RoID0gdGhpcy5sZW5ndGgsXG4gICAgICAgIGhlaWdodCA9IHRoaXMuX2hlaWdodCxcbiAgICAgICAgc2NhbGUgPSB0aGlzLnRpbWVzY2FsZSwgXG4gICAgICAgIHdpZHRoID0gdGhpcy5fd2lkdGgsXG4gICAgICAgIG1heE1hcmtlcnMgPSB3aWR0aCAvIDQsXG4gICAgICAgIHN0ZXAsIGksIHRleHQsIHRleHRXLFxuICAgICAgICBjdHggPSB0aGlzLl9jdHhUYXBlO1xuXG4gICAgdGhpcy5fY2FudmFzVGFwZS53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuX2NhbnZhc1RhcGUuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgdGhpcy5fc3RlcHMuZm9yRWFjaChmdW5jdGlvbiAocykge1xuXG4gICAgICAgIGlmICgodGhpcy5sZW5ndGggLyBzLnNtYWxsKSA8IG1heE1hcmtlcnMgJiYgKCFzdGVwIHx8IHN0ZXAuc21hbGwgPiBzLnNtYWxsKSkge1xuXG4gICAgICAgICAgICBzdGVwID0gcztcbiAgICAgICAgfVxuICAgIH0sIHRoaXMpO1xuXG4gICAgaWYgKHN0ZXApIHtcblxuICAgICAgICBjdHgubGlud2VpZHRoID0gMC41O1xuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBhbWd1aS5jb2xvci5iZzM7XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBhbWd1aS5jb2xvci5iZzM7XG4gICAgICAgIGN0eC5mb250ID0gfn4odGhpcy5faGVpZ2h0ICogMC41KSArICdweCBcIk9wZW4gU2Fuc1wiJ1xuXG4gICAgICAgIGZvciAoaSA9IHN0YXJ0ICUgc3RlcC5zbWFsbDsgaSA8IGxlbmd0aDsgaSArPSBzdGVwLnNtYWxsKSB7XG5cbiAgICAgICAgICAgIGN0eC5tb3ZlVG8ofn4oaSAqIHNjYWxlKSArIDAuNSwgaGVpZ2h0KTtcbiAgICAgICAgICAgIGN0eC5saW5lVG8ofn4oaSAqIHNjYWxlKSArIDAuNSwgaGVpZ2h0ICogMC43NSk7XG4gICAgICAgIH1cbiAgICAgICAgY3R4LnN0cm9rZSgpO1xuXG4gICAgICAgIGZvciAoaSA9IHN0YXJ0ICUgc3RlcC5iaWc7IGkgPCBsZW5ndGg7IGkgKz0gc3RlcC5iaWcpIHtcblxuICAgICAgICAgICAgY3R4Lm1vdmVUbyh+fihpICogc2NhbGUpICsgMC41LCBoZWlnaHQpO1xuICAgICAgICAgICAgY3R4LmxpbmVUbyh+fihpICogc2NhbGUpICsgMC41LCBoZWlnaHQgKiAwLjYyKTtcbiAgICAgICAgfVxuICAgICAgICBjdHguc3Ryb2tlKCk7XG5cbiAgICAgICAgZm9yIChpID0gc3RhcnQgJSBzdGVwLnRpbWU7IGkgPCBsZW5ndGg7IGkgKz0gc3RlcC50aW1lKSB7XG5cbiAgICAgICAgICAgIHRleHQgPSBzdGVwLmZvcm1hdChpIC0gc3RhcnQpO1xuICAgICAgICAgICAgdGV4dFcgPSBjdHgubWVhc3VyZVRleHQodGV4dCkud2lkdGggLyAyO1xuICAgICAgICAgICAgY3R4LmZpbGxUZXh0KHRleHQsIGkgKiBzY2FsZSAtIHRleHRXLCAxMik7XG4gICAgICAgIH1cbiAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgIH1cbn07XG5cbmZ1bmN0aW9uIG9uTURvd24oZSkge1xuXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBpZiAoZS5zaGlmdEtleSkgdGhpcy5fZHJhZ01vZGUgPSAndHJhbnNsYXRlJztcbiAgICBlbHNlIGlmIChlLmN0cmxLZXkpIHRoaXMuX2RyYWdNb2RlID0gJ3NjYWxlJztcbiAgICBlbHNlIHRoaXMuX2RyYWdNb2RlID0gJ3NlZWsnO1xuXG4gICAgdGhpcy5fbWRYID0gZS5wYWdlWDtcbiAgICB0aGlzLl9tZFN0YXJ0ID0gdGhpcy5fc3RhcnQ7XG4gICAgdGhpcy5fbWRUaW1lc2NhbGUgPSB0aGlzLl90aW1lc2NhbGU7XG5cbiAgICB0aGlzLl9vbk1Nb3ZlKGUpO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX29uTU1vdmUpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fb25NVXApO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgdGhpcy5fb25NVXApO1xufVxuXG5mdW5jdGlvbiBvbk1Nb3ZlKGUpIHtcblxuICAgIHZhciBsZWZ0ID0gdGhpcy5fY2FudmFzVGFwZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0LFxuICAgICAgICBtb3VzZVggPSBNYXRoLm1heCgwLCBNYXRoLm1pbih0aGlzLndpZHRoLCBlLnBhZ2VYIC0gbGVmdCkpLFxuICAgICAgICBtb3ZlID0gZS5wYWdlWCAtIHRoaXMuX21kWCxcbiAgICAgICAgdGltZSwgbWFnbmV0UG9pbnQsIG1hZ25ldFBvaW50RGlmZjtcblxuICAgIGlmICh0aGlzLl9kcmFnTW9kZSA9PT0gJ3NlZWsnKSB7XG5cbiAgICAgICAgdGltZSA9IChtb3VzZVggLyB0aGlzLndpZHRoKSAqIHRoaXMubGVuZ3RoO1xuXG4gICAgICAgIHRoaXMuX21hZ25ldFBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uIChtcCkge1xuXG4gICAgICAgICAgICB2YXIgZGlmZiA9IE1hdGguYWJzKG1wIC0gdGltZSk7XG5cbiAgICAgICAgICAgIGlmIChkaWZmIDwgbWFnbmV0UG9pbnREaWZmIHx8IG1hZ25ldFBvaW50RGlmZiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbWFnbmV0UG9pbnQgPSBtcDtcbiAgICAgICAgICAgICAgICBtYWduZXRQb2ludERpZmYgPSBkaWZmO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGlmICgobWFnbmV0UG9pbnREaWZmICogdGhpcy5fdGltZXNjYWxlKSA8IDIpIHtcblxuICAgICAgICAgICAgdGltZSA9IG1hZ25ldFBvaW50O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jdXJyVGltZSA9IHRoaXMuX3N0YXJ0ICsgdGltZTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5fZHJhZ01vZGUgPT09ICd0cmFuc2xhdGUnKSB7XG5cbiAgICAgICAgdGhpcy5zdGFydCA9IHRoaXMuX21kU3RhcnQgKyAobW92ZSAvIHRoaXMudGltZXNjYWxlKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5fZHJhZ01vZGUgPT09ICdzY2FsZScpIHtcblxuICAgICAgICB0aGlzLnRpbWVzY2FsZSA9IHRoaXMuX21kVGltZXNjYWxlICsgKG1vdmUvMTAwMCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBvbk1VcCgpIHtcblxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1Nb3ZlKTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX29uTVVwKTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHRoaXMuX29uTVVwKTtcbn1cblxuXG5wLl9jcmVhdGVCYXNlID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdGhpcy5kb21FbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5kb21FbGVtLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGFtZ3VpLmNvbG9yLmJnMDtcbiAgICB0aGlzLmRvbUVsZW0uc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnO1xuXG4gICAgdGhpcy5fY2FudmFzVGFwZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIHRoaXMuX2N0eFRhcGUgPSB0aGlzLl9jYW52YXNUYXBlLmdldENvbnRleHQoJzJkJyk7XG4gICAgdGhpcy5fY2FudmFzVGFwZS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICB0aGlzLmRvbUVsZW0uYXBwZW5kQ2hpbGQodGhpcy5fY2FudmFzVGFwZSk7IFxufTtcblxucC5fY3JlYXRlUG9pbnRlciA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciByYWRpdXMgPSA1LjU7XG4gICAgdGhpcy5fZGVQb2ludGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5fZGVQb2ludGVyLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICB0aGlzLl9kZVBvaW50ZXIuc3R5bGUuYm90dG9tID0gMipyYWRpdXMgKyAncHgnO1xuICAgIHZhciBwb2ludGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgcG9pbnRlci5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgcG9pbnRlci5zdHlsZS5ib3hTaXppbmcgPSAnYm9yZGVyLWJveCc7XG4gICAgcG9pbnRlci5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xuICAgIHBvaW50ZXIuc3R5bGUubGVmdCA9IC1yYWRpdXMgKyAncHgnO1xuICAgIHBvaW50ZXIuc3R5bGUud2lkdGggPSAyKnJhZGl1cyArICdweCc7XG4gICAgcG9pbnRlci5zdHlsZS5oZWlnaHQgPSAyKnJhZGl1cyArICdweCc7XG4gICAgcG9pbnRlci5zdHlsZS5ib3JkZXIgPSAnc29saWQgcmVkIDFweCc7XG4gICAgcG9pbnRlci5zdHlsZS5ib3JkZXJSYWRpdXMgPSByYWRpdXMgKyAncHgnO1xuICAgIHRoaXMuX2RlUG9pbnRlci5hcHBlbmRDaGlsZChwb2ludGVyKTsgXG4gICAgdGhpcy5kb21FbGVtLmFwcGVuZENoaWxkKHRoaXMuX2RlUG9pbnRlcik7IFxufTtcblxuXG5cblxuXG5cblxuXG4vL1N0ZXBzXG5mdW5jdGlvbiBnZXRTdGVwcygpIHtcblxuICAgIHJldHVybiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIHNtYWxsOiA1LCBcbiAgICAgICAgICAgIGJpZzogNTAsIFxuICAgICAgICAgICAgdGltZTogNTAsIFxuICAgICAgICAgICAgZm9ybWF0OiBmdW5jdGlvbiAobXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2VjID0gcGFyc2VJbnQobXMvMTAwMCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gKHNlYyA/IHNlYysnOicrZm91cihtcykgOiBtcykgKyAnbXMnO1xuICAgICAgICAgICAgfSBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgc21hbGw6IDEwLCBcbiAgICAgICAgICAgIGJpZzogMTAwLCBcbiAgICAgICAgICAgIHRpbWU6IDEwMCwgXG4gICAgICAgICAgICBmb3JtYXQ6IGZ1bmN0aW9uIChtcykge1xuICAgICAgICAgICAgICAgIHZhciBzZWMgPSBwYXJzZUludChtcy8xMDAwKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiAoc2VjID8gc2VjKyc6Jytmb3VyKG1zKSA6IG1zKSArICdtcyc7XG4gICAgICAgICAgICB9IFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBzbWFsbDogMTAwLCBcbiAgICAgICAgICAgIGJpZzogMTAwMCwgXG4gICAgICAgICAgICB0aW1lOiAxMDAwLCBcbiAgICAgICAgICAgIGZvcm1hdDogZnVuY3Rpb24gKG1zKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1pbiA9IHBhcnNlSW50KG1zLzYwMDAwKTtcbiAgICAgICAgICAgICAgICB2YXIgc2VjID0gcGFyc2VJbnQobXMvMTAwMCkgJSA2MDtcblxuICAgICAgICAgICAgICAgIHJldHVybiAobWluID8gbWluKyc6Jyt0d28oc2VjKSA6IHNlYykgKyAncyc7XG4gICAgICAgICAgICB9IFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBzbWFsbDogNTAwLCBcbiAgICAgICAgICAgIGJpZzogNTAwMCwgXG4gICAgICAgICAgICB0aW1lOiA1MDAwLCBcbiAgICAgICAgICAgIGZvcm1hdDogZnVuY3Rpb24gKG1zKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1pbiA9IHBhcnNlSW50KG1zLzYwMDAwKTtcbiAgICAgICAgICAgICAgICB2YXIgc2VjID0gcGFyc2VJbnQobXMvMTAwMCkgJSA2MDtcblxuICAgICAgICAgICAgICAgIHJldHVybiAobWluID8gbWluKyc6Jyt0d28oc2VjKSA6IHNlYykgKyAncyc7XG4gICAgICAgICAgICB9IFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBzbWFsbDogMTAwMDAsIFxuICAgICAgICAgICAgYmlnOiA2MDAwMCwgXG4gICAgICAgICAgICB0aW1lOiA2MDAwMCwgXG4gICAgICAgICAgICBmb3JtYXQ6IGZ1bmN0aW9uIChtcykge1xuICAgICAgICAgICAgICAgIHZhciBtaW4gPSBwYXJzZUludChtcy82MDAwMCkgJSA2MDtcbiAgICAgICAgICAgICAgICB2YXIgaG91ciA9IHBhcnNlSW50KG1zLzM2MDAwMDApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIChob3VyID8gaG91cisnOicrdHdvKG1pbikgOiBtaW4pICsgJ20nO1xuICAgICAgICAgICAgfSBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgc21hbGw6IDYwMDAwLCBcbiAgICAgICAgICAgIGJpZzogNSo2MDAwMCwgXG4gICAgICAgICAgICB0aW1lOiA1KjYwMDAwLCBcbiAgICAgICAgICAgIGZvcm1hdDogZnVuY3Rpb24gKG1zKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1pbiA9IHBhcnNlSW50KG1zLzYwMDAwKSAlIDYwO1xuICAgICAgICAgICAgICAgIHZhciBob3VyID0gcGFyc2VJbnQobXMvMzYwMDAwMCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gKGhvdXIgPyBob3VyKyc6Jyt0d28obWluKSA6IG1pbikgKyAnbSc7XG4gICAgICAgICAgICB9IFxuICAgICAgICB9XG4gICAgXTtcblxuICAgIGZ1bmN0aW9uIHR3byhudW0pIHtcblxuICAgICAgICByZXR1cm4gKCcwMCcgKyBudW0pLnN1YnN0cigtMik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZm91cihudW0pIHtcblxuICAgICAgICByZXR1cm4gKCcwMDAwJyArIG51bSkuc3Vic3RyKC00KTtcbiAgICB9XG59XG4iLCJ2YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcbnZhciBUaW1lYmFyID0gcmVxdWlyZSgnLi9UaW1lYmFyJyk7XG52YXIgYW1ndWkgPSByZXF1aXJlKCcuLi9hbWd1aScpO1xudmFyIG1zdFNhdmVTY3JpcHQgPSByZXF1aXJlKCcuL3NjcmlwdC5zYXZlLm1zdCcpO1xuXG5mdW5jdGlvbiBUaW1lbGluZShhbSkge1xuXG4gICAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG4gICAgdGhpcy5zZXRNYXhMaXN0ZW5lcnMoMTEwMCk7XG5cbiAgICB0aGlzLl9oZWFkZXJIID0gMjM7XG4gICAgXG4gICAgdGhpcy5fY3JlYXRlQmFzZSgpO1xuICAgIHRoaXMuX2NyZWF0ZVNldHRpbmdzSGVhZCgpO1xuICAgIHRoaXMuX2NyZWF0ZVRpbWVsaW5lKCk7XG4gICAgdGhpcy5fY3JlYXRlUG9pbnRlckxpbmUoKTtcblxuICAgIHRoaXMuX2N1cnJTZXF1ZW5jZTtcbiAgICBcbiAgICB0aGlzLl90aW1lYmFyID0gbmV3IFRpbWViYXIoe1xuICAgICAgICBoZWlnaHQ6IHRoaXMuX2hlYWRlckgsXG4gICAgICAgIHdpZHRoOiB0aGlzLl9kZVJpZ2h0Lm9mZnNldFdpZHRoIHx8IDEwMDAsXG4gICAgICAgIHRpbWVzY2FsZTogMC4wNVxuICAgIH0pO1xuICAgIHRoaXMuX2RlUmlnaHQuaW5zZXJ0QmVmb3JlKHRoaXMuX3RpbWViYXIuZG9tRWxlbSwgdGhpcy5fZGVLZXlsaW5lQ29udCk7XG5cbiAgICB0aGlzLl9yZWZyZXNoVGltZWJhcldpZHRoKCk7XG5cbiAgICB0aGlzLl9zZXF1ZW5jZXMgPSBbXTtcblxuICAgIHRoaXMuX2Ryb3Bkb3duTmV3U2VxdS5hZGRFdmVudExpc3RlbmVyKCdzZWxlY3QnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBcbiAgICAgICAgLy8gdGhpcy5hZGRTZXF1ZW5jZShhbS5zZXF1ZW5jZVR5cGVzWzBdLmNyZWF0ZSgpKTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5fb25TZWxlY3RTZXF1ZW5jZSA9IHRoaXMuX29uU2VsZWN0U2VxdWVuY2UuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vbkNoYW5nZVNlcXVlbmNlID0gdGhpcy5fb25DaGFuZ2VTZXF1ZW5jZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uQ2hhbmdlVGltZSA9IHRoaXMuX29uQ2hhbmdlVGltZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uQ2hhbmdlVGFwZSA9IHRoaXMuX29uQ2hhbmdlVGFwZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uV2luZG93UmVzaXplID0gdGhpcy5fb25XaW5kb3dSZXNpemUuYmluZCh0aGlzKTtcblxuICAgIHRoaXMuX3RpbWViYXIub24oJ2NoYW5nZVRpbWUnLCB0aGlzLmVtaXQuYmluZCh0aGlzLCAnY2hhbmdlVGltZScpKTtcbiAgICB0aGlzLl90aW1lYmFyLm9uKCdjaGFuZ2VUYXBlJywgdGhpcy5lbWl0LmJpbmQodGhpcywgJ2NoYW5nZVRhcGUnKSk7XG4gICAgdGhpcy5fdGltZWJhci5vbignY2hhbmdlVGltZScsIHRoaXMuX29uQ2hhbmdlVGltZSk7XG4gICAgdGhpcy5fdGltZWJhci5vbignY2hhbmdlVGFwZScsIHRoaXMuX29uQ2hhbmdlVGFwZSk7XG5cbiAgICBhbWd1aS5jYWxsT25BZGRlZCh0aGlzLmRvbUVsZW0sIHRoaXMuX3JlZnJlc2hUaW1lYmFyV2lkdGgsIHRoaXMpO1xuICAgIFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl9vbldpbmRvd1Jlc2l6ZSk7XG59XG5cbmluaGVyaXRzKFRpbWVsaW5lLCBFdmVudEVtaXR0ZXIpO1xudmFyIHAgPSBUaW1lbGluZS5wcm90b3R5cGU7XG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVsaW5lO1xuXG5wLmFkZFNlcXVlbmNlID0gZnVuY3Rpb24gKHNlcXUpIHtcblxuICAgIHZhciBkZUNvbnRPcHQgPSBjcmVhdGVDb250KHNlcXUuZGVPcHRpb25zLCB0aGlzLl9kZUxlZnQpLFxuICAgICAgICBkZUNvbnRLZiA9IGNyZWF0ZUNvbnQoc2VxdS5kZUtleXMsIHRoaXMuX2RlS2V5bGluZUNvbnQpO1xuXG4gICAgdGhpcy5fc2VxdWVuY2VzLnB1c2goc2VxdSk7XG5cbiAgICBzZXF1Lm9uKCdzZWxlY3QnLCB0aGlzLl9vblNlbGVjdFNlcXVlbmNlKTtcbiAgICBzZXF1Lm9uKCdjaGFuZ2UnLCB0aGlzLl9vbkNoYW5nZVNlcXVlbmNlKTtcblxuICAgIHNlcXUub24oJ2NoYW5nZUhlaWdodCcsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICBkZUNvbnRPcHQuc3R5bGUuaGVpZ2h0ID0gc2VxdS5oZWlnaHQoKSArICdweCc7XG4gICAgICAgIGRlQ29udEtmLnN0eWxlLmhlaWdodCA9IHNlcXUuaGVpZ2h0KCkgKyAncHgnO1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gY3JlYXRlQ29udChjb250ZW50LCBwYXJlbnQpIHtcblxuICAgICAgICB2YXIgZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGUuc3R5bGUud2lkdGggPSAnMTAwJSc7XG4gICAgICAgIGRlLnN0eWxlLmhlaWdodCA9IHNlcXUuaGVpZ2h0KCkgKyAncHgnO1xuICAgICAgICBkZS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuICAgICAgICBkZS5zdHlsZS50cmFuc2Zvcm0gPSAnaGVpZ2h0IDAuMTIgZWFzZU91dCc7XG4gICAgICAgIGRlLmFwcGVuZENoaWxkKGNvbnRlbnQpO1xuICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoZGUpO1xuXG4gICAgICAgIHJldHVybiBkZTtcbiAgICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShwLCAnY3VyclRpbWUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90aW1lYmFyLl9jdXJyVGltZVxuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkocCwgJ3RpbWVzY2FsZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RpbWViYXIudGltZXNjYWxlXG4gICAgfVxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShwLCAnbGVuZ3RoJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdGltZWJhci5fZW5kIC0gdGhpcy5fdGltZWJhci5fc3RhcnQ7XG4gICAgfVxufSk7XG5cbnAuX29uU2VsZWN0U2VxdWVuY2UgPSBmdW5jdGlvbihzZXF1KSB7XG5cbiAgICBpZiAodGhpcy5fY3VyclNlcXVlbmNlID09PSBzZXF1KSBcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgaWYgKHRoaXMuX2N1cnJTZXF1ZW5jZSkge1xuICAgICAgICBcbiAgICAgICAgdGhpcy5fY3VyclNlcXVlbmNlLmRlc2VsZWN0KCk7IFxuICAgIH1cblxuICAgIHRoaXMuX2N1cnJTZXF1ZW5jZSA9IHNlcXU7XG59O1xuXG5wLl9vbkNoYW5nZVNlcXVlbmNlID0gZnVuY3Rpb24oc2VxdSkge1xuXG4gICAgdGhpcy5fcmVmcmVzaE1hZ25ldFBvaW50cygpO1xufTtcblxucC5fb25DaGFuZ2VUaW1lID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGxlZnQgPSB0aGlzLmN1cnJUaW1lICogdGhpcy50aW1lc2NhbGU7XG4gICAgdGhpcy5fZGVQb2ludGVyTGluZS5zdHlsZS5sZWZ0ID0gbGVmdCArICdweCc7XG59O1xuXG5wLl9vbkNoYW5nZVRhcGUgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB0aGlzLl9kZUtleWxpbmVDb250LnN0eWxlLmxlZnQgPSAodGhpcy5fdGltZWJhci5zdGFydCAqIHRoaXMudGltZXNjYWxlKSArICdweCc7XG59O1xuXG5wLl9vbldpbmRvd1Jlc2l6ZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHRoaXMuX3JlZnJlc2hUaW1lYmFyV2lkdGgoKTtcbn07XG5cbnAuX3JlZnJlc2hNYWduZXRQb2ludHMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgbWFnbmV0UG9pbnRzID0gW107XG5cbiAgICB0aGlzLl9zZXF1ZW5jZXMuZm9yRWFjaChmdW5jdGlvbiAoc2VxdSkge1xuXG4gICAgICAgIGlmICh0eXBlb2Ygc2VxdS5nZXRNYWduZXRQb2ludHMgPT09ICdmdW5jdGlvbicpIHtcblxuICAgICAgICAgICAgbWFnbmV0UG9pbnRzID0gbWFnbmV0UG9pbnRzLmNvbmNhdChzZXF1LmdldE1hZ25ldFBvaW50cygpKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgbWFnbmV0UG9pbnRzID0gXy51bmlxKG1hZ25ldFBvaW50cyk7XG5cbiAgICB0aGlzLl90aW1lYmFyLm1hZ25ldFBvaW50cyA9IG1hZ25ldFBvaW50cztcbn07XG5cbnAuX3JlZnJlc2hUaW1lYmFyV2lkdGggPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB0aGlzLl90aW1lYmFyLndpZHRoID0gdGhpcy5fZGVSaWdodC5vZmZzZXRXaWR0aDtcbn07XG5cblxuXG5wLmdldFNjcmlwdCA9IGZ1bmN0aW9uIChvcHQpIHtcblxuICAgIG9wdCA9IG9wdCB8fCB7fTtcblxuICAgIHZhciBzY3JpcHQsIHBsYXllclNjcmlwdHMgPSBbXTtcblxuICAgIHRoaXMuX3NlcXVlbmNlcy5mb3JFYWNoKGZ1bmN0aW9uIChzZXF1KSB7XG5cbiAgICAgICAgcGxheWVyU2NyaXB0cy5wdXNoKHNlcXUuZ2V0U2NyaXB0KCkpO1xuICAgIH0pO1xuXG4gICAgc2NyaXB0ID0gTXVzdGFjaGUucmVuZGVyKG1zdFNhdmVTY3JpcHQsIHtcbiAgICAgICAgbmFtZTogJ2FuaW0xJyxcbiAgICAgICAgc2F2ZURhdGE6IG9wdC5zYXZlICYmIHRoaXMuZ2V0U2F2ZSgpLFxuICAgICAgICBzZXF1UGxheWVyR2VuczogcGxheWVyU2NyaXB0cy5qb2luKCcsXFxuJyksXG4gICAgICAgIGF1dG9QbGF5OiBvcHQuYXV0b1BsYXlcbiAgICB9KTtcblxuICAgIGNvbnNvbGUubG9nKHNjcmlwdCk7XG5cbiAgICByZXR1cm4gc2NyaXB0O1xufVxuXG5wLmdldFNhdmUgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgc2F2ZSA9IHtcbiAgICAgICAgY3VyclRpbWU6IHRoaXMuY3VyclRpbWUsXG4gICAgICAgIHRpbWVzY2FsZTogdGhpcy50aW1lc2NhbGUsXG4gICAgICAgIHNlcXVlbmNlczogW11cbiAgICB9O1xuXG4gICAgdGhpcy5fc2VxdWVuY2VzLmZvckVhY2goZnVuY3Rpb24gKHNlcXUpIHtcblxuICAgICAgICBzYXZlLnNlcXVlbmNlcy5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6IHNlcXUudHlwZSxcbiAgICAgICAgICAgIGRhdGE6IHNlcXUuZ2V0U2F2ZSgpXG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoc2F2ZSkpO1xuXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHNhdmUpO1xufTtcblxucC51c2VTYXZlID0gZnVuY3Rpb24gKHNhdmUpIHtcblxuICAgIHRoaXMuY3VyclRpbWUgPSBzYXZlLmN1cnJUaW1lO1xuICAgIHRoaXMudGltZXNjYWxlID0gc2F2ZS50aW1lc2NhbGU7XG5cbiAgICBzYXZlLnNlcXVlbmNlcy5mb3JFYWNoKGZ1bmN0aW9uIChzZXF1RGF0YSkge1xuXG4gICAgICAgIHZhciBzZXF1ID0gbmV3IGFtLnNlcXVlbmNlVHlwZXNbc2VxdURhdGEudHlwZV0oKTtcbiAgICAgICAgc2VxdS51c2VTYXZlKHNlcXVEYXRhLmRhdGEpXG4gICAgICAgIHRoaXMuYWRkU2VxdWVuY2Uoc2VxdSk7XG4gICAgfSwgdGhpcyk7XG59O1xuXG5wLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgIC8vVE9ET1xufVxuXG5cblxuXG5cblxuXG5wLl9jcmVhdGVCYXNlID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdGhpcy5kb21FbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5kb21FbGVtLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGFtZ3VpLmNvbG9yLmJnMDsgXG4gICAgdGhpcy5kb21FbGVtLnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7IFxuICAgIHRoaXMuZG9tRWxlbS5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ2F1dG8nOyBcblxuICAgIHRoaXMuX2RlTGVmdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuX2RlTGVmdC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBhbWd1aS5jb2xvci5iZzA7XG4gICAgdGhpcy5fZGVMZWZ0LnN0eWxlLndpZHRoID0gJzIzMHB4JztcbiAgICB0aGlzLl9kZUxlZnQuc3R5bGUuaGVpZ2h0ID0gJzEwMCUnO1xuICAgIHRoaXMuZG9tRWxlbS5hcHBlbmRDaGlsZCh0aGlzLl9kZUxlZnQpO1xuXG4gICAgdGhpcy5fZGVEaXZpZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5fZGVEaXZpZGVyLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGFtZ3VpLmNvbG9yLmJnMztcbiAgICB0aGlzLl9kZURpdmlkZXIuc3R5bGUud2lkdGggPSAnMXB4JztcbiAgICB0aGlzLl9kZURpdmlkZXIuc3R5bGUuaGVpZ2h0ID0gJzEwMCUnO1xuICAgIHRoaXMuZG9tRWxlbS5hcHBlbmRDaGlsZCh0aGlzLl9kZURpdmlkZXIpO1xuXG4gICAgdGhpcy5fZGVSaWdodCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuX2RlUmlnaHQuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnO1xuICAgIHRoaXMuX2RlUmlnaHQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gYW1ndWkuY29sb3IuYmcwO1xuICAgIHRoaXMuX2RlUmlnaHQuc3R5bGUuZmxleCA9ICcxJztcbiAgICB0aGlzLl9kZVJpZ2h0LnN0eWxlLmhlaWdodCA9ICcxMDAlJztcbiAgICB0aGlzLmRvbUVsZW0uYXBwZW5kQ2hpbGQodGhpcy5fZGVSaWdodCk7XG5cbiAgICB0aGlzLl9kZUtleWxpbmVDb250ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5fZGVLZXlsaW5lQ29udC5zdHlsZS5wb3NpdGlvbiA9ICdyZWxhdGl2ZSc7XG4gICAgdGhpcy5fZGVLZXlsaW5lQ29udC5zdHlsZS5oZWlnaHQgPSAnMTAwJSc7XG4gICAgdGhpcy5fZGVSaWdodC5hcHBlbmRDaGlsZCh0aGlzLl9kZUtleWxpbmVDb250KTtcblxuICAgIHRoaXMuX2luaXREaXZpZGVyTW92aW5nKCk7XG59O1xuXG5wLl9jcmVhdGVUaW1lbGluZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHRoaXMuX2RlUmlnaHQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gYW1ndWkuY29sb3IuYmcxO1xuICAgIHRoaXMuX2RlUmlnaHQucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgIHRoaXMuX2RlUmlnaHQuc3R5bGUudG9wID0gJzBweCc7XG4gICAgdGhpcy5fZGVSaWdodC5zdHlsZS5yaWdodCA9ICcwcHgnO1xuICAgIHRoaXMuX2RlUmlnaHQuc3R5bGUud2lkdGggPSAnMzAlJztcbiAgICB0aGlzLl9kZVJpZ2h0LnN0eWxlLmhlaWdodCA9ICcxMDAlJztcbn07XG5cblxucC5fY3JlYXRlU2V0dGluZ3NIZWFkID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdGhpcy5fZGVTZXR0aW5nc0hlYWQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLl9kZVNldHRpbmdzSGVhZC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnZGFya2dyZWV5JztcbiAgICB0aGlzLl9kZVNldHRpbmdzSGVhZC5zdHlsZS53aWR0aCA9ICcxMDAlJztcbiAgICB0aGlzLl9kZVNldHRpbmdzSGVhZC5zdHlsZS5oZWlnaHQgPSB0aGlzLl9oZWFkZXJIICsgJ3B4JztcbiAgICB0aGlzLl9kZUxlZnQuYXBwZW5kQ2hpbGQodGhpcy5fZGVTZXR0aW5nc0hlYWQpO1xuXG4gICAgdGhpcy5fYnRuTmV3U2VxdSA9IGFtZ3VpLmNyZWF0ZUljb25CdG4oe1xuICAgICAgICBpY29uOiAncGx1cy1zcXVhcmVkJyxcbiAgICAgICAgcGFyZW50OiB0aGlzLl9kZVNldHRpbmdzSGVhZCxcbiAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaydcbiAgICB9KTtcbiAgICB0aGlzLl9kcm9wZG93bk5ld1NlcXUgPSBhbWd1aS5jcmVhdGVEcm9wZG93bih7b3B0aW9uczogWydjc3MnLCAnc2NyaXB0JywgJ2F0dHJpYnV0ZScsICdtZWRpYScsICd0aW1lbGluZSddfSk7XG4gICAgYW1ndWkuYmluZERyb3Bkb3duKHtcbiAgICAgICAgZGVUYXJnZXQ6IHRoaXMuX2J0bk5ld1NlcXUsXG4gICAgICAgIGRlTWVudTogdGhpcy5fZHJvcGRvd25OZXdTZXF1XG4gICAgfSk7XG5cbiAgICBcbiAgICB0aGlzLl9idG5QbGF5ID0gYW1ndWkuY3JlYXRlVG9nZ2xlSWNvbkJ0bih7XG4gICAgICAgIGljb25PbjogJ3BhdXNlJywgXG4gICAgICAgIGljb25PZmY6ICdwbGF5JyxcbiAgICAgICAgcGFyZW50OiB0aGlzLl9kZVNldHRpbmdzSGVhZCxcbiAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaydcbiAgICB9KTtcbn07XG5cbnAuX2NyZWF0ZVBvaW50ZXJMaW5lID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdGhpcy5fZGVQb2ludGVyTGluZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuX2RlUG9pbnRlckxpbmUuc3R5bGUudG9wID0gdGhpcy5faGVhZGVySCArICdweCc7XG4gICAgdGhpcy5fZGVQb2ludGVyTGluZS5zdHlsZS53aWR0aCA9ICcwcHgnO1xuICAgIHRoaXMuX2RlUG9pbnRlckxpbmUuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgIHRoaXMuX2RlUG9pbnRlckxpbmUuc3R5bGUudXNlclNlbGVjdCA9ICdub25lJztcbiAgICB0aGlzLl9kZVBvaW50ZXJMaW5lLnN0eWxlLmhlaWdodCA9ICcxMDAlJztcbiAgICB0aGlzLl9kZVBvaW50ZXJMaW5lLnN0eWxlLmJvcmRlckxlZnQgPSAnMXB4IHNvbGlkIHJlZCc7XG4gICAgdGhpcy5fZGVSaWdodC5hcHBlbmRDaGlsZCh0aGlzLl9kZVBvaW50ZXJMaW5lKTtcbn07XG5cblxuXG5wLl9pbml0RGl2aWRlck1vdmluZyA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHRoYXQgPSB0aGlzO1xuXG4gICAgdGhpcy5fZGVEaXZpZGVyLnN0eWxlLmN1cnNvciA9ICdldy1yZXNpemUnO1xuXG4gICAgdGhpcy5fZGVEaXZpZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGRvd24pO1xuXG4gICAgZnVuY3Rpb24gZG93bihlKSB7XG5cbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGRyYWcpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGVuZCk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgZW5kKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcmFnKGUpIHtcblxuICAgICAgICB2YXIgbGVmdCA9IGUucGFnZVggLSB0aGF0LmRvbUVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcblxuICAgICAgICB0aGF0Ll9kZURpdmlkZXIuc3R5bGUubGVmdCA9IGxlZnQgKyAncHgnO1xuICAgICAgICB0aGF0Ll9kZUxlZnQuc3R5bGUud2lkdGggPSBsZWZ0ICsgJ3B4JztcblxuICAgICAgICB0aGF0Ll9yZWZyZXNoVGltZWJhcldpZHRoKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZW5kKGUpIHtcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBkcmFnKTtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBlbmQpO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIGVuZCk7XG4gICAgfVxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBhbWd1aSA9IHJlcXVpcmUoJy4uL2FtZ3VpJyk7XG5cblxuZnVuY3Rpb24gZGVjb3JUaW1lYmFyTmF2aWdhdG9yICh0aW1lYmFyKSB7XG5cbiAgICB2YXIgZGVOYXYsIGRlTGVmdEhhbmQsIGRlUmlnaHRIYW5kLCBcbiAgICAgICAgZHJhZ01vZGUgPSAnbW92ZScsIG1kWCwgbWRTdGFydCwgbWRFbmQ7XG4gICAgXG4gICAgY3JlYXRlQmFzZSgpO1xuICAgIHRpbWViYXIuZG9tRWxlbS5hcHBlbmRDaGlsZChkZU5hdik7XG5cbiAgICBkZU5hdi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbk1Eb3duKTtcbiAgICBkZU5hdi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgb25NRW50ZXIpO1xuICAgIGRlTmF2LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBvbk1MZWF2ZSk7XG5cbiAgICB0aW1lYmFyLm9uKCdjaGFuZ2VUYXBlJywgb25DaGFuZ2VUYXBlKTtcblxuICAgIGZ1bmN0aW9uIG9uQ2hhbmdlVGFwZSgpIHtcblxuICAgICAgICB2YXIgd2lkdGggPSB0aW1lYmFyLndpZHRoLFxuICAgICAgICAgICAgbWF4ID0gdGltZWJhci5tYXhUaW1lLFxuICAgICAgICAgICAgc3RhcnQgPSB0aW1lYmFyLnN0YXJ0LFxuICAgICAgICAgICAgZW5kID0gdGltZWJhci5lbmQ7XG5cbiAgICAgICAgZGVOYXYuc3R5bGUubGVmdCA9ICh3aWR0aCAqIChzdGFydCAvIG1heCkpICsgJ3B4JztcbiAgICAgICAgZGVOYXYuc3R5bGUud2lkdGggPSAod2lkdGggKiAoKGVuZCAtIHN0YXJ0KSAvIG1heCkpICsgJ3B4JztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbk1Eb3duKGUpIHtcblxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKGUudGFyZ2V0ID09PSBkZUxlZnRIYW5kKSBkcmFnTW9kZSA9ICdzdGFydCc7XG4gICAgICAgIGVsc2UgaWYgKGUudGFyZ2V0ID09PSBkZVJpZ2h0SGFuZCkgZHJhZ01vZGUgPSAnZW5kJztcbiAgICAgICAgZWxzZSBkcmFnTW9kZSA9ICdtb3ZlJztcblxuICAgICAgICBtZFggPSBlLnBhZ2VYO1xuICAgICAgICBtZFN0YXJ0ID0gdGltZWJhci5zdGFydDtcbiAgICAgICAgbWRFbmQgPSB0aW1lYmFyLmVuZDtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25NTW92ZSk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgb25NVXApO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIG9uTVVwKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbk1Nb3ZlKGUpIHtcblxuICAgICAgICB2YXIgbW92ZSA9IChlLnBhZ2VYIC0gbWRYKSAqIHRpbWViYXIubWF4VGltZSxcbiAgICAgICAgICAgIHN0YXJ0ID0gbWRTdGFydCArIG1vdmUsXG4gICAgICAgICAgICBsZW5ndGggPSBtZEVuZCArIHRpbWViYXIuc3RhcnQ7XG5cbiAgICAgICAgaWYgKGRyYWdNb2RlID09PSAnbW92ZScpIHtcblxuICAgICAgICAgICAgdGltZWJhci5zdGFydCA9IHN0YXJ0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRyYWdNb2RlID09PSAnc3RhcnQnKSB7XG5cbiAgICAgICAgICAgIHRpbWViYXIuc3RhcnQgPSBzdGFydDtcbiAgICAgICAgICAgIHRpbWViYXIubGVuZ3RoID0gbGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRyYWdNb2RlID09PSAnZW5kJykge1xuXG4gICAgICAgICAgICB0aW1lYmFyLmxlbmd0aCA9IGxlbmd0aDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uTVVwKCkge1xuXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBvbk1Nb3ZlKTtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBvbk1VcCk7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgb25NVXApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uTUVudGVyKCkge1xuXG4gICAgICAgIGRlTmF2LnN0eWxlLnRyYW5zZm9ybSA9ICdzY2FsZVkoMSknO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uTUxlYXZlKCkge1xuXG4gICAgICAgIGRlTmF2LnN0eWxlLnRyYW5zZm9ybSA9ICdzY2FsZVkoMC43KSc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlQmFzZSAoKSB7XG5cbiAgICAgICAgZGVOYXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGVOYXYuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICBkZU5hdi5zdHlsZS50b3AgPSAnMHB4JztcbiAgICAgICAgZGVOYXYuc3R5bGUuaGVpZ2h0ID0gJzNweCc7XG4gICAgICAgIGRlTmF2LnN0eWxlLmN1cnNvciA9ICdtb3ZlJztcbiAgICAgICAgZGVOYXYuc3R5bGUudHJhbnNmb3JtT3JpZ2luID0gJ2NlbnRlciB0b3AnO1xuICAgICAgICBkZU5hdi5zdHlsZS5iYWNrZ3JvdW5kID0gYW1ndWkuY29sb3IuYmcyO1xuXG4gICAgICAgIGRlUmlnaHRIYW5kID0gY3JlYXRlSGFuZGxlcigncmlnaHQnKTtcbiAgICAgICAgZGVMZWZ0SGFuZCA9IGNyZWF0ZUhhbmRsZXIoJ2xlZnQnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVIYW5kbGVyKHNpZGUpIHtcblxuICAgICAgICB2YXIgZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGUuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICBkZS5zdHlsZVtzaWRlXSA9ICcwcHgnO1xuICAgICAgICBkZS5zdHlsZS50b3AgPSAnMHB4JztcbiAgICAgICAgZGUuc3R5bGUuaGVpZ2h0ID0gJzEwMCUnO1xuICAgICAgICBkZS5zdHlsZS53aWR0aCA9ICc1JSc7XG4gICAgICAgIGRlLnN0eWxlLm1pbldpZHRoID0gJzFweCc7XG4gICAgICAgIGRlLnN0eWxlLm1heFdpZHRoID0gJzdweCc7XG4gICAgICAgIGRlLnN0eWxlLmN1cnNvciA9ICdldy1yZXNpemUnO1xuICAgICAgICBkZS5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSAnY2VudGVyIHRvcCc7XG4gICAgICAgIGRlLnN0eWxlLnRyYW5zZm9ybSA9ICdzY2FsZVkoMC4zKSc7XG4gICAgICAgIGRlTmF2LmFwcGVuZENoaWxkKGRlKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZGVjb3JUaW1lYmFyTmF2aWdhdG9yOyIsIm1vZHVsZS5leHBvcnRzID0gXCI7KGZ1bmN0aW9uIChyb290KSB7XFxuICAgICd1c2Ugc3RyaWN0JztcXG5cXG4gICAgcm9vdC5hbSA9IHJvb3QuYW0gfHwge307XFxuICAgIHJvb3QuYW0ucGFnZVNjcmlwdHMgPSByb290LmFtLnBhZ2VTY3JpcHRzIHx8IHt9O1xcblxcbiAgICB2YXIgc2VxdVBsYXllckdlbnMgPSBbe3t7c2VxdVBsYXllckdlbnN9fX1dO1xcblxcbiAgICB2YXIgcmVnID0gcm9vdC5hbS5wYWdlU2NyaXB0cy57e25hbWV9fSA9IHtcXG4gICAgICAgIFxcbiAgICAgICAgY3JlYXRlUGxheWVyOiBmdW5jdGlvbiAoKSB7XFxuXFxuICAgICAgICAgICAgdmFyIHNlcXVlbmNlUGxheWVycyA9IFtdO1xcblxcbiAgICAgICAgICAgIHNlcXVQbGF5ZXJHZW5zLmZvckVhY2goZnVuY3Rpb24gKGNyZWF0ZSkge1xcblxcbiAgICAgICAgICAgICAgICBzZXF1ZW5jZVBsYXllcnMucHVzaChjcmVhdGUoKSk7XFxuICAgICAgICAgICAgfSk7XFxuXFxuICAgICAgICAgICAgcmV0dXJuIHtcXG4gICAgICAgICAgICAgICAgcGxheTogY2FsbFBsYXllcnMuYmluZChudWxsLCAncGxheScpLFxcbiAgICAgICAgICAgICAgICBwYXVzZTogY2FsbFBsYXllcnMuYmluZChudWxsLCAncGF1c2UnKSxcXG4gICAgICAgICAgICAgICAgc2VlazogY2FsbFBsYXllcnMuYmluZChudWxsLCAnc2VlaycpLFxcbiAgICAgICAgICAgIH07XFxuXFxuICAgICAgICAgICAgZnVuY3Rpb24gY2FsbFBsYXllcnMoZm5OYW1lLCBhcmcxKSB7XFxuXFxuICAgICAgICAgICAgICAgIHNlcXVlbmNlUGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uIChzZXF1ZW5jZVBsYXllcikge1xcblxcbiAgICAgICAgICAgICAgICAgICAgc2VxdWVuY2VQbGF5ZXJbZm5OYW1lXS5jYWxsKG51bGwsIGFyZzEpO1xcbiAgICAgICAgICAgICAgICB9KTtcXG4gICAgICAgICAgICB9XFxuICAgICAgICB9LFxcbiAgICAgICAgXFxuICAgICAgICB7eyNzYXZlRGF0YX19XFxuICAgICAgICBzYXZlRGF0YToge3t7c2F2ZURhdGF9fX0sXFxuICAgICAgICB7ey9zYXZlRGF0YX19XFxuICAgIH07XFxuXFxuICAgIHt7I2F1dG9QbGF5fX1cXG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT0gJ2ludGVyYWN0aXZlJyB8fCBkb2N1bWVudC5yZWFkeVN0YXRlID09ICdjb21wbGV0ZScpIHtcXG5cXG4gICAgICAgIHJlZy5jcmVhdGVQbGF5ZXIoKS5wbGF5KCk7XFxuICAgIH1cXG4gICAgZWxzZSB7XFxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xcblxcbiAgICAgICAgICAgIHJlZy5jcmVhdGVQbGF5ZXIoKS5wbGF5KCk7XFxuICAgICAgICB9KTtcXG4gICAgfVxcbiAgICB7ey9hdXRvUGxheX19XFxufSh0aGlzKSk7XCI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXI7XG52YXIgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xudmFyIGFtZ3VpID0gcmVxdWlyZSgnLi4vYW1ndWknKTtcblxuZnVuY3Rpb24gVG9vbGJhcigpIHtcblxuICAgIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gICAgdGhpcy5faGVpZ2h0ID0gMzI7XG4gICAgdGhpcy5faWNvbnMgPSBbXTtcbiAgICB0aGlzLl9zZXBhcmF0b3JzID0ge307XG5cbiAgICB0aGlzLmRvbUVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLmRvbUVsZW0uc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnO1xuICAgIHRoaXMuZG9tRWxlbS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnZGFya3NsYXRlZ3JleSc7XG4gICAgdGhpcy5kb21FbGVtLnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnYXV0byc7XG4gICAgdGhpcy5kb21FbGVtLnN0eWxlLmhlaWdodCA9IHRoaXMuX2hlaWdodCArICdweCc7XG5cbiAgICB0aGlzLmFkZFNlcGFyYXRvcigndG9vbHMnKTtcbiAgICB0aGlzLmFkZFNlcGFyYXRvcignaGFuZGxlcicpO1xuICAgIHRoaXMuYWRkU2VwYXJhdG9yKCdnbG9iYWwnKTtcbiAgICB0aGlzLmFkZFNlcGFyYXRvcigncmVzdCcpO1xufVxuXG5pbmhlcml0cyhUb29sYmFyLCBFdmVudEVtaXR0ZXIpO1xudmFyIHAgPSBUb29sYmFyLnByb3RvdHlwZTtcbm1vZHVsZS5leHBvcnRzID0gVG9vbGJhcjtcblxuXG5wLmFkZEljb24gPSBmdW5jdGlvbiAob3B0KSB7XG5cbiAgICB2YXIgZGVJY29uID0gb3B0LmRlSWNvbiB8fCBhbWd1aS5jcmVhdGVJY29uQnRuKHtcbiAgICAgICAgd2lkdGg6IDMyLFxuICAgICAgICBoZWlnaHQ6IDMyLFxuICAgICAgICBmb250U2l6ZTogJzMycHgnLFxuICAgICAgICBpY29uOiBvcHQuaWNvbixcbiAgICAgICAgb25DbGljazogb3B0Lm9uQ2xpY2tcbiAgICB9KTtcblxuICAgIGFtZ3VpLmFkZFRvb2x0aXAoe1xuICAgICAgICBkZVRhcmdldDogZGVJY29uLFxuICAgICAgICB0ZXh0OiAndG9vbHRpcCcsXG4gICAgICAgIHNpZGU6ICdib3R0b20nXG4gICAgfSk7XG5cbiAgICBkZUljb24uc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snO1xuXG4gICAgdGhpcy5kb21FbGVtLmluc2VydEJlZm9yZShkZUljb24sIHRoaXMuX3NlcGFyYXRvcnNbb3B0LnNlcGFyYXRvciB8fCAncmVzdCddKTtcblxuICAgIHJldHVybiBkZUljb247XG59O1xuXG5wLnJlbW92ZUljb24gPSBmdW5jdGlvbiAoZGVJY29uKSB7XG5cbiAgICBkZUljb24ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChkZUljb24pO1xufSBcblxucC5hZGRTZXBhcmF0b3IgPSBmdW5jdGlvbiAobmFtZSkge1xuXG4gICAgdmFyIGRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIHRoaXMuZG9tRWxlbS5hcHBlbmRDaGlsZChkZSk7XG4gICAgdGhpcy5fc2VwYXJhdG9yc1tuYW1lXSA9IGRlO1xufTsiLCJ2YXIgVHJhbnNmb3JtZXIgPSByZXF1aXJlKCcuL2hhbmRzL1RyYW5zZm9ybWVyJyk7XG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcblxuZnVuY3Rpb24gVHJhbnNoYW5kKCkge1xuXG4gICAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cbiAgICB0aGlzLmhhbmRzID0ge307XG5cbiAgICBbVHJhbnNmb3JtZXJdLmZvckVhY2goZnVuY3Rpb24gKEhhbmQpIHtcblxuICAgICAgICB2YXIgaGFuZCA9IG5ldyBIYW5kKCk7XG5cbiAgICAgICAgaGFuZC5vbignY2hhbmdlJywgdGhpcy5lbWl0LmJpbmQodGhpcywgJ2NoYW5nZScpKTtcblxuICAgICAgICB0aGlzLmhhbmRzW0hhbmQuaWRdID0gaGFuZDtcbiAgICB9LCB0aGlzKTtcbn1cblxuaW5oZXJpdHMoVHJhbnNoYW5kLCBFdmVudEVtaXR0ZXIpO1xuXG52YXIgcCA9IFRyYW5zaGFuZC5wcm90b3R5cGU7XG5cbnAuc2V0dXAgPSBmdW5jdGlvbiAob3B0KSB7XG5cbiAgICB2YXIgaGFuZCA9IHRoaXMuaGFuZHNbb3B0LmhhbmQudHlwZV07XG5cbiAgICBpZiAoaGFuZCkge1xuXG4gICAgICAgIGhhbmQuc2V0dXAob3B0LmhhbmQpO1xuICAgICAgICB0aGlzLmRvbUVsZW0gPSBoYW5kLmRvbUVsZW07XG4gICAgICAgIHRoaXMuX2N1cnJIYW5kID0gaGFuZDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRocm93ICdVbmtub3duIGhhbmQgdHlwZTogJyArIG9wdC5oYW5kLnR5cGVcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mKG9wdC5vbikgPT09ICdvYmplY3QnKSB7XG5cbiAgICAgICAgT2JqZWN0LmtleXMob3B0Lm9uKS5mb3JFYWNoKGZ1bmN0aW9uIChldmVudFR5cGUpIHtcblxuICAgICAgICAgICAgdGhpcy5vbihldmVudFR5cGUsIG9wdC5vbltldmVudFR5cGVdKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfVxufTtcblxucC5hY3RpdmF0ZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgIGlmICh0aGlzLl9jdXJySGFuZCkge1xuXG4gICAgICAgIHRoaXMuX2N1cnJIYW5kLmFjdGl2YXRlKCk7XG4gICAgfVxufTtcblxucC5kZWFjdGl2YXRlID0gZnVuY3Rpb24gKCkge1xuXG4gICAgaWYgKHRoaXMuX2N1cnJIYW5kKSB7XG5cbiAgICAgICAgdGhpcy5fY3VyckhhbmQuZGVhY3RpdmF0ZSgpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVHJhbnNoYW5kOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG52YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG52YXIgTU9VU0VTVEFURVMgPSB7XG4gICAgJ21vdmUnOiAnbW92ZScsXG4gICAgJ3JvdGF0ZSc6ICdncmFiJyxcbiAgICAnb3JpZ2luJzogJ2hhaXJsaW5lJyxcbiAgICAnMTAwMCc6ICducy1yZXNpemUnLFxuICAgICcxMTAwJzogJ25lc3ctcmVzaXplJyxcbiAgICAnMDEwMCc6ICdldy1yZXNpemUnLFxuICAgICcwMTEwJzogJ253c2UtcmVzaXplJyxcbiAgICAnMDAxMCc6ICducy1yZXNpemUnLFxuICAgICcwMDExJzogJ25lc3ctcmVzaXplJyxcbiAgICAnMDAwMSc6ICdldy1yZXNpemUnLFxuICAgICcxMDAxJzogJ253c2UtcmVzaXplJyxcbn07XG5cblxuZnVuY3Rpb24gVHJhbnNmb3JtZXIoKSB7XG5cbiAgICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblxuICAgIHRoaXMuX3BhcmFtcyA9IHtcbiAgICAgICAgdHg6IDAsIHR5OiAwLFxuICAgICAgICBzeDogMSwgc3k6IDEsXG4gICAgICAgIHJ6OiAwLFxuICAgICAgICBveDogMC41LCBveTogMC41XG4gICAgfTtcbiAgICB0aGlzLl9iYXNlID0ge3g6IDAsIHk6IDAsIHc6IDAsIGg6IDB9O1xuICAgIHRoaXMuX3BvaW50cyA9IFt7fSwge30sIHt9LCB7fV07XG4gICAgdGhpcy5fcE9yaWdpbiA9IHt9O1xuICAgIHRoaXMuX29yaWdpblJhZGl1cyA9IDY7XG5cbiAgICB0aGlzLl9vbkRyYWcgPSB0aGlzLl9vbkRyYWcuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vbk1vdXNlVXAgPSB0aGlzLl9vbk1vdXNlVXAuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vbk1vdXNlTW92ZSA9IHRoaXMuX29uTW91c2VNb3ZlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25Nb3VzZURvd24gPSB0aGlzLl9vbk1vdXNlRG93bi5iaW5kKHRoaXMpO1xufVxuXG5UcmFuc2Zvcm1lci5pZCA9ICd0cmFuc2Zvcm1lcic7XG5cbmluaGVyaXRzKFRyYW5zZm9ybWVyLCBFdmVudEVtaXR0ZXIpO1xuXG52YXIgcCA9IFRyYW5zZm9ybWVyLnByb3RvdHlwZTtcblxucC5zZXR1cCA9IGZ1bmN0aW9uIChvcHQpIHtcblxuICAgIGlmICghdGhpcy5kb21FbGVtKSB7XG4gICAgICAgIHRoaXMuY3JlYXRlR3JhcGhpY3MoKTtcbiAgICB9XG5cbiAgICBfLmV4dGVuZCh0aGlzLl9wYXJhbXMsIG9wdC5wYXJhbXMpO1xuICAgIF8uZXh0ZW5kKHRoaXMuX2Jhc2UsIG9wdC5iYXNlKTtcbiAgICB0aGlzLl9yZWZyZXNoUG9pbnRzKCk7XG4gICAgdGhpcy5fcmVuZGVySGFuZGxlcigpO1xufTtcblxucC5hY3RpdmF0ZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgIGlmICh0aGlzLl9pc0FjdGl2YXRlZCkgcmV0dXJuO1xuICAgIHRoaXMuX2lzQWN0aXZhdGVkID0gdHJ1ZTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX29uTW91c2VEb3duKTtcbn07XG5cbnAuZGVhY3RpdmF0ZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgIGlmICghdGhpcy5faXNBY3RpdmF0ZWQpIHJldHVybjtcbiAgICB0aGlzLl9pc0FjdGl2YXRlZCA9IGZhbHNlO1xuICAgIFxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSk7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX29uTW91c2VEb3duKTtcbn07XG5cbnAuY3JlYXRlR3JhcGhpY3MgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB0aGlzLmRvbUVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICB0aGlzLmRvbUVsZW0uc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnO1xuICAgIHRoaXMuZG9tRWxlbS5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xuICAgIC8vIHRoaXMuZG9tRWxlbS5zdHlsZS5ib3JkZXIgPSAnMXB4IHNvbGlkIHJlZCc7XG59O1xuXG5wLl9yZWZyZXNoUG9pbnRzID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGJhc2UgPSB0aGlzLl9iYXNlLCBcbiAgICAgICAgcGFyYW1zID0gdGhpcy5fcGFyYW1zLFxuICAgICAgICBwID0gdGhpcy5fcG9pbnRzLFxuICAgICAgICBwbyA9IHRoaXMuX3BPcmlnaW47XG5cbiAgICBiYXNlLnggKz0gcGFyYW1zLnR4O1xuICAgIGJhc2UueSArPSBwYXJhbXMudHk7XG5cbiAgICBwby54ID0gYmFzZS54ICsgKGJhc2UudyAqIHBhcmFtcy5veCk7XG4gICAgcG8ueSA9IGJhc2UueSArIChiYXNlLmggKiBwYXJhbXMub3kpO1xuXG4gICAgdmFyIHRveCA9IGJhc2UueCArIHBhcmFtcy5veCAqIGJhc2UudyxcbiAgICAgICAgdG95ID0gYmFzZS55ICsgcGFyYW1zLm95ICogYmFzZS5oO1xuXG4gICAgdChwWzBdLCBiYXNlLngsIGJhc2UueSk7XG4gICAgdChwWzFdLCBiYXNlLnggKyBiYXNlLncsIGJhc2UueSk7XG4gICAgdChwWzJdLCBiYXNlLnggKyBiYXNlLncsIGJhc2UueSArIGJhc2UuaCk7XG4gICAgdChwWzNdLCBiYXNlLngsIGJhc2UueSArIGJhc2UuaCk7XG5cbiAgICBmdW5jdGlvbiB0KHAsIHgsIHkpIHtcblxuICAgICAgICB2YXIgZHggPSAoeCAtIHRveCkgKiBwYXJhbXMuc3gsXG4gICAgICAgICAgICBkeSA9ICh5IC0gdG95KSAqIHBhcmFtcy5zeSxcbiAgICAgICAgICAgIGQgPSBNYXRoLnNxcnQoZHgqZHggKyBkeSpkeSksXG4gICAgICAgICAgICByYWQgPSBNYXRoLmF0YW4yKGR5LCBkeCkgKyBwYXJhbXMucno7XG5cbiAgICAgICAgcC54ID0gdG94ICsgKGQgKiBNYXRoLmNvcyhyYWQpKTtcbiAgICAgICAgcC55ID0gdG95ICsgKGQgKiBNYXRoLnNpbihyYWQpKTtcbiAgICB9XG59O1xuXG5wLl9yZW5kZXJIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIHAgPSB0aGlzLl9wb2ludHMsXG4gICAgICAgIHBvID0gdGhpcy5fcE9yaWdpbixcbiAgICAgICAgYyA9IHRoaXMuZG9tRWxlbSxcbiAgICAgICAgb3IgPSB0aGlzLl9vcmlnaW5SYWRpdXMsXG4gICAgICAgIGN0eCA9IGMuZ2V0Q29udGV4dCgnMmQnKSxcbiAgICAgICAgbWFyZ2luID0gMixcbiAgICAgICAgbWluWCA9IE1hdGgubWluKHBbMF0ueCwgcFsxXS54LCBwWzJdLngsIHBbM10ueCksXG4gICAgICAgIG1heFggPSBNYXRoLm1heChwWzBdLngsIHBbMV0ueCwgcFsyXS54LCBwWzNdLngpLFxuICAgICAgICBtaW5ZID0gTWF0aC5taW4ocFswXS55LCBwWzFdLnksIHBbMl0ueSwgcFszXS55KSxcbiAgICAgICAgbWF4WSA9IE1hdGgubWF4KHBbMF0ueSwgcFsxXS55LCBwWzJdLnksIHBbM10ueSk7XG5cbiAgICBjLnN0eWxlLmxlZnQgPSAobWluWCAtIG1hcmdpbikgKyAncHgnO1xuICAgIGMuc3R5bGUudG9wID0gKG1pblkgLSBtYXJnaW4pICsgJ3B4JztcbiAgICBjLndpZHRoID0gKG1heFggLSBtaW5YKSArIChtYXJnaW4gKiAyKTtcbiAgICBjLmhlaWdodCA9IChtYXhZIC0gbWluWSkgKyAobWFyZ2luICogMik7XG5cbiAgICBjdHguc2F2ZSgpO1xuICAgIGN0eC50cmFuc2xhdGUobWFyZ2luIC0gbWluWCwgbWFyZ2luIC0gbWluWSk7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5tb3ZlVG8ocFswXS54LCBwWzBdLnkpO1xuICAgIGN0eC5saW5lVG8ocFsxXS54LCBwWzFdLnkpO1xuICAgIGN0eC5saW5lVG8ocFsyXS54LCBwWzJdLnkpO1xuICAgIGN0eC5saW5lVG8ocFszXS54LCBwWzNdLnkpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcblxuICAgIGN0eC5tb3ZlVG8ocG8ueCAtIG9yLCBwby55KTtcbiAgICBjdHgubGluZVRvKHBvLnggKyBvciwgcG8ueSk7XG4gICAgY3R4Lm1vdmVUbyhwby54LCBwby55IC0gb3IpO1xuICAgIGN0eC5saW5lVG8ocG8ueCwgcG8ueSArIG9yKTtcbiAgICBcblxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjNGYyJztcbiAgICBjdHgubGluZVdpZHRoID0gMTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LnJlc3RvcmUoKTtcbn07XG5cblxucC5fb25Nb3VzZU1vdmUgPSBmdW5jdGlvbiAoZSkge1xuXG4gICAgaWYgKCF0aGlzLl9pc0hhbmRsZSkge1xuXG4gICAgICAgIHRoaXMuX3NldEZpbmdlcihlKTtcbiAgICB9XG59O1xuXG5wLl9vbkRyYWcgPSBmdW5jdGlvbiAoZSkge1xuXG4gICAgdmFyIHBhcmFtcyA9IHRoaXMuX3BhcmFtcyxcbiAgICAgICAgYmFzZSA9IHRoaXMuX2Jhc2UsXG4gICAgICAgIHBPcmlnaW4gPSB0aGlzLl9wT3JpZ2luLFxuICAgICAgICBtZCA9IHRoaXMuX21kUG9zLFxuICAgICAgICBmaW5nZXIgPSB0aGlzLl9maW5nZXIsXG4gICAgICAgIHBNb3VzZSA9IHt4OiBlLnBhZ2VYLCB5OiBlLnBhZ2VZfSxcbiAgICAgICAgZHggPSBwTW91c2UueCAtIG1kLnBNb3VzZS54LFxuICAgICAgICBkeSA9IHBNb3VzZS55IC0gbWQucE1vdXNlLnksXG4gICAgICAgIG1yLCBkcixcbiAgICAgICAgY2hhbmdlID0ge307XG5cbiAgICBpZiAoZmluZ2VyID09PSAnb3JpZ2luJykge1xuICAgICAgICAvLyBjaGFuZ2Uub3ggPSBwLm94ID0gc3Aub3ggKyAoZHggLyB0aGlzLl9iYXNlLncpO1xuICAgICAgICAvLyBjaGFuZ2Uub3kgPSBwLm95ID0gc3Aub3kgKyAoZHkgLyB0aGlzLl9iYXNlLmgpO1xuICAgIH1cbiAgICAgICAgXG4gICAgaWYgKGZpbmdlciA9PT0gJ21vdmUnKSB7XG4gICAgICAgIGNoYW5nZS50eCA9IHBhcmFtcy50eCA9IG1kLnBhcmFtcy50eCArIGR4O1xuICAgICAgICBjaGFuZ2UudHkgPSBwYXJhbXMudHkgPSBtZC5wYXJhbXMudHkgKyBkeTtcbiAgICB9XG4gICAgLy9UT0RPXG4gICAgaWYgKGZpbmdlci5jaGFyQXQoMCkgPT09ICcxJykge1xuXG4gICAgICAgIHNldFNjYWxlKC1NYXRoLlBJLzIsICdzeScpO1xuICAgIH1cblxuICAgIGlmIChmaW5nZXIuY2hhckF0KDEpID09PSAnMScpIHtcblxuICAgICAgICBzZXRTY2FsZSgwLCAnc3gnKTtcbiAgICB9XG5cbiAgICBpZiAoZmluZ2VyLmNoYXJBdCgyKSA9PT0gJzEnKSB7XG5cbiAgICAgICAgc2V0U2NhbGUoTWF0aC5QSS8yLCAnc3knKTtcbiAgICB9XG5cbiAgICBpZiAoZmluZ2VyLmNoYXJBdCgzKSA9PT0gJzEnKSB7XG5cbiAgICAgICAgc2V0U2NhbGUoTWF0aC5QSSwgJ3N4Jyk7XG4gICAgfVxuXG4gICAgaWYgKGZpbmdlciA9PT0gJ3JvdGF0ZScpIHtcblxuICAgICAgICBzZXRSb3RhdGlvbigpO1xuICAgIH1cblxuICAgIHRoaXMuZW1pdCgnY2hhbmdlJywgY2hhbmdlLCAndHJhbnNmb3JtJyk7XG5cbiAgICBmdW5jdGlvbiBzZXRTY2FsZShyLCBzKSB7XG5cbiAgICAgICAgdmFyIHJhZCA9IHIgKyBtZC5wYXJhbXMucnosXG4gICAgICAgICAgICBtZERpc3QgPSBkaXN0VG9Qb2ludEluQW5nbGUocE9yaWdpbiwgbWQucE1vdXNlLCByYWQpLFxuICAgICAgICAgICAgZHJhZ0Rpc3QgPSBkaXN0VG9Qb2ludEluQW5nbGUocE9yaWdpbiwgcE1vdXNlLCByYWQpO1xuXG4gICAgICAgIGNoYW5nZVtzXSA9IHBhcmFtc1tzXSA9IChkcmFnRGlzdCAvIG1kRGlzdCkgKiBtZC5wYXJhbXNbc107XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0Um90YXRpb24oKSB7XG5cbiAgICAgICAgdmFyIG9weCA9IGJhc2UueCArIGJhc2UudyAqIHBhcmFtcy5veCxcbiAgICAgICAgICAgIG9weSA9IGJhc2UueSArIGJhc2UuaCAqIHBhcmFtcy5veSxcbiAgICAgICAgICAgIG1keCA9IG1kLnBNb3VzZS54IC0gb3B4LFxuICAgICAgICAgICAgbWR5ID0gbWQucE1vdXNlLnkgLSBvcHksXG4gICAgICAgICAgICBtZHIgPSBNYXRoLmF0YW4yKG1keSwgbWR4KSxcbiAgICAgICAgICAgIG14ID0gcE1vdXNlLnggLSBvcHgsXG4gICAgICAgICAgICBteSA9IHBNb3VzZS55IC0gb3B5LFxuICAgICAgICAgICAgbXIgPSBNYXRoLmF0YW4yKG15LCBteCk7XG5cbiAgICAgICAgY2hhbmdlLnJ6ID0gcGFyYW1zLnJ6ID0gbWQucGFyYW1zLnJ6ICsgKG1yIC0gbWRyKTtcbiAgICB9XG59O1xuXG5wLl9zZXRGaW5nZXIgPSBmdW5jdGlvbiAoZSkge1xuXG4gICAgdmFyIGJhc2UgPSB0aGlzLl9iYXNlLFxuICAgICAgICBwYXJhbXMgPSB0aGlzLl9wYXJhbXMsXG4gICAgICAgIHAgPSB0aGlzLl9wb2ludHMsXG4gICAgICAgIHBvID0gdGhpcy5fcE9yaWdpbixcbiAgICAgICAgZGlmZiA9IDMsXG4gICAgICAgIHJEaWZmID0gOSxcbiAgICAgICAgbXggPSBlLnBhZ2VYLFxuICAgICAgICBteSA9IGUucGFnZVksXG4gICAgICAgIG1wID0ge3g6IG14LCB5OiBteX0sXG4gICAgICAgIGRUb3AgPSBkaXN0VG9TZWdtZW50KG1wLCBwWzBdLCBwWzFdKSxcbiAgICAgICAgZExlZnQgPSBkaXN0VG9TZWdtZW50KG1wLCBwWzFdLCBwWzJdKSxcbiAgICAgICAgZEJvdHRvbSA9IGRpc3RUb1NlZ21lbnQobXAsIHBbMl0sIHBbM10pLFxuICAgICAgICBkUmlnaHQgPSBkaXN0VG9TZWdtZW50KG1wLCBwWzNdLCBwWzBdKSxcbiAgICAgICAgZE9yaWdpbiA9IGRpc3QyKG1wLCBwbyksXG4gICAgICAgIHRvcCA9IGRUb3AgPCBkaWZmLFxuICAgICAgICBsZWZ0ID0gZExlZnQgPCBkaWZmLFxuICAgICAgICBib3R0b20gPSBkQm90dG9tIDwgZGlmZixcbiAgICAgICAgcmlnaHQgPSBkUmlnaHQgPCBkaWZmLFxuICAgICAgICBpbnNpZGUgPSBpc0luc2lkZShtcCwgcCk7XG5cbiAgICBpZiAoYmFzZS53aWR0aCAqIHBhcmFtcy5zeCA8IGRpZmYgKiAyICYmIGluc2lkZSkge1xuICAgICAgICBcbiAgICAgICAgbGVmdCA9IGZhbHNlO1xuICAgICAgICByaWdodCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChiYXNlLmhlaWdodCAqIHBhcmFtcy5zeSA8IGRpZmYgKiAyICYmIGluc2lkZSkge1xuICAgIFxuICAgICAgICB0b3AgPSBmYWxzZTtcbiAgICAgICAgYm90dG9tID0gZmFsc2U7XG4gICAgfVxuICAgIFxuICAgIGlmIChkT3JpZ2luIDwgdGhpcy5fb3JpZ2luUmFkaXVzKSB7XG5cbiAgICAgICAgdGhpcy5fZmluZ2VyID0gJ29yaWdpbic7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRvcCB8fCByaWdodCB8fCBib3R0b20gfHwgbGVmdCkge1xuXG4gICAgICAgIHRoaXMuX2ZpbmdlciA9ICgnMDAwJyArICh0b3AgKiAxMDAwICsgbGVmdCAqIDEwMCArIGJvdHRvbSAqIDEwICsgcmlnaHQgKiAxKSkuc3Vic3RyKC00KTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaW5zaWRlKSB7XG5cbiAgICAgICAgdGhpcy5fZmluZ2VyID0gJ21vdmUnO1xuICAgIH1cbiAgICBlbHNlIGlmIChkVG9wIDwgckRpZmYgfHwgZFJpZ2h0IDwgckRpZmYgfHwgZEJvdHRvbSA8IHJEaWZmIHx8IGRMZWZ0IDwgckRpZmYpIHtcblxuICAgICAgICB0aGlzLl9maW5nZXIgPSAncm90YXRlJztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMuX2ZpbmdlciA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9maW5nZXIpIHtcblxuICAgICAgICB0aGlzLmRvbUVsZW0uc3R5bGUucG9pbnRlckV2ZW50cyA9ICdhdXRvJztcbiAgICAgICAgdGhpcy5kb21FbGVtLnN0eWxlLmN1cnNvciA9IE1PVVNFU1RBVEVTW3RoaXMuX2Zpbmdlcl07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmRvbUVsZW0uc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcbiAgICAgICAgdGhpcy5kb21FbGVtLnN0eWxlLmN1cnNvciA9ICdhdXRvJztcbiAgICB9XG59O1xuXG5wLl9vbk1vdXNlRG93biA9IGZ1bmN0aW9uIChlKSB7XG5cbiAgICBpZiAoIXRoaXMuX2Zpbmdlcikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB0aGlzLl9pc0hhbmRsZSA9IHRydWU7XG5cbiAgICB0aGlzLl9tZFBvcyA9IHtcbiAgICAgICAgcE1vdXNlOiB7eDogZS5wYWdlWCwgeTogZS5wYWdlWX0sXG4gICAgICAgIHBhcmFtczogXy5jbG9uZURlZXAodGhpcy5fcGFyYW1zKSxcbiAgICAgICAgcG9pbnRzOiBfLmNsb25lRGVlcCh0aGlzLl9wb2ludHMpXG4gICAgfTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fb25Nb3VzZVVwKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX29uTW91c2VVcCk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX29uRHJhZyk7XG59O1xuXG5wLl9vbk1vdXNlVXAgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX29uTW91c2VVcCk7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLl9vbk1vdXNlVXApO1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9vbkRyYWcpO1xuICAgIFxuICAgIHRoaXMuX2lzSGFuZGxlID0gZmFsc2U7XG59O1xuXG5mdW5jdGlvbiByYWREaWZmKHIwLCByMSkge1xuXG4gICAgcjAgJT0gTWF0aC5QSTtcbiAgICByMSAlPSBNYXRoLlBJO1xuICAgIHIwICs9IE1hdGguUEk7XG4gICAgcjEgKz0gTWF0aC5QSTtcblxuICAgIHJldHVybiByMSAtIHIwO1xufVxuXG5mdW5jdGlvbiBzcXIoeCkgeyBcbiAgICByZXR1cm4geCAqIHg7XG59XG5cbmZ1bmN0aW9uIGRpc3QyKHYsIHcpIHsgXG4gICAgcmV0dXJuIHNxcih2LnggLSB3LngpICsgc3FyKHYueSAtIHcueSk7XG59XG5cbmZ1bmN0aW9uIGRpc3RUb1NlZ21lbnRTcXVhcmVkKHAsIHYsIHcpIHtcbiAgdmFyIGwyID0gZGlzdDIodiwgdyk7XG4gICAgXG4gIGlmIChsMiA9PT0gMCkgcmV0dXJuIGRpc3QyKHAsIHYpO1xuICAgIFxuICB2YXIgdCA9ICgocC54IC0gdi54KSAqICh3LnggLSB2LngpICsgKHAueSAtIHYueSkgKiAody55IC0gdi55KSkgLyBsMjtcbiAgICBcbiAgaWYgKHQgPCAwKSByZXR1cm4gZGlzdDIocCwgdik7XG4gIGlmICh0ID4gMSkgcmV0dXJuIGRpc3QyKHAsIHcpO1xuICAgIFxuICByZXR1cm4gZGlzdDIocCwgeyB4OiB2LnggKyB0ICogKHcueCAtIHYueCksIHk6IHYueSArIHQgKiAody55IC0gdi55KSB9KTtcbn1cblxuZnVuY3Rpb24gZGlzdFRvU2VnbWVudChwLCB2LCB3KSB7IFxuICAgIHJldHVybiBNYXRoLnNxcnQoZGlzdFRvU2VnbWVudFNxdWFyZWQocCwgdiwgdykpO1xufVxuXG5mdW5jdGlvbiBkaXN0VG9Qb2ludEluQW5nbGUocDAsIHAxLCByYWQpIHtcblxuICAgIHZhciBkeCA9IHAxLnggLSBwMC54LFxuICAgICAgICBkeSA9IHAxLnkgLSBwMC55LFxuICAgICAgICBkID0gTWF0aC5zcXJ0KGR4KmR4ICsgZHkqZHkpLFxuICAgICAgICBtUmFkID0gTWF0aC5hdGFuMihkeSwgZHgpO1xuXG4gICAgcmFkID0gbVJhZCAtIHJhZDtcblxuICAgIC8vIGNvbnNvbGUubG9nKCdkeCcsIGR4LCAnZHknLCBkeSwgJ2QnLCBkLCAnbVJhZCcsIG1SYWQsICdyYWQnLCByYWQsICdyZXR1cm4nLCBNYXRoLmNvcyhyYWQpICogZClcblxuICAgIHJldHVybiBNYXRoLmNvcyhyYWQpICogZDtcblxufVxuXG5mdW5jdGlvbiBpc0luc2lkZShwb2ludCwgdnMpIHtcbiAgICAvLyByYXktY2FzdGluZyBhbGdvcml0aG0gYmFzZWQgb25cbiAgICAvLyBodHRwOi8vd3d3LmVjc2UucnBpLmVkdS9Ib21lcGFnZXMvd3JmL1Jlc2VhcmNoL1Nob3J0X05vdGVzL3BucG9seS5odG1sXG4gICAgXG4gICAgdmFyIHggPSBwb2ludC54LCB5ID0gcG9pbnQueTtcbiAgICBcbiAgICB2YXIgaW5zaWRlID0gZmFsc2U7XG4gICAgZm9yICh2YXIgaSA9IDAsIGogPSB2cy5sZW5ndGggLSAxOyBpIDwgdnMubGVuZ3RoOyBqID0gaSsrKSB7XG4gICAgICAgIHZhciB4aSA9IHZzW2ldLngsIHlpID0gdnNbaV0ueTtcbiAgICAgICAgdmFyIHhqID0gdnNbal0ueCwgeWogPSB2c1tqXS55O1xuICAgICAgICBcbiAgICAgICAgdmFyIGludGVyc2VjdCA9ICgoeWkgPiB5KSAhPT0gKHlqID4geSkpICYmXG4gICAgICAgICAgICAoeCA8ICh4aiAtIHhpKSAqICh5IC0geWkpIC8gKHlqIC0geWkpICsgeGkpO1xuICAgICAgICBpZiAoaW50ZXJzZWN0KSBpbnNpZGUgPSAhaW5zaWRlO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gaW5zaWRlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYW5zZm9ybWVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcbnZhciBXZWJTdG9yYWdlbWFuID0gcmVxdWlyZSgnLi9zdG9yYWdlcy9XZWJTdG9yYWdlbWFuJyk7XG52YXIgUGFnZVNjcmlwdCA9IHJlcXVpcmUoJy4vc3RvcmFnZXMvUGFnZVNjcmlwdCcpO1xudmFyIERvd25sb2FkID0gcmVxdWlyZSgnLi9zdG9yYWdlcy9Eb3dubG9hZCcpO1xudmFyIGRlY29yRGlhbG9nID0gcmVxdWlyZSgnLi9kZWNvckRpYWxvZycpO1xuXG5mdW5jdGlvbiBXYXJlaG91c2VlbWFuKG9wdCkge1xuXG4gICAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cbiAgICBkZWNvckRpYWxvZyh0aGlzKTtcblxuICAgIG9wdCA9IG9wdCB8fCB7fTtcblxuICAgIHRoaXMuX3N0b3JhZ2VzID0gW107XG4gICAgdGhpcy5hZGRTdG9yYWdlKG5ldyBQYWdlU2NyaXB0KCkpO1xuICAgIHRoaXMuYWRkU3RvcmFnZShuZXcgV2ViU3RvcmFnZW1hbigpKTtcbiAgICB0aGlzLmFkZFN0b3JhZ2UobmV3IERvd25sb2FkKCkpO1xuICAgIHRoaXMuYWRkU3RvcmFnZSh7aWNvbjogJ2hkZCd9KTtcbiAgICB0aGlzLmFkZFN0b3JhZ2Uoe2ljb246ICdnaXQnfSk7XG4gICAgdGhpcy5hZGRTdG9yYWdlKHtpY29uOiAnZXZlcm5vdGUnfSk7XG4gICAgdGhpcy5hZGRTdG9yYWdlKHtpY29uOiAnZHJvcGJveCd9KTtcblxuICAgIHRoaXMuc2VsZWN0ZVN0b3JhZ2UodGhpcy5fc3RvcmFnZXNbMF0pO1xufVxuXG5pbmhlcml0cyhXYXJlaG91c2VlbWFuLCBFdmVudEVtaXR0ZXIpO1xudmFyIHAgPSBXYXJlaG91c2VlbWFuLnByb3RvdHlwZTtcblxucC5hZGRTdG9yYWdlID0gZnVuY3Rpb24gKHN0b3JhZ2UpIHtcblxuICAgIHRoaXMuX3N0b3JhZ2VzLnB1c2goc3RvcmFnZSk7XG4gICAgdGhpcy5lbWl0KCdjaGFuZ2VTdG9yYWdlcycpO1xufTtcblxucC5zZWxlY3RlU3RvcmFnZSA9IGZ1bmN0aW9uIChzdG9yYWdlKSB7XG5cbiAgICB0aGlzLl9jdXJyU3RvcmFnZSA9IHN0b3JhZ2U7XG59O1xuXG5wLnNhdmUgPSBmdW5jdGlvbiAobmFtZSwgZGF0YSwgcGF0aCkge1xuXG4gICAgcmV0dXJuIHRoaXMuX2N1cnJTdG9yYWdlLnNhdmUobmFtZSwgZGF0YSwgcGF0aCk7XG59O1xuXG5wLmxvYWQgPSBmdW5jdGlvbiAobmFtZSwgcGF0aCAgICkge1xuXG4gICAgcmV0dXJuIHRoaXMuX2N1cnJTdG9yYWdlLmxvYWQobmFtZSwgcGF0aCk7XG59O1xuXG5wLm1rZGlyID0gZnVuY3Rpb24gKHBhdGgpIHtcblxuICAgIHJldHVybiB0aGlzLl9jdXJyU3RvcmFnZS5ta2RpcihwYXRoKTtcbn07XG5cbnAuZGlyID0gZnVuY3Rpb24gKHBhdGgpIHtcblxuICAgIHJldHVybiB0aGlzLl9jdXJyU3RvcmFnZS5kaXIocGF0aCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdhcmVob3VzZWVtYW47XG5cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGFtZ3VpID0gcmVxdWlyZSgnLi4vYW1ndWknKTtcblxuZnVuY3Rpb24gZGVjb3JEaWFsb2cod2htKSB7XG5cbiAgICB2YXIgZGlhbG9nLCBkZVJvb3QsIGRlTGVmdCwgZGVIZWFkLCBkZUJyZWFkY3J1bWJzLCBpbnBOYW1lLCBcbiAgICAgICAgZGVTdG9yYWdlU2VsZWN0b3IsIGRlRGlyZWN0b3J5LCBidG5OZXdGb2xkZXIsIGlzSW5pdGVkLCBkZU9wdGlvbnMsXG4gICAgICAgIHNlbGVjdGVkUGF0aCA9ICcnLCBzZWxlY3RlZE5hbWUgPSAnJywgc2VsZWN0ZWREYXRhID0gJycsXG4gICAgICAgIG9wZW5PcHRpb25zID0ge307XG5cblxuXG4gICAgd2htLnNob3dTYXZlRGlhbG9nID0gZnVuY3Rpb24ob3B0KSB7XG5cbiAgICAgICAgaW5pdCgpO1xuXG4gICAgICAgIG9wZW5PcHRpb25zID0gb3B0O1xuXG4gICAgICAgIHNlbGVjdGVkTmFtZSA9IG9wdC5uYW1lIHx8ICcnO1xuICAgICAgICBzZWxlY3RlZERhdGEgPSBvcHQuZGF0YSB8fCAnJztcbiAgICAgICAgc2VsZWN0ZWRQYXRoID0gb3B0LnBhdGggfHwgJyc7XG5cbiAgICAgICAgZGVCcmVhZGNydW1icy5yZWZyZXNoKCk7XG4gICAgICAgIGRlRGlyZWN0b3J5LnJlZnJlc2goKTtcbiAgICAgICAgZGVTdG9yYWdlU2VsZWN0b3IucmVmcmVzaCgpO1xuICAgICAgICBpbnBOYW1lLnJlZnJlc2goKTtcblxuICAgICAgICBpbnBOYW1lLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXG4gICAgICAgIGRpYWxvZy5zZXRUaXRsZSgnU2F2ZScpO1xuICAgICAgICBkaWFsb2cuc2V0QnV0dG9ucyhbJ3NhdmUnLCAnY2xvc2UnXSk7XG4gICAgICAgIHJlZnJlc2goKTtcbiAgICAgICAgZGlhbG9nLnNob3dNb2RhbCgpO1xuICAgIH07XG5cbiAgICB3aG0uc2hvd09wZW5EaWFsb2cgPSBmdW5jdGlvbihuYW1lLCBwYXRoKSB7XG5cbiAgICAgICAgaW5pdCgpO1xuXG4gICAgICAgIG9wZW5PcHRpb25zID0gb3B0O1xuXG4gICAgICAgIHNlbGVjdGVkTmFtZSA9IG9wdC5uYW1lIHx8ICcnO1xuICAgICAgICBzZWxlY3RlZFBhdGggPSBvcHQucGF0aCB8fCAnJztcblxuICAgICAgICBkZUJyZWFkY3J1bWJzLnJlZnJlc2goKTtcbiAgICAgICAgZGVEaXJlY3RvcnkucmVmcmVzaCgpO1xuICAgICAgICBkZVN0b3JhZ2VTZWxlY3Rvci5yZWZyZXNoKCk7XG5cbiAgICAgICAgaW5wTmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG4gICAgICAgIGRpYWxvZy5zZXRUaXRsZSgnU2F2ZScpO1xuICAgICAgICBkaWFsb2cuc2V0QnV0dG9ucyhbJ29wZW4nLCAnY2xvc2UnXSk7XG4gICAgICAgIHJlZnJlc2goKTtcbiAgICAgICAgZGlhbG9nLnNob3dNb2RhbCgpO1xuICAgIH07XG5cbiAgICB3aG0uc2V0U2F2ZU90aW9ucyA9IGZ1bmN0aW9uIChvcHQpIHtcblxuICAgICAgICBkZU9wdGlvbnMuc2V0T3B0aW9ucyhvcHQpO1xuICAgIH07XG5cbiAgICB3aG0uZ2V0U2F2ZU90aW9ucyA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICByZXR1cm4gZGVPcHRpb25zLmdldE9wdGlvbnMoKTtcbiAgICB9O1xuXG4gICAgd2htLm9uKCdjaGFuZ2VTcm9yYWdlJywgcmVmcmVzaCk7XG5cbiAgICBmdW5jdGlvbiByZWZyZXNoKCkge1xuXG4gICAgICAgIHZhciBmID0gd2htLl9jdXJyU3RvcmFnZS5mZWF0dXJlcztcblxuICAgICAgICBzaG93SGlkZShkZURpcmVjdG9yeSwgZi5icm93c2UpO1xuICAgICAgICBzaG93SGlkZShkZUJyZWFkY3J1bWJzLCBmLmJyb3dzZSk7XG4gICAgICAgIHNob3dIaWRlKGJ0bk5ld0ZvbGRlciwgZi5ta2Rpcik7XG5cbiAgICAgICAgZnVuY3Rpb24gc2hvd0hpZGUoZGUsIHNob3cpIHtcblxuICAgICAgICAgICAgZGUuc3R5bGUuZGlzcGxheSA9IHNob3cgPyAnYmxvY2snIHx8IGRlLmJhc2VEaXNwbGF5IDogJ2hpZGRlbidcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluaXQgKCkge1xuXG4gICAgICAgIGlmIChpc0luaXRlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlzSW5pdGVkID0gdHJ1ZTtcblxuICAgICAgICBjcmVhdGVEaWFsb2coKTtcbiAgICAgICAgY3JlYXRlU3RvcmFnZVNlbGVjdG9yKCk7XG4gICAgICAgIGNyZWF0ZUJyZWFkY3J1bWJzKCk7XG4gICAgICAgIGNyZWF0ZUJ0bk5ld0ZvbGRlcigpO1xuICAgICAgICBjcmVhdGVCdG5TZXR0aW5ncygpXG4gICAgICAgIGNyZWF0ZU5hbWVJbnB1dCgpO1xuICAgICAgICBjcmVhdGVEaXJlY3RvcnkoKTtcbiAgICAgICAgY3JlYXRlT3B0aW9ucygpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uU2F2ZSgpIHtcblxuICAgICAgICB3aG0uc2F2ZShzZWxlY3RlZE5hbWUuIHNlbGVjdGVkRGF0YSwgc2VsZWN0ZWRQYXRoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbk9wZW4oKSB7XG5cbiAgICAgICAgd2htLm9wZW4oc2VsZWN0ZWROYW1lLCBzZWxlY3RlZFBhdGgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZURpYWxvZyAoKSB7XG5cbiAgICAgICAgZGVSb290ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRlUm9vdC5zdHlsZS53aWR0aCA9ICc3MDBweCc7XG4gICAgICAgIGRlUm9vdC5zdHlsZS5oZWlnaHQgPSAnNDAwcHgnO1xuICAgICAgICBkZVJvb3Quc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcblxuICAgICAgICBkZUxlZnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGVMZWZ0LnN0eWxlLmhlaWdodCA9ICcxMDAlJztcbiAgICAgICAgZGVMZWZ0LnN0eWxlLmZsZXggPSAnMSc7XG4gICAgICAgIGRlTGVmdC5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xuICAgICAgICBkZUxlZnQuc3R5bGUuZmxleERpcmVjdGlvbiA9ICdjb2x1bW4nO1xuICAgICAgICBkZVJvb3QuYXBwZW5kQ2hpbGQoZGVMZWZ0KTtcblxuICAgICAgICBkZUhlYWQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGVIZWFkLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgICAgICBkZUhlYWQuc3R5bGUuaGVpZ2h0ID0gJzIxcHgnO1xuICAgICAgICBkZUhlYWQuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcbiAgICAgICAgZGVMZWZ0LmFwcGVuZENoaWxkKGRlSGVhZCk7XG5cbiAgICAgICAgZGlhbG9nID0gYW1ndWkuY3JlYXRlRGlhbG9nKHtcbiAgICAgICAgICAgIGNvbnRlbnQ6IGRlUm9vdCxcbiAgICAgICAgICAgIHBhcmVudDogYW0uZGVEaWFsb2dDb250XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRpYWxvZy5hZGRFdmVudExpc3RlbmVyKCdjbGlja19zYXZlJywgb25TYXZlKTtcbiAgICAgICAgZGlhbG9nLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrX29wZW4nLCBvbk9wZW4pO1xuICAgIH1cblxuXG5cblxuXG5cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUJyZWFkY3J1bWJzKCkge1xuXG4gICAgICAgIGRlQnJlYWRjcnVtYnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGVCcmVhZGNydW1icy5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jayc7XG4gICAgICAgIGRlQnJlYWRjcnVtYnMuc3R5bGUuZmxleCA9ICcxJztcbiAgICAgICAgZGVIZWFkLmFwcGVuZENoaWxkKGRlQnJlYWRjcnVtYnMpO1xuXG4gICAgICAgIGRlQnJlYWRjcnVtYnMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmNyYW1iVmFsdWUpIHtcblxuICAgICAgICAgICAgICAgIHdobS5jZCh0aGlzLmNyYW1iVmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBkZUJyZWFkY3J1bWJzLnJlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciBjcnVtYnMgPSBzZWxlY3RlZFBhdGguc3BsaXQoJy8nKSxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9ICcnO1xuXG4gICAgICAgICAgICBkZUJyZWFkY3J1bWJzLmlubmVySFRNTCA9ICcnO1xuXG4gICAgICAgICAgICBjcnVtYnMuZm9yRWFjaChmdW5jdGlvbiAoY3J1bWJOYW1lKSB7XG5cbiAgICAgICAgICAgICAgICB2YWx1ZSArPSBjcnVtYk5hbWUgKyAnLyc7XG4gICAgICAgICAgICAgICAgY3JlYXRlQ3J1bWIoY3J1bWJOYW1lKTtcbiAgICAgICAgICAgICAgICBjcmVhdGVTbGFzaCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlU2xhc2goKSB7XG5cbiAgICAgICAgICAgIHZhciBkZVNsYXNoID0gY3JlYXRlTGkoJyAvICcpO1xuICAgICAgICAgICAgZGVTbGFzaC5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xuXG4gICAgICAgICAgICByZXR1cm4gZGVTbGFzaDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZUNydW1iKGNvbnRlbnQsIHZhbHVlKSB7XG5cbiAgICAgICAgICAgIHZhciBkZUNocnVtYiA9IGNyZWF0ZUxpKGNvbnRlbnQpO1xuICAgICAgICAgICAgZGVDaHJ1bWIuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcbiAgICAgICAgICAgIGRlQ2hydW1iLmNydW1iVmFsdWUgPSB2YWx1ZTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlQ2hydW1iO1xuICAgICAgICB9XG4gIFxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVMaShjb250ZW50KSB7XG5cbiAgICAgICAgICAgIHZhciBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgIGxpLnRleHRDb250ZW50ID0gY29udGVudDtcblxuICAgICAgICAgICAgZGVCcmVhZGNydW1icy5hcHBlbmRDaGlsZChsaSk7XG5cbiAgICAgICAgICAgIHJldHVybiBsaTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbiAgICBmdW5jdGlvbiBjcmVhdGVCdG5TZXR0aW5ncygpIHtcblxuICAgICAgICBidG5OZXdGb2xkZXIgPSBhbWd1aS5jcmVhdGVJY29uQnRuKHtcbiAgICAgICAgICAgIHBhcmVudDogZGVIZWFkLFxuICAgICAgICAgICAgaWNvbjogJ3dyZW5jaCcsXG4gICAgICAgICAgICB3aWR0aDogMjEsXG4gICAgICAgICAgICBvbkNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZGVPcHRpb25zLnRvZ2dsZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cblxuXG4gICAgZnVuY3Rpb24gY3JlYXRlQnRuTmV3Rm9sZGVyKCkge1xuXG4gICAgICAgIGJ0bk5ld0ZvbGRlciA9IGFtZ3VpLmNyZWF0ZUljb25CdG4oe1xuICAgICAgICAgICAgcGFyZW50OiBkZUhlYWQsXG4gICAgICAgICAgICBpY29uOiAnZm9sZGVyLWFkZCcsXG4gICAgICAgICAgICB3aWR0aDogMjFcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlTmFtZUlucHV0KCkge1xuXG4gICAgICAgIGlucE5hbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICBpbnBOYW1lLnR5cGUgPSAndGV4dCc7XG4gICAgICAgIGlucE5hbWUuc3R5bGUud2lkdGggPSAnMTAwJSc7XG4gICAgICAgIGlucE5hbWUuc3R5bGUuaGVpZ2h0ID0gJzIxcHgnO1xuICAgICAgICBpbnBOYW1lLnN0eWxlLmJhY2tncm91bmQgPSAnbm9uZSc7XG4gICAgICAgIGlucE5hbWUuc3R5bGUuYm9yZGVyID0gJ25vbmUnO1xuICAgICAgICBpbnBOYW1lLnN0eWxlLmNvbG9yID0gYW1ndWkuY29sb3IudGV4dDtcbiAgICAgICAgaW5wTmFtZS5zdHlsZS5mb250U2l6ZSA9IGFtZ3VpLkZPTlRfU0laRTtcbiAgICAgICAgaW5wTmFtZS5zdHlsZS5mb250RmFtaWx5ID0gYW1ndWkuRk9OVF9GQU1JTFk7XG4gICAgICAgIGlucE5hbWUucGxhY2Vob2xkZXIgPSAnRmlsZSBuYW1lJztcbiAgICAgICAgZGVMZWZ0LmFwcGVuZENoaWxkKGlucE5hbWUpO1xuXG4gICAgICAgIGlucE5hbWUuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICBzZWxlY3RlZE5hbWUgPSBpbnBOYW1lLnZhbHVlO1xuICAgICAgICB9KTtcblxuICAgICAgICBpbnBOYW1lLnJlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIGlmIChpbnBOYW1lLnZhbHVlICE9PSBzZWxlY3RlZE5hbWUpIHtcblxuICAgICAgICAgICAgICAgIGlucE5hbWUudmFsdWUgPSBzZWxlY3RlZE5hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZURpcmVjdG9yeSgpIHtcblxuICAgICAgICBkZURpcmVjdG9yeSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBkZURpcmVjdG9yeS5zdHlsZS5saXN0U3R5bGUgPSAnbm9uZSc7XG4gICAgICAgIGRlRGlyZWN0b3J5LnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJztcbiAgICAgICAgZGVEaXJlY3Rvcnkuc3R5bGUud2lkdGggPSAnMTAwJSc7XG4gICAgICAgIGRlRGlyZWN0b3J5LnN0eWxlLmZsZXggPSAnMSc7XG4gICAgICAgIGRlTGVmdC5hcHBlbmRDaGlsZChkZURpcmVjdG9yeSk7XG5cbiAgICAgICAgZGVEaXJlY3RvcnkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbkNsaWNrKTtcbiAgICAgICAgZGVEaXJlY3RvcnkuYWRkRXZlbnRMaXN0ZW5lcignZGJsY2xpY2snLCBvbkNsaWNrKTtcblxuICAgICAgICBmdW5jdGlvbiBvbkNsaWNrKGUpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHRoaXMuX3ZhbHVlKSB7XG5cbiAgICAgICAgICAgICAgICBzZWxlY3RlZE5hbWUgPSB0aGlzLl92YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGUudHlwZSA9PT0gJ2RibGNsaWNrJykge1xuXG4gICAgICAgICAgICAgICAgd2htLm9wZW4oc2VsZWN0ZWRQYXRoICsgc2VsZWN0ZWROYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGRlRGlyZWN0b3J5LnJlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG5cblxuICAgICAgICB9O1xuICBcbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlSXRlbShuYW1lLCB0eXBlKSB7XG5cbiAgICAgICAgICAgIHZhciBkZUl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYW1ndWkuY3JlYXRlSWNvbih7XG4gICAgICAgICAgICAgICAgaWNvbjogdHlwZSA9PT0gJ2ZvbGRlcicgPyAnZm9sZGVyLWVtcHR5JyA6ICdkb2MnLFxuICAgICAgICAgICAgICAgIHBhcmVudDogZGVJdGVtLFxuICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmFyIGRlTmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgIGRlTmFtZS50ZXh0Q29udGVudCA9IG5hbWU7XG4gICAgICAgICAgICBkZUl0ZW0uYXBwZW5kQ2hpbGQoZGVOYW1lKTtcblxuICAgICAgICAgICAgZGVEaXJlY3RvcnkuYXBwZW5kQ2hpbGQoZGVJdGVtKTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlSXRlbTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZVN0b3JhZ2VTZWxlY3RvcigpIHtcblxuICAgICAgICB2YXIgYnRuU2l6ZSA9IDUyO1xuXG4gICAgICAgIGRlU3RvcmFnZVNlbGVjdG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRlU3RvcmFnZVNlbGVjdG9yLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJztcbiAgICAgICAgZGVTdG9yYWdlU2VsZWN0b3Iuc3R5bGUud2lkdGggPSBidG5TaXplICsgJ3B4JztcbiAgICAgICAgZGVTdG9yYWdlU2VsZWN0b3Iuc3R5bGUuaGVpZ2h0ID0gJzEwMCUnO1xuICAgICAgICBkZVJvb3QuaW5zZXJ0QmVmb3JlKGRlU3RvcmFnZVNlbGVjdG9yLCBkZUxlZnQpO1xuXG4gICAgICAgIGRlU3RvcmFnZVNlbGVjdG9yLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5fc3RvcmFnZUlkeCkge1xuXG4gICAgICAgICAgICAgICAgd2htLnNlbGVjdFN0b3JhZ2Uod2htLl9zdG9yYWdlc1t0aGlzLl9zdG9yYWdlSWR4XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRlU3RvcmFnZVNlbGVjdG9yLnJlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIGRlU3RvcmFnZVNlbGVjdG9yLmlubmVySFRNTCA9ICcnO1xuXG4gICAgICAgICAgICB3aG0uX3N0b3JhZ2VzLmZvckVhY2goZnVuY3Rpb24gKHN0b3JhZ2UsIGlkeCkge1xuXG4gICAgICAgICAgICAgICAgY3JlYXRlSXRlbShzdG9yYWdlLmljb24sIGlkeCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZUl0ZW0oaWNvbiwgdmFsdWUpIHtcblxuICAgICAgICAgICAgdmFyIGRlSXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBkZUl0ZW0gPSBhbWd1aS5jcmVhdGVJY29uQnRuKHtcbiAgICAgICAgICAgICAgICBpY29uOiBpY29uLFxuICAgICAgICAgICAgICAgIHBhcmVudDogZGVTdG9yYWdlU2VsZWN0b3IsXG4gICAgICAgICAgICAgICAgd2lkdGg6IGJ0blNpemUsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBidG5TaXplXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZGVJdGVtLl9zdG9yYWdlSWR4ID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVPcHRpb25zKCkge1xuXG4gICAgICAgIHZhciBpc09wZW5lZCA9IGZhbHNlO1xuXG4gICAgICAgIGRlT3B0aW9ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBkZU9wdGlvbnMuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgZGVPcHRpb25zLnN0eWxlLndpZHRoID0gJzEzOHB4JztcbiAgICAgICAgZGVPcHRpb25zLnN0eWxlLmhlaWdodCA9ICcxMDAlJztcbiAgICAgICAgZGVSb290LmFwcGVuZENoaWxkKGRlT3B0aW9ucyk7XG5cbiAgICAgICAgdmFyIGNoZWNrU2F2ZSA9IGNyZWF0ZUNoZWNrYm94KCdpbmNsdWRlIHNhdmUnKTtcbiAgICAgICAgdmFyIGNoZWNrTWluaWZ5ID0gY3JlYXRlQ2hlY2tib3goJ21pbmlmeScpO1xuICAgICAgICB2YXIgY2hlY2tBdXRvID0gY3JlYXRlQ2hlY2tib3goJ2F1dG8gcGxheScpO1xuXG4gICAgICAgIGRlT3B0aW9ucy5nZXRPcHRpb25zID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGluY2x1ZGVTYXZlOiBjaGVja1NhdmUuY2hlY2tlZCxcbiAgICAgICAgICAgICAgICBtaW5pZnk6IGNoZWNrTWluaWZ5LmNoZWNrZWQsXG4gICAgICAgICAgICAgICAgYXV0b1BsYXk6IGNoZWNrQXV0by5jaGVja2VkXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgZGVPcHRpb25zLnNldE9wdGlvbnMgPSBmdW5jdGlvbiAob3B0KSB7XG5cbiAgICAgICAgICAgIGNoZWNrU2F2ZS5jaGVja2VkID0gb3RwLmluY2x1ZGVTYXZlO1xuICAgICAgICAgICAgY2hlY2tNaW5pZnkuY2hlY2tlZCA9IG90cC5taW5pZnk7XG4gICAgICAgICAgICBjaGVja0F1dG8uY2hlY2tlZCA9IG90cC5hdXRvUGxheTtcbiAgICAgICAgfTtcblxuICAgICAgICBkZU9wdGlvbnMudG9nZ2xlID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICBpc09wZW5lZCA9ICFpc09wZW5lZDtcblxuICAgICAgICAgICAgZGVPcHRpb25zLnN0eWxlLmRpc3BsYXkgPSBpc09wZW5lZCA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVDaGVja2JveChuYW1lKSB7XG5cbiAgICAgICAgICAgIHZhciBkZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgZGVPcHRpb25zLmFwcGVuZENoaWxkKGRlKTtcblxuICAgICAgICAgICAgdmFyIGNiID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgICAgIGNiLnR5cGUgPSAnY2hlY2tib3gnO1xuICAgICAgICAgICAgZGUuYXBwZW5kQ2hpbGQoY2IpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgICAgICAgICAgbGFiZWwuc3R5bGUuY29sb3IgPSBhbWd1aS5jb2xvci50ZXh0O1xuICAgICAgICAgICAgbGFiZWwudGV4dENvbnRlbnQgPSBuYW1lO1xuICAgICAgICAgICAgZGUuYXBwZW5kQ2hpbGQobGFiZWwpO1xuXG4gICAgICAgICAgICByZXR1cm4gY2I7XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBkZWNvckRpYWxvZztcblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcblxudmFyIEZPTERFUlMgPSAnPGZvbGRlcnM+JztcblxuZnVuY3Rpb24gUGFnZVNjcmlwdChvcHQpIHtcblxuICAgIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gICAgb3B0ID0gb3B0IHx8IHt9O1xuXG4gICAgdGhpcy5fcm9vdCA9IG9wdC5yb290IHx8ICdfUGFnZVNjcmlwdC8nO1xuXG4gICAgdGhpcy5pY29uID0gJ2Rvd24tY2lyY2xlZDInO1xuXG4gICAgdGhpcy5fZm9sZGVycyA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLl9yb290ICsgRk9MREVSUyk7XG4gICAgXG4gICAgdHJ5IHsgXG4gICAgICAgIHRoaXMuZm9sZGVycyA9IEpTT04ucGFyc2UodGhpcy5fZm9sZGVycyk7IFxuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLl9mb2xkZXJzID0gW107XG4gICAgfVxufVxuXG5pbmhlcml0cyhQYWdlU2NyaXB0LCBFdmVudEVtaXR0ZXIpO1xudmFyIHAgPSBQYWdlU2NyaXB0LnByb3RvdHlwZTtcblxucC5mZWF0dXJlcyA9IHtcbiAgICBzYXZlOiB0cnVlLFxufVxuXG5wLnNhdmUgPSBmdW5jdGlvbiAobmFtZSwgZGF0YSwgcGF0aCkge1xuXG4gICAgbmFtZSA9IHRoaXMuX3ZhbGlkTmFtZShuYW1lKTtcbiAgICBcbiAgICB0aGlzLm1rZGlyKHBhdGgpO1xuICAgIHRoaXMuX3NldChwYXRoICsgbmFtZSwgZGF0YSk7XG5cbiAgICByZXR1cm4gbmFtZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUGFnZVNjcmlwdDsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXI7XG52YXIgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG52YXIgRk9MREVSUyA9ICc8Zm9sZGVycz4nO1xuXG5mdW5jdGlvbiBQYWdlU2NyaXB0KG9wdCkge1xuXG4gICAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cbiAgICBvcHQgPSBvcHQgfHwge307XG5cbiAgICB0aGlzLl9yb290ID0gb3B0LnJvb3QgfHwgJ19QYWdlU2NyaXB0Lyc7XG5cbiAgICB0aGlzLmljb24gPSAnY29kZSc7XG5cbiAgICB0aGlzLl9mb2xkZXJzID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuX3Jvb3QgKyBGT0xERVJTKTtcbiAgICBcbiAgICB0cnkgeyBcbiAgICAgICAgdGhpcy5mb2xkZXJzID0gSlNPTi5wYXJzZSh0aGlzLl9mb2xkZXJzKTsgXG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuX2ZvbGRlcnMgPSBbXTtcbiAgICB9XG59XG5cbmluaGVyaXRzKFBhZ2VTY3JpcHQsIEV2ZW50RW1pdHRlcik7XG52YXIgcCA9IFBhZ2VTY3JpcHQucHJvdG90eXBlO1xuXG5wLnNhdmUgPSBmdW5jdGlvbiAobmFtZSwgZGF0YSwgcGF0aCkge1xuXG4gICAgbmFtZSA9IHRoaXMuX3ZhbGlkTmFtZShuYW1lKTtcbiAgICBcbiAgICB0aGlzLm1rZGlyKHBhdGgpO1xuICAgIHRoaXMuX3NldChwYXRoICsgbmFtZSwgZGF0YSk7XG5cbiAgICByZXR1cm4gbmFtZTtcbn07XG5cbnAub3BlbiA9IGZ1bmN0aW9uIChuYW1lKSB7XG5cbiAgICBpZiAobmFtZSBpbiBwYWdlU2NyaXB0cygpKSB7XG5cbiAgICAgICAgcmV0dXJuIHBhZ2VTY3JpcHRzKClbbmFtZV07XG4gICAgfVxufTtcblxucC5kaXIgPSBmdW5jdGlvbiAocGF0aCkge1xuXG4gICAgdmFyIHJldCA9IFtdO1xuXG4gICAgT2JqZWN0LmtleXMocGFnZVNjcmlwdHMoKSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG5cbiAgICAgICAgcmV0LnB1c2goe1xuICAgICAgICAgICAgbmFtZToga2V5LFxuICAgICAgICAgICAgdHlwZTogJ2ZpbGUnXG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIHBhZ2VTY3JpcHRzKCkge1xuXG4gICAgcmV0dXJuICh3aW5kb3cuYW0gJiYgd2luZG93LmFtLnBhZ2VTY3JpcHRzKSB8fCBbXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQYWdlU2NyaXB0OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbnZhciBGT0xERVJTID0gJzxmb2xkZXJzPic7XG5cbmZ1bmN0aW9uIFdlYlN0b3JhZ2VtYW4ob3B0KSB7XG5cbiAgICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblxuICAgIG9wdCA9IG9wdCB8fCB7fTtcblxuICAgIHRoaXMuX3Jvb3QgPSBvcHQucm9vdCB8fCAnX3dlYnN0b3JhZ2VtYW4vJztcblxuICAgIHRoaXMuaWNvbiA9ICdidWxsc2V5ZSc7XG5cbiAgICB0aGlzLl9mb2xkZXJzID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuX3Jvb3QgKyBGT0xERVJTKTtcbiAgICBcbiAgICB0cnkgeyBcbiAgICAgICAgdGhpcy5mb2xkZXJzID0gSlNPTi5wYXJzZSh0aGlzLl9mb2xkZXJzKTsgXG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIHRoaXMuX2ZvbGRlcnMgPSBbXTtcbiAgICB9XG59XG5cbmluaGVyaXRzKFdlYlN0b3JhZ2VtYW4sIEV2ZW50RW1pdHRlcik7XG52YXIgcCA9IFdlYlN0b3JhZ2VtYW4ucHJvdG90eXBlO1xuXG5wLnNhdmUgPSBmdW5jdGlvbiAobmFtZSwgZGF0YSwgcGF0aCkge1xuXG4gICAgbmFtZSA9IHRoaXMuX3ZhbGlkTmFtZShuYW1lKTtcbiAgICBcbiAgICB0aGlzLm1rZGlyKHBhdGgpO1xuICAgIHRoaXMuX3NldChwYXRoICsgbmFtZSwgZGF0YSk7XG5cbiAgICByZXR1cm4gbmFtZTtcbn07XG5cbnAubG9hZCA9IGZ1bmN0aW9uIChuYW1lLCBwYXRoKSB7XG5cbiAgICBuYW1lID0gdGhpcy5fdmFsaWROYW1lKG5hbWUpO1xuICAgIHBhdGggPSB0aGlzLl92YWxpZFBhdGgocGF0aCk7XG4gICAgXG4gICAgcmV0dXJuIHRoaXMuX2dldChwYXRoICsgbmFtZSk7XG59O1xuXG5wLm1rZGlyID0gZnVuY3Rpb24gKHBhdGgpIHtcblxuICAgIHBhdGggPSB0aGlzLl92YWxpZFBhdGgocGF0aCk7XG4gICAgcGF0aCA9IHBhdGguc3BsaXQoJy8nKTtcblxuICAgIHZhciBmb2xkZXJQYXRoID0gJyc7XG5cbiAgICBwYXRoLmZvckVhY2goZnVuY3Rpb24gKGZvbGRlcikge1xuXG4gICAgICAgIGlmIChmb2xkZXIgPT09ICcnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmb2xkZXJQYXRoICs9IGZvbGRlciArICcvJztcblxuICAgICAgICBpZiAodGhpcy5fZm9sZGVycy5pbmRleE9mKGZvbGRlclBhdGgpICE9PSAtMSkge1xuXG4gICAgICAgICAgICB0aGlzLl9mb2xkZXJzLnB1c2goZm9sZGVyUGF0aCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbnAuZGlyID0gZnVuY3Rpb24gKHBhdGgpIHtcblxuICAgIHBhdGggPSB0aGlzLl9yb290ICsgdGhpcy5fdmFsaWRQYXRoKHBhdGgpO1xuXG4gICAgdmFyIHJldCA9IFtdO1xuXG4gICAgT2JqZWN0LmtleXMod2luZG93LmxvY2FsU3RvcmFnZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG5cbiAgICAgICAgdGVzdEtleShrZXksICdmaWxlJyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9mb2xkZXJzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuXG4gICAgICAgIHRlc3RLZXkoa2V5LCAnZm9sZGVyJyk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmV0O1xuXG4gICAgZnVuY3Rpb24gdGVzdEtleShrZXksIHR5cGUpIHtcblxuICAgICAgICBpZiAoa2V5LmluZGV4T2YocGF0aCkgPT09IDApIHtcblxuICAgICAgICAgICAga2V5ID0ga2V5LnN1YnN0cihwYXRoLmxlbmd0aCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChrZXkuaW5kZXhPZignLycpID09PSAtMSkge1xuXG4gICAgICAgICAgICAgICAgcmV0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBrZXksXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHR5cGVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbnAuX2FkZEZvbGRlciA9IGZ1bmN0aW9uKHBhdGgpIHtcblxuICAgIGlmICh0aGlzLl9mb2xkZXJzLmluZGV4T2YocGF0aCkgIT09IC0xKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9mb2xkZXJzLnB1c2gocGF0aCk7XG5cbn07XG5cbnAuX3NldCA9IGZ1bmN0aW9uKHBhdGgsIGRhdGEpIHtcblxuICAgIHJldHVybiB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5fcm9vdCArIHBhdGgsIGRhdGEpO1xufTtcblxucC5fZ2V0ID0gZnVuY3Rpb24ocGF0aCkge1xuXG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLl9yb290ICsgcGF0aCk7XG59O1xuXG5wLl92YWxpZFBhdGggPSBmdW5jdGlvbihwYXRoKSB7XG5cbiAgICBpZiAocGF0aC5jaGFyQXQoMCkgPT09ICcvJykge1xuICAgICAgICBwYXRoID0gcGF0aC5zdWJzdHIoMSk7XG4gICAgfVxuXG4gICAgaWYgKHBhdGguY2hhckF0KHBhdGgubGVuZ3RoLTEpICE9PSAnLycpIHtcbiAgICAgICAgcGF0aCArPSAnLyc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhdGg7XG59O1xuXG5wLl92YWxpZE5hbWUgPSBmdW5jdGlvbihuYW1lKSB7XG5cbiAgICByZXR1cm4gbmFtZS5yZXBsYWNlKC88fFxcLy9nLCAnXycpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBXZWJTdG9yYWdlbWFuOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIFBhbmVsID0gcmVxdWlyZSgnLi9QYW5lbCcpO1xuXG5mdW5jdGlvbiBDb250YWluZXIob3B0KSB7XG5cbiAgICB0aGlzLl9jcmVhdGVEb21FbGVtKCk7XG5cbiAgICB0aGlzLmRpcmVjdGlvbiA9IG9wdC5kaXJlY3Rpb24gfHwgJ3Jvdyc7XG4gICAgdGhpcy5fY2hpbGRyZW4gPSBbXTtcblxuICAgIHRoaXMuc2l6ZSA9IG9wdC5zaXplO1xuICAgIHRoaXMuc2NhbGVNb2RlID0gb3B0LnNjYWxlTW9kZTtcblxuICAgIG9wdC5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChjRGF0YSkge1xuXG4gICAgICAgIGlmIChjRGF0YS50eXBlID09PSAnY29udGFpbmVyJykge1xuXG4gICAgICAgICAgICB0aGlzLmFkZENoaWxkKG5ldyBDb250YWluZXIoY0RhdGEpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjRGF0YS50eXBlID09PSAncGFuZWwnKSB7XG5cbiAgICAgICAgICAgIHRoaXMuYWRkQ2hpbGQobmV3IFBhbmVsKGNEYXRhKSk7XG4gICAgICAgIH1cbiAgICB9LCB0aGlzKTtcblxuICAgIHRoaXMuX3NjYWxlQ2hpbGRyZW4oKTtcbn1cblxudmFyIHAgPSBDb250YWluZXIucHJvdG90eXBlO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkocCwgJ2RpcmVjdGlvbicsIHtcblxuICAgIHNldDogZnVuY3Rpb24gKHYpIHtcblxuICAgICAgICB0aGlzLl9kaXJlY3Rpb24gPSB2O1xuICAgICAgICB0aGlzLmRvbUVsZW0uc3R5bGUuZmxleERpcmVjdGlvbiA9IHRoaXMuX2RpcmVjdGlvbjtcbiAgICB9LFxuXG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2RpcmVjdGlvbjtcbiAgICB9XG59KTtcblxucC5hZGRDaGlsZCA9IGZ1bmN0aW9uIChjaGlsZCkge1xuXG4gICAgdGhpcy5fY2hpbGRyZW4ucHVzaChjaGlsZCk7XG4gICAgdGhpcy5kb21FbGVtLmFwcGVuZENoaWxkKGNoaWxkLmRvbUVsZW0pO1xuXG4gICAgdGhpcy5fc2NhbGVDaGlsZHJlbigpO1xufTtcblxuXG5wLmZpbmRUYWIgPSBmdW5jdGlvbiAobmFtZSkge1xuXG4gICAgdmFyIHRhYjtcblxuICAgIHRoaXMuX2NoaWxkcmVuLnNvbWUoZnVuY3Rpb24gKGNoaWxkKSB7XG5cbiAgICAgICAgdGFiID0gY2hpbGQuZmluZFRhYihuYW1lKTtcbiAgICAgICAgcmV0dXJuIHRhYjtcbiAgICB9KTtcblxuICAgIHJldHVybiB0YWI7XG59O1xuXG5wLl9zY2FsZUNoaWxkcmVuID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdGhpcy5fY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAoY2hpbGQpIHtcblxuICAgICAgICB2YXIgZmxleCA9ICcnLCB3aWR0aCA9ICcnLCBoZWlnaHQgPSAnJzsgXG5cbiAgICAgICAgaWYgKGNoaWxkLnNjYWxlTW9kZSA9PT0gJ2ZpeCcpIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMuX2RpcmVjdGlvbi5pbmRleE9mKCdyb3cnKSA9PT0gMCkge1xuXG4gICAgICAgICAgICAgICAgd2lkdGggPSBjaGlsZC5zaXplICsgJ3B4JzsgXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGhlaWdodCA9IGNoaWxkLnNpemUgKyAncHgnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNoaWxkLnNjYWxlTW9kZSA9PT0gJ2ZsZXgnKSB7XG5cbiAgICAgICAgICAgIGZsZXggPSBjaGlsZC5zaXplO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hpbGQuZG9tRWxlbS5zdHlsZS53aWR0aCA9IHdpZHRoO1xuICAgICAgICBjaGlsZC5kb21FbGVtLnN0eWxlLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgY2hpbGQuZG9tRWxlbS5zdHlsZS5mbGV4ID0gZmxleDtcbiAgICB9LCB0aGlzKTtcbn07XG5cbnAuX2NyZWF0ZURvbUVsZW0gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB0aGlzLmRvbUVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLmRvbUVsZW0uc3R5bGUud2lkdGggPSAnMTAwJSc7XG4gICAgdGhpcy5kb21FbGVtLnN0eWxlLmhlaWdodCA9ICcxMDAlJztcbiAgICB0aGlzLmRvbUVsZW0uc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcbiAgICB0aGlzLmRvbUVsZW0uc3R5bGUuYWxpZ25JdGVtcyA9ICdzdHJldGNoJztcbiAgICAvLyB0aGlzLmRvbUVsZW0uc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29udGFpbmVyOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIFRhYiA9IHJlcXVpcmUoJy4vVGFiJyk7XG5cbmZ1bmN0aW9uIFBhbmVsKG9wdCkge1xuXG4gICAgdGhpcy5fbW9kZSA9IG9wdC5tb2RlIHx8ICd0YWInO1xuICAgIHRoaXMuX3RhYnMgPSBbXTtcbiAgICB0aGlzLl9zaG93SGVhZCA9ICdzaG93SGVhZCcgaW4gb3B0ID8gb3B0LnNob3dIZWFkIDogdHJ1ZTtcbiAgICBcbiAgICB0aGlzLnNpemUgPSBvcHQuc2l6ZTtcbiAgICB0aGlzLnNjYWxlTW9kZSA9IG9wdC5zY2FsZU1vZGU7XG5cbiAgICB0aGlzLl9jcmVhdGVEb21FbGVtKCk7XG4gICAgdGhpcy5fY3JlYXRlVGFiQmFzZSgpO1xuXG4gICAgaWYgKG9wdC50YWJzKSB7XG4gICAgICAgIG9wdC50YWJzLmZvckVhY2godGhpcy5hZGRUYWIsIHRoaXMpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5fdGFicy5zb21lKGZ1bmN0aW9uICh0YWIpIHtyZXR1cm4gdGFiLnNlbGVjdGVkfSkgJiZcbiAgICAgICAgdGhpcy5fdGFicy5sZW5ndGgpXG4gICAge1xuICAgICAgICB0aGlzLl90YWJzWzBdLnNlbGVjdCgpO1xuICAgIH1cbn1cblxudmFyIHAgPSBQYW5lbC5wcm90b3R5cGU7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShwLCAnbW9kZScsIHtcblxuICAgIHNldDogZnVuY3Rpb24gKHYpIHtcblxuICAgICAgICB0aGlzLl9tb2RlID0gdjtcbiAgICAgICAgdGhpcy5kb21FbGVtLnN0eWxlLnBvaW50ZXJFdmVudHMgPSB0aGlzLl9tb2RlID09PSAnZW1wdHknID8gJ25vbmUnIDogJ2F1dG8nO1xuICAgICAgICB0aGlzLl9kZVRhYkJhc2UuZGlzcGxheSA9IHRoaXMuX21vZGUgPT09ICd0YWInID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICB9LFxuXG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZGU7XG4gICAgfVxufSk7XG5cbnAuYWRkVGFiID0gZnVuY3Rpb24gKHREYXRhKSB7XG5cbiAgICB2YXIgdGFiID0gbmV3IFRhYih0RGF0YSk7XG4gICAgdGhpcy5fZGVUYWJIZWFkLmFwcGVuZENoaWxkKHRhYi5kZUVhcik7XG4gICAgdGhpcy5fZGVUYWJDb250ZW50LmFwcGVuZENoaWxkKHRhYi5kb21FbGVtKTtcbiAgICB0aGlzLl90YWJzLnB1c2godGFiKTtcbn07XG5cblxucC5maW5kVGFiID0gZnVuY3Rpb24gKG5hbWUpIHtcblxuICAgIHZhciB0YWI7XG5cbiAgICB0aGlzLl90YWJzLnNvbWUoZnVuY3Rpb24gKHQpIHtcblxuICAgICAgICBpZiAodC5uYW1lID09PSBuYW1lKSB7XG5cbiAgICAgICAgICAgIHJldHVybiAodGFiID0gdCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0YWI7XG59O1xuXG5wLnNob3dUYWIgPSBmdW5jdGlvbiAodGFiKSB7XG5cbiAgICB0aGlzLl90YWJzLmZvckVhY2goZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgXG4gICAgICAgIGlmICh0YWIgPT09IHQpIHtcbiAgICAgICAgICAgIHQuc2VsZWN0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0LmRlc2VsZWN0KCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbnAuX2NyZWF0ZURvbUVsZW0gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB0aGlzLmRvbUVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLmRvbUVsZW0uc3R5bGUud2lkdGggPSAnMTAwJSc7XG4gICAgdGhpcy5kb21FbGVtLnN0eWxlLmhlaWdodCA9ICcxMDAlJztcbn07XG5cbnAuX2NyZWF0ZVRhYkJhc2UgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB0aGlzLl9kZVRhYkJhc2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLl9kZVRhYkJhc2Uuc3R5bGUud2lkdGggPSAnMTAwJSc7XG4gICAgdGhpcy5fZGVUYWJCYXNlLnN0eWxlLmhlaWdodCA9ICcxMDAlJztcbiAgICB0aGlzLl9kZVRhYkJhc2Uuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcbiAgICB0aGlzLl9kZVRhYkJhc2Uuc3R5bGUuZmxleERpcmVjdGlvbiA9ICdjb2x1bW4nO1xuICAgIHRoaXMuZG9tRWxlbS5hcHBlbmRDaGlsZCh0aGlzLl9kZVRhYkJhc2UpO1xuXG4gICAgdGhpcy5fZGVUYWJIZWFkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5fZGVUYWJIZWFkLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgIHRoaXMuX2RlVGFiSGVhZC5zdHlsZS5oZWlnaHQgPSAnMjNweCc7XG4gICAgdGhpcy5fZGVUYWJIZWFkLnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XG4gICAgdGhpcy5fZGVUYWJIZWFkLnN0eWxlLmFsaWduSXRlbXMgPSAnc3RyZXRjaCc7XG4gICAgaWYgKHRoaXMuX3Nob3dIZWFkKSB7XG4gICAgICAgIHRoaXMuX2RlVGFiQmFzZS5hcHBlbmRDaGlsZCh0aGlzLl9kZVRhYkhlYWQpO1xuICAgIH1cblxuICAgIHRoaXMuX2RlVGFiQ29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuX2RlVGFiQ29udGVudC5zdHlsZS53aWR0aCA9ICcxMDAlJztcbiAgICB0aGlzLl9kZVRhYkNvbnRlbnQuc3R5bGUuZmxleCA9IDE7XG4gICAgdGhpcy5fZGVUYWJCYXNlLmFwcGVuZENoaWxkKHRoaXMuX2RlVGFiQ29udGVudCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBhbmVsOyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gVGFiKG9wdCkge1xuXG4gICAgdGhpcy5uYW1lID0gb3B0Lm5hbWU7XG4gICAgdGhpcy5zZWxlY3RlZCA9IG9wdC5zZWxlY3RlZDtcblxuICAgIHRoaXMuX2NyZWF0ZURvbUVsZW0oKTtcbiAgICB0aGlzLmRlRWFyID0gdGhpcy5fY3JlYXRlVGFiRWFyKCk7XG5cbiAgICB0aGlzW3RoaXMuc2VsZWN0ZWQgPyAnc2VsZWN0JyA6ICdkZXNlbGVjdCddKCk7XG59XG5cbnZhciBwID0gVGFiLnByb3RvdHlwZTtcblxucC5zZXRDb250ZW50ID0gZnVuY3Rpb24gKGRlQ29udGVudCkge1xuXG4gICAgdGhpcy5kb21FbGVtLmlubmVySFRNTCA9ICcnO1xuICAgIHRoaXMuZG9tRWxlbS5hcHBlbmRDaGlsZChkZUNvbnRlbnQpO1xufTtcblxucC5zZWxlY3QgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB0aGlzLmRvbUVsZW0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgdGhpcy5kZUVhci5zdHlsZS5ib3JkZXJCb3R0b21XaWR0aCA9ICcycHgnO1xufTtcblxucC5kZXNlbGVjdCA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHRoaXMuZG9tRWxlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIHRoaXMuZGVFYXIuc3R5bGUuYm9yZGVyQm90dG9tV2lkdGggPSAnMXB4Jztcbn07XG5cbnAuX2NyZWF0ZURvbUVsZW0gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB0aGlzLmRvbUVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLmRvbUVsZW0uc3R5bGUud2lkdGggPSAnMTAwJSc7XG4gICAgdGhpcy5kb21FbGVtLnN0eWxlLmhlaWdodCA9ICcxMDAlJztcbiAgICB0aGlzLmRvbUVsZW0uc3R5bGUuYmFja2dyb3VuZCA9ICdyZ2JhKDAsMCwwLDAuMyknO1xuICAgIHRoaXMuZG9tRWxlbS5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ2F1dG8nO1xufTtcblxucC5fY3JlYXRlVGFiRWFyID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGUudGV4dENvbnRlbnQgPSB0aGlzLm5hbWU7XG4gICAgZGUuc3R5bGUuZmxleCA9IDE7XG4gICAgZGUuc3R5bGUuYm94U2l6aW5nID0gJ2JvcmRlci1ib3gnO1xuICAgIGRlLnN0eWxlLmJvcmRlckJvdHRvbSA9ICdzb2xpZCAxcHggd2hpdGUnO1xuICAgIGRlLnN0eWxlLmFsaWduSXRlbXMgPSAnc3RyZXRjaCc7XG5cbiAgICByZXR1cm4gZGU7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRhYjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb250YWluZXIgPSByZXF1aXJlKCcuL0NvbnRhaW5lcicpO1xuXG5mdW5jdGlvbiBXaW5kb29tYW4oKSB7XG5cbiAgICB0aGlzLl90YWJNYXAgPSB7fTtcbiAgICB0aGlzLl93b3Jrc3BhY2VzID0ge307XG5cbiAgICB0aGlzLl9jcmVhdGVEb21FbGVtKCk7XG59XG5cbnZhciBwID0gV2luZG9vbWFuLnByb3RvdHlwZTtcblxucC5sb2FkV29ya3NwYWNlcyA9IGZ1bmN0aW9uICh3b3Jrc3BhY2VzKSB7XG5cbiAgICBPYmplY3Qua2V5cyh3b3Jrc3BhY2VzKS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG5cbiAgICAgICAgdGhpcy5fd29ya3NwYWNlc1tuYW1lXSA9IHdvcmtzcGFjZXNbbmFtZV07XG4gICAgfSwgdGhpcyk7XG59O1xuXG5wLmxvYWQgPSBmdW5jdGlvbiAobmFtZSkge1xuXG4gICAgdmFyIG1hcCA9IHRoaXMuX3dvcmtzcGFjZXNbbmFtZV07XG5cbiAgICBpZiAoIW1hcCB8fCBtYXAudHlwZSAhPT0gJ2NvbnRhaW5lcicpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ2NhblxcJ3QgbG9hZCAnICsgbWFwKTtcbiAgICB9XG5cbiAgICB0aGlzLl9yb290ID0gbmV3IENvbnRhaW5lcihtYXApO1xuICAgIFxuICAgIHRoaXMuZG9tRWxlbS5pbm5lckhUTUwgPSAnJztcbiAgICB0aGlzLmRvbUVsZW0uYXBwZW5kQ2hpbGQodGhpcy5fcm9vdC5kb21FbGVtKTtcblxuICAgIE9iamVjdC5rZXlzKHRoaXMuX3RhYk1hcCkuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuXG4gICAgICAgIHRoaXMucGxhY2VUYWIobmFtZSwgdGhpcy5fdGFiTWFwW25hbWVdKTtcbiAgICB9LCB0aGlzKTtcbn07XG5cbnAuZmluZFRhYiA9IGZ1bmN0aW9uIChuYW1lKSB7XG5cbiAgICBpZiAodGhpcy5fcm9vdCkge1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9yb290LmZpbmRUYWIobmFtZSk7XG4gICAgfVxufTtcblxucC5maWxsVGFiID0gZnVuY3Rpb24gKG5hbWUsIGNvbnRlbnQpIHtcblxuICAgIHRoaXMuX3RhYk1hcFtuYW1lXSA9IGNvbnRlbnQ7XG5cbiAgICB2YXIgdGFiID0gdGhpcy5maW5kVGFiKG5hbWUpO1xuXG4gICAgaWYgKHRhYikge1xuICAgICAgICB0YWIuc2V0Q29udGVudChjb250ZW50KTtcbiAgICB9XG59O1xuXG5wLl9jcmVhdGVEb21FbGVtID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdGhpcy5kb21FbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5kb21FbGVtLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgIHRoaXMuZG9tRWxlbS5zdHlsZS5oZWlnaHQgPSAnMTAwJSc7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdpbmRvb21hbjsiXX0=
