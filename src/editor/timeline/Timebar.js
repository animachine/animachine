var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

function TimeBar(opt) {

    opt = opt || {};

    this._start = 0;
    this._end = 0;
    this._currTime = 0;
    this._createBase();
    this.height = opt.height || 32;

    this._onMDown = onMDown.bind(this);
    this._onMMove = onMMove.bind(this);
    this._onMUp = onMUp.bind(this);

    this._steps = [
        {
            small: 100, 
            big: 1000, 
            time: 1000, 
            format: function (t) {
                var min = parseInt(t/60000);
                var sec = parseInt(t/1000) % 60;

                return (min ? min+':'+sec : sec) + 's';
            } 
        }
    ]

    this._createBase();
    this._createPointer();

    this._canvasTape.addEventListener('mousedown', this._onMDown)
}

inherits(Timebar, EventEmitter);
var p = Timebar.prototype;
module.exports = Timebar;

p._createBase = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.backgroundColor = 'green';

    this._canvasTape = document.createElement('canvas');
    this._ctxTape = this._canvasTape.getContext('2d');
}

p.createPointer = function () {

    var radius = 4;
    this._dePointer = document.createElement('div');
    var pointer = document.createElement('div');
    pointer.style.position = 'absolute';
    pointer.style.left = -radius + 'px';
    pointer.style.width = 2*radius + 'px';
    pointer.style.height = 2*radius + 'px';
    pointer.style.border = 'solid red 1px';
    pointer.style.borderRadius = r + 'px';
}

p.showTime(start, end, width) {

    var full = end - start,
        scale = width / full * scale, 
        maxMarkers = width / 4,
        step, i, 
        ctx = this._ctxTape;

    this._start = start;
    this._end = end;
    this.width = width;

    this._canvasTape.width = this.width;
    this._canvasTape.height = this.height;

    this._steps.forEach(function (s) {

        if (full / s.small < maxMarkers && (!step || step.small > s.small)) {

            step = s;
        }
    });

    if (step) {

        ctx.linweidth = 1;
        ctx.strokeStyle = '#fff';
        ctx.fillStyle = '#fff';

        i = step.small * parseInt(start / step.small + 1);
        for (; i < end; i += step.small) {

            ctx.moveTo(i * scale, this.height);
            ctx.lineTo(i * scale, this.height * 0.75);
        }
        ctx.stroke();

        i = step.big * parseInt(start / step.big + 1);
        for (; i < end; i += step.big) {

            ctx.moveTo(i * scale, this.height);
            ctx.lineTo(i * scale, this.height * 0.5);
        }
        ctx.stroke();

        i = step.time * parseInt(start / step.time + 1);
        for (; i < end; i += step.big) {

            ctx.fillText(step.format(i), i * scale, 23)
        }
        ctx.stroke();
    }
}

this.setCurrentTime = function (time) {

    this._currTime = time;

    var full = this._end - this._start,
        pos = time / full * this._width;

    this._dePointer.style.left = pos + 'px';
}

function onMDown(e) {

    this._mdx = e.clientX;

    this._onMMove(e);

    window.addEventListener('mousemove', this._onMMove);
    window.addEventListener('mouseup', this._onMUp);
    window.addEventListener('mouseleave', this._onMUp);
}

function onMMove(e) {

    var full = this._end - this._start,
        time = e.clientX / this._width * full;

    this.setCurrentTime(this._end + time);
}

function onMUp() {

    window.removeEventListener('mousemove', this._onMMove);
    window.removeEventListener('mouseup', this._onMUp);
    window.removeEventListener('mouseleave', this._onMUp);
}
