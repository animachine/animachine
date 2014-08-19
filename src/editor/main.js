'use strict';

var domready = require('domready');
var amgui = require('./amgui');
var EventEmitter = require('events').EventEmitter;
var Transhand = require('./transhand/Transhand');
var Timeline = require('./timeline/Timeline');
var Toolbar = require('./toolbar/Toolbar');
var modules = {
    css: require('./modules/css')
}



var handlerBuff = [];


var am = window.am = module.exports = _.extend(new EventEmitter(), {

    sequenceTypes: [],

    selectedElement: undefined,

    registerSequenceType: function (sequType) {

        this.sequenceTypes.push(sequType);
    }
});

am.getHandler = function () {

    if (handlerBuff.length) {

        return handlerBuff.pop();
    }
    else {
        return new Transhand();
    }
}

am.throwHandler = function (handler) {

    handlerBuff.push(handler);
} 

domready(function () {

    debugRect();

    am.domElement = createAmRoot();

    am.transhand = new Transhand();
    am.timeline = new Timeline(am);
    am.toolbar = new Toolbar();
    am.domElement.appendChild(am.toolbar.domElement);
    am.deRoot = document.body;
    am.deHandlerCont = document.body;

    am.toolbar.addIcon({icon: 'cog'});

    am.timeline.domElem.style.position = 'fixed';
    am.timeline.domElem.style.width = '100%';
    am.timeline.domElem.style.height = '230px';
    am.timeline.domElem.style.bottom = '0px';
    am.domElement.appendChild(am.timeline.domElem);

    document.body.addEventListener('click', onClickRoot);

    modules.css.init(am);
});

function debugRect() {
    var de = document.createElement('div');
    de.id = 'boxX';
    de.style.position = 'absolute';
    de.style.backgroundColor = 'blue';
    de.style.left = '55px';
    de.style.top = '55px';
    de.style.width = '55px';
    de.style.height = '55px';
    document.body.appendChild(de);
};

function onClickRoot(e) {

    var de = e.target;

    if (am.selectedElement !== de && isPickable(de)) {

        am.selectedElement = de;
        am.emit('selectDomElement', am.selectedElement);
    }
}

function isPickable(deTest) {

    var editors = [am.domElement, am.deHandlerCont];

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
    de.style.width = '100%';
    de.style.height = '100%';
    de.style.pointerEvents = 'none';
    de.style.userSelect = 'none';
    de.style.webktUserSelect = 'none';
    de.style.fontFamily = amgui.FONT_FAMILY;
    document.body.appendChild(de);
    // var sr = de.createShadowRoot();
    return de;
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