'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../amgui');

function CheckboxInput(opt) {

    EventEmitter.call(this);

    this._onChangeInput = this._onChangeInput.bind(this);

    this._createBase();

    this._value = opt.value || '';
    this._defaultValue = opt.defaultValue || '';

    if ('flex' in opt) this.domElem.style.flex = opt.flex;
    if ('parent' in opt) opt.parent.appendChild(this.domElem);
    if (opt.onChange) this.on('change', opt.onChange);
}

inherits(CheckboxInput, EventEmitter);
var p = CheckboxInput.prototype;
module.exports = CheckboxInput;

Object.defineProperties(p, {

    value: {
        set: function (v) {

            v = !!v;

            if (v === this._value) return;

            this._value = v;

            this._refreshInput();

            this.emit('change', this._value);
        },
        get: function () {

            return this._value;
        }
    },
});






p.reset = function () {

    this.value = this._defaultValue;
};







p._onChangeInput = function () {

    this.value = this._input.checked;
};



p._refreshInput = function () {

    if (this._input.checked !== this._value) {
    
        this._input.checked = this._value;
    }
};




p._createBase = function () {

    this.domElem = amgui.createDiv();
    this.domElem.style.display = 'flex';

    this._input = amgui.createCheckbox({
        parent: this.domElem,
        onChange: this._onChangeInput,
        flex: 1, 
    });
};

