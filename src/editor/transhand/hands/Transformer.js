'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var _ = require('lodash');

var MOUSESTATES = {
    'move': 'move',
    'rotate': '-webkit-grab',
    'origin': 'crosshair',
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
console.log('activate')
    if (this._isActivated) return;
    this._isActivated = true;
console.log('>activate')

    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mousedown', this._onMouseDown);
};

p.deactivate = function () {

console.log('deactivate')
    if (!this._isActivated) return;
    this._isActivated = false;
console.log('>deactivate')
    
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

    var base = _.clone(this._base), 
        params = this._params,
        p = this._points,
        po = this._pOrigin;

    base.x += params.tx;
    base.y += params.ty;

    po.x = base.x + (base.w * params.ox);
    po.y = base.y + (base.h * params.oy);

    var tox = base.x + params.ox * base.w,
        toy = base.y + params.oy * base.h;

    t(p[0], base.x, base.y);
    t(p[1], base.x + base.w, base.y);
    t(p[2], base.x + base.w, base.y + base.h);
    t(p[3], base.x, base.y + base.h);

    function t(p, x, y) {

        var dx = (x - tox) * params.sx,
            dy = (y - toy) * params.sy,
            d = Math.sqrt(dx*dx + dy*dy),
            rad = Math.atan2(dy, dx) + params.rz;

        p.x = tox + (d * Math.cos(rad));
        p.y = toy + (d * Math.sin(rad));
    }
};

p._renderHandler = function () {

    var p = this._points,
        po = this._pOrigin,
        c = this.domElem,
        or = this._originRadius,
        ctx = c.getContext('2d'),
        margin = 7,
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

    if (this._cursorFunc) {
        this._setCursor(this._cursorFunc(e.clientX, e.clientY));
    }
};

p._onDrag = function (e) {

    var params = this._params,
        base = this._base,
        pOrigin = this._pOrigin,
        md = this._mdPos,
        finger = this._finger,
        pMouse = {x: e.clientX, y: e.clientY},
        dx = pMouse.x - md.pMouse.x,
        dy = pMouse.y - md.pMouse.y,
        alt = e.altKey,
        shift = e.shiftKey,
        mr, dr,
        change = {};

    if (finger === 'origin') {
        
        setOrigin();
    }
        
    if (finger === 'move') {

        setTransform();
    }
    
    if (finger.charAt(0) === '1') {

        setScale(-Math.PI/2, 'sy', -1);
    }

    if (finger.charAt(1) === '1') {

        setScale(0, 'sx', 1);
    }

    if (finger.charAt(2) === '1') {

        setScale(Math.PI/2, 'sy', 1);
    }

    if (finger.charAt(3) === '1') {

        setScale(Math.PI, 'sx', -1);
    }

    if (finger === 'rotate') {

        setRotation();
    }

    if (shift && 'sx' in change && 'sy' in change) {

        fixProportion();
    }


    this.emit('change', change, 'transform');





    function setScale(r, sN, way) {

        var rad = r + md.params.rz,
            mdDist = distToPointInAngle(md.pOrigin, md.pMouse, rad),
            dragDist = distToPointInAngle(md.pOrigin, pMouse, rad),
            scale = (dragDist / mdDist) * md.params[sN];

        if (alt) {
            var es = (scale - md.params[sN]) / 2,
                tN = 't' + sN.charAt(1),
                dN = sN.charAt(1) === 'x' ? 'w' : 'h';

            scale -= es;
            change[tN] = params[tN] = md.params[tN] + base[dN] * es/2 * way;            
        }

        change[sN] = params[sN] = scale;
    }

    function fixProportion() {

        var mx = pMouse.x - pOrigin.x,
            my = pMouse.y - pOrigin.y,
            mr = Math.abs(radDiff(params.rz, Math.atan2(my, mx))),
            isVertical = mr > Math.PI/4 && mr < Math.PI/4 * 3,
            spx = params.sx / md.params.sx,
            spy = params.sy / md.params.sy;

        spx *= spx < 0 ? -1 : 1;
        spy *= spy < 0 ? -1 : 1;
        
        var sp = isVertical ? spy : spx;

        change.sx = params.sx = md.params.sx * sp;
        change.sy = params.sy = md.params.sy * sp;
    }

    function setRotation() {

        var mdx = md.pMouse.x - pOrigin.x,
            mdy = md.pMouse.y - pOrigin.y,
            mdr = Math.atan2(mdy, mdx),
            mx = pMouse.x - pOrigin.x,
            my = pMouse.y - pOrigin.y,
            mr = Math.atan2(my, mx),
            r = mr - mdr;

        if (shift) {

            r = Math.floor(r / (Math.PI / 12)) * (Math.PI / 12);
        }

        change.rz = params.rz = md.params.rz + r;
    }

    function setTransform() {

        if (shift) {
            
            if (Math.abs(dx) > Math.abs(dy)) {

                change.tx = params.tx = md.params.tx + dx;
                change.ty = params.ty = md.params.ty;
            }
            else {
                change.tx = params.tx = md.params.tx;
                change.ty = params.ty = md.params.ty + dy;
            }
        }
        else {
            change.tx = params.tx = md.params.tx + dx;
            change.ty = params.ty = md.params.ty + dy;
        }
    }

    function setOrigin() {

        var mx = pMouse.x - md.pOrigin.x,
            my = pMouse.y - md.pOrigin.y,
            dist = Math.sqrt(mx*mx + my*my),
            r = Math.atan2(my, mx) - params.rz,
            x = (Math.cos(r) * dist) / params.sx,
            y = (Math.sin(r) * dist) / params.sy;

        change.ox = params.ox = md.params.ox + (x / base.w);
        change.oy = params.oy = md.params.oy + (y / base.h);
        change.tx = params.tx = md.params.tx + (mx - x);
        change.ty = params.ty = md.params.ty + (my - y);
    }
};

p._setFinger = function (e) {

    var base = this._base,
        params = this._params,
        p = this._points,
        po = this._pOrigin,
        diff = 3,
        rDiff = 16,
        mx = e.clientX,
        my = e.clientY,
        mp = {x: mx, y: my},
        dox = po.x - mx,
        doy = po.y - my,
        dOrigin = Math.sqrt(dox*dox + doy*doy),
        dTop = distToSegment(mp, p[0], p[1]),
        dLeft = distToSegment(mp, p[1], p[2]),
        dBottom = distToSegment(mp, p[2], p[3]),
        dRight = distToSegment(mp, p[3], p[0]),
        top = dTop < diff,
        left = dLeft < diff,
        bottom = dBottom < diff,
        right = dRight < diff,
        inside = isInside(mp, p),
        cursorScale;

    if (base.w * params.sx < diff * 2 && inside) {
        
        left = false;
        right = false;
    }

    if (base.h * params.sy < diff * 2 && inside) {
    
        top = false;
        bottom = false;
    }
    
    if (dOrigin < this._originRadius) {

        this._finger = 'origin';
    }
    else if (top || right || bottom || left) {

        this._finger = ('000' + (top * 1000 + left * 100 + bottom * 10 + right * 1)).substr(-4);
        cursorScale = true;
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


    if (this._finger === 'rotate') {

        this._cursorFunc = this._getRotateCursor;
    }
    else if (cursorScale) {

        this._cursorFunc = this._getScaleCursor;
    }
    else {
        this._cursorFunc = undefined
        
        if (this._finger) {

            this.domElem.style.pointerEvents = 'auto';
            this._setCursor(MOUSESTATES[this._finger]);
        }
        else {
            this.domElem.style.pointerEvents = 'none';
            this._setCursor('auto');
        }
    }
};

p._setCursor = function (cursor) {

    this.domElem.style.cursor = cursor;
    document.querySelector("html").style.cursor = cursor;//hack! TODO
} 

p._onMouseDown = function (e) {

    if (!this._finger) {
        return;
    }

    e.stopPropagation();
    e.preventDefault();

    this._isHandle = true;

    this._mdPos = {
        pMouse: {x: e.clientX, y: e.clientY},
        params: _.cloneDeep(this._params),
        points: _.cloneDeep(this._points),
        pOrigin: _.cloneDeep(this._pOrigin)
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



p._getRotateCursor = function (mx, my) {

    var r = Math.atan2(my - this._pOrigin.y, mx - this._pOrigin.x) / Math.PI * 180;
    return 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" ><path transform="rotate('+r+', 16, 16)" d="M18.907 3.238l-7.54-2.104s8.35 3.9 8.428 15.367c.08 11.794-7.807 14.49-7.807 14.49l7.363-1.725" stroke="#000" stroke-width="2.054" fill="none"/></svg>\') 16 16, auto';
};

p._getScaleCursor = (function () {

    var FINGERS = ['0100', '0110', '0010', '0011', '0001', '1001', '1000', '1100'];

    return function (mx, my) {

        var rBase = FINGERS.indexOf(this._finger) * 45;

        var r = rBase + (this._params.rz / Math.PI * 180);
        return 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path transform="rotate('+r+', 16, 16)" d="M22.406 12.552l5.88 4.18H3.677l5.728 4.36" stroke="#000" stroke-width="2.254" fill="none"/></svg>\') 16 16, auto';
    };
}());


module.exports = Transformer;




//utils/////////////////////////////////////////////////////

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

function distToPointInAngle(p0, p1, rad) {

    var dx = p1.x - p0.x,
        dy = p1.y - p0.y,
        d = Math.sqrt(dx*dx + dy*dy),
        mRad = Math.atan2(dy, dx);

    rad = mRad - rad;

    // console.log('dx', dx, 'dy', dy, 'd', d, 'mRad', mRad, 'rad', rad, 'return', Math.cos(rad) * d)

    return Math.cos(rad) * d;

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
