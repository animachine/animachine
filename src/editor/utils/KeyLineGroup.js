'use strict';

var inherits = require('inherits');
var KeyLine = require('./KeyLine');
var KeyGroup = require('./KeyGroup');
var amgui = require('../amgui');

function KeyLineGroup (opt) {

    KeyLine.call(this);

    this._keyLines = [];

    this._onChangeKeyLine = this._onChangeKeyLine.bind(this);
    this._onKeyNeedsRemove = this._onKeyNeedsRemove.bind(this);
    this._delayedRefreshHeadKeyline = this._delayedRefreshHeadKeyline.bind(this);

    this._createSubcont();
}

inherits(KeyLineGroup, KeyLine);
var p = KeyLineGroup.prototype;
module.exports = KeyLineGroup;








Object.defineProperties(p, {

    keyCount: {

        get: function () {

            return this._keys.length;
        }
    }
});




p.addKey = function (key) {
    if(!(key instanceof KeyGroup)) debugger;
    KeyLine.prototype.addKey.call(this, key)
}


p.addKeyLine = function (keyLine) {

    if (this._keyLines.indexOf(keyLine) !== -1) {
        return;
    }

    keyLine.on('change', this._onChangeKeyLine);

    this._keyLines.push(keyLine);

    this._deSubcont.appendChild(keyLine.domElem);

    this._refreshHeadKeyline();
};

p.removeKeyline = function (keyLine) {
    
    var idx = this._keyLines.indexOf(keyLine);
    if (idx === -1) return;

    keyLine.removeListener('change', this._onChangeKeyLine);

    this._keyLines.splice(idx, 1);

    if (keyLine.domElem.parentNode === this._deSubcont) {
        this._deSubcont.removeChild(keyLine.domElem);
    }

    this._refreshHeadKeyline();
};











p._onChangeKeyLine = function (key) {

    this._refreshHeadKeyline();
};

p._refreshHeadKeyline = function () {

    if (!this._refreshHeadKeylineRafId) {

        this._refreshHeadKeylineRafId = requestAnimationFrame(this._delayedRefreshHeadKeyline);
    }
}

p._delayedRefreshHeadKeyline = function () {

    this._refreshHeadKeylineRafId = undefined;

    var times = [], keysOnTimes = [];

    this._keyLines.forEach(function (keyLine) {

        keyLine.forEachKeys(function (key) {

            var tidx = times.indexOf(key.time);

            if (tidx === -1) {

                times.push(key.time);
                keysOnTimes.push([]);
                tidx = times.length - 1;
            }

            keysOnTimes[tidx].push(key);
        })
    });


    while (times.length < this._keys.length) {

        this.removeKey(this._keys.pop());
    }

    while (times.length > this._keys.length) {

        this.addKey(new KeyGroup({}));
    }


    times.forEach(function (time, idx) {

        var key = this._keys[idx];

        key.time = time;

        key.setSubkeys(keysOnTimes[idx]);

    }, this);
};




p._createSubcont = function () {

    this._deSubcont = document.createElement('div');
    this._deSubcont.style.width = '100%';
    this.domElem.appendChild(this._deSubcont);
}