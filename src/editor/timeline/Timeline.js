'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var Timebar = require('./Timebar');
var amgui = require('../amgui');
var mstSaveScript = require('./script.save.mst');

function Timeline(am) {

    EventEmitter.call(this);
    this.setMaxListeners(1100);

    this._headerH = 23;

    this._onSelectSequence = this._onSelectSequence.bind(this);
    this._onChangeSequence = this._onChangeSequence.bind(this);
    this._onChangeTime = this._onChangeTime.bind(this);
    this._onChangeTape = this._onChangeTape.bind(this);
    this._onWindowResize = this._onWindowResize.bind(this);
    this._onTogglePlayPause = this._onTogglePlayPause.bind(this);
    this._onTimebarSeek = this._onTimebarSeek.bind(this);
    this._animPlay = this._animPlay.bind(this);
    
    this._createBase();
    this._createSettingsHead();
    this._createTimeline();
    this._createPointerLine();

    this._currSequence;
    
    this._timebar = new Timebar({
        height: this._headerH,
        width: this._deRight.offsetWidth || 1000,
        timescale: 0.12,
        length: 6000
    });
    this._deRight.insertBefore(this._timebar.domElem, this._deKeylineCont);

    this._refreshTimebarWidth();
    this._refreshDeCurrTime();

    this._sequences = [];

    this._timebar.on('changeTime', this.emit.bind(this, 'changeTime'));
    this._timebar.on('changeTape', this.emit.bind(this, 'changeTape'));
    this._timebar.on('changeTime', this._onChangeTime);
    this._timebar.on('changeTape', this._onChangeTape);
    this._timebar.on('seek', this._onTimebarSeek);

    amgui.callOnAdded(this.domElem, this._refreshTimebarWidth, this);
    
    window.addEventListener('resize', this._onWindowResize);
}

inherits(Timeline, EventEmitter);
var p = Timeline.prototype;
module.exports = Timeline;

p.addSequence = function (sequ) {

    var deContOpt = createCont(sequ.deOptions, this._deLeft),
        deContKf = createCont(sequ.deKeys, this._deKeylineCont);
    
    setHeight();

    this._sequences.push(sequ);

    sequ.on('select', this._onSelectSequence);
    sequ.on('change', this._onChangeSequence);

    sequ.on('changeHeight', setHeight);

    function setHeight(h) {

        var h = sequ.height;

        deContOpt.style.height = h + 'px';
        deContKf.style.height = h + 'px';
    }

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
}

Object.defineProperties(p, {

    'currTime': {
        get: function () {
            return this._timebar._currTime
        }
    },

    'timescale': {
        get: function () {
            return this._timebar.timescale
        }
    }
});

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

p._onChangeTime = function () {

    var left = this.currTime * this.timescale;
    this._dePointerLine.style.left = left + 'px';

    this._refreshDeCurrTime();
};

p._onChangeTape = function () {

    this._deKeylineCont.style.left = (this._timebar.start * this.timescale) + 'px';
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
        ms = ('0000' + ms).substr(-4);
    }
    str += ms;
    this._deCurrTime.textContent = str;
}



p.getScript = function (opt) {

    opt = opt || {};

    var script, playerScripts = [];

    this._sequences.forEach(function (sequ) {

        playerScripts.push(sequ.getScript());
    });

    script = Mustache.render(mstSaveScript, {
        name: 'anim1',
        saveData: opt.save && this.getSave(),
        sequPlayerGens: playerScripts.join(',\n'),
        autoPlay: opt.autoPlay
    });

    console.log(script);

    return script;
}

p.getSave = function () {

    var save = {
        currTime: this.currTime,
        timescale: this.timescale,
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

    this.currTime = save.currTime;
    this.timescale = save.timescale;

    save.sequences.forEach(function (sequData) {

        var sequ = new am.sequenceTypes[sequData.type]();
        sequ.useSave(sequData.data)
        this.addSequence(sequ);
    }, this);
};

p.clear = function () {
    //TODO
}







p._createBase = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.backgroundColor = amgui.color.bg0; 
    this.domElem.style.display = 'flex'; 
    this.domElem.style.pointerEvents = 'auto'; 

    this._deLeft = document.createElement('div');
    this._deLeft.style.backgroundColor = amgui.color.bg0;
    this._deLeft.style.width = '230px';
    this._deLeft.style.height = '100%';
    this.domElem.appendChild(this._deLeft);

    this._deDivider = document.createElement('div');
    this._deDivider.style.backgroundColor = amgui.color.bg3;
    this._deDivider.style.width = '1px';
    this._deDivider.style.height = '100%';
    this._deDivider.style.cursor = 'ew-resize';
    amgui.makeDraggable({

        deTarget: this._deDivider,
        thisArg: this,
        
        onDrag: function (md, mx) {

            var left = mx - this.domElem.getBoundingClientRect().left;

            this._deDivider.style.left = left + 'px';
            this._deLeft.style.width = left + 'px';

            this._refreshTimebarWidth();
        }
    });
    this.domElem.appendChild(this._deDivider);

    this._deRight = document.createElement('div');
    this._deRight.style.position = 'relative';
    this._deRight.style.backgroundColor = amgui.color.bg0;
    this._deRight.style.flex = '1';
    this._deRight.style.height = '100%';
    this.domElem.appendChild(this._deRight);

    this._deKeylineCont = document.createElement('div');
    this._deKeylineCont.style.position = 'relative';
    this._deKeylineCont.style.height = '100%';
    this._deRight.appendChild(this._deKeylineCont);
};

p._createTimeline = function () {

    this._deRight.style.backgroundColor = amgui.color.bg1;
    this._deRight.position = 'absolute';
    this._deRight.style.top = '0px';
    this._deRight.style.right = '0px';
    this._deRight.style.width = '30%';
    this._deRight.style.height = '100%';
};


p._createSettingsHead = function () {

    this._deSettingsHead = document.createElement('div');
    this._deSettingsHead.style.backgroundColor = 'darkgreey';
    this._deSettingsHead.style.display = 'flex';
    this._deSettingsHead.style.width = '100%';
    this._deSettingsHead.style.height = this._headerH + 'px';
    this._deLeft.appendChild(this._deSettingsHead);

    this._btnNewSequ = amgui.createIconBtn({
        icon: 'plus-squared',
        parent: this._deSettingsHead,
        display: 'inline-block'
    });
    this._dropdownNewSequ = amgui.createDropdown({options: ['css', 'script', 'attribute', 'media', 'timeline']});
    amgui.bindDropdown({
        deTarget: this._btnNewSequ,
        deMenu: this._dropdownNewSequ
    });

    
    this._btnTogglePlay = amgui.createToggleIconBtn({
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
};

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