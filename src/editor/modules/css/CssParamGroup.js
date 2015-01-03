'use strict';

var inherits = require('inherits');
var OptionLine = require('../../utils/OptionLine');
var KeyLineGroup = require('../../utils/KeyLineGroup');
var CssParam = require('./CssParam');
var amgui = require('../../amgui');

function CssParamGroup (opt) {

    this._onChangeSubparamHeight = this._onChangeSubparamHeight.bind(this);
    this._onAddKeySubparam = this._onAddKeySubparam.bind(this);
    this._onClickTgglChildren = this._onClickTgglChildren.bind(this);
    this._onClickTgglMerge = this._onClickTgglMerge.bind(this);

    this._params = [];
    this._merged = false;
    this._collapsed = false;

    CssParam.call(this, opt);

    this._refreshHeights();
}

inherits(CssParamGroup, CssParam);
var p = CssParamGroup.prototype;
module.exports = CssParamGroup;



Object.defineProperties(p, {

    height: {

        get: function () {

            var ret = this._lineH;

            if (this.collapsed) {

                this._params.forEach(function (param) {

                    ret += param.height;
                });
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

            this.optionLine.buttons.tgglChildren.setToggle(v);
            this.emit('changeHeight', this);
            this._refreshHeights();
        },
        get: function () {

            return this._collapsed;
        }
    }
});


p.getSave = function () {

    var save = CssParam.prototype.getSave.call(this);

    delete save.keys;
    
    save.merged = this.merged;
    save.collapsed = this.collapsed;

    return save;
};

p.useSave = function (save) {

    CssParam.prototype.useSave.call(this, save);

    if ('merged' in save) save.merged = save.merged;
    if ('collapsed' in save) save.collapsed = save.collapsed;
};

p.addParam = function (param) {

    if (param.parentGroup) {
    console.log('addParam/removeParam', param.name)
        param.parentGroup.removeParam(param);
    }
    parent.parentGroup = this;

    console.log('addParam', param.name)
    this._params.push(param);
    this.optionLine.addSubline(param.optionLine.domElem);
    this.keyLine.addKeyLine(param.keyLine);
    
    param.optionLine.indent = this.optionLine.indent + 1;
    param.on('changeHeight', this._onChangeSubparamHeight);
    param.on('addKey', this._onAddKeySubparam);
    
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
    console.log('removeParam', param.name)
    parent.parentGroup = undefined;
    
    param.removeListener('changeHeight', this._onChangeSubparamHeight);
    param.removeListener('addKey', this._onAddKeySubparam);

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

    times = [];

    this._params.forEach(function (param) {
        
        [].push.apply(times, param.getKeyTimes());
    });

    _.uniq(times).forEach(this.addKeyAll, this);
};


p.addKeyAll = function (time) {

    time = time || am.timeline.currTime;

    this._params.forEach(function (param) {

        if (param instanceof CssParamGroup) {

            param.addKeyAll(time);
        }
        else {
            param.addKey({time: time});
        }
    });
};

p.removeKeyAll = function (time) {

    time = time || am.timeline.currTime;

    this._params.forEach(function (param) {

        var key = param.getKey(time);
        if (key) {
            param.removeKey(key);
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

p._onAddKeySubparam = function () {

    if (this._merged) {
    
        this.addKeyAll();
    }
};







p._refreshHeights = function () {

    var h = this.height;
    this.keyLine.domElem.style.height = h + 'px';
    this.optionLine.domElem.style.height = h + 'px';
}







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
};

p._createKeyline = function () {

    this.keyLine = new KeyLineGroup();
    this.keyLine.on('keyNeedsRemove', this._onKeyNeedsRemove);
};






p.dispose = function () {

    //TODO
};
