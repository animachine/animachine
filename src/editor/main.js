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

    for (var i = 0; i < 15; ++i) debugRect(i);

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
                script: am.timeline.getScript({save: true, autoPlay: true}),
                timelineSave: am.timeline.getSave()
            };
            am.storage.showSaveDialog('filename', data);
        }
    });

    am.toolbar.addIcon({
        icon: 'download-cloud',
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

function debugRect(idx) {
    var de = document.createElement('div');
    de.id = 'boxX'+idx;
    de.className = 'boxer';
    de.style.position = 'absolute';
    de.style.backgroundColor = 'blue';
    de.style.left = (Math.random()*100) + 'vw';
    de.style.top = (Math.random()*100) + 'vh';
    de.style.width = '55px';
    de.style.height = '55px';
    document.body.appendChild(de);
};

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