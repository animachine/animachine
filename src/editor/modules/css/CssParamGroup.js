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

    CssParam.call(this, opt);

    this._params = [];

    this._merged = opt.merged || false;

    this._refreshHeights();
}

inherits(CssParamGroup, CssParam);
var p = CssParamGroup.prototype;
module.exports = CssParamGroup;



Object.defineProperties(p, {

    height: {

        get: function () {

            var ret = this._lineH;

            if (this._isShowingSubparams) {

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

            this.optionLine.buttons.tgglMerge.setToggle(this._merged);
            this.optionLine.buttons.tgglChildren.inactive = this._merged;
            
            if (this._merged) {
                
                this.hideSubparams(); 
                this._makeKeyLinesSymmetric();
            } 
            else {
                this.showSubparams();
            }

        },
        get: function () {

            return this._merged;
        }
    }
});




p.addParam = function (param) {

    if (param.parentGroup) {

        param.parentGroup.removeParam(param);
    }
    parent.parentGroup = this;

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
    
    parent.parentGroup = undefined;
    
    param.removeListener('changeHeight', this._onChangeSubparamHeight);
    param.removeListener('addKey', this._onAddKeySubparam);

    this._params.splice(idx, 1);
    this.keyLine.removeKeyline(param.keyLine);

    this.emit('changeHeight');
    this._refreshHeights();
};

p.moveParam = function () {

    
};

p.getParam = function (paramName) {

    return this._params.find(function (param) {

        return param.name === paramName
    })
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

p.showSubparams = function () {

    if (this._isShowingSubparams) return;
    this._isShowingSubparams = true;

    this.optionLine.buttons.tgglChildren.setToggle(true);
    this.emit('changeHeight', this);
    this._refreshHeights();
};

p.hideSubparams = function () {

    if (!this._isShowingSubparams) return;
    this._isShowingSubparams = false;

    this.optionLine.buttons.tgglChildren.setToggle(false);
    this.emit('changeHeight', this);
    this._refreshHeights();
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

    if (this._isShowingSubparams) {
        this.hideSubparams();
    }
    else {
        this.showSubparams();
    }
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
