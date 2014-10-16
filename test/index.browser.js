(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/kory/dev/predicty/index.js":[function(require,module,exports){
var EventEmitter = require('events').EventEmitter,
    crel = require('crel'),
    DefaultStyle = require('default-style');

new DefaultStyle('.predicty{display:inline-block;position:relative;height: 25px;width:200px;}.predictyPrediction{opacity:0.2;pointer-events:none;position:absolute; top:0;left:0;right:0;bottom:0;height:0;margin:auto 0;}.predicty *{font: inherit;}.predictyInput{position:absolute;top:0;left:0;bottom:0;right:0;width:100%;}.predictySuggestion, .predictyMask{position:relative; z-index:1;vertical-align:middle; line-height:0;}.predictyMask{opacity:0;padding-right:2px;}');

function Predicty(){
    this._render();
    this._bindEvents();
    this._update();
}
Predicty.prototype = Object.create(EventEmitter.prototype);
Predicty.prototype.constructor = Predicty;
Predicty.prototype._value = '';
Predicty.prototype.value = function(value){
    if(!arguments.length){
        return this._value;
    }

    if(value == this._value){
        return;
    }

    this._value = ''+value;
    this._update();
    this.emit('value', this._value);
};
Predicty.prototype._items = [];
Predicty.prototype.items = function(items){
    if(!arguments.length){
        return this._items;
    }

    if(!Array.isArray(items)){
        return;
    }

    this._items = items;
    this._update();
};
Predicty.prototype._acceptPredition = function(){
    this.value(this._suggestion);
};
Predicty.prototype._matchItem = function(value, item){
    return value && item.toLowerCase().indexOf(value.toLowerCase()) === 0;
};
Predicty.prototype._match = function(value){
    var items = this.items();
    for(var i = 0; i < items.length; i++){
        if(this._matchItem(value, items[i])){
            return items[i];
        }
    }
};
Predicty.prototype._updateValue = function(value){
    this.inputElement.value = value;
};
Predicty.prototype._updateSuggestion = function(value, suggestion){
    this.maskElement.textContent = value;
    this.suggestionElement.textContent = suggestion;
};
Predicty.prototype._update = function(){
    var value = this.value();

    this._suggestion = this._match(value);

    this._updateValue(value);

    if(!this._suggestion){
        this._updateSuggestion(value);
        return;
    }
    this._updateSuggestion(value, this._suggestion.slice(value.length));
};
Predicty.prototype._bindEvents = function(){
    var predicty = this;

    this._inputListener = function(event){
        predicty.value(this.value);
    };

    this._tabListener = function(event){
        if(event.which === 9){
            event.preventDefault();
            predicty._acceptPredition();
        }
    };

    this.inputElement.addEventListener('keyup', this._inputListener);
    this.inputElement.addEventListener('keydown', this._tabListener);
};
Predicty.prototype._render = function(){
    this.element = crel('span', {'class':'predicty'},
        this.inputElement = crel('input', {'class':'predictyInput'}),
        this.predictionElement = crel('div', {'class':'predictyPrediction'},
            this.maskElement = crel('span', {'class':'predictyMask'}),
            this.suggestionElement = crel('span', {'class':'predictySuggestion'})
        )
    );
};
Predicty._debind = function(){
    if(this._inputListener){
        this.inputElement.removeEventListener('keyup', this._inputListener);
        this.inputElement.removeEventListener('keydown', this._tabListener);
        this._inputListener = null;
    }
};

module.exports = Predicty;
},{"crel":"/home/kory/dev/predicty/node_modules/crel/crel.js","default-style":"/home/kory/dev/predicty/node_modules/default-style/index.js","events":"/usr/lib/node_modules/watchify/node_modules/browserify/node_modules/events/events.js"}],"/home/kory/dev/predicty/node_modules/crel/crel.js":[function(require,module,exports){
//Copyright (C) 2012 Kory Nunn

//Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

//The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/*

    This code is not formatted for readability, but rather run-speed and to assist compilers.

    However, the code's intention should be transparent.

    *** IE SUPPORT ***

    If you require this library to work in IE7, add the following after declaring crel.

    var testDiv = document.createElement('div'),
        testLabel = document.createElement('label');

    testDiv.setAttribute('class', 'a');
    testDiv['className'] !== 'a' ? crel.attrMap['class'] = 'className':undefined;
    testDiv.setAttribute('name','a');
    testDiv['name'] !== 'a' ? crel.attrMap['name'] = function(element, value){
        element.id = value;
    }:undefined;


    testLabel.setAttribute('for', 'a');
    testLabel['htmlFor'] !== 'a' ? crel.attrMap['for'] = 'htmlFor':undefined;



*/

(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.crel = factory();
    }
}(this, function () {
    var fn = 'function',
        obj = 'object',
        isType = function(a, type){
            return typeof a === type;
        },
        isNode = typeof Node === fn ? function (object) {
            return object instanceof Node;
        } :
        // in IE <= 8 Node is an object, obviously..
        function(object){
            return object &&
                isType(object, obj) &&
                ('nodeType' in object) &&
                isType(object.ownerDocument,obj);
        },
        isElement = function (object) {
            return crel.isNode(object) && object.nodeType === 1;
        },
        isArray = function(a){
            return a instanceof Array;
        },
        appendChild = function(element, child) {
          if(!isNode(child)){
              child = document.createTextNode(child);
          }
          element.appendChild(child);
        };


    function crel(){
        var args = arguments, //Note: assigned to a variable to assist compilers. Saves about 40 bytes in closure compiler. Has negligable effect on performance.
            element = args[0],
            child,
            settings = args[1],
            childIndex = 2,
            argumentsLength = args.length,
            attributeMap = crel.attrMap;

        element = crel.isElement(element) ? element : document.createElement(element);
        // shortcut
        if(argumentsLength === 1){
            return element;
        }

        if(!isType(settings,obj) || crel.isNode(settings) || isArray(settings)) {
            --childIndex;
            settings = null;
        }

        // shortcut if there is only one child that is a string
        if((argumentsLength - childIndex) === 1 && isType(args[childIndex], 'string') && element.textContent !== undefined){
            element.textContent = args[childIndex];
        }else{
            for(; childIndex < argumentsLength; ++childIndex){
                child = args[childIndex];

                if(child == null){
                    continue;
                }

                if (isArray(child)) {
                  for (var i=0; i < child.length; ++i) {
                    appendChild(element, child[i]);
                  }
                } else {
                  appendChild(element, child);
                }
            }
        }

        for(var key in settings){
            if(!attributeMap[key]){
                element.setAttribute(key, settings[key]);
            }else{
                var attr = crel.attrMap[key];
                if(typeof attr === fn){
                    attr(element, settings[key]);
                }else{
                    element.setAttribute(attr, settings[key]);
                }
            }
        }

        return element;
    }

    // Used for mapping one kind of attribute to the supported version of that in bad browsers.
    // String referenced so that compilers maintain the property name.
    crel['attrMap'] = {};

    // String referenced so that compilers maintain the property name.
    crel["isElement"] = isElement;
    crel["isNode"] = isNode;

    return crel;
}));

},{}],"/home/kory/dev/predicty/node_modules/default-style/index.js":[function(require,module,exports){
var defaultStyles,
    validEnvironment;

function insertTag(){
    document.head.insertBefore(defaultStyles, document.head.childNodes[0]);
}

if(
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    typeof document.createTextNode === 'undefined'
){
    console.warn('No approprate environment, no styles will be added.');
}else{
    validEnvironment = true;

    defaultStyles = document.createElement('style');

    if(document.head){
        insertTag();
    }else{
        addEventListener('load', insertTag);
    }
}

function DefaultStyle(cssText, dontInsert){
    if(!validEnvironment){
        return this;
    }

    this._node = document.createTextNode(cssText || '');

    if(!dontInsert){
        this.insert();
    }
}
DefaultStyle.prototype.insert = function(target){
    if(!validEnvironment){
        return;
    }

    target || (target = defaultStyles);

    target.appendChild(this._node);
};
DefaultStyle.prototype.remove = function(){
    if(!validEnvironment){
        return;
    }

    var parent = this._node.parentElement;
    if(parent){
        parent.removeChild(this._node);
    }
};
DefaultStyle.prototype.css = function(cssText){
    if(!validEnvironment){
        return;
    }

    if(!arguments.length){
        return this._node.textContent;
    }

    this._node.textContent = cssText;
};

module.exports = DefaultStyle;
},{}],"/home/kory/dev/predicty/test":[function(require,module,exports){
var Predicty = require('../'),
    crel = require('crel'),
    defaultItems = [
        'bob down',
        'ben dover',
        'jill smith',
        'john smith'
    ];



var predicty = new Predicty();

predicty.items(defaultItems);
predicty.value('bo');



var itemsElement = crel('textarea');
itemsElement.value = defaultItems.join('\n');
itemsElement.addEventListener('keyup', function(){
    predicty.items(this.value.split('\n'));
});


window.addEventListener('load', function(){
    crel(document.body,
        predicty.element,
        itemsElement
    );
});
},{"../":"/home/kory/dev/predicty/index.js","crel":"/home/kory/dev/predicty/node_modules/crel/crel.js"}],"/usr/lib/node_modules/watchify/node_modules/browserify/node_modules/events/events.js":[function(require,module,exports){
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
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
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

},{}]},{},["/home/kory/dev/predicty/test"]);
