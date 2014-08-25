var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var _ = require('lodash');

MOUSESTATES = {
    '0000': 'move',
    '1000': 'ns-resize',
    '1100': 'nesw-resize',
    '0100': 'ew-resize',
    '0110': 'nwse-resize',
    '0010': 'ns-resize',
    '0011': 'nesw-resize',
    '0001': 'ew-resize',
    '1001': 'nwse-resize'
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

    this.domElem = document.createElement('div');
    this.domElem.style.position = 'fixed';
    this.domElem.style.boxSizing = 'border-box';
    this.domElem.style.pointerEvents = 'auto';
    this.domElem.style.border = '1px solid red';

    this.domElem.addEventListener('mousemove', this._onMouseMove);
    this.domElem.addEventListener('mousedown', this._onMouseDown);
};


p._resize = function () {

    var p = this._params;

    this.domElem.style.left = p.x + 'px';
    this.domElem.style.top = p.y + 'px';
    this.domElem.style.width = p.w + 'px';
    this.domElem.style.height = p.h + 'px';
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
        dy = my - this._mdPos.my,
        change = {};
        
    if (finger === '0000') {
        change.x = p.x = ~~(sp.x + dx);
        change.y = p.y = ~~(sp.y + dy);
    }

    if (finger.charAt(0) === '1') {
        change.y = p.y = ~~(sp.y + dy);
        change.h = p.h = ~~(sp.h - dy);
    }

    if (finger.charAt(1) === '1') {
        change.w = p.w = ~~(sp.w + dx);
    }

    if (finger.charAt(2) === '1') {
        change.h = p.h = ~~(sp.h + dy);
    }

    if (finger.charAt(3) === '1') {
        change.x = p.x = ~~(sp.x + dx);
        change.w = p.w = ~~(sp.w - dx);
    }

    this.emit('change', change);
}

p._setFinger = function (e) {

    var p = this._params,
        diff = 3,
        mx = e.pageX,
        my = e.pageY,
        top = Math.abs(p.y - my) <= diff,
        left = Math.abs((p.x + p.w) - mx) <= diff,
        bottom = Math.abs((p.y + p.h)- my) <= diff,
        right = Math.abs(p.x - mx) <= diff;
    
    if (p.w < diff * 3 && p.x < mx && p.x + p.w > mx) {

        left = right = false;
    }

    if (p.h < diff * 3 && p.y < my && p.y + p.h > my) {

        top = bottom = false;
    }
    
    this._finger = ('000' + (top * 1000 + left * 100 + bottom * 10 + right * 1)).substr(-4);


    this.domElem.style.cursor = MOUSESTATES[this._finger];
}

p._onMouseDown = function (e) {

    e.stopPropagation();
    e.preventDefault();

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

    window.removeEventListener('mouseup', this._onMouseUp);
    window.removeEventListener('mouseleave', this._onMouseUp);
    window.removeEventListener('mousemove', this._onDrag);
    
    this._isHandle = false;
}

module.exports = Bund;
