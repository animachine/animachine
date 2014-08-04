var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var _ = require('lodash');

MOUSESTATES = {
    '0000': 'default',
    '1000': 'n-resize',
    '1100': 'ne-resize',
    '0100': 'e-resize',
    '0110': 'se-resize',
    '0010': 's-resize',
    '0011': 'sw-resize',
    '0001': 'w-resize',
    '1001': 'nw-resize'
}


function Bund() {

    EventEmitter.call(this);

    this._params = {x: 0, y: 0, h: 0, w: 0};

    this._onDrag = this._onDrag.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
}
Bund.id = 'bund';

inherits(Bund, EventEmitter);

var p = Bund.prototype;

p.setup = function (opt) {

    if (!this.domElem) {
        this.generateGraphics();
    }

    _.extend(this._params, opt.params);
    this._resize();
};

p.generateGraphics = function () {

    this.domElem = document.createElement('svg');
    this.domElem.style.position = 'fixed';
    var g = this._g = {};

    g.svg = window.SVG(this.domElem).fixSubPixelOffset();
    g.rect = g.svg.rect(0, 0)
        .stroke({ color: '#f06', width: 2 })
        .fill({ color: '#f06', opacity: 0 });

    this.domElem.addEventListener('mousemove', this._onMouseMove);
    this.domElem.addEventListener('mousedown', this._onMouseDown);
};


p._resize = function () {

    var g = this._g, p = this._params;

    this.domElem.style.left = p.x + 'px';
    this.domElem.style.top = p.y + 'px';
    this.domElem.style.width = p.w + 'px';
    this.domElem.style.height = p.h + 'px';

    g.svg.size(p.w, p.h).move(p.x, p.y);
    g.rect.size(p.w, p.h);
};


p._onMouseMove = function (e) {

    if (!this._isHandle) {

        this._setFinger(e);
    }
}

p._onDrag = function (e) {

    var p = this._params,
        sp = this._mdPos.params,
        finger = this._finger,
        mx = e.pageX,
        my = e.pageY,
        dx = mx - this._mdPos.mx,
        dy = my - this._mdPos.my;

    if (finger === '0000') {
        p.x = sp.x + dx;
        p.y = sp.y + dy;
    }

    if (finger.charAt(0) === '1') {
        p.y = sp.y + dy;
        p.h = sp.h - dy;
    }

    if (finger.charAt(1) === '1') {
        p.w = sp.w + dx;
    }

    if (finger.charAt(2) === '1') {
        p.h = sp.h + dy;
    }

    if (finger.charAt(3) === '1') {
        p.x = sp.x + dx;
        p.w = sp.w - dx;
    }

    this.emit('change', this._params);
}

p._setFinger = function (e) {

    var p = this._params,
        diff = Math.min(3, p.w/2, p.h/2),
        mx = e.pageX,
        my = e.pageY,
        top = Math.abs(p.y - my) <= diff,
        left = Math.abs((p.x + p.w) - mx) <= diff,
        bottom = Math.abs((p.y + p.h)- my) <= diff,
        right = Math.abs(p.x - mx) <= diff;
    
    this._finger = ('000' + (top * 1000 + left * 100 + bottom * 10 + right * 1)).substr(-4);

    this.domElem.style.cursor = MOUSESTATES[this._finger];
}

p._onMouseDown = function (e) {

    this._isHandle = true;

    this._mdPos = {
        mx: e.pageX,
        my: e.pageY,
        params: _.clone(this._params)
    }

    window.addEventListener('mouseup', this._onMouseUp);
    window.addEventListener('mouseup', this._onMouseUp);
    window.addEventListener('mousemove', this._onDrag);
}

p._onMouseUp = function () {

    this._isHandle = false;
    window.removeEventListener('mouseup', this._onMouseUp);
    window.removeEventListener('mouseleave', this._onMouseUp);
    window.removeEventListener('mousemove', this._onDrag);
}

module.exports = Bund;
