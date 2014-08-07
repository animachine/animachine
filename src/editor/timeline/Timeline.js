var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var Timebar = require('./Timebar');

function Timeline() {

    this._headerH = 32;
    
    this._createBase();
    
    this._timebar = new Timebar({height: this._headerH});
    this.de = timebar.domElem()
}

inherits(Timeline, EventEmitter);
var p = Timeline.prototype;
module.exports = Timeline;

p._createBase = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.backgroundColor = 'green';

    this._deLeft = document.createElement('div');
    this._deLeft.style.backgroundColor = 'black';
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

    var c = document.createElement('canvas');
    var ctx = c.;
    this._deRight.style.backgroundColor = 'black';
    this._deRight.position = 'absolute';
    this._deRight.style.top = '0px';
    this._deRight.style.right = '0px';
    this._deRight.style.width = '30%';
    this._deRight.style.height = '100%';
}

p.addSequence = function (sequ) {

    var deContOpt = createCont(sequData.deOptions),
        deContKf = createCont(sequData.deKeyframes);

    sequ.on('heightChange', function () {

        deContOpt.height = sequ.height();
        deContKf.height = sequ.height();
    });

    this._sequences.push(sequ);

    function createCont(content) {

        var de = document.createElement('div');
        de.style.width = '100%';
        de.style.height = sequ.height();
        de.style.transform = 'height 0.12 easeOut';
        de.appendChild(content);
    }
}
