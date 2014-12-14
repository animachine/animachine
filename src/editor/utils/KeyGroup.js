'use strict';

var Key = require('./Key');
var inherits = require('inherits');
var dialogEaseOptions = require('./dialogEaseOptions');
var amgui = require('../amgui');
var Ease = require('./Ease');

function KeyGroup(opt) {

    opt = opt || {};

    this._subkeys = [];

    Key.call(this, opt);

    this.looks = {
        line: {
            color: '#eee'
        }
    }

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

                key.ease.useSave(ease);
            });
        }
    }
});








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

    this._subkeys.forEach(function (key) {

        key.remove();
    });
};

p.renderEaseToLine = function (ctx) {

    var tlStart = am.timeline.start,
        tlTimescale = am.timeline.timescale;

    this._subkeys.forEach(function (key) {

        var nextKey = key.getNextKey();

        if (!nextKey) return;

        var start = (key.time + tlStart) * tlTimescale,
            end = (nextKey.time + tlStart) * tlTimescale,
            width = end - start;

        key.renderEaseToLine(ctx, start, width);
    });
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

        this.emit(this._isSelected ? 'select' : 'deselect')
    }
}







p.dispose = function () {

    this._deMenu.removeEventListener('select', this._onSelectDropdown);
    am.timeline.removeListener('changeTape', this._onChangeTape);
    am.timeline.removeListener('deselectAllKeys', this._onDeselectAllKeys);
    am.timeline.removeListener('translateSelectedKeys', this._onTranslateSelectedKeys);

    if (this._deMenu.parentNode) this._deMenu.parentNode.removeChild(this._deMenu); 
};

