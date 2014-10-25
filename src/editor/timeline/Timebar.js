'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../amgui');
var decorTimebarNavigator = require('./decorTimebarNavigator');

function Timebar(opt) {

    EventEmitter.call(this);

    opt = opt || {};

    this._start = opt.start || 0;
    this._width = opt.width || 0;
    this._height = opt.height || 21;
    this._timescale = opt.timescale || 0;
    this._currTime = opt.currTime || 0;
    this._length = opt.length || 60000;

    this._magnetPoints = [];
    this._magnetDistancePx = 2.50;
    this._startMargin = 5;

    this._onMDown = onMDown.bind(this);
    this._onMMove = onMMove.bind(this);
    this._onMUp = onMUp.bind(this);

    this._steps = getSteps();

    this._createBase();
    this._createPointer();
    this._createEndShadow();

    this._renderTape();
//TODO use amgui.makeDraggable()
    this._canvasTape.addEventListener('mousedown', this._onMDown);

    decorTimebarNavigator(this);
}

inherits(Timebar, EventEmitter);
var p = Timebar.prototype;
module.exports = Timebar;




Object.defineProperties(p, {

    /** px/ms */
    timescale: {
        set: function (v) {

            if (!Number.isFinite(v) || this._timescale === v) return;

            this._timescale = Math.min(1, Math.max(0.0001, v));
            this._renderTape();
            this.emit('changeTape');
        },
        get: function () {
            return this._timescale;
        }
    },

    start: {
        set: function (v) {

            v = Math.min(this._startMargin / this.timescale, parseInt(v));

            if (!Number.isFinite(v) || this._start === v) return;

            this._start = v;
            this._renderTape();
            this.emit('changeTape');
        },
        get: function () {
            return this._start;
        }
    }, 

    width: {
        set: function (v) {

            v = parseInt(v);

            if (!Number.isFinite(v) || this._width === v) return;
            
            this._width = v;
            this._renderTape();
            this.emit('changeTape');
        },
        get: function () {
            return this._width;
        }
    }, 
    
    end: {
        get: function () {
            return this._start + (this._width / this._timescale);
        }
    },
    
    visibleTime: {
        set: function (v) {
            this.timescale = this._width / v;
        },

        get: function () {
            return this._width / this._timescale;
        }
    },
    
    currTime: {
        set: function (v) {

            v = Math.max(8, parseInt(v));

            if (!Number.isFinite(v) || this._currTime === v) return;

            this._currTime = v;

            this._refreshPointer();

            this.emit('changeTime', this._currTime);
        },
        get: function () {
            return this._currTime;
        }
    }, 
    
    magnetPoints: {
        set: function (v) {
            this._magnetPoints = v;
        },
        get: function () {
            return this._magnetPoints;
        }
    },

    length: {
        set: function (v) {

            v = parseInt(v);

            if (!Number.isFinite(v) || this._length === v) return;
            this._length = v;

            this._renderTape();
            this.emit('changeTape');
        },
        get: function () {
            return this._length;
        }
    },
});











p.screenXToTime = function (screenX) {

    var left = this._canvasTape.getBoundingClientRect().left,
        mouseX = screenX - left,
        time = (mouseX / this.width) * this.visibleTime;

    time -= this.start;

    return time;
};

p.magnetizeTime = function (time) {

    var magnetPoint, magnetPointDiff = undefined;

    this._magnetPoints.forEach(function (mp) {

        var diff = Math.abs(mp - time);

        if (diff < magnetPointDiff || magnetPointDiff === undefined) {
            magnetPoint = mp;
            magnetPointDiff = diff;
        }
    });
    
    if ((magnetPointDiff * this._timescale) < this._magnetDistancePx) {

        time = magnetPoint;
    }

    return time;
};











p._renderTape = function () {

    var start = this._start,
        length = this._length,
        visibleTime = this.visibleTime,
        height = this._height,
        scale = this.timescale, 
        width = this._width,
        maxMarkers = width / 4,
        step, i, text, textW,
        ctx = this._ctxTape;

    this._canvasTape.width = width;
    this._canvasTape.height = height;

    this._steps.forEach(function (s) {

        if ((this.visibleTime / s.small) < maxMarkers && (!step || step.small > s.small)) {

            step = s;
        }
    }, this);

    if (step) {

        ctx.linweidth = 0.5;
        ctx.strokeStyle = amgui.color.bg3;
        ctx.fillStyle = amgui.color.bg3;
        ctx.font = ~~(this._height * 0.5) + 'px "Open Sans"';

        for (i = start % step.small; i < visibleTime; i += step.small) {

            ctx.moveTo(~~(i * scale) + 0.5, height);
            ctx.lineTo(~~(i * scale) + 0.5, height * 0.75);
        }
        ctx.stroke();

        for (i = start % step.big; i < visibleTime; i += step.big) {

            ctx.moveTo(~~(i * scale) + 0.5, height);
            ctx.lineTo(~~(i * scale) + 0.5, height * 0.62);
        }
        ctx.stroke();

        for (i = start % step.time; i < visibleTime; i += step.time) {

            text = step.format(i - start);
            textW = ctx.measureText(text).width / 2;
            ctx.fillText(text, i * scale - textW, 12);
        }
        ctx.stroke();
    }

    this._refreshPointer();

    var endWidth = ((visibleTime - (start + length)) * scale);
    this._deEndShadow.style.width = Math.max(0, Math.min(width, endWidth)) + 'px';
};












function onMDown(e) {

    e.stopPropagation();
    e.preventDefault();

    if (e.shiftKey) this._dragMode = 'translate';
    else if (e.ctrlKey) this._dragMode = 'scale';
    else this._dragMode = 'seek';

    this._mdX = e.pageX;
    this._mdStart = this._start;
    this._mdTimescale = this._timescale;

    this._onMMove(e);

    window.addEventListener('mousemove', this._onMMove);
    window.addEventListener('mouseup', this._onMUp);
    window.addEventListener('mouseleave', this._onMUp);
}

function onMMove(e) {

    var move = e.screenX - this._mdX,
        time, magnetPoint, magnetPointDiff;

    if (this._dragMode === 'seek') {

        time = this.screenXToTime(e.screenX);
        time = this.magnetizeTime(time);

        this.currTime = time;

        this.emit('seek');
    }
    else if (this._dragMode === 'translate') {

        this.start = this._mdStart + (move / this.timescale);
    }
    else if (this._dragMode === 'scale') {

        this.timescale = this._mdTimescale + (move/1000);

        var mdPos = (this._mdStart + this.currTime) * this._mdTimescale;
        this.start = -((this.currTime * this.timescale) - mdPos) / this.timescale;
    }
}

function onMUp() {

    window.removeEventListener('mousemove', this._onMMove);
    window.removeEventListener('mouseup', this._onMUp);
    window.removeEventListener('mouseleave', this._onMUp);
}










p._refreshPointer = function () {

    var pos = ((this.start + this.currTime) / this.visibleTime) * this.width;

    this._dePointer.style.left = pos + 'px';
};











p._createBase = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.backgroundColor = amgui.color.bg0;
    this.domElem.style.position = 'relative';

    this._canvasTape = document.createElement('canvas');
    this._ctxTape = this._canvasTape.getContext('2d');
    this._canvasTape.style.display = 'block';
    this.domElem.appendChild(this._canvasTape); 
};

p._createPointer = function () {

    var radius = 5.5;
    this._dePointer = document.createElement('div');
    this._dePointer.style.position = 'absolute';
    this._dePointer.style.bottom = 2*radius + 'px';
    var pointer = document.createElement('div');
    pointer.style.position = 'absolute';
    pointer.style.boxSizing = 'border-box';
    pointer.style.pointerEvents = 'none';
    pointer.style.left = -radius + 'px';
    pointer.style.width = 2*radius + 'px';
    pointer.style.height = 2*radius + 'px';
    pointer.style.border = 'solid red 1px';
    pointer.style.borderRadius = radius + 'px';
    this._dePointer.appendChild(pointer); 
    this.domElem.appendChild(this._dePointer); 
};

p._createEndShadow = function () {

    this._deEndShadow = document.createElement('div');
    this._deEndShadow.style.position = 'absolute';
    this._deEndShadow.style.top = '0px';
    this._deEndShadow.style.right = '0px';
    this._deEndShadow.style.height = '100%';
    this._deEndShadow.style.width = '0px';
    this._deEndShadow.style.pointerEvents = 'none';
    this._deEndShadow.style.backgroundColor = 'rgba(83,83,83,0.73)';
    this.domElem.appendChild(this._deEndShadow); 

    var handler = document.createElement('div');
    handler.style.position = 'absolute';
    handler.style.top = '0px';
    handler.style.left = '0px';
    handler.style.height = '100%';
    handler.style.width = '3px';
    handler.style.cursor = 'ew-resize';
    handler.style.pointerEvents = 'auto';
    this._deEndShadow.appendChild(handler);

    amgui.makeDraggable({
        deTarget: handler,
        thisArg: this,
        onDown: function () {
            
            return {
                length: this.length,
            };
        },
        onMove: function (md, mx) {

            var time = this.screenXToTime(mx);
            time = this.magnetizeTime(time);

            this.length = time;
        }
    });
};








//Steps
function getSteps() {

    return [
        {
            small: 5, 
            big: 50, 
            time: 50, 
            format: function (ms) {
                
                return ms + 'ms';
            } 
        },
        {
            small: 10, 
            big: 100, 
            time: 100, 
            format: function (ms) {
                
                return ms + 'ms';
            } 
        },
        {
            small: 100, 
            big: 1000, 
            time: 1000, 
            format: function (ms) {
                var min = parseInt(ms/60000);
                var sec = parseInt(ms/1000) % 60;

                return (min ? min+':'+two(sec) : sec) + 's';
            } 
        },
        {
            small: 500, 
            big: 5000, 
            time: 5000, 
            format: function (ms) {
                var min = parseInt(ms/60000);
                var sec = parseInt(ms/1000) % 60;

                return (min ? min+':'+two(sec) : sec) + 's';
            } 
        },
        {
            small: 10000, 
            big: 60000, 
            time: 60000, 
            format: function (ms) {
                var min = parseInt(ms/60000) % 60;
                var hour = parseInt(ms/3600000);

                return (hour ? hour+':'+two(min) : min) + 'm';
            } 
        },
        {
            small: 60000, 
            big: 5*60000, 
            time: 5*60000, 
            format: function (ms) {
                var min = parseInt(ms/60000) % 60;
                var hour = parseInt(ms/3600000);

                return (hour ? hour+':'+two(min) : min) + 'm';
            } 
        }
    ];

    function two(num) {

        return ('00' + num).substr(-2);
    }
}
