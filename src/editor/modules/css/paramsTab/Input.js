'use strict';

var amgui = require('../../../amgui');

function Input(opt) {

    this._name = '';
    this._value = '';

    if ('name' in opt) this.name = opt.name;
    if ('value' in opt) this.value = opt.value;

    this._createBase();

    this._onChangeInput = this._onChangeInput.bind(this);
}

var p = Input.prototype;



Object.defineProperties(p, {

    name: {
        set: function (v) {

            if (this._name === v) return;

            this._name = v;
        },
        get: function () {

            return this._name;
        }
    },
    value: {
        set: function (v) {

            if (this._value === v) return;

            this._value = v;
        },
        get: function () {

            return this._value;
        }
    },
    active: {
        set: function (v) {

            if (this._active === v) return;

            this._active = v;
            this._refreshActive();
        },
        get: function () {

            return this._active;
        }
    }
});







p._onChangeInput = function () {

    this.value = this._inputValue.value; 
};






p._refreshActive = function () {

    this._labelName.setActive(this.active);
    this._inputValue.setActive(this.active);
}






p._createBase = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.display = 'flex';
    this.domElem.style.width = '100%';
    this.domElem.style.height = '23px';

    this._labelName = amgui.createLabel({
        display: 'inline-block',
        caption: this.name + ' : ',
        parent: this.domElem,
    });

    this._inputValue = amgui.createInput({
        flex: 1,
        parent: this.domElem,
        onChange: this._onChangeInput,
    });
    this._inputValue.style.padding = '0 5px';
};


module.exports = Input;
