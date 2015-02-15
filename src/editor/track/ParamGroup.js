'use strict';

var inherits = require('inherits');
var OptionLine = require('../utils/OptionLine');
var KeyLineGroup = require('./KeyLineGroup');
var Param = require('./Param');

function ParamGroup (opt={}) {

    this.paramFactory = opt.paramFactory;

    this._params = [];
    this._merged = false;
    this._collapsed = false;

    this.borrowChildInputsOnCollapse = opt.borrowChildInputsOnCollapse;

    Param.apply(this, arguments);

    this.keyLine.keyLooks.circle = undefined;


    this._refreshHeights();

    this.on('change.hidden', () => this._refreshHeights());
}

inherits(ParamGroup, Param);
var p = ParamGroup.prototype;
module.exports = ParamGroup;


p.wake = function () {

    Param.prototype.wake.call(this);

    _.invoke(this._params, 'wake');
};

p.sleep = function () {

    Param.prototype.sleep.call(this);
        
    _.invoke(this._params, 'sleep');
};



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
            this.emit('change.height', this);
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
    }
});


p.getSave = function () {

    var save = Param.prototype.getSave.call(this);
    delete save.keys;

    save.merged = this.merged;
    save.collapsed = this.collapsed;
    save.children = this._params.map(p => p.getSave());

    return save;
};

p.useSave = function (save) {

    Param.prototype.useSave.call(this, save);

    if ('collapsed' in save) this.collapsed = save.collapsed;
    if ('merged' in save) this.merged = save.merged;
    if ('children' in save) save.children.forEach(childOpt => {

        childOpt.dontBuildFromRoot = true;
        this.addParam(childOpt);
    });
};

p.addParam = function (param) {

    if (param === this) throw Error;

    if (!(param instanceof Param)) {

        param = this.paramFactory.create(param);
    }

    if (param.parentGroup) {

        param.parentGroup.removeParam(param);
    }
    param.parentGroup = this;

    am.history.save({
        undo: () => this.removeParam(param),
        redo: () => this.addParam(param),
        name: 'add param ' + param.name,
    });

    this._params.push(param);
    this.optionLine.addOptionLine(param.optionLine);
    this.keyLine.addKeyLine(param.keyLine);
    param.wake();

    param.optionLine.indent = this.optionLine.indent + 1;

    param.on('change.keys', (...args) => this.emit('change.keys', ...args));//TODO param.forward('change.keys', this);
    param.on('change.height', this._onChangeSubparamHeight, this);
    param.on('addKey', this._onAddKeySubparam, this);
    param.on('need.remove', this._onSubparamNeedRemove, this);

    if (param.name in this.optionLine.inputs) {

        param.attachInput(this.optionLine.inputs[param.name]);
    }

    this.emit('addParam', param, this);
    this.emit('change.structure');
    this.emit('change.height');
    this._refreshHeights();

    return param;
};

p.removeParam = function (param) {

    if (!_.include(this._params, param)) return;

    am.history.save({
        undo: () => this.addParam(param),
        redo: () => this.removeParam(param),
        name: 'remove param ' + param.name,
    });

    param.sleep();
    parent.parentGroup = undefined;

    //TODO param.forwardOff('change.keys', this);
    param.off('change.height', this._onChangeSubparamHeight, this);
    param.off('addKey', this._onAddKeySubparam, this);
    param.off('need.remove', this._onSubparamNeedRemove, this);

    _.pull(this._params, param);
    this.optionLine.removeOptionLine(param.optionLine);
    this.keyLine.removeKeyline(param.keyLine);

    this.emit('removeParam', param, this);
    this.emit('change.structure', this);
    this.emit('change.height');
    this._refreshHeights();
};

p.getParam = function (paramName) {

    return this._params.find(param => param.name === paramName);
};

p.getParamNames = function () {

    return _.pluck(this._params, 'name');
};

p.getEndParams = function () {

    var ret = [];

    this._params.forEach(param => {

        if (param instanceof ParamGroup) {

            ret.push.apply(ret, param.getEndParams());
        }
        else {
            ret.push(param);
        }
    });

    return ret;
};

p.moveParam = function () {


};

p.toggleKey = function (time) {

    time = time || this.timeline.currTime;

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

p._makeKeyLinesSymmetric = function () {
//     console.time('_makeKeyLinesSymmetric');
    var times = [];

    this._params.forEach(param => {

        if (param.hidden) return;

        [].push.apply(times, param.getKeyTimes());
    });

    _.uniq(times).forEach(time => this.addKeyAll(time));
//     console.timeEnd('_makeKeyLinesSymmetric');
};


p.addKeyAll = function (time) {

    time = time === undefined ? this.timeline.currTime : time;

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

    time = time || this.timeline.currTime;

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








p._onSubparamNeedRemove = function (param) {

    if (this.static) {

        this.emit('need.remove', this);
    }
    else {
        this.removeParam(param);
    }
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

    this.emit('change.height', this);
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
            onClick: () => this._onClickTgglChildren(),
        },
        contextMenuOptions: [
            {text: 'move up', onSelect: () => am.dialogs.WIP.show()},
            {text: 'move down', onSelect: () => am.dialogs.WIP.show()},
            {text: 'delete', onSelect: () => this.emit('need.remove', this)},
        ],
        tgglMerge: {
            onClick: () => this._onClickTgglMerge(),
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

    this.keyLine = new KeyLineGroup({}, this.timeline);
};






p.dispose = function () {

    //TODO
};
