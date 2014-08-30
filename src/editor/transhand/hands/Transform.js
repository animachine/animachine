
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var _ = require('lodash');

MOUSESTATES = {
    'move': 'move',
    'rotate': 'grab',
    'origin': 'hairline',
    '1000': 'ns-resize',
    '1100': 'nesw-resize',
    '0100': 'ew-resize',
    '0110': 'nwse-resize',
    '0010': 'ns-resize',
    '0011': 'nesw-resize',
    '0001': 'ew-resize',
    '1001': 'nwse-resize',
}


function Transform() {

    EventEmitter.call(this);

    this._params = {
        tx: 0, ty: 0,
        sx: 1, sy: 1,
        rz: 0,
        ox: 50, oy: 50
    };

    this._base = {x: 0, y: 0, w: 0, h: 0};

    this._originRadius = 6;

    this._onDrag = this._onDrag.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
}

inherits(Transform, EventEmitter);

var p = Transform.prototype;

p.setup = function (opt) {

    if (!this.domElem) {
        this.generateGraphics();
    }

    _.extend(this._params, opt.params);
    _.extend(this._base, opt.base);
    this._refreshPoints();
    this._renderHandler();
};

p.generateGraphics = function () {

    this.domElem = document.createElement('canvas');
    this.domElem.style.position = 'fixed';
    this.domElem.style.pointerEvents = 'none';
    this.domElem.style.border = '1px solid red';

    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mousedown', this._onMouseDown);
};

p._refreshPoints = function () {

    var base = this._base, 
        params = this._params,
        p = this._points,
        po = this._pOrigin;

    po.x = base.x + base.w * params.ox;
    po.y = base.y + base.h * params.oy;

    var tox = po.x * base.w,
        toy = po.y * base.h;

    t(p[0], base.x, base.y)
    t(p[1], base.x + base.w, base.y)
    t(p[2], base.x + base.w, base.y + base.h)
    t(p[3], base.x, base.y + base.h)

    function t(p, x, y) {

        var dx = x - tox,
            dy = y - toy;

        p.x = tox + (dx * params.sx * Math.cos(params.rz));
        p.y = toy + (dy * params.sy * Math.sin(params.rz));
    }
}

p._renderHandler = function () {

    var base = this._base, 
        params = this._params,
        p = this._points,
        po = this._pOrigin,
        c = this.domElem,
        or = this._originRadius,
        ctx = c.getContext('2d'),
        minX = Math.min(p[0].x, p[1].x, p[2].x, p[3].x),
        maxX = Math.max(p[0].x, p[1].x, p[2].x, p[3].x),
        minY = Math.min(p[0].y, p[1].y, p[2].y, p[3].y),
        maxY = Math.max(p[0].y, p[1].y, p[2].y, p[3].y);

    c.style.left = minX + 'px';
    c.style.top = minY + 'px';
    c.width = maxX - minX;
    c.height = maxY - minY;

    ctx.beginPath();
    ctx.moveTo(p[0].x, p[0].y);
    ctx.lineTo(p[1].x, p[1].y);
    ctx.lineTo(p[2].x, p[2].y);
    ctx.lineTo(p[3].x, p[3].y);
    ctx.closePath();

    ctx.moveTo(po.x - or, po.y);
    ctx.lineTo(po.x + or, po.y);
    ctx.moveTo(po.x, po.y - or);
    ctx.lineTo(po.x, po.y + or);
    

    ctx.strokeStye = '#4f2';
    ctx.lineWidth = 1;
    ctx.stroke();
};


p._onMouseMove = function (e) {

    if (!this._isHandle) {

        this._setFinger(e);
    }
}

p._onDrag = function (e) {

    var p = this._params,
        sp = this._mdPos.params,//savedParams
        finger = this._finger,
        mx = e.pageX,
        my = e.pageY,
        mr,
        dx = mx - this._mdPos.mx,
        dy = my - this._mdPos.my,
        dr, 
        mdsd, sd,//sideDistance
        change = {};

    if (finger === 'origin') {
        change.ox = p.ox = sp.ox + dx;
        change.oy = p.oy = sp.oy + dy;
    }
        
    if (finger === 'move') {
        change.tx = p.tx = sp.tx + dx);
        change.ty = p.ty = sp.ty + dy);
    }
    //TODO
    // if (finger.charAt(0) === '1') {
    //     mdsd = sb.h * sp.sy * p.oy;
    //     sd = base.h * sp.sy * p.oy;
    //     change.y = p.y = ~~(sp.y + dy);
    //     change.h = p.h = Math.max(0, ~~(sp.h - dy));
    // }

    // if (finger.charAt(1) === '1') {
    //     change.w = p.w = Math.max(0, ~~(sp.w + dx));
    // }

    // if (finger.charAt(2) === '1') {
    //     change.h = p.h = Math.max(0, ~~(sp.h + dy));
    // }

    // if (finger.charAt(3) === '1') {
    //     change.x = p.x = ~~(sp.x + dx);
    //     change.w = p.w = Math.max(0, ~~(sp.w - dx));
    // }
    //////
    if (finger === 'rotate') {

        mr = Math.atan2(dy - p.oy, dx - p.ox);
        dr = radDiff(sp.rz, mr)
        change.rz = p.rz = sp.rz + dr;
    }

    this.emit('change', change);
}

p._setFinger = function (e) {

    var params = this._params,
        p = this._points,
        po = this._pOrigin,
        diff = 3,
        rDiff = 7,
        mx = e.pageX,
        my = e.pageY,
        mp = {x: mx, y: my},
        dTop = distToSegment(mp, p[0], p[1]),
        dLeft = distToSegment(mp, p[1], p[2]),
        dBottom = distToSegment(mp, p[2], p[3]),
        dRight = distToSegment(mp, p[3], p[0]),
        dOrigin = dist2(mp, po),
        top = dTop < diff,
        left = dLeft < diff,
        bottom = dBottom < diff,
        right = dRight < diff,
        inside = isInside(mp, p);

    if (base.width * params.sx < diff * 2 && inside) {
        
        left = false;
        right = false;
    }

    if (base.height * params.sy < diff * 2 && inside) {
    
        top = false;
        bottom = false;
    }
    
    if (dOrigin < this._originRadius) {

        this._finger = 'origin';
    }
    else if (top || right || bottom || left) {

        this._finger = ('000' + (top * 1000 + left * 100 + bottom * 10 + right * 1)).substr(-4);
    }
    else if (inside) {

        this._finger = 'move';
    }
    else if (dTop < rDiff || dRight < rDiff || dBottom < rDiff || dLeft < rDiff) {

        this._finger = 'rotate';
    }
    else {
        this._finger = false
    }

    if (this._finger) {

        this.domElem.style.pointerEvents = 'auto';
        this.domElem.style.cursor = MOUSESTATES[this._finger];
    }
    else {
        this.domElem.style.pointerEvents = 'none';
        this.domElem.style.cursor = 'auto';
    }
}

p._onMouseDown = function (e) {

    if (!this._finger) {

        return;
    }

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

function radDiff(r0, r1) {

    r0 %= Math.PI;
    r1 %= Math.PI;
    r0 += Math.PI;
    r1 += Math.PI;

    return r1 - r0;
}

function sqr(x) { 
    return x * x 
}

function dist2(v, w) { 
    return sqr(v.x - w.x) + sqr(v.y - w.y) 
}

function distToSegmentSquared(p, v, w) {
  var l2 = dist2(v, w);
    
  if (l2 == 0) return dist2(p, v);
    
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    
  if (t < 0) return dist2(p, v);
  if (t > 1) return dist2(p, w);
    
  return dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
}

function distToSegment(p, v, w) { 
    return Math.sqrt(distToSegmentSquared(p, v, w));
}

var epsEqu = function () {
    var EPSILON = Math.pow(2, -53);
    return function epsEqu(x, y) {
        return Math.abs(x - y) < EPSILON;
    };
}();

function isInside(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    
    var x = point.x, y = point[1];
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i].x, yi = vs[i][1];
        var xj = vs[j].x, yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};

module.exports = Transform;
