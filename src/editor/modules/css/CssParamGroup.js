'use strict';

var inherits = require('inherits');
var OptionsLine = require('../../utils/OptionsLine');
var KeylineGroup = require('../../utils/KeylineGroup');
var CssParam = require('./CssParam');
var amgui = require('../../amgui');

function CssParamGroup () {

    CsParam.call(this);

    this._params = [];
}

inherits(CssParamGroup, CssParam);
var p = CssParamGroup.prototype;
module.exports = CssParamGroup;



Object.defineProperties(p, {

    height: {

        get: function () {

            var ret = this._baseH;

            if (this._isShowingSubparams) {

                this._params.forEach(function (param) {

                    ret += param.height;
                });
            }

            return ret;
        }
    },

    name: {
        set: function (v) {

            if (v === this._name) return;

            this._name = v;
            this._deName.textContent = this._name;
        },
        get: function () {

            return this._name;
        }
    }
});




p.addParam = function (param) {

    this.removeParam(param);

    this._params.push(param);
    this.optionsLine.addSubline(param.options.domElem);
    this.keyline.addKeyline(param.keyline);
};

p.removeParam = function (param) {

    var idx = this._params.indexOf(param);

    if (idx === -1) {
        return;
    }

    this._params.splice(idx, 1);
    this.keyline.removeKeyline(param.keyline);
};

p.toggleKey = function () {

    var time = am.timeline.currTime,
        haveKey = this._params.some(function (param) {

        return param.getKey(time);
    });

    this._params.forEach(function (param) {

        if (haveKey) {

            var key = param.getKey(time);
            if (key) param.removeKey(key);
        }
        else {
            param.addKey({time: time});
        }
    });
};

p.showSubarams = function () {

    if (this._isShowingSubparams) return;
    this._isShowingSubparams = true;

    this._tgglParams.setToggle(true);
    this.emit('changeHeight', this);
};

p.hideSubparams = function () {

    if (!this._isShowingSubparams) return;
    this._isShowingSubparams = false;

    this._tgglParams.setToggle(false);
    this.emit('changeHeight', this);
};







p._onKeyNeedsRemove = function (key) {

    this._params.forEach(function (param) {

        var key = param.getKey(time);
        if (key) param.removeKey(key);
    });
};

p._onChangeTime = function () {

    this._refreshTgglKey();
};

p._onClickTgglSubparams = function () {

    if (this._isShowingSubparams) {
        this.hideSubparams();
    }
    else {
        this.showSubparams();
    }
};










p._createOptions = function (opt) {

    this.options = new OptionsLine(_.merge({
        contextMenuOptions: [
            {text: 'move up', onSelect: this.emit.bind(this, 'move', this, -1)},
            {text: 'move down', onSelect: this.emit.bind(this, 'move', this, 1)},
            {text: 'delete', onSelect: this.emit.bind(this, 'delete', this)}
        ],
        text: {
            text: this.name
        },
        btnKey: {
            onClick: this._onClickTgglKey,
            onClickPrev: this._onClickStepPrevKey,
            onClickNext: this._onClickStepNextKey,
        },
        input: {
            type: 'unit',
            onChange: this._onChangeInput,
            units: []
        },
        indent: 0,
        hasSubcontainer: true,
    }, opt));

    this.attachInput(optinos.input);
};

p._createKeyline = function () {

    this.keyline = new KeylineGroup();
    this.keyline.on('keyNeedsRemove', this._onKeyNeedsRemove);
};






p.dispose = function () {

    //TODO
};
