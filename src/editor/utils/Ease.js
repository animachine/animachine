'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var bezierEasing = require('bezier-easing');
var defineCompactProperty = require('./defineCompactProperty');
var dialogEaseOptions = require('./dialogEaseOptions');

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

            //currently the only supproted type is bezier
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
            this._easer = new GreenSockGlobals.Ease(bezierEasing(p[0], p[1], p[2], p[3]));

            this.emit('change');
        },
        get: function () {

            return this._points;
        }
    }
});

defineCompactProperty(p, {name: 'roughEase', type: 'boolean', startValue: false});
defineCompactProperty(p, {name: 'roughStrength', type: 'float', startValue: 1});
defineCompactProperty(p, {name: 'roughPoints', type: 'int', startValue: 20});
defineCompactProperty(p, {name: 'roughClamp', type: 'boolean', startValue: false});
defineCompactProperty(p, {name: 'roughRandomise', type: 'boolean', startValue: true});
defineCompactProperty(p, {name: 'roughTaper', type: 'string', startValue: 'none'});









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

    return this._easer.getRatio(p);
};

p.getEaser = function () {

    return this._easer;
}

p.clone = function () {

    return new Ease(this);
};


p.showOptionsDialog = function () {

    dialogEaseOptions.show({
        ease: this,
        onChangeRoughEase: function (v) {this.roughEase = v}.bind(this),
        onChangeRoughStrength: function (v) {this.roughStrength = v}.bind(this),
        onChangeRoughPoints: function (v) {this.roughPoints = v}.bind(this),
        onChangeRoughClamp: function (v) {this.roughClamp = v}.bind(this),
        onChangeRoughRandomise: function (v) {this.roughRandomise = v}.bind(this),
        onChangeRoughTaper: function (v) {this.roughTaper = v}.bind(this),
    });
};