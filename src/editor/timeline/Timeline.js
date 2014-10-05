'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var Timebar = require('./Timebar');
var amgui = require('../amgui');
var mineSave = require('./mineSave');
var UglifyJS = require('uglify-js');
var mstSaveScript = require('./script.save.mst');

function Timeline(opt) {

    EventEmitter.call(this);
    this.setMaxListeners(1100);

    this._headerH = 23;

    this._onSelectSequence = this._onSelectSequence.bind(this);
    this._onChangeSequence = this._onChangeSequence.bind(this);
    this._onDeleteSequence = this._onDeleteSequence.bind(this);
    this._onMoveSequence = this._onMoveSequence.bind(this);
    this._onChangeTime = this._onChangeTime.bind(this);
    this._onChangeTape = this._onChangeTape.bind(this);
    this._onWindowResize = this._onWindowResize.bind(this);
    this._onSelectNewSequ = this._onSelectNewSequ.bind(this);
    this._onTogglePlayPause = this._onTogglePlayPause.bind(this);
    this._onTimebarSeek = this._onTimebarSeek.bind(this);
    this._onChangeSequenceHeight = this._onChangeSequenceHeight.bind(this);
    this._onStartEditCurrTime = this._onStartEditCurrTime.bind(this);
    this._onFinishEditCurrTime = this._onFinishEditCurrTime.bind(this);
    this._onChangeInpCurrTime = this._onChangeInpCurrTime.bind(this);
    this._animPlay = this._animPlay.bind(this);
    
    this._timebar = new Timebar({
        height: this._headerH,
        timescale: 0.12,
        length: 6000
    });
    
    this._createBase();
    // this._createTimeline();
    this._createPointerLine();


    this._refreshTimebarWidth();
    this._refreshDeCurrTime();

    this._sequences = [];
    this._mapSequenceDatas = new WeakMap();

    this._timebar.on('changeTime', this.emit.bind(this, 'changeTime'));
    this._timebar.on('changeTape', this.emit.bind(this, 'changeTape'));
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

    'currTime': {
        get: function () {
            return this._timebar._currTime;
        }
    },
    'timescale': {
        get: function () {
            return this._timebar.timescale;
        }
    },
    'sequences': {
        get: function () {
            return this._sequences;
        }
    },
    'length': {
        get: function () {
            return this._timebar.length;
        }
    }
});

p.getSave = function () {

    var save = {
        timebar: {
            currTime: this._timebar.currTime,
            timescale: this._timebar.timescale,
            length: this._timebar.length,
        },
        sequences: []
    };

    this._sequences.forEach(function (sequ) {

        save.sequences.push({
            type: sequ.type,
            data: sequ.getSave()
        });
    });

    console.log(JSON.stringify(save));

    return JSON.stringify(save);
};

p.useSave = function (save) {

    var save = mineSave(save);

    if (!save) {
        alert('Can\'t use this save');
    }

    this.clear();

    save = _.extend({
        timebar: {},
        sequences: []
    }, save)

    this._timebar.currTime = save.timebar.currTime;
    this._timebar.timescale = save.timebar.timescale;
    this._timebar.length = save.timebar.length;

    save.sequences.forEach(function (sequData) {

        var SequClass = am.sequenceTypes[sequData.type],
            sequ = new SequClass(sequData.data);

        this.addSequence(sequ);
    }, this);

    _.invoke(this._sequences, 'renderTime', this.currTime);

    am.history.clear();
};

p.getScript = function (opt) {

    opt = opt || {};

    var script, playerScripts = [];

    this._sequences.forEach(function (sequ) {

        playerScripts.push(sequ.getScript());
    });

    script = Mustache.render(mstSaveScript, {
        name: 'amsave',
        saveJson: opt.includeSave && this.getSave(),
        sequPlayerGens: playerScripts.join(',\n'),
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
    
    while(this._sequences.length) {

        this.removeSequence(this._sequences[0]);
    }
}

p.addSequence = function (sequ, skipHistory) {

    if (!skipHistory) {
        am.history.save([this.removeSequence, this, sequ, true],
            [this.addSequence, this, sequ, true]);
    }
    
    this._sequences.push(sequ);

    this._mapSequenceDatas.set(sequ, {
        deContOpt: createCont(sequ.deOptions, this._deOptionsCont),
        deContKf: createCont(sequ.deKeys, this._deKeylineCont),
    });

    this._onChangeSequenceHeight(sequ);

    sequ.on('select', this._onSelectSequence);
    sequ.on('change', this._onChangeSequence);
    sequ.on('delete', this._onDeleteSequence);
    sequ.on('move', this._onMoveSequence);
    sequ.on('changeHeight', this._onChangeSequenceHeight);

    function createCont(content, parent) {

        var de = document.createElement('div');
        de.style.width = '100%';
        de.style.height = sequ.height + 'px';
        de.style.overflow = 'hidden';
        de.style.transform = 'height 0.12 easeOut';
        de.appendChild(content);
        parent.appendChild(de);

        return de;
    }
};

p.removeSequence = function (sequ, skipHistory) {

    if (!skipHistory) {
        am.history.save([this.addSequence, this, sequ, true],
            [this.removeSequence, this, sequ, true]);
    }

    var idx = this._sequences.indexOf(sequ);

    if (idx === -1) {
        return;
    }

    this._sequences.splice(idx, 1);

    var sequData = this._mapSequenceDatas.get(sequ);
    $(sequData.deContOpt).remove();
    $(sequData.deContKf).remove();
    this._mapSequenceDatas.delete(sequ);

    sequ.removeListener('select', this._onSelectSequence);
    sequ.removeListener('change', this._onChangeSequence);
    sequ.removeListener('delete', this._onDeleteSequence);
    sequ.removeListener('move', this._onMoveSequence);
    sequ.removeListener('changeHeight', this._onChangeSequenceHeight);

    sequ.dispose();
};

p.moveSequence = function (sequ, way) {

    var idx = this._sequences.indexOf(sequ);

    this._sequences.splice(idx, 1);
    idx = Math.min(this._sequences.length, Math.max(0, idx + way));
    this._sequences.splice(idx, 0, sequ);

    this._refreshSequenceOrdering();
};

p.play = function () {

    if (this._isPlaying) return;
    this._isPlaying = true;

    this._btnTogglePlay.setToggle(true);

    _.invoke(this._sequences, 'play', this.currTime);

    this._playStartTimeStamp = performance.now();
    this._playStartCurrTime = this.currTime;
    this._animPlay();
};

p.pause = function () {

    if (!this._isPlaying) return;
    this._isPlaying = false;

    this._btnTogglePlay.setToggle(false);

    _.invoke(this._sequences, 'pause');

    window.cancelAnimationFrame(this._animPlayRafid)
};








p._animPlay = function () {

    this._animPlayRafid = window.requestAnimationFrame(this._animPlay);

    var t = Math.round(performance.now() - this._playStartTimeStamp);
    this._timebar.currTime = (this._playStartCurrTime + t) % this._timebar.length;
};

p._onTimebarSeek = function () {

    this.pause();
}

p._onSelectSequence = function(sequ) {

    if (this._currSequence === sequ) 
        return;

    if (this._currSequence) {
        
        this._currSequence.deselect(); 
    }

    this._currSequence = sequ;
};

p._onChangeSequence = function(sequ) {

    this._refreshMagnetPoints();
};

p._onDeleteSequence = function (sequ) {

    this.removeSequence(sequ);
};

p._onMoveSequence = function (sequ, way) {

    this.moveSequence(sequ, way);
};

p._onChangeTime = function () {

    this._refreshDePointer();

    this._refreshDeCurrTime();
};

p._onChangeTape = function () {

    var left = (this._timebar.start * this.timescale);

    this._deKeylineCont.style.left = left + 'px';
    this._deKeylineCont.style.width = 'calc(100% + ' + (-left) + 'px)';
};

p._onChangeSequenceHeight = function (sequ) {

    var h = sequ.height,
        sequData = this._mapSequenceDatas.get(sequ);

    sequData.deContOpt.style.height = h + 'px';
    sequData.deContKf.style.height = h + 'px';
};

p._onWindowResize = function () {

    this._refreshTimebarWidth();
};

p._onTogglePlayPause = function () {

    if (this._isPlaying) {

        this.pause();
    }
    else {
        this.play();
    }
};

p._onSelectNewSequ = function (e) {

    var addSequ = function (type) {

        var SequClass = am.sequenceTypes[type];

        this.addSequence(new SequClass);
    }.bind(this);

    switch (e.detail.selection) {

        case 'css':
            addSequ('css_sequ_type');
            break;

        case 'js':
            addSequ('js_sequ_type');
            break;

        default:
            am.dialogs.featureDoesntExist.show();
            
    }
};

p._onStartEditCurrTime = function (e) {

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








p._refreshSequenceOrdering = function () {

    this._sequences.forEach(function (sequ) {

        var sequData = this._mapSequenceDatas.get(sequ);

        this._deOptionsCont.appendChild(sequData.deContOpt);
        this._deKeylineCont.appendChild(sequData.deContKf);
    }, this);
};

p._refreshMagnetPoints = function () {

    var magnetPoints = [];

    this._sequences.forEach(function (sequ) {

        if (typeof sequ.getMagnetPoints === 'function') {

            magnetPoints = magnetPoints.concat(sequ.getMagnetPoints());
        }
    });

    magnetPoints = _.uniq(magnetPoints);

    this._timebar.magnetPoints = magnetPoints;
};

p._refreshTimebarWidth = function () {

    this._timebar.width = this._deRight.offsetWidth;
};

p._refreshDePointer = function () {

    var left = (this._timebar.start + this.currTime) * this.timescale;
    this._dePointerLine.style.left = left + 'px';
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
        str += sec + ':';
        ms = ('000' + ms).substr(-3);
    }
    str += ms;
    this._deCurrTime.textContent = str;
}







p._createBase = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.backgroundColor = amgui.color.bg0; 
    this.domElem.style.display = 'flex'; 
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

    this._deKeylineCont3 = document.createElement('div');
    this._deKeylineCont3.style.position = 'relative';
    this._deKeylineCont3.style.display = 'flex';
    this._deKeylineCont3.style.flex = '1';
    this._deKeylineCont3.style.height = '100%';
    this._deKeylineCont3.style.width = '100%';
    this._deKeylineCont3.style.overflow = 'hidden';
    this._deRight.appendChild(this._deKeylineCont3);

    this._deOptionsCont2 = document.createElement('div');
    this._deOptionsCont2.style.position = 'relative';
    this._deOptionsCont2.style.flex = '1';
    this._deOptionsCont2.style.width = '100%';
    this._deOptionsCont2.style.height = '100%';
    this._deOptionsCont2.style.overflow = 'hidden';
    this._deLeft.appendChild(this._deOptionsCont2);

    this._deKeylineCont2 = document.createElement('div');
    this._deKeylineCont2.style.position = 'relative';
    this._deKeylineCont2.style.flex = '1';
    this._deKeylineCont3.appendChild(this._deKeylineCont2);

    this._deKeylineCont = document.createElement('div');
    this._deKeylineCont.style.position = 'relative';
    this._deKeylineCont.style.width = '100%';
    this._deKeylineCont2.appendChild(this._deKeylineCont);

    this._deOptionsCont = document.createElement('div');
    this._deOptionsCont.style.position = 'relative';
    this._deOptionsCont2.appendChild(this._deOptionsCont);

    this._deRange = amgui.createRange({
        width: '6px',
        height: 'auto',
        parent: this._deKeylineCont3,
        vertical: true
    });

    amgui.makeScrollable({
        deCont: [this._deOptionsCont2, this._deKeylineCont3],
        deTarget: [this._deOptionsCont, this._deKeylineCont],
        deRange: this._deRange
    });

    this._createDividerHandler();
};

// p._createTimeline = function () {

//     this._deRight.style.backgroundColor = amgui.color.bg1;
//     this._deRight.position = 'absolute';
//     this._deRight.style.top = '0px';
//     this._deRight.style.right = '0px';
//     this._deRight.style.width = '30%';
//     this._deRight.style.height = '100%';
// };


p._createSettingsHead = function () {

    this._deSettingsHead = document.createElement('div');
    this._deSettingsHead.style.backgroundColor = 'darkgreey';
    this._deSettingsHead.style.display = 'flex';
    this._deSettingsHead.style.width = '100%';
    this._deSettingsHead.style.height = this._headerH + 'px';
    this._deLeft.appendChild(this._deSettingsHead);

    this._btnNewSequ = amgui.createIconBtn({
        tooltip: 'add new sequence',
        icon: 'plus-squared',
        parent: this._deSettingsHead,
        display: 'inline-block',
    });

    amgui.bindDropdown({
        deTarget: this._btnNewSequ,
        deMenu: amgui.createDropdown({
            options: ['css', 'js', 'attribute', 'media', 'timeline', 'three.js', 'pixi.js'],
            onSelect: this._onSelectNewSequ
        })
    });

    
    this._btnTogglePlay = amgui.createToggleIconBtn({
        tooltip: 'play/pause preview',
        iconOn: 'pause', 
        iconOff: 'play',
        parent: this._deSettingsHead,
        display: 'inline-block',
        onClick: this._onTogglePlayPause
    });

    this._deCurrTime = amgui.createLabel({
        caption: '',
        parent: this._deSettingsHead
    });
    this._deCurrTime.style.flex = '1';
    this._deCurrTime.style.textAlign = 'right';
    this._deCurrTime.style.fontSize = '12px';
    this._deCurrTime.style.marginRight = '2px';
    this._deCurrTime.style.color = amgui.color.bg3;
    this._deCurrTime.addEventListener('click', this._onStartEditCurrTime)

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
    this._inpCurrTime.addEventListener('blur', this._onFinishEditCurrTime)
    this._inpCurrTime.addEventListener('change', this._onChangeInpCurrTime)
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
}

p._createPointerLine = function () {

    this._dePointerLine = document.createElement('div');
    this._dePointerLine.style.top = this._headerH + 'px';
    this._dePointerLine.style.width = '0px';
    this._dePointerLine.style.position = 'absolute';
    this._dePointerLine.style.userSelect = 'none';
    this._dePointerLine.style.height = '100%';
    this._dePointerLine.style.borderLeft = '1px solid red';
    this._deRight.appendChild(this._dePointerLine);
};