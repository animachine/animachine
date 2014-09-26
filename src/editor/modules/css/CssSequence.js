var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../../amgui');
var CssParameter = require('./CssParameter');
var CssTransformParameter = require('./CssTransformParameter');
var Key = require('./Key');
var Transhand = require('../../transhand/Transhand');
var mstPlayer = require('./script.player.mst');
var dialogSequOptions = require('./dialogSequOptions');

function CssSequence(opt) {

    EventEmitter.call(this);

    this._selectors = [];
    this._parameters = [];
    this._fill = 'forward';
    this._name = 'unnamed';
    this._iterations = 1;

    this._baseH = 21;
    this._selectedElems = [];
    this._headKeys = [];
    this._isShowingParams = false;
    this._isHidingSelectedElems = false;
    this._isPlaying = false;

    this._onSelectClick = this._onSelectClick.bind(this);
    this._onChangeHandler = this._onChangeHandler.bind(this);
    this._onChangeTime = this._onChangeTime.bind(this);
    this._onChangeParameter = this._onChangeParameter.bind(this);
    this._onDeleteParameter = this._onDeleteParameter.bind(this);
    this._onMoveParameter = this._onMoveParameter.bind(this);
    this._onChangeBlankParameter = this._onChangeBlankParameter.bind(this);
    this._onClickTgglKey = this._onClickTgglKey.bind(this);
    this._onClickTgglHide = this._onClickTgglHide.bind(this);
    this._onClickTgglShowParams = this._onClickTgglShowParams.bind(this);
    this._onClickName = this._onClickName.bind(this);
    this._onChangeName = this._onChangeName.bind(this);
    this._onChangeName = this._onChangeName.bind(this);
    this._onChangeFill = this._onChangeFill.bind(this);
    this._onChangeIterations = this._onChangeIterations.bind(this);
    this._onChangeSelectors = this._onChangeSelectors.bind(this);
    this._onWindowResize = this._onWindowResize.bind(this);
    this._animPlay = this._animPlay.bind(this);

    this.deOptions = document.createElement('div');
    this.deKeys = document.createElement('div');

    this._deHeadOptinos = this._createHeadOptions();
    this._deHeadKeyline = amgui.createKeyline({});
    this.deKeys.appendChild(this._deHeadKeyline);

    am.timeline.on('changeTime', this._onChangeTime);
    this.deOptions.addEventListener('click', this._onSelectClick);
    this.deKeys.addEventListener('click', this._onSelectClick);

    this._onChangeBlankParameter();

    if (opt) {
        this.useSave(opt);
    }
}

inherits(CssSequence, EventEmitter);
var p = CssSequence.prototype;

p.type = 'css_sequ_type';






Object.defineProperties(p, {

    height: {

        get: function () {

            var ret = this._baseH;

            if (this._isShowingParams) {

                this._parameters.forEach(function (param) {

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
    },

    fill: {
        set: function (v) {

            if (v === this._fill) return;

            this._fill = v;
        },
        get: function () {

            return this._fill;
        }
    },

    iterations: {
        set: function (v) {

            if (v === this._iterations) return;

            this._iterations = v;
        },
        get: function () {

            return this._iterations;
        }
    }
});






p.getSave = function () {

    var save = {
        name: this.name,
        fill: this.fill,
        iterations: this.iterations,
        selectors: _.clone(this._selectors),
        parameters: [],
        isShowingParams: this._isShowingParams,
    };

    this._parameters.forEach(function (param) {

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
    if ('fill' in save) this.fill = save.fill;
    if ('iterations' in save) this.iterations = save.iterations;

    if (save.parameters) {

        save.parameters.forEach(this.addParameter, this);
    }

    this._selectElements();
    this._refreshHeadKeyline();
    this._refreshTgglKey();

    if (save.isShowingParams) {

        this._showParams();
    }
};

p.getScript = function () {

    var paramKeys = [], code = '', options, selectors;

    this._parameters.forEach(function (param) {

        paramKeys.push(param.getScriptKeys());
    });

    options = {
      direction: "normal",
      duration: am.timeline.length,
      iterations: this.iterations,
      fill: this.fill,
    };

    selectors = this._selectors.join(',').replace('\\','\\\\');

    code = Mustache.render(mstPlayer, {
        paramKeys: JSON.stringify(paramKeys),
        options: JSON.stringify(options),
        selectors: selectors
    });

    return code;
};

p.addParameter = function (opt, skipHistory) {

    opt = opt || {};

    var param = this._getParameter(opt.name);
    

    if (param) {

        return param;
    }
    else {

        if (opt.name === 'transform') {

            param = new CssTransformParameter(opt);
        }
        else {

            param = new CssParameter(opt);
        }

        if (!skipHistory) {
            am.history.save([this.removeParameter, this, param, true],
                [this.addParameter, this, param, true]);
        }

        this._parameters.push(param);
        param.on('change', this._onChangeParameter);
        param.on('delete', this._onDeleteParameter);
        param.on('move', this._onMoveParameter);

        this._refreshParameterOrdering();
        this._moveBlankParameterDown();
        this.emit('changeHeight', this);

        return param;
    }
};

p.removeParameter = function (param, skipHistory) {

    if (!skipHistory) {
        am.history.save([this.addParameter, this, param, true],
            [this.removeParameter, this, param, true]);
    }

    var idx = this._parameters.indexOf(param);

    if (idx === -1) {
        return;
    }

    this._parameters.splice(idx, 1);

    param.removeListener('change', this._onChangeParameter);
    param.removeListener('delete', this._onDeleteParameter);
    param.removeListener('move', this._onMoveParameter);

    $(param.deOptions).remove();
    $(param.deKeyline).remove();
};

p.moveParameter = function (param, way) {

    var idx = this._parameters.indexOf(param);

    this._parameters.splice(idx, 1);
    idx = Math.min(this._parameters.length, Math.max(0, idx + way));
    this._parameters.splice(idx, 0, param);

    this._refreshParameterOrdering();
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

        this._focusHandler(opt.focusElem || this._selectedElems[0]);
    }

    this.deHighlight.style.opacity = 1;

    this.emit('select', this);
};

p.deselect = function () {

    if (!this._isSelected) return;
    this._isSelected = false;

    this._blurHandler();

    this.deHighlight.style.opacity = 0;

    window.removeEventListener('resize', this._onWindowResize);

    if (this._handler) {

        this._handler.removeListener('change', this._onChangeHandler);
    }
};

p.renderTime = function (time) {

    if (this._selectors.length === 0) {
        return;
    }

    var selection = _.toArray(am.deRoot.querySelectorAll(this._selectors.join(',')));

    this._parameters.forEach(function (param) {

        selection.forEach(function (de) {

            de.style[param.name] = param.getValue(time);
        });
    });
};

p._onPick = function (de) {

    var items = am.deRoot.querySelectorAll(this.selectors.join(','));

    if (items.indexOf(de)) {

        this.select();
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

    var times = [];

    this._headKeys.forEach(function (key) {

        times.push(key.time);
    });

    return times;
};










p._animPlay = function () {

    this._animPlayRafid = window.requestAnimationFrame(this._animPlay);

    this.renderTime(am.timeline.currTime);
};

p._focusHandler = function (de) {

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
    var transformParam = this._getParameter('transform');
    var transformOriginParam = this._getParameter('transform-origin');

    if (transformParam instanceof CssTransformParameter) {

        _.extend(handOpt.params, transformParam.getRawValue());
    }

    if (transformOriginParam) {

        var val = transformOriginParam.getValue(),
            match = /\s*([\d\.]+)%\s*([\d\.]+)%/.exec(val);

        if (match) {
            handOpt.params.ox = match[1] / 100;
            handOpt.params.oy = (match[2] || match[1]) / 100;
        }
    }

    this._handler.setup({
        hand: handOpt
    });
    this._handler.activate();

    am.deHandlerCont.appendChild(this._handler.domElem);
};

p._blurHandler = function () {

    this._currHandledDe = undefined;

    if (this._handler && this._handler.domElem && this._handler.domElem.parentNode) {

        this._handler.deactivate();
        this._handler.domElem.parentNode.removeChild(this._handler.domElem);
    }
};

p._moveBlankParameterDown = function () {

    if (!this._blankParameter) {
        return;
    }

    var idx = this._parameters.indexOf(this._blankParameter);

    if (idx < this._parameters.length - 1) {

        this.moveParameter(this._blankParameter, (this._parameters.length - 1) - idx)
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

p._showParams = function () {

    if (this._isShowingParams) return;
    this._isShowingParams = true;

    this._tgglParams.setToggle(true);
    this.emit('changeHeight', this);
};

p._hideParams = function () {

    if (!this._isShowingParams) return;
    this._isShowingParams = false;

    this._tgglParams.setToggle(false);
    this.emit('changeHeight', this);
};








p._onSelectClick = function () {

    this.select();
};

p._onChangeHandler = function(params, type) {

    var time = am.timeline.currTime,
        name, prop, value;

    if (type === 'transform') {

        Object.keys(params).forEach(function (name) {

            if (name === 'tx' || name === 'ty' || name === 'tz' ||
                name === 'rx' || name === 'ry' || name === 'rz' ||
                name === 'sx' || name === 'sy' || name === 'sz')
            {
                value = {};
                value[name] = params[name];

                prop = this.addParameter({name: 'transform'});
                prop.addKey({
                    time: time,
                    value: value
                });
            }
        }, this);

        if ('ox' in params && 'oy' in params) {

            prop = this.addParameter({name: 'transform-origin'});
            prop.addKey({
                time: time,
                value: (params.ox*100).toFixed(2) + '% ' + (params.oy*100).toFixed(2) + '%'
            });
        }
    }

    this.renderTime(time);
    this._focusHandler();
};

p._onChangeTime = function (time) {

    if (this._isPlaying) {
        return;
    }

    this._parameters.forEach(function (param) {

        this.renderTime(time);
        this._focusHandler();
        this._refreshTgglKey();
    }, this);
};

p._onChangeParameter = function () {

    this.renderTime();
    this._focusHandler();
    this._refreshHeadKeyline();
    this._refreshTgglKey();

    this.emit('change');
};


p._onWindowResize = function () {

    this._focusHandler();
};

p._onDeleteParameter = function (param) {

    this.removeParameter(param);
};

p._onMoveParameter = function (param, way) {

    this.moveParameter(param, way);
};

p._onChangeBlankParameter = function () {

    if (this._blankParameter) {

        this._blankParameter.removeListener('change', this._onChangeBlankParameter);
        this._blankParameter = undefined;
    };

    this._blankParameter = this.addParameter();
    this._blankParameter.on('change', this._onChangeBlankParameter);
};

p._onClickTgglKey = function () {

    var time = am.timeline.currTime,
        allHaveKey = this._isAllParamsHaveKey(time),
        flag = am.history.startFlag();

    this._parameters.forEach(function (param) {

        if (param.isValid()) {

            if (allHaveKey) {
                param.removeKey(param.getKey(time));
            }
            else {
                param.addKey({time: time});
            }
        }
    });

    this._refreshTgglKey();

    am.history.endFlag(flag);
};

p._onClickTgglShowParams = function () {

    if (this._isShowingParams) {
        this._hideParams();
    }
    else {
        this._showParams();
    }
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

    dialogSequOptions.show({
        name: this._name,
        selectors: this._selectors,
        fill: this.fill,
        iterations: this.iterations,
        onChangeName: this._onChangeName,
        onChangeFill: this._onChangeFill,
        onChangeIterations: this._onChangeIterations,
        onChangeSelectors: this._onChangeSelectors
    });
};

p._onChangeName = function (name) {

    this.name = name;
};

p._onChangeFill = function (fill) {

    this.fill = fill;
};

p._onChangeIterations = function (itarations) {

    this.iterations = itarations;
};

p._onChangeSelectors = function (selectors) {

    this._selectors.length = 0;
    this._selectors = this._selectors.concat(selectors);

    this._selectElements();

    if (this._selectedElems.indexOf(this._currHandledDe) === -1) {

        this._currHandledDe = undefined;
    }

    this._focusHandler(this._currHandledDe || this._selectedElems[0])
};











p._isAllParamsHaveKey = function (time) {

    return this._parameters.every(function (param) {

        return param.getKey(time) || !param.isValid();
    });
};

p._getParameter = function (name) {

    return this._parameters.find(function(param) {

        return param.name === name;
    });
};

p._refreshTgglKey = function () {

    this._tgglKey.setToggle( this._isAllParamsHaveKey(am.timeline.currTime));
};


p._refreshHeadKeyline = function () {

    var times = [], oldKeys = this._headKeys.splice(0);

    this._parameters.forEach(function (param) {

        times = times.concat(param.getKeyTimes());
    });

    times = _.uniq(times);

    times.forEach(function (time) {

        var key = oldKeys.pop() || new Key({
            deKeyline: this._deHeadKeyline,
            ease: 'none',
            color: '#063501'
        });

        key.domElem.style.pointerEvents = 'none';//hack! until finish the control with head keys

        key.time = time;

        this._headKeys.push(key);
    }, this);

    _.invoke(_.difference(oldKeys, this._headKeys), 'dispose');
};

p._refreshParameterOrdering = function () {

    this._parameters.forEach(function (param) {

        this.deOptions.appendChild(param.deOptions);
        this.deKeys.appendChild(param.deKeyline);
    }, this);
};











p._createHeadOptions = function (){

    var de = document.createElement('div');
    de.style.position = 'relative';
    de.style.width = '100%';
    de.style.display = 'flex';
    de.style.height = this._baseH + 'px';
    de.style.background = 'linear-gradient(to bottom, #063501 18%,#064100 96%)';
    this.deOptions.appendChild(de);

    this.deHighlight = document.createElement('div');
    this.deHighlight.style.display = 'inline-block';
    this.deHighlight.style.width = '2px';
    this.deHighlight.style.height = this._baseH + 'px';
    this.deHighlight.style.background = 'gold';
    this.deHighlight.style.opacity = 0;
    de.appendChild(this.deHighlight);

    this._tgglParams = amgui.createToggleIconBtn({
        iconOn: 'angle-down',
        iconOff: 'angle-right',
        height: this._baseH,
        onClick: this._onClickTgglShowParams,
        parent: de
    });

    this._deName = amgui.createLabel({caption: this._name, parent: de});
    this._deName.style.height = this._baseH  + 'px';
    this._deName.style.cursor = 'pointer';
    this._deName.addEventListener('click', this._onClickName);

    var deNameIcon = amgui.createIcon({
        icon: 'cog',
        parent: de
    });
    deNameIcon.style.display = 'none';
    this._deName.addEventListener('mouseenter', function () {deNameIcon.style.display = 'inline-block';})
    this._deName.addEventListener('mouseleave', function () {deNameIcon.style.display = 'none';})

    var space = document.createElement('div');
    space.style.display = 'inline-block';
    space.style.flex = '1';
    space.style.pointerEvents = 'none';
    de.appendChild(space);

    this._tgglHide = amgui.createToggleIconBtn({
        iconOn: 'eye-off', 
        iconOff: 'eye', 
        height: this._baseH,
        defaultToggle: false,
        onClick: this._onClickTgglHide,
        changeColor: true,
        parent: de
    });

    this._tgglKey = amgui.createToggleIconBtn({
        icon: 'key',
        height: this._baseH,
        onClick: this._onClickTgglKey,
        changeColor: true,
        parent: de
    });
    this._refreshTgglKey();

    amgui.bindDropdown({
        asContextMenu: true,
        deTarget: de,
        deMenu: amgui.createDropdown({
            options: [
                {text: 'move up', onSelect: this.emit.bind(this, 'move', this, -1)},
                {text: 'move down', onSelect: this.emit.bind(this, 'move', this, 1)},
                {text: 'delete', onSelect: this.emit.bind(this, 'delete', this)},
            ]
        })
    });

    return de;
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
}

module.exports = CssSequence;




