'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../../amgui');
var paramFactory = require('./paramFactory');
var Transhand = require('transhand');
var KeyLineGroup = require('../../utils/KeyLineGroup');
var OptionLine = require('../../utils/OptionLine');
var CssParamGroup = require('./CssParamGroup');
var dialogTrackOptions = require('./dialogTrackOptions');
var mstPlayer = require('./script.player.mst');

function CssTrack(opt) {

    EventEmitter.call(this);

    this._selectors = [];
    this._endParams = [];
    this._name = 'unnamed';

    this._selectedElems = [];
    this._isHidingSelectedElems = false;
    this._isPlaying = false;

    this._onSelectClick = this._onSelectClick.bind(this);
    this._onDeleteParameter = this._onDeleteParameter.bind(this);
    this._onMoveParameter = this._onMoveParameter.bind(this);
    this._onClickTgglKey = this._onClickTgglKey.bind(this);
    this._onClickTgglHide = this._onClickTgglHide.bind(this);
    this._onClickName = this._onClickName.bind(this);
    this._onChangeHeight = this._onChangeHeight.bind(this);
    this._onChangeHandler = this._onChangeHandler.bind(this);
    this._onChangeTime = this._onChangeTime.bind(this);
    this._onChangeParameter = this._onChangeParameter.bind(this);
    this._onChangeName = this._onChangeName.bind(this);
    this._onChangeName = this._onChangeName.bind(this);
    this._onChangeSelectors = this._onChangeSelectors.bind(this);
    this._onWindowResize = this._onWindowResize.bind(this);
    this._onSelectTrack = this._onSelectTrack.bind(this);
    this._onDeselectTrack = this._onDeselectTrack.bind(this);
    this._animPlay = this._animPlay.bind(this);

    this._paramGroup = new CssParamGroup({});

    this.deOptionLine = this._paramGroup.optionLine.domElem;
    this.deKeyLine = this._paramGroup.keyLine.domElem;

    this.deOptionLine.addEventListener('click', this._onSelectClick);
    this.deKeyLine.addEventListener('click', this._onSelectClick);

    this._paramGroup.on('changeHeight', this._onChangeHeight);
    am.timeline.on('changeTime', this._onChangeTime);
    am.on('selectTrack', this._onSelectTrack);
    am.on('deselectTrack', this._onDeselectTrack);

    if (opt) {
        this.useSave(opt);
    }
}

inherits(CssTrack, EventEmitter);
var p = CssTrack.prototype;

p.type = 'css_track_type';






Object.defineProperties(p, {

    height: {

        get: function () {

            return this._paramGroup.height;
        }
    },

    name: {
        set: function (v) {

            if (v === this._name) return;

            this._name = v;
            this._paramGroup.optionLine.title = this._name;
        },
        get: function () {

            return this._name;
        }
    }
});






p.getSave = function () {

    var save = {
        name: this.name,
        selectors: _.clone(this._selectors),
        endParams: [],
        isShowingParams: this._isShowingParams,
    };

    this._endParams.forEach(function (param) {

        save.parameters.push(param.getSave());
    });

    return save;
};

p.useSave = function (save) {

    if (!save) {
        return;
    }

    this._selectors = save.selectors || [];

    if ('name' in save) this.name = save.name;

    if (save.endParams) {

        save.endParams.forEach(this.addParam, this);
    }

    this._selectElements();

    if (save.isShowingParams) {

        this._showParams();
    }
};

p.getScript = function () {

    var paramKeys = [], code = '', optionLine, selectors;

    this._endParams.forEach(function (param) {

        paramKeys.push(param.getScriptKeys());
    });

    optionLine = {
      direction: "normal",
      duration: am.timeline.length
    };

    selectors = this._selectors.join(',').replace('\\','\\\\');

    code = Mustache.render(mstPlayer, {
        paramKeys: JSON.stringify(paramKeys),
        optionLine: JSON.stringify(optionLine),
        selectors: selectors
    });

    return code;
};

p.addParam = function (opt, skipHistory) {

    opt = opt || {};

    var param = this._getParam(opt.name);
    

    if (param) {

        return param;
    }
    else {

        param = paramFactory.create(opt);

        if (!skipHistory) {
            am.history.save([this.removeParam, this, param, true],
                [this.addParam, this, param, true], 'add param ' + opt.name);
        }

        this._endParams.push(param);

        param.on('change', this._onChangeParameter);
        param.on('delete', this._onDeleteParameter);

        var paramGroupName = paramFactory.getGroupName(opt.name);

        if (paramGroupName) {

            var paramGroup = this._paramGroup.getParam(paramGroupName);

            if (!paramGroup) {

                paramGroup = paramFactory.createGroup({name: paramGroupName});
                this._paramGroup.addParam(paramGroup);
            }

            paramGroup.addParam(param);

            paramFactory.getGroupMembers(paramGroupName).forEach(function (memberParamName) {

                this.addParam(memberParamName);
            }, this);
        }
        else {
            this._paramGroup.addParam(param);
        }
     
        this.emit('change');
    
        return param;
    }
};

p.removeParam = function (param, skipHistory) {

    if (!skipHistory) {
        am.history.save([this.addParam, this, param, true],
            [this.removeParam, this, param, true], 'remove param ' + opt.name);
    }

    var idx = this._endParams.indexOf(param);

    if (idx === -1) {
        return;
    }

    this._endParams.splice(idx, 1);

    param.removeListener('change', this._onChangeParameter);
    param.removeListener('delete', this._onDeleteParameter);

    this._paramGroup.removeParam(param);

    $(param.deOptionLine).remove();
    $(param.deKeyline).remove();

    this.emit('change');
};

p.select = function (opt) {

    opt = opt || {};

    if (this._isSelected) return;
    this._isSelected = true;


    if (!this._handler) {
        this._handler = new Transhand();
    }

    this._handler.on('change', this._onChangeHandler);
    window.addEventListener('resize', this._onWindowResize);

    this._selectElements();

    if (this._selectedElems.length) {

        this.focusHandler(opt.focusElem || this._selectedElems[0]);
    }

    this._paramGroup.highlight = true;

    this.emit('select', this);
};

p.deselect = function () {

    if (!this._isSelected) return;
    this._isSelected = false;

    this._blurHandler();

    this._paramGroup.highlight = false;

    window.removeEventListener('resize', this._onWindowResize);

    if (this._handler) {

        this._handler.removeListener('change', this._onChangeHandler);
    }
};

p.renderTime = function (time) {

    if (this._selectors.length === 0) {
        return;
    }

    var selection = _.toArray(am.deRoot.querySelectorAll(this._selectors.join(','))),
        params = {};

    this._endParams.forEach(function (param) {

        params[param.name] = param.getValue(time);
    });

    if (selection.length && this._endParams.length) {

        TweenLite.set({selection, params});
    }
};

p.play = function () {

    this._isPlaying = true;

    this._animPlay();
};

p.pause = function () {

    this._isPlaying = false;

    window.cancelAnimationFrame(this._animPlayRafid);
};

p.getMagnetPoints = function () {

    return this._paramGroup.keyLine.getKeyTimes();
};

p.focusHandler = function (de) {

    de = de || this._currHandledDe;
    this._currHandledDe = de;

    if (!this._currHandledDe) return this._blurHandler();

    var transformSave;
    if (de.style.transform) {
        transformSave = de.style.transform;
        de.style.transform = '';
    }

    var br = de.getBoundingClientRect();

    de.style.transform = transformSave;

    var handOpt = {
        type: 'transformer',
        base: {
            x: br.left,
            y: br.top,
            w: br.width,
            h: br.height,
        },
        params: {}
    };

    var p = handOpt.params;
    this._endParams.forEach(function (param) {

        switch (param.name) {
            case 'x': p.tx = parseFloat(param.getValue()); break;
            case 'y': p.ty = parseFloat(param.getValue()); break;
            case 'scaleX': p.sx = parseFloat(param.getValue()); break;
            case 'scaleY': p.sy = parseFloat(param.getValue()); break;
            case 'rotateZ': p.rz = parseFloat(param.getValue()) / 180 * Math.PI; break;
            case 'transformOriginX': p.ox = parseFloat(param.getValue()) / 100; break;
            case 'transformOriginY': p.oy = parseFloat(param.getValue()) / 100; break;
        }
    });
    
    this._handler.setup({
        hand: handOpt
    });
    this._handler.activate();

    am.deHandlerCont.appendChild(this._handler.domElem);
};










p._animPlay = function () {

    this._animPlayRafid = window.requestAnimationFrame(this._animPlay);

    this.renderTime(am.timeline.currTime);
};

p._blurHandler = function () {

    this._currHandledDe = undefined;

    if (this._handler && this._handler.domElem && this._handler.domElem.parentNode) {

        this._handler.deactivate();
        this._handler.domElem.parentNode.removeChild(this._handler.domElem);
    }
};

p._hideSelectedElems = function () {

    if (this._isHidingSelectedElems) return;
    this._isHidingSelectedElems = true;

    this._tgglHide.setToggle(true);

    this._selectedElems.forEach(function (de) {

        de._amVisibilitySave = de.style.visibility;
        de.style.visibility = 'hidden';
    });
};

p._showSelectedElems = function () {

    if (!this._isHidingSelectedElems) return;
    this._isHidingSelectedElems = false;

    this._tgglHide.setToggle(false);

    this._selectedElems.forEach(function (de) {

        de.style.visibility = de._amVisibilitySave;
    });
};









p._onSelectTrack = function (track) {

    if (track === this) {
    
        this.select();
    }
};

p._onDeselectTrack = function () {

    this.deselect();
};

p._onSelectClick = function () {

    am.selectTrack(this);
};

p._onChangeHandler = function(params, type) {

    var time = am.timeline.currTime, 
        prop, value;

    var add = function (name, value) {

        prop = this.addParam({name: name});

        prop.addKey({
            time: time,
            value: value
        });
    }.bind(this);

    if (type === 'transform') {

        Object.keys(params).forEach(function (name) {

            switch (name) {
                case 'tx': add('x', params[name] + 'px'); break;
                case 'ty': add('y', params[name] + 'px'); break;
                case 'sx': add('scaleX', params[name]); break;
                case 'sy': add('scaleY', params[name]); break;
                case 'rz': add('rotateZ', (params[name] / Math.PI * 180) + 'deg'); break;
                case 'ox': add('transformOriginX', (params[name] * 100) + '%'); break;
                case 'oy': add('transformOriginY', (params[name] * 100) + '%'); break;
            }
        });
    }

    this.renderTime(time);
    this.focusHandler();
};

p._onChangeTime = function (time) {

    if (this._isPlaying) {
        return;
    }

    this.renderTime(time);
    this.focusHandler();
};

p._onChangeParameter = function () {

    this.renderTime();
    this.focusHandler();

    this.emit('change');
};


p._onWindowResize = function () {

    this.focusHandler();
};

p._onDeleteParameter = function (param) {

    this.removeParam(param);
};

p._onMoveParameter = function (param, way) {

    this.moveParameter(param, way);
};

p._onClickTgglKey = function () {

    var time = am.timeline.currTime,
        allHaveKey = this._isAllParamsHaveKey(time),
        flag = am.history.startFlag('toggle keys');

    this._endParams.forEach(function (param) {

        if (param.isValid()) {

            if (allHaveKey) {
                param.removeKey(param.getKey(time));
            }
            else {
                param.addKey({time: time});
            }
        }
    });

    am.history.endFlag(flag);
};

p._onClickTgglHide = function () {

    if (this._isHidingSelectedElems) {
        this._showSelectedElems();
    }
    else {
        this._hideSelectedElems();
    }
};

p._onClickName = function () {

    dialogTrackOptions.show({
        name: this._name,
        selectors: this._selectors,
        onChangeName: this._onChangeName,
        onChangeSelectors: this._onChangeSelectors
    });
};

p._onChangeName = function (name) {

    this.name = name;
};

p._onChangeSelectors = function (selectors) {

    this._selectors.length = 0;
    this._selectors = this._selectors.concat(selectors);

    this._selectElements();

    if (this._selectedElems.indexOf(this._currHandledDe) === -1) {

        this._currHandledDe = undefined;
    }

    this.focusHandler(this._currHandledDe || this._selectedElems[0]);
};

p._onChangeHeight = function (selectors) {

    this.emit('changeHeight', this);
};











p._isAllParamsHaveKey = function (time) {

    return this._endParams.every(function (param) {

        return param.getKey(time) || !param.isValid();
    });
};

p._getParam = function (name) {

    return this._endParams.find(function(param) {

        return param.name === name;
    });
};













p.isOwnedDomElem = function (de) {

    return this._selectedElems.indexOf(de) !== -1;
};

p._selectElements = function () {

    var list = [];

    this._selectors.forEach(function (selector) {

        var items = am.deRoot.querySelectorAll(selector);
        items = Array.prototype.slice.call(items);
        list = list.concat(items);
    });

    this._selectedElems = list;
};

p.dispose = function () {

    am.timeline.removeListener('changeTime', this._onChangeTime);

    //TODO
};

module.exports = CssTrack;




