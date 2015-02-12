'use strict';

var Input = require('./Input');
var inherits = require('inherits');
var amgui = require('../amgui');
var defineCompactProperty = require('./defineCompactProperty');

function CheckboxInput(opt={}) {

    Input.call(this, opt);

    if (_.has(opt, 'text')) this.text = opt.text;
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
    }
});

defineCompactProperty(p, {name: 'text', type: 'string', onChange: function (v) {
    this._input.text = v;
}});





p._onChangeInput = function () {

    this.value = this._input.checked;
};



p._refreshInput = function () {

    if (this._input.checked !== this._value) {

        this._input.checked = this._value;
    }
};




p._createInput = function () {

    this._input = amgui.createCheckbox({
        parent: this.domElem,
        onChange: () => this._onChangeInput(),
        flex: 1,
    });
};
