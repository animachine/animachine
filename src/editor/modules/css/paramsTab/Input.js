'use strict';

var amgui = require('../../../amgui');

function Input(opt) {

    this._name = '';
    this._value = '';

    if ('name' in opt) this.name = opt.name;
    if ('value' in opt) this.value = opt.value;

    this._createBase();

    this._onChangeInput = this._onChangeInput.bind(this);
    this._onChangeParam = this._onChangeParam.bind(this);
    this._onClickStepPrevKey = this._onClickStepPrevKey.bind(this);
    this._onClickStepNextKey = this._onClickStepNextKey.bind(this);
    this._onClickTgglKey = this._onClickTgglKey.bind(this);
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
    }
});

p.setParam = function (param) {

    if (this._param === param) return;
            
    if (this._param) {

        this._param.removeListener('change', this._onChangeParam);
    }

    this._param = param;
    this._param.on('change', this._onChangeParam);
};





p._onChangeInput = function () {

    this.value = this._inputValue.value; 
};

p._onChangeParam = function () {

    this.value = this._inputValue.value; 
};

p._onClickStepPrevKey = function () {

    this._param.gotoPrevKey();
};

p._onClickStepNextKey = function () {

    this._param.gotoNextKey();
};

p._onClickTgglKey = function () {

    this._param.toggleKey();
};






p._refreshActive = function () {

    this._labelName.setActive(this.active);
    this._inputValue.setActive(this.active);
};






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

    this._btnKey = amgui.createStepperKey({
        parent: this.domElem,
        onClickPrev: this._onClickStepPrevKey,
        onClickNext: this._onClickStepNextKey,
        onClick: this._onClickTgglKey,
    });
};


module.exports = Input;
