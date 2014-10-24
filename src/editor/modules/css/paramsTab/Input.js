'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../../../amgui');

function Input(opt) {

    EventEmitter.call(this);

    this._onChangeInput = this._onChangeInput.bind(this);
    this._onChangeParam = this._onChangeParam.bind(this);
    this._onSelect = this._onSelect.bind(this);
    this._onClickStepPrevKey = this._onClickStepPrevKey.bind(this);
    this._onClickStepNextKey = this._onClickStepNextKey.bind(this);
    this._onClickTgglKey = this._onClickTgglKey.bind(this);

    this._name = '';

    if ('name' in opt) this.name = opt.name;

    this._createBase();
}

inherits(Input, EventEmitter);
var p = Input.prototype;
module.exports = Input;



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

    if (this._currParam === param) return;
            
    this.removeParam();

    this._currParam = param;
    this._currParam.on('change', this._onChangeParam);

    this._refreshLayout();
};

p.removeParam = function () {

    if (!this._currParam) return;

    this._currParam.removeListener('change', this._onChangeParam);
}





p._onChangeInput = function () {

    this._currParam.value = this._inputValue.getValue(); 
};

p._onChangeParam = function () {

    this._refreshInput();
};

p._onClickStepPrevKey = function () {

    this._currParam.gotoPrevKey();
};

p._onClickStepNextKey = function () {

    this._currParam.gotoNextKey();
};

p._onClickTgglKey = function () {

    this._currParam.toggleKey();
};

p._onSelect = function () {

    if (!this._currParam) {

        this.emit('create', this);
    }
};






p._refreshInput = function () {

    if (this._inputValue.value !== this._currParam.value) {

        this._inputValue.value = this._currParam.value;
    }
};

p._refreshLayout = function () {

    var hasParam = !!this._currParam;

    this._iconAdd.style.display = hasParam ? 'none' : 'inline-block';
    this._inputValue.style.display = hasParam ? 'inline-block' : 'none';
    this._btnKey.style.display = hasParam ? 'inline-block' : 'none';
    this._labelName.style.color = hasParam ? amgui.color.text : amgui.color.textInactive;
};






p._createBase = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.display = 'flex';
    this.domElem.style.width = '100%';
    this.domElem.style.height = '23px';

    this.domElem.addEventListener('click', this._onSelect);

    this._iconAdd = amgui.createIcon({
        icon: 'plus',
        parent: this.domElem,
    });

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

    this._refreshLayout();
};
