'use strict';

var inherits = require('inherits');
var OptionLine = require('../utils/OptionLine');
var KeyLineGroup = require('../utils/KeyLineGroup');
var Param = require('./Param');
var amgui = require('../amgui');

function ParamGroup (opt={}) {

    this._onClickTgglChildren = this._onClickTgglChildren.bind(this);
    this._onClickTgglMerge = this._onClickTgglMerge.bind(this);

    this._params = [];
    this._merged = false;
    this._collapsed = false;

    this.borrowChildInputsOnCollapse = opt.borrowChildInputsOnCollapse;

    Param.call(this, opt);
    
    this.keyLine.keyLooks.circle = undefined;
    

    this._refreshHeights();
}

inherits(ParamGroup, Param);
var p = ParamGroup.prototype;
module.exports = ParamGroup;



Object.defineProperties(p, {

    height: {

        get: function () {

            var ret = this.hidden ? 0 : this._lineH;

            if (!this.collapsed) {
                this._params.forEach(param => ret += param.height);
            }

            return ret;
        }
    },
    merged: {

        set: function (v) {

            v = !!v;
            if (v === this._merged) return;
            
            this._merged = v;

            this.optionLine.buttons.tgglMerge.setToggle(v);
            this.optionLine.buttons.tgglChildren.inactive = v;
            this.keyLine.keyLooks.circle = v ? {} : undefined;
            this.keyLine._render();//TODO: do this keyLooks thing somehow better
            this.collapsed = v;

            if (v) this._makeKeyLinesSymmetric();
        },
        get: function () {

            return this._merged;
        }
    },
    collapsed: {

        set: function (v) {

            v = !!v;
            if (v === this._collapsed) return;

            this._collapsed = v;

            this.optionLine.buttons.tgglChildren.setToggle(!v);
            this.emit('changeHeight', this);
            this._refreshHeights();

            if (this.borrowChildInputsOnCollapse) {
                if (v) {
                    this.optionLine.borrowChildInputs();
                }
                else {
                    this.optionLine.returnChildInputs();
                }
            }
        },
        get: function () {

            return this._collapsed;
        }
    },
});


p.getSave = function () {

    var save = Param.prototype.getSave.call(this);

    delete save.keys;
    
    save.merged = this.merged;
    save.collapsed = this.collapsed;

    return save;
};

p.useSave = function (save) {

    Param.prototype.useSave.call(this, save);

    if ('collapsed' in save) this.collapsed = save.collapsed;
    if ('merged' in save) this.merged = save.merged;
};

p.addParam = function (param) {

    if (param.parentGroup) {
        param.parentGroup.removeParam(param);
    }
    param.parentGroup = this;

    this._params.push(param);
    this.optionLine.addOptionLine(param.optionLine);
    this.keyLine.addKeyLine(param.keyLine);
    
    param.optionLine.indent = this.optionLine.indent + 1;
    param.on('changeHeight', this._onChangeSubparamHeight, this);
    param.on('addKey', this._onAddKeySubparam, this);
    param.on('needsRemove', this._onSubparamNeedsRemove, this);
    
    if (param.name in this.optionLine.inputs) {

        param.attachInput(this.optionLine.inputs[param.name]);
    }

    this.emit('changeHeight');
    this._refreshHeights();
};

p.removeParam = function (param) {

    var idx = this._params.indexOf(param);

    if (idx === -1) {
        return;
    }
    
    parent.parentGroup = undefined;
    
    param.off('changeHeight', this._onChangeSubparamHeight, this);
    param.off('addKey', this._onAddKeySubparam, this);
    param.off('needsRemove', this._onSubparamNeedsRemove, this);

    this._params.splice(idx, 1);
    this.keyLine.removeKeyline(param.keyLine);

    this.emit('changeHeight');
    this._refreshHeights();
};

p.getParam = function (paramName) {

    return this._params.find(param => param.name === paramName);
};

p.getParamNames = function () {

    return _.pluck(this._params, 'name');
};

p.moveParam = function () {

    
};

p.toggleKey = function (time) {

    time = time || am.timeline.currTime;

    var hasKey = this._params.some(function (param) {

        return param.getKey(time);
    });

    if (hasKey) {

        this.removeKeyAll(time);
    }
    else {
        this.addKeyAll(time);
    }
};

p._makeKeyLinesSymmetric = function (time) {
    console.time('_makeKeyLinesSymmetric');
    var times = [];

    this._params.forEach(param => {

        if (param.hidden) return;
        
        [].push.apply(times, param.getKeyTimes());
    });

    _.uniq(times).forEach(time => this.addKeyAll(time));
    console.timeEnd('_makeKeyLinesSymmetric');
};


p.addKeyAll = function (time) {

    time = time === undefined ? am.timeline.currTime : time;

    this._params.forEach(param => {

        if (param.hidden) return;

        if (param instanceof ParamGroup) {

            param.addKeyAll(time);
        }
        else {
            param.addKey({time: time});
        }
    });
};

p.removeKeyAll = function (time) {

    time = time || am.timeline.currTime;

    this._params.forEach(param => {

        if (param.hidden) return;

        var key = param.getKey(time);
        if (key) {
            param.removeKey(key);
        }
    });
};




p._isKeySet = function (time) {

    //empty groups returns true except if this is the root paramGroup
    return (this.parentGroup || this._params.length !== 0) && 
        this._params.every(p => p._isKeySet(time));
};







p._onKeyNeedsRemove = function (key) {

    this._params.forEach(function (param) {

        var key = param.getKey(time);
        if (key) param.removeKey(key);
    });
};

p._onSubparamNeedsRemove = function (key) {

    this.emit('needsRemove', this);
};

p._onChangeTime = function () {

    this._refreshTgglKey();
};

p._onClickTgglChildren = function () {

    this.collapsed = !this.collapsed;
};

p._onClickTgglMerge = function () {

    this.merged = !this.merged;
};

p._onChangeSubparamHeight = function () {

    this.emit('changeHeight', this);
    this._refreshHeights();
};

p._onAddKeySubparam = function (key, param) {

    if (this._merged && !param.hidden) {
    
        this.addKeyAll(key.time);
    }
};







p._refreshHeights = function () {

    var h = this.height;
    this.keyLine.domElem.style.height = h + 'px';
    this.optionLine.domElem.style.height = h + 'px';
};







p._createOptions = function (opt) {

    this.optionLine = new OptionLine(_.merge({
        tgglChildren: {
            onClick: this._onClickTgglChildren,
        },
        contextMenuOptions: [
            {text: 'move up', onSelect: this.emit.bind(this, 'move', this, -1)},
            {text: 'move down', onSelect: this.emit.bind(this, 'move', this, 1)},
            {text: 'delete', onSelect: this.emit.bind(this, 'delete', this)}
        ],
        tgglMerge: {
            onClick: this._onClickTgglMerge,
        },
        title: {
            text: this.name,
        },
        btnKey: {
            onClick: this._onClickTgglKey,
            onClickPrev: this._onClickStepPrevKey,
            onClickNext: this._onClickStepNextKey,
        },
        indent: 0,
        hasSubcontainer: true,
    }, opt));

    this.optionLine.buttons.tgglChildren.setToggle(true);
};

p._createKeyline = function () {

    this.keyLine = new KeyLineGroup();
    this.keyLine.on('keyNeedsRemove', this._onKeyNeedsRemove);
};






p.dispose = function () {

    //TODO
};
