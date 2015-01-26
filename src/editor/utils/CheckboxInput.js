'use strict';

var Input = require('./Input');
var inherits = require('inherits');
var amgui = require('../amgui');

function CheckboxInput(opt={}) {

    Input.call(this, opt);

    this._onChangeInput = this._onChangeInput.bind(this);

    this._createBase();

    this._value = opt.value || false;
    this._defaultValue = opt.defaultValue || false;
}

inherits(CheckboxInput, Input);
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

