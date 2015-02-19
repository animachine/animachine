'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var amgui = require('../amgui');
var ParamFactory = require('./ParamFactory');
var Transhand = require('transhand');
var ParamGroup = require('./ParamGroup');
var dialogTrackOptions = require('./dialogTrackOptions');
var dialogNewParam = require('./dialogNewParam');
var mstPlayer = require('./script.player.mst');


function Track(opt, timeline) {

    EventEmitter.call(this);

    this.timeline = timeline;

    this._selectors = [];
    this._endParams = [];

    this._selectedElems = [];
    this._isHidingSelectedElems = false;
    this._isPlaying = false;

    if (!this._paramFactory) this._paramFactory = new ParamFactory({}, this.timeline);

    this._onSelectClick = this._onSelectClick.bind(this);
    this._onChangeSelectors = this._onChangeSelectors.bind(this);
    this._onWindowResize = this._onWindowResize.bind(this);
    this._onWindowScroll = this._onWindowScroll.bind(this);
    this._animPlay = this._animPlay.bind(this);

    this._onChangeTransformer = am.history.wrap({
        fn: this._onChangeTransformer,
        name: 'transform',
        delay: 312,
    });

    this.paramGroup = new ParamGroup({
        name: 'new track',
        paramFactory: this._paramFactory,
        optionLine: {
            tgglMerge: false,
            title: '-',
            contextMenuOptions: [
                {text: 'options', onSelect: () => this._showSettings()},
                {text: 'move up', onSelect: () => this.emit('move', this, -1)},
                {text: 'move down', onSelect: () => this.emit('move', this, 1)},
                {text: 'delete', onSelect: () => this.emit('need.remove', this)},
            ],
            onDblclick: () => this._showSettings(),
        },
    }, this.timeline);
    this.paramGroup.wake();

    this.paramGroup.on('change.structure', this._onChangeParamGroupStructure, this);

    this.paramGroup.on('change.keys', this._onChangeKeys, this);

    //test hack
    this.paramGroup.optionLine._deTitle.style.fontWeight = 'bold';


    this.paramGroup.optionLine.addButton({
        domElem: amgui.createToggleIconBtn({
            tooltip: 'add new parameter',
            icon: 'plus',
            onClick: () => dialogNewParam.show({track: this}),
        }),
        name: 'newParam',
        childIdx: 0,
    });

    this.deOptionLine = this.paramGroup.optionLine.domElem;
    this.deKeyLine = this.paramGroup.keyLine.domElem;

    this.deOptionLine.addEventListener('click', this._onSelectClick);
    this.deKeyLine.addEventListener('click', this._onSelectClick);

    this.paramGroup.on('change.height', this._onChangeHeight, this);

    this.setMaxListeners(1234);

    if (opt) {
        this.useSave(opt);
    }
}

inherits(Track, EventEmitter);
var p = Track.prototype;
module.exports = Track;

p.type = 'plain_track_type';






Object.defineProperties(p, {

    height: {

        get: function () {

            return this.paramGroup.height;
        }
    }
});




p.wake = function () {

    this.timeline.on('changeTime', this._onChangeTime, this);
    this.timeline.project.on('change.inputs', this._onChangeSelectors, this);

    _.invoke(this._params, 'wake');

    this.renderTime();
};

p.sleep = function () {

    this.deselect();

    TweenMax.set(this._selectedElems, {clearProps: 'all'});

    this.timeline.off('changeTime', this._onChangeTime, this);
    this.timeline.project.off('change.inputs', this._onChangeSelectors, this);

    _.invoke(this._params, 'sleep');
};



p.getSave = function () {

    var save = {
        selectors: _.clone(this._selectors),
        paramTree: this.paramGroup.getSave(),
    };

    return save;
};

p.useSave = function (save) {

    if (!save) {
        return;
    }

    this._selectors = save.selectors || [];
    if (save.paramTree) this.paramGroup.useSave(save.paramTree);

    this._refreshEndParams();
    this._refreshSelectedElems();
    this._refreshPlayer();
};

p._getScriptParams = function (opt) {

    var params = [];

    this._endParams.forEach(function (param) {

        if (param.hidden) return;

        var lastTime = 0;

        param = param.getScriptKeys({runnable: opt.runnable}).map(key => {

            key.duration = (key.time - lastTime)/1000;
            lastTime = key.time;
            delete key.time;

            return key;
        });

        if (param.length) {

            params.push(param);
        }
    });

    handleTransformOrigin();

    return params;




    function handleTransformOrigin() {

        var tox = _.find(params, param => 'transformOriginX' in param[0].options);
        var toy = _.find(params, param => 'transformOriginY' in param[0].options);
        var toz = _.find(params, param => 'transformOriginZ' in param[0].options);

        if (!tox) return;

        var to = [];
        tox.forEach(function (key, idx) {

            to.push({
                duration: key.duration,
                options: {
                    ease: key.options.ease,
                    transformOrigin: '' +
                        (tox && tox[idx] ? tox[idx].options.transformOriginX : '50%') + ' ' +
                        (toy && toy[idx] ? toy[idx].options.transformOriginY : '50%') + ' ' +
                        (toz && toz[idx] ? (toz[idx].options.transformOriginZ || '0px') : ''),
                }
            });
        });

        if (tox) params.splice(params.indexOf(tox), 1);
        if (toy) params.splice(params.indexOf(toy), 1);
        if (toz) params.splice(params.indexOf(toz), 1);
        params.push(to);
    }
};

p.getPlayer = function () {

    var rootTl = new TimelineMax().pause(),
        scriptParams = this._getScriptParams({runnable: true}),
        selectedElems = this._selectedElems;

    scriptParams.forEach(function (param) {

        var tl = new TimelineMax();
        rootTl.add(tl, 0);

        param.forEach(function (key) {

            tl.to(selectedElems, key.duration, key.options);
        });
    });

    return rootTl;
};

p.getScript = function () {

    var code = '', selectors,
        timelines = this._getScriptParams({runnable: false});


    //TODO: merge timelines if it's possible
    // for (var i = 0; i < timelines.length; ++i) {
    //     for (var j = 0; j < timelines.length; ++j) {

    //         if (i !== j && timelines[i].length === timelines[j].length) {

    //             var match = timelines[i].every(function (iKey, idx) {

    //                 var jKey = timelines[j][idx];

    //                 return iKey.time === jKey.time && iKey.ease.match(jKey.ease);
    //             });

    //             if (match) {

    //                 timelines[i].forEach(function (key, idx) {

    //                     _.assign(key, timelines[j][idx]);

    //                     timelines.splice(j, idx);
    //                     if (--j < i) {
    //                         --i;
    //                     }
    //                 });
    //             }
    //         }
    //     }
    // }

    selectors = JSON.stringify(this._selectors);
    timelines = JSON.stringify(timelines);
    //remove quotes around the Ease constructor calls
    //TODO: do this somehow nicer
    timelines = timelines.replace(/"ease":"(.*?)"/g, '"ease":$1');

    code = Mustache.render(mstPlayer, {
        timelines: timelines,
        selectors: selectors,
    });

    return code;
};

p.addParam = function (opt) {

    opt = opt || {};

    var param = this.getParam(opt.name);

    if (param) {

        if (opt.keys) {

            opt.keys.forEach(param.addKey, param);
        }

        if ('hidden' in opt) {

            param.hidden = opt.hidden;
        }
    }
    else {
        this.paramGroup.addParam(opt);
        this._refreshEndParams();
        param = _.find(this._endParams, {name: opt.name});
    }

    return param;
};

p.getParam = function (name) {

    return this._endParams.find(function(param) {

        return param.name === name;
    });
};

p.select = function (opt) {

    opt = opt || {};

    if (this._isSelected) return;
    this._isSelected = true;


    if (!this._transformer) {
        this._transformer = new Transhand();
    }

    this._transformer.on('change', this._onChangeTransformer, this);
    window.addEventListener('resize', this._onWindowResize);
    window.addEventListener('scroll', this._onWindowScroll);

    this._refreshSelectedElems();

    if (this._selectedElems.length) {

        this.focusTransformer(opt.focusElem || this._selectedElems[0]);
    }

    this.paramGroup.optionLine.highlight = true;

    this.emit('select', this);
};

p.deselect = function () {

    if (!this._isSelected) return;
    this._isSelected = false;

    this._blurTransformer();

    this.paramGroup.optionLine.highlight = false;

    window.removeEventListener('resize', this._onWindowResize);
    window.removeEventListener('scroll', this._onWindowScroll);

    if (this._transformer) {

        this._transformer.off('change', this._onChangeTransformer, this);
    }
};

p.isSelected = function () {

    return this._isSelected;
};

p.renderTime = function (time) {

    if (time === undefined) {
        time = this.timeline ? this.timeline.currTime : 0;
    }

    if (this._selectors.length === 0) {
        return;
    }

    this._player.time(time/1000);
    return;
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

    return this.paramGroup.keyLine.getKeyTimes();
};

p._showSettings = function () {

    dialogTrackOptions.show({
        name: this.paramGroup.title,
        selectors: this._selectors,
        on: {
            'change.name': name => this.paramGroup.title = name,
            'change.selectors': this._onChangeSelectors,
        },
    });
};

p._animPlay = function () {

    this._animPlayRafid = window.requestAnimationFrame(this._animPlay);

    this.renderTime(this.timeline.currTime);
};











p._onSelectClick = function () {

    this.select();
};

p._onChangeTransformer = function(params, type) {

    var time = this.timeline.currTime;

    var add = function (name, value) {

        if (name === 'x' || name === 'y') {

            let bezierParam = this.getParam('bezier');

            if (bezierParam && !bezierParam.hidden) {

                let key = bezierParam.getKey(time),
                    keyOpt;

                if (key) {

                    keyOpt = key.getSave();
                }
                else {
                    let {x, y} = bezierParam.getValue(time);
                    //TODO bezierParam.inzertPoint(time, ...)
                    keyOpt = {time, value: [{
                        anchor: {x, y},
                        handleLeft: {x, y},
                        handleRight: {x, y},
                    }]};
                }

                value = parseFloat(value);
                let lastPoint = _.last(keyOpt.value),
                    diff = value - lastPoint.anchor[name];

                lastPoint.anchor[name] += diff;
                lastPoint.handleLeft[name] += diff;
                lastPoint.handleRight[name] += diff;

                let key = bezierParam.addKey(keyOpt);
                key.emit('change.value');

                return;
            }
        }

        var param = this.addParam({name: name});

        param.addKey({
            time: time,
            value: value,
        });
    }.bind(this);

    if (type === 'transform') {

        Object.keys(params).forEach(function (name) {

            switch (name) {
                case 'tx': add('x', params[name] + 'px'); break;
                case 'ty': add('y', params[name] + 'px'); break;
                case 'sx': add('scaleX', params[name]); break;
                case 'sy': add('scaleY', params[name]); break;
                case 'rz': add('rotationZ', (params[name] / Math.PI * 180) + 'deg'); break;
                case 'ox': add('transformOriginX', (params[name] * 100) + '%'); break;
                case 'oy': add('transformOriginY', (params[name] * 100) + '%'); break;
            }
        });
    }
};

p._onChangeParamGroupStructure = function () {

    this._refreshEndParams();
    this._refreshPlayer();
    this.renderTime();
};

p._onChangeTime = function (time) {

    if (this._isPlaying) {
        return;
    }

    this.renderTime(time);
    this.focusTransformer();
};

p._onChangeKeys = function () {

    this._refreshPlayer();
    this.renderTime();
    this.focusTransformer();

    this.emit('change.keys');
};

p._onWindowResize = function () {

    this.focusTransformer();
};

p._onWindowScroll = function () {

    this.focusTransformer();
};

p._onClickTgglKey = function () {

    var time = this.timeline.currTime,
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

p._onChangeSelectors = function () {

    //targetsInput edits the this._selectedElems array so there is no need to refresh it

    this._refreshSelectedElems();
    this._refreshPlayer();

    if (this._selectedElems.indexOf(this._currHandledDe) === -1) {

        this._currHandledDe = undefined;
    }

    this.focusTransformer(this._currHandledDe || this._selectedElems[0]);
};

p._onChangeHeight = function () {

    this.emit('change.height', this);
};

p._isAllParamsHaveKey = function (time) {

    return this._endParams.every(function (param) {

        return param.getKey(time) || !param.isValid();
    });
};

p.isOwnedDomElem = function (de) {

    return this._selectedElems.indexOf(de) !== -1;
};






p._refreshPlayer = function () {

    if (this._player) this._player.kill();

    this._player = this.getPlayer();
};

p._refreshEndParams = function () {

    this._endParams = this.paramGroup.getEndParams();
};

p._refreshSelectedElems = function () {

    var list = [];

    this._selectors.forEach(selector => {

        if (selector.type === 'css') {

            add(selector.value);
        }
        else if (selector.type === 'input') {

            var parent = this.timeline.project.inputs;

            selector.value.split('.').every(function (name) {

                parent = parent[name];

                return parent;
            });

            if (parent) {
                add(parent);
            }
        }
    });

    this._selectedElems = list;

    function add(item) {

        if (typeof(item) === 'string') {
            //it's easy to get an invalid selector by the user
            try {
                var items = am.deRoot.querySelectorAll(item);
                items = Array.prototype.slice.call(items);
                list = list.concat(items);
            } catch (e) {}
        }
        else if (window.jQuery && item instanceof window.jQuery) {
            list = list.concat(item.toArray());
        }
        else {
            list.push(item);
        }
    }
};

p.dispose = function () {

    //TODO
};
