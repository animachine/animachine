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

    this._onChangeInputAmount = this._onChangeInputAmount.bind(this);

    this._createBase();

    this._amount = opt.amount || 0;
    this._unit = this._units[0];
    this._precison = opt.precision || 0;
    this.units = opt.units || [];

    this.converters = opt.converters;

    if ('flex' in opt) this.domElem.style.flex = opt.flex;
    if ('parent' in opt) opt.parent.appendChild(this.domElem);
    if ('onChange' in opt) this.on('change', opt.onChange);
}

inherits(UnitInput, EventEmitter);
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
    }
});




p._setValueParts = function (amount, unit) {

    if (this._amount === amount && this._unit === unit) return;
    

    this._amount = amount;
    var fixAmount = this._toFixedAmount(amount);

    if (this._inpAmount.value !== fixAmount) {

        this._inpAmount.value = fixAmount;
    }

    if (this._unit !== unit && this._units.indexOf(unit) !== -1) {

        this._unit = unit;
        this._deUnit.setText(unit);
    } 

    this.emit('change', this.value);
}

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



p.refreshDisplay = function () {

    this._inpAmount.value = this._getFixedValue();
    this._deUnit.setText(v);
};




p._createBase = function () {

    this.domElem = amgui.createDiv();
    this.domElem.style.display = 'flex';

    this._inpAmount = amgui.createInput({
        parent: this.domElem,
        onChange: this._onChangeInputAmount,
        flex: 1, 
    });
    this._inpAmount.style.textAlign =  'right';
    this._inpAmount.style.paddingRight =  '2px';

    this._deUnit = amgui.createLabel({
        parent: this.domElem,
        text: '',
    });
};

