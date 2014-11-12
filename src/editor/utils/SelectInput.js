'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../amgui');

function SelectInput(opt) {

    EventEmitter.call(this);

    this._onSelect = this._onSelect.bind(this);

    this._createBase();

    this._options = opt.options || [];
    this.value = opt.value || this._options[0] || '';
    this._defaultValue = opt.defaultValue || this._options[0] || '';

    if ('flex' in opt) this.domElem.style.flex = opt.flex;
    if ('parent' in opt) opt.parent.appendChild(this.domElem);
    if (opt.onChange) this.on('change', opt.onChange);
}

inherits(SelectInput, EventEmitter);
var p = SelectInput.prototype;
module.exports = SelectInput;

Object.defineProperties(p, {

    value: {
        set: function (v) {

            v += '';

            if (v === this._value || this._options.indexOf(v) === -1) return;

            this._value = v;

            this._deValue.setText(v);

            this.emit('change');
        },
        get: function () {

            return this._value;
        }
    },
});






p.reset = function () {

    this.value = this._defaultValue;
};






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
        onSelect: this._onSelect,
        deMenu: amgui.createDropdown({
            options: this._options,
        })
    });
};

