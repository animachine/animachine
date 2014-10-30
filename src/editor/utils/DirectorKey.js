'use strict';

var Key = require('./Key');
var inherits = require('inherits');
var dialogKeyOptions = require('./dialogKeyOptions');
var amgui = require('../amgui');

function DirectorKey(opt) {

    opt.color = 'tomato';

    Key.call(this, opt);

    am.timeline.removeListener('deselectAllKeys', this._onDeselectAllKeys);
    am.timeline.removeListener('translateSelectedKeys', this._onTranslateSelectedKeys);

    this._subkeys = [];
}

inherits(DirectorKey, Key);
var p = DirectorKey.prototype;
module.exports = DirectorKeys;









p.getSave = function () {

    throw 'DirectorKeys are not saveable!';
};

p.useSave = function (save) {

    throw 'DirectorKeys are not loadable!';
};

p.select = function () {

    this._subkeys.forEach(function (key) {

        key.select();
    });
};

p.deselect = function () {

    this._isSelected = false;

    this._subkeys.forEach(function (key) {

        key.deselect();
    });
};

p.setSubkeys = function (newSubkeys) {

    this._subkeys = this._subkeys.every(function (key) {

        return key._isSelected;
    });



    this._subkeys.length = 0;
    this._subkeys.push.apply(this._subkeys, newSubkeys);
};

p.addSubkey = function () {


};

p.removeSubkey = function (key) {

    var idx = this._subkeys.indexOf(key);

    if (idx === -1) return;

    this._subkeys.splice(idx, 1);
};











p._onChangeEase = function (ease) {

    this.ease = ease;
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







p.dispose = function () {

    this._deMenu.removeEventListener('select', this._onSelectDropdown);
    am.timeline.removeListener('changeTape', this._onChangeTape);
    am.timeline.removeListener('deselectAllKeys', this._onDeselectAllKeys);
    am.timeline.removeListener('translateSelectedKeys', this._onTranslateSelectedKeys);

    if (this._deMenu.parentNode) this._deMenu.parentNode.removeChild(this._deMenu); 
};

