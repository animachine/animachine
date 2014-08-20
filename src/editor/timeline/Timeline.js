var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var Timebar = require('./Timebar');
var amgui = require('../amgui');

function Timeline(am) {

    EventEmitter.call(this);

    this._headerH = 32;
    
    this._createBase();
    this._createSettingsHead();
    this._createTimeline();

    this._currSequence;
    
    this._timebar = new Timebar({height: this._headerH});
    this._deRight.appendChild(this._timebar.domElem);
    this._timebar.showTime(0, 1000 * 20, this._deRight.offsetWidth || 1000);

    this._timebar.on('changeTime', this.emit.bind(this, 'changeTime'));

    this._sequences = [];

    this._dropdownNewSequ.addEventListener('select', function (e) {
        
        this.addSequence(am.sequenceTypes[0].create());
    }.bind(this));

    this._onSelectSequence = this.__onSelectSequence.bind(this);
}

inherits(Timeline, EventEmitter);
var p = Timeline.prototype;
module.exports = Timeline;

p.addSequence = function (sequ) {

    var deContOpt = createCont(sequ.deOptions, this._deLeft),
        deContKf = createCont(sequ.deKeys, this._deRight);

    this._sequences.push(sequ);

    sequ.on('select', this._onSelectSequence);

    sequ.on('heightChange', function () {

        deContOpt.style.height = sequ.height() + 'px';
        deContKf.style.height = sequ.height() + 'px';
    });

    this._sequences.push(sequ, parent);

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

p.__onSelectSequence = function(sequ) {

    if (this._currSequence === sequ) 
        return;

    if (this._currSequence)
        this._currSequence.deselect(); 

    this._currSequence = sequ;
}


p._createBase = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.backgroundColor = 'red'; 
    this.domElem.style.display = 'flex'; 
    this.domElem.style.pointerEvents = 'auto'; 

    this._deLeft = document.createElement('div');
    this._deLeft.style.backgroundColor = 'turquoise';
    this._deLeft.style.width = '230px';
    this._deLeft.style.height = '100%';
    this.domElem.appendChild(this._deLeft);

    this._deDivider = document.createElement('div');
    this._deDivider.style.backgroundColor = 'white';
    this._deDivider.style.width = '1px';
    this._deDivider.style.height = '100%';
    this.domElem.appendChild(this._deDivider);

    this._deRight = document.createElement('div');
    this._deRight.style.backgroundColor = 'black';
    this._deRight.style.flex = '1';
    this._deRight.style.height = '100%';
    this.domElem.appendChild(this._deRight);
}

p._createTimeline = function () {

    this._deRight.style.backgroundColor = 'tomato';
    this._deRight.position = 'absolute';
    this._deRight.style.top = '0px';
    this._deRight.style.right = '0px';
    this._deRight.style.width = '30%';
    this._deRight.style.height = '100%';
}


p._createSettingsHead = function () {

    this._deSettingsHead = document.createElement('div');
    this._deSettingsHead.style.backgroundColor = 'darkgreey';
    this._deSettingsHead.style.width = '100%';
    this._deSettingsHead.style.height = this._headerH + 'px';
    this._deLeft.appendChild(this._deSettingsHead);

    this._btnNewSequ = amgui.createIconBtn({});
    this._deSettingsHead.appendChild(this._btnNewSequ);
    this._dropdownNewSequ = amgui.createDropdown({options: ['css', 'script']});
    amgui.bindDropdown(this._btnNewSequ, this._dropdownNewSequ);
}
