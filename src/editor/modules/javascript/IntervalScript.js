'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var dialogScriptEditor = require('./dialogScriptEditor');
var amgui = require('../../amgui');

function IntervalScript(opt) {

    EventEmitter.call(this);

    this._lineH =  21;
    this._script =  '/**/';
    this._boundaries = [];

    this.deOptions = this._createParameterOptions();
    this.deKeyline = amgui.createKeyline({
        timescale: am.timeline.timescale
    });

    this._onChangeTime = this._onChangeTime.bind(this);
    this._onClickOpenScript = this._onClickOpenScript.bind(this);

    am.timeline.on('changeTime', this._onChangeTime);

    if (opt) {
        this.useSave(opt);
    }
}

inherits(IntervalScript, EventEmitter);
var p = IntervalScript.prototype;









Object.defineProperties(p, {

    height: {
        get: function () {
            
            return this._lineH;
        }
    }
});





p.getSave = function () {

    var save = {
        name: this.name,
        script: this.script,
        boundaries: this._boundaries.slice(),
    };

    return save;
};

p.useSave = function(save) {

    this.name = save.name;
    this.script = save.name;
    this._boundaries = save.boundaries;

    if (save.keys) {

        save.keys.forEach(this.addKey, this);
    }
};

p.addKey = function (opt, skipHistory) {
    
    var key = this.getKey(opt.time);

    if (key) {

        if ('value' in opt) {

            if (!skipHistory) {
                am.history.saveChain(key, [this.addKey, this, key, true], [this.addKey, this, opt, true]);
            }

            key.value = opt.value;
        }
    }
    else {

        key = new Key(_.extend({deKeyline: this.deKeyline}, opt));

        key.on('changeTime', this._onChangeKeyTime);
        key.on('delete', this._onDeleteKey);

        this._keys.push(key);

        if (!skipHistory) {
            am.history.closeChain(key);
            am.history.save([this.removeKey, this, opt.time, true], [this.addKey, this, opt, true]);
        }
    }

    this._refreshInput();
    this._refreshBtnToggleKey();

    this.emit('change');

    return key;
};













p._onChangeInput = function (e) {

    if ('key' in e.detail) {
        this.name = e.detail.key;
    }

    if ('value' in e.detail) {
        this.addKey({
            time: am.timeline.currTime,
            value: e.detail.value
        });
    }

    this.emit('change');
};

p._onChangeKeyTime = function () {

    this.emit('change');
};

p._onDeleteKey = function (key) {

    this.removeKey(key);
};

p._onChangeTime = function () {


};



















p._createParameterOptions = function () {

    var de = document.createElement('div');
    de.style.display = 'flex';
    de.style.width = '100%';
    de.style.height = this._lineH + 'px';
    de.style.background = 'linear-gradient(to bottom, #184F12 18%,#1B4417 96%)';

    this._btnOpenScript = amgui.createIconBtn({
        icon: 'code',
        height: this._baseH,
        onClick: this._onClickOpenScript,
        parent: de
    });

    this._btnEdit = amgui.createIconBtn({
        icon: 'wrench',
        height: this._baseH,
        parent: de
    });

    amgui.bindDropdown({
        deTarget: this._btnEdit,
        deMenu: amgui.createDropdown({
            options: [
                {text: 'merge'},
                {text: 'split'},
                {text: 'end here'},
                {text: 'start here'},
                {text: 'add', icon: 'plus'},
                {text: 'remove', icon: 'minus'},
            ]
        })
    });

    amgui.bindDropdown({
        asContextMenu: true,
        deTarget: de,
        deMenu: amgui.createDropdown({
            options: [
                {text: 'move up', onSelect: this.emit.bind(this, 'move', this, -1)},
                {text: 'move down', onSelect: this.emit.bind(this, 'move', this, 1)},
                {text: 'delete', onSelect: this.emit.bind(this, 'delete', this)},
            ]
        })
    });

    return de;
};

module.exports = IntervalScript;
