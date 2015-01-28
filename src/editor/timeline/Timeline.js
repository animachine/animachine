'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var Timebar = require('./Timebar');
var EaseMap = require('./EaseMap');
var TriggerMap = require('./TriggerMap');
var amgui = require('../amgui');
var UglifyJS = require('uglify-js');
var mstSaveScript = require('./script.save.mst');
var InlineEaseEditor = require('./InlineEaseEditor');
var Toolbar = require('../toolbar');

function Timeline(opt) {

    EventEmitter.call(this);
    this.setMaxListeners(11111);

    this.inputs = {};
    
    this._headerH = 23;

    this._onSelectTrack = this._onSelectTrack.bind(this);
    this._onChangeTrack = this._onChangeTrack.bind(this);
    this._onRemoveTrack = this._onRemoveTrack.bind(this);
    this._onMoveTrack = this._onMoveTrack.bind(this);
    this._onChangeTime = this._onChangeTime.bind(this);
    this._onChangeTape = this._onChangeTape.bind(this);
    this._onWindowResize = this._onWindowResize.bind(this);
    this._onSelectNewTrack = this._onSelectNewTrack.bind(this);
    this._onTogglePlayPause = this._onTogglePlayPause.bind(this);
    this._onTimebarSeek = this._onTimebarSeek.bind(this);
    this._onChangeTrackHeight = this._onChangeTrackHeight.bind(this);
    this._onStartEditCurrTime = this._onStartEditCurrTime.bind(this);
    this._onFinishEditCurrTime = this._onFinishEditCurrTime.bind(this);
    this._onChangeInpCurrTime = this._onChangeInpCurrTime.bind(this);
    this._animPlay = this._animPlay.bind(this);
    
    this._timebar = new Timebar({
        height: this._headerH,
        timescale: 0.12,
        length: 6000,
    });

    this.toolbar = new Toolbar({
        height: this._headerH,
        bgColor: 'none',
    });
    
    this._createBase();
    this._createPointerLine();

    this.inlineEaseEditor = new InlineEaseEditor();
    this.domElem.appendChild(this.inlineEaseEditor.domElem);

    this._refreshTimebarWidth();
    this._refreshDeCurrTime();

    this._tracks = [];
    this._mapTrackDatas = new WeakMap();

    this.easeMap = new EaseMap();
    this.triggerMap = new TriggerMap();

    this._timebar.on('changeTime', this.emit.bind(this, 'changeTime'));
    this._timebar.on('changeTape', this.emit.bind(this, 'changeTape'));
    this._timebar.on('changeTimescale', this.emit.bind(this, 'changeTimescale'));
    this._timebar.on('changeTime', this._onChangeTime);
    this._timebar.on('changeTape', this._onChangeTape);
    this._timebar.on('seek', this._onTimebarSeek);

    amgui.callOnAdded(this.domElem, this._refreshTimebarWidth, this);
    
    window.addEventListener('resize', this._onWindowResize);

    if (opt) {
        this.useSave(opt);
    }
}

inherits(Timeline, EventEmitter);
var p = Timeline.prototype;
module.exports = Timeline;






Object.defineProperties(p, {

    currTime: {
        set: function (v) {
            this._timebar.currTime = v;
        },
        get: function () {
            return this._timebar.currTime;
        }
    },
    timescale: {
        get: function () {
            return this._timebar.timescale;
        }
    },
    tracks: {
        get: function () {
            return this._tracks;
        }
    },
    length: {
        get: function () {
            return this._timebar.length;
        }
    },
    width: {
        get: function () {
            return this._timebar.width;
        }
    },
    start: {
        get: function () {
            return this._timebar.start;
        }
    },
});

p.getSave = function () {

    var save = {
        timebar: {
            currTime: this._timebar.currTime,
            timescale: this._timebar.timescale,
            length: this._timebar.length,
        },
        tracks: [],
        easeMap: this.easeMap.getSave(),
        triggerMap: this.triggerMap.getSave(),
    };

    this._tracks.forEach(function (track) {

        save.tracks.push({
            type: track.type,
            data: track.getSave()
        });
    });

    return JSON.stringify(save);
};

p.useSave = function (save) {

    this.clear();

    save = _.extend({
        timebar: {},
        tracks: []
    }, save);

    this._timebar.currTime = save.timebar.currTime;
    this._timebar.timescale = save.timebar.timescale;
    this._timebar.length = save.timebar.length;

    if ('easeMap' in save) this.easeMap.useSave(save.easeMap);
    if ('triggerMap' in save) this.triggerMap.useSave(save.triggerMap);

    save.tracks.forEach(function (trackData) {

        var TrackClass = am.trackTypes[trackData.type],
            track = new TrackClass(trackData.data);

        this.addTrack(track);
    }, this);

    _.invoke(this._tracks, 'renderTime', this.currTime);

    this._refreshMagnetPoints();

    am.history.clear();
};

p.getScript = function (opt) {

    opt = opt || {};

    var script, playerScripts = [];

    this._tracks.forEach(function (track) {

        playerScripts.push(track.getScript());
    });

    script = Mustache.render(mstSaveScript, {
        name: 'amsave',
        saveJson: opt.includeSave && this.getSave(),
        trackPlayerGens: playerScripts.join(',\n'),
        autoPlay: opt.autoPlay
    });

    if (opt.minify) {

    console.log(script);
        script = minify(script);
    }

    console.log(script);

    return script;

    function minify(code) {

        return code;//TODO

        var result = UglifyJS.minify(code, {
            fromString: true,
            mangle: false,
            output: {
                comments: /@amsave/,
            },
            compress: {
                // reserved: 'JSON_SAVE',
            }
        });

        return result.code;

        var toplevel = null;
        toplevel = UglifyJS.parse(code, {
            filename: 'save',
            toplevel: toplevel
        });

        toplevel.figure_out_scope();

        var compressor = UglifyJS.Compressor({mangle: false});
        var compressed_ast = toplevel.transform(compressor);

        compressed_ast.figure_out_scope();
        compressed_ast.compute_char_frequency();
        compressed_ast.mangle_names();

        return compressed_ast.print_to_string({comments: 'all'});
    } 
};

p.clear = function () {
    
    while(this._tracks.length) {

        this.removeTrack(this._tracks[0]);
    }
};

p.addTrack = function (track) {

    am.history.save({
        undo: () => this.removeTrack(track),
        redo: () => this.addTrack(track),
        name: 'add track',
    });
    
    this._tracks.push(track);

    this._mapTrackDatas.set(track, {
        deContOpt: createCont(track.deOptionLine, this._deOptionLineCont),
        deContKf: createCont(track.deKeyLine, this._deKeyLineCont),
    });

    this._onChangeTrackHeight(track);

    track.on('select', this._onSelectTrack);
    track.on('change', this._onChangeTrack);
    track.on('remove', this._onRemoveTrack);
    track.on('move', this._onMoveTrack);
    track.on('changeHeight', this._onChangeTrackHeight);

    function createCont(content, parent) {

        var de = document.createElement('div');
        de.style.width = '100%';
        de.style.height = track.height + 'px';
        de.style.overflow = 'hidden';
        de.style.transform = 'height 0.12 easeOut';
        de.appendChild(content);
        parent.appendChild(de);

        return de;
    }
};

p.removeTrack = function (track, skipHistory) {

    if (!_.includes(this._tracks, track)) {
        return;
    }

    am.history.save({
        undo: () => this.addTrack(track),
        redo: () => this.removeTrack(track),
        name: 'remove track',
    });

    _.pull(this._tracks, track);

    var trackData = this._mapTrackDatas.get(track);
    $(trackData.deContOpt).remove();
    $(trackData.deContKf).remove();
    this._mapTrackDatas.delete(track);

    track.removeListener('select', this._onSelectTrack);
    track.removeListener('change', this._onChangeTrack);
    track.removeListener('remove', this._onRemoveTrack);
    track.removeListener('move', this._onMoveTrack);
    track.removeListener('changeHeight', this._onChangeTrackHeight);

    track.dispose();
};

p.moveTrack = function (track, way) {

    var idx = this._tracks.indexOf(track);

    this._tracks.splice(idx, 1);
    idx = Math.min(this._tracks.length, Math.max(0, idx + way));
    this._tracks.splice(idx, 0, track);

    this._refreshTrackOrdering();
};

p.play = function () {

    if (this._isPlaying) return;
    this._isPlaying = true;

    this._btnTogglePlay.setToggle(true);

    _.invoke(this._tracks, 'play', this.currTime);

    this._playStartTimeStamp = performance.now();
    this._playStartCurrTime = this.currTime;
    this._animPlay();
};

p.pause = function () {

    if (!this._isPlaying) return;
    this._isPlaying = false;

    this._btnTogglePlay.setToggle(false);

    _.invoke(this._tracks, 'pause');

    window.cancelAnimationFrame(this._animPlayRafid);
};

p.screenXToTime = function (screenX) {

    return this._timebar.screenXToTime(screenX);
};

p.timeToRenderPos = function (time) {

    return (time + am.timeline.start) * am.timeline.timescale;
};

p.timeToScreenX = function (time) {

    return this._timebar.domElem.getBoundingClientRect().left + this.timeToRenderPos(time);
};

p.addInput = function (path, value) {

    var obj = this.inputs;

    if (typeof(path) !== 'string') {
        //TODO: throw a detailed error
        throw Error();
    }

    path = path.split('.');

    path.forEach(function (name, idx, arr) {

        if (idx === arr.length-1) {

            obj[name] = value;
        }
        else {
            obj = _.isPlainObject(obj[name]) ? obj[name] : {};
        }
    });

    this.emit('change.inputs');
};

p.setInputs = function (inputs) {

    if (!_.isPlainObject(inputs)) {
        //TODO: throw a detailed error
        throw Error();
    }

    this.inputs = inputs;

    this.emit('change.inputs');
};

p.getInputPaths = function (maxLevel = 4) {

    var ret = [];

    var step = (obj, path, level) => {

        Object.keys(obj).forEach(key => {

            ret.push(path + key);

            if (_.isPlainObject(obj[key]) && level <= maxLevel) {

                step(obj[key], path + key + '.', level + 1);
            }
        });
    }

    step(this.inputs, '', 0);

    return ret;
};







p._animPlay = function () {

    this._animPlayRafid = window.requestAnimationFrame(this._animPlay);

    var t = Math.round(performance.now() - this._playStartTimeStamp);
    this._timebar.currTime = (this._playStartCurrTime + t) % this._timebar.length;
};

p._onTimebarSeek = function () {

    this.pause();
};

p._onSelectTrack = function(track) {

    if (this._currTrack === track) 
        return;

    if (this._currTrack) {
        
        this._currTrack.deselect(); 
    }

    this._currTrack = track;
};

p._onChangeTrack = function() {

    this._refreshMagnetPoints();
};

p._onRemoveTrack = function (track) {

    this.removeTrack(track);
};

p._onMoveTrack = function (track, way) {

    this.moveTrack(track, way);
};

p._onChangeTime = function () {

    this._refreshPointerLine();

    this._refreshDeCurrTime();
};

p._onChangeTape = function () {

    // var left = (this._timebar.start * this.timescale);

    // this._deKeyLineCont.style.left = left + 'px';
    // this._deKeyLineCont.style.width = 'calc(100% + ' + (-left) + 'px)';

    this._refreshPointerLine();
};

p._onChangeTrackHeight = function (track) {

    var h = track.height,
        trackData = this._mapTrackDatas.get(track);

    trackData.deContOpt.style.height = h + 'px';
    trackData.deContKf.style.height = h + 'px';
};

p._onWindowResize = function () {

    this._refreshTimebarWidth();
};

p._onTogglePlayPause = function () {

    am.report({evtName: '_onTogglePlayPause', value: 2})

    if (this._isPlaying) {

        this.pause();
    }
    else {
        this.play();
    }
};

p._onSelectNewTrack = function (e) {

    var addTrack = function (type) {

        var TrackClass = am.trackTypes[type];

        this.addTrack(new TrackClass());
    }.bind(this);

    switch (e.detail.selection) {

        case 'css':
            addTrack('css_track_type');
            break;

        default:
            am.dialogs.WIP.show();
            
    }
};

p._onStartEditCurrTime = function () {

    this._inpCurrTime.value = this.currTime;

    this._deCurrTime.style.display = 'none';
    this._inpCurrTime.style.display = 'block';

    this._inpCurrTime.focus();
};

p._onFinishEditCurrTime = function () {

    this._inpCurrTime.style.display = 'none';
    this._deCurrTime.style.display = 'block';
};

p._onChangeInpCurrTime = function () {

    this._timebar.currTime = this._inpCurrTime.value;
};








p._refreshTrackOrdering = function () {

    this._tracks.forEach(function (track) {

        var trackData = this._mapTrackDatas.get(track);

        this._deOptionLineCont.appendChild(trackData.deContOpt);
        this._deKeyLineCont.appendChild(trackData.deContKf);
    }, this);
};

p._refreshMagnetPoints = function () {

    var magnetPoints = [];

    this._tracks.forEach(function (track) {

        if (typeof track.getMagnetPoints === 'function') {

            magnetPoints = magnetPoints.concat(track.getMagnetPoints());
        }
    });

    magnetPoints = _.uniq(magnetPoints);

    this._timebar.magnetPoints = magnetPoints;
};

p._refreshTimebarWidth = function () {

    this._timebar.width = this._deRight.offsetWidth;
};

p._refreshPointerLine = function () {

    var canvas = this._dePointerLine,
        ctx = this._dePointerLineCtx;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var left = (this._timebar.start + this.currTime) * this.timescale;
    left = parseInt(left) + 0.5;
    
    ctx.strokeStyle = amgui.color.red;
    ctx.moveTo(left, 0);
    ctx.lineTo(left, canvas.height);
    ctx.stroke();

    // this._dePointerLine.style.transform = 'translateX(' + left + 'px)';
    // this._dePointerLine.style.visibility = left < 0 ? 'hidden' : '';
};

p._refreshDeCurrTime = function () {

    var time = this.currTime, 
        min, sec, ms, str  = '';

    min = ~~(time / 60000);
    time %= 60000;
    sec = ~~(time / 1000);
    time %= 1000;
    ms = ~~time;

    if (min) {
        str += min + ':';
        sec = ('00' + sec).substr(-2);
    }
    if (sec) {
        str += sec + '.';
        ms = ('000' + ms).substr(-3);
    }
    str += ms;
    this._deCurrTime.textContent = str;
};







p._createBase = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.backgroundColor = amgui.color.bg0; 
    this.domElem.style.display = 'flex'; 
    this.domElem.style.width = '100%'; 
    this.domElem.style.height = '100%'; 
    this.domElem.style.pointerEvents = 'auto'; 

    this._deLeft = document.createElement('div');
    this._deLeft.style.backgroundColor = amgui.color.bg0;
    this._deLeft.style.display = 'flex';
    this._deLeft.style.flexDirection = 'column';
    this._deLeft.style.width = '300px';
    this._deLeft.style.height = '100%';
    this.domElem.appendChild(this._deLeft);

    this._createSettingsHead();

    this._deDivider = document.createElement('div');
    this._deDivider.style.backgroundColor = amgui.color.bg3;
    this._deDivider.style.width = '1px';
    this._deDivider.style.height = '100%';
    this.domElem.appendChild(this._deDivider);

    this._deRight = document.createElement('div');
    this._deRight.style.display = 'flex';
    this._deRight.style.flexDirection = 'column';
    this._deRight.style.position = 'relative';
    this._deRight.style.backgroundColor = amgui.color.bg0;
    this._deRight.style.flex = '1';
    this._deRight.style.height = '100%';
    this.domElem.appendChild(this._deRight);

    this._timebar.domElem.style.height = '23px';
    this._deRight.appendChild(this._timebar.domElem);

    //keeps the scroll bar and the scroll container(_deKeyLineCont2)
    this._deKeyLineCont3 = document.createElement('div');
    this._deKeyLineCont3.style.position = 'relative';
    this._deKeyLineCont3.style.display = 'flex';
    this._deKeyLineCont3.style.flex = '1';
    this._deKeyLineCont3.style.height = '100%';
    this._deKeyLineCont3.style.width = '100%';
    this._deKeyLineCont3.style.overflow = 'hidden';
    this._deRight.appendChild(this._deKeyLineCont3);

    this._deOptionLineCont2 = document.createElement('div');
    this._deOptionLineCont2.style.position = 'relative';
    this._deOptionLineCont2.style.flex = '1';
    this._deOptionLineCont2.style.width = '100%';
    this._deOptionLineCont2.style.height = '100%';
    this._deOptionLineCont2.style.overflow = 'hidden';
    this._deLeft.appendChild(this._deOptionLineCont2);

    this._deKeyLineCont2 = document.createElement('div');
    this._deKeyLineCont2.style.position = 'relative';
    this._deKeyLineCont2.style.flex = '1';
    this._deKeyLineCont3.appendChild(this._deKeyLineCont2);

    //this container is moving with the timeline
    this._deKeyLineCont = document.createElement('div');
    this._deKeyLineCont.style.position = 'relative';
    this._deKeyLineCont.style.width = '100%';
    this._deKeyLineCont2.appendChild(this._deKeyLineCont);

    this._deOptionLineCont = document.createElement('div');
    this._deOptionLineCont.style.position = 'relative';
    this._deOptionLineCont2.appendChild(this._deOptionLineCont);

    this._deRange = amgui.createRange({
        height: 'auto',
        parent: this._deKeyLineCont3,
        vertical: true
    });

    amgui.makeScrollable({
        deCont: [this._deOptionLineCont2, this._deKeyLineCont3],
        deTarget: [this._deOptionLineCont, this._deKeyLineCont],
        deRange: this._deRange
    });
    
    this._createDividerHandler();
};


p._createSettingsHead = function () {

    this._deSettingsHead = document.createElement('div');
    this._deSettingsHead.style.backgroundColor = 'darkgreey';
    this._deSettingsHead.style.position = 'relative';
    this._deSettingsHead.style.display = 'flex';
    this._deSettingsHead.style.width = '100%';
    this._deSettingsHead.style.height = this._headerH + 'px';
    this._deLeft.appendChild(this._deSettingsHead);
    amgui.createSeparator({parent: this._deSettingsHead});

    this._deSettingsHead.appendChild(this.toolbar.domElem);

    this._btnNewTrack = amgui.createIconBtn({
        tooltip: 'add new track',
        icon: 'plus-squared',
        size: this._headerH,
        display: 'inline-block',
    });
    this.toolbar.addIcon({deIcon: this._btnNewTrack});

    amgui.bindDropdown({    
        deTarget: this._btnNewTrack,
        deMenu: amgui.createDropdown({
            options: ['css', 'js', 'attribute', 'media', 'timeline', 'three.js', 'pixi.js', 'easel.js', 'kinetic.js', 'raphael.js', 'snap.js'],
            onSelect: this._onSelectNewTrack,
        }),
    });

    
    this._btnEditTriggers = amgui.createIconBtn({
        tooltip: 'set timeline triggers',
        icon: 'gamepad', 
        size: this._headerH,
        display: 'inline-block',
        onClick: () => this.triggerMap.showEditor(),
    });
    this.toolbar.addIcon({
        deIcon: this._btnEditTriggers,
    });

    
    this._btnTogglePlay = amgui.createToggleIconBtn({
        tooltip: 'play/pause preview',
        iconOn: 'pause', 
        iconOff: 'play',
        size: this._headerH,
        display: 'inline-block',
        onClick: this._onTogglePlayPause
    });
    this.toolbar.addIcon({
        deIcon: this._btnTogglePlay,
        separator: 'controlls',
    });

    this._deCurrTime = amgui.createLabel({
        text: '',
        parent: this._deSettingsHead
    });
    this._deCurrTime.style.flex = '1';
    this._deCurrTime.style.textAlign = 'right';
    this._deCurrTime.style.fontSize = '12px';
    this._deCurrTime.style.marginRight = '2px';
    this._deCurrTime.style.color = amgui.color.bg3;
    this._deCurrTime.addEventListener('click', this._onStartEditCurrTime);

    this._inpCurrTime = amgui.createInput({
        type: 'number',
        parent: this._deSettingsHead
    });
    this._inpCurrTime.style.display = 'none';
    this._inpCurrTime.style.flex = '1';
    this._inpCurrTime.style.textAlign = 'right';
    this._inpCurrTime.style.fontSize = '12px';
    this._inpCurrTime.style.marginRight = '2px';
    this._inpCurrTime.style.color = amgui.color.bg3;
    this._inpCurrTime.addEventListener('blur', this._onFinishEditCurrTime);
    this._inpCurrTime.addEventListener('change', this._onChangeInpCurrTime);
};

p._createDividerHandler = function () {

    this._deDividerHandler = document.createElement('div');
    this._deDividerHandler.style.top = this._headerH + 'px';
    this._deDividerHandler.style.left = this._deLeft.style.width;
    this._deDividerHandler.style.width = '1px';
    this._deDividerHandler.style.position = 'absolute';
    this._deDividerHandler.style.height = 'calc(100% - ' + this._headerH + 'px)';
    this._deDividerHandler.style.transform = 'scaleX(3)';
    this._deDividerHandler.style.cursor = 'ew-resize';
    this.domElem.appendChild(this._deDividerHandler);

    amgui.makeDraggable({

        deTarget: this._deDividerHandler,
        thisArg: this,
        
        onMove: function (md, mx) {

            var left = mx - this.domElem.getBoundingClientRect().left + 'px';

            this._deLeft.style.width = left;
            this._deDividerHandler.style.left = left;

            this._refreshTimebarWidth();
        }
    });
};

p._createPointerLine = function () {

    this._dePointerLine = document.createElement('canvas');
    this._dePointerLine.style.top = this._headerH + 'px';
    this._dePointerLine.style.left = '0px';
    this._dePointerLine.style.width = '100%';
    this._dePointerLine.style.height = '100%';
    this._dePointerLine.style.position = 'absolute';
    this._dePointerLine.style.pointerEvents = 'none';
    this._deRight.appendChild(this._dePointerLine);

    this._dePointerLineCtx = this._dePointerLine.getContext('2d');
};