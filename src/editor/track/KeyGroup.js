'use strict';

var Key = require('./Key');
var inherits = require('inherits');
var defineCompactProperty = require('../utils/defineCompactProperty');

function KeyGroup(opt) {

    opt = opt || {};

    this._subkeys = [];

    Key.apply(this, arguments);
}

inherits(KeyGroup, Key);
var p = KeyGroup.prototype;
module.exports = KeyGroup;



p.wake = function () {};

p.sleep = function () {};





Object.defineProperties(p, {

    ease: {
        set: function (ease) {

            this._subkeys.forEach(function (key) {

                key.ease.useSave(ease.getSave());
            });
        }
    }
});

defineCompactProperty(p, [
    {name: 'time', type: 'int', history: false},
    {name: 'value', history: false},
]);






p.getSave = function () {

    return {};
};

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

p.remove = function () {

    this._subkeys.slice().forEach(function (key) {

        key.remove();
    });
};

p.renderEaseToLine = function (ctx) {

    this._subkeys.forEach(key => key.renderEaseToLine(ctx));
};









p._onSelectDropdown = function (e) {

    var selection = e.detail.selection;

    if (selection === 'ease') {

        this.ease.showOptionsDialog();
    }
    else if (selection === 'delete') {

        this.remove();
    }
};

p._onChangeEase = function (ease) {

    this.ease = ease;
};







p._refreshSelected = function () {

    var selected = this._subkeys.every(function (key) {

        return key._isSelected;
    });

    if (selected !== this._isSelected) {

        this._isSelected = selected;

        this.emit(this._isSelected ? 'select' : 'deselect');
    }
};





p._createEase = function () {
    //override, KeyGroup isn't need its own Ease
};





p.dispose = function () {

};
