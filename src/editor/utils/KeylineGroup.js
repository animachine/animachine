'use strict';

var inherits = require('inherits');
var Keyline = require('./Keyline');
var amgui = require('../amgui');

function KeylineGroup (opt) {

    Keyline.call(this);

    this._keylines = [];

    this._onChangeKeyline = this._onChangeKeyline.bind(this);
    this._onKeyNeedsRemove = this._onKeyNeedsRemove.bind(this);
    this._delayedRefreshHeadKeyline = this._delayedRefreshHeadKeyline.bind(this);
}

inherits(KeylineGroup, Keyline);
var p = KeylineGroup.prototype;
module.exports = KeylineGroup;








Object.defineProperties(p, {

    keyCount: {

        get: function () {

            return this._keys.length;
        }
    }
});







p.addKeyline = function (keyline) {

    if (this._keylines.indexOf(keyline) !== -1) {
        return;
    }

    keyline.on('change', this._onChangeKeyline);

    this._keylines.push(keyline);

    this._refreshHeadKeyline();
};

p.removeKeyline = function (keyline) {
    
    var idx = this._keylines.indexOf(keyline);
    if (idx === -1) return;

    keyline.removeListener('change', this._onChangeKeyline);

    this._keylines.splice(idx, 1);

    this._refreshHeadKeyline();
};











p._onChangeKeyline = function (key) {

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

    this._keylines.forEach(function (keyline) {

        keyline.forEachKeys(function (key) {

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

        key.directedKeys = [];

        this.addKey(key);
    }


    times.forEach(function (time, idx) {

        var key = this._keys.idx;

        key.time = time;

        key.setSubkeys(keysOnTimes[idx]);

    }, this);

    _.invoke(_.difference(oldKeys, this._headKeys), 'dispose');
};

