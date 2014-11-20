'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var BezierEasing = require('bezier-easing');

function Ease(opt) {

    EventEmitter.call(this);
    
    this._type =  'bezier';
    this._points = []
    this.points = [0, 0, 1, 1];
    this._easer;

    if (opt) {
        this.useSave(opt);
    }
}

inherits(Ease, EventEmitter);
var p = Ease.prototype;
module.exports = Ease;

Object.defineProperties(p, {

    type: {
        set: function (v) {

            if (this._type === v) return;

            this._type = parseInt(v);
        },
        get: function () {

            return this._type;
        },
    },
    points: {
        set: function (v) {

            var p = this._points;

            if (p.length === v.length && 
                p.every(function (p, idx) {return p === v[idx];}))
            {
                return;
            }

            p.length = 0;
            p.push.apply(this._points, v);
            this._easer = new BezierEasing(p[0], p[1], p[2], p[3]);
        },
        get: function () {

            return this._points;
        }
    }
});









p.getSave = function () {

    return {
        type: this.type,
        points: this.points,
    };
};

p.useSave = function (save) {

    if (!save) return;

    if ('type' in save) this.type = save.type;
    if ('points' in save) this.points = save.points;
};

p.getRatio = function (p) {

    return this._easer(p);
};

p.clone = function () {

    return new Ease(this);
}
