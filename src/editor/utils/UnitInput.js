'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../amgui');

function UnitInput(opt) {

    EventEmitter.call(this);

    this._units = [];
    this._unit = '';

    this._rxAmount = /^\s*([\+-]?\d*\.?\d*)/;
    this._rxUnit;

    this._onChangeInput = this._onChangeInput.bind(this);

    this._createBase();

    this.amount = opt.amount || 0;
    this.units = opt.units || [];
    this.unit = this._units[0];

    if ('flex' in opt) this.domElem.style.flex = opt.flex;
    if ('parent' in opt) opt.parent.appendChild(this.domElem);
    if ('onChange' in opt) this.on('change', opt.onChange);
}

inherits(UnitInput, EventEmitter);
var p = UnitInput.prototype;
module.exports = UnitInput;

Object.defineProperties(p, {

    amount: {
        set: function (v) {

            v = parseFloat(v);

            if (v === this._amount) return;

            this._amount = v;
            this._input.value = v;

            this.emit('change', this.value);
        },
        get: function () {
            
            return  this._amount;
        }
    },
    unit: {
        set: function (v) {

            if (v === this._unit || this._units.indexOf(v) === -1) return;

            this._unit = v;
            this._deUnit.setText(v);
        },
        get: function () {

            return  this._unit;

            this.emit('change', this.value);
        }
    },
    value: {
        set: function (v) {

            v += '';

            var mAmount = this._rxAmount.exec(v),
                mUnit = this._rxUnit.exec(v);

            this.amount = mAmount ? mAmount[1] : 0;
            if (mUnit) this.unit = mUnit[1];

            this._input.value = this.amount;
        },
        get: function () {

            return  this.amount + this.unit;
        }
    },
    units: {
        set: function (v) {

            if (!(v instanceof Array)) return;

            this._units = v.slice();

            this._rxUnit = new RegExp('(' + this._units.join('|') + ')+\\s*$');
        }
    }
});






p._onChangeInput = function () {

    this.value = this._input.value;
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

    this._deUnit = amgui.createLabel({
        parent: this.domElem,
        text: ''
    });
};