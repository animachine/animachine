'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../amgui');

function KeyLine (opt) {

    EventEmitter.call(this);

    this._keys = [];

    this._height = amgui.LINE_HEIGHT;

    this._onChangeKeyTime = this._onChangeKeyTime.bind(this);
    this._onChangeKeyEase = this._onChangeKeyEase.bind(this);
    this._onKeyNeedsRemove = this._onKeyNeedsRemove.bind(this);
    
    this._createDomElem();

    amgui.callOnAdded(this.domElem, this._renderEase.bind(this));
}

inherits(KeyLine, EventEmitter);
var p = KeyLine.prototype;
module.exports = KeyLine;








Object.defineProperties(p, {

    keyCount: {

        get: function () {

            return this._keys.length;
        }
    }
});







p.addKey = function (key) {
    
    this._keys.push(key);
    key.keyLine = this;
    this._deLine.appendChild(key.domElem);

    key.on('changeTime', this._onChangeKeyTime);
    key.on('changeEase', this._onChangeKeyEase);
    key.on('needsRemove', this._onKeyNeedsRemove);
    
    this._renderEase();
    this.emit('change');
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
    this.emit('change');

    return true;
};

p.forEachKeys = function (fn, thisArg) {

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

p.getEases = function () {

    var eases = [];

    this._keys.forEach(function (key, idx) {

        if (idx !== this._keys.length-1) {

            var ease = {
                x: key.domElem.offsetLeft,
                ease: key.ease,
            }
            ease.w = this._keys[idx+1].domElem.offsetLeft - ease.x;

            eases.push(ease);
        }
    }, this);

    return eases;
}











p._renderEase = function () {

    this._sortKeys();

    this._svgEase.innerHTML = '';

    this.forEachKeys(function (key, idx) {

        if (idx === this._keys.length-1) {
            return;
        }

        var x = key.domElem.offsetLeft,
            w = this._keys[idx+1].domElem.offsetLeft - x;
    
        this._renderEasePath(key.ease, x, w);
    }, this);
};

p._renderEasePath = function (ease, x, w, color) {

    if (amgui.EASE2BEZIER.hasOwnProperty(ease)) {
        ease = amgui.EASE2BEZIER[ease];
    }

    var rx = /cubic-bezier\(\s*([\d\.]+)\s*,\s*([\d\.-]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.-]+)\s*\)/,
        m = rx.exec(ease),
        h = this._height,
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
    path.style.stroke = color;
    path.setAttribute('d', d);

    this._svgEase.appendChild(path);
}

p._sortKeys = function () {

    this._keys.sort(function (a, b) {
        
        return a.time - b.time;
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

    this.domElem = document.createElement('div');
    this.domElem.style.width = '100%';
    this.domElem.style.position = 'relative';
    this.domElem.setAttribute('debug-keyline', 1);
    this.domElem.style.overflow = 'hidden';

    this._deLine = document.createElement('div');
    this._deLine.style.position = 'relative';
    this._deLine.style.width = '100%';
    this._deLine.style.height = this._height + 'px';
    // this._deLine.style.background = this._background || 'grey';
    this.domElem.appendChild(this._deLine);
    amgui.createSeparator({parent: this._deLine});

    this._svgEase = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this._svgEase.style.width = '100%';
    this._svgEase.style.height = '100%';
    this._svgEase.style.fill = 'none';
    this._svgEase.style.stroke = 'white';
    this._svgEase.style.position = 'absolute';
    this._deLine.appendChild(this._svgEase);
}






p.dispose = function () {
    //TODO
};

