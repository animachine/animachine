'use strict';

var inherits = require('inherits');
var KeyLine = require('./KeyLine');
var KeyGroup = require('./KeyGroup');
var amgui = require('../amgui');

function KeyLineGroup () {

    KeyLine.apply(this, arguments);

    this._keyLines = [];

    this._refreshHeadKeyline = amgui.delayWithRAF(this._refreshHeadKeyline, this);

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

    if(!(key instanceof KeyGroup)) throw Error;

    am.history.dontSave(() => KeyLine.prototype.addKey.call(this, key));
};


p.removeKey = function (key) {

    am.history.dontSave(() => KeyLine.prototype.removeKey.call(this, key));
};


p.addKeyLine = function (keyLine) {

    if (this._keyLines.indexOf(keyLine) !== -1) {
        return;
    }

    keyLine.on('change.keys', this._onChangeKeyLineKeys, this);

    this._keyLines.push(keyLine);

    this._deSubcont.appendChild(keyLine.domElem);

    this._refreshHeadKeyline();
};

p.removeKeyline = function (keyLine) {

    var idx = this._keyLines.indexOf(keyLine);
    if (idx === -1) return;

    keyLine.off('change.keys', this._onChangeKeyLineKeys, this);

    this._keyLines.splice(idx, 1);

    if (keyLine.domElem.parentNode === this._deSubcont) {
        this._deSubcont.removeChild(keyLine.domElem);
    }

    this._refreshHeadKeyline();
};











p._onChangeKeyLineKeys = function () {

    this._refreshHeadKeyline();
};

p._onDblClick = function (e) {

    var time = this.timeline.screenXToTime(e.screenX),
        key = this.getNextKey(time),
        eases = [];

    collectEases(key);

    if (key) {

        this.timeline.inlineEaseEditor.show({key, eases});
    }


    function collectEases(key) {

        key._subkeys.forEach(subKey => {

            if (subKey instanceof KeyGroup) {

                collectEases(subKey);
            }
            else {
                eases.push(subKey.ease);
            }
        });
    }
};





p._refreshHeadKeyline = function () {

    this._skipRender = true;

    var times = [], keysOnTimes = [];

    this._keyLines.forEach(function (keyLine) {

        if (keyLine.hidden) return;

        keyLine.forEachKeys(function (key) {

            var tidx = times.indexOf(key.time);

            if (tidx === -1) {

                times.push(key.time);
                keysOnTimes.push([]);
                tidx = times.length - 1;
            }

            keysOnTimes[tidx].push(key);
        }, this);
    }, this);


    while (times.length < this._keys.length) {

        this.removeKey(this._keys[this._keys.length-1]);
    }

    while (times.length > this._keys.length) {

        this.addKey(new KeyGroup({}, this.timeline));
    }


    times.forEach(function (time, idx) {

        var key = this._keys[idx];

        key.time = time;

        key.setSubkeys(keysOnTimes[idx]);

    }, this);

    this._skipRender = false;
    this._render();
};




p._createSubcont = function () {

    this._deSubcont = document.createElement('div');
    this._deSubcont.style.width = '100%';
    this.domElem.appendChild(this._deSubcont);
};
