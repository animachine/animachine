'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../amgui');

function StringInput(opt) {

    EventEmitter.call(this);

    this._onChangeInput = this._onChangeInput.bind(this);

    this._createBase();

    this._value = opt.value || '';

    if ('flex' in opt) this.domElem.style.flex = opt.flex;
    if ('parent' in opt) opt.parent.appendChild(this.domElem);
    if (opt.onChange) this.on('change', opt.onChange);
}

inherits(StringInput, EventEmitter);
var p = StringInput.prototype;
module.exports = StringInput;

Object.defineProperties(p, {

    value: {
        set: function (v) {

            v += '';

            if (v === this._value) return;

            this._value = v;

            this._refreshInput();

            this.emit('change');
        },
        get: function () {

            return this._value;
        }
    },
});










p._onChangeInput = function () {

    this.value = this._input.value;
};



p._refreshInput = function () {

    if (this._input.value !== this._value) {
    
        this._input.value = this._value;
    }
};




p._createBase = function () {

    this.domElem = amgui.createDiv();
    this.domElem.style.display = 'flex';

    this._input = amgui.createInput({
        parent: this.domElem,
        onChange: this._onChangeInput,
        flex: 1, 
    });
    this._input.style.textAlign =  'right';
    this._input.style.paddingRight =  '2px';
};

