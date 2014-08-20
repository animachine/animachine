var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../../amgui');
var CssParameter = require('./CssParameter');
var Transhand = require('../../transhand/Transhand');

var cssSequence = {

    _instances: [],

    create: function (opt) {

        return new CssSequence(opt);
    }
}

var HAND2CSS = {
    'x': 'left',
    'y': 'top',
    'w': 'width',
    'h': 'height',
};

function CssSequence(opt) {

    opt = opt || {};

    EventEmitter.call(this);

    cssSequence._instances.push(this);

    this._selectors = opt.selectors || [];
    this._parameters = [];

    this._opt = _.extend({baseH: 21}, opt);

    this._selectedElements = [];
    this._isOpened = false;

    this.deOptions = document.createElement('div');
    this.deKeys = document.createElement('div');

    this._deHeadOptinos = this._createHeadOptions();
    this._deHeadKeyline = amgui.createKeyline({});
    this.deKeys.appendChild(this._deHeadKeyline);

    this._onChangeHandler = this._onChangeHandler.bind(this);
    this._onChangeTime = this._onChangeTime.bind(this);

    am.timeline.on('changeTime', this._onChangeTime);

    am.toolbar.addIcon({icon: 'cog', onClick: function () {
        this.generateSrc();
    }.bind(this)});
}

inherits(CssSequence, EventEmitter);
var p = CssSequence.prototype;

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

    this.emit('select');
};

p.deselect = function () {
    
    if (!this._isSelected) return;
    this._isSelected = false;

    this._blurHandler();

    this._handler.off('change', this._onChangeHandler);
};

p.renderTime = function (time) {

    var selection = _.toArray(am.deRoot.querySelectorAll(this._selectors.join(',')));

    this._parameters.forEach(function (param) {

        selection.forEach(function (de) {

            de.style[param.name] = param.getValue(time);
        });
    });
};

p.height = function () {

    return this._opt.baseH * (this._isOpened ? this._parameters.length + 1 : 1);
}

p._onPick = function (de) {

    var items = am.deRoot.querySelectorAll(this.selectors.join(','));

    if (items.indexOf(de)) {

        this.select();
    }
}

p._focusHandler = function (de) {

    de = de || this._currHandledDe;
    this._currHandledDe = de;

    var br = de.getBoundingClientRect();
    
    this._handler.setup({
        hand: {
            type: 'bund',
            params: {
                x: br.left, 
                y: br.top, 
                w: br.width, 
                h: br.height,
            }
        }
    });

    am.deHandlerCont.appendChild(this._handler.domElement);
};

p._blurHandler = function () {

    // this._currHandledDe = undefined;

    if (this._handler && this._handler.domElement.parentNode) {

        this._handler.domElement.parentNode.removeChild(this._handler.domElement);        
    }
};

p._onChangeHandler = function(params) {

    var time = am.timeline.currTime;

    Object.keys(params).forEach(function (changeName) {

        var name = HAND2CSS[changeName];
        var cssProp = this.getParameter(name) || this.addParameter({name: name});
        var key = cssProp.getKey(time) || cssProp.addKey({time: time, name: name, cssProp: cssProp});
        key.value = params[changeName] + 'px';
    }, this);

    this.renderTime(time);
    this._focusHandler();
};

p._onChangeTime = function (time) {

    this._parameters.forEach(function (param) {

        this.renderTime(time);
        this._focusHandler();
    }, this);
}

p.getParameter = function (name) {

    return this._parameters.find(function(param) {

        return param.name === name;
    });
};

p.addParameter = function (opt) {

    opt = opt || {};

    var param = new CssParameter(opt);
    this._parameters.push(param);

    this.deOptions.appendChild(param.deOptions);
    this.deKeys.appendChild(param.deKeyline);

    return param;
};

p._refreshMainKeyline = function () {

};

p.generateSrc = function () {

    var keys = [], code = '', options;
    this._parameters.forEach(function (prop) {

        prop._keys.forEach(function (key) {

            var offset = key.time / am.timeline.length;
            getKey(offset)[prop.name] = key.value;
        });
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

    options = JSON.stringify({
      direction: "alternate", duration: am.timeline.length, iterations: 4
    });

    code += 'var elem = document.querySelector("' + this._selectors.join(',') + '");\n';
    code += 'var player = document.timeline.play(new Animation(elem, ' + JSON.stringify(keys) + ', ' + options + '));';
    console.log(code);
};



p._createHeadOptions = function (){

    var de = document.createElement('div');
    de.style.position = 'relative';
    de.style.width = '100%';
    de.style.height = this._opt.baseH + 'px';
    de.style.background = 'tomato';
    this.deOptions.appendChild(de);

    this._deToggleDropDown = amgui.createToggleIconBtn({
        iconOn: 'angle-down',
        iconOff: 'angle-right'
    });
    this._deToggleDropDown.addEventListener('toggle', function (e) {
        this._isOpened = e.detail.state;
        this.emit('heightChange', this.height());
    }.bind(this));
    de.appendChild(this._deToggleDropDown);

    this._deOptionsBtn = amgui.createIconBtn({icon: 'cog'});
    this._deOptionsBtn.style.position = 'absolute';
    this._deOptionsBtn.style.right = '21px';
    this._deOptionsBtn.style.top = '0px';
    de.appendChild(this._deOptionsBtn);

    this._deKeyBtn = amgui.createIconBtn({icon: 'key'});
    this._deKeyBtn.style.position = 'absolute';
    this._deKeyBtn.style.right = '0px';
    this._deKeyBtn.style.top = '0px';
    de.appendChild(this._deKeyBtn);

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

module.exports = cssSequence;
