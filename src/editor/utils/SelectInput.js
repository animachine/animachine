'use strict';

var Input = require('./Input');
var inherits = require('inherits');
var amgui = require('../amgui');

function SelectInput(opt={}) {

    Input.call(this, opt);

    this._onSelect = this._onSelect.bind(this);

    this._createBase();

    this._options = opt.options || [];
    this.value = opt.value || this._options[0] || '';
    this._defaultValue = opt.defaultValue || this._options[0] || '';
}

inherits(SelectInput, Input);
var p = SelectInput.prototype;
module.exports = SelectInput;

Object.defineProperties(p, {

    value: {
        set: function (v) {

            v += '';

            if (v === this._value || this._options.indexOf(v) === -1) return;

            this._value = v;

            this._deValue.text = v;

            this.emit('change', this._value);
        },
        get: function () {

            return this._value;
        }
    },
});






p._onSelect = function (e) {

    this.value = e.detail.selection;
};








p._createBase = function () {

    this.domElem = amgui.createDiv();
    this.domElem.style.display = 'flex';

    this._deValue = amgui.createLabel({
        parent: this.domElem,
        text: '',
    });

    amgui.bindDropdown({
        deTarget: this._deValue,
        onSelect: e => this._onSelect(e),
        deMenu: amgui.createDropdown({
            options: this._options,
        }),
    });
};

