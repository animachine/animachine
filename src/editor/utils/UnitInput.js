'use strict';

var Input = require('./Input');
var inherits = require('inherits');
var amgui = require('../amgui');

function UnitInput(opt={}) {

    Input.call(this, opt);

    this._rxAmount = /^\s*([\+-]?\d*\.?\d*)/;
    this._rxUnit;

    this._onChangeInputAmount = this._onChangeInputAmount.bind(this);

    this._createBase();

    this.units = opt.units && opt.units.length ? opt.units : [''];
    this.min = opt.min;
    this.max = opt.max;
    this._amount = undefined;
    this._unit = undefined;
    this._precison = opt.precision || 0;
    this._defaultValue = opt.defaultValue || 0;
    this._dragSpeed = opt.dragSpeed || 1;

    this._setValueParts(opt.amount || 0, this._units[0]);

    this.converters = opt.converters;
}

inherits(UnitInput, Input);
var p = UnitInput.prototype;
module.exports = UnitInput;

Object.defineProperties(p, {

    value: {
        set: function (v) {

            v += '';

            var mAmount = this._rxAmount.exec(v),
                mUnit = this._rxUnit.exec(v),
                amount = mAmount ? mAmount[1] : '0',
                unit = mUnit ? mUnit[1] : '';

            this._setValueParts(amount, unit);
        },
        get: function () {

            return  this._amount + this._unit;
        }
    },
    precision: {
        set: function (v) {

            v  = parseInt(v)
            if (v === this._precison || this._precison.indexOf(v) === -1) return;

            this._precison = v;
            this.value = this.value;
        },
        get: function () {

            return  this._precison;
        }
    },
    units: {
        set: function (v) {

            if (!(v instanceof Array)) return;

            this._units = v.slice();

            this._rxUnit = new RegExp('(' + this._units.join('|') + ')+\\s*$');
        }
    },
    min: {
        set: function (v) {

            v = parseFloat(v);

            if (!_.isFinite(v) || this._min === v) return;

            this._min = v;
        },
        get: function () {

            return this._min;
        }
    },
    max: {
        set: function (v) {

            v = parseFloat(v);

            if (!_.isFinite(v) || this._max === v) return;

            this._max = v;
        },
        get: function () {

            return this._max;
        }
    }
});






p._setValueParts = function (amount, unit) {

    amount = parseFloat(amount) || 0;
    unit = String(unit) || '';

    if (this._amount === amount && this._unit === unit) return;

    if (_.isFinite(this.min)) amount = Math.max(this.min, amount);
    if (_.isFinite(this.max)) amount = Math.min(this.max, amount);

    this._amount = amount;
    var fixAmount = this._toFixedAmount(amount);

    if (this._inpAmount.value !== fixAmount) {

        this._inpAmount.value = fixAmount;
    }

    if (this._unit !== unit && this._units.indexOf(unit) !== -1) {

        this._unit = unit;
        this._deUnit.text = unit;
    }

    this.emit('change', this.value);
};

p._toFixedAmount = function (amount) {

    var fixAmount = parseFloat(amount).toFixed(this._precison);

    if (fixAmount.indexOf('.') !== -1) {

        fixAmount = fixAmount.replace(/\.?0*$/, '');
    }

    return fixAmount;
};





p._onChangeInputAmount = function () {

    var fixAmount = this._toFixedAmount(this._amount),
        value = this._inpAmount.value;

    if (fixAmount !== value) {

        this._setValueParts(value, this._unit);
    }
};





p._createInput = function () {

    this._inpAmount = amgui.createInput({
        parent: this.domElem,
        onChange: this._onChangeInputAmount,
        flex: 1,
    });
    this._inpAmount.style.textAlign =  'right';
    this._inpAmount.style.paddingRight =  '2px';
    this._inpAmount.style.cursor =  'ew-resize';

    amgui.makeDraggable({
        deTarget: this._inpAmount,
        thisArg: this,
        onDown: function () {

            return {
                amount: this._amount,
                moved: false,
            };
        },
        onMove: function (md, mx) {

            md.moved = true;

            var dx = mx - md.mx;

            this._setValueParts(md.amount + this._dragSpeed * dx);
        },
        onUp: function (md) {
            if (!md.moved) {
                this._inpAmount.focus();
            }
        }
    });

    this._deUnit = amgui.createLabel({
        parent: this.domElem,
        text: '',
    });
};
