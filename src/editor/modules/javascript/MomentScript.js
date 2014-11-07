'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var dialogScriptEditor = require('./dialogScriptEditor');
var amgui = require('../../amgui');

function MomentScript(opt) {

    EventEmitter.call(this);
    
    this._time =  0;
    this._script =  '';
    this._deKeyline = opt.deKeyline;

    this._onChangeDeTime = this._onChangeDeTime.bind(this);
    this._onSelectDropdown = this._onSelectDropdown.bind(this);
    this._onChangeTape = this._onChangeTape.bind(this);
    this._onDblclickKey = this._onDblclickKey.bind(this);

    this.domElem = this._deKeyline.addKey({
        timescale: am.timeline.timescale,
        time: this.time,
        ease: 'none'
    });


    this._deMenu = amgui.createDropdown({
        optionLine: ['script', 'delete']
    });
    this._deMenu.addEventListener('select', this._onSelectDropdown);

    this.domElem.addEventListener('changeTime', this._onChangeDeTime);
    am.timeline.on('changeTape', this._onChangeTape);

    amgui.bindDropdown({
        deTarget: this.domElem,
        deMenu: this._deMenu,
        asContextMenu: true
    });

    this.domElem.addEventListener('dblclick', this._onDblclickKey);

    if (opt) {
        this.useSave(opt);
    }
}

inherits(MomentScript, EventEmitter);
var p = MomentScript.prototype;

Object.defineProperties(p, {

    time: {
        set: function (v) {

            if (!Number.isFinite(v) || this._time === v) return;

            this._time = v;

            this.domElem.setTime(this._time);
        },
        get: function () {

            return this._time;
        }
    },
    script: {
        set: function (v) {

            if (this._script === v) return;

            this._script = v;
        },
        get: function () {

            return this._script;
        }
    }
});


p.getSave = function () {

    return {
        script: JSON.stringify(this.script).slice(1, -1).replace(/'/g, '\\\''),
        time: this.time,
    };
};

p.useSave = function (save) {

    if ('script' in save) this.script = save.script;
    if ('time' in save) this.time = save.time;
};

p.runScript = function () {

    (new Function(this.script))();//TODO hack!!!
};

p.editScript = function () {

    dialogScriptEditor.show({

        script: this.script,
        onChangeScript: function (script) {

            this.script = script;
        }
    });
};






p._onChangeDeTime = function (e) {

    this.time = e.detail.time;

    this.emit('changeTime');
};

p._onSelectDropdown = function (e) {
    
    var selection = e.detail.selection;

    if (selection === 'delete') {

        this.emit('delete', this);
    }
    else if (selection === 'edit script') {

        this.editScript();
    }
};

p._onChangeTape = function () {

    this.domElem.setTimescale(am.timeline.timescale);
};

p._onDblclickKey = function () {

    this.editScript();
};




p.dispose = function () {

    this.domElem.removeEventListener('changeTime', this._onChangeDeTime);
    this._deMenu.removeEventListener('select', this._onSelectDropdown);
    am.timeline.removeListener('changeTape', this._onChangeTape);

    this.domElem.remove();
    if (this._deMenu.parentNode) this._deMenu.parentNode.removeChild(this._deMenu); 
};

module.exports = MomentScript;
