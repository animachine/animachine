'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var amgui = require('../../amgui');
var paramFactory = require('./paramFactory');
var Transhand = require('transhand');
var KeyLineGroup = require('../../utils/KeyLineGroup');
var OptionLine = require('../../utils/OptionLine');
var CssParamGroup = require('./CssParamGroup');
var dialogTrackOptions = require('./dialogTrackOptions');
var dialogNewParam = require('./dialogNewParam');
var mstPlayer = require('./script.player.mst');


function CssTrack(opt) {

    EventEmitter.call(this);

    this._selectors = [];
    this._endParams = [];

    this._selectedElems = [];
    this._isHidingSelectedElems = false;
    this._isPlaying = false;

    this._onSelectClick = this._onSelectClick.bind(this);
    this._onDeleteParameter = this._onDeleteParameter.bind(this);
    this._onMoveParameter = this._onMoveParameter.bind(this);
    this._onClickTgglKey = this._onClickTgglKey.bind(this);
    this._onClickTgglHide = this._onClickTgglHide.bind(this);
    this._onChangeHeight = this._onChangeHeight.bind(this);
    this._onChangeHandler = this._onChangeHandler.bind(this);
    this._onChangeTime = this._onChangeTime.bind(this);
    this._onChangeParameter = this._onChangeParameter.bind(this);
    this._onChangeName = this._onChangeName.bind(this);
    this._onChangeSelectors = this._onChangeSelectors.bind(this);
    this._onWindowResize = this._onWindowResize.bind(this);
    this._onWindowScroll = this._onWindowScroll.bind(this);
    this._onSelectTrack = this._onSelectTrack.bind(this);
    this._onDeselectTrack = this._onDeselectTrack.bind(this);
    this._animPlay = this._animPlay.bind(this);

    this._paramGroup = new CssParamGroup({
        name: '',
        optionLine: {
            tgglMerge: false,
            title: {
                onClick: () => this._showSettings(), 
            },
            contextMenuOptions: [
                {text: 'options', onSelect: () => this._showSettings()},
                {text: 'move up', onSelect: () => this.emit('move', this, -1)},
                {text: 'move down', onSelect: () => this.emit('move', this, 1)},
                {text: 'delete', onSelect: () => this.emit('remove')},
            ],
        },
    });

    //test hack
    this._paramGroup.optionLine._deTitle.style.fontWeight = 'bold';

    this._paramGroup.optionLine.addButton({
        domElem: amgui.createToggleIconBtn({
            iconOn: 'eye',
            iconOff: 'eye-off',
            changeColor: true,
            onClick: this._onClickTgglHide,
        }),
        name: 'tgglHide',
        childIdx: 0,
    });

    this._paramGroup.optionLine.addButton({
        domElem: amgui.createToggleIconBtn({
            tooltip: 'enable/disable 3d',
            icon: 'cube',
            changeColor: true,
            onClick: () => am.dialogs.WIP.show(),
        }),
        name: 'tggl3d',
        childIdx: 0,
    });


    this._paramGroup.optionLine.addButton({
        domElem: amgui.createToggleIconBtn({
            tooltip: 'add new css parameter',
            icon: 'plus',
            onClick: () => dialogNewParam.show({track: this}),
        }),
        name: 'newParam',
        childIdx: 0,
    });

    this.deOptionLine = this._paramGroup.optionLine.domElem;
    this.deKeyLine = this._paramGroup.keyLine.domElem;

    this.deOptionLine.addEventListener('click', this._onSelectClick);
    this.deKeyLine.addEventListener('click', this._onSelectClick);

    this._paramGroup.on('changeHeight', this._onChangeHeight);
    am.timeline.on('changeTime', this._onChangeTime);
    am.on('selectTrack', this._onSelectTrack);
    am.on('deselectTrack', this._onDeselectTrack);

    this.setMaxListeners(1234);

    if (opt) {
        this.useSave(opt);
    }
}

inherits(CssTrack, EventEmitter);
var p = CssTrack.prototype;
module.exports = CssTrack;

p.type = 'css_track_type';






Object.defineProperties(p, {

    height: {

        get: function () {

            return this._paramGroup.height;
        }
    }
});






p.getSave = function () {

    var save = {
        selectors: _.clone(this._selectors),
        paramTree: {children: [], save: this._paramGroup.getSave()},
    };
    //TODO make param and group handling cleaner
    var saveChildren = (children, paramGroup) => {

        paramGroup.getParamNames().forEach(name => {

            let param = paramGroup.getParam(name),
                child = {save: param.getSave()};

            children.push(child);

            if (param instanceof CssParamGroup) {

                child.children = [];
                saveChildren(child.children, param);
            }
        });
    };
    saveChildren(save.paramTree.children, this._paramGroup);

    return save;
};

p.useSave = function (save) {

    if (!save) {
        return;
    }

    this._selectors = save.selectors || [];

    var loadChildren = (children, path) => {

        children.forEach(child => {
            
            if (child.children) {

                path = path.slice().concat(child.save.name);

                this.addGroup(path, child.save);

                loadChildren(child.children, path);
            }
            else {
                this.addParam(child.save);
            }
        });
    };
    if ('paramTree' in save) {

        if (save.paramTree.children) loadChildren(save.paramTree.children, []);
        if ('save' in save.paramTree) this._paramGroup.useSave(save.paramTree.save);
    }

    this._refreshSelectedElems();
    this._refreshPlayer();
};

p._getScriptParams = function (opt) {

    var params = [];

    this._endParams.forEach(function (param) {

        if (param.hidden) return;

        var tl = new TimelineMax(),
            lastTime = 0;

        var param = param.getScriptKeys({runnable: opt.runnable}).map(key => {

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

    var code = '', optionLine, selectors,
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

p.addParam = function (opt, skipHistory) {

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
        param = paramFactory.create(opt);

        param.parentTrack = this;

        //TODO history.flag();

        if (!skipHistory) {
            am.history.save([this.removeParam, this, param, true],
                [this.addParam, this, param, true], 'add param ' + opt.name);
        }

        this._endParams.push(param);
        this._paramGroup.addParam(param);

        param.on('change', this._onChangeParameter);
        param.on('delete', this._onDeleteParameter);

        this._prepareBuiltInGroup(opt.name);

        //TODO history.endFlag();

        this.emit('addParam');
        this.emit('change');
    }

    return param;
};

p.removeParam = function (param, skipHistory) {

    var idx = this._endParams.indexOf(param);

    if (idx === -1) {
        return;
    }

    if (!skipHistory) {
        am.history.save([this.addParam, this, param, true],
            [this.removeParam, this, param, true], 'remove param ' + param.name);
    }

    this._endParams.splice(idx, 1);
    param.parentTrack = undefined;

    param.removeListener('change', this._onChangeParameter);
    param.removeListener('delete', this._onDeleteParameter);

    this._paramGroup.removeParam(param);

    $(param.deOptionLine).remove();
    $(param.deKeyline).remove();

    this.emit('change');
};

p.getParam = function (name) {

    return this._endParams.find(function(param) {

        return param.name === name;
    });
};

p.addGroup = function (path, opt) {

    path = path.slice();
    
    var name = path.pop(),
        parent = this._paramGroup;

    path.forEach((parentName, idx) => {
        this.addGroup(path.slice(0, idx+1));
    });

    var paramGroup = parent.getParam(name);

    if (!paramGroup) {

        //TODO history.save()

        if (opt && opt.name !== name) throw Error;

        paramGroup = paramFactory.createGroup(opt || {name});
        parent.addParam(paramGroup);

        paramGroup.on('translateToBezier', this._switchFromTranslateToBezier, this);
    }

    return paramGroup;
};

p.removeGroup = function (path, history) {

console.log('removeGroup', path)
    path = path.slice();

    var name = path.pop(),
        parent = this._paramGroup;

    while (path.length) {

        parent = parent.getParam(path.shift());

        if (!parent) return;
    }

    //TODO history.save()
    paramGroup = parent.getParam(name);

    paramGroup.off('bezierToTranslate', this._switchFromBezierToTranslate, this);
    paramGroup.off('translateToBezier', this._switchFromTranslateToBezier, this);

    parent.removeParam();
};



p._prepareBuiltInGroup = function (paramName) {

    var rootGroupName = paramFactory.getRootParamGroupName(paramName);

    if (!rootGroupName) return;

    var walk = (groupName, path) => {

        var newPath = path.slice().concat(groupName);

        var memberNames = paramFactory.getGroupMemberNames(newPath);

        if (memberNames.length) {

            memberNames.forEach(memberName => walk(memberName, newPath));
        }
        else {
            var param = this.addParam({name: groupName}),
                group = this.addGroup(path);

            group.addParam(param);
        }
    };
    
    walk(rootGroupName, []);
};

p.select = function (opt) {

    opt = opt || {};

    if (this._isSelected) return;
    this._isSelected = true;


    if (!this._transformer) {
        this._transformer = new Transhand();
    }

    this._transformer.on('change', this._onChangeHandler);
    window.addEventListener('resize', this._onWindowResize);
    window.addEventListener('scroll', this._onWindowScroll);

    this._refreshSelectedElems();

    if (this._selectedElems.length) {

        this.focusTransformer(opt.focusElem || this._selectedElems[0]);
    }

    this._paramGroup.optionLine.highlight = true;

    this.emit('select', this);
};

p.deselect = function () {

    if (!this._isSelected) return;
    this._isSelected = false;

    this._blurTransformer();

    this._paramGroup.optionLine.highlight = false;

    window.removeEventListener('resize', this._onWindowResize);
    window.removeEventListener('scroll', this._onWindowScroll);

    if (this._transformer) {

        this._transformer.removeListener('change', this._onChangeHandler);
    }
};

p.renderTime = function (time) {

    if (time === undefined) {
        time = am.timeline.currTime;
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

    return this._paramGroup.keyLine.getKeyTimes();
};

p.focusTransformer = function (de) {

    de = de || this._currHandledDe;
    this._currHandledDe = de;

    if (!this._currHandledDe) return this._blurTransformer();

    this.emit('focusTransformer');

    var handOpt = {
            type: 'transformer',
            base: {
                x: de.offsetLeft,
                y: de.offsetTop,
                w: de.offsetWidth,
                h: de.offsetHeight,
            },
            params: {},
        },
        xPercent = 0,
        yPercent = 0;

    var p = handOpt.params;
    this._endParams.forEach(function (param) {

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
    

    this._transformer.setLocalRoot(de.parentNode);
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

p._showSettings = function () {

    dialogTrackOptions.show({
        name: this._paramGroup.name,
        selectors: this._selectors,
        onChangeName: this._onChangeName,
        onChangeSelectors: this._onChangeSelectors,
    });
};

p._animPlay = function () {

    this._animPlayRafid = window.requestAnimationFrame(this._animPlay);

    this.renderTime(am.timeline.currTime);
};

p._hideSelectedElems = function () {

    if (this._isHidingSelectedElems) return;
    this._isHidingSelectedElems = true;

    this._paramGroup.optionLine.buttons.tgglHide.setToggle(true);

    this._selectedElems.forEach(function (de) {

        de._amVisibilitySave = de.style.visibility;
        de.style.visibility = 'hidden';
    });
};

p._showSelectedElems = function () {

    if (!this._isHidingSelectedElems) return;
    this._isHidingSelectedElems = false;

    this._paramGroup.optionLine.buttons.tgglHide.setToggle(false);

    this._selectedElems.forEach(function (de) {

        de.style.visibility = de._amVisibilitySave;
    });
};

p._switchFromTranslateToBezier = function () {

    var xParam = this.getParam('x'),
        yParam = this.getParam('y'),
        xKeys = xParam.getSave().keys,
        yKeys = yParam.getSave().keys,
        bezierKeys = [],
        times = _.sortBy(_.uniq(_.pluck(xKeys, 'time').concat(_.pluck(yKeys, 'time')))),
        oldBezierKeys = this.__savedBezierKeys || [];

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

    xParam.hidden = true;
    yParam.hidden = true;
    this._paramGroup.getParam('translate').hidden = true;
    bezierParam.hidden = false;
    
    this._transformer();
};

p._switchFromBezierToTranslate = function () {

    //TODO restore original x, y keys when bezier wasn't changed

    var bezierParam = this.getParam('bezier'),
        bezierKeys = bezierParam.getSave().keys,
        xKeys = [],
        yKeys = [];
    
    this.__savedBezierKeys = keys;

    bezierKeys.forEach(function (bezierKey) {

        var lastPoint = _.last(bezierKey.value);

        xKeys.push(oldKey || {
            time: time,
            value: lastPoint.anchor.x + 'px',
        });
        yKeys.push(oldKey || {
            time: time,
            value: lastPoint.anchor.y + 'px',
        });
    });

    var xParam = this.addParam({
        name: 'x',
        keys: xKeys,
    });
    var yParam = this.addParam({
        name: 'y',
        keys: yKeys,
    });

    xParam.hidden = false;
    yParam.hidden = false;
    this._paramGroup.getParam('translate').hidden = false;
    bezierParam.hidden = true;

    this.focusTransformer();
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

    var time = am.timeline.currTime;

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

                bezierParam.addKey(keyOpt);

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

p._onChangeTime = function (time) {

    if (this._isPlaying) {
        return;
    }

    this.renderTime(time);
    this.focusTransformer();
};

p._onChangeParameter = function () {
    
    this._refreshPlayer();
    this.renderTime();
    this.focusTransformer();

    this.emit('change');
};

p._onWindowResize = function () {

    this.focusTransformer();
};

p._onWindowScroll = function () {

    this.focusTransformer();
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

p._onChangeName = function (name) {

    this._paramGroup.name = name;
};

p._onChangeSelectors = function (selectors) {

    this._selectors.length = 0;
    this._selectors = this._selectors.concat(selectors);

    this._refreshSelectedElems();
    this._refreshPlayer();

    if (this._selectedElems.indexOf(this._currHandledDe) === -1) {

        this._currHandledDe = undefined;
    }

    this.focusTransformer(this._currHandledDe || this._selectedElems[0]);
};

p._onChangeHeight = function (selectors) {

    this.emit('changeHeight', this);
};






p._refreshPlayer = function () { 

    if (this._player) this._player.kill();

    this._player = this.getPlayer();
}






p._isAllParamsHaveKey = function (time) {

    return this._endParams.every(function (param) {

        return param.getKey(time) || !param.isValid();
    });
};






p.isOwnedDomElem = function (de) {

    return this._selectedElems.indexOf(de) !== -1;
};

p._refreshSelectedElems = function () {

    var list = [];

    this._selectors.forEach(function (selector) {

        if (selector.type === 'css') {

            add(selector.value);
        }
        else if (selector.type === 'input') {

            var parent = am.timeline.inputs;

            selector.value.split('.').every(function (name) {

                return parent = parent[name]
            });

            if (parent) {
                add(parent);
            }
        }
    });

    this._selectedElems = list;

    function add(item) {

        if (typeof(item) === 'string') {
            
            var items = am.deRoot.querySelectorAll(item);
            items = Array.prototype.slice.call(items);
            list = list.concat(items);
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

    am.timeline.removeListener('changeTime', this._onChangeTime);

    //TODO
};