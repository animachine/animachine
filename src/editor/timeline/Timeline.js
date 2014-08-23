var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var Timebar = require('./Timebar');
var amgui = require('../amgui');

function Timeline(am) {

    EventEmitter.call(this);
    this.setMaxListeners(1100);

    this._headerH = 23;
    
    this._createBase();
    this._createSettingsHead();
    this._createTimeline();
    this._createPointerLine();

    this._currSequence;
    
    this._timebar = new Timebar({
        height: this._headerH,
        width: this._deRight.offsetWidth || 1000,
        timescale: 0.05
    });
    this._deRight.insertBefore(this._timebar.domElem, this._deKeylineCont);

    this._sequences = [];

    this._dropdownNewSequ.addEventListener('select', function (e) {
        
        this.addSequence(am.sequenceTypes[0].create());
    }.bind(this));

    this._onSelectSequence = this._onSelectSequence.bind(this);
    this._onChangeSequence = this._onChangeSequence.bind(this);
    this._onChangeTime = this._onChangeTime.bind(this);
    this._onChangeTape = this._onChangeTape.bind(this);

    this._timebar.on('changeTime', this.emit.bind(this, 'changeTime'));
    this._timebar.on('changeTape', this.emit.bind(this, 'changeTape'));
    this._timebar.on('changeTime', this._onChangeTime);
    this._timebar.on('changeTape', this._onChangeTape);

    am.toolbar.addIcon({
        icon: 'floppy',
        onClick: this.getScript.bind(this),
        separator: 'global'
    });
}

inherits(Timeline, EventEmitter);
var p = Timeline.prototype;
module.exports = Timeline;

p.addSequence = function (sequ) {

    var deContOpt = createCont(sequ.deOptions, this._deLeft),
        deContKf = createCont(sequ.deKeys, this._deKeylineCont);

    this._sequences.push(sequ);

    sequ.on('select', this._onSelectSequence);
    sequ.on('change', this._onChangeSequence);

    sequ.on('changeHeight', function () {

        deContOpt.style.height = sequ.height() + 'px';
        deContKf.style.height = sequ.height() + 'px';
    });

    function createCont(content, parent) {

        var de = document.createElement('div');
        de.style.width = '100%';
        de.style.height = sequ.height() + 'px';
        de.style.overflow = 'hidden';
        de.style.transform = 'height 0.12 easeOut';
        de.appendChild(content);
        parent.appendChild(de);

        return de;
    }
}

Object.defineProperty(p, 'currTime', {
    get: function () {
        return this._timebar._currTime
    }
});

Object.defineProperty(p, 'timescale', {
    get: function () {
        return this._timebar.timescale
    }
});

Object.defineProperty(p, 'length', {
    get: function () {
        return this._timebar._end - this._timebar._start;
    }
});

p.getScript = function () {

    var scripts = [];
    this._sequences.forEach(function (sequ) {

        scripts.push(sequ.getScript());
    });

    var script = 'document.timeline.play(new AnimationGroup([\n' + 
        scripts.join(',\n') + ']));';
    
    console.log(script);

    return script;
};

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
};

p._onChangeTape = function () {

    this._deKeylineCont.style.left = (this._timebar.start * this.timescale) + 'px';
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

    this._initDividerMoving();
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
    this._deSettingsHead.style.width = '100%';
    this._deSettingsHead.style.height = this._headerH + 'px';
    this._deLeft.appendChild(this._deSettingsHead);

    this._btnNewSequ = amgui.createIconBtn({});
    this._deSettingsHead.appendChild(this._btnNewSequ);
    this._dropdownNewSequ = amgui.createDropdown({options: ['css', 'script', 'attribute', 'media', 'timeline']});
    amgui.bindDropdown({
        deTarget: this._btnNewSequ,
        deMenu: this._dropdownNewSequ
    });
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



p._initDividerMoving = function () {

    that = this;

    this._deDivider.style.cursor = 'ew-resize';

    this._deDivider.addEventListener('mousedown', down);

    function down(e) {

        e.stopPropagation();
        e.preventDefault();
        
        window.addEventListener('mousemove', drag);
        window.addEventListener('mouseup', end);
        window.addEventListener('mouseleave', end);
    }

    function drag(e) {

        var left = e.pageX - that.domElem.getBoundingClientRect().left;

        that._deDivider.style.left = left + 'px';
        that._deLeft.style.width = left + 'px';
    }

    function end(e) {
        
        window.removeEventListener('mousemove', drag);
        window.removeEventListener('mouseup', end);
        window.removeEventListener('mouseleave', end);
    }
};
