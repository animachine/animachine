'use strict';

var inherits = require('inherits');
var uncalc = require('./uncalc');
var Key = require('../../utils/Key');
var Options = require('../../utils/Options');
var Keyline = require('../../utils/KeylineGroup');
var Keyline = require('./CssParam');
var amgui = require('../../amgui');

function CssParamGroup () {

    CsParam.call(this);

    this._params = [];
}

inherits(CssParamGroup, CssParam);
var p = CssParamGroup.prototype;
module.exports = CssParamGroup;






p.addParam = function (param) {

    this.removeParam(param);

    this._params.push(param);
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








p._onKeyNeedsRemove = function (key) {

    this._params.forEach(function (param) {

        var key = param.getKey(time);
        if (key) param.removeKey(key);
    });
};

p._onChangeTime = function () {

    this._refreshTgglKey();
};










p._createOptions = function () {

    this.options = new Options(_.merge({
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
    }, opt.options));

    this.attachInput(optinos.input);
};

p._createKeyline = function () {

    this.keyline = new KeylineGroup();
    this.keyline.on('keyNeedsRemove', this._onKeyNeedsRemove);
};






p.dispose = function () {

    //TODO
};
