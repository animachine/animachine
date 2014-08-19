var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

function Timebar(opt) {

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

p.showTime = function(start, end, width) {

    var full = end - start,
        scale = width / full, 
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

p.setCurrentTime = function (time) {

    if (this._currTime === time) return;

    this._currTime = time;

    var full = this._end - this._start,
        pos = time / full * this.width;

    this._dePointer.style.left = pos + 'px';

    this.emit('changeTime', this._currTime);
};

Object.defineProperty(p, 'timescale', {
    get: function () {
        var full = this._end - this._start;
        return this.width / full;
    }
});

function onMDown(e) {

    this._mdx = e.clientX;

    this._onMMove(e);

    window.addEventListener('mousemove', this._onMMove);
    window.addEventListener('mouseup', this._onMUp);
    window.addEventListener('mouseleave', this._onMUp);
}

function onMMove(e) {

    var left = this._canvasTape.getBoundingClientRect().left,
        full = this._end - this._start,
        time = (e.pageX - left) / this.width * full;

    this.setCurrentTime(this._start + time);
}

function onMUp() {

    window.removeEventListener('mousemove', this._onMMove);
    window.removeEventListener('mouseup', this._onMUp);
    window.removeEventListener('mouseleave', this._onMUp);
}


p._createBase = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.backgroundColor = 'green';
    this.domElem.style.position = 'relative';

    this._canvasTape = document.createElement('canvas');
    this._ctxTape = this._canvasTape.getContext('2d');
    this._canvasTape.style.display = 'block';
    this.domElem.appendChild(this._canvasTape); 
};

p._createPointer = function () {

    var radius = 4;
    this._dePointer = document.createElement('div');
    this._dePointer.style.position = 'absolute';
    this._dePointer.style.top = '0px';
    var pointer = document.createElement('div');
    pointer.style.position = 'absolute';
    pointer.style.left = -radius + 'px';
    pointer.style.width = 2*radius + 'px';
    pointer.style.height = 2*radius + 'px';
    pointer.style.border = 'solid red 1px';
    pointer.style.borderRadius = radius + 'px';
    this._dePointer.appendChild(pointer); 
    this.domElem.appendChild(this._dePointer); 
};
