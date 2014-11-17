'use strict';

var Key = require('./Key');
var inherits = require('inherits');
var dialogKeyOptions = require('./dialogKeyOptions');
var amgui = require('../amgui');

function KeyGroup(opt) {

    opt = opt || {};

    this._subkeys = [];

    Key.call(this, opt);

    am.timeline.removeListener('deselectAllKeys', this._onDeselectAllKeys);
    am.timeline.removeListener('translateSelectedKeys', this._onTranslateSelectedKeys);
}

inherits(KeyGroup, Key);
var p = KeyGroup.prototype;
module.exports = KeyGroup;




Object.defineProperties(p, {

    ease: {
        set: function (ease) {

            this._subkeys.forEach(function (key) {

                key.ease = ease;
            });
        }
    }
})








p.select = function () {

    this._subkeys.forEach(function (key) {

        key.select();
    });

    this._refreshSelected();
};

p.deselect = function () {

    this._subkeys.forEach(function (key) {

        key.deselect();
    });

    this._refreshSelected();
};

p.setSubkeys = function (newSubkeys) {

    this._subkeys.length = 0;
    this._subkeys.push.apply(this._subkeys, newSubkeys);

    this._refreshSelected();
};

p.removeSubkey = function (key) {

    var idx = this._subkeys.indexOf(key);

    if (idx === -1) return;

    this._subkeys.splice(idx, 1);
};












p._onSelectDropdown = function (e) {
    
    var selection = e.detail.selection;

    if (selection === 'ease') {

        dialogKeyOptions.show({
            ease: this.ease,
            onChangeEase: this._onChangeEase,
        });
    }
    else if (selection === 'delete') {

        this.emit('delete', this);
    }
};

p._onChangeEase = function (ease) {

    this.ease = ease;
};







p._refreshSelected = function () {

    var selected = this._subkeys.every(function (key) {

        return key._selected;
    });

    if (selected !== this._selected) {

        this._selected = selected;

        this._refreshDomElem();
    }
}







p.dispose = function () {

    this._deMenu.removeEventListener('select', this._onSelectDropdown);
    am.timeline.removeListener('changeTape', this._onChangeTape);
    am.timeline.removeListener('deselectAllKeys', this._onDeselectAllKeys);
    am.timeline.removeListener('translateSelectedKeys', this._onTranslateSelectedKeys);

    if (this._deMenu.parentNode) this._deMenu.parentNode.removeChild(this._deMenu); 
};

