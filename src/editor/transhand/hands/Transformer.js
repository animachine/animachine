'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var _ = require('lodash');

var MOUSESTATES = {
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
};


function Transformer() {

    EventEmitter.call(this);

    this._params = {
        tx: 0, ty: 0,
        sx: 1, sy: 1,
        rz: 0,
        ox: 0.5, oy: 0.5
    };
    this._base = {x: 0, y: 0, w: 0, h: 0};
    this._points = [{}, {}, {}, {}];
    this._pOrigin = {};
    this._originRadius = 6;

    this._onDrag = this._onDrag.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
}

Transformer.id = 'transformer';

inherits(Transformer, EventEmitter);

var p = Transformer.prototype;

p.setup = function (opt) {

    if (!this.domElem) {
        this.createGraphics();
    }

    _.extend(this._params, opt.params);
    _.extend(this._base, opt.base);
    this._refreshPoints();
    this._renderHandler();
};

p.activate = function () {

    if (this._isActivated) return;
    this._isActivated = true;

    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mousedown', this._onMouseDown);
};

p.deactivate = function () {

    if (!this._isActivated) return;
    this._isActivated = false;
    
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mousedown', this._onMouseDown);
};

p.createGraphics = function () {

    this.domElem = document.createElement('canvas');
    this.domElem.style.position = 'fixed';
    this.domElem.style.pointerEvents = 'none';
    // this.domElem.style.border = '1px solid red';
};

p._refreshPoints = function () {

    var base = this._base, 
        params = this._params,
        p = this._points,
        po = this._pOrigin;

    po.x = base.x + base.w * params.ox;
    po.y = base.y + base.h * params.oy;

    var tox = base.x + params.ox * base.w,
        toy = base.y + params.oy * base.h;

    t(p[0], base.x, base.y);
    t(p[1], base.x + base.w, base.y);
    t(p[2], base.x + base.w, base.y + base.h);
    t(p[3], base.x, base.y + base.h);

    function t(p, x, y) {

        var dx = x - tox,
            dy = y - toy,
            d = Math.sqrt(dx*dx + dy*dy),
            rad = Math.atan2(dy, dx) + params.rz,
            cos = Math.cos(rad),
            sin = Math.sin(rad);

        p.x = tox + (d * params.sx * Math.cos(rad));
        p.y = toy + (d * params.sy * Math.sin(rad));
    }
};

p._renderHandler = function () {

    var p = this._points,
        po = this._pOrigin,
        c = this.domElem,
        or = this._originRadius,
        ctx = c.getContext('2d'),
        margin = 2,
        minX = Math.min(p[0].x, p[1].x, p[2].x, p[3].x),
        maxX = Math.max(p[0].x, p[1].x, p[2].x, p[3].x),
        minY = Math.min(p[0].y, p[1].y, p[2].y, p[3].y),
        maxY = Math.max(p[0].y, p[1].y, p[2].y, p[3].y);

    c.style.left = (minX - margin) + 'px';
    c.style.top = (minY - margin) + 'px';
    c.width = (maxX - minX) + (margin * 2);
    c.height = (maxY - minY) + (margin * 2);

    ctx.save();
    ctx.translate(margin - minX, margin - minY);
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
    

    ctx.strokeStyle = '#4f2';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
};


p._onMouseMove = function (e) {

    if (!this._isHandle) {

        this._setFinger(e);
    }
};

p._onDrag = function (e) {

    var params = this._params,
        md = this._mdPos,
        finger = this._finger,
        pMouse = {x: e.pageX, y: e.pageY},
        dx = pMouse.x - md.pMouse.x,
        dy = pMouse.y - md.pMouse.y,
        mr, dr,
        dragDist, mdDist, dragDistOrigin, mdDistOrigin,
        change = {};

    if (finger === 'origin') {
        // change.ox = p.ox = sp.ox + (dx / this._base.w);
        // change.oy = p.oy = sp.oy + (dy / this._base.h);
    }
        
    if (finger === 'move') {
        change.tx = params.tx = md.params.tx + dx;
        change.ty = params.ty = md.params.ty + dy;
    }
    //TODO
    if (finger.charAt(0) === '1') {


        mdDist = distToLine(md.pMouse, md.points[0], md.points[1]);
        dragDist = distToLine(pMouse, md.points[0], md.points[1]);
        mdDistOrigin = dist2(md.pMouse, this._pOrigin);
        dragDistOrigin = dist2(pMouse, this._pOrigin);

        if (dragDistOrigin < mdDistOrigin) {
            dragDist *= -1;
        }

        change.sy = params.sy = (mdDist / (mdDist + dragDist)) * md.params.sy;
    }

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

        mr = Math.atan2(dy - params.oy, dx - params.ox);
        dr = radDiff(sp.rz, mr);
        change.rz = params.rz = sp.rz + dr;
    }
console.log(change);
    this.emit('change', change);
};

p._setFinger = function (e) {

    var base = this._base,
        params = this._params,
        p = this._points,
        po = this._pOrigin,
        diff = 3,
        rDiff = 9,
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
        this._finger = false;
    }

    if (this._finger) {

        this.domElem.style.pointerEvents = 'auto';
        this.domElem.style.cursor = MOUSESTATES[this._finger];
    }
    else {
        this.domElem.style.pointerEvents = 'none';
        this.domElem.style.cursor = 'auto';
    }

    console.log('finger', this._finger)
};

p._onMouseDown = function (e) {

    if (!this._finger) {
        return;
    }

    e.stopPropagation();
    e.preventDefault();

    this._isHandle = true;

    this._mdPos = {
        pMouse: {x: e.pageX, y: e.pageY},
        params: _.cloneDeep(this._params),
        points: _.cloneDeep(this._points)
    };

    window.addEventListener('mouseup', this._onMouseUp);
    window.addEventListener('mouseup', this._onMouseUp);
    window.addEventListener('mousemove', this._onDrag);
};

p._onMouseUp = function () {

    window.removeEventListener('mouseup', this._onMouseUp);
    window.removeEventListener('mouseleave', this._onMouseUp);
    window.removeEventListener('mousemove', this._onDrag);
    
    this._isHandle = false;
};

function radDiff(r0, r1) {

    r0 %= Math.PI;
    r1 %= Math.PI;
    r0 += Math.PI;
    r1 += Math.PI;

    return r1 - r0;
}

function sqr(x) { 
    return x * x;
}

function dist2(v, w) { 
    return sqr(v.x - w.x) + sqr(v.y - w.y);
}

function distToSegmentSquared(p, v, w) {
  var l2 = dist2(v, w);
    
  if (l2 === 0) return dist2(p, v);
    
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    
  if (t < 0) return dist2(p, v);
  if (t > 1) return dist2(p, w);
    
  return dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
}

function distToSegment(p, v, w) { 
    return Math.sqrt(distToSegmentSquared(p, v, w));
}

function distToLine(p, v, w) {
    //TODO
    return distToSegment(p, v, w);
}

function isInside(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    
    var x = point.x, y = point.y;
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i].x, yi = vs[i].y;
        var xj = vs[j].x, yj = vs[j].y;
        
        var intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
}

module.exports = Transformer;
