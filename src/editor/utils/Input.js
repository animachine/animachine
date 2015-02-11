'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var amgui = require('../amgui');

function Input(opt={}) {

    EventEmitter.call(this);

    this._createBase();

    this._defaultValue = opt.defaultValue || '';
    this._value = opt.value || this._defaultValue;

    if ('flex' in opt) this.domElem.style.flex = opt.flex;
    if ('parent' in opt) opt.parent.appendChild(this.domElem);
    if (opt.onChange) this.on('change', opt.onChange);
}

inherits(Input, EventEmitter);
var p = Input.prototype;
module.exports = Input;

Object.defineProperties(p, {

    value: {
        set: function (v) {

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

p.focus = function () {

    setTimeout(() => $(this._input).focus(),123);
};

p.blur = function () {

    setTimeout(() => $(this._input).blur(),123);
};







p._onChangeInput = function () {

    this.value = this._input.value;
};



p._refreshInput = function () {
};




p._createBase = function () {

    this.domElem = amgui.createDiv();
    this.domElem.style.display = 'flex';
    this.domElem.style.width = '100%';

    this._createInput();
};

p._createInput = function () {

    // this._input = amgui.createInput({
    //     parent: this.domElem,
    //     flex: 1,
    //     onChange: v => this._onChangeInput(v),
    // });
};
