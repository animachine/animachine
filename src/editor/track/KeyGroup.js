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



//overwrite listening for timeline:deselectAllKeys & translateSelectedKeys event
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

    newSubkeys.forEach(key => {

        this._subkeys.push(key);
        key.on(['need.render', 'change.ease'], this._onSubkeyNeedRender, this);//TODO use emitter.forward() instead
    });
    this._subkeys.push.apply(this._subkeys, newSubkeys);

    this._refreshSelected();
};

p.removeSubkey = function (key) {

    if (!_.include(this._subkeys, key)) return;

    _.pull(this._subkeys, key);

    key.off(['need.render', 'change.ease'], this._onSubkeyNeedRender, this);
};

p.remove = function () {

    this._subkeys.slice().forEach(function (key) {

        key.remove();
    });
};

p.renderEaseToLine = function (ctx) {

    this._subkeys.forEach(key => key.renderEaseToLine(ctx));
};

p.getEases = function () {

    var ret = [];

    this._subkeys.forEach(function (key) {

        if (key instanceof KeyGroup) {

            ret.push.apply(ret, key.getEases());
        }
        else {
            ret.push(key.ease);
        }
    });

    return ret;
};




p._onSubkeyNeedRender = function () {

    this.emit('need.render');
};

p._onSelectDropdown = function (e) {

    var selection = e.detail.selection;

    if (selection === 'ease') {

        let eases = this.getEases(),
            ease = eases.splice(0, 1)[0];

        if (ease) {
            ease.showOptionsDialog({twinEases: eases});
        }
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
