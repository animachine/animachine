'use strict';

var inherits = require('inherits');
var Keyline = require('./Keyline');
var amgui = require('../amgui');

function DirectorKeyline (opt) {

    Keyline.call(this);

    this._keylines = [];

    this._onChangeKeyline = this._onChangeKeyline.bind(this);
    this._onKeyNeedsRemove = this._onKeyNeedsRemove.bind(this);
    
    this._createDomElem();

    amgui.callOnAdded(de, this._renderEase.bind(this));
}

inherits(Keyline, Keyline);
var p = Keyline.prototype;
module.exports = Keyline;








Object.defineProperties(p, {

    keyCount: {

        get: function () {

            return this._keys.length;
        }
    }
});







p.addKeyline = function (key) {

    
    this._keys.push(key);
    key.keyline = this;
    de.appendChild(key.domElem);

    key.on('change', this._onChangeKeyline);
    key.on('needsRemove', this._onKeyNeedsRemove);
    
    this._renderEase();
};

p.removeKeyline = function (key) {

    var idx = this._keys.indexOf(key);

    if (idx === -1) {
        return false;
    }

    this._keys.splice(idx, 1);
    
    key.removeListener('change', this._onChangeKeyline);
    key.removeListener('needsRemove', this._onKeyNeedsRemove);

    if (key.domElem.parentNode) {
        key.domElem.parentNode.removeChild(key.domElem);
    }

    key.dispose();

    this._renderEase();

    return true;
};











p._onChangeKeyline = function (key) {

    this._refreshHeadKeyline();
};

p._refreshHeadKeyline = function () {

    var times = [], keysOnTimes = [];


    this._keylines.forEach(function (keyline) {

        keyline.forEachKey(function (key) {

            var tidx = time.indexOf(key.time);

            if (tidx === -1) {

                times.push(key.time);
                keysOnTimes.push([]);
                tidx = time.length - 1;
            }

            keysOnTimes[tidx].push(key);
        })
    });


    while (times.length < this.keys.length) {

        this.removeKey(this._keys.pop());
    }

    while (times.length > this.keys.length) {

        key = new Key({
            deKeyline: this._deHeadKeyline,
            ease: 'none',
            color: '#063501'
        });

        key.on('changeTime', this.onChangeKeyTime);

        key.directedKeys = [];

        this.addKey(key);
    }


    times.forEach(function (time, idx) {

        var key = this._keys.idx;

        key.time = time;

        key.directedKeys.length = 0;
        key.directedKeys.push.apply(key.directedKeys, keysOnTimes[idx]);

    }, this);

    _.invoke(_.difference(oldKeys, this._headKeys), 'dispose');
};

