'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../../amgui');

function Keyline (opt) {

    EventEmitter.call(this);

    this._keys = [];

    this._onChangeKeyTime = this._onChangeKeyTime.bind(this);
    this._onChangeKeyEase = this._onChangeKeyEase.bind(this);
    this._onKeyNeedsRemove = this._onKeyNeedsRemove.bind(this);
    
    this._createDomElem();

    amgui.callOnAdded(de, this._renderEase.bind(this));
}

inherits(Keyline, EventEmitter);
var p = Keyline.prototype;
module.exports = Keyline;








Object.defineProperties(p, {

    keyCount: {

        get: function () {

            return this._keys.length;
        }
    }
});







p.addKey = function (key) {

    
    this._keys.push(key);
    key.keyline = this;
    de.appendChild(key.domElem);

    key.on('changeTime', this._onChangeKeyTime);
    key.on('changeEase', this._onChangeKeyEase);
    key.on('needsRemove', this._onKeyNeedsRemove);
    
    this._renderEase();
};

p.removeKey = function (key) {

    var idx = this._keys.indexOf(key);

    if (idx === -1) {
        return false;
    }

    this._keys.splice(idx, 1);
    
    key.removeListener('changeTime', this._onChangeKeyTime);
    key.removeListener('changeEase', this._onChangeKeyEase);
    key.removeListener('needsRemove', this._onKeyNeedsRemove);

    if (key.domElem.parentNode) {
        key.domElem.parentNode.removeChild(key.domElem);
    }

    key.dispose();

    this._renderEase();

    return true;
};

p.forEachKey = function (fn, thisArg) {

    this._keys.forEach(fn, thisArg);
};

p.getKeyByTime = function (time) {

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













p._renderEase = function () {

    this._sortKeys();

    svgEase.innerHTML = '';

    deKeys.forEach(function (deKey, idx) {

        if (idx === deKeys.length-1) {
            return;
        }

        var ease = deKey.ease;

        if (amgui.EASE2BEZIER.hasOwnProperty(ease)) {
            ease = amgui.EASE2BEZIER[ease];
        }

        var rx = /cubic-bezier\(\s*([\d\.]+)\s*,\s*([\d\.-]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.-]+)\s*\)/,
            m = rx.exec(ease),
            x = deKey.offsetLeft,
            w = deKeys[idx+1].offsetLeft - x,
            h = de.offsetHeight,
            path = document.createElementNS('http://www.w3.org/2000/svg', 'path'),
            d = '';

        if (m) {
            d += 'M' + x + ',' + h + ' ';
            d += 'C' + (x + w*m[1]) + ',' + (h - h*m[2]) + ' ';
            d += (x + w*m[3]) + ',' + (h - h*m[4]) + ' ';
            d += (x + w) + ',' + 0;
        }
        else {
            return;
            //TODO steps()
            // d += 'M' + x + ',' + h + ' ';
            // d += 'L' + (x + w) + ',0';
        }

        path.setAttribute('d', d);
        svgEase.appendChild(path);
    });
};

p._sortKeys = function () {

    this._keys.sort(function (a, b) {
        
        return a.offsetLeft - b.offsetLeft;
    });
};







p._onChangeKeyEase = function (key) {

    this._renderEase();
    this.emit('change');
};

p._onChangeKeyTime = function (key) {

    this.emit('change');
};

p._onKeyNeedsRemove = function (key) {

    this.emit('keyNeedsRemove', key);
};












p._createDomElem = function createKeyline(opt) {

    var deKeys = [];

    this.domElem = document.createElement('div');
    this.domElem.style.width = '100%';
    this.domElem.style.height = (opt.height || 21) + 'px';
    this.domElem.style.background = opt.background || 'grey';
    this.domElem.style.position = 'relative';

    var svgEase = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEase.style.width = '100%';
    svgEase.style.height = '100%';
    svgEase.style.fill = 'none';
    svgEase.style.stroke = 'white';
    svgEase.style.position = 'absolute';
    this.domElem.appendChild(svgEase);
}






p.dispose = function () {
    //TODO
};

