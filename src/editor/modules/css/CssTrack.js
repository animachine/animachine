'use strict';

var Track = require('../../track/Track');
var inherits = require('inherits');
var amgui = require('../../amgui');
var CssParamFactory = require('./CssParamFactory');

function CssTrack (opt={}, timeline) {

    this._paramFactory = new CssParamFactory({}, timeline);

    Track.apply(this, arguments);

    this.paramGroup.optionLine.addButton({
        domElem: amgui.createToggleIconBtn({
            iconOn: 'eye',
            iconOff: 'eye-off',
            changeColor: true,
            onClick: () => this._onClickTgglHide(),
        }),
        name: 'tgglHide',
        childIdx: 1,
    });

    this.paramGroup.optionLine.addButton({
        domElem: amgui.createToggleIconBtn({
            tooltip: 'enable/disable 3d',
            icon: 'cube',
            changeColor: true,
            onClick: () => am.dialogs.WIP.show(),
        }),
        name: 'tggl3d',
        childIdx: 1,
    });

    //TODO do this somehow else
    this.paramGroup.on('addParam', param => {

        if (param.name === 'translate') {
            param.on('translateToBezier', this._switchFromTranslateToBezier, this);
        }
        else if (param.name === 'bezier') {
            param.parentTrack = this;//hack!
            param.on('bezierToTranslate', this._switchFromBezierToTranslate, this);
        }
    });

    if (this.paramGroup.getParam('translate')) {
        this.paramGroup.getParam('translate').on('translateToBezier', this._switchFromTranslateToBezier, this);
    }

    if (this.paramGroup.getParam('bezier')) {
        this.paramGroup.getParam('bezier').parentTrack = this;//hack!
        this.paramGroup.getParam('bezier').on('bezierToTranslate', this._switchFromBezierToTranslate, this);
    }
}

inherits(CssTrack, Track);
var p = CssTrack.prototype;
module.exports = CssTrack;

p.type = 'css_track_type';


p.focusTransformer = function (de) {

    if (!this._transformer) return;//TODO clean up

    de = de || this._currHandledDe;
    this._currHandledDe = de;

    if (!this._currHandledDe) return this._blurTransformer();

    this.emit('focusTransformer');

    var handOpt = {
            type: 'transformer',
            params: {},
        },
        xPercent = 0,
        yPercent = 0;

    var p = handOpt.params;
    this._endParams.forEach(function (param) {

        if (param.hidden) return;

        switch (param.name) {
            case 'x': p.tx = parseFloat(param.getValue()); break;
            case 'y': p.ty = parseFloat(param.getValue()); break;
            case 'scaleX': p.sx = parseFloat(param.getValue()); break;
            case 'scaleY': p.sy = parseFloat(param.getValue()); break;
            case 'rotationZ': p.rz = parseFloat(param.getValue()) / 180 * Math.PI; break;
            case 'transformOriginX': p.ox = parseFloat(param.getValue()) / 100; break;
            case 'transformOriginY': p.oy = parseFloat(param.getValue()) / 100; break;
            case 'bezier':
                var value = param.getValue();
                p.tx = parseFloat(value.x);
                p.ty = parseFloat(value.y);
            break;
            case 'xPercent': xPercent = parseFloat(param.getValue()); break;
            case 'yPercent': yPercent = parseFloat(param.getValue()); break;
        }
    });


    handOpt.base = this._transformer.setLocalRoot(de.parentNode, de);

    this._transformer.setup({
        hand: handOpt,
    });
    this._transformer.activate();

    am.deHandlerCont.appendChild(this._transformer.domElem);
};

p._blurTransformer = function () {

    this._currHandledDe = undefined;

    this.emit('blurTransformer');

    if (this._transformer && this._transformer.domElem && this._transformer.domElem.parentNode) {

        this._transformer.deactivate();
        this._transformer.domElem.parentNode.removeChild(this._transformer.domElem);
    }
};








p._switchFromTranslateToBezier = function () {

    var xParam = this.getParam('x'),
        yParam = this.getParam('y'),
        xParamSave = xParam.getSave(),
        yParamSave = yParam.getSave(),
        xKeys = xParamSave.keys,
        yKeys = yParamSave.keys,
        bezierKeys = [],
        times = _.sortBy(_.uniq(_.pluck(xKeys, 'time').concat(_.pluck(yKeys, 'time')))),
        oldBezierKeys = this.__bezierParamSave ? this.__bezierParamSave.keys : [];

    times.forEach(function (time) {

        var x = parseFloat(xParam.getValue(time)),
            y = parseFloat(yParam.getValue(time)),
            xKey = xParam.getKey(time),
            yKey = yParam.getKey(time),
            oldKey = _.find(oldBezierKeys, {time: time, anchor: {x:x, y:y}});

        bezierKeys.push(oldKey || {
            time: time,
            ease: (xKey && xKey.ease) || (yKey && yKey.ease),
            value: [{
                anchor: {x, y},
                handleLeft: {x, y},
                handleRight: {x, y},
            }]
        });
    });

    var bezierParam = this.addParam({
        name: 'bezier',
        keys: bezierKeys,
    });

    this.__xParamSave = xParamSave;
    this.__yParamSave = yParamSave;
    bezierParam.once('change', () => {
        delete this.__xParamSave;
        delete this.__yParamSave;
    });

    xParam.hidden = true;
    yParam.hidden = true;
    this.paramGroup.getParam('translate').hidden = true;
    bezierParam.hidden = false;

    this.focusTransformer();//for redraw the transformers(with curver)
};

p._switchFromBezierToTranslate = function () {

    //TODO restore original x, y keys when bezier wasn't changed

    var bezierParam = this.getParam('bezier'),
        bezierParamSave = bezierParam.getSave(),
        xKeys = [],
        yKeys = [];

    bezierParamSave.keys.forEach(function (bezierKey) {

        var lastPoint = _.last(bezierKey.value);

        xKeys.push({
            time: bezierKey.time,
            value: lastPoint.anchor.x + 'px',
        });
        yKeys.push({
            time: bezierKey.time,
            value: lastPoint.anchor.y + 'px',
        });
    });

    var xParam = this.addParam(this.__xParamSave || {
        name: 'x',
        keys: xKeys,
    });
    var yParam = this.addParam(this.__yParamSave || {
        name: 'y',
        keys: yKeys,
    });

    this.__bezierParamSave = bezierParamSave;

    xParam.hidden = false;
    yParam.hidden = false;
    this.paramGroup.getParam('translate').hidden = false;
    bezierParam.hidden = true;

    this.focusTransformer();//for redraw the transformers(without curver)
};









p._onClickTgglHide = function () {

    if (this._isHidingSelectedElems) {
        this._showSelectedElems();
    }
    else {
        this._hideSelectedElems();
    }
};

p._hideSelectedElems = function () {

    if (this._isHidingSelectedElems) return;
    this._isHidingSelectedElems = true;

    this.paramGroup.optionLine.buttons.tgglHide.setToggle(true);

    this._selectedElems.forEach(function (de) {

        de._amVisibilitySave = de.style.visibility;
        de.style.visibility = 'hidden';
    });
};

p._showSelectedElems = function () {

    if (!this._isHidingSelectedElems) return;
    this._isHidingSelectedElems = false;

    this.paramGroup.optionLine.buttons.tgglHide.setToggle(false);

    this._selectedElems.forEach(function (de) {

        de.style.visibility = de._amVisibilitySave;
    });
};
